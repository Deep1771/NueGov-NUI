import React, { useState } from "react";
import { Grow } from "@material-ui/core";
import { entityCount } from "utils/services/api_services/entity_service";
import { UserFactory } from "utils/services/factory_services";
import { PRESET_QUERY } from "../../service";
import {
  DisplayAvatar,
  DisplayButton,
  DisplayCheckbox,
  DisplayIcon,
  DisplayInput,
  DisplayText,
} from "components/display_components";
import { SystemIcons } from "utils/icons";

export const PreSaveModal = (props) => {
  const {
    successCallback,
    rejectCallback,
    defaultValue,
    mode,
    isDefault,
    isActive,
  } = props;
  const { PriorityHigh } = SystemIcons;
  const { checkDefaultPresetExists, getLoginName } = UserFactory();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState(defaultValue ? false : "intermediate");
  const [defaultChecked, setDefaultChecked] = useState(
    !checkDefaultPresetExists ? true : false
  );

  const buttonList = [
    {
      title: "Close",
      handler: () => {
        rejectCallback();
      },
      visibleCondition: true,
      id: "preset-close",
    },
    {
      title: "Save",
      handler: () => {
        successCallback(value, defaultChecked);
      },
      disableCondition: !value || [true, "intermediate"].includes(error),
      visibleCondition: true,
      id: "preset-save",
    },
    {
      title: "Save and Make Active",
      handler: () => {
        successCallback(value, defaultChecked, true);
      },
      disableCondition: !value || [true, "intermediate"].includes(error),
      visibleCondition: checkDefaultPresetExists && !isActive,
      id: "preset-saveAndMakeActive",
    },
  ];

  const checkUnique = (val) => {
    if (defaultValue && defaultValue === val) setError(false);
    else {
      setError("intermediate");
      let query = {
        ...PRESET_QUERY,
        presetName: val,
        "userName.username": getLoginName,
      };
      entityCount.get(query).then((res) => {
        if (res.data > 0) setError(true);
        else setError(false);
      });
    }
  };

  const getErrorText = () => {
    if (value) {
      if ([true].includes(error))
        return "Sorry, Preset with this name already exists! Try New.";
      else if ([false].includes(error)) return "";
      else return "Checking if any preset exists with name";
    } else return "";
  };

  return (
    <Grow in={true} timeout={1500}>
      <div
        style={{
          height: "40vh",
          width: "100%",
          display: "flex",
          flex: 1,
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
          }}
        >
          <DisplayAvatar style={{ height: "12vh", width: "12vh" }}>
            <DisplayIcon name={PriorityHigh} style={{ fontSize: "8vh" }} />
          </DisplayAvatar>
        </div>
        <div
          style={{
            flex: 5,
            display: "flex",
            padding: "10px 50px 10px 50px",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <DisplayText variant="h5" style={{ color: "#a6a4a4" }}>
              {mode === "new" ? "Enter" : "Edit"} preset name
            </DisplayText>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "flex-start",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, display: "flex" }}>
              <DisplayInput
                testid="preset-name"
                error={[true].includes(error)}
                placeholder="Enter unique name"
                value={value ? value : ""}
                onChange={(val) => {
                  setValue(val);
                  checkUnique(val);
                }}
                helperText={getErrorText()}
                variant="standard"
                style={{ display: "flex", flex: 1 }}
              />
            </div>
            <div
              style={{
                flexDirection: "row",
                flex: 1,
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <DisplayCheckbox
                inputProps={{ testid: "preset-makeDefault" }}
                checked={
                  defaultChecked || isDefault || !checkDefaultPresetExists
                }
                disabled={isDefault || !checkDefaultPresetExists}
                onChange={(checked) => setDefaultChecked(checked)}
                hideLabel={true}
              />
              <DisplayText style={{ color: "#a6a4a4" }}>
                Make this as your default preset
              </DisplayText>
            </div>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {buttonList.map(
            (
              {
                title,
                id,
                visibleCondition,
                disableCondition = false,
                handler,
              },
              i
            ) =>
              visibleCondition && (
                <DisplayButton
                  testid={id}
                  disabled={disableCondition}
                  onClick={handler}
                >
                  {title}
                </DisplayButton>
              )
          )}
        </div>
      </div>
    </Grow>
  );
};
