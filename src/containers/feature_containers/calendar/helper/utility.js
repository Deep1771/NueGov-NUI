import moment from "moment";

export let capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export let getMonthDateRange = (date, isNotification) => {
  if (!isNotification) {
    let startDate = moment().startOf("month").toISOString();
    let endDate = moment().endOf("month").toISOString();
    return { start: startDate, end: endDate };
  } else {
    let startDate = moment(date).startOf("month").toISOString();
    let endDate = moment(date).endOf("month").toISOString();
    return { start: startDate, end: endDate };
  }
};
