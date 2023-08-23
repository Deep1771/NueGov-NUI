import React from "react";
import {
  DisplayGrid,
  DisplayInput,
  DisplayText,
} from "components/display_components";
import { GlobalFactory } from "utils/services/factory_services/";
import { SystemIcons } from "utils/icons";

const OpenApi = ({ getDetails }) => {
  const { open_apiKey } = getDetails?.sys_entityAttributes || "";
  const { documentationLink } = getDetails?.sys_entityAttributes || "";

  const { Copy, Launch } = SystemIcons;
  const { setSnackBar } = GlobalFactory();

  const copyHandler = () => {
    let text = document.getElementById("open-api-key");
    text.select();
    document.execCommand("copy");
    setSnackBar({ message: "Api key copied to clipboard", severity: "info" });
  };

  const redirectHandler = () => {
    window.open(documentationLink, "_blank");
  };

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <DisplayGrid
        container
        style={{ padding: "2rem", display: "flex", flexDirection: "column" }}
      >
        <DisplayGrid item style={{ display: "flex", flex: 1 }}>
          <DisplayText
            style={{ fontFamily: "inherit", fontWeight: 500 }}
            variant="h5"
          >
            Open API Info
          </DisplayText>
        </DisplayGrid>
        <DisplayGrid
          item
          style={{
            display: "flex",
            flex: 11,
            flexDrection: "row",
            flexWrap: "wrap",
          }}
        >
          <div key={0} style={{ padding: "1rem" }}>
            <DisplayInput
              type={"string"}
              testid={`open-api-key`}
              id="open-api-key"
              label={"Open API Key"}
              variant="outlined"
              color="primary"
              value={open_apiKey}
              hideClear={true}
              iconName={Copy}
              onIconClick={copyHandler}
              disabled={open_apiKey === ""}
            />
          </div>
          <div key={1} style={{ padding: "1rem" }}>
            <DisplayInput
              type={"string"}
              testid={`open-api-doc-link`}
              id="open-api-doc-link"
              label={"Documentation Link"}
              variant="outlined"
              color="primary"
              value={documentationLink}
              hideClear={true}
              iconName={Launch}
              onIconClick={redirectHandler}
              disabled={documentationLink === ""}
            />
          </div>
        </DisplayGrid>
      </DisplayGrid>
    </div>
  );
};

export default OpenApi;
