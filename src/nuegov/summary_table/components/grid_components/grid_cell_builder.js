import React, { useState } from "react";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { SystemIcons } from "utils/icons";
import {
  DisplayAvatar,
  DisplayIconButton,
  DisplayModal,
  DisplayText,
} from "components/display_components";
import { get } from "loadsh";
import { getAvatarText } from "utils/services/helper_services/system_methods";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import { isDefined } from "utils/services/helper_services/object_methods";
import { ImageWithFallback } from "components/helper_components";
import { makeUpperCase } from "utils/helper_functions/capitalize";
import { ToolTipWrapper } from "components/wrapper_components";
import "../../styles/table.css";
import { setSummaryScrollPosition } from "utils/helper_functions";
import { UserFactory } from "utils/services/factory_services";

const AgCellBuilder = () => {
  const { DateRange, Edit, RemoveOutline, AddOutline, Read, Close, Info } =
    SystemIcons;
  let color;
  const isPublicUser = sessionStorage.getItem("public-user");

  const getReferenceBuilder = (props) => {
    let {
      data,
      metadata,
      path,
      fieldmeta,
      rowData,
      referenceIndex,
      handleDetailPageModal,
      checkEachRowDataAccess,
      handleAddFieldValue,
      handleRemoveFieldValue,
      setDialogProps,
      setSnackBar,
      businessType,
    } = props || {};

    const { checkReadAccess } = UserFactory();
    let readAccess = checkReadAccess({
      appname: fieldmeta.appName,
      modulename: fieldmeta.moduleName,
      entityname: fieldmeta.entityName,
    });

    let value = null,
      isValueExist = false;
    let showAssignmentButtons = businessType === "NUEASSIST" ? false : true;
    let { visibleInSingleColumn = false } = fieldmeta || {};
    let fieldValue = get(data, fieldmeta?.name, null) || get(data, path, null);
    let { multiSelect, displayFields } = fieldmeta || {};
    let displayFieldMetadata = displayFields?.find(
      (field) =>
        field?.name == path.slice(path.indexOf(".") + 1) ||
        field?.name == fieldmeta?.name
    );
    let { writeAccess = true } = data || {};
    if (multiSelect) {
      value = fieldValue || [];
      if (!Array.isArray(value)) value = [value];

      if (path?.includes(".")) {
        let leng = path?.split(".")?.length;
        path = path?.split(".")[leng - 1];
      } else path = path;

      if (value?.filter((e) => e?.id)?.length > 0) {
        if (!visibleInSingleColumn) {
          if (displayFieldMetadata?.type)
            value = value?.map(
              (e) => textExtractor(e[path], displayFieldMetadata) || "----"
            );
          else value = value?.map((e) => e[path]) || "----";
        } else {
          value = value?.map((eachVal) => {
            let fullValue = "";
            displayFields.map((eachDF, idf) => {
              let { delimiter, visible = true, name, type = "" } = eachDF || {};
              if (eachVal[name] && visible) {
                let val;
                let fieldsArr = [];
                fieldsArr = eachDF?.name.split(".");

                if (type && ["PAIREDLIST", "DATAPAIREDLIST"].includes(type)) {
                  val =
                    eachVal[
                      fieldsArr?.length > 1 ? fieldsArr[1] : fieldsArr[0]
                    ] || "";
                } else {
                  val =
                    eachVal[
                      fieldsArr?.length > 1 ? fieldsArr[1] : fieldsArr[0]
                    ]?.toString() || "";
                }

                let fieldsArr1 = [];
                fieldsArr1 = displayFields[idf + 1]
                  ? displayFields[idf + 1]?.name?.split(".")
                  : [];

                let fieldsArr2 = [];
                fieldsArr2 = displayFields[idf - 1]
                  ? displayFields[idf - 1]?.name?.split(".")
                  : [];

                if (delimiter) {
                  val =
                    // (displayFields[idf + 1]
                    //   ? displayFields[idf + 1]?.visible
                    //   : true) &&
                    isDefined(
                      eachVal[
                        fieldsArr1?.length > 1 ? fieldsArr1[1] : fieldsArr1[0]
                      ]
                    ) && typeof val === "string"
                      ? val?.concat(delimiter)
                      : val;
                } else {
                  val =
                    isDefined(
                      eachVal[
                        fieldsArr1?.length > 1 ? fieldsArr1[1] : fieldsArr1[0]
                      ]
                    ) && typeof val === "string"
                      ? val?.concat(" ")
                      : val;
                }
                if (displayFields[idf - 1]?.delimiter) {
                  val =
                    displayFields[idf - 1] &&
                    displayFields[idf - 1]?.visible === false &&
                    isDefined(
                      eachVal[
                        fieldsArr?.length > 1 ? fieldsArr[1] : fieldsArr[0]
                      ]
                    ) &&
                    typeof val === "string"
                      ? displayFields[idf - 1]?.delimiter?.concat(val)
                      : val;
                } else {
                  let defaultDelimiter = " ";
                  val =
                    isDefined(
                      eachVal[
                        fieldsArr?.length > 1 ? fieldsArr[1] : fieldsArr[0]
                      ]
                    ) && val === "string"
                      ? defaultDelimiter?.concat(val)
                      : val;
                }
                if (fullValue?.length > 0) fullValue = fullValue?.concat(val);
                else fullValue = val;
              }
            });
            return fullValue;
          });
        }
      } else value = [];
    } else {
      if (!visibleInSingleColumn) {
        let leng = path?.split(".")?.length;
        path = path?.split(".")[leng - 1];
        if ([fieldValue]?.filter((e) => e?.id)?.length > 0) {
          let { type = undefined } = displayFieldMetadata || {};
          if (type && type !== "PAIREDLIST")
            value =
              textExtractor(get(fieldValue, path), displayFieldMetadata) ||
              "----";
          else value = get(fieldValue, path) || "----";
        } else if (Array.isArray(fieldValue)) {
          value = (fieldValue || []).map(
            (val) => val[displayFieldMetadata?.name]
          );
        } else if (["Super Admin", "NJ Admin"].includes(fieldValue?.name)) {
          value = fieldValue?.name;
        } else value = undefined;
      } else {
        let fullValue = "";
        if (fieldValue) {
          displayFields.map((eachDF, idf) => {
            let { delimiter, visible = true, name, type = "" } = eachDF || {};
            if (fieldValue[name] && visible) {
              let val;
              let fieldsArr = [];
              fieldsArr = eachDF?.name.split(".");

              if (type && ["PAIREDLIST", "DATAPAIREDLIST"].includes(type)) {
                val =
                  fieldValue[
                    fieldsArr?.length > 1 ? fieldsArr[1] : fieldsArr[0]
                  ] || "";
              } else {
                val =
                  fieldValue[
                    fieldsArr?.length > 1 ? fieldsArr[1] : fieldsArr[0]
                  ]?.toString() || "";
              }

              val = textExtractor(val, eachDF);
              let fieldsArr1 = [];
              fieldsArr1 = displayFields[idf + 1]
                ? displayFields[idf + 1]?.name?.split(".")
                : [];

              let fieldsArr2 = [];
              fieldsArr2 = displayFields[idf - 1]
                ? displayFields[idf - 1]?.name?.split(".")
                : [];

              if (delimiter) {
                val =
                  // (displayFields[idf + 1]
                  //   ? displayFields[idf + 1]?.visible
                  //   : true) &&
                  isDefined(
                    fieldValue[
                      fieldsArr1?.length > 1 ? fieldsArr1[1] : fieldsArr1[0]
                    ]
                  ) && typeof val === "string"
                    ? val?.concat(delimiter)
                    : val;
              } else {
                val =
                  isDefined(
                    fieldValue[
                      fieldsArr1?.length > 1 ? fieldsArr1[1] : fieldsArr1[0]
                    ]
                  ) && typeof val === "string"
                    ? val?.concat(" ")
                    : val;
              }
              if (displayFields[idf - 1]?.delimiter) {
                val =
                  displayFields[idf - 1] &&
                  displayFields[idf - 1]?.visible === false &&
                  isDefined(
                    fieldValue[
                      fieldsArr?.length > 1 ? fieldsArr[1] : fieldsArr[0]
                    ]
                  ) &&
                  typeof val === "string"
                    ? displayFields[idf - 1]?.delimiter?.concat(val)
                    : val;
              } else {
                let defaultDelimiter = " ";
                val =
                  isDefined(
                    fieldValue[
                      fieldsArr?.length > 1 ? fieldsArr[1] : fieldsArr[0]
                    ]
                  ) && typeof val === "string"
                    ? defaultDelimiter?.concat(val)
                    : val;
              }

              if (fullValue?.length > 0) fullValue = fullValue?.concat(val);
              else fullValue = val;
            } else {
              value = fieldValue[name];
            }
          });
        }
        value = fullValue;
      }
    }

    if (fieldValue) {
      if (Array.isArray(fieldValue) && fieldValue?.length > 0)
        isValueExist = true;
      else if (
        fieldValue &&
        typeof fieldValue === "object" &&
        Object.values(fieldValue)?.filter((e) => e)?.length > 0
      )
        isValueExist = true;
    }

    // let arr = textExtractor(fieldValue, fieldmeta)
    //   .split("|")
    //   .filter((fl) => !["", null, undefined].includes(fl));

    let { isClickable = true, hideAssignment, canUpdate } = fieldmeta;

    const renderAddFieldValue = () => (
      // <DisplayIconButton
      //   size="small"
      //   systemVariant="success"
      //   onClick={() =>
      //     writeAccess
      //       ? handleAddFieldValue(fieldValue, fieldmeta, rowData)
      //       : null
      //   }
      // >
      <AddOutline
        style={{
          fontSize: "16px",
          opacity: writeAccess ? "" : 0.6,
          color: "#4caf50",
        }}
        onClick={() => {
          setSummaryScrollPosition();
          return writeAccess
            ? handleAddFieldValue(fieldValue, fieldmeta, rowData)
            : null;
        }}
      />
      // </DisplayIconButton>
    );

    const renderRemoveFieldValue = (index) => (
      // <DisplayIconButton
      //   size="small"
      //   systemVariant="secondary"
      //   onClick={() =>
      //     writeAccess
      //       ? setDialogProps({
      //           testid: "summaryDelete",
      //           open: true,
      //           title: "Are you sure you want to unassign?",
      //           message: "You cannot undo this action",
      //           cancelLabel: "Cancel",
      //           confirmLabel: "Yes, Unassign",
      //           onCancel: () => {
      //             setDialogProps({ open: false });
      //           },
      //           onConfirm: () => {
      //             handleRemoveFieldValue(fieldValue, fieldmeta, rowData, index);
      //             setDialogProps({ open: false });
      //             setSnackBar({
      //               message: "Successfully Unassigned",
      //               severity: "success",
      //             });
      //           },
      //         })
      //       : null
      //   }
      // >
      <RemoveOutline
        style={{
          fontSize: "16px",
          opacity: writeAccess ? "" : 0.6,
          color: "#f50057",
        }}
        onClick={() => {
          setSummaryScrollPosition();
          return writeAccess
            ? setDialogProps({
                testid: "summaryDelete",
                open: true,
                title: "Are you sure you want to unassign?",
                message: "You cannot undo this action",
                cancelLabel: "Cancel",
                confirmLabel: "Yes, Unassign",
                onCancel: () => {
                  setDialogProps({ open: false });
                },
                onConfirm: () => {
                  handleRemoveFieldValue(fieldValue, fieldmeta, rowData, index);
                  setDialogProps({ open: false });
                  setSnackBar({
                    message: "Successfully Unassigned",
                    severity: "success",
                  });
                },
              })
            : null;
        }}
      />
      // </DisplayIconButton>
    );

    const renderValue = (value, index) => {
      if (value && typeof value == "object") {
        value = Object.values(value).map((e) => e?.name || "");
        value = value.join(" / ");
      }
      let number = Math.floor(Math.random() * 100 + 1);
      return (
        <div style={{ display: "flex", alignItems: "center", height: "30px" }}>
          {!hideAssignment &&
            canUpdate &&
            referenceIndex === 1 &&
            showAssignmentButtons &&
            multiSelect &&
            readAccess &&
            renderRemoveFieldValue(index)}
          <div
            key={referenceIndex + "_" + value + "_" + number}
            onClick={() => {
              if (readAccess === false) isClickable = false;
              if (isClickable && !isPublicUser) {
                if (Array.isArray(fieldValue) && fieldmeta?.multiSelect) {
                  handleDetailPageModal(fieldmeta, fieldValue[index]);
                } else {
                  handleDetailPageModal(fieldmeta, fieldValue);
                }
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              cursor: isClickable && isPublicUser && "pointer",
              color: isClickable && "#308cf7",
              paddingLeft: "5px",
            }}
          >
            {value}
          </div>
        </div>
      );
    };

    return (
      <div
        style={{
          display: "flex",
          gap: 5,
          cursor: isClickable && writeAccess && "pointer",
          alignItems: "center",
        }}
      >
        {/* ADD and Remove button before the field */}
        {multiSelect ? (
          <>
            {referenceIndex === 1 &&
              !hideAssignment &&
              showAssignmentButtons &&
              canUpdate &&
              readAccess &&
              renderAddFieldValue()}
          </>
        ) : (
          <>
            {referenceIndex === 1 ? (
              isValueExist ? (
                <>
                  {!hideAssignment &&
                    canUpdate &&
                    showAssignmentButtons &&
                    !isPublicUser &&
                    readAccess &&
                    renderRemoveFieldValue()}
                </>
              ) : (
                <>
                  {!hideAssignment &&
                    canUpdate &&
                    showAssignmentButtons &&
                    !isPublicUser &&
                    readAccess &&
                    renderAddFieldValue()}
                </>
              )
            ) : (
              <></>
            )}
          </>
        )}
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          {Array.isArray(value)
            ? value?.map((e, index) => renderValue(e, index))
            : renderValue(value, 0)}
        </div>
      </div>
    );
  };

  const getTraingDetailsColor = (trainData) => {
    trainData = trainData?.filter(
      (fl) =>
        !["", null, undefined].includes(fl.totalCompleted) &&
        !["", null, undefined].includes(fl.mandatoryHour) &&
        !["", null, undefined].includes(fl.name)
    );
    let hourCompleted = trainData?.some(
      (el) => el.totalCompleted < el.mandatoryHour
    );
    if (trainData?.length > 0) {
      return hourCompleted ? "red" : "green";
    } else {
      return "orange";
    }
  };

  const getTrainingModal = (props) => {
    let { value, fieldmeta, handleTraingModal, setCourseModal } = props;
    let fieldValue = getTraingDetailsColor(value);
    return (
      <div
        style={{
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}
      >
        <DisplayIconButton
          onClick={() => {
            handleTraingModal(fieldmeta, value);
          }}
        >
          <Info
            style={{
              fontSize: "16px",
              color: "#146CAF",
            }}
          />
        </DisplayIconButton>
        <DisplayText style={{ color: fieldValue }}>
          {fieldValue === "orange"
            ? "Not Scheduled"
            : fieldValue === "red"
            ? "Pending"
            : "Completed"}
        </DisplayText>
      </div>
    );
  };

  const GridCellBuilder = (props) => {
    const [displayModal, setDisplayModal] = useState({
      show: false,
      content: null,
    });
    let {
      data,
      metadata,
      fieldmeta,
      path,
      cellCallBack,
      // writeAccess = true,
      cellEditCallBack,
      formData,
      referenceIndex = 0,
      handleDetailPageModal,
      setCourseModal,
      handleTraingModal,
      businessType,
      themeObj,
      params,
      ...rest
    } = props || {};

    color = themeObj?.bgColor || "#4caf50";

    let { writeAccess = true, wholeData: rowData } = data || {};

    let value = get(data, path, undefined);

    const isImage = (val) => new RegExp("image/*").test(val);
    let { values, disableCellEdit } = fieldmeta;
    const showIcon = () => values?.find((i) => i.value === value)?.icon;
    const showIconColor = () =>
      values?.find((i) => i.value === value)?.iconColor;

    const getArchiveStatus = () => {
      return params?.entityname === "ResidentAssessment" &&
        rowData?.sys_entityAttributes?.activeStatus === "Archived"
        ? false
        : true;
    };

    const displayDose = (timeSlots) => {
      return (timeSlots || []).map((dose) => {
        return (
          <div style={{ display: "flex", fontSize: "12px" }}>
            <span style={{ width: "55px" }}>
              {textExtractor(dose?.startDate, { type: "TIMECLOCK" })}
            </span>{" "}
            Qty : {dose.quantity || ""}
          </div>
        );
      });
    };

    if (
      value ||
      ["boolean", "number"].includes(typeof value) ||
      ["LIST", "REFERENCE", "PROFILEPIC", "TRAINING"]?.includes(fieldmeta?.type)
    )
      switch (fieldmeta?.type) {
        case "PROFILEPIC": {
          let { sys_entityAttributes: wholeData } = rowData || {};
          return businessType === "NUEASSIST" ? (
            <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
              <DisplayAvatar
                src={value?.doc_url}
                style={{ borderRadius: "50%", width: "40px", height: "40px" }}
              >
                {getAvatarText(
                  wholeData?.firstName + " " + wholeData?.lastName
                )}
              </DisplayAvatar>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src={textExtractor(value, fieldmeta)}
                alt="Profile_picture"
                style={{ borderRadius: "50%", width: "30px", height: "30px" }}
              />
            </div>
          );
        }
        case "REFERENCE": {
          return getReferenceBuilder({
            data,
            metadata,
            path,
            fieldmeta,
            rowData,
            referenceIndex,
            handleDetailPageModal,
            businessType,
            ...rest,
          });
        }
        case "TRAINING": {
          return getTrainingModal({
            value,
            fieldmeta,
            handleTraingModal,
            setCourseModal,
          });
        }
        case "LIST": {
          let textColor = fieldmeta?.values.find((e) => e.id === value)?.color;
          return (
            <div
              style={{
                display: "flex",
                textOverflow: "ellipsis",
                alignItems: "center",
              }}
            >
              {fieldmeta?.canUpdate && !disableCellEdit && getArchiveStatus() && (
                <EditOutlinedIcon
                  style={{
                    fontSize: "16px",
                    opacity: writeAccess ? "" : 0.6,
                    margin: "5px",
                    color: "#2196F3",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    setSummaryScrollPosition();
                    return writeAccess
                      ? cellEditCallBack(fieldmeta, rowData)
                      : null;
                  }}
                />
                // </DisplayIconButton>
              )}
              <div
                style={{
                  color: textColor ? textColor : "#000000",
                  display: "flex",
                  gap: !showIcon() && showIconColor() ? 2 : 16,
                }}
              >
                {showIcon() && (
                  <div
                    style={{
                      borderRadius: "50%",
                      width: "1px",
                      display: "flex",
                      alignSelf: "center",
                    }}
                  >
                    <img height={15} width={15} src={showIcon()} />
                  </div>
                )}
                {!showIcon() && showIconColor() && (
                  <div
                    style={{
                      borderRadius: "50%",
                      height: "15px",
                      width: "15px",
                      display: "flex",
                      alignSelf: "center",
                      backgroundColor: values?.find((i) => i.value === value)
                        ?.iconColor,
                    }}
                  ></div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignSelf: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {textExtractor(value, fieldmeta)}
                </div>
              </div>
            </div>
          );
        }
        case "CHECKBOX": {
          return (
            <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {textExtractor(value, fieldmeta)}
            </div>
          );
        }
        case "DATE": {
          if (value?.length && typeof value === "object") {
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1.5,
                }}
              >
                {value.map((item) => {
                  return (
                    <div
                      style={{
                        display: "flex",
                        cursor: "pointer",
                        gap: 5,
                        alignItems: "center",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {textExtractor(
                        item[fieldmeta.name] || item.date,
                        fieldmeta
                      )}
                    </div>
                  );
                })}
              </div>
            );
          } else {
            return (
              <div
                style={{
                  display: "flex",
                  cursor: "pointer",
                  gap: 5,
                  alignItems: "center",
                  textOverflow: "ellipsis",
                }}
              >
                {textExtractor(value, fieldmeta)}
              </div>
            );
          }
        }
        case "EMAIL": {
          return (
            <div
              style={{
                display: "flex",
                cursor: "pointer",
                gap: 4,
                textDecoration: "underline #308cf7",
                textOverflow: "ellipsis",
              }}
            >
              {textExtractor(value, fieldmeta)}
            </div>
          );
        }
        case "DECIMAL":
        case "NUMBER": {
          return (
            <div style={{ paddingLeft: "10px" }}>
              {textExtractor(value, fieldmeta)}
            </div>
          );
        }
        case "DOCUMENT": {
          if (value !== undefined && value?.length) {
            return (
              <div style={{ display: "flex", gap: 30, overflow: "visible" }}>
                {value?.map((i) => {
                  if (isImage(i?.contentType)) {
                    return (
                      <div
                        className="img-hover-zoom"
                        style={{
                          display: "flex",
                          marginLeft: "40px",
                          height: "50px",
                          width: "60px",
                        }}
                      >
                        <img maxheight="40" maxwidth="40" src={i?.doc_url} />
                      </div>
                    );
                  }
                })}
              </div>
            );
          } else return textExtractor(value, fieldmeta);
        }
        case "TOGGLE":
        case "RADIO": {
          let radioTextColor = fieldmeta?.values?.find(
            (e) => e?.title === value
          )?.color;
          return (
            <div
              style={{
                display: "flex",
                gap: 6,
                textOverflow: "ellipsis",
                color: radioTextColor ? radioTextColor : "#000000",
              }}
            >
              {textExtractor(value, fieldmeta)} <br />
              {showIcon() && (
                <div
                  style={{
                    borderRadius: "50%",
                    height: "30px",
                    width: "30px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img maxheight="40" maxwidth="40" src={showIcon()} />
                </div>
              )}
            </div>
          );
        }
        case "PICTURETEXTBOX": {
          if (value)
            return (
              <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {textExtractor(value, fieldmeta)}
              </div>
            );
        }
        // case "TASK": {
        //   console.log("value", value);
        //   if (value) {
        //     let { taskFrequency = "" } = value;
        //     switch (taskFrequency) {

        //       case "DAILY": {
        //         let { timeSlots = [] } = value;

        //         return <div style={{ display: "flex", flexDirection: "column", lineHeight: "15px", overflow: "auto" }}>
        //           <div style={{ display: "flex", fontWeight: 450, padding: "5px 0px" }}>Daily</div>
        //           {displayDose(timeSlots)}
        //         </div>
        //       }

        //       case "WEEKLY": {
        //         let { selected = [], timeSlots = [] } = value;
        //         let weekLength = selected?.length || 0

        //         return <div style={{ display: "flex", flexDirection: "column", lineHeight: "15px", overflow: "auto" }}>
        //           <div style={{ display: "flex", fontWeight: 450, padding: "5px 0px" }}>Weekly</div>
        //           <div style={{ display: "flex", fontSize: "12px" }}>{weekLength === 7 ? "every day" : selected.map((week, i) => (makeUpperCase(week.title)))?.toString()} </div>
        //           {displayDose(timeSlots)}
        //         </div>
        //       }

        //       case "MONTHLY": {
        //         let { dates = [] } = value || {};
        //         const fieldMeta = { type: "DATE" }
        //         return <div style={{ display: "flex", flexDirection: "column", lineHeight: "15px", overflow: "auto" }}>
        //           <div style={{ display: "flex", fontWeight: 450, padding: "5px 0px" }}>Monthly <ToolTipWrapper placement="bottom-start" title="See more"><span style={{ marginLeft: "3px" }}>  <Read style={{ fontSize: "18px", cursor: 'pointer' }} onClick={() => setDisplayModal({ open: true, content: dates })} /></span></ToolTipWrapper> </div>
        //           {dates.map(obj => {
        //             const { date } = obj
        //             return <div style={{ display: "flex", fontSize: "12px" }}>{textExtractor(date, fieldMeta)}</div>
        //           })}

        //           <DisplayModal
        //             className="detail-page-modal"
        //             open={displayModal.open}
        //             fullWidth={true}
        //             maxWidth="sm"
        //             style={{ padding: "20px", height: "calc(100vh - 189px)", }}
        //             onClose={() => setDisplayModal({ open: false })}
        //           >
        //             <div
        //               style={{
        //                 display: "flex",
        //                 flexDirection: "column",
        //                 width: "100%",
        //                 backgroundColor: color,
        //                 color: "white",
        //                 padding: "12px",
        //               }}
        //             >
        //               <span style={{ display: "flex", justifyContent: "space-between" }}>
        //                 <DisplayText variant="subtitle1">
        //                   <b>Monthly Dosage details</b>
        //                 </DisplayText>
        //                 <DisplayIconButton onClick={() => setDisplayModal({ open: false })}>
        //                   <Close size="small" style={{ color: "white" }} />
        //                 </DisplayIconButton>
        //               </span>
        //             </div>
        //             <div
        //               style={{
        //                 display: "flex",
        //                 flexDirection: "column",
        //                 width: "100%",
        //                 fontSize: "14px",
        //                 padding: "12px",
        //               }}
        //             >
        //               <table style={{ width: "100%", borderCollapse: "collapse" }}>
        //                 <thead></thead>
        //                 <tbody>
        //                   <tr>
        //                     <th>Date</th>
        //                     <th>Time Slots</th>
        //                   </tr>
        //                   {displayModal?.content?.map((item, index) => {
        //                     const { date, timeSlots } = item || {}
        //                     return <><tr >
        //                       <th rowSpan={(timeSlots.length)}>{textExtractor(date, fieldMeta)}</th>
        //                       <td>On: {textExtractor(timeSlots[0].startDate, fieldMeta)}<br />Quantity: {timeSlots[0].quantity}</td>
        //                     </tr>
        //                       {timeSlots.slice(1).map((slot, slotIndex) => (
        //                         <tr key={slotIndex}>
        //                           <td>On: {textExtractor(slot.startDate, fieldMeta)}<br />Quantity: {slot.quantity}</td>
        //                         </tr>
        //                       ))}
        //                     </>

        //                   })}
        //                 </tbody>
        //               </table>

        //             </div>
        //           </DisplayModal >
        //         </div >
        //       }
        //     }
        //   }

        //   if (value)
        //     return (
        //       <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        //         {textExtractor(value, fieldmeta)}
        //       </div>
        //     );
        // }
        case "AGENCYLOGO": {
          let { agencyLogo, agencyName } = value || {};
          return (
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                justifyItems: "center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ImageWithFallback
                  src={agencyLogo}
                  alt={agencyName}
                  style={{ width: "30px", height: "30px" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <DisplayText style={{ fontSize: 10 }}>{agencyName}</DisplayText>
              </div>
            </div>
          );
        }
        case "SUGGESTION": {
          const { medicationDetails, typeOfAdministration } =
            props?.data?.wholeData?.sys_entityAttributes || {};
          return (
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "flex",
              }}
            >
              {textExtractor(value, fieldmeta)}
              <div
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  gap: 1,
                }}
              >
                {medicationDetails?.controlledSubstance === "Yes" && value && (
                  <img
                    //add the controlled substance icon url here
                    src="https://nueassist-icon.s3.us-west-2.amazonaws.com/icons/controlledsubstance.svg"
                    width="32"
                    height="32"
                  />
                )}
                {value && typeOfAdministration === "PRN(as needed)" && (
                  <img
                    src="https://nueassist-icon.s3.us-west-2.amazonaws.com/icons/prnmedication.svg"
                    width="32"
                    height="32"
                  />
                )}
              </div>
            </div>
          );
        }
        default: {
          if (value)
            if (typeof value === "object" && value?.length) {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: 1.5,
                  }}
                >
                  {value.map((item) => {
                    return (
                      <span
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {textExtractor(item[fieldmeta.name], fieldmeta)}
                      </span>
                    );
                  })}
                </div>
              );
            } else {
              return (
                <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {textExtractor(value, fieldmeta)}
                </div>
              );
            }
          else return "";
        }
      }
    else return "";
  };

  return { GridCellBuilder };
};

export default AgCellBuilder;
