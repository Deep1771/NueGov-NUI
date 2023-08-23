import React, { useEffect, useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import update from "immutability-helper";
import FilterCard from "./filter_card";
import { DisplayButton } from "components/display_components";

const FilterDropable = (props) => {
  const { attributes, storevalue } = props;

  const useStyles = makeStyles((theme) => ({
    button: {
      justifyContent: "center",
      alignSelf: "center",
    },
    root: {
      justifyContent: "flex-start",
      flex: 1,
      display: "flex",
      margin: "15px 0px 15px 0px",
      flexDirection: "column",
    },
    card: {
      backgroundColor: "#f5f5f5",
      boxShadow: "0 5px 5px 0 rgba(0, 0, 0, 0.15)",
      borderRadius: "8px",
      width: "100%",
      padding: "10px",
      height: "100%",
      display: "flex",
      flex: 1,
      flexDirection: "column",
    },
    heading: {
      fontFamily: "Roboto",
      fontSize: "16px",
      margin: "5px",
      color: "#212121",
    },
    muted: {
      fontFamily: "Roboto",
      fontSize: "12px",
      alignSelf: "center",
      flex: 7,
      margin: "10px 0px 0px 0px",
      color: "#212121",
    },
  }));
  const classes = useStyles();

  const [value, setValue] = useState([]);

  //getters
  let getNgModel = (inputValue, attributes) => {
    let { fieldMetadata, name, src, label } = inputValue;
    let ngModelObj = {
      name: ["REFERENCE", "DATAPAIREDLIST", "PAIREDLIST"].includes(
        fieldMetadata.type
      )
        ? fieldMetadata.name
        : name,
      title: label,
      path: constructPath(fieldMetadata, name, src),
      class: src == "COMPONENTTITLE" ? "COMPONENT" : src,
      strictMatch: true,
    };
    if (["COMPONENT", "COMPONENTTITLE"].includes(src))
      ngModelObj["componentName"] = fieldMetadata.componentName;
    return ngModelObj;
  };

  //setters
  let constructPath = (fieldMeta, name, src) => {
    switch (src) {
      case "COMPONENTTITLE":
        return `${name}`;
      default: {
        switch (fieldMeta.type) {
          case "REFERENCE":
            return `sys_entityAttributes.${fieldMeta.name}.${name}`;
          case "DATAPAIREDLIST":
            return `sys_entityAttributes.${fieldMeta.name}.${name}.text`;
          case "PAIREDLIST":
            return `sys_entityAttributes.${fieldMeta.name}.${name}.id`;
          case "APPROVAL":
            return `sys_entityAttributes.${fieldMeta.name}.value`;
          default:
            return `sys_entityAttributes.${fieldMeta.name}`;
        }
      }
    }
  };

  //custom functions
  const addFilterObject = () => {
    setValue([...value, {}]);
  };

  const handleDeleteItem = useCallback((index, item) => {
    setValue(
      update(value, {
        $splice: [[index, 1]],
      })
    );
  });

  const handleDrop = useCallback((index, item) => {
    let ngModel = getNgModel(item, attributes);
    setValue(
      update(value, {
        [index]: { $set: ngModel },
      })
    );
  });

  const handleTextChange = useCallback((index, item) => {
    setValue(
      update(value, {
        [index]: {
          $merge: {
            values: {
              equals: item,
            },
          },
        },
      })
    );
  });

  const handleToggleChange = useCallback((index, item) => {
    setValue(
      update(value, {
        [index]: {
          strictMatch: {
            $set: item,
          },
        },
      })
    );
  });

  useEffect(() => {
    if (Array.isArray(storevalue)) setValue(storevalue);
    else setValue([]);
  }, []);

  useEffect(() => {
    if (value.length) {
      props.handleInputChanges({ value: value, attributes });
    } else props.handleInputChanges({ value: undefined, attributes });
  }, [value]);

  return (
    <div className={classes.root}>
      {value.map((e, i) => (
        <FilterCard
          onDrop={(item) => handleDrop(i, item)}
          onInputChange={(item) => handleTextChange(i, item)}
          onToggleChange={(item) => handleToggleChange(i, item)}
          onDeleteItem={(item) => handleDeleteItem(i, item)}
          ngModel={e}
          key={i}
        />
      ))}
      <DisplayButton
        variant="outlined"
        style={{
          alignSelf: "flex-end",
          margin: "15px 0px 5px 0px",
          width: "100%",
        }}
        color="primary"
        onClick={addFilterObject}
      >
        {" "}
        + Add Filter{" "}
      </DisplayButton>
    </div>
  );
};

export default FilterDropable;
