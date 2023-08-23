import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { DisplaySwitch } from "components/display_components";

let Toggle = (props) => {
  const { attributes, storevalue } = props;

  const useStyles = makeStyles((theme) => ({
    button: {
      justifyContent: "center",
      alignSelf: "center",
    },
    card: {
      display: "flex",
      flex: 1,
      margin: "10px 0px 0px 0px",
      flexDirection: "row",
    },
    heading: {
      fontFamily: "Roboto",
      fontSize: "16px",
      color: "#666666",
    },
  }));
  const classes = useStyles();

  const [value, setValue] = useState(false);

  //custom methods
  const handleChange = (name) => (event) => {
    setValue(event.target.checked);
    props.handleInputChanges({ value: event.target.checked, attributes });
  };

  //useEffect
  useEffect(() => {
    if (storevalue) setValue(true);
    else setValue(false);
  }, [storevalue]);

  return (
    <div className={classes.card}>
      <div
        style={{ flex: 9, display: "flex", alignItems: "center" }}
        className={classes.heading}
      >
        {attributes.title}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <DisplaySwitch checked={value} onChange={handleChange("checked")} />
      </div>
    </div>
  );
};

export default Toggle;
