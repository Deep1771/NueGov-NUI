import React, { useState } from "react";
import moment from "moment-timezone";
import {
  DisplayModal,
  DisplayButton,
  DisplayText,
  DisplayIcon,
  DisplayIconButton,
} from "components/display_components";
import { SystemIcons } from "utils/icons";
import { useStyles } from "./styles";
import CalendarServices from "../../utils";
import { ThemeFactory, UserFactory } from "utils/services/factory_services";
import { ReportGenerator } from "components/helper_components";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { useHistory } from "react-router-dom";

const InfoModal = (props) => {
  let { infoModal, selectedEntity, setInfoModal, metaData } = props || {};
  const history = useHistory();
  let { CloseOutlined, FiberManual, PictureAsPdf } = SystemIcons;
  const { getVariantObj } = ThemeFactory();
  const {
    checkGlobalFeatureAccess,
    isNJAdmin,
    getEntityFeatureAccess,
    getAgencyTimeZone,
  } = UserFactory();
  const timeZone = getAgencyTimeZone();
  const { offset, value: timezoneValue } = timeZone || {};
  const classes = useStyles(getVariantObj("primary"));
  const { getRoute } = CalendarServices();
  let {
    appName: appname,
    moduleName: modulename,
    groupName: groupname,
    access,
    canCreate = true,
    canView = true,
  } = selectedEntity || {};

  let {
    sys_reports: reports = [],
    sys_navigationButtons: navigationButtons = [],
  } = metaData?.sys_entityAttributes || {};

  const REPORT_VISIBILITY =
    checkGlobalFeatureAccess("Reports") &&
    getEntityFeatureAccess(appname, modulename, groupname, "Reports") &&
    !isNJAdmin() &&
    reports?.length > 0;

  const [reportFlag, setReportFlag] = useState(false);

  let { eventInfo, isOpen } = infoModal || {};

  let {
    start: startDate,
    end: endDate,
    infoFields = {},
    id,
    data,
    title,
    eventColor,
    showDateAndTime = true,
  } = eventInfo || {};

  let { sys_entityAttributes: { sys_topLevel = [] } = {} } = metaData || {};
  let mode = access?.write && canCreate ? "edit" : "read";
  let dateTimeValues = [
    {
      key: "Start Date",
      value: startDate,
      format: "MM-DD-yyyy",
    },
    {
      key: "End Date",
      value: endDate,
      format: "MM-DD-yyyy",
    },
    {
      key: "Start Time",
      value: startDate,
      format: "hh:mm A",
    },
    {
      key: "End Time",
      value: endDate,
      format: "hh:mm A",
    },
  ];

  const renderNavigationButtons = (navigation) => {
    let { linkTo, title: navTitle, filters = [] } = navigation || {};
    let { startTime, endTime } = data || {};

    let item = {
      linkTo: linkTo,
    };
    if (item["linkTo"]) {
      if (filters?.length) {
        filters = filters?.map((filter) => {
          let value = filter?.value.split(".")[1] || "startTime";
          value = value === "startTime" ? startTime : endTime;
          if (item["linkTo"]?.includes("?")) {
            let query = `&${filter.name}=${value}`;
            item["linkTo"] = item["linkTo"].concat(query);
          } else {
            let query = `?${filter.name}=${value}`;
            item["linkTo"] = item["linkTo"].concat(query);
          }
        });
      }
    }

    return (
      <DisplayButton
        variant="outlined"
        onClick={() => {
          history.push(`/${item["linkTo"]}`);
        }}
      >
        {navTitle}
      </DisplayButton>
    );
  };
  return (
    <DisplayModal
      open={isOpen}
      fullWidth={true}
      maxWidth={"sm"}
      onClose={() =>
        setInfoModal({
          isOpen: false,
          mode: "read",
          eventInfo: {},
        })
      }
      key={"Calendar-InfoModal"}
    >
      <div className={classes.modal_container}>
        <div
          className={classes.modal_header}
          style={{ borderBottom: "1px solid #ebebeb" }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <DisplayIcon
              onClick={() => {}}
              name={FiberManual}
              systemVariant="primary"
              style={{ color: eventColor, paddingRight: "3px" }}
            />
            <DisplayText variant="h6">{title}</DisplayText>
          </div>
          <DisplayIconButton
            onClick={() =>
              setInfoModal({
                isOpen: false,
                mode: "read",
                eventInfo: {},
              })
            }
            systemVariant="primary"
            size="small"
          >
            <CloseOutlined />
          </DisplayIconButton>
        </div>
        <div className={classes.modal_body}>
          {showDateAndTime && (
            <div
              style={{
                display: "flex",
                flex: 1,
                flexWrap: "wrap",
              }}
            >
              {dateTimeValues.map((e, index) => (
                <div
                  style={{
                    display: "flex",
                    width: "50%",
                    padding: "3px 0px 3px 20px",
                  }}
                >
                  <DisplayText key={index}>
                    <b>{e?.key}</b> :{" "}
                    {moment(e?.value).tz(timezoneValue).format(e?.format)}
                  </DisplayText>
                </div>
              ))}
            </div>
          )}
          {showDateAndTime && <br />}
          <div
            style={{
              display: "flex",
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            {Object.entries(infoFields)?.map((e) => {
              let key = [e[0], ""],
                eachValue = "";
              if (e[0]?.includes(".")) {
                key = e[0]?.split(".");
              }
              let fieldMeta = sys_topLevel?.find(
                (eConfig) => eConfig?.name === key[0]
              );
              if (fieldMeta?.type === "ORDER") {
                fieldMeta = fieldMeta?.fields?.find((e) => e?.name === key[1]);
              }
              let title = fieldMeta?.title || key[0];
              if (fieldMeta?.type === "REFERENCE") {
                let fieldM = fieldMeta?.displayFields?.find(
                  (ed) => `${fieldMeta?.name}.${ed?.name}` === e[0]
                );
                title = fieldM?.friendlyName || title;
                if (Array.isArray(e[1])) {
                  eachValue = textExtractor(e[1], fieldMeta);
                } else eachValue = e[1];
              }

              return (
                <div
                  style={{
                    display: "flex",
                    width: "50%",
                    padding: "3px 0px 3px 20px",
                  }}
                >
                  <DisplayText>
                    <b>{title}</b> :{" "}
                    {fieldMeta
                      ? fieldMeta?.type === "REFERENCE"
                        ? eachValue
                        : textExtractor(e[1], fieldMeta)
                      : ""}
                  </DisplayText>
                </div>
              );
            })}
          </div>
        </div>
        <hr />
        <div className={classes.modal_footer}>
          {canView && (
            <DisplayButton
              variant="outlined"
              size="small"
              onClick={() => {
                let query = {
                  isCalendar: true,
                };
                let summaryTabLink = `/nueassist/summary/${appname}/${modulename}/${groupname}`;
                getRoute({
                  appName: appname,
                  moduleName: modulename,
                  entityName: groupname,
                  id,
                  mode,
                  query,
                });
                sessionStorage.setItem("summaryTabLink", summaryTabLink);
                sessionStorage.setItem("calendarLink", "/app/nuecalendar");
                sessionStorage.setItem(
                  "currentTab",
                  JSON.stringify({
                    selected: "Calendar",
                    entityName: groupname,
                  })
                );
              }}
              systemVariant={false ? "default" : "primary"}
            >
              {access?.write && canCreate ? "Edit" : "View"}
            </DisplayButton>
          )}
          {REPORT_VISIBILITY && (
            <>
              <DisplayButton
                variant="outlined"
                onClick={() => {
                  setReportFlag(true);
                }}
              >
                <PictureAsPdf fontSize="small" />
                &nbsp; Reports &nbsp;
              </DisplayButton>
              <ReportGenerator
                appname={appname}
                modulename={modulename}
                entityname={groupname}
                modalFlag={reportFlag}
                data={{
                  _id: id,
                  sys_entityAttributes: data,
                }}
                metadata={metaData}
                container={{ level: "detail" }}
                onClose={() => {
                  setReportFlag(false);
                }}
                key={"Calendar-ReportModal"}
              />
            </>
          )}
          {navigationButtons?.length > 0 &&
            navigationButtons?.map((eachNavigation) =>
              renderNavigationButtons(eachNavigation)
            )}
        </div>
      </div>
    </DisplayModal>
  );
};

export default InfoModal;
