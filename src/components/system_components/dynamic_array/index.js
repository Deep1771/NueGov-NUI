import React, { useState, useEffect, useRef } from "react";
import { Iterator } from "containers/composite_containers/detail_container/components/iterator";
import {
  DisplayButton,
  DisplayIconButton,
  DisplayHelperText,
} from "components/display_components";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { v4 as uuidv4 } from "uuid";
import { SystemLabel } from "../index";
import { SystemIcons } from "utils/icons";

export const SystemDynamicArray = (props) => {
  const { fieldmeta, callbackValue, callbackError, data, stateParams } = props;
  const { Error, HighlightOff, RemoveOutline } = SystemIcons;
  const { fieldInfo, name, label, title, info, required, disable, canUpdate } =
    fieldmeta;
  const [dataArray, setDataArray] = useState([]);
  const [message, setMessage] = useState();
  const errorArray = useRef([]);

  const handleData = (fieldData, fieldProps) => {
    let { compIndex } = fieldProps;
    let errors = errorArray.current;
    let data = dataArray;
    data[compIndex] = fieldData;

    if (!fieldData && fieldInfo.required) {
      errors[compIndex] = true;
      errorArray.current = errors;
    } else {
      errors[compIndex] = false;
      errorArray.current = errors;

      if (errors.every((e) => e == false)) callbackError(null, props);
    }
  };

  const remove = (index) => {
    let data = [...dataArray];
    let errors = errorArray.current;
    data.splice(index, 1);
    setDataArray(data);

    // remove error
    if (errors[index]) {
      errors[index] = false;
      errorArray.current = errors;

      if (errors.every((e) => e == false)) callbackError(null, props);
    }
  };

  const handleError = (err, fieldProps) => {
    let { compIndex } = fieldProps;
    let errors = errorArray.current;
    errors[compIndex] = !!err;

    //set form valid
    if (errors.every((e) => e == false)) callbackError(null, props);

    //maintain error locally
    errorArray.current = errors;
  };

  const addCard = () => {
    let data = [...dataArray, null];
    setDataArray(data);

    if (fieldInfo.required) {
      let errors = errorArray.current;
      errors[dataArray.length] = true;
      errorArray.current = errors;
      callbackError("Required", props);
    }
  };

  useEffect(() => {
    callbackValue(dataArray.length ? dataArray : [], props);

    if (required && !dataArray.length) {
      callbackError("Required", props);
      setMessage("Required");
    } else {
      setMessage("");
    }
  }, [JSON.stringify(dataArray)]);

  useEffect(() => {
    setDataArray(data ? data : []);
  }, [name, data]);

  const renderIterator = () => {
    return dataArray.map((dataObj, index) => {
      return (
        <div
          style={{
            display: "flex",
            position: "relative",
            flexWrap: "wrap",
            // flex: "auto",
            width: "32%",
          }}
          key={index}
        >
          <div style={{ display: "flex", width: "100%", marginLeft: "-14px" }}>
            <Iterator
              data={dataObj ? dataObj : null}
              fieldmeta={{ ...fieldInfo, colSpan: 1 }}
              compIndex={index.toString()}
              compName={name}
              callbackError={handleError}
              callbackValue={handleData}
              stateParams={stateParams}
              testid={
                stateParams.groupname + "-" + "section" + "-" + fieldInfo.name
              }
            />
            <DisplayButton
              systemVariant="primary"
              variant="outlined"
              onClick={() => remove(index)}
              style={{
                margin: "22px 0px 0px -10px",
                height: "fit-content",
                alignSelf: "center",
                borderColor: "red",
              }}
            >
              <RemoveOutline style={{ color: "red" }} />
            </DisplayButton>
          </div>
        </div>
      );
    });
  };

  return (
    <div
      style={{
        display: "inline-flex",
        gap: "10px",
        flex: 20,
        flexFlow: "column",
        width: "100%",
      }}
    >
      {title && (
        <SystemLabel
          toolTipMsg={info}
          required={required}
          filled={dataArray.length}
        >
          {title}
        </SystemLabel>
      )}
      <div
        style={{
          display: "flex",
          flex: 18,
          flexDirection: "column",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignSelf: "flex-start" }}>
          <div style={{ display: "flex", flex: 1 }}>
            <DisplayButton
              variant="outlined"
              onClick={addCard}
              disabled={disable || !canUpdate}
            >
              {label}
            </DisplayButton>
          </div>
        </div>
        <div style={{ marginTop: "2px" }}>
          <DisplayHelperText icon={Error}>{message}</DisplayHelperText>
        </div>
        <div
          style={{
            display: "flex",
            // justifyContent: "center",
            width: "100%",
            flexWrap: "wrap",
            columnGap: "22px",
          }}
        >
          {renderIterator()}
        </div>
      </div>
    </div>
  );
};

SystemDynamicArray.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    displayOnCsv: true,
    required: true,
    visible: false,
  },
};

export default GridWrapper(SystemDynamicArray);
