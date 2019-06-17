import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";

import "./HistogramFacet.css";
import * as Style from "libs/style";
import colors from "libs/colors";
import FacetHeader from "components/facets/FacetHeader";
import HistogramPlot from "components/facets/HistogramPlot";

const styles = {
  histogramFacet: {
    ...Style.elements.card,
    margin: "0 25px 28px 0",
    maxHeight: "500px",
    overflowY: "auto",
    padding: 0
  },
};

class HistogramFacet extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;

    let values = [];
    for (let i = 0; i < this.props.facet.value_names.length; i++) {
      values.push({
	name: this.props.facet.value_names[i],
	count: this.props.facet.value_counts[i]
      });
    }

    return (
      <div className={classes.histogramFacet}>
        <FacetHeader
          facet={this.props.facet}
          values={values}
          selectedValues={this.props.selectedValues}
          handleRemoveFacet={this.props.handleRemoveFacet}
          isExtraFacet={this.props.isExtraFacet}
          isTimeSeries={false}
        />
	{this.props.facet.value_counts && this.props.facet.value_counts.length > 0 && (
	  <HistogramPlot
	    es_field_name={this.props.facet.es_field_name}
            es_field_type={this.props.facet.es_field_type}
            values={values}
            selectedValues={this.props.selectedValues}
	    updateFacets={this.props.updateFacets}
	    isTimeSeries={false}
          />
	)}
      </div>
    );
  }
}

export default withStyles(styles)(HistogramFacet);
