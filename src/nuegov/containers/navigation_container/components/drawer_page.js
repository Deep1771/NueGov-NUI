import React from "react";
import { ContainerWrapper } from "components/wrapper_components";
import { PresetPanel } from "containers/user_containers/personalization";

const DrawerPage = () => {
  return (
    <ContainerWrapper
      style={{ flex: 1, display: "flex", width: "100%", height: "100%" }}
    >
      <div
        style={{
          display: "flex",
          flex: 9,
          marginBottom: "64px",
          flexDirection: "column-reverse",
          width: "100%",
          height: "85vh",
        }}
      >
        <PresetPanel />
      </div>
    </ContainerWrapper>
  );
};

export default DrawerPage;
