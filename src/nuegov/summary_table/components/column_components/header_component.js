import React from "react";
import { SystemIcons } from "utils/icons";
import KeyboardArrowDownOutlinedIcon from "@material-ui/icons/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@material-ui/icons/KeyboardArrowUpOutlined";

const HeaderComponent = (props) => {
  const { ArrowUpward, ArrowDownward } = SystemIcons;

  let { params, handleSort, config, clicked = [], index } = props || {};

  let { columnGroup = null, column = null } = params || {};
  let columnData = {},
    screenType = "",
    sortEnabled = true;

  if (column) {
    columnData = column?.colDef?.columnData;
    screenType = column?.colDef?.screenType;
    sortEnabled = column?.colDef?.sortEnabled;
  } else if (columnGroup) {
    columnData = columnGroup?.children[0]?.colDef?.columnData;
    screenType = columnGroup?.children[0]?.colDef?.screenType;
    sortEnabled = columnGroup?.children[0]?.colDef?.sortEnabled;
  } else {
    columnData = {};
    screenType = "";
    sortEnabled = true;
  }

  let columnName = columnData?.name;
  if (columnData?.type === "REFERENCE") {
    columnName = `${columnData?.name}.${columnData?.displayFields[index]?.name}`;
  }

  return (
    <div
      style={{
        display: "flex",
        overflow: "hidden",
        textOverflow: "ellipsis",
        alignItems: "center",
        textDecoration: "none",
      }}
    >
      {sortEnabled && columnName != "agencyLogo" && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <KeyboardArrowUpOutlinedIcon
            style={{
              fontSize: "medium",
              cursor: "pointer",
              opacity:
                JSON.stringify([columnName, "ascending"]) ===
                JSON.stringify(clicked)
                  ? "1"
                  : "0.5",
            }}
            onClick={() => handleSort("ascending", config, columnName, index)}
          />
          <KeyboardArrowDownOutlinedIcon
            style={{
              fontSize: "medium",
              cursor: "pointer",
              opacity:
                JSON.stringify([columnName, "descending"]) ===
                JSON.stringify(clicked)
                  ? "1"
                  : "0.5",
            }}
            onClick={() => handleSort("descending", config, columnName, index)}
          />
        </div>
      )}
      <div
        style={{
          marginLeft: "8px",
          color:
            JSON.stringify(columnName) === JSON.stringify(clicked[0])
              ? "#0D47A1"
              : "",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {params?.displayName}
      </div>
    </div>
  );
};

export default HeaderComponent;
