import React from "react";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import { withStyles } from "@material-ui/core/styles";

import HistogramFacet from "components/facets/HistogramFacet";
import TimeSeriesFacet from "components/facets/TimeSeriesFacet";

const styles = {
  root: {
    // Needed to make left box shadow show up for all left-most tiles
    overflow: "unset"
  },
  tile: {
    // Needed to make left box shadow show up for all tiles
    overflow: "unset"
  }
};

function FacetsGrid(props) {
  const { classes } = props;

  function isTimeSeries(facet) {
    return facet.is_time_series;
  }

  function getFacetDefinition(facet) {
    if (isTimeSeries(facet)) {
      return (
        <TimeSeriesFacet
          facet={facet}
          updateFacets={props.updateFacets}
          handleRemoveFacet={props.handleRemoveFacet}
          isExtraFacet={props.extraFacetEsFieldNames.includes(
            facet.es_field_name
          )}
          selectedFacetValues={props.selectedFacetValues}
	  timeSeriesUnit={props.timeSeriesUnit}
        />
      );
    } else {
      return (
        <HistogramFacet
          facet={facet}
          updateFacets={props.updateFacets}
          handleRemoveFacet={props.handleRemoveFacet}
          isExtraFacet={props.extraFacetEsFieldNames.includes(
            facet.es_field_name
          )}
          selectedValues={props.selectedFacetValues.get(facet.es_field_name)}
        />
      );
    }
  }

  const sortedFacets = [];
  for (let ti = 0, hi = 0;
       hi < props.facets.length || ti < props.facets.length
       ;) {
    for (; ti < props.facets.length; ti++) {
      if (isTimeSeries(props.facets[ti])) {
  	sortedFacets.push(props.facets[ti]);
	ti++;
  	break;
      }
    }
    for (; hi < props.facets.length; hi++) {
      if (!isTimeSeries(props.facets[hi])) {
  	sortedFacets.push(props.facets[hi]);
	hi++;
  	break;
      }
    }
  }

  const facetsList = sortedFacets.map(facet => {
    return (
      // Can't set padding the normal way because it's overridden by
      // GridListTile's built-in "style=padding:2".
      <GridListTile
        classes={{ tile: classes.tile }}
        key={facet.name}
        style={{ padding: 0 }}
        cols={isTimeSeries(facet) ? 2 : 1}
      >
	{getFacetDefinition(facet)}
      </GridListTile>
    );
  });
  return (
    // Can't set margin the normal way because it's overridden by
    // GridList's built-in "style=margin:-2px".
    <GridList
      classes={{ root: classes.root }}
      cols={3}
      cellHeight="auto"
      style={{ margin: "23px -10px -5px 15px" }}
    >
      {facetsList}
    </GridList>
  );
}

export default withStyles(styles)(FacetsGrid);
