import React, { useState, useEffect } from "react";
import {
  DisplayText,
  DisplayInput,
  DisplayButton,
  DisplayDialog,
} from "components/display_components/";
import { PaperWrapper } from "components/wrapper_components";
import { get } from "utils/services/helper_services/object_methods";
import { GlobalFactory } from "utils/services/factory_services";
import { SystemLabel } from "../index";
import { useDetailData } from "containers/composite_containers/detail_container/detail_state";

export const SystemApproval = (props) => {
  const { fieldmeta, callbackValue, data, stateParams } = props;
  const { groupname } = stateParams;
  const {
    description,
    value: VALUE,
    id: ID,
  } = data ? data : { description: "" };
  const {
    title,
    placeHolder,
    info,
    notes,
    required,
    values,
    disableDescription,
    hideDescription,
  } = fieldmeta;
  const [value, setValue] = useState(description ? description : "");
  const { setTriggerSave } = GlobalFactory();
  const [err, setErr] = useState(false);
  const [dialog, setDialog] = useState({ dialog: false });
  const { formError } = useDetailData();

  const updateStatus = (desc, i) => {
    let { value, id } = i;
    callbackValue({ description: desc, value, id }, props);
    setTriggerSave(groupname);
    setDialog({ dialog: false });
  };

  const openSaveDialog = (v, i) => {
    let { dialogTitle, dialogMsg, buttonLabel } = i;
    let saveModal = {
      dialog: true,
      title: dialogTitle || "Sure to save ?",
      msg: dialogMsg || "Your changes will be saved",
      confirmLabel: buttonLabel || "Save",
      onConfirm: () => {
        updateStatus(v, i);
      },
    };
    setDialog(saveModal);
  };

  useEffect(() => {
    setErr(formError.topLevel.length ? true : false);
  }, [formError.topLevel]);

  return (
    <PaperWrapper style={{ backgroundColor: "#f5f5f5" }}>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          padding: "10px",
        }}
      >
        {!hideDescription && (
          <>
            <div>
              <SystemLabel
                error={false}
                required={required}
                filled={value}
                toolTipMsg={info}
              >
                {title}
              </SystemLabel>
              <br />
              <br />
              <div style={{ backgroundColor: "#ffffff" }}>
                <DisplayInput
                  rows={3}
                  onChange={(value) => {
                    setValue(value);
                  }}
                  multiline={true}
                  placeholder={placeHolder}
                  value={value ? value : ""}
                  disabled={!!disableDescription}
                  variant="outlined"
                  systemVariant="secondary"
                />
              </div>
            </div>
            <br />
          </>
        )}
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          {notes && (
            <>
              <SystemLabel error={false} required={false}>
                Notes
              </SystemLabel>
              <ul>
                {notes.map((n, i) => (
                  <li key={i}>
                    <DisplayText>{n}</DisplayText>{" "}
                  </li>
                ))}
              </ul>
            </>
          )}
          <div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
            {values &&
              values
                .filter(
                  (v) =>
                    v.visible &&
                    (!v.onStatus ||
                      v.onStatus.includes(
                        get(data ? data : undefined, "id", "undefined")
                      ))
                )
                .map((i) => {
                  let { variant, buttonTitle } = i;
                  return (
                    <DisplayButton
                      size="large"
                      variant="outlined"
                      systemVariant={variant ? variant : "primary"}
                      onClick={() => {
                        openSaveDialog(value, i);
                      }}
                      disabled={err}
                    >
                      {buttonTitle}
                    </DisplayButton>
                  );
                })}
          </div>
        </div>
      </div>
      <DisplayDialog
        open={dialog.dialog}
        title={dialog.title}
        message={dialog.msg}
        confirmLabel={dialog.confirmLabel}
        onConfirm={dialog.onConfirm}
        onCancel={() => {
          setDialog({ dialog: false });
          setTriggerSave(false);
        }}
      />
    </PaperWrapper>
  );
};
