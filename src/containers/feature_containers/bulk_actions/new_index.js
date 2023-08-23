import React, { useState, useEffect, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";
import {
  DisplayButton,
  DisplayText,
  DisplayDivider,
  DisplayIconButton,
} from "components/display_components";
import { Iterator } from "containers/composite_containers/detail_container/components/iterator";
import { SystemIcons } from "utils/icons";
import { styles } from "./styles";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { makeStyles } from "@material-ui/core/styles";
import { ThemeFactory } from "utils/services/factory_services";
import { bulkActions } from "utils/services/api_services/bulk_actions";
import { UsePosition } from "components/system_components/latlong/UsePosition";
import { isDefined } from "utils/services/helper_services/object_methods";
// import { SummaryGridContext } from "../../../nuegov/containers/summary_container/index";
import {
  formatDate,
  addHoursToDate,
  bufferTimeCrossed,
} from "utils/services/helper_services/date_methods";

const fieldsSupported = [
  "DECIMAL",
  "CHECKBOX",
  "COLORCODEDLIST",
  "COLORPICKER",
  "REFERENCE",
  "LIST",
  "RADIO",
  "TOGGLE",
  "DATAPAIREDLIST",
  "DATE",
  "DATETIME",
  "DECIMAL",
  "EMAIL",
  "NUMBER",
  "PAIREDLIST",
  "PASSWORD",
  "TEXTAREA",
  "TEXTBOX",
  "CURRENCY",
  "DYNAMICARRAY",
  "ARRAY",
  "OBJECT",
  "PHONENUMBER",
  "FORMULA",
  "DATERANGE",
  "URL",
  "EDITOR",
];

export const BulkActionsNew = (props) => {
  let {
    appname,
    modulename,
    entityname,
    selectedIds,
    fields,
    setClearSelected,
    setBulkModal,
    operationType,
    filters,
    collectionName,
    templatename,
    setBulkActionType,
    bulkPermision,
    entityGlobalSearch,
    selectedRows,
    sys_topLevel,
    modalTitle,
    actionDescription = undefined,
    refreshTable,
    screenType = "SUMMARY",
    relatedEntityInfo = {},
    delayHours,
    bufferTime,
    setSelectedTasks,
    panelId,
    metadata = {},
    refreshTaskPanel = () => {},
  } = props || {};
  // const [gridProps, dispatch] = useContext(SummaryGridContext);
  // const { selectedRows } = gridProps;
  const queryParams = queryString.parse(useLocation().search);
  const { modalName, countMessage, errorMessage } = bulkPermision;
  const { getUserInfo, getDetails, setUserSysEntityAttributes } = UserFactory();
  const { getVariantObj, getAllVariants } = ThemeFactory();
  const { setBackDrop, closeBackDrop, setSnackBar } = GlobalFactory();
  const { dark } = getVariantObj("primary");

  const { Close } = SystemIcons;
  const useStyles = makeStyles(styles);
  const classes = useStyles();
  const { username, firstName } = getUserInfo();
  let [newFormData, setFormData] = useState({});
  const history = useHistory();
  const { latitude, longitude } = UsePosition();
  const [addressComponent, setAddressComponent] = useState();
  let geocoder = new window.google.maps.Geocoder();

  // let res = Object.values(newFormData).some(el => ![null, "", undefined].includes(el));
  // console.log("res -> ", res);

  const getBuffer = (taskTimeObj, taskDateAndTime) => {
    const {
      timeSlotName = "",
      bufferTimeBeforeDelayHours,
      bufferTimeBeforePendingStatus,
    } = taskTimeObj || {};
    let taskTime =
      timeSlotName?.length > 0 ? taskTimeObj?.endDate : taskTimeObj?.startDate;

    let calculatedTime = addHoursToDate(
      taskTime || formatDate(),
      parseInt(bufferTimeBeforePendingStatus) || bufferTime,
      taskDateAndTime
    );
    let crossedTime = addHoursToDate(
      taskTime || formatDate(),
      parseInt(bufferTimeBeforeDelayHours) || delayHours,
      taskDateAndTime
    );

    let bufferTimeCalculated = bufferTimeCrossed(calculatedTime);
    let delayedHoursCrossed = bufferTimeCrossed(crossedTime);

    return bufferTimeCalculated && delayedHoursCrossed;
  };

  const calculateBuffer = () => {
    let a = selectedRows.map((eSR) => {
      return getBuffer(eSR.taskTimeObj, eSR.taskDateAndTime);
    });
    return a.filter((e) => e === false).length;
  };

  let bulkUpdateFields = sys_topLevel.filter((fl) => fl.type !== "SECTION");
  bulkUpdateFields = bulkUpdateFields
    .reduce((a, c) => {
      if (!a.length) a.push(c);
      if (a.length) {
        let doppelganger = a.findIndex((e) => e.name === c.name);
        if (doppelganger !== -1) {
          if (c.type && a[doppelganger].type === "LIST") {
            a[doppelganger].values = [...a[doppelganger].values, ...c.values];
            a[doppelganger].values = a[doppelganger].values.reduce((g, f) => {
              if (g.length === 0) g.push(f);
              else {
                let isDataPresent = g.find((e) => e.id == f.id);
                if (!isDataPresent) g.push(f);
              }
              return g;
            }, []);
          } else a[doppelganger] = { ...a[doppelganger], ...c };
        } else a.push(c);
      }
      return a;
    }, [])
    .reduce((finalArr, field) => {
      fields.map((e) => {
        if (field.name == e.name) finalArr.push({ ...field, ...e });
      });
      return finalArr;
    }, [])
    .map((el) => {
      delete el.hideOnDetail;
      delete el.disableOn;
      if (el.type === "LIST" && el.name === "taskStatus") {
        el.values = el.values.filter(
          (eachValue) =>
            !["Scheduled", "Pending", "Delayed"].includes(eachValue.id)
        );
      }
      return {
        ...el,
        // required: false,
        // disable: false,
      };
    });

  if (calculateBuffer() > 0) {
    bulkUpdateFields = bulkUpdateFields.filter(
      (ec) => ec.name !== "delayedReason"
    );
  }

  const checkForRequiredFields = () => {
    let requireField = false;
    if (panelId === "DCL") {
      if (selectedRows.length > 0) {
        let bulkRows = selectedRows?.map((esr) => {
          if (Object.keys(esr).length > 0 && esr?.inputFiledArray.length > 0) {
            let a = esr.inputFiledArray.map((eifa) => {
              if (eifa.inputRequired) {
                return (
                  esr.inputFieldObj.hasOwnProperty(eifa.name) &&
                  isDefined(esr.inputFieldObj[`${eifa.name}`])
                );
              } else {
                return true;
              }
            });
            return a[0];
          } else {
            return true;
          }
        });
        requireField =
          bulkRows.filter((e) => e === false).length > 0 ? false : true;
      }
    } else {
      requireField = true;
    }
    return requireField;
  };

  let renderBodyPart = () => {
    return bulkUpdateFields?.length > 0 && operationType === "UPDATE"
      ? bulkUpdateFields.map((eachField, i) => {
          if (fieldsSupported.includes(eachField.type) && eachField.canUpdate)
            return (
              <Iterator
                callbackError={() => {}}
                callbackValue={(data) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    [eachField.name]: data,
                  }));
                }}
                fieldmeta={eachField}
                key={`tf-${i}`}
                stateParams={{
                  metadata,
                }}
                taskBulkData={newFormData}
              />
            );
        })
      : operationType === "UPDATE" && (
          <DisplayText
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "10px",
            }}
          >
            {errorMessage[operationType]}
          </DisplayText>
        );
  };

  const handleBulkAction = async () => {
    let payload = {
      selectedIds: selectedRows.map((el) => el.sys_gUid),
      collectionName: collectionName,
      filters: filters,
      operationType: operationType,
      appname: appname,
      modulename: modulename,
      entityname: entityname,
      templatename: templatename,
      username: username,
      updatingFields: Object.keys(newFormData)
        .map((el) => {
          if (
            ![undefined, "", null].includes(newFormData[el]) &&
            newFormData[el]
          ) {
            return {
              fieldName: el,
              fieldValue: newFormData[el],
            };
          } else if (typeof newFormData[el] === "boolean") {
            return {
              fieldName: el,
              fieldValue: newFormData[el],
            };
          }
        })
        .filter((fl) => ![undefined, null, ""].includes(fl)),
    };
    let page = queryParams.page || 1;

    //handling the task reasons
    if (entityname === "Task") {
      if (
        payload.updatingFields.length > 0 &&
        payload.updatingFields.some((fl) => fl.fieldName === "reason")
      ) {
        if (newFormData["taskStatus"] === "Delayed") {
          payload.updatingFields.push({
            fieldName: "delayedReason",
            fieldValue: newFormData["reason"],
          });
        } else if (newFormData["taskStatus"] === "Canceled") {
          payload.updatingFields.push({
            fieldName: "canceledReason",
            fieldValue: newFormData["reason"],
          });
        } else if (newFormData["taskStatus"] === "Refused") {
          payload.updatingFields.push({
            fieldName: "refusedReason",
            fieldValue: newFormData["reason"],
          });
        }
      }

      payload.updatingFields = payload.updatingFields.filter(
        (fl) => fl.fieldName !== "reason"
      );

      let modifiedBy = [
        {
          fieldName: "modifiedTimeStamp",
          fieldValue: new Date().toISOString(),
        },
        {
          fieldName: "modifiedBy",
          fieldValue: getUserInfo(),
        },
        {
          fieldName: "modifiedLocation",
          fieldValue: {
            latitude,
            longitude,
            address: addressComponent?.length
              ? addressComponent[0]?.formatted_address
              : "Address cannot fetch ",
          },
        },
      ];

      payload.updatingFields = [...payload.updatingFields, ...modifiedBy];
    }

    //db operations
    if (operationType === "UPDATE") {
      await bulkActions
        .updateMany("", payload)
        .then((result) => {
          if (refreshTable) {
            setClearSelected(true);
            if (screenType !== "RELATION")
              refreshTable(entityGlobalSearch, page, queryParams);
            else
              refreshTable(
                entityGlobalSearch,
                1,
                {},
                screenType,
                relatedEntityInfo
              );
            setSnackBar({
              message: `Data ${operationType.toLowerCase()}d successfully`,
              severity: "success",
              classes: {
                color: "white",
              },
            });
          } else if (refreshTaskPanel) {
            refreshTaskPanel();
          } else {
            history.go();
          }
        })
        .catch((err) => {
          setSnackBar({
            message: `error while ${operationType.toLowerCase()}ing ${entityname}`,
            severity: "error",
          });
        });
    } else if (operationType === "DELETE") {
      await bulkActions
        .deleteMany("", payload)
        .then((result) => {
          if (refreshTable) {
            setClearSelected(true);
            if (screenType !== "RELATION")
              refreshTable(null, page, queryParams);
            else refreshTable(null, 1, {}, screenType, relatedEntityInfo);
            setSnackBar({
              message: `Data ${operationType.toLowerCase()}d successfully`,
              severity: "success",
              classes: {
                color: "white",
              },
            });
          } else history.go();
          setSnackBar({
            message: `Data ${operationType.toLowerCase()}d successfully`,
            severity: "success",
          });
        })
        .catch((err) => {
          setSnackBar({
            message: `error while ${operationType.toLowerCase()}ing ${entityname} `,
            severity: "error",
          });
        });
    } else {
      //if any use case in the future
    }

    // to deselct the selcted rows in grid
    if (setSelectedTasks) setSelectedTasks([]);
    if (setClearSelected) setClearSelected(true);
    setBulkModal(false);
  };

  const getLocation = () => {
    let Position = { lat: latitude, lng: longitude };
    geocoder.geocode({ location: Position }, function (results, status) {
      if (status === "OK") {
        if (results[0]) {
          setAddressComponent(results);
        }
      }
    });
  };

  useEffect(() => {
    getLocation();
  }, [latitude]);

  return (
    <div className={classes.main}>
      <div
        className={classes.heading}
        style={{ backgroundColor: dark.bgColor }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DisplayText
            variant="h6"
            style={{ padding: "10px", marginLeft: "0.5rem", color: "white" }}
          >
            {modalTitle}
          </DisplayText>
        </div>
        <DisplayIconButton
          systemVariant="primary"
          size="small"
          style={{
            display: "flex",
            alignSelf: "center",
            margin: ".3rem",
            color: "white",
          }}
          onClick={() => {
            setBulkModal(false);
            if (setSelectedTasks) setSelectedTasks([]);
            // setBulkActionType("");
            // dispatch({
            //   type: "SELECTED_DATA",
            //   payload: {
            //     selectedRows: [],
            //   },
            // });
          }}
        >
          <Close />
        </DisplayIconButton>
      </div>
      <DisplayDivider />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <DisplayText
          style={{
            padding: "10px",
            marginLeft: "0.5rem",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {/* No of {entityname}s Selected : {selectedRows?.length} */}
          {countMessage} &nbsp;{selectedRows?.length}
        </DisplayText>
        {actionDescription && (
          <DisplayText
            style={{
              padding: "10px",
              marginRight: "0.5rem",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {/* No of {entityname}s Selected : {selectedRows?.length} */}
            {actionDescription}
          </DisplayText>
        )}
        {!checkForRequiredFields() && (
          <DisplayText
            style={{
              padding: "10px",
              marginRight: "0.5rem",
              fontSize: 14,
              fontWeight: "600",
              color: "red",
            }}
          >
            Please fill the required input fields in each task
          </DisplayText>
        )}
      </div>
      <div className={classes.body}>
        <br />
        {checkForRequiredFields() ? renderBodyPart() : <></>}
      </div>
      <br />
      {
        <div className={classes.footer}>
          {checkForRequiredFields() && (
            <DisplayButton
              onClick={() => handleBulkAction()}
              size="small"
              variant="contained"
              disabled={
                operationType === "UPDATE" &&
                !Object.values(newFormData).every(
                  (el) => ![null, "", undefined].includes(el)
                )
              }
              systemVariant="primary"
              style={{
                display: "flex",
                alignSelf: "center",
                justifyContent: "center",
                margin: "0.5rem",
              }}
            >
              {operationType === "UPDATE" ? "Update" : "Delete"}
            </DisplayButton>
          )}
        </div>
      }
    </div>
  );
};
