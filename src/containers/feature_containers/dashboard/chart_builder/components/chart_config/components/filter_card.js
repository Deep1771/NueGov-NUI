import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import { useDrop } from "react-dnd";
import { get } from "dot-prop";
import {
  DisplayButton,
  DisplayText,
  DisplaySwitch,
} from "components/display_components";
import { PaperWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";

const FilterCard = (props) => {
  const { ngModel, onDeleteItem, onDrop, onInputChange, onToggleChange } =
    props;

  const [{ isOver, canDrop, didDrop }, drop] = useDrop({
    accept: "DRAGGABLE",
    drop: onDrop,
    collect: (monitor, props) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      didDrop: monitor.didDrop(),
    }),
  });

  const useStyles = makeStyles((theme) => ({
    button: {
      justifyContent: "center",
      alignSelf: "center",
    },
    card: {
      backgroundColor: "#f5f5f5",
      boxShadow: "0 5px 5px 0 rgba(0, 0, 0, 0.15)",
      borderRadius: "8px",
      width: "100%",
      height: "150px",
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

  const { Delete } = SystemIcons;

  const [strictmatchFlag, setStrictMatchFlag] = useState(undefined);
  const [textValue, setTextValue] = useState(undefined);

  //custom methods
  let handleInputChange = (name) => (event) => {
    setTextValue(event.target.value);
  };

  let handleToggleChange = (name) => (event) => {
    setStrictMatchFlag(event.target.checked);
    onToggleChange(event.target.checked);
  };

  //useEffect
  useEffect(() => {
    setTextValue(get(ngModel, "values.equals"));
    setStrictMatchFlag(get(ngModel, "strictMatch"));
  }, [ngModel]);

  return (
    <PaperWrapper className={classes.card}>
      <div style={{ flex: 1, display: "flex", flexDirection: "row" }}>
        <div style={{ flex: 9, display: "flex" }} ref={drop}>
          <TextField
            id="outlined-basic"
            value={ngModel && ngModel.title ? ngModel.title : ""}
            margin="normal"
            placeholder={"Drop attribute"}
            style={{
              width: "100%",
              backgroundColor: didDrop ? "#f5f5f5" : "white",
            }}
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
        <div style={{ flex: 1, display: "flex" }}>
          <DisplayButton
            color="secondary"
            className={classes.button}
            onClick={() => onDeleteItem()}
          >
            <Delete fontSize="large" />
          </DisplayButton>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "row" }}>
        <div style={{ flex: 7.5, display: "flex" }}>
          <TextField
            id="outlined-basic"
            value={textValue ? textValue : ""}
            margin="normal"
            placeholder={"Value"}
            style={{ width: "100%", backgroundColor: "white" }}
            size="medium"
            onChange={handleInputChange("title")}
            onBlur={() => onInputChange(textValue)}
            variant="outlined"
          />
        </div>
        <div
          style={{
            flex: 2.5,
            display: "flex",
            padding: "5px",
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "flex-end",
          }}
        >
          <DisplaySwitch
            onChange={handleToggleChange("checked")}
            checked={strictmatchFlag != undefined ? strictmatchFlag : false}
          />
          <DisplayText className={classes.muted}>Strict match</DisplayText>
        </div>
      </div>
    </PaperWrapper>
  );

  // return (<PaperWrapper className={classes.card}>
  //   <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
  //     <div style={{ flex: 9.9 }} ref={drop}>
  //       <TextField
  //         id="outlined-basic"
  //         value={ngModel && ngModel.title ? ngModel.title : ""}
  //         margin="normal"
  //         placeholder={"Drop attribute"}
  //         style={{ width: '100%', backgroundColor: didDrop ? "#f5f5f5" : "white" }}
  //         InputProps={{
  //           readOnly: true,
  //           style: {
  //             fontFamily: "Roboto",
  //             color: "#666666",
  //             fontSize: 16
  //           }
  //         }}
  //         variant="outlined"
  //       />
  //     </div>
  //     <div style={{ flex: 0.1, display: 'flex', justifyContent: 'flex-start' }}>
  //       <DisplayButton color="secondary" className={classes.button}
  //         onClick={() => onDeleteItem()}
  //       >
  //         <Delete fontSize="large" />
  //       </DisplayButton>
  //     </div>
  //   </div>
  //   {(ngModel && ngModel.title) && <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
  //     <div style={{ flex: 8, width: "100%" }}>
  //       <TextField
  //         id="outlined-basic"
  //         value={textValue ? textValue : ""}
  //         margin="normal"
  //         placeholder={"Value"}
  //         style={{ width: '100%', backgroundColor: "white" }}
  //         size="medium"
  //         onChange={handleInputChange("title")}
  //         onBlur={() => onInputChange(textValue)}
  //         variant="outlined"
  //       />
  //     </div>
  //     <div style={{ flex: 2, display: "flex", padding: "5px", width: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center", alignSelf: "flex-end" }}>

  //       <DisplaySwitch
  //         onChange={handleToggleChange('checked')}
  //         checked={strictmatchFlag != undefined ? strictmatchFlag : false}
  //       />
  //       <DisplayText className={classes.muted}>
  //         Strict match
  //       </DisplayText>
  //     </div>
  //   </div>}
  // </PaperWrapper>)
};

export default FilterCard;
