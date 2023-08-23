import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { MenuItem, Select, TextField } from "@material-ui/core";
import { useDrop } from "react-dnd";
import { useStateValue } from "utils/store/contexts";
import { DisplayButton, DisplayText } from "components/display_components";
import { PaperWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";

const AggregateDropable = (props) => {
  const { attributes, storevalue } = props;

  const [{ dashboardState }, dispatch] = useStateValue();
  const { systemTypes } = dashboardState;

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
      padding: "10px",
      height: "180px",
      display: "flex",
      flex: 1,
      flexDirection: "column",
    },
    heading: {
      fontFamily: "Roboto",
      fontSize: "16px",
      color: "#212121",
    },
  }));
  const classes = useStyles();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "DRAGGABLE",
    drop: (inputAttributes, monitor) => {
      let ngModelObj = getNgModel(inputAttributes, attributes);
      setBgColor("#f5f5f5");
      setValue(ngModelObj);
      setMethods(
        getMethods(inputAttributes.fieldMetadata.type, inputAttributes.src)
      );
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const { Delete } = SystemIcons;

  const [bgColor, setBgColor] = useState("white");
  const [methods, setMethods] = useState([]);
  const [value, setValue] = useState(undefined);

  //getters
  let getMethods = (inputType, src) => {
    try {
      if (src == "COMPONENTTITLE")
        return [
          { methodName: "COUNT", methodTitle: "Count" },
          { methodName: "DISTINCT", methodTitle: "Distinct" },
        ];
      else
        return systemTypes
          .filter((e) => e.sys_entityAttributes.dataFormat != "EXCLUDED")
          .find(
            (a) =>
              a.sys_entityAttributes.directiveTypes.filter(
                (d) => d.name == inputType
              ).length
          ).sys_entityAttributes.methods;
    } catch (e) {
      return [];
    }
  };

  let getNgModel = (inputValue, attributes) => {
    let { fieldMetadata, name, src, label } = inputValue;
    let ngModelObj = {
      name: ["REFERENCE", "DATAPAIREDLIST", "PAIREDLIST"].includes(
        fieldMetadata.type
      )
        ? fieldMetadata.name
        : name,
      title: label,
      type: src == "COMPONENTTITLE" ? src : fieldMetadata.type,
      path: constructPath(fieldMetadata, name, src),
      class: src == "COMPONENTTITLE" ? "COMPONENT" : src,
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

  let setDefaultState = () => {
    if (attributes.default) {
      setMethods([
        {
          methodName: attributes.default.method,
          methodTitle: attributes.default.methodTitle,
        },
      ]);
      setValue(attributes.default);
      // props.handleInputChanges({'value' : [attributes.default],attributes});
    }
  };

  //custom methods
  const handleChange = (event) => {
    setValue({
      ...value,
      method: event.target.value,
    });
  };

  //useEffects
  useEffect(() => {
    if (storevalue && storevalue.length) {
      setValue(storevalue[0]);
      if (storevalue[0].name == "_id") {
        setMethods([
          {
            methodName: attributes.default.method,
            methodTitle: attributes.default.methodTitle,
          },
        ]);
      } else {
        let src =
          storevalue[0].type == "COMPONENTTITLE"
            ? "COMPONENTTITLE"
            : storevalue[0].src;
        setMethods(getMethods(storevalue[0].type, src));
      }
    } else {
      setDefaultState();
    }
  }, [storevalue]);

  useEffect(() => {
    if (value && value.method)
      props.handleInputChanges({ value: [value], attributes });
    else if (!value) setDefaultState();
  }, [value]);

  return (
    <div ref={drop} className={classes.root}>
      <PaperWrapper elevation={2} className={classes.card}>
        <DisplayText className={classes.heading}>
          {attributes.title}
        </DisplayText>
        <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
          <div style={{ flex: 9.9 }}>
            <TextField
              id="outlined-basic"
              value={value ? value.title : ""}
              margin="normal"
              placeholder={"Drop field here"}
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
                setBgColor("white");
              }}
            >
              <Delete fontSize="large" />
            </DisplayButton>
          </div>
        </div>
        {value && (
          <div style={{ flex: 1, flexDirection: "column" }}>
            <Select
              style={{
                width: "90%",
                margin: "10px 10px 0px 10px",
                backgroundColor: "#f5f5f5",
              }}
              value={value.method}
              onChange={handleChange}
            >
              {methods.map((e, i) => (
                <MenuItem key={i} value={e.methodName}>
                  {e.methodTitle}
                </MenuItem>
              ))}
            </Select>
            <DisplayText style={{ margin: "5px 10px 10px 10px" }}>
              Select any Method
            </DisplayText>
          </div>
        )}
      </PaperWrapper>
    </div>
  );
};

export default AggregateDropable;
