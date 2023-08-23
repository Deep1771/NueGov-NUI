import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormHelperText, MenuItem, Select } from "@material-ui/core";
import { useDrop } from "react-dnd";
import { useStateValue } from "utils/store/contexts";
import {
  DisplayButton,
  DisplayInput,
  DisplayText,
} from "components/display_components";
import { SystemIcons } from "utils/icons";

const DropableTarget = (props) => {
  const { attributes, storevalue } = props;

  const [{ dashboardState }, dispatch] = useStateValue();
  const { systemTypes } = dashboardState;
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "DRAGGABLE",
    drop: (inputValue, monitor) => {
      let obj = getObjectByInputTypes(inputValue, attributes);
      setSample(obj.value);
      setBgColor("#f5f5f5");
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(1),
      width: "90%",
      height: "90%",
      justifyContent: "center",
      alignSelf: "center",
    },
    input: {
      display: "none",
    },
  }));
  const classes = useStyles();

  const { Delete } = SystemIcons;

  const [sample, setSample] = useState(undefined);
  const [bgColor, setBgColor] = useState("white");

  //getters
  let getMethods = (inputType) => {
    return systemTypes
      .filter((e) => e.sys_entityAttributes.dataFormat != "EXCLUDED")
      .find(
        (a) =>
          a.sys_entityAttributes.directiveTypes.filter(
            (d) => d.name == inputType
          ).length
      ).sys_entityAttributes.methods;
  };

  let getObjectByInputTypes = (inputValue, attributes) => {
    let { fieldMetadata, name, src, label } = inputValue;
    let metadata = { ...fieldMetadata };
    metadata["title"] = label;
    return { value: metadata, attributes, name, src };
  };

  //custom methods
  let showChildrens = (inputObj, attr) => {
    let methods = getMethods(inputObj.type);
    if (attr.type == "AGGREGATION") {
      return (
        <>
          <Select
            style={{
              width: "96%",
              height: "100%",
              margin: "10px 10px 0px 10px",
              bacckgroundColor: "#f5f5f5",
            }}
            value={10}
            className={classes.selectEmpty}
          >
            {methods.map((e) => (
              <MenuItem value={e.methodName}>{e.methodTitle}</MenuItem>
            ))}
          </Select>
          <FormHelperText style={{ margin: "5px 10px 10px 10px" }}>
            Select any Method
          </FormHelperText>
        </>
      );
    } else if (attr.type == "FILTERS") {
      return <></>;
    } else return null;
  };

  useEffect(() => {
    if (storevalue) {
      if (isArray(storevalue)) setSample(storevalue[0]);
      else setSample(storevalue);
    } else setSample(undefined);
  }, [storevalue]);

  return (
    <div
      ref={drop}
      style={{
        width: "96%",
        display: "flex",
        flex: 1,
        flexDirection: "column",
      }}
    >
      <div
        position="static"
        style={{ height: "80%", padding: "10px", margin: "10px" }}
        color="default"
      >
        <DisplayText
          variant="h7"
          style={{ margin: "5px", fontWeight: 900, color: "#444242" }}
        >
          {attributes.title}rtetreterwt
        </DisplayText>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flex: 9 }}>
            <DisplayInput
              id="outlined-basic"
              value={sample ? sample.title : ""}
              margin="normal"
              placeholder={isOver ? "Drop field here" : attributes.placeholder}
              style={{
                width: "100%",
                height: "10px",
                margin: 2,
                backgroundColor: isOver ? "#f5f5f5" : bgColor,
              }}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <DisplayButton
              variant="outlined"
              color="secondary"
              size="large"
              onClick={() => {
                setSample(undefined);
                props.handleInputChanges({ value: undefined, attributes });
                setBgColor("white");
              }}
              className={classes.button}
            >
              <Delete />
            </DisplayButton>
          </div>
        </div>
        <div style={{ height: "100%" }}>
          {sample && showChildrens(sample, attributes)}
        </div>
      </div>
    </div>
  );
};

export default DropableTarget;
