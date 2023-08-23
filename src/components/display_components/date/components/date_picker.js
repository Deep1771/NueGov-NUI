import React, { useEffect, useState } from "react";
import DateFnsUtils from "@date-io/date-fns";
import { isValid } from "date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { ThemeWrapper } from "../theme";
import { UserFactory } from "utils/services/factory_services";
import { getDateFormat, getDateWithoutOffset } from "utils/helper_functions";
import { DisplayHelperText } from "components/display_components/helper_text";

const DisplayDate = (props) => {
  let { onChange, testid, value, size, callFrom = "", errors, ...rest } = props;
  const convertDate = callFrom === "nueassist";
  const { getAgencyTimeZone } = UserFactory();
  const timeZone = getAgencyTimeZone();
  const { offset, value: timezoneValue } = timeZone || {};

  const onDateChange = (e) => {
    if (convertDate) {
      let res = isValid(e) ? getDateFormat(e, timeZone) : e;
      onChange(res);
    } else onChange(e);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        KeyboardButtonProps={{ size, testid: "CAL" + "-" + testid }}
        style={{ display: "flex", flex: 1 }}
        value={
          value
            ? convertDate
              ? getDateWithoutOffset(value, timezoneValue)
              : value
            : null
        }
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(event) => onDateChange(event)}
        size={size}
        placeholder={rest?.format}
        {...rest}
        error={errors}
      />
    </MuiPickersUtilsProvider>
  );
};

DisplayDate.defaultProps = {
  allowKeyboardControl: true,
  disabled: false,
  error: false, //new Date(02-06-2019) Minimum date to display
  format: "dd/MM/yyyy", // MM(month),dd(date),yyyy(year)
  size: "small",
};

//Follows HOC pattern
export default ThemeWrapper(DisplayDate);