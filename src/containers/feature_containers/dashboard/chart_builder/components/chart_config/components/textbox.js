import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { DisplayInput } from "components/display_components";

const Textbox = (props) => {
  const { attributes, storevalue, type } = props;

  const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(1),
      width: "90%",
      height: "90%",
      justifyContent: "center",
      alignSelf: "center",
    },
    input: {
      display: "none",
    },
  }));
  const classes = useStyles();

  const [bgColor, setBgColor] = useState("white");
  const [sample, setSample] = useState(storevalue);

  let handleChange = (name) => (event) => {
    setSample(event);
  };

  useEffect(() => {
    setSample(storevalue);
  }, [storevalue]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", flexDirection: "row", flex: 1 }}>
        <div style={{ flex: 9.5 }}>
          {!type ? (
            <DisplayInput
              id="outlined-basic"
              value={sample ? sample : ""}
              margin="normal"
              label={attributes.title}
              onChange={handleChange("title")}
              style={{ width: "100%", backgroundColor: bgColor }}
              variant="outlined"
              required={attributes.required}
              onBlur={() =>
                props.handleInputChanges({ value: sample, attributes })
              }
              InputProps={{
                style: {
                  fontFamily: "Roboto",
                  color: "#666666",
                  fontSize: 16,
                },
              }}
            />
          ) : (
            <DisplayInput
              id="standard-number"
              type="number"
              value={sample ? sample : ""}
              label={attributes.title}
              onChange={handleChange("title")}
              style={{ width: "100%", backgroundColor: bgColor }}
              onBlur={() =>
                props.handleInputChanges({ value: sample, attributes })
              }
              required={attributes.required}
              InputProps={{
                style: {
                  fontFamily: "Roboto",
                  color: "#666666",
                  fontSize: 16,
                },
              }}
              margin="normal"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Textbox;
