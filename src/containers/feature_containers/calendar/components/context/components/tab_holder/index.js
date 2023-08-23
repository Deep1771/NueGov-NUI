import React, { useEffect, useState } from "react";
import TabSection from "containers/feature_containers/calendar/components/tabs";
import { useStateValue } from "utils/store/contexts";
import { getUserCreds } from "containers/feature_containers/calendar/services";
import { isOwner } from "utils/services/api_services/sync_services";

let TabHolder = (props) => {
  const [{ userState }] = useStateValue();
  let { eventInfo, eventMetadata, contextType } = props;
  let [tabs, setTabs] = useState([]);

  let createTabList = async (eventInfo, userInfo) => {
    let is_owner = await isOwner.get({
      eventId: eventInfo.id,
      userId: userInfo.sys_gUid,
    });

    let tabList = [
      {
        runtimeComponent: "Overview",
        title: "Overview",
        type: "OVERVIEW",
        visible: contextType === "Detail" ? false : true,
        properties: { data: eventInfo, metadata: eventMetadata },
      },
      {
        runtimeComponent: "UserList",
        title: "Invitees",
        type: "INVITE",
        visible: !is_owner ? false : true,
        properties: eventInfo,
      },
      {
        runtimeComponent: "UserList",
        title: "Roster",
        type: "PARTICIPANT",
        visible: true,
        properties: eventInfo,
      },
      {
        title: "Documents",
        runtimeComponent: "Document",
        type: "DOCUMENT",
        visible: contextType === "Detail" ? false : true,
        properties: eventInfo,
      },
      {
        title: "Action Items",
        runtimeComponent: "ACTIONITEM",
        type: "ACTIONITEM",
        visible: contextType === "Detail" ? false : true,
        properties: eventInfo,
      },
    ];

    let list = tabList.filter((tab) => {
      return tab.visible === true;
    });

    setTabs(list);
  };

  useEffect(() => {
    let userInfo = getUserCreds(userState);
    createTabList(eventInfo, userInfo);
  }, [eventInfo]);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <TabSection tabs={tabs} />
    </div>
  );
};

export default TabHolder;
