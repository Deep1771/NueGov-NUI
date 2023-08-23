import React, { useState } from "react";
import { utilities, muiComponent } from "../../helper";
import { withStyles } from "@material-ui/core/styles";
import Badge from "@material-ui/core/Badge";
import IconButton from "@material-ui/core/IconButton";
import NotificationsIcon from "@material-ui/icons/Notifications";
import EventIcon from "@material-ui/icons/Event";
import DateRangeIcon from "@material-ui/icons/DateRange";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";

import metaJson from "./metadata_v2";
import { SystemList } from "components/system_components";

import {
  DisplayButton,
  DisplayGrid,
  DisplayButtonGroup,
  DisplayText,
} from "components/display_components";
import moment from "moment";
const ToolBarView = (props) => {
  let {
    activeView,
    changeView,
    setRuntimeComponent,
    togglePopUp,
    toggleDetail,
    notifications,
    toggleContext,
    setcalendarType,
    data,
  } = props;
  let [currentView] = useState(activeView);
  const { getRole } = UserFactory();
  const { getBusinessType } = GlobalFactory();
  let [selectedDate] = useState(
    moment(props.date).format("dddd , MMMM Do YYYY")
  );

  const StyledBadge = withStyles((theme) => ({
    badge: {
      right: 1,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: "0 4px",
    },
  }))(Badge);

  let [ViewButtonGroup] = useState(["day", "week", "month"]);

  let navigateDates = (view, type) => {
    switch (view) {
      case "month": {
        if (type === "NEXT") {
          changeView("month");
          return moment(new Date(props.date)).add(1, "M").toDate();
        } else return moment(new Date(props.date)).subtract(1, "M").toDate();
      }

      case "day": {
        if (type === "NEXT") {
          changeView("day");
          return moment(new Date(props.date)).add(1, "days").toDate();
        } else return moment(new Date(props.date)).subtract(1, "days").toDate();
      }

      case "week": {
        if (type === "NEXT") {
          changeView("week");
          return moment(new Date(props.date)).add(7, "days").toDate();
        } else return moment(new Date(props.date)).subtract(7, "days").toDate();
      }

      default:
        return moment(new Date(props.date)).subtract(1, "days").toDate();
    }
  };

  let callbackValue = (fieldData, fieldProps) => {
    setcalendarType(fieldData);
  };

  let callbackError = (err, fieldProps) => {
    console.log("error", err);
  };

  let roleMetaJsonExtract = (metaJson) => {
    let currentRole = getRole();
    if (currentRole == "Resident" || currentRole == "Familymembers") {
      metaJson.values = metaJson.values.filter((e) => e.id === "MyCalendar");
      return metaJson;
    } else {
      return metaJson;
    }
  };

  let renderCalenderType = () => (
    <DisplayGrid
      item
      fluid
      container
      style={{
        padding: "5px 5px 5px 5px",
        width: "300px",
        flex: "auto",
      }}
      display="flex"
    >
      <DisplayGrid
        item
        style={{
          padding: "15px",
          width: "300px",
        }}
        container
        alignItems="flex-start"
        display="flex"
        // flex={1}
      >
        <SystemList
          callbackValue={callbackValue}
          callbackError={callbackError}
          fieldmeta={roleMetaJsonExtract(metaJson)}
          stateParams={{ mode: "edit" }}
          data={data}
        />
      </DisplayGrid>
    </DisplayGrid>
  );

  return (
    <div
      style={{
        display: "flex",
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ marginLeft: 10 }}>
        <DisplayButtonGroup
          size="small"
          variant="text"
          aria-label="contained primary button group"
        >
          {ViewButtonGroup.map((button, index) => {
            return (
              <DisplayButton
                key={index}
                style={{ color: currentView === button && "#c0392b" }}
                onClick={() => {
                  changeView(button);
                  props.onView(button);
                }}
              >
                <DisplayText>
                  {utilities.capitalizeFirstLetter(button)}
                </DisplayText>
              </DisplayButton>
            );
          })}
        </DisplayButtonGroup>
      </div>
      {getBusinessType() === "NUEASSIST" && renderCalenderType()}
      <div
        style={{
          display: "flex",
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          onClick={() => {
            let date = navigateDates(currentView, "PREV");
            props.onNavigate(date);
          }}
        >
          <DisplayText>
            {muiComponent.getIcons({
              iconName: "LeftArrow",
              color: "green",
              size: 28,
            })}
          </DisplayText>
        </span>

        <span
          onClick={() => {
            setRuntimeComponent("MiniCalendar");
            togglePopUp({
              isOpen: true,
              properties: { ...props, changeView: changeView },
            });
          }}
          style={{
            fontFamily: "inherit",
            color: "#34495e",
            fontWeight: "700",
            fontSize: 18,
          }}
        >
          <DisplayText>{selectedDate}</DisplayText>
        </span>

        <span
          onClick={() => {
            let date = navigateDates(currentView, "NEXT");
            props.onNavigate(date);
          }}
        >
          <DisplayText>
            {muiComponent.getIcons({
              iconName: "RightArrow",
              color: "green",
              size: 28,
            })}
          </DisplayText>
        </span>
      </div>
      <div
        style={{
          marginRight: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DisplayButtonGroup
          size="small"
          variant="text"
          aria-label="contained primary button group"
        >
          <DisplayButton
            onClick={() => {
              setRuntimeComponent("MiniCalendar");
              togglePopUp({ isOpen: true, properties: props });
            }}
          >
            <DateRangeIcon style={{ marginRight: 5, fontSize: 14 }} />
            <DisplayText>Change date</DisplayText>
          </DisplayButton>
          {getBusinessType() === "NUEASSIST" ? (
            <DisplayButton
              onClick={() => {
                setRuntimeComponent("Detail");
                togglePopUp({ isOpen: true, properties: props });
                // toggleDetail({ isOpen: true, properties: { mode: 'new' } })
              }}
            >
              <EventIcon style={{ marginRight: 5, fontSize: 14 }} />
              <DisplayText>Create</DisplayText>
            </DisplayButton>
          ) : (
            <DisplayButton
              onClick={() => {
                setRuntimeComponent("Detail");
                togglePopUp({ isOpen: true, properties: props });
                // toggleDetail({ isOpen: true, properties: { mode: 'new' } })
              }}
            >
              <EventIcon style={{ marginRight: 5, fontSize: 14 }} />
              <DisplayText>Create Event</DisplayText>
            </DisplayButton>
          )}
        </DisplayButtonGroup>
        <div style={{ marginRight: 10, marginLeft: 10 }}>
          <IconButton
            onClick={() => {
              toggleContext({
                isOpen: true,
                properties: {
                  type: "Notification",
                  data: notifications,
                  title: "Notifications",
                },
              });
            }}
            aria-label="cart"
          >
            <StyledBadge
              badgeContent={notifications && notifications.length}
              color="secondary"
            >
              <NotificationsIcon />
            </StyledBadge>
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default ToolBarView;
