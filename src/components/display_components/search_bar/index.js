import React, { useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { DisplayInput, DisplayIconButton } from "components/display_components";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";
import { SystemIcons } from "utils/icons";
import { makeStyles } from "@material-ui/core/styles";
import { Cancel } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  input: {
    display: "flex",
    flex: 1,
  },
  search: {
    display: "flex",
    flex: 1,
    width: "100%",
    alignItems: "center",
    margin: "8px",
  },
  textField: {
    [`& fieldset`]: {
      border: "1px solid #c3c3c3",
      // borderRadius: "50px",
    },
  },
}));

const DisplaySearchBar = (props) => {
  const [value, setValue] = useState("");
  const {
    data,
    onClick,
    onChange,
    onClear,
    placeholder,
    testid,
    style,
    clearSearch,
    debounce: DEBOUNCE = 500,
    hideClear = false,
  } = props;
  const { Search } = SystemIcons;
  const classes = useStyles();

  const handleChange = debounce((value) => {
    onChange && onChange(value);
  }, DEBOUNCE);

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) onClick && onClick(value);
  };

  const handleClear = () => {
    setValue("");
    onClear && onClear();
  };

  useEffect(() => {
    if (clearSearch) handleClear();
  }, [clearSearch]);

  useEffect(() => {
    setValue(data ? data : "");
  }, [data]);

  return (
    <div className={classes.search}>
      <DisplayInput
        classes={{
          root: classes.textField,
        }}
        testid={testid}
        placeholder={placeholder || "Search"}
        // className={classes.input}
        onChange={(val) => {
          setValue(val);
          handleChange(val);
        }}
        style={style}
        onClear={handleClear}
        onKeyDown={handleKeyDown}
        value={value ? value : ""}
        variant="outlined"
        hideClear={hideClear}
        InputProps={{
          endAdornment: (
            <>
              {value.length > 0 && (
                <DisplayIconButton
                  systemVariant="primary"
                  onClick={() => {
                    handleClear();
                    handleChange();
                  }}
                >
                  <Cancel />
                </DisplayIconButton>
              )}
              <DisplayIconButton
                systemVariant="primary"
                style={{ marginRight: "0.5rem" }}
                testid={`${testid}-searchButton`}
                onClick={() => {
                  onClick && onClick(value);
                  onChange && onChange(value);
                }}
              >
                <Search />
              </DisplayIconButton>
            </>
          ),
        }}
      />
    </div>
  );
};

export default FormThemeWrapper(DisplaySearchBar);
