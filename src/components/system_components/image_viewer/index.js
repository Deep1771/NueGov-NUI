import React from "react";
import { SystemLabel } from "components/system_components/";
export const SystemImageViewer = (props) => {
  const { fieldmeta } = props;
  const { title, info, ...rest } = fieldmeta;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      {title && (
        <div className="system-label" style={{ display: "flex", flex: 1 }}>
          <SystemLabel toolTipMsg={info} filled={title}>
            {title}
          </SystemLabel>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <img
          style={{ backgroundColor: "inherit" }}
          width="100%"
          {...rest}
        ></img>
      </div>
    </div>
  );
};
SystemImageViewer.defaultProps = {
  fieldmeta: {
    height: "350px",
    width: "350px",
    alt: "Image",
  },
};
