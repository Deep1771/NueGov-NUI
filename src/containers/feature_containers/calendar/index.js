import React, { useState, useEffect } from "react";
import { useStateValue } from "utils/store/contexts";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import {
  getEventTypeEntities,
  getEventMetadata,
  getUserCreds,
  dataParser,
} from "./services";
import { entity } from "utils/services/api_services/entity_service";

import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import runtimeStyler from "containers/feature_containers/calendar/services/styles";

import {
  syncGetEvents,
  syncNotification,
} from "utils/services/api_services/sync_services";
import { isLightColor, utilities } from "./helper";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DisplaySnackbar } from "components/display_components";
import { ContainerWrapper } from "components/wrapper_components";

//components;
import ToolBarView from "./components/toolbar";
import PopUp from "./components/popup";
import Context from "./components/context";
import Modal from "./components/modal";

const localizer = momentLocalizer(moment);

let SysCalendar = (props) => {
  let { properties } = props;
  const [{ userState }] = useStateValue();
  const [calendarView, setView] = useState("month");
  const [popControl, setPopUp] = useState({ isOpen: false, properties: null });
  const [openDetail, setOpenDetail] = useState({
    isOpen: false,
    properties: { MODE: "read" },
  });
  const [runtimeComponent, setRuntimeComponent] = useState(null);
  const [selectedDate, setDate] = useState(new Date());
  const [refreshNotification, setRefreshNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [event, setEvent] = useState([]);
  const [selectedEvent, setSelectEvent] = useState();
  const [calendarType, setcalendarType] = useState();
  const [isContextOpen, setContext] = useState({
    isOpen: false,
    properties: null,
  });
  const [isLoading, setLoading] = useState(true);

  const [eventMetadata, setMetadata] = useState({});
  const [childMetadata, setChildMetadata] = useState(false);
  const [eventdata, setEventData] = useState({});
  const [childEventData, setChildEventdata] = useState({});
  const [styles] = useState(runtimeStyler());

  // custom Hooks
  const { getRole } = UserFactory();
  const { getBusinessType } = GlobalFactory();

  let getData = async (userInfo, dateRange) => {
    setLoading(true);
    let metadata = await getEventMetadata({
      appname: "Features",
      modulename: "Calendar",
      groupname: getBusinessType() === "NUEASSIST" ? "calendarTask" : "Event",
    });
    setMetadata(metadata);
    let data = await syncGetEvents.query({
      appname: "Features",
      modulename: "Calendar",
      entityname: "Event",
      limit: 100,
      skip: 0,
      dateRange: JSON.stringify(dateRange),
      ids: JSON.stringify(userInfo.ids),
      isNotification: false,
      invitationModal: true,
    });

    let parsedEvents = await dataParser(metadata, data);
    setEvent(parsedEvents);
    setLoading(false);
  };

  let getNotifications = async (userInfo) => {
    setLoading(true);
    let dateRange = utilities.getMonthDateRange("", true);

    let metadata = await getEventMetadata({
      appname: "Features",
      modulename: "Calendar",
      groupname: "Event",
    });
    setMetadata(metadata);

    let data = await syncNotification.query({
      appname: "Features",
      modulename: "Calendar",
      entityname: "Event",
      limit: 100,
      skip: 0,
      dateRange: JSON.stringify(dateRange),
      ids: JSON.stringify(userInfo.ids),
    });

    let parsedEvents = await dataParser(metadata, data);
    setNotifications(parsedEvents);
    setLoading(false);
  };

  let setDefaultCalendarType = () => {
    let currentRole = getRole();
    if (
      currentRole == "AGENCY ADMIN" ||
      currentRole == "Community Administrator" ||
      currentRole == "Facility and equipment manager"
    ) {
      setcalendarType("MyCalendar");
    } else if (currentRole == "Care giver" || currentRole == "Care Giver HHC") {
      setcalendarType("ResidentCalendar");
    } else if (currentRole == "Resident" || currentRole == "Familymembers") {
      setcalendarType("MyCalendar");
    }
  };

  useEffect(() => {
    try {
      let dateRange = utilities.getMonthDateRange(selectedDate, false);
      getData(getUserCreds(userState, dateRange));
      setDefaultCalendarType();
      getNotifications(getUserCreds(userState));
    } catch (e) {}
  }, []);

  useEffect(() => {
    let dateRange = utilities.getMonthDateRange(selectedDate, false);
    getData(getUserCreds(userState, dateRange));
  }, [selectedDate]);

  useEffect(() => {
    if (!openDetail.isOpen) {
      getData(getUserCreds(userState));
      setChildMetadata(false);
      setEventData({});
      setChildEventdata({});
    }

    if (openDetail.properties && openDetail.properties.operationProgress) {
      let dateRange = utilities.getMonthDateRange(selectedDate, false);
      getData(getUserCreds(userState, dateRange));
    }

    if (refreshNotification) {
      let dateRange = utilities.getMonthDateRange(selectedDate, false);
      getData(getUserCreds(userState, dateRange));
      getNotifications(getUserCreds(userState));
      setRefreshNotification(false);
    }
    if (properties && properties.metadata) {
      setChildMetadata(properties.metadata);
    }
  }, [popControl, openDetail, refreshNotification, properties]);

  useEffect(() => {
    let { properties } = popControl;

    if (properties) {
      switch (properties.type) {
        case "DateSelection": {
          setDate(properties.data);
          getData(getUserCreds(userState));
          break;
        }
        case "event_more_options": {
          let { app, module, groupname, id } = properties.data;

          entity
            .get({
              appname: "Features",
              modulename: "Calendar",
              entityname: "Event",
              id: id,
            })
            .then((r) => {
              try {
                let RelatedAAR = r["sys_entityAttributes"]["event"];
                setOpenDetail({
                  isOpen: true,
                  properties: {
                    mode: "read",
                    id: RelatedAAR.id,
                    appname: RelatedAAR.appName,
                    modulename: RelatedAAR.moduleName,
                    templatename: RelatedAAR.templateName,
                  },
                });
              } catch (e) {}
            });
          break;
        }
        default:
          getData(getUserCreds(userState));
          break;
      }
    }
  }, [popControl]);

  let eventGetter = (event) => {
    let style = {
      backgroundColor: event["event"] ? event["event"].color : "#b2bec3",
      borderRadius: "0px",
      opacity: 0.7,
      color: isLightColor(event["event"] ? event["event"].color : "#b2bec3"),
      fontFamily: "inherit",
      display: "block",
    };
    return { style };
  };

  return (
    <ContainerWrapper>
      <DisplaySnackbar
        open={isLoading}
        autoHideDuration={15000}
        message={"Sync in progress"}
        onClose={() => {
          setLoading(!isLoading);
        }}
      />
      <div style={styles.subContainer}>
        <div style={styles.calendarContainer}>
          <Calendar
            popup
            selectable
            events={event}
            startAccessor="start"
            endAccessor="end"
            date={selectedDate}
            localizer={localizer}
            toolbar={true}
            eventPropGetter={eventGetter}
            showMultiDayTimes={true}
            components={{
              toolbar: (props) => {
                return (
                  <ToolBarView
                    activeView={calendarView}
                    changeView={setView}
                    isLoading={isLoading}
                    setRuntimeComponent={setRuntimeComponent}
                    togglePopUp={setPopUp}
                    toggleContext={setContext}
                    toggleDetail={setOpenDetail}
                    notifications={notifications}
                    setcalendarType={setcalendarType}
                    data={calendarType}
                    {...props}
                  />
                );
              },
            }}
            onNavigate={(date, view, newdate) => {
              setDate(newdate);
            }}
            onSelectEvent={async (event) => {
              setLoading(true);
              setSelectEvent(event);
              setLoading(false);
              setContext({ isOpen: true, properties: { type: "Tab" } });
            }}
            onSelectSlot={async ({ start, end }) => {
              let date = {
                startDate: moment(start).toISOString(),
                endDate: moment(end).toISOString(),
              };
              setRuntimeComponent("Detail");
              setPopUp({ isOpen: true, properties: { date } });

              // setOpenDetail({ isOpen: true, properties: { mode: 'new', date: date } })
            }}
            onDrillDown={() => {}}
          />
        </div>
        <Context
          contextOpen={isContextOpen}
          eventMetadata={eventMetadata}
          setRefreshNotification={setRefreshNotification}
          setContext={setContext}
          setOpenDetail={setOpenDetail}
          selectedEvent={selectedEvent}
          updateEvent={setSelectEvent}
          setPopUp={setPopUp}
          setRuntimeComponent={setRuntimeComponent}
          setMetadata={setMetadata}
          setChildMetadata={setChildMetadata}
          setEventData={setEventData}
          showToolbar={true}
          setChildEventdata={setChildEventdata}
        />
      </div>
      <PopUp
        control={popControl}
        component={runtimeComponent}
        togglePopUp={setPopUp}
        metadata={eventMetadata}
      />
      <Modal control={openDetail} toggleDetail={setOpenDetail} />
    </ContainerWrapper>
  );
};

export default SysCalendar;
