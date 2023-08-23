import React, { useEffect, useCallback, useState } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField, Chip, Button, makeStyles } from "@material-ui/core";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";

const useStyles = makeStyles({
  inputRoot: {
    "& .MuiAutocomplete-clearIndicator": {
      visibility: "visible",
    },
  },
  root: {
    "& .Mui-disabled": {
      color: "rgba(0, 0, 0, 0.6)", // (default alpha is 0.38)
    },
    "& .MuiAutocomplete-input": {
      minWidth: "50%",
    },
  },

  popperDisablePortal: {
    position: "absolute",
  },
});
const useStylesForCreate = makeStyles({
  paper: {
    "& ul": {
      paddingBottom: "0px",
    },
    "& li:last-child": {
      position: "sticky",
      bottom: 0,
      zIndex: 22332,
      backgroundColor: "white",
    },
  },
  inputRoot: {
    "& .MuiAutocomplete-clearIndicator": {
      visibility: "visible",
    },
  },
  root: {
    "& .Mui-disabled": {
      color: "rgba(0, 0, 0, 0.6)", // (default alpha is 0.38)
    },
    "& .MuiAutocomplete-input": {
      minWidth: "50%",
    },
  },
  popperDisablePortal: {
    position: "absolute",
  },
});

const DisplayAutocomplete = (props) => {
  let {
    labelKey,
    onChange,
    selectedKey,
    onlyValue,
    renderTags,
    size,
    ChipProps,
    options,
    getOptionSelected,
    getOptionDisabled,
    testid,
    canCreate,
    callFrom,
    disablePortal = true,
    name,
    ...rest
  } = props;
  const classes = useStyles();

  const { clickable, onClick } = ChipProps || {};

  //const classes = useStyles();
  const featureClass = useStylesForCreate();
  const handleChange = (event, value) => {
    if (value) {
      if (rest.multiple) {
        value = selectedKey ? value.map((e) => e[selectedKey]) : value;
        if (!onlyValue) onChange(event, value, props);
        else onChange(value);
      } else {
        if (!onlyValue)
          onChange(event, selectedKey ? value[selectedKey] : value, props);
        else onChange(selectedKey ? value[selectedKey] : value);
      }
    } else {
      if (onlyValue) onChange(value);
      else onChange(event, value, props);
    }
  };

  return (
    <div id={"inputHeight" + name} style={{ width: "100%" }}>
      <Autocomplete
        style={{ display: "flex", flex: 1 }}
        options={options}
        onChange={handleChange}
        testid={testid}
        disablePortal={callFrom === "top_level" && disablePortal ? true : false}
        ListboxProps={{
          style: {
            maxHeight: "250px",
          },
        }}
        getOptionSelected={getOptionSelected}
        getOptionDisabled={getOptionDisabled}
        classes={canCreate ? featureClass : classes}
        renderTags={(value, getTagProps) => {
          return value.map((option, index) => {
            let labelValue;
            if (typeof option === "object" && Object.keys(option).length) {
              if (Array.isArray(labelKey)) {
                let labelVals = labelKey?.map((el) => option[el]);
                labelValue = labelVals?.join("|") || "";
              } else {
                labelValue = option[labelKey];
              }
            } else if (Array.isArray(option) && option.length > 0) {
              let optionObj = option.find((e) => e[selectedKey] === option);
              if (Array.isArray(labelKey)) {
                let labelVals = labelKey?.map((el) => optionObj[el]);
                labelValue = labelVals?.join("|") || "";
              } else {
                labelValue = optionObj[labelKey];
              }
            } else labelValue = "";

            return labelValue === "" ? (
              ""
            ) : (
              <Chip
                size={size}
                key={index}
                label={labelValue}
                clickable={clickable}
                onClick={() => onClick(option)}
                style={{ maxWidth: "150px" }}
                {...getTagProps({ index })}
              />
            );
          });
        }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              {...rest}
              fullWidth
              InputProps={{
                ...params?.InputProps,
                ...rest?.InputProps,
                style: {
                  ...rest?.InputProps?.style,
                  padding: "0px 10px",
                },
              }}
              inputProps={{
                ...params?.inputProps,
                ...rest?.inputProps,
                style: {
                  ...rest?.inputProps?.style,
                  marginRight: "50px",
                },
              }}
            />
          );
        }}
        getOptionLabel={(option) => {
          return option[labelKey] ? option[labelKey] : "";
        }}
        filterOptions={(options, state) => {
          let newOptions = [];
          if (state.inputValue) {
            options.forEach((element) => {
              if (
                element[labelKey]
                  ?.toLowerCase()
                  ?.includes(state.inputValue.toLowerCase())
              )
                newOptions.push(element);
            });
            if (canCreate) return [...newOptions, { key: "create" }];
            else return newOptions;
          } else {
            if (canCreate) return [...options, { key: "create" }];
            else return options;
          }
        }}
        {...rest}
      />
    </div>
  );
};

DisplayAutocomplete.defaultProps = {
  disabled: false,
  required: false,
  onlyValue: false,
  size: "small",
};

/*const useStyles = makeStyles({
  paper: {
    "& ul": {
      paddingBottom: "0px",
    },
    "& li:last-child": {
      position: "sticky",
      bottom: 0,
      zIndex: 22332,
      backgroundColor: "white",
    },
  },
  inputRoot: {
    "& .MuiAutocomplete-clearIndicator": {
      visibility: "visible",
    },
  },
});
*/
export default FormThemeWrapper(DisplayAutocomplete);
