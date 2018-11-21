import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";

import * as Style from "libs/style";

const styles = {
  facetCard: {
    margin: "2%",
    paddingBottom: "8px"
  },
  facetName: {
    display: "inline"
  },
  facetDescription: {
    color: "gray"
  },
  totalFacetValueCount: {
    color: "gray",
    display: "inline",
    float: "right"
  },
  facetValueList: {
    gridColumn: "1 / 3",
    margin: "20px 0 0 0",
    maxHeight: "500px",
    overflow: "auto"
  },
  facetValue: {
    // This is a nested div, so need to specify a new grid.
    display: "grid",
    gridTemplateColumns: "50px auto 50px",
    justifyContent: "stretch",
    padding: "0",
    // Disable gray background on ListItem hover.
    "&:hover": {
      backgroundColor: "unset"
    }
  },
  facetValueCheckbox: {
    height: "24px",
    width: "24px"
  },
  facetValueName: {
    float: "left",
    textAlign: "left"
  },
  facetValueCount: {
    padding: "0",
    float: "right",
    textAlign: "right"
  },
  grayText: {
    color: "silver"
  }
};

class FacetCard extends Component {
  constructor(props) {
    super(props);

    this.facetValues = this.props.facet.values;

    this.totalFacetValueCount = this.sumFacetValueCounts(
      this.props.facet.values,
      []
    );

    this.onClick = this.onClick.bind(this);
    this.isDimmed = this.isDimmed.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.totalFacetValueCount = this.sumFacetValueCounts(
      nextProps.facet.values,
      this.props.selectedValues
    );
  }

  render() {
    const { classes } = this.props;

    // facetValue is a dict, eg { name: "female", count: 1760 }
    const facetValues = this.props.facet.values.map(facetValue => (
      <ListItem
        className={classes.facetValue}
        key={facetValue.name}
        button
        dense
        disableRipple
        onClick={e => this.onClick(facetValue.name)}
      >
        <Checkbox
          className={classes.facetValueCheckbox}
          checked={
            this.props.selectedValues != null &&
            this.props.selectedValues.includes(facetValue.name)
          }
        />
        <ListItemText
          primary={
            <div
              className={this.isDimmed(facetValue) ? classes.grayText : null}
            >
              <div className={classes.facetValueName}>{facetValue.name}</div>
              <div className={classes.facetValueCount}>{facetValue.count}</div>
            </div>
          }
        />
      </ListItem>
    ));
    const totalFacetValueCount = (
      <span className={classes.totalFacetValueCount}>{this.totalFacetValueCount}</span>
    );
    return (
      <div className={classes.facetCard} style={Style.elements.card}>
        <div>
          <Typography className={classes.facetName}>
            {this.props.facet.name}
          </Typography>
          {this.props.facet.name != "Samples Overview" ? (
            <Typography className={classes.totalFacetValueCount}>
              {this.totalFacetValueCount}
            </Typography>
          ) : null}
        </div>
        <Typography className={classes.facetDescription}>
          {this.props.facet.description}
        </Typography>
        <List dense className={classes.facetValueList}>
          {facetValues}
        </List>
      </div>
    );
  }

  isDimmed(facetValue) {
    return (
      this.props.selectedValues != null &&
      this.props.selectedValues.length > 0 &&
      !this.props.selectedValues.includes(facetValue.name)
    );
  }

  /**
   * @param facetValues FacetValue[] to sum counts over
   * @param selectedValueNames Optional string[] to select a subset of facetValues to sum counts for
   * @return number count the total sum of all facetValue counts, optionally filtered by selectedValueNames
   * */
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

  onClick(facetValue) {
    // facetValue is a string, eg "female"
    let isSelected;
    if (
      this.props.selectedValues != null &&
      this.props.selectedValues.length > 0 &&
      this.props.selectedValues.includes(facetValue)
    ) {
      // User must have unchecked the checkbox.
      isSelected = false;
    } else {
      // User must have checked the checkbox.
      isSelected = true;
    }

    this.props.updateFacets(
      this.props.facet.es_field_name,
      facetValue,
      isSelected
    );
  }
}

export default withStyles(styles)(FacetCard);
