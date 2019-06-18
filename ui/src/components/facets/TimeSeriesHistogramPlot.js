import React, { Component } from "react";
import classNames from "classnames";
import Grid from '@material-ui/core/Grid';
import { withStyles } from "@material-ui/core/styles";

import * as Style from "libs/style";
import colors from "libs/colors";
import FacetHeader from "components/facets/FacetHeader";
import HistogramPlot from "components/facets/HistogramPlot";
import TimeSeriesPlotHeader from "components/facets/TimeSeriesPlotHeader";

const styles = {
  timeSeriesHistogramPlot: {
    overflowX: "visible",
    overflowY: "auto"
  },
  grid: {
    flexWrap: "nowrap"
  },
  gridItem: {
    paddingRight: "4px"
  },
  histogramPlot: {
    padding: "5px"
  }
};

function getValues(value_names, value_counts) {
  let values = []
  for (let i = 0; i < value_names.length; i++) {
    values.push({
      name: value_names[i],
      count: value_counts[i]
    });
  }
  return values;
}

// From https://stackoverflow.com/questions/39342575
function maxCount(arr) {
  let maxRow = arr.map(function(row){ return Math.max.apply(Math, row); });
  return Math.max.apply(null, maxRow);
}

class TimeSeriesHistogramPlot extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;

    const gridItems = []
    for (var ti = 0; ti < this.props.facet.time_names.length; ti++) {
      let tsv_es_field_name = (this.props.facet.es_field_name + "." +
			       this.props.facet.time_names[ti]);
      let values = getValues(this.props.facet.value_names,
			     this.props.facet.time_series_value_counts[ti]);
      let maxFacetValue = maxCount(this.props.facet.time_series_value_counts);
      gridItems.push(
	<div className={classes.gridItem} key={this.props.facet.time_names[ti]}>
	  <Grid item>
	    <TimeSeriesPlotHeader
	      name={this.props.facet.time_names[ti]}
	      values={values}
 	      selectedValues={this.props.selectedFacetValues.get(tsv_es_field_name)}
	    />
	    <div className={classes.histogramPlot}>
	      <HistogramPlot
	        es_field_name={tsv_es_field_name}
	        es_field_type={this.props.facet.es_field_type}
	        values={values}
 	        selectedValues={this.props.selectedFacetValues.get(tsv_es_field_name)}
	        maxFacetValue={maxFacetValue}
	        updateFacets={this.props.updateFacets}
	        isTimeSeries={true}
	      />
	    </div>
	  </Grid>
	</div>
      );
    }

    return (
      <div className={classes.timeSeriesHistogramPlot}>
        <Grid
	  container
	  className={classes.grid}
	  direction="row"
        >
          {gridItems}
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(TimeSeriesHistogramPlot);
