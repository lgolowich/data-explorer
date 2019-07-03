import pprint

from collections import OrderedDict
from elasticsearch import Elasticsearch
from elasticsearch_dsl import HistogramFacet
from flask import current_app

from data_explorer.models.facet import Facet
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
            time_series_vals = elasticsearch_util.get_time_series_vals(
                es, es_base_field_name, mapping)
            es_field_names = [
                es_base_field_name + '.' + tsv for tsv in time_series_vals
            ]
        else:
            is_time_series = False
            time_series_vals = []
            es_field_names = [es_base_field_name]

        interval = -1
        for es_field_name in es_field_names:
            field_type = elasticsearch_util.get_field_type(es, es_field_name)
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

            if field_type != 'text' and field_type != 'boolean' and interval < 0:
                interval = elasticsearch_util.get_bucket_interval(
                    es, es_base_field_name, time_series_vals)
            facets[es_field_name][
                'es_facet'] = elasticsearch_util.get_elasticsearch_facet(
                    es, es_field_name, field_type, interval)

    # Map from Elasticsearch field name to dict with ui facet name,
    # Elasticsearch field type, optional UI facet description and Elasticsearch
    # facet. This map is for extra facets added from the field search dropdown
    # on the UI.
    # This must be stored separately from FACET_INFO. If this were added to
    # FACET_INFO, then if user deletes extra facets chip, we wouldn't know which
    # facet to remove from FACET_INFO.
    current_app.config['EXTRA_FACET_INFO'] = facets


def _get_time_series_params(ts_value_names, ts_values):
    srt = sorted([(ts_value_names[i], i) for i in ts_value_names])
    ts_value_names_list = [interval for value, interval in srt]
    for i in range(len(srt)):
        value, interval = srt[i]
        ts_value_names[interval] = i
    ts_value_counts_array = []
    for entry in ts_values:
        value_names = entry[0]
        value_counts = entry[1]
        entry_array = [0 for name in ts_value_names_list]
        for i in range(len(value_names)):
            entry_array[ts_value_names[value_names[i]]] = value_counts[i]
        ts_value_counts_array.append(entry_array)
    return ts_value_names_list, ts_value_counts_array


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
    ts_time_names = []
    ts_value_names = {}
    ts_values = []

    for es_field_name, facet_info in combined_facets.iteritems():
        if ts_field_name and (
            (not facet_info.get('is_time_series'))
                or '.'.join(es_field_name.split('.')[:-1]) != ts_field_name):
            # No more values in this time series, so add element to facets
            value_names, time_series_value_counts = _get_time_series_params(
                ts_value_names, ts_values)
            facets.append(
                Facet(
                    name=ts_ui_name,
                    description=ts_description,
                    es_field_name=ts_field_name,
                    es_field_type=ts_field_type,
                    value_names=value_names,
                    value_counts=[],
                    time_names=ts_time_names,
                    time_series_value_counts=time_series_value_counts,
                    is_time_series=1))
            ts_field_name = ""
            ts_time_names = []
            ts_value_names = {}
            ts_values = []

        facet = facet_info.get('es_facet')
        value_names = []
        value_counts = []
        for value_name, count, _ in es_response_facets[es_field_name]:
            if elasticsearch_util.is_histogram_facet(facet):
                # For histograms, Elasticsearch returns:
                #   name 10: count 15     (There are 15 people aged 10-19)
                #   name 20: count 33     (There are 33 people aged 20-29)
                # Convert "10" -> "10-19".
                interval_name = elasticsearch_util.number_to_range(
                    value_name, _get_bucket_interval(facet))
            else:
                # elasticsearch-dsl returns boolean field keys as 0/1. Use the
                # field's 'type' to convert back to boolean, if necessary.
                if facet_info['type'] == 'boolean':
                    interval_name = bool(value_name)
                else:
                    interval_name = value_name
            value_names.append(interval_name)
            value_counts.append(count)

            # Update ts_value_names[interval_name] to store ordering
            # information for the value names (by name if the name is
            # numeric, or by count if it is text/boolean).
            if facet_info.get('is_time_series'):
                if facet_info.get('type') == 'text' or facet_info.get(
                        'type') == 'boolean':
                    if interval_name in ts_value_names:
                        # Subtract to show highest count first.
                        ts_value_names[interval_name] -= count
                    else:
                        ts_value_names[interval_name] = -count
                else:
                    ts_value_names[interval_name] = value_name

        if facet_info.get('is_time_series'):
            ts_field_name = '.'.join(es_field_name.split('.')[:-1])
            ts_ui_name = facet_info.get('ui_facet_name')
            ts_description = facet_info.get('description')
            ts_field_type = facet_info.get('type')
            if not all(count == 0 for count in value_counts):
                ts_time_names.append(int(es_field_name.split('.')[-1]))
                ts_values.append([value_names, value_counts])
        else:
            facets.append(
                Facet(
                    name=facet_info.get('ui_facet_name'),
                    description=facet_info.get('description'),
                    es_field_name=es_field_name,
                    es_field_type=facet_info.get('type'),
                    value_names=value_names,
                    value_counts=value_counts,
                    time_names=[],
                    time_series_value_counts=[],
                    is_time_series=0))

    if ts_field_name:
        # Finish up last time series facet if necessary
        value_names, time_series_value_counts = _get_time_series_params(
            ts_value_names, ts_values)
        facets.append(
            Facet(
                name=ts_ui_name,
                description=ts_description,
                es_field_name=ts_field_name,
                es_field_type=ts_field_type,
                value_names=value_names,
                value_counts=[],
                time_names=ts_time_names,
                time_series_value_counts=time_series_value_counts,
                is_time_series=1))
        ts_field_name = ""
        ts_time_names = []
        ts_value_names = {}
        ts_values = []

    return FacetsResponse(
        facets=facets, count=es_response._faceted_search.count())
