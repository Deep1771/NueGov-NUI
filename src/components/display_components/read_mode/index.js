import React, { useState, useEffect } from "react";
import { textExtractor } from "../../../utils/services/helper_services/system_methods";
import { isDefined } from "utils/services/helper_services/object_methods";
import { DisplayGrid, DisplayText } from "./../../display_components";
import { ToolTipWrapper } from "components/wrapper_components";

export const DisplayReadMode = ({ data, fieldmeta }) => {
  const [text, setText] = useState("");
  useEffect(() => {
    if (isDefined(data)) {
      let txt = textExtractor(data, fieldmeta);
      setText(txt?.toString());
    } else {
      setText("");
    }
  }, [data]);
  return (
    <DisplayGrid
      container
      style={{ flex: 1, height: "100%", flexDirection: "column" }}
    >
      <DisplayGrid item container>
        <ToolTipWrapper title={fieldmeta.info}>
          <div>
            <DisplayText
              variant="h1"
              style={{ color: "#666666", cursor: "default" }}
            >
              {fieldmeta.title}
            </DisplayText>
          </div>
        </ToolTipWrapper>
      </DisplayGrid>
      <DisplayGrid item container style={{ paddingLeft: "15px", flex: 1 }}>
        <DisplayText
          variant="h2"
          style={{ color: "#616161", wordBreak: "break-all" }}
        >
          {text}
        </DisplayText>
      </DisplayGrid>
    </DisplayGrid>
  );
};
