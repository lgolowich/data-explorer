import React, { Component } from "react";
import classNames from "classnames";
import Grid from '@material-ui/core/Grid';
import { withStyles } from "@material-ui/core/styles";

import * as Style from "libs/style";
import colors from "libs/colors";
import FacetHeader from "components/facets/FacetHeader";
import HistogramFacet from "components/facets/HistogramFacet";

const styles = {
  timeSeriesHistogramFacet: {
    ...Style.elements.card,
    margin: "0 25px 28px 0",
    maxHeight: "500px",
    overflowY: "auto",
    padding: 0
  }
};

class TimeSeriesHistogramFacet extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;

    const gridItems = this.props.facet.time_series_values.map(tsv => {
      return (
	<Grid item>{tsv.time}</Grid>
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
          <Grid container
	    direction="row"
	  >
	    {gridItems}
	  </Grid>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(TimeSeriesHistogramFacet);
