import React, { useState, useEffect, useContext } from "react";
import { IconButton, TextField, makeStyles } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { SystemIcons } from "utils/icons";
import { DisplayIconButton } from "components/display_components";
import { SummaryGridContext } from "../..";
import { NueassistSummaryGridContext } from "nueassist/containers/summary_container";

const styles = makeStyles(() => ({
  root: {
    "& fieldset": {
      border: "1px solid #01579b",
    },
  },
}));

const TextSearch = (props) => {
  const { Search, Clear, MoreVertIcon } = SystemIcons;
  const [val, setVal] = useState("");
  const gridContext =
    props?.businessType === "NUEASSIST"
      ? NueassistSummaryGridContext
      : SummaryGridContext;
  const [gridProps, dispatch] = useContext(gridContext);
  const { filter = {}, params } = gridProps || {};
  const filterArray = filter || {};
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [selectedOption, setSelectedOption] = useState("");
  const displayFields = props?.column?.displayFields || [];
  const isMultiReference = displayFields.length > 1;
  const [columnKey, setColumnKey] = useState(props?.column?.key || "");

  const classes = styles();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOnSearch = () => {
    dispatch({ type: "SET_LOADER", payload: { loader: true } });
    props.column.handleColumnSearch(filterArray);
  };

  const onTextChange = (e) => {
    if (e?.target?.value == "" || e == "") {
      delete filterArray[columnKey];
      setVal("");
      handleOnSearch();
    } else {
      filterArray[columnKey] = e.target.value;
      setVal(e.target.value || "");
    }
  };

  const onOptionChange = (e) => {
    delete filterArray[columnKey];
    setColumnKey(props?.column.key + "." + e.name);
    filterArray[props?.column.key + "." + e.name] = val;
    setSelectedOption(e.name);
    handleClose();
  };

  useEffect(() => {
    if (isMultiReference) {
      let foundSearchKey = false;
      for (let i of displayFields) {
        if (filterArray.hasOwnProperty(columnKey + "." + [i.name])) {
          foundSearchKey = true;
          setVal(filterArray[columnKey + "." + [i.name]]);
          setSelectedOption(i.name);
          setColumnKey(props?.column?.key + "." + i.name);
        }
      }
      if (!foundSearchKey) {
        setSelectedOption(displayFields[0].name);
        setColumnKey(props?.column?.key + "." + displayFields[0].name);
      }
    }
    if (displayFields.length == 1) {
      setColumnKey(props?.column?.key + "." + displayFields[0].name);
      setVal(filterArray[props?.column?.key + "." + displayFields[0].name]);
    } else {
      if (!isMultiReference && filterArray?.hasOwnProperty(columnKey)) {
        setVal(filterArray[columnKey]);
      }
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

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      {/* {isMultiReference && (
        <>
          <IconButton
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={handleClick}
            style={{ padding: "0px 3px" }}
          >
            <MoreVertIcon fontSize="small" />
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
                // width: "20ch",
              },
            }}
          >
            {displayFields.map((option) => (
              <MenuItem
                key={option.name}
                style={{ padding: "5px", fontSize: "14px" }}
                selected={option.name == selectedOption}
                onClick={() => onOptionChange(option)}
              >
                {option.friendlyName}
              </MenuItem>
            ))}
          </Menu>
        </>
      )} */}
      <TextField
        value={val}
        placeholder="Search"
        onChange={(e) => onTextChange(e)}
        variant="outlined"
        size="small"
        classes={classes}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleOnSearch();
          }
        }}
        style={{
          height: 28,
          fontSize: "14px",
          width: "100%",
        }}
        InputProps={{
          style: {
            height: "28px",
            fontSize: "14px",
            width: "100%",
            borderRadius: "50px",
          },
          endAdornment: (
            <InputAdornment>
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
export default TextSearch;
