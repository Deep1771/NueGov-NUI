import React, { useState } from "react";

import { ThemeFactory } from "utils/services/factory_services";

import MiniCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  DisplayText,
  DisplayIconButton,
  DisplaySelect,
  DisplayModal,
  DisplaySearchBar,
} from "components/display_components";

import moment from "moment";
import {
  KeyboardArrowLeftOutlined,
  KeyboardArrowRightOutlined,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  text: ({ colors }) => ({
    color: colors.dark.bgColor,
  }),
  label: {
    fontSize: "10.5px",
  },
});

const ToolBarComponent = (props) => {
  let {
    activeView,
    changeView,
    togglePopUp,
    toggleDetail,
    setcalendarType,
    data,
    searchedValue,
    getSearchValue,
  } = props;

  let [currentView] = useState(activeView);
  const [toggleMiniCalendar, setToggleMiniCalendar] = useState(false);
  const [clearSearch, setClearSearch] = useState(false);
  const { getVariantForComponent } = ThemeFactory();
  const classes = useStyles(getVariantForComponent("", "primary"));
  let [selectedDate] = useState(
    moment(props.date).format("dddd, MMMM Do YYYY")
  );

  const [value, setValue] = useState(new Date(props.date));
  const [searchValue, setSearchValue] = useState(searchedValue || "");

  let onChange = (date) => {
    setValue(new Date(date));
    props.onNavigate(date);
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 50 * 4.5 + 8,
        ul: {
          padding: "2px 0px 0px 0px",
        },
      },
    },
    variant: "menu",
    getContentAnchorEl: null,
  };

  const views = [
    {
      view: "Daily",
      id: "day",
    },
    {
      view: "Weekly",
      id: "week",
    },
    {
      view: "Monthly",
      id: "month",
    },
  ];

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

  const renderCalendarModal = () => {
    return (
      <DisplayModal
        maxWidth={"sm"}
        open={toggleMiniCalendar}
        onClose={() => setToggleMiniCalendar(false)}
      >
        <MiniCalendar onChange={onChange} value={value} />
      </DisplayModal>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        // justifyContent: "space-between",
        // boxShadow: "0 8px 6px -6px black"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flex: 2.5,
          justifyContent: "space-between",
        }}
      >
        <DisplayIconButton
          systemVariant="primary"
          onClick={() => {
            let date = navigateDates(currentView, "PREV");
            props.onNavigate(date);
          }}
          style={{ cursor: "pointer", padding: "0px" }}
        >
          <KeyboardArrowLeftOutlined />
        </DisplayIconButton>
        <DisplayText onClick={() => setToggleMiniCalendar(true)}>
          {selectedDate}
        </DisplayText>
        <DisplayIconButton
          systemVariant="primary"
          onClick={() => {
            let date = navigateDates(currentView, "NEXT");
            props.onNavigate(date);
          }}
          style={{ cursor: "pointer", padding: "0px" }}
        >
          <KeyboardArrowRightOutlined />
        </DisplayIconButton>
      </div>
      <div
        style={{
          display: "flex",
          flex: 2,
          marginLeft: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DisplayText color={"primary"}>View : &nbsp;&nbsp;</DisplayText>
        <DisplaySelect
          title={"View"}
          labelKey={"view"}
          label={""}
          displayChip={false}
          selectView={true}
          valueKey={"id"}
          values={views}
          defaultValue={currentView}
          onChange={(value) => (changeView(value), props.onView(value))}
          value={currentView}
          multiple={false}
          showNone={false}
          MenuProps={MenuProps}
          variant="standard"
          hideFooterChips={true}
          style={{ width: "6vw", color: "primary" }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flex: 8,
          paddingLeft: "8vw",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DisplaySearchBar
          testid={`event-search`}
          placeholder="Type here to search"
          data={searchValue}
          onClick={(value) => {
            if (value) setClearSearch(true);
            getSearchValue(value);
          }}
          onClear={() => {
            if (clearSearch) setClearSearch(false);
            getSearchValue("");
          }}
          clearSearch={clearSearch}
        />
      </div>
      {renderCalendarModal()}
    </div>
  );
};

export default ToolBarComponent;
