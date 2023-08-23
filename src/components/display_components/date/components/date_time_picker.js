import React from "react";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { ThemeWrapper } from "../theme";
import { UserFactory } from "utils/services/factory_services";
import {
  getDateFormat,
  getDateWithoutOffset,
  isValidDate,
} from "utils/helper_functions";

const DisplayDateTime = (props) => {
  let { onChange, title, value, size, callFrom = "", ...rest } = props;
  const convertDateTime = callFrom === "nueassist";
  const { getAgencyTimeZone } = UserFactory();
  const timeZone = getAgencyTimeZone();
  const { offset, value: timezoneValue } = timeZone || {};

  const onDateTimeChange = (e) => {
    if (convertDateTime)
      onChange(isValidDate(e) ? getDateFormat(e, timeZone) : onChange(e));
    else onChange(e);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDateTimePicker
        label={title}
        value={
          value
            ? convertDateTime
              ? getDateWithoutOffset(value, timezoneValue)
              : value
            : null
        }
        KeyboardButtonProps={{ size }}
        onChange={onDateTimeChange}
        style={{ display: "flex", flex: 1 }}
        size={size}
        {...rest}
      />
    </MuiPickersUtilsProvider>
  );
};

DisplayDateTime.defaultProps = {
  allowKeyboardControl: false,
  disabled: false,
  error: false,
  format: "dd/MM/yyyy HH:mm",
  size: "small",
  /*
         MM(month),dd(date),yyyy(year) HH-24 hour format hh:12 hour format
         24h format 'dd/MM/yyyy HH:mm'
         12h format 'dd/MM/yyy hh:mm a'
         a-> to display am/pm in input field
    */
};

//Follows HOC pattern
export default ThemeWrapper(DisplayDateTime);
