import React, { useState, useEffect } from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { ThemeFactory } from "utils/services/factory_services";
import { SystemIcons } from "utils/icons";
import {
  DisplayButton,
  DisplayDatePicker,
  DisplaySwitch,
} from "components/display_components";
import AdvancedDateFilter from "components/display_components/advanced_date_filter";
import { parseISO } from "date-fns";
import { isValidDate } from "utils/helper_functions";
const useStyles = makeStyles({
  text: ({ colors }) => ({
    color: colors.dark.bgColor,
  }),
  label: {
    fontSize: "10.5px",
  },
});

const ColumnDateFilter = (props) => {
  const {
    firstDate,
    secondDate,
    selectedOption,
    onFirstDateChange,
    onSecondDateChange,
    setSelectedOption,
    onOptionChange,
    handleOnSearch,
    onCancel,
    setFirstDate,
    setSecondDate,
    onClear,
  } = props;
  let columnData = props?.column?.columnData || [];
  const { getVariantForComponent } = ThemeFactory();
  const classes = useStyles(getVariantForComponent("", "primary"));
  const title = props.column.title || "";
  const [isDisabled, setDisabled] = useState(false);
  const { ArrowBackIos, ArrowForwardIos, DragHandleIcon, CompareArrowsIcon } =
    SystemIcons;
  const options = [
    { value: "After", id: "GTE" },
    { value: "Before", id: "LTE" },
    { value: "In Between", id: "BET" },
  ];
  const [anchorEl, setAnchorEl] = useState(null);
  const [toggle, setToggle] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    console.log("selectedOption", selectedOption);
  }, [selectedOption]);

  const getDisabledState = () => {
    if (selectedOption == "BET") {
      setDisabled(firstDate == "Invalid Date" || secondDate == "Invalid Date");
    } else {
      setDisabled(firstDate == "Invalid Date");
    }
  };

  const getDateFields = () => {
    if (toggle) {
      return (
        <div style={{ width: "100%" }}>
          <div style={{ paddingBottom: "20px" }}>
            <AdvancedDateFilter
              j={{ name: "aa", years: columnData?.years }}
              label={selectedOption == "BET" ? "Start Date" : "Date"}
              setValue={setFirstDate}
              classes={classes}
              value={firstDate}
            />
          </div>
          {selectedOption == "BET" && (
            <AdvancedDateFilter
              j={{ name: "ada" }}
              label={"End Date"}
              setValue={setSecondDate}
              value={secondDate}
              classes={classes}
            />
          )}
        </div>
      );
    } else {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            margin: "10px 0px",
          }}
        >
          <div
            style={{ marginBottom: selectedOption == "BET" ? "20px" : "0px" }}
          >
            <DisplayDatePicker
              onChange={onFirstDateChange}
              required={false}
              label={selectedOption == "BET" ? "Start Date" : "Date"}
              value={firstDate ? parseISO(firstDate) : null}
              testid={"1"}
              format={
                (props.column.format && props.column.format.split(" ")[0]) ||
                "MM/dd/yyyy"
              }
              placeholder={
                (props.column.format && props.column.format.split(" ")[0]) ||
                "MM/dd/yyyy"
              }
              inputVariant="outlined"
            />
          </div>
          {selectedOption == "BET" && (
            <DisplayDatePicker
              onChange={onSecondDateChange}
              required={false}
              label={"End Date"}
              value={secondDate ? parseISO(secondDate) : null}
              testid={"2"}
              format={
                (props.column.format && props.column.format.split(" ")[0]) ||
                "MM/dd/yyyy"
              }
              inputVariant="outlined"
            />
          )}
        </div>
      );
    }
  };

  useEffect(() => {
    getDisabledState();
  });

  useEffect(() => {
    if (!isValidDate(firstDate) && firstDate?.includes(",")) {
      setToggle(true);
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        padding: "0px 10px 10px 0px",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div>{title}</div>
      <hr style={{ width: "100%", color: "black" }} />
      {columnData?.detailMode && (
        <span style={{ fontSize: "14px", paddingLeft: "10px" }}>
          {columnData.detailModeTitle || "Custom Date Format"}
          <DisplaySwitch
            testid={`Date-toggle`}
            onChange={(e, checked) => {
              setSecondDate("");
              setFirstDate("");
              setSelectedOption("");
              setToggle(checked);
              return;
            }}
            checked={toggle}
          />
        </span>
      )}
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ padding: "10px", alignSelf: "center" }}>
          {!toggle && (
            <>
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleClick}
                style={{ padding: "0px" }}
              >
                {selectedOption == "GTE" ? (
                  <ArrowForwardIos fontSize="small" />
                ) : selectedOption == "LTE" ? (
                  <ArrowBackIos fontSize="small" />
                ) : selectedOption == "BET" ? (
                  <CompareArrowsIcon fontSize="small" />
                ) : (
                  <MoreVertIcon fontSize="small" />
                )}
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
                PaperProps={{
                  style: {
                    maxHeight: 48 * 4.5,
                    width: "15ch",
                  },
                }}
              >
                {options.map((option) => (
                  <MenuItem
                    key={option.id}
                    selected={option.id == selectedOption}
                    onClick={() => {
                      onOptionChange(option);
                      return handleClose();
                    }}
                    style={{ padding: "1px 15px" }}
                  >
                    {option.value}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </div>
        {getDateFields()}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "end",
        }}
      >
        {!toggle && firstDate && (
          <DisplayButton
            onClick={onClear}
            size="small"
            variant="outlined"
            style={{
              height: "30px",
              marginRight: "0.5rem",
            }}
          >
            Clear
          </DisplayButton>
        )}
        <DisplayButton
          onClick={onCancel}
          size="small"
          variant="outlined"
          style={{
            height: "30px",
            marginRight: "0.5rem",
          }}
        >
          Cancel
        </DisplayButton>
        <DisplayButton
          variant="contained"
          size="large"
          disabled={isDisabled}
          style={{
            height: "30px",
            marginRight: "0.5rem",
          }}
          onClick={handleOnSearch}
        >
          Search
        </DisplayButton>
      </div>
    </div>
  );
};
export default ColumnDateFilter;
