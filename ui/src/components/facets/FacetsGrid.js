import React from "react";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import { withStyles } from "@material-ui/core/styles";

import HistogramFacet from "components/facets/HistogramFacet";
import TimeSeriesHistogramFacet from "components/facets/TimeSeriesHistogramFacet";

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
    return (facet.time_series_values && facet.time_series_values.length > 0);
  }

  function getFacetDefinition(facet) {
    if (isTimeSeries(facet)) {
      return (
        <TimeSeriesHistogramFacet
          facet={facet}
          updateFacets={props.updateFacets}
          handleRemoveFacet={props.handleRemoveFacet}
          isExtraFacet={props.extraFacetEsFieldNames.includes(
            facet.es_field_name
          )}
          selectedFacetValues={props.selectedFacetValues}
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

  const facetsList = props.facets.map(facet => {
    return (
      // Can't set padding the normal way because it's overridden by
      // GridListTile's built-in "style=padding:2".
      <GridListTile
        classes={{ tile: classes.tile }}
        key={facet.name}
        style={{ padding: 0 }}
        cols={isTimeSeries(facet) ? 3 : 1}
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
