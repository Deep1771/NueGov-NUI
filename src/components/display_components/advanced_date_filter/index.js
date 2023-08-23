import React, { useState, useEffect } from "react";
import { DisplayFormLabel, DisplaySelect } from "../../display_components";
import { SystemIcons } from "utils/icons";
import { DisplayIconButton } from "components/display_components";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

const AdvancedDateFilter = ({ value, rest, j, setValue, label }) => {
  const { Clear } = SystemIcons;
  const [monthVal, setMonthVal] = useState(0);
  const [yearVal, setYearVal] = useState(0);
  const [dayVal, setDayVal] = useState(0);
  const [years, setYear] = useState([
    {
      id: "2019",
      value: "2019",
    },
    {
      id: "2020",
      value: "2020",
    },
    {
      id: "2021",
      value: "2021",
    },
    {
      id: "2022",
      value: "2022",
    },
  ]);
  const masterMonthData = [
    { value: "Jan", id: "01" },
    { value: "Feb", id: "02" },
    { value: "Mar", id: "03" },
    { value: "Apr", id: "04" },
    { value: "May", id: "05" },
    { value: "June", id: "06" },
    { value: "July", id: "07" },
    { value: "Aug", id: "08" },
    { value: "Sept", id: "09" },
    { value: "Oct", id: "10" },
    { value: "Nov", id: "11" },
    { value: "Dec", id: "12" },
  ];
  let dayMasterData = [];
  for (let i = 1; i < 32; i++) {
    dayMasterData.push({ id: i < 10 ? "0" + i : i, value: i });
  }

  useEffect(() => {
    let yearsCopy = [];
    if (j.years?.length == 2) {
      let max = j.years[1];
      let min = j.years[0];

      for (let y = max; y >= min; y--) {
        yearsCopy.push({ id: y, value: y });
      }
      setYear(yearsCopy);
    }
  }, [j]);
  useEffect(() => {
    if (
      value &&
      value != "0,0,0" &&
      monthVal == 0 &&
      yearVal == 0 &&
      dayVal == 0
    ) {
      let getSplitValue = value.split(",");
      if (getSplitValue.length == 3) {
        setMonthVal(getSplitValue[0]);
        setDayVal(getSplitValue[1]);
        setYearVal(getSplitValue[2]);
        setValue(`${monthVal},${dayVal},${yearVal}`);
      }
    }
  }, [value]);

  const getDays = (year = new Date().getUTCFullYear(), month) => {
    return new Date(year, month, 0).getDate();
  };

  if (monthVal) {
    let noOfDays = getDays(yearVal, monthVal) + 1;
    dayMasterData = dayMasterData.filter((day) => day.id < noOfDays);
  }
  const onClearAdvancedDateView = () => {
    setMonthVal(0);
    setYearVal(0);
    setDayVal(0);
  };

  useEffect(() => {
    setValue(
      monthVal || dayVal || yearVal ? `${monthVal},${dayVal},${yearVal}` : ""
    );
  }, [monthVal, dayVal, yearVal]);

  return (
    <>
      {/* <DisplayFormLabel filled={value ? true : false}>{label}</DisplayFormLabel> */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: "1 1 0%",
          }}
        >
          <FormControl
            variant="outlined"
            size="small"
            style={{ width: "100%" }}
          >
            <InputLabel id="demo-simple-select-outlined-label">Year</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              label="Year"
              MenuProps={{
                style: { zIndex: 10001 },
              }}
              variant="outlined"
              value={yearVal}
              onChange={(e) => {
                return setYearVal(e.target.value);
              }}
              {...rest}
            >
              {years.map((li) => {
                return <MenuItem value={li.id}>{li.value} </MenuItem>;
              })}
            </Select>
          </FormControl>
        </div>
        <div
          style={{
            flex: "1",
          }}
        >
          <FormControl
            variant="outlined"
            size="small"
            style={{ width: "100%" }}
          >
            <InputLabel id="demo-simple-select-outlined-label">
              Month
            </InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              label="Month"
              MenuProps={{
                style: { zIndex: 10001 },
              }}
              variant="outlined"
              value={monthVal}
              onChange={(e) => {
                return setMonthVal(e.target.value);
              }}
              {...rest}
            >
              {masterMonthData.map((li) => {
                return <MenuItem value={li.id}>{li.value} </MenuItem>;
              })}
            </Select>
          </FormControl>
        </div>
        <div
          style={{
            flex: "1",
          }}
        >
          <FormControl
            variant="outlined"
            size="small"
            style={{ width: "100%" }}
          >
            <InputLabel id="demo-simple-select-outlined-label">Day</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              label="Day"
              MenuProps={{
                style: { zIndex: 10001 },
              }}
              variant="outlined"
              value={dayVal}
              onChange={(e) => {
                return setDayVal(e.target.value);
              }}
              {...rest}
            >
              {dayMasterData.map((li) => {
                return <MenuItem value={li.id}>{li.value} </MenuItem>;
              })}
            </Select>
          </FormControl>
        </div>
        <div style={{ alignSelf: "center" }}>
          {dayVal || monthVal || yearVal ? (
            <DisplayIconButton
              systemVariant="primary"
              onClick={onClearAdvancedDateView}
              style={{ cursor: "pointer", padding: "0px" }}
            >
              <Clear />
            </DisplayIconButton>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};
export default AdvancedDateFilter;
