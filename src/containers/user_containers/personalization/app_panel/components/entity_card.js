import React from "react";
import {
  DisplayGrid,
  DisplayAvatar,
  DisplayCard,
  DisplayText,
  DisplayIconButton,
} from "components/display_components";
import {
  getAvatarText,
  getEntityIcon,
} from "utils/services/helper_services/system_methods";
import { SystemIcons } from "utils/icons";
import { UserFactory } from "utils/services/factory_services";

export const EntityCard = (props) => {
  const { systemVariant, removable, onRemoveCallback, ...rest } = props;
  let { appName, moduleName, groupName } = props;
  const { getEntityFriendlyName } = UserFactory();
  const { DeleteTwoTone } = SystemIcons;
  return (
    <DisplayCard
      testid={"preset-" + rest.groupName}
      systemVariant={systemVariant ? systemVariant : "default"}
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        flexDirection: "column",
        position: "relative",
      }}
      elevaton={6}
    >
      <DisplayGrid
        container
        alignItems="center"
        justify="center"
        style={{ height: "100%", padding: "0px 5px 0px 5px" }}
      >
        <DisplayGrid item xs={3} sm={3} md={3} lg={3} xl={2}>
          <DisplayAvatar
            alt={getAvatarText(rest.friendlyName)}
            src={getEntityIcon(rest.groupName)}
          />
        </DisplayGrid>
        <DisplayGrid item xs={9} sm={9} md={9} lg={9} xl={10}>
          <DisplayText>
            {getEntityFriendlyName({
              appname: appName,
              entityname: groupName,
              modulename: moduleName,
            })}
          </DisplayText>
        </DisplayGrid>
      </DisplayGrid>
      {removable && (
        <DisplayIconButton
          systemVariant="primary"
          style={{
            position: "absolute",
            alignSelf: "flex-end",
            padding: "0px",
          }}
          size="small"
          onClick={() => {
            onRemoveCallback(rest);
          }}
        >
          <DeleteTwoTone
            testid={"preset-entityRemove-" + rest.groupName}
            fontSize="small"
          />{" "}
        </DisplayIconButton>
      )}
    </DisplayCard>
  );
};

EntityCard.defaultProps = {
  removable: false,
};
