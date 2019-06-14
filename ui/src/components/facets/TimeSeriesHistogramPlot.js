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

class TimeSeriesHistogramPlot extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;

    const gridItems = this.props.facet.time_series_values.map(tsv => {
      let tsv_es_field_name = this.props.facet.es_field_name + "." + tsv.time;
      return (
	<div className={classes.gridItem} key={tsv.time}>
	  <Grid item>
	    <TimeSeriesPlotHeader
	      name={tsv.time}
	      values={tsv.values}
 	      selectedValues={this.props.selectedFacetValues.get(tsv_es_field_name)}
	    />
	    <div className={classes.histogramPlot}>
	      <HistogramPlot
	        es_field_name={tsv_es_field_name}
	        es_field_type={this.props.facet.es_field_type}
	        values={tsv.values}
 	        selectedValues={this.props.selectedFacetValues.get(tsv_es_field_name)}
	        updateFacets={this.props.updateFacets}
	        isTimeSeries={true}
	      />
	    </div>
	  </Grid>
	</div>
      );
    });

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
