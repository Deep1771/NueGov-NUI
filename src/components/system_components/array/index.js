import React, { useState, useEffect, useRef } from "react";
import { set } from "dot-object";
import { Iterator } from "containers/composite_containers/detail_container/components/iterator";
import {
  DisplayButton,
  DisplayCard,
  DisplayHelperText,
  DisplayText,
  DisplayIconButton,
} from "components/display_components";
import { isDefined } from "utils/services/helper_services/object_methods";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { v4 as uuidv4 } from "uuid";
import { SystemLabel } from "../index";
import { SystemIcons } from "utils/icons";
import { BubbleLoader } from "components/helper_components";

export const SystemArray = (props) => {
  const {
    fieldmeta,
    callbackValue,
    callbackError,
    data,
    stateParams,
    testid,
    fieldError,
  } = props;
  const { HighlightOff, Error, AddOutline } = SystemIcons;
  const {
    fields,
    name,
    label,
    labelSuffix,
    buttonLabel,
    cardContent,
    title,
    info,
    required,
    disable,
    canUpdate,
    minHeight,
    minWidth,
  } = fieldmeta;
  const [dataArray, setDataArray] = useState(data ? data : []);
  const [selected, setSelected] = useState(dataArray?.length ? 0 : null);
  const [message, setMessage] = useState();
  const [refresh, setRefresh] = useState(1);
  const [loading, setLoading] = useState(false);
  const [elementId, setElementId] = useState(data ? data.map((i) => i.id) : []);
  const errorObj = useRef({});

  const handleObjects = (fieldData, fieldProps) => {
    dataArray &&
      dataArray.map((each, index) => {
        if (index === selected) {
          each[fieldProps.fieldmeta.name] = fieldData;
          if (!isDefined(each[fieldProps.fieldmeta.name]))
            delete each[fieldProps.fieldmeta.name];
        }
      });
    setRefresh((prev) => prev + 1);
    callbackValue(dataArray?.length ? dataArray : null, props);
  };

  const handleError = (err, fieldProps) => {
    let { uniqueId } = fieldProps;
    let errors = errorObj.current;
    set(uniqueId, !!err, errors);

    //set form valid
    doUniqueCheck();
    if (Object.values(errors).every((eo) => !eo.some((e) => e))) {
      callbackError(null, props);
    } else callbackError("Required", props);

    //maintain error locally
    errorObj.current = errors;
  };

  const checkError = () => {
    dataArray &&
      dataArray.map((ed, index) =>
        fields.map((ef) => {
          if (ef.required && !isDefined(ed[ef.name])) {
            callbackError("Required", props);
          }
        })
      );
  };

  const renderIterator = () => {
    return dataArray?.map((dataObj, dataIndex) =>
      fields.map((ef, index) => {
        if (dataIndex === selected)
          return (
            <>
              <Iterator
                data={dataObj[ef.name]}
                fieldmeta={ef}
                compIndex={dataObj}
                uniqueId={selected + "[" + index + "]"}
                compName={name}
                callbackError={handleError}
                callbackValue={handleObjects}
                stateParams={stateParams}
                testid={stateParams.groupname + "-" + "section" + "-" + ef.name}
              />
            </>
          );
      })
    );
  };

  const addCard = () => {
    setLoading(true);
    let id = `${uuidv4()}`;
    let add = [...dataArray, {}];
    setSelected(add.length - 1);
    let errorId = [{ ...elementId, id: id }];
    let newData = {};
    fields.forEach((val) => {
      newData[val.name] = "";
    });
    let data = dataArray.concat(newData);
    setDataArray(data);
    setElementId(errorId);

    fields.some((ef) => ef.required) && callbackError("Required", props);
    setTimeout(() => {
      setLoading(false);
    }, 200);
  };

  const selectContent = (i) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSelected(i);
    }, 200);
  };

  const handleDelete = (e, index) => {
    e.stopPropagation();
    let filtered = dataArray.filter((ec, ind) => ind !== index);
    setDataArray(filtered);
    if (selected == index)
      setSelected(Math.abs(dataArray.indexOf(dataArray[index]) - 1));

    //delete error obj
    let errors = errorObj.current;
    delete errors[index];
    doUniqueCheck();
    if (Object.values(errors).every((eo) => !eo.some((e) => e))) {
      callbackError(null, props);
    }
    errorObj.current = errors;
  };

  const renderCardContent = (el) => {
    return cardContent?.map((i) => {
      let data = el[i.name];
      let fieldmeta = fields.find((ef) => ef.name === i.name);
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DisplayText>{i.title}</DisplayText>
          <DisplayText variant="h1">
            {data ? textExtractor(data, fieldmeta) : "--"}
          </DisplayText>
        </div>
      );
    });
  };

  const doUniqueCheck = () => {
    let uniqueFields = fields.filter((ef) => ef.isUnique);
    let labels = uniqueFields.map((ef) => ef.title).join(", ");
    if (uniqueFields.length) {
      let isNotUnique = uniqueFields.some(({ name }) => {
        let valueArr = dataArray.map((item) => item[name]?.toString());
        let isDuplicate = valueArr.some(
          (item, idx) => item && valueArr.indexOf(item) != idx
        );
        return isDuplicate;
      });

      if (isNotUnique) {
        setMessage(labels + " must be unique");
        callbackError("Required", props);
      } else {
        setMessage("");
        callbackError(null, props);
      }
    }
  };

  useEffect(() => {
    setDataArray(data ? data : []);
    setSelected(data?.length ? 0 : null);
  }, [data]);

  useEffect(() => {
    callbackValue(dataArray?.length ? dataArray : null, props);
    checkError();
    // Error Handling
    if (!dataArray?.length && required) {
      callbackError("Required", props);
      setMessage("Required");
    } else {
      setMessage("");
    }
  }, [dataArray]);

  return (
    <div
      style={{
        display: "inline-flex",
        flex: 20,
        flexFlow: "column",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {/* {title && (
          <SystemLabel
            toolTipMsg={info}
            required={required}
            filled={dataArray?.length}
            style={{ fontSize: "15px" }}
          >
            {title}
          </SystemLabel>
        )} */}
        {/* {stateParams.mode != "READ" && (
          <DisplayButton
            testid={testid + "Add"}
            variant="outlined"
            onClick={addCard}
            disabled={disable || !canUpdate}
            size="small"
            style={{ marginLeft: "16px" }}
          >
            {buttonLabel || `Add ${label || ""}`}
          </DisplayButton>
        )} */}
      </div>
      <div
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          flex: 2,
          gap: "10px",
        }}
      >
        {stateParams.mode != "READ" && (
          <DisplayButton
            testid={testid + "Add"}
            variant="contained"
            onClick={addCard}
            disabled={disable || !canUpdate}
            size="small"
            style={{
              marginLeft: "16px",
              display: "flex",
              alignSelf: "center",
              height: "40px",
            }}
          >
            <AddOutline variant="primary" style={{ marginRight: "5px" }} />
            {buttonLabel || `Add ${label || ""}`}
          </DisplayButton>
        )}
        <div
          className="hide_scroll"
          style={{
            display: "inline-flex",
            flex: 19,
            gap: "12px",
            overflowX: "scroll",
            overflowY: "hidden",
            whiteSpace: "nowrap",
            width: "500px",
            padding: "1px",
          }}
        >
          {dataArray?.map((i, index) => {
            let active = false;
            if (selected == index) active = true;
            else active = false;
            return (
              <div style={{ display: "flex", alignItems: "center" }}>
                <DisplayCard
                  testid={`addbutton-${testid}`}
                  onClick={() => {
                    selectContent(index);
                  }}
                  style={{
                    minHeight: minHeight ? minHeight : "20px",
                    maxHeight: "100%",
                    minWidth: minWidth ? minWidth : "20px",
                    maxWidth: "100%",
                    margin: "4px",
                    borderRadius: "10px",
                    padding: cardContent ? "10px" : "0px",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  systemVariant={!active ? "default" : "primary"}
                  elevation={4}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "3px",
                      flex: 20,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flex: 19,
                        alignItems: "center",
                        gap: "10px",
                        margin: "8px",
                      }}
                    >
                      <DisplayText>
                        {label ? label + " " : ""}
                        {/* {labelSuffix ? i[labelSuffix] : ""} */}
                        {!label && !i[labelSuffix] ? "--Fill Details--" : ""}
                      </DisplayText>
                      {Array.isArray(labelSuffix) &&
                        labelSuffix.map((e) => {
                          switch (e.type) {
                            case "TEXT":
                              return (
                                <DisplayText>
                                  {e.name ? i[e.name] : ""}
                                </DisplayText>
                              );
                            case "LIST_ICON":
                              return (
                                <>
                                  {i[e.name] && (
                                    <img
                                      style={{
                                        maxHeight: "46px",
                                        maxWidth: "46px",
                                      }}
                                      src={
                                        fields
                                          .find((f) => f.name === e.name)
                                          ?.values.find(
                                            (f) => f.id == i[e.name]
                                          )?.icon
                                      }
                                    />
                                  )}
                                </>
                              );
                          }
                        })}
                      {refresh && renderCardContent(i)}
                    </div>
                    <div
                      style={{
                        position: cardContent ? "absolute" : "unset",
                        right: 0,
                        top: 0,
                      }}
                    >
                      {stateParams.mode != "READ" && (
                        <DisplayIconButton
                          size="small"
                          testid={`closeButton-${testid}`}
                          onClick={(e) => {
                            handleDelete(e, index);
                          }}
                          style={{ padding: "0px 5px" }}
                          systemVariant={!active ? "primary" : "default"}
                        >
                          <HighlightOff />
                        </DisplayIconButton>
                      )}
                      {i?.required && <h2>hello.....</h2>}
                    </div>
                  </div>
                </DisplayCard>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flex: 18,
          flexDirection: "column",
        }}
      >
        {stateParams.mode != "READ" && (
          <div style={{ marginTop: "2px" }}>
            <DisplayHelperText icon={Error}>{message}</DisplayHelperText>
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {!loading && dataArray?.length > 0 && renderIterator()}
          {loading && <BubbleLoader />}
        </div>
      </div>
    </div>
  );
};

SystemArray.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    displayOnCsv: true,
    required: true,
    visible: false,
    label: "Item",
  },
};

export default GridWrapper(SystemArray);
