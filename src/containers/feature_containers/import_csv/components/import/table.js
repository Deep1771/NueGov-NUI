import React, { useMemo, useState } from "react";
import {
  InputAdornment,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";

//global props
import { globalProps } from "../../../../../components/system_components/global-props";

//display components
import {
  DisplayButton,
  DisplayDivider,
  DisplayIconButton,
  DisplayModal,
  DisplayPhoneNumber,
  DisplayRadiobox,
  DisplayRadioGroup,
  DisplaySelect,
  DisplayText,
} from "components/display_components";

//icons
import { SystemIcons } from "utils/icons/index";

//helpers
import { localProps, usernameMatchingOptions } from "./helper";

const useStyles = makeStyles({
  table: {
    minWidth: "fit-content",
  },
});

export const ImportsTable = ({
  entityData,
  excelValues,
  helperData,
  mappingField,
  setMappingField,
  sourceFields,
  tableHeaders,
  targetFields,
  entityLevelImportsAlert,
  referenceFields,
  templateObj,
  setUsernameMatch,
  usernameMatch,
  importMode,
  selectedEntity,
  setEnableUsername,
  enableUsername,
}) => {
  const classes = useStyles();
  const { Close } = SystemIcons;

  let [filterSystemData, setFilterSystemData] = useState({
    srcVal: "",
    systemDataFiltered: "",
  });
  let [openModal, setOpenModal] = useState({
    open: false,
    name: "",
    srcVal: "",
    destVal: "",
    selectedField: "",
  });
  let [referenceObject, setReferenceObject] = useState({ friendlyName: "" });

  //mapping function
  let mapper = (srcVal, destVal, selectedField) => {
    let {
      type,
      parentFieldName = "",
      displayField = "",
      entityName = "",
      fieldType = "",
      importsAlert,
    } = selectedField || {};

    let filteredMappingFields = mappingField.filter(
      (eachField) => eachField.source.fieldName !== srcVal
    );

    if (type?.toUpperCase() === "REFERENCE") {
      setOpenModal({
        open: true,
        name: parentFieldName,
        srcVal,
        destVal,
        selectedField,
      });
      setReferenceObject({});
    } else {
      if (
        enableUsername.srcVal === srcVal ||
        destVal?.toLowerCase() == "username"
      ) {
        if (destVal?.toLowerCase() == "username") {
          setEnableUsername({
            source: srcVal,
            enable: true,
          });
        } else {
          setEnableUsername({
            source: srcVal,
            enable: true,
          });
        }
      }
      setMappingField([
        ...filteredMappingFields,
        {
          source: { fieldName: srcVal },
          target: {
            fieldName: destVal,
            parentName: parentFieldName,
            matchBy: displayField || destVal,
            type,
          },
          matched: true,
          importsAlert,
        },
      ]);
    }
  };

  //filtering selected fields for list values
  let handleTargetFields = useMemo(() => {
    targetFields.forEach((item) => {
      if (item.required) item.required = true;
      let fieldsSelected =
        mappingField.find(
          (eachField) =>
            eachField?.target?.fieldName == item.value ||
            eachField?.target?.parentName == item.value
        ) || {};
      // if (item?.entityName?.toUpperCase() === "USER") {
      //   if (fieldsSelected?.target?.matchBy === "firstName,lastName") {
      //     targetFields.forEach((eachItem) => {
      //       if (
      //         fieldsSelected?.target?.parentName ===
      //           `${eachItem.parentFieldName}` ||
      //         fieldsSelected?.target?.parentName ===
      //           `${eachItem.parentFieldName}`
      //       ) {
      //         eachItem.displayNone = "none";
      //         eachItem.matched = true;
      //       }
      //     });
      //   }
      //   if (
      //     fieldsSelected?.target?.fieldName ===
      //       `${fieldsSelected?.target?.parentName}.firstName` ||
      //     fieldsSelected?.target?.fieldName ===
      //       `${fieldsSelected?.target?.parentName}.lastName`
      //   ) {
      //     targetFields.forEach((eachItem) => {
      //       if (eachItem.displayField === "firstName,lastName") {
      //         if (
      //           fieldsSelected?.target?.parentName == eachItem?.parentFieldName
      //         ) {
      //           eachItem.displayNone = "none";
      //           eachItem.matched = true;
      //         }
      //       }
      //     });
      //   }
      // }
      if (item.type === "PAIREDLIST" || item.type === "DATAPAIREDLIST") {
        if (fieldsSelected?.target?.fieldName === item.parentFieldName) {
          targetFields.forEach((eachItem) => {
            if (
              eachItem.parentFieldName === fieldsSelected?.target?.parentName
            ) {
              eachItem.displayNone = "none";
              eachItem.matched = true;
            }
          });
        } else {
          targetFields.forEach((eachItem) => {
            if (
              eachItem.value
                .split(".")
                .includes(`${fieldsSelected?.target?.displayField}`) ||
              eachItem?.value === fieldsSelected?.target?.parentName
            ) {
              eachItem.displayNone = `none`;
              eachItem.matched = true;
            }
          });
        }
      }
      if (
        Object?.keys(fieldsSelected)?.length > 0 &&
        item.type === "REFERENCE"
      ) {
        item.color = "green";
      }
      if (
        Object?.keys(fieldsSelected)?.length > 0 &&
        item.type !== "REFERENCE"
      ) {
        item.displayNone = "none";
        item.matched = true;
      }
    });
    let target = targetFields?.sort((labelA, labelB) => {
      const nameA = labelA?.label?.toUpperCase(); // ignore upper and lowercase
      const nameB = labelB?.label?.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    });
    return target;
  }, [JSON.stringify(mappingField), JSON.stringify(templateObj)]);

  //extract field formats
  let handleDateTimeFormat = (mappedField) => {
    let filtereFormats = helperData?.importFeature?.find(
      (eachType) => eachType?.type === mappedField?.target?.type
    );
    return filtereFormats?.formats || [];
  };

  //value for each target field
  let getValue = (rowValue) => {
    let mappedData = mappingField.find((eachField) => {
      return eachField.source.fieldName === rowValue;
    });
    return mappedData;
  };

  //field clear
  let handleClear = (clearedValue) => {
    let filteredData = mappingField.filter((eachField) => {
      return eachField.source.fieldName !== clearedValue;
    });
    setEnableUsername({
      source: "",
      enable: false,
    });
    setMappingField(filteredData);
  };

  //country code extraction
  let getCountryCode = (code) => {
    let splitCode = code?.split("");
    return {
      constCode: splitCode[0],
      variableCode: splitCode?.splice(1).join(""),
    };
  };

  //referenceFields
  let getReferenceFields = () => {
    let selectedReferenceFields =
      referenceFields?.length > 0
        ? referenceFields.find((eachField) => eachField.name === openModal.name)
        : [];
    if (selectedReferenceFields) {
      let dFields = selectedReferenceFields?.displayFields || [];
      let displayFields = [
        ...dFields,
        {
          name: `${selectedReferenceFields?.name}-Id`,
          friendlyName: `${selectedReferenceFields?.title}-GUID`,
          parentName: selectedReferenceFields?.name,
          isCustom: true,
          description: ``,
        },
      ];
      let d = displayFields?.forEach((eachItem) => {
        return (eachItem.parentName = selectedReferenceFields?.name);
      });
      return displayFields;
    }
  };

  let handleApply = () => {
    let { srcVal, destVal, selectedField } = openModal;
    let { type, fieldType = "", importsAlert } = selectedField || {};
    let filteredMappingFields = mappingField.filter(
      (eachField) =>
        eachField.source.fieldName !== referenceObject?.sys_friendlyName
    );

    if (entityData?.length > 0) {
      let filterSystemData = entityData?.map((systemData) =>
        referenceObject.hasOwnProperty("isCustom")
          ? systemData?.["sys_gUid"]
          : systemData?.sys_entityAttributes?.name
      );
      if (entityLevelImportsAlert && importsAlert) {
        let dataNotInSystem = excelValues?.filter((eachField) => {
          return !filterSystemData.includes(eachField[srcVal]);
        });
        let nonSystemData =
          dataNotInSystem?.map((eachItem) => eachItem[srcVal]) || [];
        let data = nonSystemData?.filter((e) => e);
        setFilterSystemData({
          srcVal,
          nonSystemData: [...new Set([...data])],
        });
      }
    }
    if (referenceObject.hasOwnProperty("isCustom")) {
      setMappingField([
        ...filteredMappingFields,
        {
          source: { fieldName: srcVal },
          target: {
            fieldName: `${destVal}.${referenceObject.name}`,
            parentName: referenceObject.parentName,
            matchBy: "sys_gUid",
            type,
            fieldType: "CUSTOM",
            friendlyName: referenceObject.friendlyName,
          },
          matched: true,
          importsAlert,
        },
      ]);
    } else {
      let splitReferenceName = referenceObject?.name?.split(",");
      setMappingField([
        ...filteredMappingFields,
        {
          source: { fieldName: srcVal },
          target: {
            fieldName:
              splitReferenceName?.length > 1
                ? `${destVal}`
                : `${destVal}.${splitReferenceName}`,
            parentName: referenceObject.parentName,
            matchBy: referenceObject.name,
            type,
            fieldType,
            friendlyName: referenceObject.friendlyName,
          },
          matched: true,
          importsAlert,
        },
      ]);
    }
    setOpenModal({
      open: false,
      name: "",
      srcVal: "",
      destVal: "",
      selectedField: "",
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
        overflow: "auto",
      }}
    >
      <TableContainer style={{ overflow: "overlay" }} component={Paper}>
        <Table stickyHeader className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {tableHeaders.map((th) => {
                return (
                  <TableCell
                    padding="none"
                    style={{ padding: "8px", textAlign: "center" }}
                  >
                    {th.value}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {sourceFields.map((row) => {
              let fieldObject = getValue(row.value);
              let fieldValue = fieldObject?.hasOwnProperty("hideOnMapper")
                ? ""
                : fieldObject?.target.type === "REFERENCE"
                ? fieldObject?.target?.parentName
                : fieldObject?.target?.fieldName;
              let templateFormats = handleDateTimeFormat(fieldObject);
              return (
                <TableRow key={row.value}>
                  <TableCell
                    padding="none"
                    component="th"
                    scope="row"
                    style={{
                      width: "30%",
                      padding: "0px 8px",
                      textAlign: "center",
                    }}
                  >
                    {row.label}
                  </TableCell>
                  <TableCell
                    padding="none"
                    component="th"
                    scope="row"
                    style={{
                      // display: "flex",
                      // width: "100%",
                      padding: "4px 8px 8px 8px",
                      // flexWrap: "wrap",
                      // justifyContent: "start",
                      // textAlign: "center",
                    }}
                  >
                    <DisplaySelect
                      enableSearch={true}
                      hiddenLabel
                      key={row.value}
                      labelKey="label"
                      variant={"filled"}
                      valueKey="value"
                      value={fieldValue || ""}
                      values={handleTargetFields}
                      onChange={(value) => {
                        let selectedField = targetFields.find(
                          (field) => field.value === value
                        );
                        mapper(row.value, value, selectedField);
                      }}
                      style={{
                        display: "inline-block",
                        width: "100%",
                        height: "36px",
                        margin: "0px 0px 4px 0px",
                      }}
                      placeholder="select type"
                      showNone={false}
                      {...globalProps}
                      {...localProps}
                      InputProps={{
                        endAdornment: (
                          <>
                            {fieldValue && (
                              <InputAdornment
                                position="end"
                                style={{
                                  position: "absolute",
                                  cursor: "pointer",
                                  right: "36px",
                                }}
                              >
                                <Close
                                  onClick={() => handleClear(row.value)}
                                  fontSize="small"
                                />
                              </InputAdornment>
                            )}
                          </>
                        ),
                        ...globalProps.InputProps,
                        style: {
                          // ...globalProps.InputProps.style,
                          height: "30px",
                          padding: "0px 10px",
                          borderRadius: "4px",
                        },
                      }}
                    />
                    {fieldObject?.target?.friendlyName && (
                      <DisplayText
                        style={{
                          color: "green",
                          padding: "0px 12px",
                          fontWeight: "500",
                        }}
                      >{`Mapped to ${fieldObject?.target?.friendlyName}`}</DisplayText>
                    )}
                    {templateFormats.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginTop: "-12px",
                        }}
                      >
                        <br />
                        <DisplayText
                          style={{ fontSize: "12px", alignSelf: "baseline" }}
                        >
                          {`Select ${row.label} format`}
                        </DisplayText>
                        <DisplaySelect
                          hiddenLabel
                          key={row.value}
                          labelKey="label"
                          variant={"filled"}
                          valueKey="value"
                          value={fieldObject?.source?.format || ""}
                          values={templateFormats}
                          onChange={(value) => {
                            let mappedFields = [...mappingField];
                            mappedFields.forEach((eachMappedField) => {
                              if (
                                eachMappedField?.source?.fieldName === row.value
                              ) {
                                eachMappedField.source.format = value;
                              }
                            });
                            setMappingField([...mappedFields]);
                          }}
                          style={{ width: "200px", height: "36px" }}
                          placeholder="select type"
                          showNone={false}
                          {...globalProps}
                          {...localProps}
                          InputProps={{
                            endAdornment: (
                              <>
                                {fieldValue && fieldObject?.source?.format && (
                                  <InputAdornment
                                    position="end"
                                    style={{
                                      position: "absolute",
                                      cursor: "pointer",
                                      right: "36px",
                                    }}
                                  >
                                    <Close
                                      onClick={() => handleClear(row.value)}
                                      fontSize="small"
                                    />
                                  </InputAdornment>
                                )}
                              </>
                            ),
                            ...globalProps.InputProps,
                            style: {
                              // ...globalProps.InputProps.style,
                              height: "30px",
                              borderRadius: "4px",
                              padding: "0px 10px",
                            },
                          }}
                        />
                      </div>
                    )}
                    <br />
                    {fieldObject?.target?.type?.toUpperCase() ===
                      "PHONENUMBER" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          paddingTop: "8px",
                        }}
                      >
                        <DisplayText style={{ fontSize: "12px" }}>
                          {`Select Country Code`}
                        </DisplayText>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            width: "fit-content",
                            border: "1px solid darkgray",
                            background: "#ebebeb",
                            borderRadius: "8px",
                          }}
                        >
                          <DisplayPhoneNumber
                            value={fieldObject?.source?.countryCode}
                            country={fieldObject?.source?.countryCode}
                            onChange={(value, country, code, fv) => {
                              let mappedFields = [...mappingField];
                              mappedFields.forEach((eachMappedField) => {
                                if (
                                  eachMappedField?.source?.fieldName ===
                                  row.value
                                ) {
                                  eachMappedField.source.countryCode = value;
                                  eachMappedField.source.country =
                                    country.countryCode;
                                }
                              });
                              setMappingField([...mappedFields]);
                            }}
                            // onKeyDown={onKeyDown}
                            specialLabel={""}
                            inputProps={{
                              style: {
                                display: "none",
                              },
                            }}
                            style={{
                              height: "36px",
                              width: "55px",
                              borderRight: fieldObject?.source?.countryCode
                                ? "1px solid darkgray"
                                : "",
                            }}
                            inputStyle={{
                              border: "none",
                              fontSize: "15px",
                              background: "#e8e8e8",
                              padding: "2px",
                              ...globalProps.InputProps.style,
                            }}
                          />
                          {fieldObject?.source?.countryCode &&
                            (fieldObject?.source?.countryCode.split("").length >
                            1 ? (
                              <DisplayText style={{ margin: "0px 8px" }}>{`+${
                                getCountryCode(fieldObject?.source?.countryCode)
                                  .constCode
                              } (${
                                getCountryCode(fieldObject?.source?.countryCode)
                                  .variableCode
                              })`}</DisplayText>
                            ) : (
                              <DisplayText style={{ margin: "0px 8px" }}>
                                +{fieldObject?.source?.countryCode}
                              </DisplayText>
                            ))}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    padding="none"
                    component="th"
                    scope="row"
                    style={{
                      width: "30%",
                      padding: "0px 8px",
                      textAlign: "center",
                    }}
                  >
                    {getValue(row.value)?.hasOwnProperty("matched") ? (
                      <>
                        <DisplayText style={{ color: "green" }}>
                          Mapped
                        </DisplayText>
                      </>
                    ) : (
                      <DisplayText style={{ color: "red" }}>
                        Unmapped
                      </DisplayText>
                    )}
                    <DisplayText></DisplayText>
                    {entityLevelImportsAlert &&
                      filterSystemData?.nonSystemData?.length > 0 &&
                      fieldObject?.importsAlert &&
                      filterSystemData.srcVal == row.value && (
                        <div>
                          <b style={{ color: "red" }}>Note : </b>
                          {filterSystemData?.nonSystemData?.map(
                            (eachItem, index) => {
                              return index > 0 ? (
                                <DisplayText style={{ color: "red" }}>
                                  ,&nbsp;&nbsp;&nbsp;{eachItem}
                                </DisplayText>
                              ) : (
                                <DisplayText style={{ color: "red" }}>
                                  {`${eachItem}`}
                                </DisplayText>
                              );
                            }
                          )}
                          <DisplayText>
                            {" "}
                            &nbsp;
                            {`${row.value}(s) do not exist. Please create these ${row.value}s before importing this data`}
                          </DisplayText>
                        </div>
                      )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <br />
      {selectedEntity?.groupName?.toLowerCase() === "user" &&
        importMode === "insert" && (
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              background: "antiquewhite",
              borderRadius: "4px",
              padding: "0px 8px",
              justifyContent: "center",
            }}
          >
            <DisplayText variant="subtitle2" style={{ color: "red" }}>
              If the username is not in the spreadsheet
            </DisplayText>
            <DisplayRadioGroup
              style={{
                padding: "0px 12px",
              }}
              row
              value={usernameMatch}
              onChange={(event) => {
                setUsernameMatch(event.target.value);
              }}
            >
              {usernameMatchingOptions?.map((eachMode) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      columnGap: "2%",
                    }}
                  >
                    <DisplayRadiobox
                      label={eachMode.label}
                      value={eachMode.value}
                      disabled={enableUsername?.enable}
                    />
                    {/* <DisplayText variant="subtitle2">HelperText</DisplayText> */}
                  </div>
                );
              })}
            </DisplayRadioGroup>
            &nbsp;&nbsp;
            <DisplayIconButton
              disabled={!usernameMatch}
              size="small"
              onClick={() => {
                setUsernameMatch("");
              }}
            >
              <Close fontSize="small" style={{ color: "black" }} />
            </DisplayIconButton>
          </div>
        )}
      <DisplayModal
        open={openModal.open}
        fullWidth
        maxWidth="xs"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "4px 8px",
            background: "#2076d2",
            color: "white",
          }}
        >
          <DisplayText variant="h6">{`${openModal?.selectedField?.label}`}</DisplayText>
          <DisplayText variant="caption">{`Unique match field`}</DisplayText>
        </header>
        <DisplayDivider />
        <div
          style={{
            maxHeight: "50vh",
            padding: "8px 12px 0px 12px",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <DisplayText style={{ fontSize: "14px", fontWeight: "500" }}>
            {`Match data by using field`}
          </DisplayText>
          <DisplayRadioGroup
            style={{
              display: "flex",
              flexDirection: "column",
            }}
            row
            value={referenceObject?.name}
            onChange={(event) => {
              let refObj = getReferenceFields()?.find(
                (eachDisplayField) =>
                  eachDisplayField.name === event.target.value
              );
              setReferenceObject(refObj);
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {referenceFields?.length > 0 &&
                getReferenceFields()?.map((eachDisplayField) => {
                  let mappedRefFields =
                    mappingField?.find(
                      (eachRefMap) =>
                        eachRefMap?.target?.fieldName ===
                        `${eachDisplayField?.parentName}.${eachDisplayField?.name}`
                    ) || {};
                  return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <DisplayRadiobox
                          label={eachDisplayField?.friendlyName}
                          value={eachDisplayField?.name}
                          disabled={Object?.keys(mappedRefFields)?.length > 0}
                        />
                        {Object?.keys(mappedRefFields)?.length > 0 && (
                          <DisplayText
                            style={{
                              color: "green",
                              marginBottom: "4px",
                              marginLeft: "-8px",
                            }}
                          >
                            {" "}
                            (Already Mapped)
                          </DisplayText>
                        )}
                      </div>
                      <DisplayText
                        style={{
                          marginTop: "-12px",
                          fontSize: "12px",
                          padding: "0px 28px",
                          opacity: "0.6",
                        }}
                      >
                        {eachDisplayField?.description}
                      </DisplayText>
                      <br />
                    </div>
                  );
                })}
            </div>
          </DisplayRadioGroup>
        </div>
        <DisplayDivider />
        <footer
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            padding: "8px",
          }}
        >
          <DisplayButton
            onClick={() =>
              setOpenModal({
                open: false,
                name: "",
                srcVal: "",
                destVal: "",
                selectedField: "",
              })
            }
            style={{ height: "30px" }}
          >
            Go Back
          </DisplayButton>
          <DisplayButton
            onClick={handleApply}
            disabled={!Object?.keys(referenceObject)?.length}
            variant="contained"
            style={{ height: "30px" }}
          >
            Apply
          </DisplayButton>
        </footer>
      </DisplayModal>
    </div>
  );
};
