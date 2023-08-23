import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { Fade, Menu, MenuItem } from "@material-ui/core";

import {
  UserFactory,
  ThemeFactory,
  GlobalFactory,
} from "utils/services/factory_services";
import {
  ContainerWrapper,
  ToolTipWrapper,
} from "components/wrapper_components";
import {
  DisplayChips,
  DisplayButton,
  DisplayBackdrop,
  DisplayIcon,
  DisplayIconButton,
} from "components/display_components";

import { SystemIcons } from "utils/icons";
import CalendarServices from "./utils";
import { useStateValue } from "utils/store/contexts";
import {
  convertDataToEvent,
  getFilteredData,
  getMonthDifference,
  usePreviousValue,
} from "./helper";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { makeStyles } from "@material-ui/core";

//components;
import { ToolBarComponent, EventComponent, InfoModal } from "./components";
import { VideoPlayer } from "components/helper_components/video_player";
import { isDefined } from "utils/services/helper_services/object_methods";

const localizer = momentLocalizer(moment);

const useStyles = makeStyles({
  root: ({ dark, light }) => ({
    "&&:hover": {
      backgroundColor: light.bgColor,
      color: light.text,
    },
    "&&:focus": {
      backgroundColor: dark.bgColor,
      color: dark.text,
    },
  }),
});

