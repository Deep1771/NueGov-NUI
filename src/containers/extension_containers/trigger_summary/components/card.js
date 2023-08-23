import React, { useState } from "react";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { User } from "utils/services/factory_services/user_service";
import { get } from "utils/services/helper_services/object_methods";
//Custom Components
import {
  DisplayCard,
  DisplayDialog,
  DisplayGrid,
  DisplayIconButton,
  DisplayText,
} from "components/display_components";
import { TRIGGER_QUERY } from "utils/constants/query";
import { SystemIcons } from "utils/icons";

export const CardComponent = (props) => {
  const { isNJAdmin, isSuperAdmin, checkWriteAccess } = User();

  //Local State
  const [hovered, setHovered] = useState(false);
  const [showConfirm, setConfirm] = useState(false);

  const { data, template, onCardClick, onDelete, onClone } = props;
  const { Delete, Copy } = SystemIcons;

  //Local variables
  const haveWriteAccess = checkWriteAccess(TRIGGER_QUERY);
  const showDelete = (isNJAdmin() || isSuperAdmin) && haveWriteAccess;

  const { app_cardContent, sys_topLevel } = template.sys_entityAttributes;
  const { descriptionField, titleField } = app_cardContent
    ? app_cardContent
    : {};
  const cardFields = [
    ...(titleField || []),
    ...(descriptionField ||
      [].filter(
        (ed) => titleField.findIndex((etf) => etf.name == ed.name) === -1
      )),
  ];
  const { sys_entityAttributes, _id } = data;

  let status = get(sys_entityAttributes, "status");

  const getDisplayText = (defn) => {
    let fieldmeta = sys_topLevel.find((ef) => ef.name === defn.name);
    let data = sys_entityAttributes[defn.name];
    return fieldmeta ? textExtractor(data, fieldmeta) : "";
  };

  const getDisplayTitle = (defn) => {
    let fieldmeta = sys_topLevel.find((ef) => ef.name === defn.name);
    return fieldmeta ? fieldmeta.title : "";
  };

  const handleCardClick = () => {
    onCardClick(data);
  };

  const confirmDelete = () => (
    <DisplayDialog
      open={showConfirm}
      title={"Sure to delete ?"}
      message={"This action cannot be undone"}
      onCancel={(e) => {
        e.stopPropagation();
        setConfirm(false);
      }}
      onConfirm={(e) => {
        e.stopPropagation();
        onDelete(_id);
      }}
    />
  );

  return (
    <>
      <DisplayCard
        raised={hovered}
        onMouseOver={() => setHovered(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleCardClick}
        style={{
          cursor: status === "Deleted" ? "not-allowed" : "pointer",
          pointerEvents: status === "Deleted" ? "none" : "auto",
          position: "relative",
        }}
        id={`cp-card-${data._id}`}
        testid={`cp-card-${data._id}`}
      >
        <DisplayGrid
          container
          style={{ margin: "10px", minHeight: "150px", position: "relative" }}
        >
          <DisplayGrid
            container
            alignItems="flex-start"
            justify="flex-start"
            direction="column"
            item
            xs={12}
          >
            {cardFields.map((ed) => (
              <DisplayGrid
                key={data._id + "-" + getDisplayTitle(ed)}
                style={{ marginBottom: "4px" }}
                container
              >
                <DisplayGrid item xs={4}>
                  <DisplayText variant="subtitle2" style={{ padding: "2px" }}>
                    {ed.title ? ed.title : getDisplayTitle(ed)}
                  </DisplayText>
                </DisplayGrid>
                <DisplayGrid item xs={7}>
                  <DisplayText variant="h1" style={{ padding: "2px" }}>
                    {getDisplayText(ed)}
                  </DisplayText>
                </DisplayGrid>
              </DisplayGrid>
            ))}
          </DisplayGrid>
        </DisplayGrid>
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 12,
            bottom: 12,
          }}
        >
          {/* {haveWriteAccess && (
            <div style={{ display: "flex" }}>
              <DisplayIconButton
                systemVariant="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onClone(data);
                }}
              >
                <Copy fontSize="small" />
              </DisplayIconButton>
            </div>
          )} */}
          {/* &nbsp; */}
          {showDelete && (
            <div style={{ display: "flex" }}>
              <DisplayIconButton
                systemVariant="secondary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirm(true);
                }}
              >
                <Delete />
              </DisplayIconButton>
            </div>
          )}
        </div>
      </DisplayCard>

      {confirmDelete()}
    </>
  );
};
