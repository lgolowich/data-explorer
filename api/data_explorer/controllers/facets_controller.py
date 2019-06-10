import pprint

from collections import OrderedDict
from elasticsearch import Elasticsearch
from elasticsearch_dsl import HistogramFacet
from flask import current_app

from data_explorer.models.facet import Facet
from data_explorer.models.facet_value import FacetValue
from data_explorer.models.time_series_facet_value import TimeSeriesFacetValue
from data_explorer.models.facets_response import FacetsResponse
from data_explorer.util import elasticsearch_util
from data_explorer.util.dataset_faceted_search import DatasetFacetedSearch


def _get_bucket_interval(facet):
    if isinstance(facet, HistogramFacet):
        return facet._params['interval']
    elif hasattr(facet, '_inner'):
        return _get_bucket_interval(facet._inner)


def _process_extra_facets(extra_facets):
    if not extra_facets:
        current_app.config['EXTRA_FACET_INFO'] = {}
        return

    es = Elasticsearch(current_app.config['ELASTICSEARCH_URL'])
    facets = OrderedDict()
    mapping = es.indices.get_mapping(index=current_app.config['INDEX_NAME'])

    for es_base_field_name in extra_facets:
        if not es_base_field_name:
            continue

        if elasticsearch_util.is_time_series(es, es_base_field_name):
            is_time_series = True
            time_series_vals = elasticsearch_util.get_time_series_vals(es, es_base_field_name, mapping)
            es_field_names = [es_base_field_name + '.' + tsv
                              for tsv in time_series_vals]
        else:
            is_time_series = False
            es_field_names = [es_base_field_name]

        for es_field_name in es_field_names:
            field_type = elasticsearch_util.get_field_type(
                es, es_field_name)
            ui_facet_name = es_base_field_name.split('.')[-1]
            if es_field_name.startswith('samples.'):
                ui_facet_name = '%s (samples)' % ui_facet_name

            facets[es_field_name] = {
                'ui_facet_name': ui_facet_name,
                'type': field_type,
                'is_time_series': is_time_series
            }
            facets[es_field_name][
                'description'] = elasticsearch_util.get_field_description(
                    es, es_base_field_name)
            facets[es_field_name][
                'es_facet'] = elasticsearch_util.get_elasticsearch_facet(
                    es, es_field_name, field_type)

    # Map from Elasticsearch field name to dict with ui facet name,
    # Elasticsearch field type, optional UI facet description and Elasticsearch
    # facet. This map is for extra facets added from the field search dropdown
    # on the UI.
    # This must be stored separately from FACET_INFO. If this were added to
    # FACET_INFO, then if user deletes extra facets chip, we wouldn't know which
    # facet to remove from FACET_INFO.
    current_app.config['EXTRA_FACET_INFO'] = facets


def facets_get(filter=None, extraFacets=None):  # noqa: E501
    """facets_get
    Returns facets. # noqa: E501
    :param filter: filter represents selected facet values. Elasticsearch query
    will be run only over selected facet values. filter is an array of strings,
    where each string has the format \&quot;facetName&#x3D;facetValue\&quot;.
    Example url /facets?filter=project_id.dataset_id.table_name.Gender=female,project_id.dataset_id.table_name.Region=northwest,project_id.dataset_id.table_name.Region=southwest
    :type filter: List[str]
    :param extraFacets: extra_facets represents the additional facets selected by the user from the UI.
    :type extraFacets: List[str]
    :rtype: FacetsResponse
    """
    _process_extra_facets(extraFacets)
    combined_facets = OrderedDict(current_app.config['EXTRA_FACET_INFO'].items(
    ) + current_app.config['FACET_INFO'].items())
    search = DatasetFacetedSearch(
        elasticsearch_util.get_facet_value_dict(filter, combined_facets),
        combined_facets)
    # Uncomment to print Elasticsearch request python object
    # current_app.logger.info(
    #     'Elasticsearch request: %s' % pprint.pformat(search.build_search().to_dict()))
    es_response = search.execute()
    es_response_facets = es_response.facets.to_dict()
    # Uncomment to print Elasticsearch response python object
    #current_app.logger.info(
    #    'Elasticsearch response: %s' % pprint.pformat(es_response_facets))

    facets = []

    ts_field_name = ""
    ts_ui_name = ""
    ts_description = ""
    ts_field_type = ""
    ts_values = []

    for es_field_name, facet_info in combined_facets.iteritems():
        if ts_field_name and (
            (not facet_info.get('is_time_series'))
            or '.'.join(es_field_name.split('.')[:-1]) != ts_field_name):
            # No more values in this time series, so add element to facets
            facets.append(
                Facet(
                    name=ts_ui_name,
                    description=ts_description,
                    es_field_name=ts_field_name,
                    es_field_type=ts_field_type,
                    values=[],
                    time_series_values=ts_values
                )
            )
            ts_field_name = ""
            ts_values = []

        values = []
        facet = facet_info.get('es_facet')
        for value_name, count, _ in es_response_facets[es_field_name]:
            if elasticsearch_util.is_histogram_facet(facet):
                # For histograms, Elasticsearch returns:
                #   name 10: count 15     (There are 15 people aged 10-19)
                #   name 20: count 33     (There are 33 people aged 20-29)
                # Convert "10" -> "10-19".
                value_name = elasticsearch_util.number_to_range(
                    value_name, _get_bucket_interval(facet))
            else:
                # elasticsearch-dsl returns boolean field keys as 0/1. Use the
                # field's 'type' to convert back to boolean, if necessary.
                if facet_info['type'] == 'boolean':
                    value_name = bool(value_name)
            values.append(FacetValue(name=value_name, count=count))

        if facet_info.get('is_time_series'):
            ts_field_name = '.'.join(es_field_name.split('.')[:-1])
            ts_ui_name = facet_info.get('ui_facet_name')
            ts_description = facet_info.get('description')
            ts_field_type = facet_info.get('type')
            ts_values.append(
                TimeSeriesFacetValue(
                    time=int(es_field_name.split('.')[-1]),
                    values=values
                )
            )
        else:
            facets.append(
                Facet(
                    name=facet_info.get('ui_facet_name'),
                    description=facet_info.get('description'),
                    es_field_name=es_field_name,
                    es_field_type=facet_info.get('type'),
                    values=values,
                    time_series_values=[]
                )
            )

    return FacetsResponse(
        facets=facets, count=es_response._faceted_search.count())
