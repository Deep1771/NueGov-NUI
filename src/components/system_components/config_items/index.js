import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  DisplayDatePicker,
  DisplayInput,
  DisplaySelect,
  DisplayRadiobox,
  DisplayMultiSelect,
  DisplayRadioGroup,
  DisplayText,
  DisplayButton,
  DisplayModal,
  DisplayTime,
} from "components/display_components/";
import { UserFactory, ThemeFactory } from "utils/services/factory_services";
import { useAssessmentState } from "nueassist/containers/extension_containers/assessement_panel/reducer";
import {
  getExistingAi,
  modifyCpiConfig,
} from "nueassist/containers/extension_containers/assessement_panel/services";
import { isDefined } from "utils/services/helper_services/object_methods";
import { styles } from "nueassist/containers/extension_containers/assessement_panel/panels/styles";
import { SystemIcons } from "utils/icons";

const useStyles = makeStyles(styles);

const SystemConfigItems = (props) => {
  const [{ selectedCPI, communityAssessment, selectedTemplate }] =
    useAssessmentState();
  const classes = useStyles();
  let { Info, CloseOutlined } = SystemIcons;
  const { getVariantObj } = ThemeFactory();
  const { dark } = getVariantObj("primary");

  const QUERY = {
    appname: "NueAssist",
    modulename: "AssessmentConfig",
  };

  const { checkWriteAccess } = UserFactory();
  const canWrite = checkWriteAccess({
    ...QUERY,
    entityname: "ResidentAssessment",
  });

  const { cpi, checkBoxSelected, aiConfigState, setAiConfig } = props;
  const { carePlanItemConfig: cpiConfig, assessmentItemConfig: aiConfig } = cpi;
  const [singleSelectValue, setSingleSelectValue] = useState({});
  const [multiSelectArr, setMultiSelectArr] = useState({});
  const [textValue, setTextValue] = useState({});
  const [booleanVal, setBooleanVal] = useState({});
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [existedData, setExistedData] = useState([]);
  const selectedTextRef = useRef({});
  const selectedDateRef = useRef("");
  const selectedTimeRef = useRef("");
  const selectedMultiValueRef = useRef({});
  const selectedSingleSelectRef = useRef({});
  const selectedBooleanRef = useRef({});
  const selectedAiRef = useRef([]);
  const [openModal, setOpenModal] = useState(false);
  const [desc, setDesc] = useState("");

  let filterSelectedItems = selectedCPI.filter((item) => item.id == cpi.id);
  let filteredCpi =
    filterSelectedItems.length && filterSelectedItems[0]?.carePlanItemConfig;
  let filteredAIC =
    (existedData.length && existedData[0]?.assessmentItemConfig) ||
    (filterSelectedItems.length &&
      filterSelectedItems[0]?.assessmentItemConfig) ||
    [];

  selectedAiRef.current = filteredAIC;
  const onSingleSelect = (data, config) => {
    if (isDefined(data)) {
      let newObj = {
        ...singleSelectValue,
        [config.id]: data,
      };
      config.value = data;
      setSingleSelectValue(newObj);
      selectedSingleSelectRef.current = newObj;
    } else {
      let newObj = {
        ...singleSelectValue,
        [config.id]: "",
      };
      config.value = "";
      delete newObj[config.id];
      setSingleSelectValue(newObj);
      selectedSingleSelectRef.current = newObj;
    }
  };
  const onMultiSelect = (data, config) => {
    if (isDefined(data)) {
      let newObj = {
        ...multiSelectArr,
        [config.id]: [...data],
      };
      let delArr = [];
      let delimiterFormat = data.map((item, index) => {
        if (index == data.length - 1) {
          delArr.push(item);
        } else {
          delArr.push(item + "::");
        }
      });
      let delFormat = delArr.join(" ");
      config.value = delFormat;
      setMultiSelectArr(newObj);
      selectedMultiValueRef.current = newObj;
    } else {
      let newObj = {
        ...multiSelectArr,
        [config.id]: data,
      };
      config.value = "";
      delete newObj[config.id];
      setMultiSelectArr(newObj);
      selectedMultiValueRef.current = newObj;
    }
  };

  const onTextArea = (data, config) => {
    if (isDefined(data)) {
      let newObj = {
        ...textValue,
        [config.id]: data,
      };
      config.value = data;
      setTextValue(newObj);
      selectedTextRef.current = newObj;
    } else {
      let newObj = {
        ...textValue,
      };
      config.value = "";
      delete newObj[config.id];
      setTextValue(newObj);
      selectedTextRef.current = newObj;
    }
  };

  const onBooleanChange = (data, config) => {
    if (isDefined(data)) {
      let newObj = {
        ...booleanVal,
        [config.id]: data,
      };
      config.value = data;
      setBooleanVal(newObj);
      selectedBooleanRef.current = newObj;
    } else {
      let newObj = {
        ...booleanVal,
      };
      config.value = "";
      delete newObj[config.id];
      setBooleanVal(newObj);
      selectedBooleanRef.current = newObj;
    }
  };

  const onDateChange = (val, config) => {
    if (isDefined(val)) {
      val = val.toISOString();
      let newObj = {
        ...dateValue,
        [config.id]: val,
      };
      config.value = val;
      setDateValue(newObj);
      selectedDateRef.current = newObj;
    } else {
      let newObj = {
        ...dateValue,
      };
      config.value = "";
      delete newObj[config.id];
      setDateValue(newObj);
      selectedDateRef.current = newObj;
    }
  };

  const onTimeChange = (val, config) => {
    if (isDefined(val)) {
      val = val.toISOString();
      let newObj = {
        ...timeValue,
        [config.id]: val,
      };
      config.value = val;
      setTimeValue(newObj);
      selectedTimeRef.current = newObj;
    } else {
      let newObj = {
        ...timeValue,
      };
      config.value = "";
      delete newObj[config.id];
      setTimeValue(newObj);
      selectedTimeRef.current = newObj;
    }
  };

  const valueFunction = () => {
    if (filteredCpi?.length || aiConfigState?.length) {
      (filteredCpi || aiConfigState).map((item) => {
        switch (item?.type?.toUpperCase()) {
          case "SINGLEVALUE":
            setSingleSelectValue((prevState) => ({
              ...prevState,
              [item.id]: item.value
                ? item.value
                : selectedSingleSelectRef.current[item.id] || [],
            }));
          case "MULTIVALUE": {
            let res =
              item?.value
                ?.split("::")
                .map((item) => item.trim())
                .filter((item) => item) || [];
            setMultiSelectArr((prevState) => ({
              ...prevState,
              [item.id]: res.length
                ? res
                : selectedMultiValueRef.current[item.id] || [],
            }));
          }
          case "TEXTAREA":
            setTextValue((prevState) => ({
              ...prevState,
              [item.id]: item.value
                ? item.value
                : selectedTextRef.current[item.id],
            }));
          case "BOOLEAN":
            setBooleanVal((prevState) => ({
              ...prevState,
              [item.id]: item.value
                ? item.value
                : selectedBooleanRef.current[item.id],
            }));
          case "DATE":
            setDateValue((prevState) => ({
              ...prevState,
              [item.id]: item.value
                ? item.value
                : selectedDateRef.current[item.id],
            }));
          case "TIME":
            setTimeValue((prevState) => ({
              ...prevState,
              [item.id]: item.value
                ? item.value
                : selectedTimeRef.current[item.id],
            }));
            break;
        }
      });
    } else {
      setSingleSelectValue({});
      setMultiSelectArr({});
      setTextValue({});
      selectedMultiValueRef.current = {};
      selectedSingleSelectRef.current = {};
      selectedTextRef.current = "";
      selectedBooleanRef.current = "";
      selectedDateRef.current = "";
      selectedTimeRef.current = "";
    }
  };
  let computeWidth = (config) => {
    if (config.label.length > 35 && config.label.length < 50) {
      return "49%";
    } else if (config.nextLine || config.label.length > 50) {
      return "100%";
    } else {
      return "49%";
    }
  };

  useEffect(() => {
    if (filteredAIC.length || selectedAiRef.current.length) {
      setAiConfig(filteredAIC || selectedAiRef.current);
    }
    valueFunction();
  }, [JSON.stringify(existedData), filteredCpi, JSON.stringify(aiConfigState)]);
  useEffect(() => {
    let existedCPI = getExistingAi(
      communityAssessment,
      cpi.assessmentItem || cpi.id
    );
    setExistedData(existedCPI);
    modifyCpiConfig(selectedTemplate, communityAssessment);
  }, [JSON.stringify(communityAssessment)]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        flexWrap: "wrap",
        columnGap: "2%",
        rowGap: "20px",
      }}
    >
      {(cpiConfig || aiConfig)?.map((config) => {
        let array = [];
        if (
          (config?.type?.toUpperCase() == "MULTIVALUE" ||
            config?.type?.toUpperCase() == "SINGLEVALUE") &&
          config.values != ""
        ) {
          if (canWrite) {
            let res = config?.values?.split("::")?.map((res) => {
              let data = {
                value: res.trim(),
                id: res.trim(),
              };
              array.push(data);
            });
          } else {
            if (config.value != "") {
              let res = config?.value?.split("::")?.map((res) => {
                let data = {
                  value: res,
                  id: res,
                };
                array.push(data);
              });
            }
          }
        }
        switch (config?.type?.toUpperCase()) {
          case "SINGLEVALUE":
            return (
              array.length > 0 && (
                <div
                  style={{
                    width: computeWidth(config),
                    order: config?.order,
                  }}
                >
                  {" "}
                  <div style={{ display: "flex" }}>
                    {config?.description && (
                      <Info
                        onClick={(e) => {
                          setOpenModal(true);
                          setDesc(config?.description);
                        }}
                        fontSize="small"
                        style={{
                          cursor: "pointer",
                          color: props?.dark?.bgColor,
                        }}
                      />
                    )}
                    &nbsp;&nbsp;
                    <span
                      style={{
                        textOverflow: "ellipsis",
                        whiteSpace: "pre",
                        overflow: "hidden",
                      }}
                    >
                      <DisplayText
                        style={{
                          color: "#5F6368",
                          fontWeight: "400",
                          fontSize: "12px",
                          paddingBottom: "4px",
                        }}
                      >
                        {config?.label}
                      </DisplayText>
                    </span>
                  </div>
                  <DisplaySelect
                    style={{
                      width: config.nextLine || config.label ? "100%" : "20vw",
                    }}
                    labelKey="value"
                    valueKey="id"
                    values={array}
                    multiple={false}
                    onChange={(val) => onSingleSelect(val, config)}
                    value={
                      canWrite
                        ? checkBoxSelected
                          ? singleSelectValue[config.id] || []
                          : []
                        : array.map((item) => item.value)
                    }
                    variant="outlined"
                    // label={config?.label}
                    disabled={
                      !canWrite || !checkBoxSelected || !props?.aiSelected
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </div>
              )
            );

          case "MULTIVALUE":
            return (
              array.length > 0 && (
                <div
                  style={{
                    order: config?.order,
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    {config?.description && (
                      <Info
                        onClick={(e) => {
                          setOpenModal(true);
                          setDesc(config?.description);
                        }}
                        fontSize="small"
                        style={{
                          cursor: "pointer",
                          color: props?.dark?.bgColor,
                        }}
                      />
                    )}
                    &nbsp;&nbsp;
                    <span
                      style={{
                        textOverflow: "ellipsis",
                        whiteSpace: "pre",
                        overflow: "hidden",
                      }}
                    >
                      <DisplayText
                        style={{
                          color: "#5F6368",
                          fontWeight: "400",
                          fontSize: "12px",
                          paddingBottom: "4px",
                        }}
                      >
                        {config?.label}
                      </DisplayText>
                    </span>
                  </div>
                  <DisplayMultiSelect
                    style={{ width: "100%" }}
                    values={array}
                    onChange={(val) => onMultiSelect(val, config)}
                    value={
                      canWrite
                        ? multiSelectArr[config.id] || []
                        : array.map((item) => item.value)
                    }
                    variant="outlined"
                    // label={config?.label}
                    disabled={
                      !canWrite || !checkBoxSelected || !props?.aiSelected
                    }
                  />
                </div>
              )
            );
          case "TEXTAREA":
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  order: config?.order,
                  width: "100%",
                }}
              >
                <div style={{ display: "flex" }}>
                  {config?.description && (
                    <Info
                      onClick={(e) => {
                        setOpenModal(true);
                        setDesc(config?.description);
                      }}
                      fontSize="small"
                      style={{ cursor: "pointer", color: props?.dark?.bgColor }}
                    />
                  )}
                  &nbsp;&nbsp;
                  <span
                    style={{
                      textOverflow: "ellipsis",
                      whiteSpace: "pre",
                      overflow: "hidden",
                    }}
                  >
                    <DisplayText
                      style={{
                        color: "#33333",
                        fontWeight: "400",
                        fontSize: "12px",
                        paddingBottom: "4px",
                      }}
                    >
                      {config?.label}
                    </DisplayText>
                  </span>
                </div>
                <DisplayInput
                  multiline
                  style={{ width: "100%" }}
                  testid={textValue}
                  // label={config?.label}
                  onChange={(val) => onTextArea(val, config)}
                  value={canWrite ? textValue[config.id] || "" : config.value}
                  variant="outlined"
                  disabled={
                    !canWrite || !checkBoxSelected || !props?.aiSelected
                  }
                  name={config.id}
                  rows={config.rows}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
            );
          case "BOOLEAN":
            return (
              <div
                style={{
                  order: config?.order,
                  width: computeWidth(config),
                }}
              >
                <div style={{ display: "flex" }}>
                  {config?.description && (
                    <Info
                      onClick={(e) => {
                        setOpenModal(true);
                        setDesc(config?.description);
                      }}
                      fontSize="small"
                      style={{ cursor: "pointer", color: props?.dark?.bgColor }}
                    />
                  )}
                  &nbsp;&nbsp;
                  <span
                    style={{
                      textOverflow: "ellipsis",
                      whiteSpace: "pre",
                      overflow: "hidden",
                    }}
                  >
                    <DisplayText
                      style={{
                        color: "#5F6368",
                        fontWeight: "400",
                        fontSize: "12px",
                        paddingBottom: "4px",
                      }}
                    >
                      {config?.label}
                    </DisplayText>
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <DisplayRadioGroup
                    style={{
                      width: config.nextLine || config.label ? "100%" : "20vw",
                    }}
                    row
                    value={
                      canWrite ? booleanVal[config.id] || "" : config.value
                    }
                    onChange={(val) =>
                      onBooleanChange(val.target.value, config)
                    }
                  >
                    <DisplayRadiobox
                      label={"Yes"}
                      value={"yes"}
                      disabled={!canWrite || !checkBoxSelected}
                    />
                    <DisplayRadiobox
                      label={"No"}
                      value={"No"}
                      disabled={
                        !canWrite || !checkBoxSelected || !props?.aiSelected
                      }
                    />
                  </DisplayRadioGroup>
                </div>
              </div>
            );
          case "DATE":
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: computeWidth(config),
                  order: config?.order,
                }}
              >
                <div style={{ display: "flex" }}>
                  {config?.description && (
                    <Info
                      onClick={(e) => {
                        setOpenModal(true);
                        setDesc(config?.description);
                      }}
                      fontSize="small"
                      style={{ cursor: "pointer", color: props?.dark?.bgColor }}
                    />
                  )}
                  &nbsp;&nbsp;
                  <span
                    style={{
                      textOverflow: "ellipsis",
                      whiteSpace: "pre",
                      overflow: "hidden",
                    }}
                  >
                    <DisplayText
                      style={{
                        color: "#5F6368",
                        fontWeight: "400",
                        fontSize: "12px",
                        paddingBottom: "4px",
                      }}
                    >
                      {config?.label}
                    </DisplayText>
                  </span>
                </div>
                <DisplayDatePicker
                  format={"MM/dd/yyyy"}
                  onChange={(val) => {
                    onDateChange(val, config);
                  }}
                  value={canWrite ? dateValue[config.id] || "" : config.value}
                  disabled={
                    !canWrite || !checkBoxSelected || !props?.aiSelected
                  }
                  InputAdornmentProps={{ position: "start" }}
                  inputVariant="outlined"
                  inputProps={{ disabled: true }}
                  invalidDateMessage=""
                  callFrom={"nueassist"}
                />
              </div>
            );

          case "TIME":
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: computeWidth(config),
                  order: config?.order,
                }}
              >
                <div style={{ display: "flex" }}>
                  {config?.description && (
                    <Info
                      onClick={(e) => {
                        setOpenModal(true);
                        setDesc(config?.description);
                      }}
                      fontSize="small"
                      style={{ cursor: "pointer", color: props?.dark?.bgColor }}
                    />
                  )}
                  &nbsp;&nbsp;
                  <span
                    style={{
                      textOverflow: "ellipsis",
                      whiteSpace: "pre",
                      overflow: "hidden",
                    }}
                  >
                    <DisplayText
                      style={{
                        color: "#5F6368",
                        fontWeight: "400",
                        fontSize: "12px",
                        paddingBottom: "4px",
                      }}
                    >
                      {config?.label}
                    </DisplayText>
                  </span>
                </div>
                <DisplayTime
                  onChange={(val) => {
                    onTimeChange(val, config);
                  }}
                  value={canWrite ? timeValue[config.id] || "" : config.value}
                  disabled={
                    !canWrite || !checkBoxSelected || !props?.aiSelected
                  }
                  InputAdornmentProps={{ position: "start" }}
                  inputVariant="outlined"
                  inputProps={{ disabled: true }}
                  invalidDateMessage=""
                  callFrom={"nueassist"}
                />
              </div>
            );
        }
      })}
      <DisplayModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
        }}
        PaperProps={{
          style: {
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
          },
        }}
        dailogContentProps={{
          style: { overflow: "visible", paddingTop: "0px" },
        }}
        fullWidth
        maxWidth="sm"
      >
        <div
          className={classes.modal_container}
          style={{ borderRadius: "4px" }}
        >
          <div className={classes.modal_body}>
            <DisplayText variant="subtitle2">
              {desc ? desc : "No Description"}
            </DisplayText>
          </div>
          <DisplayButton
            variant="outlined"
            size="small"
            onClick={() => setOpenModal(false)}
            style={{ float: "right", margin: "4px" }}
          >
            Close
          </DisplayButton>
        </div>
      </DisplayModal>
    </div>
  );
};

export default SystemConfigItems;
