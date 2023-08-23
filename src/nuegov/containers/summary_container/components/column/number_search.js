import { TextField, makeStyles } from "@material-ui/core";
import { DisplayIconButton } from "components/display_components";
import InputAdornment from "@material-ui/core/InputAdornment";
import { SystemIcons } from "utils/icons";
import React, { useState, useEffect, useContext } from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { SummaryGridContext } from "../..";
import { NueassistSummaryGridContext } from "nueassist/containers/summary_container";
import IconButton from "@material-ui/core/IconButton";

const styles = makeStyles(() => ({
  root: {
    "& fieldset": {
      border: "1px solid #01579b",
    },
  },
}));

const NumberSearch = (props) => {
  const gridContext =
    props?.businessType === "NUEASSIST"
      ? NueassistSummaryGridContext
      : SummaryGridContext;
  const [gridProps, dispatch] = useContext(gridContext);

  const {
    Search,
    ArrowBackIos,
    ArrowForwardIos,
    DragHandleIcon,
    MoreVertIcon,
  } = SystemIcons;
  const [val, setVal] = useState("");
  const options = [
    { value: "Equals", id: "EQ" },
    { value: "Greater than", id: "GTE" },
    { value: "Less than", id: "LTE" },
  ];
  const classes = styles();
  const [selectedOption, setSelectedOption] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const columnKey = props?.column?.key || "";
  const { filter = [] } = gridProps || {};
  const filterArray = filter || [];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (filterArray.hasOwnProperty(columnKey)) {
      setSelectedOption(filterArray[columnKey + "operator"] || "");
      setVal(filterArray[columnKey]);
    }
  }, []);

  useEffect(() => {
    if (
      props?.businessType === "NUEASSIST" &&
      Object.keys(filter)?.length === 0
    ) {
      setVal("");
    }
  }, [JSON.stringify(filter)]);

  const handleOnSearch = () => {
    dispatch({ type: "SET_LOADER", payload: { loader: true } });
    props.column.handleColumnSearch(filterArray);
  };

  const onOptionChange = (e) => {
    if (!e) {
      delete filterArray[columnKey + "operator"];
      return;
    }
    setSelectedOption(e.id);
    handleClose();
    filterArray[columnKey + "operator"] = e.id;
  };

  const onTextChange = (e) => {
    if (e?.target?.value == "" || e == "") {
      delete filterArray[columnKey];
      delete filterArray[columnKey + "operator"];
      setVal("");
      handleOnSearch();
      setSelectedOption("");
    } else {
      filterArray[columnKey] = e.target.value;
      setVal(e.target.value || "");
    }
  };

  const getIcon = () => {
    switch (selectedOption) {
      case "GTE":
        return <ArrowForwardIos fontSize="small" />;
      case "LTE":
        return <ArrowBackIos fontSize="small" />;
      case "EQ":
        return <DragHandleIcon fontSize="small" />;
      default:
        return <MoreVertIcon fontSize="small" />;
    }
  };

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
        style={{ padding: "0px 3px" }}
      >
        {getIcon()}
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
            width: "20ch",
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.id}
            style={{ padding: "5px", fontSize: "14px" }}
            selected={option.id == selectedOption}
            onClick={() => onOptionChange(option)}
          >
            {option.value}
          </MenuItem>
        ))}
      </Menu>

      <TextField
        value={val}
        type="number"
        onChange={(e) => onTextChange(e)}
        variant="outlined"
        size="small"
        placeholder="Search"
        classes={classes}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleOnSearch();
          }
        }}
        style={{ height: 28, width: "75%" }}
        sx={{
          "& .MuiInputBase-root": {
            height: 28,
          },
        }}
        InputProps={{
          style: {
            height: "28px",
            borderRadius: "50px",
          },
          endAdornment: (
            <InputAdornment position="end">
              <DisplayIconButton
                systemVariant="primary"
                onClick={handleOnSearch}
                style={{ cursor: "pointer", padding: "0px" }}
              >
                <Search style={{ height: "20px" }} />
              </DisplayIconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};
export default NumberSearch;
