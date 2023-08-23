import React, { useRef, useEffect } from "react";

const getMonthDifference = (dateFrom, dateTo) => {
  return (
    dateTo.getMonth() -
    dateFrom.getMonth() +
    12 * (dateTo.getFullYear() - dateFrom.getFullYear())
  );
};

const usePreviousValue = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const findFunction = (data, value) => {
  let found = false;
  if (typeof data === "object" && data !== null) {
    Object.entries(data).map((each) => {
      if (found) return;
      if (typeof each[1] === "object") found = findFunction(each[1], value);
      else if (each[1] instanceof Array) {
        each[1].map((e) => {
          if (typeof e === "object") found = findFunction(e, value);
        });
      } else {
        if (typeof each[1] === "string") {
          if (each[1]?.toLowerCase() === value?.toLowerCase()) {
            found = true;
          } else {
            let subString = each[1]
              ?.toLowerCase()
              .includes(value?.toLowerCase());
            if (subString) found = true;
          }
        }
      }
    });
  }
  return found;
};

const getFilteredData = (props) => {
  let { data, searchValue } = props || {};
  let filteredData = [];
  if (data?.length > 0) {
    filteredData = data?.filter((eachData) => {
      let found = false;
      if (typeof eachData === "object") {
        found = findFunction(eachData, searchValue);
      }
      return found;
    });
  }
  return filteredData;
};

const convertDataToEvent = (data) => {
  let timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Denver";
  let convertedData = data?.map((eachData) => {
    let startDate = new Date(eachData?.start).toLocaleString("en-US", {
      timeZone: timeZone,
    });
    let endDate = new Date(eachData?.end).toLocaleString("en-US", {
      timeZone: timeZone,
    });
    eachData = {
      ...eachData,
      start: new Date(startDate),
      end: new Date(endDate),
    };
    return eachData;
  });
  return convertedData;
};

export {
  convertDataToEvent,
  getMonthDifference,
  getFilteredData,
  usePreviousValue,
};
