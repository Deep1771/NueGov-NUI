import React from "react";
import PropTypes from "prop-types";
import { Switch } from "@material-ui/core";
import { DisplayFormControlLabel } from "components/display_components/form_helpers";
import { makeStyles } from "@material-ui/core/styles";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";
import { styled } from "@material-ui/styles";

export const DisplaySwitch = (props) => {
  const {
    color,
    hideLabel,
    onChange,
    systemVariant,
    label,
    labelPlacement,
    onlyValue,
    fontSize,
    type,
    ...rest
  } = props;
  const { useSwitchStyles } = Stylesheet();
  const { getVariantForComponent, getVariantObj } = ThemeFactory();
  const defaultVariant = systemVariant ? systemVariant : "primary";
  const bgColor = getVariantObj(defaultVariant).dark.bgColor;
  const classes = useSwitchStyles(
    getVariantForComponent("SWITCH", defaultVariant)
  );
  const useStyles = makeStyles(() => ({
    label: {
      fontFamily: "inherit",
      color: bgColor,
      fontSize: fontSize ? fontSize : "1rem",
      fontWeight: 500,
    },
  }));
  const classes1 = useStyles();
  const showMap =
    "https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/maponicon.svg";
  const hideMap =
    "https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/mapofficon.svg";

  const MapUISwitch = styled(Switch)(({ theme }) => ({
    width: 55,
    height: 28,
    padding: 7,
    "& .MuiSwitch-switchBase": {
      margin: 1,
      padding: 0,
      transform: "translateX(6px)",
      "&.Mui-checked": {
        color: "#fff",
        transform: "translateX(22px)",
        "& .MuiSwitch-thumb:before": {
          backgroundImage: `url(${showMap})`,
        },
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor: "#a9c3de",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: theme?.palette?.mode === "dark" ? "#003892" : "#ffffff",
      width: 26,
      height: 26,
      "&:before": {
        content: "''",
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundImage: `url(${hideMap})`,
      },
    },
    "& .MuiSwitch-track": {
      opacity: 1,
      backgroundColor: theme?.palette?.mode === "dark" ? "#8796A5" : "#d8e2ed",
      borderRadius: 20 / 2,
    },
  }));

  const renderMapSwitch = () => (
    <MapUISwitch
      sx={{ m: 1 }}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
      onChange={(event, value) => {
        onlyValue ? onChange(value) : onChange(event, value, props);
      }}
      {...rest}
    />
  );

  const renderSwitch = () => (
    <Switch
      classes={{
        checked: classes.checked,
        switchBase: classes.switchBase,
        track: classes.track,
      }}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
      onChange={(event, value) => {
        onlyValue ? onChange(value) : onChange(event, value, props);
      }}
      {...rest}
    />
  );

  return type === "map" ? (
    renderMapSwitch()
  ) : hideLabel ? (
    renderSwitch()
  ) : (
    <DisplayFormControlLabel
      classes={{
        label: classes1.label,
      }}
      control={renderSwitch()}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
      label={label}
      labelPlacement={labelPlacement}
    >
      {renderSwitch()}
    </DisplayFormControlLabel>
  );
};

DisplaySwitch.defaultProps = {
  labelPlacement: "start", // start | end | top | bottom
};

DisplaySwitch.propTypes = {
  onChange: PropTypes.func,
};
