import React from "react";

export const HeaderNameComponent = (props) => {
  return (
    <div>
      <div style={{ display: "flex" }}>
        <div style={{ color: "red" }}>*</div>
        <div
          style={{
            marginLeft: "10px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flexDirection: "row",
          }}
        >
          {props?.displayName}
        </div>
      </div>
    </div>
  );
};
