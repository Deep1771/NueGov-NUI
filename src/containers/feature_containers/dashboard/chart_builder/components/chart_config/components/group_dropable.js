import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import { useDrop } from "react-dnd";
import { DisplayButton, DisplayText } from "components/display_components";
import { PaperWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";

const GroupDropable = (props) => {
  const { attributes, storevalue } = props;

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "DRAGGABLE",
    drop: (inputAttributes, monitor) => {
      let ngModelobj = getNgModel(inputAttributes, attributes);
      props.handleInputChanges({ value: ngModelobj, attributes });
      setBgColor("#f5f5f5");
      setValue(ngModelobj);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const useStyles = makeStyles((theme) => ({
    button: {
      justifyContent: "center",
      alignSelf: "center",
    },
    root: {
      justifyContent: "center",
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
      height: "100px",
      padding: "10px",
      display: "flex",
      marginTop: "15px",
      flex: 1,
      // margin:"8px 0p 8px 0px",
      flexDirection: "column",
    },
    heading: {
      fontFamily: "Roboto",
      fontSize: "16px",
      color: "#212121",
    },
  }));
  const classes = useStyles();

  const { Delete } = SystemIcons;
  const [value, setValue] = useState(undefined);
  const [bgColor, setBgColor] = useState("white");

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
      limit: 50,
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

  useEffect(() => {
    if (storevalue) setValue(storevalue);
    else setValue(undefined);
  }, [storevalue]);

  return (
    <div ref={drop} className={classes.root}>
      <PaperWrapper elevation={2} className={classes.card}>
        <DisplayText className={classes.heading}>
          {attributes.title}
        </DisplayText>
        <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
          <div style={{ flex: 9.9, display: "flex" }}>
            <TextField
              id="outlined-basic"
              value={value ? value.title : ""}
              margin="normal"
              placeholder={attributes.placeholder}
              style={{ width: "100%", backgroundColor: bgColor }}
              required={attributes.required}
              InputProps={{
                readOnly: true,
                style: {
                  fontFamily: "Roboto",
                  color: "#666666",
                  fontSize: 16,
                },
              }}
              variant="outlined"
            />
          </div>
          <div style={{ flex: 0.1, display: "flex", justifyContent: "center" }}>
            <DisplayButton
              color="secondary"
              className={classes.button}
              onClick={() => {
                setValue(undefined);
                props.handleInputChanges({ value: undefined, attributes });
                setBgColor("white");
              }}
            >
              <Delete fontSize="large" />
            </DisplayButton>
          </div>
        </div>
      </PaperWrapper>
    </div>
  );
};

export default GroupDropable;
