import React, { Component } from "react";
import classNames from "classnames";
import { Handler } from "vega-tooltip";
import * as vl from "vega-lite";
import Vega from "react-vega";
import { withStyles } from "@material-ui/core/styles";

import "./HistogramFacet.css";
import * as Style from "libs/style";
import colors from "libs/colors";
import FacetHeader from "components/facets/FacetHeader";

const styles = {
  timeSeriesHeatmapPlot: {
    overflowX: "visible",
    overflowY: "auto"
  },
  vega: {
    textAlign: "center"
  }
};

// If more than 120px, facet value name will be cut off with "..."
const facetValueNameWidthLimit = 120;

function isCategorical(es_field_type) {
  return (
    es_field_type === "text" || es_field_type === "samples_overview"
  );
}

// From https://stackoverflow.com/questions/39342575
function maxCount(arr) {
  let maxRow = arr.map(function(row){ return Math.max.apply(Math, row); });
  return Math.max.apply(null, maxRow);
}

class TimeSeriesHeatmapPlot extends Component {
  constructor(props) {
    super(props);
    this.isValueDimmed = this.isValueDimmed.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onNewView = this.onNewView.bind(this);
  }

  render() {
    const { classes } = this.props;

    const baseVegaLiteSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v3.json",
      config: {
	// Config that applies to both axes go here
	axis: {
	  domainColor: colors.gray[4],
	  gridColor: colors.gray[6],
	  labelColor: colors.gray[0],
	  labelFont: "Montserrat",
	  labelFontWeight: 500,
	  labelPadding: 9,
	  ticks: false
	}
      },
      encoding: {
	tooltip: [
	  {
	    field: "text_name",
	    title: this.props.facet.name,
	    type: "nominal"
	  },
	  {
	    field: "time_series_value",
	    title: this.props.timeSeriesUnit,
	    type: "nominal"
	  },
	  {
	    field: "text_count",
	    title: "Number Participants",
	    type: "nominal"
	  }
	],
	color: {},
	y: {},
	x: {},
	// opacity is needed for creating transparent bars.
	opacity: {
	  field: "opaque",
	  type: "ordinal",
	  scale: {
	    domain: [0, .1, 1],
            range: [0, 1]
	  },
	  legend: null
	}
      },
      mark: {
	type: "rect",
	cursor: "pointer"
      },
      padding: {
	left: 0,
	top: 17,
	right: 0,
	bottom: 16
      },
      width: 800
    };

    let facetValueNames = this.props.facet.value_names.slice();
    const vegaLiteSpec = Object.assign({}, baseVegaLiteSpec);
    if (!isCategorical(this.props.facet.es_field_type)) {
      // For numeric facets, higher numbers should be higher on the y-axis
      facetValueNames.reverse();
    }

    const facetValueNameAxis = {
      field: "facet_value",
      type: "nominal",
      title: this.props.facet.name,
      sort: facetValueNames,
      axis: {
        labelFontSize: 12,
        labelLimit: facetValueNameWidthLimit,
	titleColor: colors.gray[0],
      	titleFont: "Montserrat",
      	titleFontWeight: 500,
      	titleFontSize: 14,
      	titlePadding: 20,
      	titleOrient: "bottom"
      },
      scale: {
        // Bar height (15px) + whitespace height (10px) = 25px
        rangeStep: 20,
      }
    };

    const facetValueCountAxis = {
      field: "count",
      type: "quantitative",
      title: "Number Participants",
      legend: {
	labelFont: "Montserrat",
	labelFontSize: 10,
	titleFont: "Montserrat",
	titleFontSize: 10,
	padding: 22 // has to be large enough to fit title horizontally
      }
    };

    const facetValueTimeAxis = {
      field: "time_series_value",
      type: "ordinal",
      title: this.props.timeSeriesUnit,
      axis: {
      	labelColor: colors.gray[0],
      	labelFont: "Montserrat",
      	labelFontWeight: 500,
      	labelFontSize: 14,
      	labelPadding: 12,
	labelAngle: 0,
      	labelOrient: "bottom",
      	titleColor: colors.gray[0],
      	titleFont: "Montserrat",
      	titleFontWeight: 500,
      	titleFontSize: 14,
      	titlePadding: 8,
      	titleOrient: "bottom"
      }
    };

    // Make bars horizontal, to allow for more space for facet value names for
    // categorical facets.
    vegaLiteSpec.encoding.color = facetValueCountAxis;
    vegaLiteSpec.encoding.y = facetValueNameAxis;
    vegaLiteSpec.encoding.x = facetValueTimeAxis;

    const data = { values: [] };
    for (let ti = 0; ti < this.props.facet.time_names.length; ti++) {
      for (let vi = 0; vi < this.props.facet.value_names.length; vi++) {
	let name = this.props.facet.value_names[vi];
	let count = this.props.facet.time_series_value_counts[ti][vi];
	let time = this.props.facet.time_names[ti];
	data.values.push({
	  facet_value: name,
	  count: count,
	  time_series_value: time,
	  text_name: `${name}`,
	  text_count: `${count}`,
	  opaque: (this.isValueDimmed(name, this.props.facet.es_field_name + "." + time)
		   ? .1 : 1),
	});
      }
    }

    // vega-lite spec is easier to construct than vega spec. But certain
    // properties aren't available in vega-lite spec (vega-lite is a subset of
    // vega). So construct vega-lite spec, compile to vega spec, edit properties
    // that are only available in vega, then render Vega component.
    vegaLiteSpec.data = data;
    const vegaSpec = vl.compile(vegaLiteSpec).spec;

    // Setting align removes whitespace over top bar.
    // When https://github.com/vega/vega-lite/issues/4741 is fixed, set align
    // normally.
    vegaSpec.scales[1].align = 0;

    let vega = (
      <Vega
        spec={vegaSpec}
        tooltip={new Handler({ theme: "custom" }).call}
        onNewView={this.onNewView}
      />
    );

    return (
      <div className={classes.timeSeriesHeatmapPlot}>
	<div className={classes.vega}> {vega} </div>
      </div>
    );
  }

  isValueDimmed(facetValueName, tsv_es_field_name) {
    let selectedValues = this.props.selectedFacetValues.get(tsv_es_field_name);
    return (
      selectedValues != null &&
      selectedValues.length > 0 &&
      !selectedValues.includes(facetValueName)
    );
  }

  onClick(event, item) {
    // Ignore clicks which are not located on histogram
    // bars.
    if (item && item.datum && item.datum.facet_value) {
      let tsv_es_field_name = (this.props.facet.es_field_name + "." +
			       item.datum.time_series_value);
      let selectedValues = this.props.selectedFacetValues.get(tsv_es_field_name);
      // facetValue is a string, eg "female"
      // If bar was clicked, item.datum.facet_value is populated.
      // If axis label was clicked, item.datum.value is populated.
      const facetValue =
        "facet_value" in item.datum ? item.datum.facet_value : item.datum.value;
      let isSelected;
      // selectedValues contains what was selected before the click.
      // isSelected contains if facet value was selected after the click.
      if (
        selectedValues != null &&
        selectedValues.length > 0 &&
        selectedValues.includes(facetValue)
      ) {
        isSelected = false;
      } else {
        isSelected = true;
      }

      this.props.updateFacets(
        tsv_es_field_name,
        facetValue,
        isSelected
      );
    }
  }

  onNewView(view) {
    view.addEventListener("click", this.onClick);
  }
}

export default withStyles(styles)(TimeSeriesHeatmapPlot);
