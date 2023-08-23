import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { StatefulDetailWrapper } from "../../map_container/stateful_detail_wrapper";
import {
  DisplayGrid,
  DisplayReadMode,
  DisplayDivider,
} from "components/display_components";
import { get } from "utils/services/helper_services/object_methods";
import { useDetailData, imMutate } from "../detail_state";
import {
  SystemAgencySharing,
  SystemApproval,
  SystemApprovals,
  SystemArray,
  SystemHistory,
  SystemCamera,
  SystemCheckbox,
  SystemColorCodedList,
  SystemColorPicker,
  SystemCurrency,
  SystemDataRenderer,
  SystemDataPairedList,
  SystemDataTable,
  SystemDate,
  SystemDaterange,
  SystemDateTime,
  SystemDecimal,
  SystemDynamicArray,
  SystemDynamicList,
  SystemImageViewer,
  SystemSignature,
  SystemEditor,
  SystemEmail,
  SystemFormula,
  SystemInlineFiles,
  SystemRecognizer,
  SystemLatLong,
  SystemDirectivePicker,
  SystemList,
  SystemLiveStream,
  SystemLineItem,
  SystemLineItemTotal,
  SystemLoadPic,
  SystemMask,
  SystemNumber,
  SystemObject,
  SystemPairedList,
  SystemPassword,
  SystemPermission,
  SystemPhoneNumber,
  SystemRadio,
  SystemReference,
  SystemSequence,
  SystemSubSection,
  SystemTextarea,
  SystemTextbox,
  SystemTime,
  SystemTimeClock,
  SystemToggle,
  SystemUrl,
  SystemVideoStream,
  SystemEventPicker,
  SystemAssessment,
  SystemPictureTextbox,
  SystemTimezone,
} from "components/system_components";
import { computeColSpan } from "../styles";
import { UserFactory } from "utils/services/factory_services";

const Wrapper = ({ children, ...gridProps }) => {
  gridProps.style = { ...gridProps.style, alignSelf: "baseline" };
  let paddingValue = gridProps?.padding ? gridProps?.padding : "0.5rem";
  const useStyles = makeStyles({
    w_c: {
      padding: "0rem 0.5rem 0rem 0.5rem",
      flex: "auto",
    },
    w: {
      padding: paddingValue,
      backgroundColor: "#ffffff",
      justifyContent: "start",
      alignItems: "center",
      borderRadius: "4px",
    },
  });
  const classes = useStyles();
  return (
    <DisplayGrid
      item
      className={classes.w_c}
      fluid
      container
      display="flex"
      {...gridProps}
    >
      <DisplayGrid
        item
        container
        className={classes.w}
        alignItems="flex-start"
        display="flex"
        flex={1}
      >
        {children}
      </DisplayGrid>
    </DisplayGrid>
  );
};

const FormDataWrap = ({ Component, ...rest }) => {
  const { formData } = useDetailData() || {};
  return <Component {...rest} formData={formData} />;
};

