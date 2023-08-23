import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core";
import { Controller } from "react-hook-form";
import {
  DisplayTextEditor,
  DisplayInput,
  DisplayText,
} from "components/display_components";
import { TriggerContext } from "../../";

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

const MailConstructor = () => {
  const [triggerState, dispatch] = useContext(TriggerContext);
  const { editable } = triggerState;
  const classes = useTemplateStyles();
  return (
    <div className={classes.main}>
      <div style={{ flexShrink: 1, display: "flex" }}>
        <Controller
          name="subject"
          rules={{ required: "Subject is a required field" }}
          render={({
            field: { onChange, ref, ...rest },
            fieldState: { error },
          }) => (
            <DisplayInput
              placeholder="Enter Template Subject"
              label="Notification Subject"
              onChange={onChange}
              variant="outlined"
              inputRef={ref}
              disabled={!editable}
              onClear={() => onChange("")}
              error={Boolean(error?.message)}
              helperText={error?.message || ""}
              {...rest}
            />
          )}
        />
      </div>
      <div
        style={{
          flex: 9,
          display: "flex",
          marginTop: "10px",
          flexDirection: "column",
        }}
      >
        <Controller
          name="body"
          rules={{ required: "Body is a required field" }}
          render={({
            field: { onChange, ref, ...rest },
            fieldState: { error },
          }) => {
            return (
              <>
                <DisplayTextEditor
                  className={classes.editor}
                  style={{ height: "100%" }}
                  label={"Notification body"}
                  disable={!editable}
                  inputRef={ref}
                  onChange={(data) => onChange(data)}
                  placeholder={"Create your own notification body"}
                  {...rest}
                />
                <DisplayText color="secondary">
                  {error?.message || ""}
                </DisplayText>
              </>
            );
          }}
        />
      </div>
    </div>
  );
};

export default MailConstructor;
