import React, { useEffect } from "react";
import { DetailContainer } from "containers/composite_containers";
import { DisplayModal } from "components/display_components";

let Modal = (props) => {
  let { control, toggleDetail } = props;
  let { properties } = control;

  let closeModal = () => {
    toggleDetail({ isOpen: false, properties: { MODE: "read" } });
  };

  return (
    <div>
      <DisplayModal
        fullWidth={true}
        open={control.isOpen}
        maxWidth="xl"
        children={
          <div
            style={{
              padding: 10,
              backgroundColor: "#F5F5F5",
              flexDirection: "column",
              height: "85vh",
              width: "auto",
              display: "flex",
              flex: 1,
              alignSelf: "center",
            }}
          >
            <div style={{ flex: 9, display: "flex" }}>
              <DetailContainer
                appname={properties.appname}
                groupname={properties.templatename}
                id={properties.id}
                mode={properties.mode ? properties.mode : "read"}
                modulename={properties.modulename}
                onClose={(e) => closeModal()}
                saveCallback={(e) => closeModal()}
              />
            </div>
          </div>
        }
      />
    </div>
  );
};
export default Modal;
