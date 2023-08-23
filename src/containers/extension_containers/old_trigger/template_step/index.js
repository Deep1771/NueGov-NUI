import React, { useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core";
import { Controller } from "react-hook-form";
import { DisplayTextEditor, DisplayInput } from "components/display_components";
import { useFormContext } from "react-hook-form";
import { TriggerContext } from "..";
// import { useStateValue } from "utils/store/contexts";

const useTemplateStyles = makeStyles({
  main: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  editor: {
    display: "flex",
    flex: 1,
  },
});

const TemplateStep = () => {
  const classes = useTemplateStyles();
  const [triggerState, dispatch] = useContext(TriggerContext);
  const { watch } = useFormContext();
  useEffect(() => {
    return () => {
      let formValues = watch();
      dispatch({
        type: "UPDATE_TRIGGER_FORM",
        payload: formValues,
      });
    };
  }, []);

  return (
    <div className={classes.main}>
      <div style={{ flexShrink: 1, display: "flex" }}>
        <Controller
          name="subject"
          render={({ field: { onChange, onClear, ...rest } }) => (
            <DisplayInput
              placeholder="Enter Template Subject"
              label="Notification Subject"
              onChange={onChange}
              variant="outlined"
              onClear={() => onChange("")}
              {...rest}
            />
          )}
        />
      </div>
      <div style={{ flex: 9, display: "flex", marginTop: "10px" }}>
        <Controller
          name="body"
          defaultValue={""}
          render={({
            field: { onChange, disable, placeholder, value, ...rest },
          }) => (
            <DisplayTextEditor
              className={classes.editor}
              style={{ height: "100%" }}
              {...rest}
              label={"Notification body"}
              disable={false}
              onChange={(data) => onChange(data)}
              value={value}
              placeholder={"Create your own notification body"}
            />
          )}
        />
      </div>
    </div>
  );
};

export default TemplateStep;
