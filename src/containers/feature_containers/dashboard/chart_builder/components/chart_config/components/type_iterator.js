import React, { lazy, Suspense, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { get, set, delete as deleteObj } from "dot-prop";
import { useStateValue } from "utils/store/contexts";
import AggregateDropable from "./aggregate_dropable";
import FilterDropable from "./filter_dropable";
import GroupDropable from "./group_dropable";
import Textbox from "./textbox";
import Toggle from "./toggle";

const AgencyFilter = lazy(() => import("./agency_filter"));

let TypeIterator = (props) => {
  const { attributes, dashboard } = props;
  const [{ dashboardState }, dispatch] = useStateValue();
  const useStyles = makeStyles((theme) => ({
    root: {
      // padding: theme.spacing(0, 0),
      alignSelf: "flex-start",
      justifyContent: "flex-start",
      alignContent: "flex-start",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      // color: 'black'
    },
  }));

  const classes = useStyles();

  //getters
  let getValuesFromStore = (metadata) => {
    if (metadata.parent)
      return get(
        dashboard.sys_entityAttributes,
        `${metadata.parent}.${metadata.name}`
      );
    else return get(dashboard.sys_entityAttributes, metadata.name);
  };

  //custom methods
  const handleChange = (name) => (event) => {
    let entityAttributes = { ...dashboard.sys_entityAttributes };
    const { value, attributes } = event;
    if (value) {
      if (attributes.parent)
        set(entityAttributes, `${attributes.parent}.${attributes.name}`, value);
      else set(entityAttributes, attributes.name, value);
    } else {
      if (attributes.parent)
        deleteObj(entityAttributes, `${attributes.parent}.${attributes.name}`);
      else deleteObj(entityAttributes, attributes.name);
    }
    dispatch({
      type: "SET_ENTITY_ATTRIBUTES",
      payload: entityAttributes,
    });
  };

  const inputIterator = (fieldmeta, i) => {
    switch (fieldmeta.type) {
      case "FILTERS":
        return (
          <FilterDropable
            key={i}
            attributes={fieldmeta}
            storevalue={getValuesFromStore(fieldmeta)}
            handleInputChanges={handleChange("changes")}
          />
        );
      case "AGGREGATION":
        return (
          <AggregateDropable
            key={i}
            attributes={fieldmeta}
            storevalue={getValuesFromStore(fieldmeta)}
            handleInputChanges={handleChange("changes")}
          />
        );
      case "CATEGORY":
        return (
          <GroupDropable
            key={i}
            attributes={fieldmeta}
            storevalue={getValuesFromStore(fieldmeta)}
            handleInputChanges={handleChange("changes")}
          />
        );
      case "TEXTBOX":
        return (
          <Textbox
            key={i}
            attributes={fieldmeta}
            storevalue={getValuesFromStore(fieldmeta)}
            handleInputChanges={handleChange("changes")}
          />
        );
      case "NUMBER":
        return (
          <Textbox
            key={i}
            attributes={fieldmeta}
            type="number"
            storevalue={getValuesFromStore(fieldmeta)}
            handleInputChanges={handleChange("changes")}
          />
        );
      case "TOGGLE":
        return (
          <Toggle
            key={i}
            attributes={fieldmeta}
            storevalue={getValuesFromStore(fieldmeta)}
            handleInputChanges={handleChange("changes")}
          />
        );
      case "AGENCYFILTER":
        return (
          <Suspense fallback={<></>}>
            <AgencyFilter
              key={i}
              attributes={fieldmeta}
              storevalue={getValuesFromStore(fieldmeta)}
              handleInputChanges={handleChange("changes")}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  useEffect(() => {}, [dashboard]);

  return (
    <div className={classes.root}>
      <div
        style={{
          flexGrow: 1,
          contain: "strict",
          overflow: "hidden",
          overflowY: "auto",
          flexDirection: "column",
        }}
        class="hide_scroll"
      >
        {attributes.map((fieldmeta, i) => inputIterator(fieldmeta))}
      </div>
    </div>
  );
};

export default TypeIterator;
