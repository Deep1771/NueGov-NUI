import React, { useEffect, useState } from "react";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import { SyncUpdateEvent } from "utils/services/api_services/sync_services";
import { ToolTipWrapper } from "components/wrapper_components";
import { icsFile } from "utils/services/api_services/ics_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { entity } from "utils/services/api_services/entity_service";
import { Menu, MenuItem } from "@material-ui/core";
import { queryToUrl } from "utils/services/helper_services/system_methods";
import {
  DisplayButton,
  DisplayButtonGroup,
  DisplayText,
  DisplayIconButton,
} from "components/display_components";
import { SystemIcons } from "utils/icons";

import { useStateValue } from "utils/store/contexts";

const useStyles = makeStyles(() => ({
  icon: {
    margin: "1px 4px 1px 1px",
    height: "20px",
    width: "20px",
    borderRadius: "50%",
    overflow: "hidden",
  },
  img: { height: "20px" },
}));

let NotificationHolder = (props) => {
  let {
    notification,
    setRefreshNotification,
    setMetadata,
    setChildMetadata,
    setEventData,
    setChildEventdata,
    setOpenDetail,
    closePanel,
  } = props;
  let [notifications, setNotification] = useState([]);
  let [isLoading, setLoading] = useState(false);
  let [clickedIndex, setClickIndex] = useState(false);
  const [eventMenu, setEventMenu] = useState(null);
  const [notifData, setNotifData] = useState({});
  const [{ userState }] = useStateValue();
  const { DateRange, Schedule, Toc, Event, ArrowDropDown } = SystemIcons;
  const classes = useStyles();

  useEffect(() => {
    if (notification && notification.length) {
      setNotification(notification);
    }
  }, [notification]);

  let getEventDetails = async (selectedEvent) => {
    setOpenDetail({
      isOpen: true,
      properties: {
        mode: "read",
        id: selectedEvent.event.id,
        appname: selectedEvent.event.appName,
        modulename: selectedEvent.event.moduleName,
        templatename: selectedEvent.event.templateName,
      },
    });
  };
  const handleMenuClick = (event, notif) => {
    setEventMenu(event.currentTarget);
    setNotifData(notif);
  };

  const handleMenuClose = () => {
    setEventMenu(null);
  };

  const handleDownload = async () => {
    let { appName, moduleName, templateName, id } = notifData?.event;
    let payload = {
      appname: appName,
      modulename: moduleName,
      entityname: templateName,
      id,
    };

    try {
      let res = await icsFile.get({ ...payload, download: true });
      const downloadUrl = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `${notifData.title}.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log(err);
    }
    handleMenuClose();
  };

  const handleEvent = async (mode) => {
    let { appName, moduleName, templateName, id } = notifData?.event;
    let payload = {
      appname: appName,
      modulename: moduleName,
      entityname: templateName,
      id,
    };
    try {
      let res = await icsFile.get(payload);
      if (mode == "google") {
        onGoogleEvent(res);
      } else {
        onOutlookEvent(res);
      }
    } catch (err) {
      console.log(err);
    }
    handleMenuClose();
  };

  const formatDate = (inDate, mode) => {
    const [year, month, date, hours = 0, minutes = 0] = inDate;
    if (mode == "google") {
      let outDate = new Date(Date.UTC(year, month, date, hours, minutes));
      const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
      return [
        outDate.getUTCFullYear(),
        pad(outDate.getUTCMonth()),
        pad(outDate.getUTCDate()),
        "T",
        pad(outDate.getUTCHours()),
        pad(outDate.getUTCMinutes()),
        pad(outDate.getUTCSeconds()),
        "Z",
      ].join("");
    } else {
      let outDate = new Date(Date.UTC(year, month - 1, date, hours, minutes));
      return outDate.toISOString();
    }
  };

  const onGoogleEvent = (res) => {
    let { start, end, title, description, location } = res;
    let startDate = formatDate(start, "google");
    let endDate = formatDate(end, "google");
    let googleParams = {
      text: title ? title : "",
      details: description ? description : "",
      location: location ? location : "",
      dates: startDate + "/" + endDate,
    };
    let constructUrl = `https://www.google.com/calendar/render?action=TEMPLATE&${queryToUrl(
      googleParams
    )}`;
    window.open(constructUrl, "_blank");
  };

  const onOutlookEvent = (res) => {
    let { start, end, title, description, location } = res;
    let startDate = formatDate(start, "outlook");
    let endDate = formatDate(end, "outlook");
    let outLookParams = {
      path: "/calendar/action/compose",
      rru: "addevent",
      startdt: startDate,
      enddt: endDate,
      subject: title ? title : "",
      body: description ? description : "",
      location: location ? location : "",
    };
    let constructUrl = `https://outlook.office.com/calendar/0/deeplink/compose?${queryToUrl(
      outLookParams
    )}`;
    window.open(constructUrl, "_blank");
  };

  const eventDownload = [
    {
      displayCondition: true,
      name: "ICS",
      testid: "ics-download",
      onClick: handleDownload,
      icon: "https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/ics.svg",
    },
    {
      displayCondition: true,
      name: "Google",
      testid: "google-event",
      onClick: () => handleEvent("google"),
      icon: "https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/google.svg",
    },
    {
      displayCondition: true,
      name: "OutLook",
      testid: "outlook-event",
      onClick: () => handleEvent("outlook"),
      icon: "https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/outlook.svg",
    },
  ];

  if (notifications && notifications.length)
    return (
      <div>
        {notifications.map((notif, index) => {
          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: "flex",
                maxHeight: 150,
                flexDirection: "column",
                backgroundColor: "#fafafa",
                justifyContent: "center",
                margin: 5,
                padding: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ marginTop: 5 }}>
                  <span
                    style={{
                      color: "#2f3640",
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    {" "}
                    {notif.title}
                  </span>
                </div>
                <ToolTipWrapper systemVariant="info" title={"Download event"}>
                  <div>
                    <DisplayButton
                      onClick={(event) => handleMenuClick(event, notif)}
                      systemVariant="primary"
                      endIcon={<ArrowDropDown />}
                      testid={"calendar-icsFile"}
                    >
                      <Event fontSize="small" />
                    </DisplayButton>
                  </div>
                </ToolTipWrapper>
              </div>
              {
                <Menu
                  id="options-menu"
                  anchorEl={eventMenu}
                  keepMounted
                  open={Boolean(eventMenu)}
                  onClose={handleMenuClose}
                  getContentAnchorEl={null}
                  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                  transformOrigin={{ vertical: "top", horizontal: "center" }}
                  PaperProps={{
                    style: {
                      boxShadow: "0px 5px 5px -3px lightgrey",
                    },
                  }}
                >
                  {eventDownload.map(
                    ({ displayCondition, name, icon, ...menuItemProps }) => {
                      return (
                        displayCondition && (
                          <MenuItem key={name} {...menuItemProps}>
                            <div className={classes.icon}>
                              <img src={icon} className={classes.img} />
                            </div>
                            <DisplayText variant="button">{name}</DisplayText>
                          </MenuItem>
                        )
                      );
                    }
                  )}
                </Menu>
              }
              <div
                style={{ marginTop: 5, display: "flex", alignItems: "center" }}
              >
                <DateRange style={{ fontSize: 15, marginRight: 5 }} />
                <span
                  style={{
                    color: "#2f3640",
                    fontWeight: "400",
                    fontSize: 12,
                    alignItems: "center",
                  }}
                >
                  <DisplayText>
                    {moment(notif.date.startDate).format("MM-DD-YYYY")} to{" "}
                    {moment(notif.date.endDate).format("MM-DD-YYYY")}
                  </DisplayText>
                </span>
              </div>
              {notif.schedule && (
                <div
                  style={{
                    marginTop: 5,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Schedule style={{ fontSize: 12, marginRight: 3 }} />
                  <span
                    style={{
                      color: "#2f3640",
                      fontWeight: "400",
                      fontSize: 12,
                    }}
                  >
                    <DisplayText>Scheduled {notif.frequency}</DisplayText>
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  marginTop: 5,
                  alignItems: "center",
                }}
              >
                <Toc style={{ fontSize: 12, marginRight: 3 }} />
                <span
                  style={{
                    textAlign: "justify",
                    letterSpacing: 1,
                    color: "#2f3640",
                    fontWeight: "400",
                    fontSize: 12,
                  }}
                >
                  <DisplayText> {notif.eventDescription}</DisplayText>
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignSelf: "flex-start" }}>
                  <DisplayButtonGroup
                    size="small"
                    variant="text"
                    aria-label="contained primary button group"
                  >
                    <DisplayButton
                      small
                      disabled={isLoading}
                      onClick={() => {
                        !isLoading &&
                          getEventDetails(notif) &&
                          setClickIndex(index);
                      }}
                      style={{
                        fontFamily: "inherit",
                        color: !isLoading ? "#2980b9" : "#636e72",
                        fontSize: 12,
                      }}
                    >
                      {isLoading && index == clickedIndex ? (
                        <CircularProgress size={15} />
                      ) : (
                        <DisplayText>View Details</DisplayText>
                      )}
                    </DisplayButton>
                  </DisplayButtonGroup>
                </div>
                <div style={{ display: "flex", alignSelf: "flex-end" }}>
                  <DisplayButtonGroup
                    size="small"
                    variant="text"
                    aria-label="contained primary button group"
                  >
                    <DisplayButton
                      small
                      onClick={async () => {
                        await SyncUpdateEvent.update(
                          {
                            appname: "Features",
                            modulename: "Calendar",
                            entityname: "Event",
                            id: notif.id,
                          },
                          {
                            userId: userState["userData"].sys_gUid,
                            accept: true,
                          }
                        );
                        closePanel({ isOpen: false, properties: null });
                        setRefreshNotification(true);
                      }}
                      style={{
                        fontFamily: "inherit",
                        color: "#27ae60",
                        fontSize: 12,
                      }}
                    >
                      <DisplayText>Accept</DisplayText>
                    </DisplayButton>
                    <DisplayButton
                      small
                      onClick={async () => {
                        await SyncUpdateEvent.update(
                          {
                            appname: "Features",
                            modulename: "Calendar",
                            entityname: "Event",
                            id: notif.id,
                          },
                          {
                            userId: userState["userData"].sys_gUid,
                            accept: false,
                          }
                        );
                        closePanel({ isOpen: false, properties: null });
                        setRefreshNotification(true);
                      }}
                      style={{
                        fontFamily: "inherit",
                        color: "#c0392b",
                        fontSize: 12,
                      }}
                    >
                      <DisplayText>Decline</DisplayText>
                    </DisplayButton>
                  </DisplayButtonGroup>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  else
    return (
      <div style={{ marginTop: "25%", textAlign: "center" }}>
        <span style={{ fontWeight: "400", color: "#666666", fontSize: 18 }}>
          No Notifications
        </span>
      </div>
    );
};

export default NotificationHolder;
