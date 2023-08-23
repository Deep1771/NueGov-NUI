import React, { useState } from "react";
import DayPicker from "react-day-picker";
import PropTypes from "prop-types";
import "react-day-picker/lib/style.css";

let MiniCalendar = (props) => {
  let { togglePopUp, navigate } = props;
  let [calendarState, setCalendarState] = useState({
    selectedDate: new Date(),
  });

  let setDate = (date) => {
    setCalendarState({ selectedDate: date });
    navigate.changeView("month");
    navigate.onNavigate(date);
    togglePopUp({
      isOpen: false,
      properties: { type: "DateSelection", data: date },
    });
  };

  return (
    <DayPicker onDayClick={setDate} selectedDays={calendarState.selectedDate} />
  );
};

MiniCalendar.propTypes = {
  togglePopUp: PropTypes.func,
};

export default MiniCalendar;
