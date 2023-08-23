import React, { useState, useEffect } from "react";
import runtimeStyler from "containers/feature_containers/calendar/services/styles";
//services
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { deleteEvent } from "utils/services/api_services/sync_services";

//configs
import { configKeys } from "../../services";
import { useStateValue } from "utils/store/contexts";
import { SystemIcons } from "utils/icons";
import { Grow } from "@material-ui/core";

//material imports
import IconButton from "@material-ui/core/IconButton";
import NotificationHolder from "./components/notification_holder";
import TabHolder from "./components/tab_holder";
import { DisplayButton } from "components/display_components";

let Context = (props) => {
  const [styles] = useState(runtimeStyler());
  const [{ userState }] = useStateValue();
  const { Cancel, Delete, MoreHorizontal } = SystemIcons;
  let {
    contextOpen,
    setRuntimeComponent,
    setContext,
    setPopUp,
    selectedEvent,
    updateEvent,
    setRefreshNotification,
    setOpenDetail,
    eventMetadata,
    setMetadata,
    setChildMetadata,
    setChildEventdata,
    setEventData,
    showToolbar,
    contextType,
  } = props;

  let [notifications, setNotifications] = useState([]);
  let [issues, setIssues] = useState();

  useEffect(() => {
    if (contextOpen.properties && contextOpen.properties["data"]) {
      setNotifications(contextOpen.properties["data"]);
    }
  }, [selectedEvent, contextOpen.properties]);

  let getEventDetails = async () => {
    try {
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
    } catch (e) {
      setRuntimeComponent("Alert");
      setPopUp({ isOpen: true, properties: { error: e } });
      console.log(
        "error in calendar-context component, check definition once or contact administrator."
      );
    }
  };

  let componentToRender = (type) => {
    switch (type) {
      case "Tab":
        return (
          <TabHolder
            issues={issues}
            contextType={contextType}
            eventInfo={selectedEvent}
            updateEvent={updateEvent}
            setMetadata={setMetadata}
            setChildMetadata={setChildMetadata}
            setChildEventdata={setChildEventdata}
            setEventData={setEventData}
            eventMetadata={eventMetadata}
            setOpenDetail={setOpenDetail}
          />
        );
      case "Notification":
        return (
          <NotificationHolder
            notification={notifications}
            setRefreshNotification={setRefreshNotification}
            setMetadata={setMetadata}
            setChildMetadata={setChildMetadata}
            setChildEventdata={setChildEventdata}
            setEventData={setEventData}
            closePanel={setContext}
            setOpenDetail={setOpenDetail}
          />
        );
    }
  };

  if (contextOpen.isOpen)
    return (
      <Grow in={true} timeout={1000}>
        <div style={styles.contextContainer}>
          {showToolbar && (
            <div style={styles.contextHeader}>
              <span
                style={{
                  fontFamily: "inherit",
                  fontWeight: "600",
                  fontSize: "20",
                  color: "#212121",
                }}
              >
                {contextOpen["properties"].title &&
                  contextOpen["properties"].title}
              </span>
              <div style={{ flexDirection: "row", alignItems: "center" }}>
                {contextOpen.properties["type"] !== "Notification" && (
                  <DisplayButton
                    onClick={() => {
                      getEventDetails();
                    }}
                    startIcon={<MoreHorizontal />}
                    size="small"
                  >
                    More Details
                  </DisplayButton>
                )}
                {contextOpen.properties["type"] !== "Notification" && (
                  <IconButton
                    onClick={async () => {
                      try {
                        await deleteEvent.update({
                          appname: configKeys.appname,
                          modulename: configKeys.modulename,
                          entityname: "Event",
                          id: selectedEvent.id,
                          userId: userState.userData.sys_gUid,
                          eventId: selectedEvent.event
                            ? selectedEvent.event.id
                            : false,
                          eventTemplate: selectedEvent.event
                            ? selectedEvent.event.templateName
                            : false,
                        });
                        setRefreshNotification(true);
                      } catch (e) {}
                    }}
                  >
                    <Delete style={{ color: "#c0392b", marginRight: 10 }} />
                  </IconButton>
                )}
                <IconButton
                  onClick={() => {
                    setContext({ isOpen: false, properties: null });
                  }}
                >
                  <Cancel style={{ color: "#2c3e50" }} />
                </IconButton>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              scrollbarWidth: "none",
            }}
          >
            {componentToRender(contextOpen.properties["type"])}
          </div>
        </div>
      </Grow>
    );
  else return <></>;
};

export default Context;
