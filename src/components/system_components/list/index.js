import React, { useState, useEffect } from "react";
import { List, ListItem, ListSubheader, makeStyles } from "@material-ui/core";
import {
  DisplayButton,
  DisplayCard,
  DisplayChips,
  DisplayDivider,
  DisplayFormControl,
  DisplayGrid,
  DisplayHelperText,
  DisplayInput,
  DisplayModal,
  DisplaySelect,
  DisplayText,
} from "components/display_components";
import PropTypes from "prop-types";
import { GridWrapper, ToolTipWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import { Autocomplete } from "@material-ui/lab";
import { InputAdornment, TextField } from "@material-ui/core";
import { entity } from "utils/services/api_services/entity_service";
import { selfService } from "utils/services/api_services/custom_field_service";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { globalProps } from "../global-props";

const useStyles = makeStyles({
  root: {
    "& .Mui-disabled": {
      color: "rgba(0, 0, 0, 0.6)", // (default alpha is 0.38)
    },
  },
});

const listStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    position: "relative",
    overflow: "auto",
    borderRadius: "8px",
    padding: "0px",
    minHeight: "20vh",
  },
  listSection: {},
  ul: {
    backgroundColor: "inherit",
    padding: 0,
  },
}));

export const SystemList = (props) => {
  const {
    callbackValue,
    data,
    fieldmeta,
    callbackError,
    fieldError,
    testid,
    stateParams,
    callFrom,
  } = props;

  const {
    canUpdate,
    disable,
    defaultValue,
    info,
    multiSelect,
    name,
    placeHolder,
    required,
    title,
    values,
    showNone,
    skipReadMode,
    isAutocompleteEnable,
    disablePortal = true,
  } = fieldmeta;

  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState(multiSelect ? [] : "");
  const [result, setResult] = useState(multiSelect ? [] : {});
  const [inputHeight, setInputHeight] = useState(57);
  const [placement, setPlacement] = useState("top");
  const [openModal, setOpenModal] = useState(false);
  const [listValues, setListValues] = useState(values || []);
  const [customValues, setCustomValues] = useState([]);
  const [newValue, setNewValue] = useState("");
  const [unique, setUnique] = useState("");

  const isReadMode =
    stateParams?.mode?.toLowerCase() == "read" && !skipReadMode;
  const { getAgencyTimeZone, getUserData } = GlobalFactory();
  const { isNJAdmin, isSuperAdmin, getAgencyDetails } = UserFactory();
  const { sys_roleData: { sys_entityAttributes } = {} } = getUserData() || {};
  const listClasses = listStyles();

  const useStyles = makeStyles({
    root: {
      "& .Mui-disabled": {
        color: "rgba(0, 0, 0, 0.6)", // (default alpha is 0.38)
      },
    },
    popperDisablePortal: {
      [placement]: placement === "bottom" ? 55 : inputHeight,
      position: "absolute",
    },
  });
  const getDimensions = () => {
    let elem = document.getElementById("inputHeight" + name);
    let rect = elem?.getBoundingClientRect();
    const middleOfScreen = window.innerHeight / 1.5;
    if (rect?.y > middleOfScreen) setPlacement("bottom");
    else setPlacement("top");
  };

  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data ? data : defaultValue);
    setMounted(true);
  }, []);

  const classes = useStyles();
  useEffect(() => {
    mounted && dataInit(data);
  }, [data, name, openModal]);

  const dataInit = (data) => {
    if (multiSelect) {
      setValue(data ? data : []);
      callbackValue(data && data.length ? data : null, props);
    } else {
      setValue(data || "");
      callbackValue(data ? data : null, props);
    }
    if (
      (multiSelect && data && data.length && required) ||
      (!multiSelect && data)
    )
      clearError();
    else required ? showError("Required") : clearError();
  };

  const onChange = (val) => {
    dataInit(val);
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const showIcon = (label) => {
    let icon = fieldmeta.values.find((ev) => ev.id === label)?.icfuseon;
    return (
      <DisplayChips
        style={{ color: "#818181", fontWeight: 500 }}
        avatar={icon}
        key={label}
        size="medium"
        label={label}
      />
    );
  };

  const renderReadMode = () => {
    let renderIcon;
    if (data) {
      if (data.hasOwnProperty("value")) {
        renderIcon = showIcon(data["value"]);
        return renderIcon;
      } else {
        if (Array.isArray(data)) {
          return (
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {data.map((i) => {
                renderIcon = showIcon(i);
                return renderIcon;
              })}
            </div>
          );
        } else {
          if (fieldmeta.values.find((ev) => ev.id == data)?.icon) {
            renderIcon = showIcon(data);
            return renderIcon;
          } else
            return (
              <DisplayText
                variant="h2"
                style={{ color: "#616161", wordBreak: "break-all" }}
              >
                {data}
              </DisplayText>
            );
        }
      }
    } else return "";
  };

  const getIcon = () => {
    let selectionOption = values?.find((opt) => opt["id"] === value);
    return (
      selectionOption?.icon && (
        <div
          style={{
            display: "flex",
            margin: "1px 4px 1px 1px",
            height: "1.18em",
            width: "32px",
            overflow: "hidden",
          }}
        >
          <img maxHeight="20px" maxWidth="20px" src={selectionOption?.icon} />
        </div>
      )
    );
  };

  const getColorIcon = () => {
    let selectionOption = values?.find((opt) => opt["id"] === value);
    return (
      !selectionOption?.icon &&
      selectionOption?.iconColor && (
        <div
          style={{
            display: "flex",
            margin: "1px 4px 1px 1px",
            height: "18px",
            width: "32px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "18px",
              backgroundColor: selectionOption?.iconColor,
              borderRadius: "50%",
            }}
          ></div>
        </div>
      )
    );
  };

  const getDefaultValues = (options, value) => {
    if (value)
      if (multiSelect) {
        let defaultValues = [];
        if (value?.length > 0 && options?.length > 0) {
          value.map((val) => {
            defaultValues.push(
              options[options.findIndex((opt) => opt?.id == val?.id)]
            );
          });
        }
        return defaultValues;
      } else {
        let res = options[options.findIndex((val) => val?.id == value)];
        return res;
      }
  };

  let handleCustomButton = () => {
    setOpenModal(true);
    setCustomValues([]);
    setNewValue("");
    // setListValues([...listValues]);
  };

  useEffect(() => {
    if (multiSelect && isAutocompleteEnable)
      setInputHeight(
        document.getElementById("inputHeight" + name)?.offsetHeight
      );
  }, [value]);

  useEffect(() => {
    let d = getDefaultValues(values, value);
    if (multiSelect) {
      d = d.length == 0 ? [] : d.filter((eachVal) => eachVal);
    }
    setResult(d);
  }, [value, name]);

  let addCustomValue = () => {
    let obj = {
      value: newValue,
      id: newValue,
      custom: true,
    };
    setCustomValues((prevState) => [...prevState, obj]);
    setNewValue("");
  };

  let renderListValues = (listValues, title) => {
    return (
      <DisplayCard elevation={0} style={{ border: "1px solid #ebebeb" }}>
        {
          <List className={listClasses.root}>
            <li className={listClasses.listSection}>
              <ul className={listClasses.ul}>
                <ListSubheader
                  style={{
                    backgroundColor: "whitesmoke",
                  }}
                >
                  <DisplayText variant="subtitle2" style={{ color: "#212121" }}>
                    {title}
                  </DisplayText>
                  <DisplayDivider />
                </ListSubheader>
                {[...listValues, ...customValues].length > 0 ? (
                  [...customValues, ...listValues].map((item) => (
                    <ListItem key={`{value}`}>
                      <DisplayText>
                        {item.value}{" "}
                        {item?.custom ? (
                          <DisplayText style={{ color: "#2076d2" }}>
                            (Custom)
                          </DisplayText>
                        ) : (
                          <></>
                        )}
                      </DisplayText>
                    </ListItem>
                  ))
                ) : (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100px",
                    }}
                  >
                    <DisplayText>{`No ${title}`}</DisplayText>
                  </span>
                )}
              </ul>
            </li>
          </List>
        }
      </DisplayCard>
    );
  };

  let handleClose = () => {
    setOpenModal(false);
    setCustomValues([]);
  };

  let updateMetaData = async () => {
    let {
      appname,
      modulename,
      groupname,
      metadata: {
        sys_entityAttributes: { sys_topLevel },
      },
    } = stateParams;
    sys_topLevel.forEach((eachField) => {
      if (eachField.type === "ARRAY") {
        eachField.fields.map((eachArrField) => {
          if (eachArrField.name === fieldmeta.name) {
            eachArrField.values = [...customValues, ...listValues];
          }
        });
      } else {
        if (eachField.name === fieldmeta.name) {
          eachField.values = [...customValues, ...listValues];
        }
      }
    });
    try {
      let result = await selfService.update(
        { id: stateParams?.metadata?._id },
        {
          metadata: { ...stateParams?.metadata },
          isListValue: true,
        }
      );
      setListValues([...customValues, ...listValues]);
      setCustomValues([]);
    } catch (err) {
      console.log("Error While updating Metadata", err);
    } finally {
      setOpenModal(false);
    }
  };

  let renderCustomModal = () => {
    return (
      <DisplayModal maxWidth="md" open={openModal}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "30vw",
            minHeight: "50vh",
          }}
        >
          <div style={{ margin: "1rem" }}>
            <DisplayText variant="h6" style={{ fontWeight: 500 }}>
              Add Custom List Values
            </DisplayText>
          </div>
          <DisplayDivider />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "1rem",
              height: "60vh",
            }}
          >
            <DisplayText variant="caption" style={{ fontWeight: 500 }}>
              Custom Value
            </DisplayText>
            <DisplayInput
              onChange={(val) => {
                let isUnique = false;
                if (val) {
                  isUnique = [...customValues, ...listValues].some(
                    (eachItem) => {
                      return eachItem["id"].toLowerCase() == val.toLowerCase();
                    }
                  );
                }
                setUnique(isUnique);
                setNewValue(val);
              }}
              onClear={() => setNewValue("")}
              value={newValue}
              style={{ width: "100%" }}
              {...globalProps}
              helperText={
                <DisplayText style={{ color: "red" }}>
                  {unique ? <>Value with this name already exists.</> : <></>}
                </DisplayText>
              }
            />
            <DisplayButton
              size="small"
              variant="contained"
              disabled={!newValue.length || unique}
              onClick={addCustomValue}
              style={{
                width: "fit-content",
                alignSelf: "end",
                // marginTop: "4px",
                fontWeight: 500,
              }}
            >
              Add New Value
            </DisplayButton>
            <br />
            {renderListValues(listValues, "Current List Values")}
          </div>
          <DisplayDivider />
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              padding: "1rem",
              backgroundColor: "#fafafa",
              gap: "1rem",
            }}
          >
            <DisplayButton
              variant="outlined"
              onClick={handleClose}
              style={{
                color: "red",
                borderColor: "red",
                height: "32px",
              }}
            >
              Close
            </DisplayButton>
            <DisplayButton
              variant="contained"
              disabled={!customValues.length}
              onClick={updateMetaData}
              style={{
                height: "32px",
              }}
            >
              Apply Changes
            </DisplayButton>
          </div>
        </div>
      </DisplayModal>
    );
  };

  let getSelfServiceEnabled = () => {
    if (isNJAdmin()) {
      return true;
    } else if (
      getAgencyDetails?.sys_entityAttributes?.enableSelfService === true
    ) {
      if (
        isSuperAdmin ||
        sys_entityAttributes?.enableSelfService?.includes("addListValues")
      ) {
        return true;
      }
    } else return false;
  };

  const buttonOption = (
    <DisplayButton
      variant="text"
      key="custom"
      onClick={handleCustomButton}
      style={{
        background: "#16589b",
        borderRadius: "0px 0px 4px 4px",
        width: "100%",
        position: "absolute",
        bottom: "0px",
        left: "-2px",
        color: "white",
        height: "36px",
      }}
    >
      Add Custom Value
    </DisplayButton>
  );

  return (
    <>
      {isReadMode ? (
        <DisplayGrid
          container
          style={{ flex: 1, height: "100%", flexDirection: "column" }}
        >
          <DisplayGrid item container>
            <ToolTipWrapper title={fieldmeta.info}>
              <div>
                <DisplayText
                  variant="h1"
                  style={{ color: "#666666", cursor: "default" }}
                >
                  {fieldmeta.title}
                </DisplayText>
              </div>
            </ToolTipWrapper>
          </DisplayGrid>
          <DisplayGrid
            item
            container
            style={{ paddingLeft: "15px", flex: 1, position: "relative" }}
          >
            {renderReadMode()}
          </DisplayGrid>
        </DisplayGrid>
      ) : (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            width: "100%",
          }}
        >
          <DisplayFormControl required={required} error={error} testid={testid}>
            <div className="system-components">
              {isAutocompleteEnable ? (
                <>
                  <div style={{ display: "flex" }}>
                    <DisplayText
                      style={{
                        color: "#5F6368",
                        fontWeight: 500,
                        fontSize: "12px",
                        paddingBottom: "4px",
                      }}
                    >
                      {title}
                    </DisplayText>
                    &nbsp;&nbsp;
                    {error && (
                      <DisplayHelperText icon={SystemIcons.Error}>
                        ({helperText})
                      </DisplayHelperText>
                    )}
                  </div>
                  <div id={"inputHeight" + name} style={{ width: "100%" }}>
                    <Autocomplete
                      id={name}
                      multiple={multiSelect}
                      options={listValues}
                      disablePortal={
                        callFrom == "top_level" && disablePortal ? true : false
                      }
                      ListboxProps={{
                        style: {
                          maxHeight: "200px",
                        },
                      }}
                      onOpen={getDimensions}
                      getOptionDisabled={(option) => option?.isDisabled}
                      getOptionLabel={(option) => option?.value || ""}
                      renderOption={(option) => {
                        if (option?.key == "custom") {
                          return buttonOption;
                        } else
                          return (
                            <>
                              {option?.icon && (
                                <div
                                  style={{
                                    display: "flex",
                                    margin: "1px 4px 1px 1px",
                                    height: "1.18em",
                                    width: "32px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <img
                                    maxHeight="20px"
                                    maxWidth="20px"
                                    src={option?.icon}
                                  />
                                </div>
                              )}
                              {!option?.icon && option?.iconColor && (
                                <div
                                  style={{
                                    display: "flex",
                                    margin: "1px 4px 1px 1px",
                                    height: "18px",
                                    width: "32px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      width: "18px",
                                      backgroundColor: option?.iconColor,
                                      borderRadius: "50%",
                                    }}
                                  ></div>
                                </div>
                              )}
                              {option?.value || ""}
                            </>
                          );
                      }}
                      filterOptions={(options, state) => {
                        if (options?.length == 0) {
                          return getSelfServiceEnabled() ? [buttonOption] : [];
                        } else {
                          if (state.inputValue == "") {
                            return getSelfServiceEnabled()
                              ? [...options, buttonOption]
                              : [...options];
                          } else {
                            let filteredValues = options.filter((item) =>
                              item?.value
                                ?.toLowerCase()
                                .includes(state.inputValue.toLowerCase())
                            );
                            return getSelfServiceEnabled()
                              ? [...filteredValues, buttonOption]
                              : [...filteredValues];
                          }
                        }
                      }}
                      getOptionSelected={(option, value) => {
                        return option?.id === value?.id;
                      }}
                      disabled={!canUpdate || disable}
                      // style={{ width: "300px" }}
                      onChange={(event, newVal) => {
                        onChange(multiSelect ? newVal : newVal?.id);
                      }}
                      value={result}
                      classes={classes}
                      // defaultValue={defaultValue}
                      // defaultValue={() => { return values[values.findIndex(option => option.id == value)] }}
                      renderInput={(params) => {
                        return (
                          <TextField
                            className={classes.root}
                            {...globalProps}
                            required={required}
                            placeholder={
                              Object.keys(value)?.length || value?.length
                                ? ""
                                : placeHolder
                            }
                            {...params}
                            // label={title}
                            hiddenLabel={true}
                            InputProps={{
                              ...params.InputProps,
                              ...globalProps.InputProps,
                              startAdornment: multiSelect ? (
                                params.InputProps.startAdornment
                              ) : (
                                <InputAdornment disablePointerEvents={true}>
                                  {getIcon()}
                                  {getColorIcon()}
                                </InputAdornment>
                              ),
                              style: {
                                ...globalProps.InputProps.style,
                                height: multiSelect
                                  ? ""
                                  : globalProps?.InputProps?.style?.height,
                                padding: "0px 10px",
                              },
                            }}
                            fullWidth
                            isOptionEqualToValue={(option, value) =>
                              option.value === value.value
                            }
                            disablePortal
                          />
                        );
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex" }}>
                    <DisplayText
                      style={{
                        color: "#5F6368",
                        fontWeight: 400,
                        fontSize: "12px",
                        paddingBottom: "4px",
                      }}
                    >
                      {title}
                    </DisplayText>
                    &nbsp;&nbsp;
                    {error && (
                      <DisplayHelperText icon={SystemIcons.Error}>
                        ({helperText})
                      </DisplayHelperText>
                    )}
                  </div>
                  <DisplaySelect
                    {...globalProps}
                    className={classes.root}
                    disabled={!canUpdate || disable}
                    labelKey="value"
                    placeHolder={placeHolder}
                    testid={fieldmeta.name}
                    // label={title}
                    required={required}
                    error={error}
                    filled={!error && value}
                    valueKey="id"
                    values={listValues}
                    showNone={showNone}
                    multiple={multiSelect}
                    onChange={onChange}
                    value={value}
                    isValueSelfServiceEnabled={getSelfServiceEnabled()}
                    handleCustomButton={handleCustomButton}
                    // variant="outlined"
                  />
                </>
              )}
            </div>
            <ToolTipWrapper
              title={
                fieldmeta?.description?.length > 57
                  ? fieldmeta?.description
                  : ""
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
      )}
      {renderCustomModal()}
    </>
  );
};

SystemList.propTypes = {
  value: PropTypes.string,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    multiSelect: PropTypes.bool,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};
SystemList.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    visibleOnCsv: false,
    required: false,
  },
};

export default GridWrapper(SystemList);

// const DisplayAutoComplete = ({
//   multiSelect,
//   required,
//   title,
//   placeHolder,
//   value,
//   // defaultValue,
//   // FIELD_NAME,
//   // methods,
//   name,
//   values,
//   fieldOptions,
//   disable,
//   onChange,
// }) => {

// };
