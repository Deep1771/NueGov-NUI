import React, { useEffect, useState } from "react";
import { get } from "utils/services/helper_services/object_methods";
import { UserFactory } from "utils/services/factory_services";
import { DisplayGrid } from "components/display_components";
import { PaperWrapper } from "components/wrapper_components";
import ThemePanel from "containers/user_containers/personalization/theme_panel";
import AppAccess from "./app_access";
import OpenApi from "./open_api";
import PersonalInfo from "./personal_info";

//! DO NOT REMOVE THIS ==> Lingeshwar
// const ThemePanel = lazy(() =>
//   retry(() => import("containers/user_containers/personalization/theme_panel"))
// );
// const AppAccess = lazy(() => retry(() => import("./app_access")));
// const Dashboard = lazy(() => retry(() => import("./dashboard")));
// const OpenApi = lazy(() => retry(() => import("./open_api")));
// const PersonalInfo = lazy(() => retry(() => import("./personal_info")));
// const ResetPwd = lazy(() => retry(() => import("./reset_pwd")));

const ProfilePage = () => {
  const { getDetails } = UserFactory();
  const [userDetails, setUserDetails] = useState({});

  const Tabs = [
    {
      label: "Summary",
      value: "Summary",
      visible: true,
      render: <PersonalInfo />,
    },
    // {
    //   label: 'Insights',
    //   value: 'Dashboard',
    //   visible: dashboardTab && checkGlobalFeatureAccess('Insights'),
    //   render: <Dashboard entityData={entityData} userInfo={userInfo} />,
    // },
    {
      label: "Access Info",
      value: "AppAccess",
      visible: true,
      render: <AppAccess getDetails={getDetails} />,
    },
    {
      label: "Preferences",
      value: "Preferences",
      visible: true,
      render: (
        <DisplayGrid style={{ padding: "2rem 0rem 0rem 2rem" }}>
          <ThemePanel />
        </DisplayGrid>
      ),
    },
    {
      label: "Open API",
      value: "Openapi",
      visible: get(getDetails, "sys_entityAttributes.openApiUser"),
      render: <OpenApi getDetails={getDetails} />,
    },
  ];

  useEffect(() => {
    getDetails && setUserDetails(getDetails.sys_entityAttributes);
  }, [getDetails]);

  return (
    <PaperWrapper style={{ boxShadow: "none" }}>
      <DisplayGrid
        container
        style={{
          display: "flex",
          flex: 12,
          flexDirection: "row",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        <DisplayGrid
          container
          item
          style={{ display: "flex", width: "70%", height: "100%" }}
        >
          {Tabs[0].render}
        </DisplayGrid>
      </DisplayGrid>
    </PaperWrapper>
  );
};

export default ProfilePage;
