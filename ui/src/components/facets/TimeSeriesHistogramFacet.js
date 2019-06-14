import React, { Component } from "react";
import classNames from "classnames";
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { withStyles } from "@material-ui/core/styles";

import * as Style from "libs/style";
import colors from "libs/colors";
import FacetHeader from "components/facets/FacetHeader";
import HistogramPlot from "components/facets/HistogramPlot";

const styles = {
  timeSeriesHistogramFacet: {
    ...Style.elements.card,
    margin: "0 25px 28px 0",
    maxHeight: "500px",
    overflowX: "hidden",
    overflowY: "auto",
    padding: 0
  },
  gridList: {
    flexWrap: "nowrap"
  }
};

class TimeSeriesHistogramFacet extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;

    const gridListItems = this.props.facet.time_series_values.map(tsv => {
      let tsv_es_field_name = this.props.facet.es_field_name + "." + tsv.time;
      return (
	<GridListTile item key={tsv.time}>
	  <HistogramPlot
	    es_field_name={tsv_es_field_name}
	    es_field_type={this.props.facet.es_field_type}
	    values={tsv.values}
 	    selectedValues={this.props.selectedFacetValues.get(tsv_es_field_name)}
	    updateFacets={this.props.updateFacets}
	  />
	</GridListTile>
      );
    });

    return (
      <div className={classes.timeSeriesHistogramFacet}>
        <FacetHeader
          facet={this.props.facet}
          selectedValues={this.props.selectedValues}
          handleRemoveFacet={this.props.handleRemoveFacet}
          isExtraFacet={this.props.isExtraFacet}
        />
        {this.props.facet.time_series_values && this.props.facet.time_series_values.length > 0 && (
          <GridList
	    className={classes.gridList}
	    cols={Math.min(5, this.props.facet.time_series_values.length)}
	  >
	    {gridListItems}
	  </GridList>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(TimeSeriesHistogramFacet);
