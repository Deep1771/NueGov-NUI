import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ListSubheader,
  InputAdornment,
} from "@material-ui/core";
import { DisplayChips } from "../chips";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";
import { SystemIcons } from "utils/icons";
import { DisplayText } from "../text";
import "./style.css";
import { DisplayButton, DisplayInput } from "..";
import AddIcon from "@material-ui/icons/Add";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& > *": {
      // margin: theme.spacing(0.5),
    },
    "& .MuiSelect-filled.MuiSelect-filled": {
      background: "transparent",
    },
  },
  input: {
    color: "#ffffff",
  },
  underline: {
    "&&&:before": {
      borderBottom: "none",
    },
    "&&:after": {
      borderBottom: "none",
    },
  },
  input: {
    color: "#ffffff",
  },
  underline: {
    "&&&:before": {
      borderBottom: "none",
    },
    "&&:after": {
      borderBottom: "none",
    },
  },
}));
export const DisplaySelect = (props) => {
  const {
    defaultValue,
    displayChip,
    multiple,
    labelKey,
    onChange,
    title,
    valueKey,
    values,
    testid,
    showNone,
    selectView,
    hideFooterChips,
    limitTags,
    fromHotButton,
    menuItemStyle = {},
    handleCustomButton = () => {},
    isValueSelfServiceEnabled = false,
    enableSearch = false,
    ...rest
  } = props;

  let { Search } = SystemIcons;

  const [selected, setSelected] = useState();
  const [filteredData, setFilteredData] = useState(values || []);
  const [searchval, setSearchVal] = useState("");
  const classes = useStyles();
  const handleChange = (event) => {
    let value = event.target.value;
    if (multiple) {
      let multiValue =
        value.includes("NONE") || value.includes(defaultValue) ? [] : value;
      setSelected(multiValue);
      onChange(multiValue, event, props);
    } else onChange(value === "NONE" ? null : value, event, props);
  };

  const renderChips = (selected) => {
    setSelected(selected);
    return (
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {selected.map((value) => {
          if (filteredData.find((ev) => ev[valueKey] === value))
            return (
              <>
                <DisplayChips
                  // style={{ width: "82%" }}
                  avatar={values.find((ev) => ev[valueKey] === value)?.icon}
                  key={value}
                  size="small"
                  label={values.find((ev) => ev[valueKey] === value)[labelKey]}
                  disabled={rest?.disabled}
                />
                &nbsp;
              </>
            );
          else return null;
        })}
        {/* {selected.length > limitTags && (
          <DisplayChips
            size="small"
            style={{ width: "100%" }}
            label={`+ ${selected.length - limitTags} more`}
            disabled={rest?.disabled}
          />
        )} */}
      </div>
    );
  };

  const renderEllipsis = (selected) => {
    let labelValues = selected?.map((value) => {
      let val = values.find((ev) => ev[valueKey] === value);
      if (val) return val[labelKey];
    });
    return labelValues.join(", ");
  };

  const renderMenuItems = () => {
    return filteredData
      ?.filter((e) => e)
      .map((ev) => (
        <MenuItem
          key={ev[valueKey]}
          value={ev[valueKey]}
          disabled={ev?.isDisabled}
          testid={testid + "-" + ev[labelKey]}
          id={testid + "-" + ev[valueKey]}
          style={{
            display: ev.displayNone,
            padding: "0.5rem 1rem 0.5rem 1rem",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              overflow: "auto",
              marginRight: "10px",
              ...menuItemStyle,
            }}
          >
            {ev?.icon && (
              <div
                style={{
                  display: "flex",
                  margin: "1px 4px 1px 1px",
                  height: "18px",
                  width: "18px",
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
              >
                <img maxHeight="40" maxWidth="40" src={ev?.icon} />
              </div>
            )}
            {!ev?.icon && ev?.iconColor && (
              <div
                style={{
                  display: "flex",
                  margin: "1px 4px 1px 1px",
                  height: "18px",
                  width: "18px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: ev?.iconColor,
                }}
              ></div>
            )}
            <DisplayText variant="body2">
              {/* {ev[labelKey]}{" "} */}
              <span dangerouslySetInnerHTML={{ __html: ev[labelKey] }} />
              {ev?.required && <span style={{ color: "red" }}>&#42;</span>}
            </DisplayText>
          </div>
        </MenuItem>
      ));
  };

  const renderAllChips = () => {
    if (multiple)
      return (
        <div className={classes.root}>
          {selected?.map((value) => {
            if (filteredData.find((ev) => ev[valueKey] === value))
              return (
                <DisplayChips
                  avatar={
                    filteredData.find((ev) => ev[valueKey] === value)?.icon
                  }
                  key={value}
                  size="medium"
                  label={
                    filteredData.find((ev) => ev[valueKey] === value)[labelKey]
                  }
                  onDelete={() => {
                    handleDelete(value);
                  }}
                  disabled={rest?.disabled}
                />
              );
            else return null;
          })}
        </div>
      );
  };

  const handleDelete = (chipToDelete) => {
    let value = selected.filter((chip) => chip !== chipToDelete);
    setSelected(value);
    if (multiple) {
      let multiValue =
        value.includes("NONE") || value.includes(defaultValue) ? [] : value;
      setSelected(multiValue);
      onChange(multiValue, props);
    }
  };

  let handleFilter = (val) => {
    setSearchVal(val);
    if (!val) {
      return setFilteredData(values);
    } else {
      let newFilter = values.filter((eachItem) => {
        return eachItem[labelKey].toLowerCase().includes(val.toLowerCase());
      });
      return setFilteredData(newFilter);
    }
  };

  let renderValue = multiple
    ? displayChip
      ? renderChips
      : renderEllipsis
    : null;

  let handleClear = () => {
    setSearchVal("");
    setFilteredData(values);
  };

  useEffect(() => {
    setFilteredData(values);
  }, [values]);

  return (
    <FormControl
      testid={testid}
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        ...props.style,
        ...props.controlStyle,
      }}
    >
      {selectView ? (
        <>
          {rest?.label && (
            <InputLabel id="display-select-label">
              {rest?.label || " "}
            </InputLabel>
          )}
          <Select
            labelId="display-select-label"
            testid={testid}
            multiple={multiple}
            renderValue={renderValue}
            onChange={handleChange}
            {...rest}
          >
            {showNone !== false && (
              <MenuItem value={defaultValue || "NONE"}>
                {defaultValue || <em>NONE</em>}
              </MenuItem>
            )}
            {renderMenuItems()}
          </Select>
          {/* {!hideFooterChips} */}
        </>
      ) : (
        <>
          <TextField
            {...rest}
            hiddenLabel={true}
            className={classes.root}
            inputProps={{
              ...rest.inputProps,
              className:
                fromHotButton && rest.style.background ? classes.input : "",
              style: {
                ...rest.inputProps,
                marginRight: "50px",
              },
            }}
            select
            InputProps={{
              className: rest.disableUnderline ? classes.underline : "",
              ...rest.InputProps,
              style: {
                ...rest?.InputProps?.style,
                minHeight: rest?.InputProps?.style?.height,
                width: "100%",
                height: "",
                maxHeight: rest?.InputProps?.style?.maxHeight,
              },
            }}
            placeholder={rest?.label || " "}
            displayEmpty={true}
            SelectProps={{
              multiple,
              renderValue,
              ...rest.SelectProps,
            }}
            onClick={() => (enableSearch ? handleClear() : "")}
            onChange={handleChange}
          >
            {enableSearch && (
              <ListSubheader style={{ background: "white" }}>
                <DisplayInput
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{
                    marginTop: "-8px",
                    justifyContent: "center",
                    color: "white",
                    position: "sticky",
                    top: "0px",
                    width: "100%",
                    padding: "12px 0px",
                  }}
                  onClear={handleClear}
                  variant="outlined"
                  value={searchval}
                  placeholder="Search"
                  onKeyDown={(e) => {
                    if (e.key !== "Escape") {
                      // Prevents autoselecting item while typing (default Select behaviour)
                      e.stopPropagation();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment size="small" position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    style: {
                      ...rest?.InputProps?.style,
                      minHeight: rest?.InputProps?.style?.height,
                      height: "40px",
                    },
                  }}
                  onChange={handleFilter}
                />
              </ListSubheader>
            )}
            {showNone !== false && (
              <MenuItem value={defaultValue || "NONE"}>
                {defaultValue || <em>NONE</em>}
              </MenuItem>
            )}
            {renderMenuItems()}
            {isValueSelfServiceEnabled && (
              <MenuItem
                onClick={handleCustomButton}
                style={{
                  padding: "0.25rem 0.5rem",
                  width: "fit-content",
                  justifyContent: "center",
                  border: "1px solid #1976d2",
                  borderRadius: "0.25rem",
                  position: "sticky",
                  fontWeight: 500,
                  color: "#1976d2",
                  margin: "0.5rem 0rem 0.5rem 1rem",
                }}
              >
                {" "}
                <AddIcon />
                Add Custom Value
              </MenuItem>
            )}
          </TextField>
          {/* {!hideFooterChips} */}
        </>
      )}
    </FormControl>
  );
};

DisplaySelect.defaultProps = {
  multiple: false,
  displayChip: true,
  hideFooterChips: false,
  size: "small",
  limitTags: 1,
};

// export default FormThemeWrapper(DisplaySelect);
export default DisplaySelect;
