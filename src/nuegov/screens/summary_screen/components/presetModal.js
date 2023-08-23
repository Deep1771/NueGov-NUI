import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useStateValue } from "utils/store/contexts";
import { get } from "utils/services/helper_services/object_methods";
import { AppPanel } from "containers/user_containers/personalization/app_panel";
import {
  DisplayModal,
  DisplayButton,
  DisplayText,
} from "components/display_components";

export const PresetModal = ({ data, initRoute }) => {
  //Library hook
  const history = useHistory();
  //Custom Hook
  const [{ presetState }] = useStateValue();
  //Local Variables
  const { activePreset, defaultPreset } = presetState;
  const { sys_gUid } = data;
  const getActivePresetID = get(activePreset, "sys_gUid");
  const getDefaultPresetID = get(defaultPreset, "sys_gUid");
  const isActive = getActivePresetID === sys_gUid;
  const isDefault = getDefaultPresetID === sys_gUid;
  //Local State
  const [modal, setShowModal] = useState(true);
  const [panel, setShowPanel] = useState(false);

  //Custom functions
  const onClickAction = () => {
    setShowModal(false);
    initRoute();
  };

  return (
    <>
      <DisplayModal open={modal} title="Entity is not in your Active Preset">
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            height: "100px",
            justifyContent: "space-evenly",
          }}
        >
          <DisplayText style={{ alignSelf: "center" }}>
            click on "Add" to add to the active preset
          </DisplayText>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <DisplayButton
              onClick={() => {
                setShowPanel(true);
              }}
            >
              Add
            </DisplayButton>
            <DisplayButton
              systemVariant="secondary"
              onClick={() => {
                onClickAction();
              }}
            >
              {" "}
              Close
            </DisplayButton>
          </div>
        </div>
      </DisplayModal>
      <DisplayModal open={panel} fullWidth={true} maxWidth="xl">
        <div style={{ height: "90vh", width: "100%" }}>
          <AppPanel
            isActive={isActive}
            isDefault={isDefault}
            data={data}
            mode={"edit"}
            confirmCallback={() => {
              setShowPanel(false);
              history.go();
            }}
            closeCallBack={() => {
              setShowPanel(false);
              initRoute();
            }}
          />
        </div>
      </DisplayModal>
    </>
  );
};

export default PresetModal;
