import React, { Component } from "react";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";

import colors from "libs/colors";

const styles = {
  plotHeader: {
    backgroundColor: colors.grayBlue[5],
    display: "grid",
    gridTemplateColumns: "auto 90px"
  },
  plotName: {
    color: colors.gray[1],
    fontSize: 14,
    fontWeight: 300,
    padding: "11px 0 12px 14px"
  },
  totalFacetValueCount: {
    color: colors.gray[1],
    fontSize: 14,
    fontWeight: 600,
    padding: "11px 18px 0 0",
    textAlign: "right"
  },
};

class TimeSeriesPlotHeader extends Component {
  constructor(props) {
    // Has props:
    // name: gives time
    // values: from facet.value_names and facet.time_series_value_counts
    // selectedValues: normal meaning
    super(props);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.plotHeader}>
        <div className={classes.plotName}>{this.props.name}</div>
        <div className={classes.totalFacetValueCount}>
          {this.sumFacetValueCounts(
            this.props.values,
            this.props.selectedValues
          )}
        </div>
      </div>
    );
  }

  /**
   * @param facetValues FacetValue[] to sum counts over
   * @param selectedValueNames Optional string[] to select a subset of facetValues to sum counts for
   * @return number count the total sum of all facetValue counts, optionally filtered by selectedValueNames
   * TODO: This function is repeated here and in FacetHeader.js.
   */
  sumFacetValueCounts(facetValues, selectedValueNames) {
    let count = 0;
    if (selectedValueNames == null || selectedValueNames.length === 0) {
      facetValues.forEach(value => {
        count += value.count;
      });
    } else {
      facetValues.forEach(value => {
        if (selectedValueNames.indexOf(value.name) > -1) {
          count += value.count;
        }
      });
    }
    return count;
  }
}

export default withStyles(styles)(TimeSeriesPlotHeader);