export const SystemCalendar = (props) => {
  const { getCalendarConfig, getAgencyDetails, isNJAdmin } = UserFactory();
  const { getContextualHelperData } = GlobalFactory();
  const { showHelper = false } = getAgencyDetails?.sys_entityAttributes || {};
  const entities = getCalendarConfig;
  const { getVariantObj } = ThemeFactory();
  const classes = useStyles(getVariantObj("primary"));
  let { KeyboardArrowDown, DateRange, Help } = SystemIcons;
  const [calendarView, setView] = useState("month");
  const { getRoute, getData } = CalendarServices();
  const { dark } = getVariantObj("primary");
  const [selectedEntity, setSelectedEntity] = useState({});
  const [data, setData] = useState([]);
  const [metaData, setMetaData] = useState({});
  const [events, setEvents] = useState([]);
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    mode: "read",
    eventInfo: {},
  });

  const [selectedDate, setDate] = useState(new Date());
  const [searchValue, setSearchValue] = useState("");
  const prevDate = usePreviousValue(selectedDate);

  const [calendarType, setcalendarType] = useState();
  const [isLoading, setLoading] = useState(true);
  const [addMenuEl, setAddMenuEl] = useState(null);
  const [openHelp, setHelp] = useState(false);
  const helperData = getContextualHelperData("CALENDER_SCREEN");

  const getDefaultTab = () => {
    let calendarTab = entities?.find((e) => e?.defaultTab === true);
    let currentTab = JSON.parse(sessionStorage.getItem("currentTab"));
    if (currentTab?.selected === "Calendar") {
      calendarTab = entities?.find(
        (e) => e?.groupName === currentTab?.entityName
      );
    }
    if (!calendarTab) {
      calendarTab = entities?.find((e) => e?.defaultTab === true);
      if (!calendarTab) calendarTab = entities?.find((e) => e);
    }
    return calendarTab;
  };

  const init = async () => {
    let defaultEntity = getDefaultTab();
    setSelectedEntity(defaultEntity);
    let currentDate = new Date();
    let initialData = await getData({
      type: "MetaAndData",
      appName: defaultEntity?.appName,
      moduleName: defaultEntity?.moduleName,
      entityName: defaultEntity?.groupName,
      startDate: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ).toISOString(),
      endDate: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).toISOString(),
    });
    let initialEvents = initialData?.data || [];
    initialEvents = convertDataToEvent(initialEvents);
    setMetaData(initialData?.metaData || {});
    setData(initialEvents);
    setEvents(initialEvents);
    setLoading(false);
  };

  const handleChangeInDate = async () => {
    setLoading(true);
    let currentDate = new Date(selectedDate);
    let eventData = await getData({
      type: "Data",
      appName: selectedEntity?.appName,
      moduleName: selectedEntity?.moduleName,
      entityName: selectedEntity?.groupName,
      startDate: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ).toISOString(),
      endDate: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).toISOString(),
    });
    eventData = convertDataToEvent(eventData?.data);
    setData(eventData);
    setEvents(eventData);
    setLoading(false);
  };

  const renderCreateMenu = () => {
    return (
      <Menu
        id="calendar-create-menu"
        anchorEl={addMenuEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(addMenuEl)}
        TransitionComponent={Fade}
        onClose={() => {
          setAddMenuEl(null);
        }}
        getContentAnchorEl={null}
      >
        {entities?.map(
          ({
            appName,
            moduleName,
            access,
            friendlyName,
            groupName,
            name,
            title,
            index,
            canCreate = true,
          }) => {
            let query = {
              isCalendar: true,
            };
            let enableCreate = false;
            if (access?.write === true && canCreate === true)
              enableCreate = true;

            let summaryTabLink = `/nueassist/summary/${appName}/${moduleName}/${groupName}`;

            return enableCreate ? (
              <MenuItem
                key={`${name}+${index}`}
                onClick={() => {
                  setAddMenuEl(null);
                  sessionStorage.setItem("summaryTabLink", summaryTabLink);
                  sessionStorage.setItem("calendarLink", "/app/nuecalendar");
                  sessionStorage.setItem(
                    "currentTab",
                    JSON.stringify({
                      selected: "Calendar",
                      entityName: groupName,
                    })
                  );
                  getRoute({
                    appName,
                    moduleName,
                    entityName: groupName,
                    query,
                  });
                }}
                style={{
                  fontFamily: "Roboto, sans-serif",
                  fontSize: "0.75rem",
                  minWidth: "80px",
                }}
                id={`${name}+${index}`}
              >
                {title}
              </MenuItem>
            ) : null;
          }
        )}
      </Menu>
    );
  };

  const renderCreateButton = () => {
    let multiMenu = entities?.length ? true : false;
    let endIcon = multiMenu ? <KeyboardArrowDown /> : null;

    return (
      <DisplayButton
        size="small"
        testid="calendar-new"
        variant="contained"
        systemVariant="primary"
        endIcon={endIcon}
        style={{
          display: "flex",
          alignSelf: "center",
          textTransform: "none",
          fontSize: "13px",
        }}
        onClick={(event) => {
          setAddMenuEl(event.currentTarget);
        }}
      >
        Create
      </DisplayButton>
    );
  };

  const renderInfoModal = () => {
    return (
      <InfoModal
        metaData={metaData}
        infoModal={infoModal}
        setInfoModal={setInfoModal}
        selectedEntity={selectedEntity}
      />
    );
  };

  const checkForVideoLinks = () => {
    let videoLinks = helperData.videoLinks.filter((e) =>
      isDefined(e.link)
    ).length;
    return videoLinks > 0;
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (prevDate) {
      let diff = getMonthDifference(prevDate, selectedDate);
      if (diff !== 0) {
        handleChangeInDate();
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    if (searchValue) {
      let filteredData = getFilteredData({ data, searchValue });
      setEvents(filteredData);
    } else {
      setEvents(data);
    }
  }, [searchValue]);

  return (
    <ContainerWrapper>
      <DisplayBackdrop
        message={
          <>
            <br />
            Loading... Please Wait
          </>
        }
        open={isLoading}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: "8vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #808080",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
            }}
          >
            {/* <div
              style={{
                display: "flex",
                flex: 1.2,
                alignItems: "center",
                marginLeft: "1vw",
              }}
            >
              <DisplayText>Calendar</DisplayText>
            </div> */}
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                marginLeft: "1vw",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: "5px",
                }}
              >
                {/* <DisplayIcon
                  size={"small"}
                  name={DateRange}
                  systemVariant="primary"
                  style={{
                    fontSize: "30px",
                    marginRight: "5px",
                  }}
                ></DisplayIcon> */}
                Calendar
              </h3>
              {(isNJAdmin() ||
                (helperData && checkForVideoLinks() && showHelper)) && (
                <DisplayIconButton onClick={() => setHelp(true)}>
                  <ToolTipWrapper title="Help" placement="bottom-start">
                    <Help style={{ color: dark.bgColor, fontSize: "20px" }} />
                  </ToolTipWrapper>
                </DisplayIconButton>
              )}
              {entities?.map((entity) => {
                let {
                  appName,
                  moduleName,
                  access,
                  friendlyName,
                  groupName,
                  name,
                  title,
                  index,
                } = entity;

                return (
                  <DisplayChips
                    style={{ margin: "0px 5px" }}
                    label={friendlyName}
                    systemVariant={
                      entity?.name == selectedEntity?.name ? "primary" : ""
                    }
                    key={name + index}
                    onClick={async () => {
                      if (entity.name !== selectedEntity?.name) {
                        setLoading(true);
                        setEvents([]);
                        setSelectedEntity(entity);
                        let newData = await getData({
                          type: "MetaAndData",
                          appName,
                          moduleName,
                          entityName: groupName,
                        });

                        let data = convertDataToEvent(newData?.data);
                        setMetaData(newData?.metaData || {});
                        setData(data);
                        setEvents(data);
                        setSearchValue("");
                        setLoading(false);
                      }
                    }}
                    className={classes.root}
                  />
                );
              })}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "flex-end",
              marginRight: "1vw",
            }}
          >
            {entities?.length > 0 && renderCreateButton()}
          </div>
        </div>
        <div
          style={{
            height: "80vh",
            scrollbarWidth: "none",
            margin: 11,
            overflow: "hidden",
          }}
        >
          <Calendar
            popup
            selectable
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={selectedDate}
            localizer={localizer}
            toolbar={true}
            showMultiDayTimes={true}
            eventPropGetter={(eventsList) => {
              const backgroundColor = eventsList.eventColor || "lightgreen";
              const color = eventsList.fontColor || "#ffffff";
              return { style: { backgroundColor, color } };
            }}
            components={{
              toolbar: (props) => {
                return (
                  <ToolBarComponent
                    activeView={calendarView}
                    changeView={setView}
                    isLoading={isLoading}
                    // setRuntimeComponent={setRuntimeComponent}
                    // togglePopUp={setPopUp}
                    // toggleDetail={setOpenDetail}
                    setcalendarType={setcalendarType}
                    data={calendarType}
                    getSearchValue={setSearchValue}
                    searchedValue={searchValue}
                    {...props}
                  />
                );
              },
              // event: EventComponent
            }}
            onNavigate={(date, view, newdate) => {
              setDate(newdate);
            }}
            onSelectEvent={async (event) => {
              setInfoModal({
                isOpen: true,
                mode: "edit",
                eventInfo: event,
              });
            }}
            onSelectSlot={async ({ start, end }) => {
              // let date = {
              //     startDate: moment(start).toISOString(),
              //     endDate: moment(end).toISOString(),
              // };
              // setRuntimeComponent("Detail");
              // setPopUp({ isOpen: true, properties: { date } });
            }}
            //   popupOffset={(e)=>console.log("eeeee", e)}
            onDrillDown={() => {}}
          />
        </div>
      </div>
      {renderCreateMenu()}
      {renderInfoModal()}
      {openHelp && (
        <VideoPlayer
          handleModalClose={() => setHelp(false)}
          screenName={"CALENDER_SCREEN"}
          helperData={helperData}
        />
      )}
    </ContainerWrapper>
  );
};

export default SystemCalendar;
