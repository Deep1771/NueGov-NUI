import React, { useState, useEffect, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import { SystemLabel } from "../index";
import {
  DisplayAutocomplete,
  DisplayFormControl,
  DisplayGrid,
  DisplayHelperText,
  DisplayText,
} from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemPairedList = (props) => {
  let { callbackValue, callbackError, data, fieldError, callFrom, testid } =
    props;
  let fieldmeta = {
    ...SystemPairedList.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    canUpdate,
    disable,
    displayTitle,
    info,
    required,
    labels,
    level,
    title,
    values,
    ...others
  } = fieldmeta;
  let { displayOnCsv, visible, visibleOnCsv, ...rest } = others;

  const [arrayValues, setArrayValues] = useState([]);
  const [error, setError] = useState(false);
  const [fieldLabels, setFieldLabels] = useState([]);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState({});
  const displaytitle = typeof displayTitle === "boolean" ? displayTitle : true;

  // Setters
  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };
  const dataInit = (data) => {
    setSelected(data);
    arrayValues.splice(0);
    constructValueArray(values);
    callbackValue(data && Object.keys(data).length ? data : null, props);
    validateData(data);
  };
  const showError = (msg) => {
    callbackError(msg, props);
    setError(true);
    setHelperText(msg);
  };

  // Custom Functions
  const constructLabelArray = (label) => {
    if (label) {
      if (Object.keys(label).find((key) => key === "child")) {
        let tempObj = { ...label };
        if (tempObj.child) delete tempObj.child;
        setFieldLabels((fieldLabels) => [...fieldLabels, tempObj]);
        constructLabelArray(label.child);
      } else setFieldLabels((fieldLabels) => [...fieldLabels, label]);
    }
  };

  const constructValueArray = (values) => {
    values &&
      values.map((item) => {
        if (
          data &&
          Object.values(data)
            .map((i) => i.name)
            .includes(item.name)
        ) {
          arrayValues.push(item);
          item.child && constructValueArray(item.child);
        }
      });
  };
  const constructData = (array) => {
    // Constructing updated data
    array.map((item, i) => {
      let temp = { ...item };
      let obj = removeData(i);
      if (temp.child) delete temp.child;
      setSelected({ ...obj, [fieldLabels[i].name]: temp });
    });
  };

  const onChange = (event, value, props) => {
    let index = props.labelindex;
    if (value !== null) {
      if (!arrayValues.map((i) => i.name).includes(value.name)) {
        arrayValues.splice(index, arrayValues.length, value);
        constructData(arrayValues, index);
        arrayValues && arrayValues[index].child
          ? required
            ? showError("Required")
            : showError("Select the data")
          : clearError();
      }
    } else {
      required
        ? showError("Required")
        : index > 0
        ? showError("Select the data")
        : clearError();
      arrayValues.splice(index, arrayValues.length);
      setSelected(removeData(index - 1));
    }
  };

  const removeData = (index) => {
    //Removing unwanted data
    let tempArray = fieldLabels.slice(index + 1).map((a) => a.name);
    let obj = { ...selected };
    tempArray.map((a) => delete obj[a]);
    return obj;
  };

  const validateData = (data) => {
    if (data) {
      if (Object.values(data).length) {
        if (required) {
          arrayValues.find(
            (i) =>
              i.name ===
              Object.values(data)[Object.values(data).length - 1].name
          )?.child
            ? showError("Required")
            : clearError();
        } else {
          arrayValues.find(
            (i) =>
              i.name ===
              Object.values(data)[Object.values(data).length - 1].name
          )?.child
            ? showError("Select the data")
            : clearError();
        }
      }
    } else {
      required ? showError("Required") : clearError();
    }
  };

  // UseEffects
  useLayoutEffect(() => {
    constructLabelArray(labels);
    if (fieldError) showError(fieldError);
    data && dataInit(data);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    mounted && dataInit(data);
  }, [data]);

  useEffect(() => {
    callbackValue(
      selected && Object.values(selected).length ? selected : null,
      props
    );
  }, [selected]);

  return (
    <div
      style={{
        display: "flex",
        flex: "1",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <DisplayFormControl
        required={required}
        disabled={!canUpdate || disable}
        testid={testid}
      >
        <div className="system-components">
          {title && displaytitle && (
            <DisplayText
              style={{
                color: "#5F6368",
                fontWeight: "400",
                fontSize: "12px",
              }}
            >
              {title}
            </DisplayText>
          )}
          <div style={{ display: "flex" }}>
            {fieldLabels.map((item, i) => {
              let items =
                i === 0
                  ? values
                  : arrayValues[i - 1]
                  ? arrayValues.find((v) => v.name === arrayValues[i - 1].name)
                      .child
                  : [];
              let dflag = items ? !items.length : true;
              return (
                <>
                  <div
                    item
                    style={{
                      display: "flex",
                      flex: 1,
                      flexDirection: "column",
                    }}
                    key={i}
                  >
                    <div style={{ display: "flex" }}>
                      <DisplayText
                        style={{
                          color: "#5F6368",
                          fontWeight: "400",
                          fontSize: "12px",
                          paddingBottom: "4px",
                        }}
                      >
                        {item.title}
                      </DisplayText>
                      &nbsp;&nbsp;
                      {error && (
                        <DisplayHelperText icon={SystemIcons.Error}>
                          ({helperText})
                        </DisplayHelperText>
                      )}
                    </div>
                    <DisplayAutocomplete
                      key={i}
                      labelindex={i}
                      options={items ? items : []}
                      value={{ name: arrayValues[i] && arrayValues[i].name }}
                      labelKey={"name"}
                      testid={`${fieldmeta.name}-${item.name}`}
                      selectedKey={null}
                      hiddenLabel={true}
                      placeholder={item.placeHolder}
                      disabled={!canUpdate || disable || dflag}
                      required={required && !dflag}
                      onChange={(event, val, props) => {
                        onChange(event, val, props);
                      }}
                      callFrom={callFrom}
                      variant="outlined"
                      InputProps={{ ...globalProps.InputProps }}
                      {...rest}
                    />
                  </div>
                  &nbsp;&nbsp;
                </>
              );
            })}
          </div>
        </div>
        <ToolTipWrapper
          title={
            fieldmeta?.description?.length > 57 ? fieldmeta?.description : ""
          }
          placement="bottom-start"
        >
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "pre",
              maxWidth: "100%",
              fontSize: "11px",
              opacity: "0.65",
              height: "16px",
            }}
          >
            <DisplayText
              style={{
                fontSize: "11px",
              }}
            >
              {fieldmeta?.description}
            </DisplayText>
          </div>
        </ToolTipWrapper>
      </DisplayFormControl>
    </div>
  );
};

SystemPairedList.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    required: false,
    visible: false,
    visibleOnCsv: false,
  },
};

SystemPairedList.propTypes = {
  data: PropTypes.object,
  fieldmeta: PropTypes.shape({
    canUpdate: PropTypes.bool,
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    labels: PropTypes.object.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    values: PropTypes.array.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemPairedList);
