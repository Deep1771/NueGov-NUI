import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DisplayButton,
  DisplayGrid,
  DisplayFormControl,
  DisplayInput,
  DisplayModal,
  DisplayText,
  DisplayIconButton,
  DisplayHelperText,
  DisplayCheckbox,
} from "../../display_components";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { ToolTipWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import { SystemLabel } from "../index";
import "./styles.css";

export const SystemCamera = (props) => {
  let { data, callbackValue, callbackError, fieldError, testid, stateParams } =
    props;
  let fieldmeta = {
    ...SystemCamera.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    canUpdate,
    defaultValue,
    disable,
    displayOnCsv,
    name,
    placeHolder,
    required,
    title,
    type,
    visible,
    skipReadMode,
    ...others
  } = fieldmeta;

  let [isViewerOpen, setIsViewerOpen] = useState(false);
  let [currentImage, setCurrentImage] = useState(0);
  let [valueArray, setValueArray] = useState([]);
  let [checkAll, setCheckAll] = useState(true);
  let [helperText, setHelperText] = useState();
  let [error, setError] = useState(false);
  let [index, setIndex] = useState(0);
  let [dataArray, setDataArray] = useState([]);
  let [val, setVal] = useState();

  let { ArrowBackIos, ArrowForwardIos, Close } = SystemIcons;

  let checkSelected = (val) => valueArray.some((a) => a === val);
  let findValueIndex = (val) => valueArray.findIndex((a) => a === val);
  let isReadMode = stateParams.mode.toLowerCase() == "read" && !skipReadMode;

  const clearError = () => {
    setError(false);
    setHelperText();
    callbackError(null, props);
  };

  const showError = (msg) => {
    setError(true);
    setHelperText(msg);
    callbackError(msg, props);
  };

  const openImageViewer = useCallback((index) => {
    setCurrentImage(index);
    setIndex(index);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  const addNew = (e) => {
    e.preventDefault();
    let item = {
      url: "",
      description: "",
    };
    setDataArray([...dataArray, item]);
  };

  const handleUrl = (ind) => (value) => {
    setVal(value);
    setDataArray((prevDat) => {
      return prevDat.map((eachObj, i) => {
        if (ind === i) {
          return { ...prevDat[i], url: value };
        } else return eachObj;
      });
    });
  };

  const handleDescription = (ind) => (value) => {
    setDataArray((prevDat) => {
      return prevDat.map((eachObj, i) => {
        if (ind === i) {
          return { ...prevDat[i], description: value };
        } else return eachObj;
      });
    });
  };

  const handleChange = (flag, val) => {
    let arr = [];
    if (!flag) {
      arr = [...valueArray];
      arr.splice(findValueIndex(val), 1);
    } else arr = [...valueArray, val];
    setValueArray(arr);
  };

  const handleRemove = () => {
    let rows = [...dataArray];
    let newArrayList = [];
    if (rows.length === valueArray.length) {
      setDataArray([]);
      setValueArray([]);
    } else {
      newArrayList = rows.filter((item, indx) => !valueArray.includes(indx));
      setDataArray(newArrayList);
      setValueArray([]);
    }
  };

  const selectAll = () => {
    if (checkAll) {
      let x = [];
      dataArray.map((v, i) => x.push(i));
      setValueArray(x);
      setCheckAll(false);
    } else {
      setValueArray([]);
      setCheckAll(true);
    }
  };

  useEffect(() => {
    if (data) setDataArray(data);
  }, []);

  useEffect(() => {
    callbackValue(dataArray.length > 0 ? dataArray : null, props);
    if (!isReadMode && required && !val && !dataArray.length) {
      showError("Required");
    } else clearError();
  }, [dataArray, val]);

  return (
    <div style={{ display: "flex", flex: 1 }}>
      <DisplayFormControl
        testid={testid}
        disabled={!canUpdate || disable}
        required={required}
        error={error}
      >
        <div className="system-label">
          {!isReadMode ? (
            <SystemLabel
              required={required}
              error={error}
              filled={(!error && dataArray.length) || val}
            >
              {title}
            </SystemLabel>
          ) : (
            <SystemLabel required={false} style={{ color: "#666666" }}>
              {title}
            </SystemLabel>
          )}
        </div>
        <div className="system-components">
          <form onSubmit={addNew}>
            <table className="table">
              <thead>
                {" "}
                {dataArray.length > 0 && (
                  <tr className="tr">
                    {!isReadMode && (
                      <th className="th">
                        <DisplayCheckbox onChange={selectAll} size="small" />
                      </th>
                    )}
                    {!isReadMode ? (
                      <>
                        <th className="th">
                          <SystemLabel
                            required={false}
                            filled={dataArray.length || val}
                          >
                            URL
                          </SystemLabel>
                        </th>
                        <th className="th">
                          <SystemLabel
                            required={false}
                            filled={dataArray.length || val}
                          >
                            Description
                          </SystemLabel>
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="th">
                          <SystemLabel
                            required={false}
                            style={{ color: "#666666" }}
                          >
                            URL
                          </SystemLabel>
                        </th>
                        <th className="th">
                          <SystemLabel
                            required={false}
                            style={{ color: "#666666" }}
                          >
                            Description
                          </SystemLabel>
                        </th>
                      </>
                    )}
                  </tr>
                )}
              </thead>
              <tbody>
                {dataArray &&
                  dataArray.map((val, index) => (
                    <tr className="tr" key={index}>
                      {(!isReadMode || !canUpdate || disable) && (
                        <td className="td">
                          <DisplayCheckbox
                            checked={checkSelected(index)}
                            onChange={(value) => {
                              handleChange(value, index);
                            }}
                            size="small"
                          />
                        </td>
                      )}
                      <td className="td">
                        <DisplayInput
                          variant="outlined"
                          disabled={isReadMode || !canUpdate || disable}
                          onChange={handleUrl(index)}
                          value={val.url ? val.url : ""}
                          type="text"
                          placeholder="Enter the url"
                          key={index}
                        />
                      </td>
                      <td className="td">
                        <DisplayInput
                          variant="outlined"
                          disabled={isReadMode || !canUpdate || disable}
                          onChange={handleDescription(index)}
                          value={val.description ? val.description : ""}
                          rowsMin={3}
                          placeholder="Enter the description"
                          key={index + 1}
                        />
                      </td>
                      <td className="td">
                        <ToolTipWrapper title="Click here to view">
                          <img
                            src={val.url}
                            onClick={() => openImageViewer(index)}
                            style={{ height: "50px", width: "50px" }}
                            alt=""
                          />
                        </ToolTipWrapper>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!isReadMode && (
              <div>
                {dataArray.length > 0 && (
                  <DisplayButton
                    disabled={!canUpdate || disable || !valueArray.length}
                    style={{ float: "right" }}
                    onClick={handleRemove}
                  >
                    Remove
                  </DisplayButton>
                )}
                <DisplayButton
                  testid={`${fieldmeta.name}-add`}
                  disabled={
                    !canUpdate ||
                    disable ||
                    (dataArray.length > 0 &&
                      dataArray[dataArray.length - 1].url === "")
                  }
                  type="submit"
                  style={{ float: "right" }}
                >
                  Add
                </DisplayButton>
              </div>
            )}
          </form>
          <DisplayModal
            open={isViewerOpen}
            onClose={closeImageViewer}
            maxWidth="sm"
          >
            <DisplayGrid container backgroundColor="red">
              <DisplayGrid item xs={1}>
                <DisplayIconButton
                  onClick={() => {
                    index !== 0 && setIndex(index - 1);
                  }}
                  systemVariant="primary"
                  style={{
                    float: "left",
                    top: "152px",
                    backgroundColor: "white",
                    opacity: "0.5",
                  }}
                >
                  <ArrowBackIos fontSize="large" />
                </DisplayIconButton>
              </DisplayGrid>

              <DisplayGrid item xs={10}>
                <img
                  src={dataArray.length && dataArray && dataArray[index].url}
                  onClose={closeImageViewer}
                  style={{
                    height: "400px",
                    width: "610px",
                    marginLeft: "-60px",
                    marginTop: "-10px",
                  }}
                  alt=""
                />
              </DisplayGrid>

              <DisplayGrid item xs={1}>
                <DisplayIconButton
                  onClick={closeImageViewer}
                  style={{ float: "right", opacity: "0.5" }}
                  systemVariant="primary"
                >
                  <Close />
                </DisplayIconButton>
                <DisplayIconButton
                  onClick={() => {
                    dataArray.length > index + 1 && setIndex(index + 1);
                  }}
                  systemVariant="primary"
                  style={{
                    float: "right",
                    top: "100px",
                    backgroundColor: "white",
                    opacity: "0.5",
                  }}
                >
                  <ArrowForwardIos fontSize="large" />
                </DisplayIconButton>
              </DisplayGrid>
            </DisplayGrid>
          </DisplayModal>
        </div>
        {error && (
          <div className="system-helpertext">
            <DisplayHelperText icon={SystemIcons.Info}>
              {helperText}
            </DisplayHelperText>
          </div>
        )}
      </DisplayFormControl>
    </div>
  );
};

SystemCamera.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    displayOnCsv: true,
    required: true,
    visible: false,
  },
};
SystemCamera.propTypes = {
  data: PropTypes.array,
  fieldmeta: PropTypes.shape({
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    displayOnCsv: PropTypes.bool,
    visible: PropTypes.bool,
  }),
};
export default GridWrapper(SystemCamera);
