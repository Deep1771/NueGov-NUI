import React, { useState } from "react";
import { Popover } from "@material-ui/core";
import { set } from "dot-prop";
import isEqual from "lodash/isEqual";
import {
  DisplayText,
  DisplayChips,
  DisplayBadge,
  DisplayButton,
} from "../../display_components";

export const SortBy = ({
  app_cardContent,
  setValue,
  defaultValue,
  value,
  sys_topLevel,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleChip = (definition, order, type) => {
    setAnchorEl(null);
    let sortField;
    if (type === "REF") {
      if (definition.display.name.split(".").length > 1)
        sortField = `${definition.name}.${
          definition.display.name.split(".")[
            definition.display.name.split(".").length - 1
          ]
        }`;
      else sortField = `${definition.name}.${definition.display.name}`;
    } else sortField = definition.name;
    let tempObj = set({}, sortField, order);
    isEqual(tempObj, value)
      ? setValue("sortby", {})
      : setValue("sortby", tempObj);
  };

  const checked = (definition, order, type) => {
    let sortField;
    if (type === "REF") {
      if (definition.display.name.split(".").length > 1)
        sortField = `${definition.name}.${
          definition.display.name.split(".")[
            definition.display.name.split(".").length - 1
          ]
        }`;
      else sortField = `${definition.name}.${definition.display.name}`;
    } else sortField = definition.name;
    let tempObj = set({}, sortField, order);
    return isEqual(tempObj, value);
  };

  const getTitle = (value) => {
    if (value.type === "REFERENCE")
      return value.name.friendlyName ? value.name.friendlyName : "";
    else {
      let definition =
        sys_topLevel && sys_topLevel.find((e) => e.name === value.item.name);
      return definition ? definition.title : "";
    }
  };

  const handleMenu = (event) => setAnchorEl(event.currentTarget);

  const renderMenu = () => {
    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={(e) => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{
          zIndex: "10001",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "250px",
            height: "250px",
            padding: "10px",
          }}
        >
          {app_cardContent &&
            Object.keys(app_cardContent).length > 0 &&
            app_cardContent.descriptionField.map((item, idx) => {
              if (item.visible) {
                if (item.type === "REFERENCE") {
                  return (
                    item.displayFields &&
                    item.displayFields.map((e1) => {
                      return (
                        <div style={{ display: "flex", paddingTop: "10px" }}>
                          <DisplayText
                            variant="subtitle2"
                            style={{
                              flex: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              contain: "strict",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {getTitle({ name: e1, type: "REFERENCE" })}
                          </DisplayText>
                          <DisplayChips
                            style={{ height: "20px" }}
                            systemVariant={
                              checked(
                                { name: item.name, display: e1 },
                                1,
                                "REF"
                              )
                                ? "primary"
                                : "default"
                            }
                            size="small"
                            label="A - Z"
                            onClick={(e) =>
                              handleChip(
                                { name: item.name, display: e1 },
                                1,
                                "REF"
                              )
                            }
                          />
                          <DisplayChips
                            style={{ height: "20px", marginLeft: "10px" }}
                            systemVariant={
                              checked(
                                { name: item.name, display: e1 },
                                -1,
                                "REF"
                              )
                                ? "primary"
                                : "default"
                            }
                            label="Z - A"
                            onClick={(e) =>
                              handleChip(
                                { name: item.name, display: e1 },
                                -1,
                                "REF"
                              )
                            }
                            size="small"
                          />
                        </div>
                      );
                    })
                  );
                } else {
                  return (
                    <div
                      key={idx}
                      style={{ display: "flex", paddingTop: "10px" }}
                    >
                      <DisplayText
                        variant="subtitle2"
                        style={{
                          flex: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          contain: "strict",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getTitle({ item, type: "" })}
                      </DisplayText>
                      <DisplayChips
                        style={{ height: "20px" }}
                        systemVariant={
                          checked({ name: item.name }, 1)
                            ? "primary"
                            : "default"
                        }
                        label="A - Z"
                        onClick={(e) => handleChip({ name: item.name }, 1)}
                        size="small"
                      />
                      <DisplayChips
                        style={{ height: "20px", marginLeft: "10px" }}
                        systemVariant={
                          checked({ name: item.name }, -1)
                            ? "primary"
                            : "default"
                        }
                        label="Z - A"
                        onClick={(e) => handleChip({ name: item.name }, -1)}
                        size="small"
                      />
                    </div>
                  );
                }
              }
            })}
        </div>
      </Popover>
    );
  };

  return (
    <div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
      {/* <DisplayBadge
        overlap="circle"
        variant="dot"
        invisible={!value || !Object.keys(value).length}
      > */}
      {/* <DisplayButton onClick={handleMenu}> SORT BY</DisplayButton> */}
      {/* </DisplayBadge> */}
      {renderMenu()}
    </div>
  );
};
