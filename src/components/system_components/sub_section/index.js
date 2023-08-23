import React from "react";
import {
  DisplayDivider,
  DisplayText,
  DisplayIcon,
} from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemSubSection = (props) => {
  const { fieldmeta } = props;
  const { description } = fieldmeta;
  const { DoubleArrow } = SystemIcons;
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        width: "100%",
        alignItems: "end",
        margin: fieldmeta.title ? "8px 0px 0px 8px" : "0px",
        flexDirection: "row",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexShrink: 1, alignItems: "center" }}>
          <b>
            <DisplayText
              variant="subtitle1"
              style={{
                fontFamily: "Poppins",
                fontSize: "1rem",
                fontWeight: "600",
                paddingRight: "0.5rem",
                color: "#1976d2",
              }}
            >
              {" "}
              {fieldmeta.title}
            </DisplayText>
          </b>
        </div>
        <ToolTipWrapper
          title={description && description?.length > 57 ? description : ""}
          placement="bottom-start"
        >
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "pre",
              maxWidth: "20vw",
              fontSize: "11px",
              opacity: "0.65",
              height: "auto",
            }}
          >
            <DisplayText
              style={{
                fontSize: "11px",
              }}
            >
              {description && description}
            </DisplayText>
          </div>
        </ToolTipWrapper>
      </div>
      {fieldmeta.divider && (
        <>
          &nbsp;&nbsp;
          <div
            style={{
              display: "flex",
              flexGrow: 1,
              alignItems: "center",
            }}
          ></div>
        </>
      )}
    </div>
  );
};

export default GridWrapper(SystemSubSection);
