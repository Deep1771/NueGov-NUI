import React, { useState, useEffect, useContext } from "react";
import { format } from "date-fns-tz";
import { Badge } from "@material-ui/core";
import { SystemIcons } from "utils/icons";
import { DisplayIconButton, DisplayModal } from "components/display_components";
import ColumnDateFilter from "components/helper_components/column_date_filter";
import { isValidDate } from "utils/helper_functions";
import { SummaryGridContext } from "../..";
import { NueassistSummaryGridContext } from "nueassist/containers/summary_container";

const DateSearch = (props) => {
  const [open, setOpen] = useState(false);
  const { Search } = SystemIcons;
  const [firstDate, setFirstDate] = useState();
  const [secondDate, setSecondDate] = useState();
  const [selectedOption, setSelectedOption] = useState("");
  const [clear, setClear] = useState(false);
  const { column } = props || {};
  const { key: columnKey, headerName } = column || {};
  const gridContext =
    props?.businessType === "NUEASSIST"
      ? NueassistSummaryGridContext
      : SummaryGridContext;
  const [gridProps, dispatch] = useContext(gridContext);
  const { filter = [] } = gridProps || {};
  const filterArray = filter || [];

  useEffect(() => {
    if (filterArray.hasOwnProperty(columnKey)) {
      setFirstDate(filterArray[columnKey]);
      setSecondDate(filterArray[columnKey + "End"]);
      setSelectedOption(filterArray[columnKey + "operator"] || "");
    }
  }, [clear]);

  useEffect(() => {
    if (
      props?.businessType === "NUEASSIST" &&
      Object.keys(filter)?.length === 0
    ) {
      setFirstDate("");
      setSecondDate("");
      setSelectedOption("");
    }
  }, [JSON.stringify(filter)]);

  const handleOnSearch = () => {
    if (selectedOption && firstDate)
      filterArray[columnKey + "operator"] = selectedOption;
    else delete filterArray[columnKey + "operator"];
    if (secondDate) filterArray[columnKey + "End"] = secondDate;
    else delete filterArray[columnKey + "End"];
    if (firstDate) {
      if (firstDate.includes(",")) filterArray[columnKey + "DetailMode"] = true;
      else filterArray[columnKey + "DetailMode"] = false;
      filterArray[columnKey] = firstDate;
    } else {
      delete filterArray[columnKey + "DetailMode"];
      delete filterArray[columnKey];
    }
    dispatch({ type: "SET_LOADER", payload: { loader: true } });
    props.column.handleColumnSearch(filterArray);
    setOpen(false);
  };

  const onOptionChange = (e) => {
    setSelectedOption(e.id);
    if (e.id != "BTE") {
      delete filterArray[columnKey + "End"];
      setSecondDate("");
    }
  };

  const onSecondDateChange = (date) => {
    if (date && isValidDate(date)) {
      let e = format(new Date(date), "yyyy-MM-dd");
      setSecondDate(e || "");
    } else if (date) {
      setSecondDate(new Date(date));
    } else {
      setSecondDate("");
    }
  };

  const onFirstDateChange = (date) => {
    if (date && isValidDate(date)) {
      let e = format(new Date(date), "yyyy-MM-dd");
      setFirstDate(e || "");
    } else if (date) {
      //saving this to disable search btn
      setFirstDate(new Date(date));
    } else {
      setSelectedOption("");
      setSecondDate("");
      setFirstDate("");
      delete filterArray[columnKey + "operator"];
      delete filterArray[columnKey];
      delete filterArray[columnKey + "End"];
    }
  };

  const onCancel = () => {
    // setFirstDate("");
    // setSecondDate("");
    // setSelectedOption("");
    // setClear(!clear);
    // props.column.handleColumnSearch();
    setOpen(false);
  };

  const onClear = () => {
    setFirstDate("");
    setSecondDate("");
    setSelectedOption("");
    delete filterArray[columnKey + "operator"];
    delete filterArray[columnKey];
    delete filterArray[columnKey + "End"];
    setClear(!clear);
  };

  return (
    <div style={{ width: "100%" }}>
      <Badge
        variant="dot"
        badgeContent=" "
        style={{ width: "100%" }}
        invisible={firstDate ? false : true}
        color="primary"
      >
        <div style={{ width: "100%" }}>
          <DisplayIconButton
            testid={`-searchButton`}
            onClick={() => {
              setOpen(true);
            }}
            systemVariant="primary"
            style={{
              display: "flex",
              paddingRight: "4px",
              fontSize: "14px",
              width: "100%",
              border: "1px solid",
              borderRadius: "50px",
              height: "28px",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{ opacity: "0.5", color: "#666666", paddingLeft: "4px" }}
            >
              {"Search"}
            </span>
            <Search style={{ height: "20px" }} />
          </DisplayIconButton>
        </div>
      </Badge>
      <DisplayModal open={open} fullWidth={false} maxWidth={"sm"}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "auto",
            width: "300px",
          }}
        >
          <h5 style={{ margin: "0px", padding: "10px 0px 0px 10px" }}>
            {headerName || "Search"}
          </h5>
          <ColumnDateFilter
            {...props}
            setOpen={setOpen}
            onFirstDateChange={onFirstDateChange}
            onSecondDateChange={onSecondDateChange}
            onOptionChange={onOptionChange}
            setSelectedOption={setSelectedOption}
            handleOnSearch={handleOnSearch}
            firstDate={firstDate}
            secondDate={secondDate}
            selectedOption={selectedOption}
            onCancel={onCancel}
            setFirstDate={setFirstDate}
            setSecondDate={setSecondDate}
            onClear={onClear}
          />
        </div>
      </DisplayModal>
    </div>
  );
};
export default DateSearch;
