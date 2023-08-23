import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import { textExtractor } from "utils/services/helper_services/system_methods";
import {
  DisplayButton,
  DisplayEditor,
  DisplayFormControl,
  DisplayInput,
  DisplayHelperText,
  DisplayIconButton,
  DisplaySelect,
  DisplayText,
  DisplayTextEditor,
} from "../../display_components";
import { SystemReference } from "components/system_components";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { SystemLabel } from "../index";
import "./styles.css";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemDynamicList = (props) => {
  let { data, callbackValue, stateParams, callbackError } = props;
  let {
    displayOnCsv,
    placeHolder,
    type,
    visible,
    name,
    title,
    canUpdate,
    values,
    required,
    skipReadMode,
    description = "",
    ...rest
  } = props.fieldmeta;
  const { RemoveOutline, AddOutline } = SystemIcons;
  const [dataArray, setDataArray] = useState([]);
  const [error, setError] = useState(false);
  const [mount, setMount] = useState(false);
  const [helperText, setHelperText] = useState();
  let isReadMode = stateParams?.mode?.toLowerCase() == "read" && !skipReadMode;

  useEffect(() => {
    if (data) {
      setDataArray(data);
    }
  }, [JSON.stringify(data)]);

  useEffect(() => {
    if (mount) {
      SystemTimeout(() => {
        let errorCheck = dataArray.map((e) => {
          return Object.values(e).every((f) => {
            return f == "";
          });
        });

        let isrequiredFieldsNotFilled = values
          .filter((e) => e.required)
          .reduce((value, field) => {
            value = dataArray.map((e) =>
              ["", {}, null, undefined].includes(e[field.name])
            );
            return value.some((e) => e);
          }, false);

        if (errorCheck.every((e) => e)) {
          callbackError("Please fill all the required fields", props);
          showError("Please fill all the required fields");
        } else if (isrequiredFieldsNotFilled) {
          callbackError("Please fill all the required fields", props);
          showError("Please fill all the required fields");
        } else {
          callbackError(null, props);
          callbackValue(dataArray ? dataArray : null, props);
          if (required && !dataArray.length) {
            callbackError("(Required)", props);
            showError("(Required)");
          } else clearError();
        }
      }, 3000);
    }
  }, [JSON.stringify(dataArray)]);

  useEffect(() => {
    setMount(true);
    if (!data && required && !dataArray.length) {
      callbackError("(Required)", props);
      showError("(Required)");
    }
  }, []);

  const addNew = (e) => {
    e.preventDefault();
    let item = {};
    values.forEach((val) => {
      item[val.name] = "";
    });
    setDataArray([...dataArray, item]);
  };

  const handleObjects = (e, index, name) => {
    let values = [...dataArray];
    if (values[index]) values[index][name] = e;
    setDataArray(values);
  };

  const handleRemove = (index) => {
    let rows = [...dataArray];
    rows.splice(index, 1);
    setDataArray(rows);
  };

  const clearError = () => {
    setError(false);
    setHelperText();
  };

  const showError = (msg) => {
    setError(true);
    setHelperText(msg);
  };

  if (!isReadMode) {
    return (
      <div style={{ display: "flex", flex: 1 }}>
        <DisplayFormControl
          required={required}
          error={error}
          style={{ display: "flex", width: "100%" }}
        >
          <div
            className="system-label"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {/* <SystemLabel filled={true} style={{ fontSize: "15px" }}>
              {title}
            </SystemLabel> */}
            <DisplayButton
              onClick={addNew}
              variant={"contained"}
              size="small"
              style={{ height: "40px" }}
            >
              <AddOutline variant="primary" style={{ marginRight: "5px" }} />
              {`Add ${title}`}
            </DisplayButton>
            &emsp;
            {error && (
              <div className="system-helpertext">
                <DisplayHelperText icon={SystemIcons.Error}>
                  {helperText}
                </DisplayHelperText>
              </div>
            )}
          </div>
          <ToolTipWrapper
            title={description && description?.length > 57 ? description : ""}
            placement="bottom-start"
          >
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "pre",
                maxWidth: "70vw",
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
                {description && description}
              </DisplayText>
            </div>
          </ToolTipWrapper>
          <br />
          <div
            className="system-components"
            style={{ width: "1200px", overflowX: "scroll" }}
          >
            <form>
              <table className="table">
                <thead>
                  <tr>
                    {dataArray?.length > 0 &&
                      values.map((item) => {
                        return (
                          <th className="th">
                            <SystemLabel style={{ color: "black" }}>
                              {" "}
                              {item.title}
                            </SystemLabel>
                          </th>
                        );
                      })}
                    {dataArray?.length > 0 && (
                      <th className="th t_selector">
                        <SystemLabel style={{ color: "black" }}>
                          Action
                        </SystemLabel>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dataArray &&
                    dataArray.map((dataObj, index) => (
                      <tr className="tr" key={index}>
                        {values.map((item, idx) => {
                          switch (item.type) {
                            case "LIST":
                              return (
                                <td
                                  key={idx}
                                  className="td"
                                  style={{ minWidth: "250px" }}
                                >
                                  <DisplaySelect
                                    variant="standard"
                                    placeholder={item.placeHolder}
                                    required={item.required}
                                    disabled={!canUpdate || item.disabled}
                                    values={item.values}
                                    value={
                                      dataObj[item.name]
                                        ? dataObj[item.name]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      handleObjects(e, index, item.name)
                                    }
                                    valueKey="id"
                                    labelKey="value"
                                  ></DisplaySelect>
                                </td>
                              );
                            case "TEXTBOX":
                              return (
                                <td
                                  key={idx}
                                  className="td"
                                  style={{ minWidth: "250px" }}
                                >
                                  <DisplayInput
                                    variant="standard"
                                    placeholder={item.placeHolder}
                                    required={item.required}
                                    disabled={!canUpdate || item.disabled}
                                    value={
                                      dataObj[item.name]
                                        ? dataObj[item.name]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      handleObjects(e, index, item.name)
                                    }
                                  />
                                </td>
                              );
                            case "NUMBER":
                            case "DECIMAL":
                              return (
                                <td
                                  key={idx}
                                  className="td"
                                  style={{ minWidth: "250px" }}
                                >
                                  <DisplayInput
                                    variant="standard"
                                    placeholder={item.placeHolder}
                                    required={item.required}
                                    disabled={!canUpdate || item.disabled}
                                    type="number"
                                    value={
                                      dataObj[item.name]
                                        ? dataObj[item.name]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      handleObjects(
                                        isNaN(e) ? e : Number(e),
                                        index,
                                        item.name
                                      )
                                    }
                                  />
                                </td>
                              );
                            case "EDITOR": {
                              let Editor =
                                item.mode == "richText"
                                  ? DisplayTextEditor
                                  : DisplayEditor;
                              return (
                                <td
                                  key={idx}
                                  className="td"
                                  style={{ width: "450px", height: "200px" }}
                                >
                                  <Editor
                                    mode={item.mode}
                                    placeholder={item.placeHolder}
                                    required={item.required}
                                    disabled={!canUpdate || item.disabled}
                                    value={
                                      dataObj[item.name]
                                        ? dataObj[item.name]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      handleObjects(e, index, item.name)
                                    }
                                    style={{ width: "450px", height: "200px" }}
                                  />
                                </td>
                              );
                            }
                            case "REFERENCE": {
                              return (
                                <td
                                  key={idx}
                                  className="td"
                                  style={{ minWidth: "250px" }}
                                >
                                  <SystemReference
                                    stateParams="EDIT"
                                    fieldmeta={{ ...item, title: "" }}
                                    callbackError={() => {}}
                                    callbackValue={(value) => {
                                      if (value && Object.keys(value).length)
                                        handleObjects(value, index, item.name);
                                      else
                                        handleObjects(null, index, item.name);
                                    }}
                                    data={dataObj[item.name]}
                                  />
                                </td>
                              );
                            }
                          }
                        })}
                        {canUpdate === true && (
                          <td className="td t_selector">
                            <DisplayIconButton
                              size="small"
                              systemVariant="secondary"
                              onClick={() => handleRemove(index)}
                            >
                              <RemoveOutline style={{ fontSize: "20px" }} />
                            </DisplayIconButton>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </form>
          </div>
        </DisplayFormControl>
      </div>
    );
  }

  if (isReadMode) {
    return (
      <div style={{ display: "flex", flex: 1 }}>
        <DisplayFormControl style={{ display: "flex", width: "100%" }}>
          <div className="system-label">
            <SystemLabel>{title}</SystemLabel>
          </div>
          <div className="system-components">
            <form>
              <table className="table">
                <thead>
                  <tr className="tr">
                    {values.map((item) => {
                      return (
                        <th className="th">
                          <SystemLabel>{item.title}</SystemLabel>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {dataArray &&
                    dataArray.map((dataObj, index) => (
                      <tr className="tr" key={index}>
                        {values.map((item, idx) => {
                          return (
                            <td key={idx} className="td">
                              <DisplayText style={{ color: "rgba(97,97,97)" }}>
                                {textExtractor(dataObj[item.name], item)}
                              </DisplayText>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </form>
          </div>
        </DisplayFormControl>
      </div>
    );
  }
};

SystemDynamicList.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    displayOnCsv: true,
    required: true,
    visible: false,
  },
};
SystemDynamicList.propTypes = {
  data: PropTypes.array,
  fieldmeta: PropTypes.shape({
    displayOnCsv: PropTypes.bool,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    required: PropTypes.bool,
    canUpdate: PropTypes.bool,
  }),
};
export default GridWrapper(SystemDynamicList);