export const Iterator = (props) => {
  let { taskBulkData, ...rest } = props;
  const { formData } = useDetailData() || rest || {};
  const { fieldmeta, stateParams, enableSummaryEdit = false } = rest;
  const { disableOn, disable, colSpan } = fieldmeta;

  const { checkFieldAccess } = UserFactory();

  const [open, setOpen] = useState(false);

  rest.fieldmeta = imMutate(rest.fieldmeta);

  let componentWidth = computeColSpan(colSpan);
  if (disableOn && disableOn.length) {
    let disableArrVal = false;
    disableOn.map(({ path, value }) => {
      disableArrVal =
        disableArrVal ||
        value.includes(get(formData?.sys_entityAttributes, path));
    });
    rest.fieldmeta["disable"] = disable || disableArrVal;
  }

  // render Methods
  const renderField = () => {
    let mode = stateParams?.mode || "";
    if (fieldmeta.skipReadMode) mode = "EDIT";
    if (
      ["EDIT", "READ", "CLONE", ""].includes(mode) ||
      (!fieldmeta.hideInNewMode && mode === "NEW")
    ) {
      switch (mode) {
        case "READ": {
          switch (fieldmeta.type) {
            case "AGENCYSHARING":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemAgencySharing} {...rest} />
                </Wrapper>
              );
            case "APPROVAL":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemApproval} {...rest} />
                </Wrapper>
              );
            case "NEWAPPROVAL":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemApprovals} {...rest} />
                </Wrapper>
              );
            case "ASSESSMENT":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemAssessment} {...rest} />
                </Wrapper>
              );
            case "ARRAY":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemArray} {...rest} />
                </Wrapper>
              );

            case "CAMERASTREAM":
              return (
                <Wrapper style={{ width: "700px" }}>
                  <SystemCamera {...rest} />
                </Wrapper>
              );

            case "CAMERA":
              return (
                <Wrapper>
                  <SystemInlineFiles {...rest} />
                </Wrapper>
              );

            case "COLORCODEDLIST":
              return (
                <Wrapper
                  sstyle={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemColorCodedList {...rest} />
                </Wrapper>
              );

            case "COLORPICKER":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemColorPicker {...rest} />
                </Wrapper>
              );

            case "DATARENDERER":
              return (
                <Wrapper>
                  <SystemDataRenderer {...rest} />
                </Wrapper>
              );

            case "DATATABLE":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemDataTable} {...rest} />
                </Wrapper>
              );

            case "DOCUMENT":
              return (
                <Wrapper>
                  <SystemInlineFiles {...rest} />
                </Wrapper>
              );

            case "DYNAMICLIST": {
              let width = fieldmeta.values.length * 350;
              return (
                <Wrapper
                  style={{
                    maxWidth: "100%",
                    width: `${width}px`,
                    display: "table",
                  }}
                >
                  <SystemDynamicList {...rest} />
                </Wrapper>
              );
            }

            case "DESIGNER":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "100%" }}
                >
                  <FormDataWrap Component={StatefulDetailWrapper} {...rest} />
                </Wrapper>
              );

            case "EDITOR":
              return (
                <Wrapper>
                  <SystemEditor {...rest} />
                </Wrapper>
              );

            case "EMPTY": {
              let width = componentWidth ? componentWidth : "33%";
              return (
                <div
                  style={{
                    width,
                    display: "flex",
                    flex: "auto",
                  }}
                ></div>
              );
            }

            case "FILEUPLOADER":
              return null;

            case "HISTORY":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemHistory} {...rest} />
                </Wrapper>
              );
            case "IMAGEVIEWER": {
              let width = componentWidth ? componentWidth : "33%";
              return (
                <Wrapper style={{ width, justifyContent: "center" }}>
                  <FormDataWrap Component={SystemImageViewer} {...rest} />
                </Wrapper>
              );
            }

            case "LIVESTREAM":
              let width = componentWidth ? componentWidth : "33%";
              return (
                <Wrapper
                  style={{
                    width,
                    minWidth: "200px",
                    justifyContent: "center",
                  }}
                >
                  <FormDataWrap Component={SystemLiveStream} {...rest} />
                </Wrapper>
              );
            case "LINEITEM": {
              return (
                <Wrapper
                  style={{
                    width: "90%",
                    marginRight: ".3rem",
                    padding: "10px",
                  }}
                >
                  <FormDataWrap Component={SystemLineItem} {...rest} />
                </Wrapper>
              );
            }
            case "LINEITEMTOTAL": {
              console.log("inside the itarator -> ");
              return (
                <Wrapper
                  style={{
                    width: "90%",
                    marginRight: ".3rem",
                    padding: "10px",
                  }}
                >
                  <FormDataWrap Component={SystemLineItemTotal} {...rest} />
                </Wrapper>
              );
            }

            case "SIGNATURE":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <FormDataWrap Component={SystemSignature} {...rest} />
                </Wrapper>
              );

            case "LATLONG":
              return (
                <Wrapper
                  style={{
                    width: componentWidth ? componentWidth : "100%",
                    minWidth: "200px",
                  }}
                >
                  <SystemLatLong {...rest} />
                </Wrapper>
              );

            case "LOADPICS":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemLoadPic {...rest} />
                </Wrapper>
              );

            case "MASK":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemMask {...rest} />
                </Wrapper>
              );

            case "OBJECT":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemObject} {...rest} />
                </Wrapper>
              );

            case "PERMISSION":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemPermission} {...rest} />
                </Wrapper>
              );

            case "RECOGNIZER":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemRecognizer {...rest} />
                </Wrapper>
              );

            case "REFERENCE": {
              return (
                <Wrapper
                  style={{
                    width: componentWidth ? componentWidth : "100%",
                    minWidth: "200px",
                  }}
                >
                  <FormDataWrap Component={SystemReference} {...rest} />
                </Wrapper>
              );
            }
            case "SUBSECTION":
              return (
                <DisplayGrid container style={{ padding: "0 0 0 5px" }}>
                  <SystemSubSection {...rest} />
                </DisplayGrid>
              );

            case "TIME":
              return (
                <Wrapper
                  style={{
                    width: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <FormDataWrap Component={SystemTime} {...rest} />
                </Wrapper>
              );

            case "TIMECLOCK":
              return (
                <Wrapper
                  style={{
                    width: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <FormDataWrap Component={SystemTimeClock} {...rest} />
                </Wrapper>
              );

            case "TOGGLE":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemToggle {...rest} />
                </Wrapper>
              );

            case "VIDEOSTREAM":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemVideoStream {...rest} />
                </Wrapper>
              );
            case "RADIO":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemRadio {...rest} formData={formData} />
                </Wrapper>
              );

            case "LIST":
              return (
                <Wrapper
                  style={{
                    width: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <SystemList {...rest} />
                </Wrapper>
              );
            default:
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <DisplayReadMode {...rest} />
                </Wrapper>
              );
          }
        }
        default: {
          switch (fieldmeta.type) {
            case "AGENCYSHARING":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemAgencySharing} {...rest} />
                </Wrapper>
              );
            case "HISTORY":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemHistory} {...rest} />
                </Wrapper>
              );
            case "APPROVAL":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemApproval} {...rest} />
                </Wrapper>
              );
            case "NEWAPPROVAL":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemApprovals} {...rest} />
                </Wrapper>
              );
            case "ARRAY":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemArray} {...rest} />
                </Wrapper>
              );
            case "ASSESSMENT":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemAssessment} {...rest} />
                </Wrapper>
              );
            case "CAMERA":
              return (
                <Wrapper>
                  <SystemInlineFiles {...rest} />
                </Wrapper>
              );
            case "CAMERASTREAM":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "100%" }}
                >
                  <SystemCamera {...rest} />
                </Wrapper>
              );
            case "CHECKBOX": {
              let width = componentWidth ? componentWidth : "33%";
              return (
                <Wrapper style={{ width: width }}>
                  <SystemCheckbox {...rest} />
                </Wrapper>
              );
            }
            case "COLORCODEDLIST":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemColorCodedList {...rest} />
                </Wrapper>
              );
            case "COLORPICKER":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemColorPicker {...rest} />
                </Wrapper>
              );
            case "CURRENCY":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemCurrency {...rest} />
                </Wrapper>
              );
            case "DATAPAIREDLIST":
              return (
                <Wrapper
                  style={{
                    width: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <SystemDataPairedList {...rest} />
                </Wrapper>
              );
            case "DATARENDERER":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemDataRenderer {...rest} />
                </Wrapper>
              );
            case "DATATABLE":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <FormDataWrap Component={SystemDataTable} {...rest} />
                </Wrapper>
              );

            case "DATE":
              return (
                <Wrapper
                  style={{
                    maxWidth: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <FormDataWrap Component={SystemDate} {...rest} />
                </Wrapper>
              );
            case "DATETIME":
              return (
                <Wrapper
                  style={{
                    maxWidth: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <SystemDateTime {...rest} />
                </Wrapper>
              );
            case "DATERANGE":
              const timer = fieldmeta.showTimer;
              let dWidth = timer ? "100%" : "33%";
              // if (!timer) style = { width: "700px" };
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : dWidth }}
                >
                  <SystemDaterange {...rest} />
                </Wrapper>
              );
            case "DECIMAL":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <FormDataWrap Component={SystemDecimal} {...rest} />
                </Wrapper>
              );
            case "DESIGNER":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "100%" }}
                >
                  <FormDataWrap Component={StatefulDetailWrapper} {...rest} />
                </Wrapper>
              );
            case "DIRECTIVEPICKER":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <FormDataWrap Component={SystemDirectivePicker} {...rest} />
                </Wrapper>
              );
            case "DIVIDER": {
              return <DisplayDivider {...fieldmeta} />;
            }

            case "DOCUMENT":
              return (
                <Wrapper>
                  <SystemInlineFiles {...rest} />
                </Wrapper>
              );
            case "DYNAMICLIST": {
              let width = componentWidth ? componentWidth : "100%";
              return (
                <Wrapper
                  style={{
                    maxWidth: "100%",
                    maxWidth: width,
                    display: "table",
                    minWidth: "200px",
                  }}
                >
                  <SystemDynamicList {...rest} />
                </Wrapper>
              );
            }
            case "DYNAMICARRAY": {
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "100%" }}
                >
                  <SystemDynamicArray {...rest} />
                </Wrapper>
              );
            }
            case "EDITOR":
              return (
                <Wrapper>
                  <SystemEditor {...rest} />
                </Wrapper>
              );
            case "EMAIL":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemEmail {...rest} />
                </Wrapper>
              );
            case "EMPTY": {
              let width = fieldmeta.width ? `${fieldmeta.width}px` : "33%";
              return (
                <div
                  style={{
                    width,
                    display: "flex",
                    flex: "auto",
                  }}
                ></div>
              );
            }
            case "FORMULA":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <FormDataWrap Component={SystemFormula} {...rest} />
                </Wrapper>
              );
            case "IMAGEVIEWER": {
              let width = componentWidth ? componentWidth : "33%";
              return (
                <Wrapper style={{ maxWidth: width, justifyContent: "center" }}>
                  <FormDataWrap Component={SystemImageViewer} {...rest} />
                </Wrapper>
              );
            }
            case "SIGNATURE":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <FormDataWrap Component={SystemSignature} {...rest} />
                </Wrapper>
              );
            case "LIST":
              return (
                <Wrapper
                  style={{
                    maxWidth: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <SystemList {...rest} />
                </Wrapper>
              );
            case "LIVESTREAM":
              let width = componentWidth ? componentWidth : "33%";
              return (
                <Wrapper style={{ maxWidth: width }}>
                  <FormDataWrap Component={SystemLiveStream} {...rest} />
                </Wrapper>
              );
            case "EVENTLIST":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemEventPicker {...rest} />
                </Wrapper>
              );
            case "LATLONG":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "100%" }}
                >
                  <SystemLatLong {...rest} />
                </Wrapper>
              );
            case "LOADPICS":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemLoadPic {...rest} />
                </Wrapper>
              );
            case "LINEITEM": {
              return (
                <Wrapper
                  style={{
                    width: componentWidth ? componentWidth : "33%",
                  }}
                >
                  <FormDataWrap Component={SystemLineItem} {...rest} />
                </Wrapper>
              );
            }
            case "LINEITEMTOTAL": {
              return (
                <Wrapper
                  style={{
                    width: componentWidth ? componentWidth : "33%",
                  }}
                >
                  <FormDataWrap Component={SystemLineItemTotal} {...rest} />
                </Wrapper>
              );
            }
            case "MASK":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemMask {...rest} />
                </Wrapper>
              );
            case "NUMBER":
              return (
                <Wrapper
                  style={{
                    maxWidth: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <FormDataWrap Component={SystemNumber} {...rest} />
                </Wrapper>
              );
            case "OBJECT":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemObject} {...rest} />
                </Wrapper>
              );
            case "PAIREDLIST":
              // let level = fieldmeta?.level || 2;
              // let cWidth = level * 350 + level * 20;
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "100%" }}
                >
                  <SystemPairedList {...rest} />
                </Wrapper>
              );
            case "PASSWORD":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemPassword {...rest} />
                </Wrapper>
              );
            case "PERMISSION":
              return (
                <Wrapper>
                  <FormDataWrap Component={SystemPermission} {...rest} />
                </Wrapper>
              );
            case "PHONENUMBER":
              return (
                <Wrapper
                  style={{
                    maxWidth: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <SystemPhoneNumber {...rest} />
                </Wrapper>
              );
            case "RECOGNIZER":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemRecognizer {...rest} />
                </Wrapper>
              );
            case "RADIO":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemRadio {...rest} formData={formData} />
                </Wrapper>
              );
            case "REFERENCE": {
              let width = componentWidth ? componentWidth : "33%";
              return (
                <Wrapper style={{ maxWidth: width, minWidth: "200px" }}>
                  <SystemReference {...rest} />
                </Wrapper>
              );
            }
            case "SEQUENCE":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemSequence {...rest} />
                </Wrapper>
              );
            case "SUBSECTION":
              return (
                <DisplayGrid
                  container
                  style={{ padding: "0 0 0 5px", margin: 0 }}
                >
                  <SystemSubSection {...rest} />
                </DisplayGrid>
              );
            case "TEXTAREA":
              return (
                <Wrapper
                  style={{
                    maxWidth: componentWidth ? componentWidth : "100%",
                    minWidth: "200px",
                  }}
                >
                  <SystemTextarea {...rest} />
                </Wrapper>
              );
            case "TEXTBOX":
              return (
                <Wrapper
                  style={{
                    maxWidth: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <FormDataWrap Component={SystemTextbox} {...rest} />
                </Wrapper>
              );
            case "TIMEZONE":
              return (
                <Wrapper
                  style={{
                    maxWidth: componentWidth ? componentWidth : "33%",
                    minWidth: "200px",
                  }}
                >
                  <FormDataWrap Component={SystemTimezone} {...rest} />
                </Wrapper>
              );

            case "TOGGLE":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemToggle {...rest} />
                </Wrapper>
              );

            case "PICTURETEXTBOX":
              return (
                <Wrapper
                  style={{ maxWidth: componentWidth ? componentWidth : "33%" }}
                >
                  <FormDataWrap Component={SystemPictureTextbox} {...rest} />
                </Wrapper>
              );
            case "TIME":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <FormDataWrap Component={SystemTime} {...rest} />
                </Wrapper>
              );
            case "TIMECLOCK":
              return (
                <Wrapper
                  sstyle={{ width: componentWidth ? componentWidth : "100%" }}
                >
                  <FormDataWrap Component={SystemTimeClock} {...rest} />
                </Wrapper>
              );
            case "URL":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemUrl {...rest} formData={formData} />
                </Wrapper>
              );
            case "VIDEOSTREAM":
              return (
                <Wrapper
                  style={{ width: componentWidth ? componentWidth : "33%" }}
                >
                  <SystemVideoStream {...rest} />
                </Wrapper>
              );
            default:
              return null;
          }
        }
      }
    }
  };

  useEffect(() => {
    if (
      formData &&
      fieldmeta?.showOn?.values?.includes(
        formData?.sys_entityAttributes[fieldmeta?.showOn?.listenTo]
      )
    ) {
      setOpen(true);
    } else {
      setOpen(false);
    }
    if (
      taskBulkData &&
      fieldmeta?.showOn?.values?.includes(
        taskBulkData[fieldmeta?.showOn?.listenTo]
      )
    ) {
      setOpen(true);
    } else if (taskBulkData) {
      setOpen(false);
    }
    let fieldAccessParams = {
      appname: stateParams?.appname,
      modulename: stateParams?.modulename,
      entityname: stateParams?.groupname,
      fieldname: fieldmeta?.name,
      componentname: "",
      permissionType: "write",
    };
    const fieldWriteAccess = checkFieldAccess(fieldAccessParams);
    if (fieldWriteAccess) {
      let logicalAndArray = [];
      let a = fieldmeta?.lockOn?.dependencies?.map((eachField) => {
        if (
          formData &&
          eachField?.values.includes(
            formData?.sys_entityAttributes?.[eachField.toWatch]
          )
        ) {
          logicalAndArray.push(true);
        } else {
          logicalAndArray.push(false);
        }
      });
      if (fieldmeta?.lockOn?.type?.toUpperCase() === "AND") {
        if (logicalAndArray?.length > 0) {
          if (!logicalAndArray?.includes(false)) {
            setOpen(true);
            fieldmeta.canUpdate = false;
          } else {
            setOpen(false);
            fieldmeta.canUpdate = true;
          }
        }
      } else if (fieldmeta?.lockOn?.type?.toUpperCase() === "OR") {
        if (logicalAndArray.length > 0) {
          if (logicalAndArray.includes(true)) {
            setOpen(true);
            fieldmeta.canUpdate = false;
          } else {
            setOpen(false);
            fieldmeta.canUpdate = true;
          }
        }
      }
    }
  }, [formData, taskBulkData]);
  return (!fieldmeta.hasOwnProperty("showOn") &&
    (!fieldmeta.hasOwnProperty("hideOnDetail") || !fieldmeta.hideOnDetail)) ||
    enableSummaryEdit ||
    // !fieldmeta.hasOwnProperty("hideOnDetail")) ||
    open ? (
    renderField()
  ) : (
    <></>
  );
};
