import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, InputAdornment } from "@material-ui/core";
import PropTypes from "prop-types";
import { DisplayIconButton } from "components/display_components";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";
import { SystemIcons } from "utils/icons/";
import { isDefined } from "utils/services/helper_services/object_methods";

const useStyles = makeStyles({
  root: {
    "& .Mui-disabled": {
      color: "rgba(0, 0, 0, 0.6)", // (default alpha is 0.38)
    },
    "& .MuiFormLabel-asterisk": {
      fontSize: "20px",
      fontWeight: 700,
    },
  },
});

const DisplayInput = (props) => {
  const {
    color,
    disabled,
    hideClear,
    iconButtonSize,
    iconName,
    onBlur,
    onChange,
    onClear,
    onIconClick,
    startIconClick,
    startIconName,
    value,
    startIconDisable,
    endIconDisable,
    testid,
    turnOffAutoFill = {},
    ...rest
  } = props;

  const classes = useStyles();

  const Icon = iconName;
  const StartIcon = startIconName;
  const { Clear } = SystemIcons;

  const handleClear = (event) => {
    onChange && onChange(null);
    onClear && onClear();
  };
  const getStartIcon = () => {
    return (
      <div>
        {startIconName && !disabled && (
          <DisplayIconButton
            testid={`${testid}-startIcon`}
            size={iconButtonSize ? iconButtonSize : "medium"}
            systemVariant="primary"
            disabled={
              startIconClick && !startIconDisable && !disabled ? false : true
            }
            color={color}
            onClick={(event) => startIconClick()}
          >
            <StartIcon />
          </DisplayIconButton>
        )}
      </div>
    );
  };
  const getEndIcon = () => {
    return (
      <div>
        {iconName && !disabled && (
          <DisplayIconButton
            testid={`${testid}-endIcon`}
            datasize={iconButtonSize ? iconButtonSize : "medium"}
            systemVariant="primary"
            disabled={
              onIconClick && !endIconDisable && !disabled ? false : true
            }
            color={color}
            onClick={() => onIconClick()}
          >
            {" "}
            <Icon />{" "}
          </DisplayIconButton>
        )}
        {isDefined(value) && !hideClear && !disabled && (
          <DisplayIconButton
            testid={"clear"}
            size={iconButtonSize ? iconButtonSize : "medium"}
            systemVariant="primary"
            color={color}
            onClick={handleClear}
          >
            {" "}
            <Clear />{" "}
          </DisplayIconButton>
        )}
      </div>
    );
  };

  return (
    <TextField
      className={classes.root}
      style={{ display: "flex", flex: 1 }}
      {...rest}
      value={value}
      disabled={disabled}
      InputProps={{
        testid: `${testid}`,
        startAdornment: (
          <InputAdornment disablePointerEvents={disabled}>
            {getStartIcon()}
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end" disablePointerEvents={disabled}>
            {getEndIcon()}
          </InputAdornment>
        ),
        ...rest.InputProps,
        style: {
          ...rest?.InputProps?.style,
          minHeight: rest?.InputProps?.style?.height,
          height: "",
        },
      }}
      {...turnOffAutoFill}
      inputProps={{ ...rest.inputProps }}
      onChange={(event) => onChange && onChange(event.target.value)}
      onBlur={(event, value) => onBlur && onBlur(event, value, props)}
    />
  );
};
DisplayInput.defaultProps = {
  color: "primary",
  hideClear: false,
  placeholder: "Type here",
  size: "small",
  type: "text", //html input types
};

DisplayInput.propTypes = {
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
};

export default FormThemeWrapper(DisplayInput);
