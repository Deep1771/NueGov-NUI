import moment from "moment-timezone";
import { format } from "date-fns-tz";
import axios from "axios";
import { get } from "lodash";
import { UserFactory } from "utils/services/factory_services";

export const getTrimmed = (str) => {
  try {
    return str.trim();
  } catch (e) {
    return "";
  }
};

export const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
};

export const addYears = (date, years) => {
  const dateCopy = new Date(date);
  dateCopy.setFullYear(date.getFullYear() + parseInt(years));
  return dateCopy;
};

export const addMonths = (date, months) => {
  const dateCopy = new Date(date);
  dateCopy.setMonth(dateCopy.getMonth() + parseInt(months));
  return dateCopy;
};

export const performOperation = (
  formData,
  operation,
  fieldToCalc,
  inputFromName
) => {
  //this function is to perform some calculation in detail page
  const fieldValue = formData?.sys_entityAttributes[inputFromName];
  const operand = formData?.sys_entityAttributes[fieldToCalc];

  if (fieldValue?.length && operation == "AVERAGE") {
    let length = 0;
    let val = fieldValue.reduce((acc, curr) => {
      if (parseInt(curr[fieldToCalc])) {
        length += 1;
        acc += parseInt(curr[fieldToCalc]);
      }
      return acc;
    }, 0);
    val = val ? (val / length).toFixed(2) : null;
    return val;
  } else if (
    fieldValue &&
    isValidDate(new Date(fieldValue)) &&
    operand?.length &&
    operation === "EXPIRATION"
  ) {
    let valToSubstract = operand.split(" ")[0].includes(".")
      ? operand.split(" ")[0].split(".")
      : operand.split(" ")[0];
    if (typeof valToSubstract === "string") {
      return new Date(addYears(new Date(fieldValue), valToSubstract));
    } else if (typeof valToSubstract === "object") {
      return addMonths(
        addYears(new Date(fieldValue), valToSubstract[0]),
        valToSubstract[1]
      );
    }
  } else {
    return null;
  }
};

export const appendCurrentTimeToDate = (date) => {
  try {
    let splitDate = date?.toString().split(" ");
    let todaysDate = new Date().toISOString();
    var getTime = todaysDate.substring(
      todaysDate.indexOf("T") + 1,
      todaysDate.lastIndexOf(".")
    );
    splitDate[4] = getTime;
    splitDate = splitDate.toString().replaceAll(",", " ");
    let e = new Date(splitDate).toISOString();

    return e;
  } catch (e) {
    return date;
  }
};

export const jsonParser = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return;
  }
};

export const setBrowserDetails = () => {
  const { appCodeName, appName, appVersion, userAgent } = navigator || {};

  if (appCodeName && appName && appVersion && userAgent) {
    let browserDetails = JSON.stringify({
      appCodeName,
      appName,
      appVersion,
      userAgent,
    });
    localStorage.setItem("browserDetails", browserDetails);
  }
};

export const setMyIp = async () => {
  try {
    const data = await axios({
      method: "get",
      // url: `https://geolocation-db.com/json/`,
      url: `https://api.ipify.org?format=json`,
      withCredentials: false,
    });
    if (data?.data)
      localStorage.setItem("geoLocation", JSON.stringify(data.data));
  } catch (e) {
    console.log("Failed to fetch location details", e);
  }
};

export const getDateFormat = (date, offsetObj) => {
  const { offset, value: timezoneValue } = offsetObj || {};
  const selectedDate = new Date(date);
  selectedDate.setSeconds(0);
  const selectedDateTimezone = { timeZone: timezoneValue };
  const formattedDate = selectedDate.toISOString().replace(/(\.\d+)Z$/, "Z");
  const formattedDateTimezone = format(
    new Date(formattedDate),
    "yyyy-MM-dd'T'HH:mm:ssxxx",
    selectedDateTimezone
  );
  return formattedDateTimezone;
};

export const setDateFormat = (date, offsetObj) => {
  const { offset, value: timezoneValue } = offsetObj || {};
  const selectedDate = moment(date);
  const selectedDateInTz = selectedDate.tz(timezoneValue);
  const formattedDate = selectedDateInTz.format("YYYY-MM-DDTHH:mm:ssZ");

  return formattedDate;
};

export const getDateWithoutOffset = (value, timezoneValue) => {
  const momentUtc = moment(value);
  let convertedTime = momentUtc.tz(timezoneValue);
  let dateTimeStr = convertedTime.format("YYYY-MM-DDTHH:mm:ssZ");
  const dateTimeWithoutOffset = dateTimeStr.substring(0, 19);
  return dateTimeWithoutOffset;
};

export const setSummaryScrollPosition = () => {
  let table = document.querySelector(".ag-body-viewport");
  let horizontalBar = document.querySelector(
    ".ag-body-horizontal-scroll-viewport"
  );
  sessionStorage.setItem(
    "summaryGridScrollPosition",
    JSON.stringify({ top: table?.scrollTop, left: horizontalBar.scrollLeft })
  );
};

const isRelation = (relationInfo) => {
  if (relationInfo) return Object.keys(relationInfo).length ? true : false;
};

export const isReadModeEnabled = (properties) => {
  const { isNJAdmin } = UserFactory();
  let {
    rowData = {},
    relationInfo = {},
    metadata = {},
    relatedProps = {},
  } = properties || {};
  let { rulesToReadMode = {} } = metadata?.sys_entityAttributes || {};
  let { path = "", values = [] } = rulesToReadMode;

  if (isNJAdmin()) {
    return false;
  } else {
    if (!isRelation(relationInfo)) {
      let actualData = get(rowData, path);
      return values?.includes(actualData) ? true : false;
    } else {
      let { props = {} } = relatedProps || {};
      let { data = {}, metadata = {} } = props;
      let { rulesToReadMode = {} } = metadata?.sys_entityAttributes || {};
      let { path = "", values = [] } = rulesToReadMode || {};
      let actualData = get(data, path);
      return values?.includes(actualData) ? true : false;
    }
  }
};
