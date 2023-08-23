import React, { useContext, useState } from "react";
//Library hooks
import { useHistory } from "react-router-dom";
//Custom hooks
import { useStateValue } from "utils/store/contexts";
import { ControlPaneContext } from "../index";
//Services
import { UserFactory } from "utils/services/factory_services";
import {
  textExtractor,
  getAvatarText,
} from "utils/services/helper_services/system_methods";
import { get } from "utils/services/helper_services/object_methods";
//Custom components
import {
  DisplayAvatar,
  DisplayChips,
  DisplayCard,
  DisplayGrid,
  DisplayIconButton,
  DisplayText,
  DisplayDialog,
  DisplayCheckbox,
} from "components/display_components";
import { switchUser } from "../../../user_containers/profile_page/loginas/switchUser";
//Icons
import { SystemIcons } from "utils/icons";

export const CardComponent = (props) => {
  const {
    appname,
    modulename,
    entityname,
    data,
    template,
    onDelete,
    onSelect,
    selectedItems,
  } = props;
  let history = useHistory();
  const [{ userState }] = useStateValue();
  const {
    avatar,
    checkDataAccess,
    getAgencyId,
    isNJAdmin,
    loginButton,
    onCardClick,
    canWrite,
  } = useContext(ControlPaneContext);
  //Factory
  const { getEntityFeatureAccess, checkSubAgencyLevel } = UserFactory();
  //Icons
  const { Delete, Launch, Copy } = SystemIcons;
  //Local variables

  const { app_cardContent, sys_topLevel } = template.sys_entityAttributes;
  const { descriptionField, titleField } = app_cardContent
    ? app_cardContent
    : {};
  const cardFields = [
    ...titleField,
    ...descriptionField.filter(
      (ed) =>
        ed.visible && titleField.findIndex((etf) => etf.name == ed.name) === -1
    ),
  ];
  const { sys_entityAttributes } = data;
  const { userData } = userState;
  const isSelected = !!selectedItems.find((ei) => ei._id === data._id);
  const deleteAccess =
    (isNJAdmin ||
      checkDataAccess({
        appname,
        modulename,
        entityname,
        permissionType: "delete",
        data,
        metadata: template,
      })) &&
    !(getAgencyId == data.sys_agencyId && entityname == "Agency" && !isNJAdmin);

  //sub Agency
  const subAgencyActive =
    entityname == "Agency" &&
    get(data, "sys_entityAttributes.agencyPermission.preset.subAgencyActive");
  const subAgencyInfo = (() => {
    //IIFE
    if (isNJAdmin) {
      let isChild =
        data.sys_entityAttributes.parentAgency &&
        Object.keys(data.sys_entityAttributes.parentAgency).length
          ? true
          : false;
      let chipInfo = {
        title: isChild ? "Child Agency" : "Parent Agency",
        color: isChild ? "primary" : "success",
      };
      return chipInfo;
    } else {
      let subProp = checkSubAgencyLevel(data.sys_agencyId);
      let chipInfo = {
        title: subProp ? subProp.title : "Parent Agency",
        color: subProp ? subProp.color : "primary",
      };
      return chipInfo;
    }
  })();

  //Local State
  const [alert, setAlert] = useState(false);
  const [hovered, setHovered] = useState(false);

  //Constants
  const ALERTS = {
    delete: {
      title: "Sure to delete ?",
      message: "This action cannot be undone",
      onConfirm: () => {
        onDelete && onDelete(data);
      },
    },
    loginAs: {
      title: `Login as - ${get(data, "sys_entityAttributes.username")} ?`,
      message: "You can switch back later using exit icon in navigation bar",
      onConfirm: () => {
        switchUser(history, data, userData);
      },
    },
  };

  //Custom Functions
  const avatarText = () => {
    if (titleField) {
      let text = titleField.map((ef) => getDisplayText(ef)).join(" ");
      if (text.trim()) return getAvatarText(text);
    }
    return "";
  };

  const getDisplayText = (defn) => {
    if (!defn.path) {
      let fieldmeta = sys_topLevel.find((ef) => ef.name === defn.name);
      let data = sys_entityAttributes[defn.name];
      return fieldmeta ? textExtractor(data, fieldmeta) : "";
    } else if (defn.path) {
      return get(data, `sys_entityAttributes.${defn.path}`, "").toString();
    }
  };

  const getDisplayTitle = (defn) => {
    let fieldmeta = sys_topLevel.find((ef) => ef.name === defn.name);
    return fieldmeta ? fieldmeta.title : "";
  };

  const handleCardClick = () => {
    if (selectedItems.length) {
      let add_remove = !selectedItems.find((ei) => ei._id === data._id);
      onSelect(data, add_remove);
    } else {
      let writeAccess =
        checkDataAccess({
          appname,
          modulename,
          entityname,
          permissionType: "write",
          data,
          metadata: template,
        }) &&
        !(
          getAgencyId == data.sys_agencyId &&
          entityname == "Agency" &&
          !isNJAdmin
        );
      onCardClick(data, writeAccess ? "edit" : "read");
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setAlert("delete");
  };

  const handleLoginAs = (e) => {
    e.stopPropagation();
    setAlert("loginAs");
  };

  //Render Methods
  const renderAddOns = () => {
    let { message, title, onConfirm } = alert ? ALERTS[alert] : {};
    return (
      <DisplayDialog
        testid={alert}
        open={alert}
        title={title}
        message={message}
        onCancel={() => setAlert(false)}
        onConfirm={onConfirm}
      />
    );
  };

  return (
    <>
      {renderAddOns()}
      <DisplayCard
        raised={hovered || isSelected}
        onMouseOver={() => setHovered(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleCardClick}
        systemVariant={isSelected ? "primary" : "default"}
        style={{ cursor: "pointer" }}
        id={`cp-card-${data._id}`}
        testid={`cp-card-${data._id}`}
      >
        <DisplayGrid
          container
          style={{ margin: "10px", minHeight: "150px", position: "relative" }}
        >
          {avatar && (
            <DisplayGrid container item xs={3}>
              <DisplayAvatar style={{ width: "60px", height: "60px" }}>
                <DisplayText variant="h2">{avatarText()}</DisplayText>
              </DisplayAvatar>
            </DisplayGrid>
          )}
          <DisplayGrid
            container
            alignItems="flex-start"
            justify="flex-start"
            direction="column"
            item
            xs={avatar ? 9 : 12}
          >
            {cardFields.map((ed) => (
              <DisplayGrid key={data._id + "-" + getDisplayTitle(ed)} container>
                {!avatar && (
                  <DisplayGrid item xs={4}>
                    <DisplayText variant="h1" style={{ padding: "2px" }}>
                      {ed.title ? ed.title : getDisplayTitle(ed)}
                    </DisplayText>
                  </DisplayGrid>
                )}
                <DisplayGrid item xs={7}>
                  <DisplayText variant="h2" style={{ padding: "2px" }}>
                    {getDisplayText(ed)}
                  </DisplayText>
                </DisplayGrid>
              </DisplayGrid>
            ))}
          </DisplayGrid>
          {(selectedItems.length > 0 || hovered) && (
            <div style={{ position: "absolute", right: 0 }}>
              {getEntityFeatureAccess(
                appname,
                modulename,
                entityname,
                "BulkOperations"
              ) && (
                <DisplayCheckbox
                  checked={isSelected}
                  onChange={(checked) => onSelect(data, checked)}
                  onClick={(e) => e.stopPropagation()}
                  hideLabel={true}
                  size="small"
                  systemVariant={!isSelected ? "primary" : "default"}
                />
              )}
            </div>
          )}
          {subAgencyActive && (
            <div
              style={{
                position: "absolute",
                left: 3,
                bottom: 4,
                pointerEvents: "none",
              }}
            >
              <DisplayChips
                variant="outlined"
                size="small"
                label={subAgencyInfo.title}
                systemVariant={subAgencyInfo.color}
              />
            </div>
          )}
          {!selectedItems.length && hovered && (
            <>
              <div style={{ position: "absolute", right: 0, bottom: 0 }}>
                {loginButton && (
                  <DisplayIconButton
                    testid={"loginas"}
                    systemVariant={!isSelected ? "primary" : "default"}
                    size="small"
                    onClick={handleLoginAs}
                  >
                    <Launch />
                  </DisplayIconButton>
                )}
                {canWrite && (
                  <DisplayIconButton
                    testid={"clone"}
                    systemVariant={!isSelected ? "primary" : "default"}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCardClick(data, "clone");
                    }}
                  >
                    <Copy fontSize="small" />
                  </DisplayIconButton>
                )}
                {deleteAccess && (
                  <DisplayIconButton
                    testid={"delete"}
                    systemVariant={!isSelected ? "primary" : "default"}
                    size="small"
                    onClick={handleDelete}
                  >
                    <Delete />
                  </DisplayIconButton>
                )}
              </div>
            </>
          )}
        </DisplayGrid>
      </DisplayCard>
    </>
  );
};
