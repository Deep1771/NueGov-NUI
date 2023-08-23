export const formatDate = (date) => {
  if (date) return new Date(date).toISOString();
  else return new Date().toISOString();
};

export const isToday = (date) => {
  let inputDate = new Date(date);
  let todaysDate = new Date();
  return inputDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0);
};

export const nextDate = (date) => {
  var d = new Date(date); // today
  d = d.setDate(d.getDate() + 1);
  return d;
};

export const previousDate = (date) => {
  var d = new Date(date); // today
  d = d.setDate(d.getDate() - 1);
  return d;
};

export const addHoursToDate = (objDate, intHours, taskDateAndTime) => {
  var getHours = new Date(objDate).getHours();
  var getMinutes = new Date(objDate).getMinutes();
  var date = new Date(taskDateAndTime);
  date.setHours(getHours + intHours);
  date.setMinutes(date.getMinutes() + getMinutes);
  return date;
};

export const bufferTimeCrossed = (addedBuffer) => {
  let todaysDate = new Date();
  let { timeZone } = Intl.DateTimeFormat().resolvedOptions() || {};

  if (timeZone.split("/").includes("America")) {
    if (addedBuffer.getTime() > todaysDate.getTime()) {
      return false;
    } else return true;
  } else {
    return false;
  }
};
