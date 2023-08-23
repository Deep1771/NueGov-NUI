import React from "react";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { ThemeWrapper } from "../date/theme";
import { KeyboardTimePicker } from "@material-ui/pickers";
import { UserFactory } from "utils/services/factory_services";
import { SystemIcons } from "utils/icons";
import { getDateFormat, getDateWithoutOffset } from "utils/helper_functions";
import { isValid } from "date-fns";
const { Alarm } = SystemIcons;

const DisplayTimePicker = (props) => {
  const { value, onChange, callFrom, ...rest } = props;
  const convert = callFrom === "nueassist";
  const { getAgencyTimeZone } = UserFactory();
  const timeZone = getAgencyTimeZone();
  const { offset, value: timezoneValue } = timeZone || {};

  const onTimeChange = (e) => {
    if (convert && isValid(e)) onChange(getDateFormat(e, timeZone));
    else onChange(e);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardTimePicker
        style={{ width: "100%" }}
        onChange={onTimeChange}
        value={
          value
            ? convert
              ? getDateWithoutOffset(value, timezoneValue)
              : value
            : null
        }
        {...rest}
      />
    </MuiPickersUtilsProvider>
  );
};

DisplayTimePicker.defaultProps = {
  mask: "__:__ _M",
  showTodayButton: true,
  todayLabel: "Now",
  size: "small",
  keyboardIcon: <Alarm />,
};

export const DisplayTime = ThemeWrapper(DisplayTimePicker);
