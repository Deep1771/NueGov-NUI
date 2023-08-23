import React, { useState, useEffect } from "react";
import { publicAPI } from "utils/services/api_services/auth_service";
import { useStateValue } from "utils/store/contexts";
import { useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import { get } from "utils/services/helper_services/object_methods";
import { GlobalFactory } from "utils/services/factory_services";
import { CircularProgress } from "@material-ui/core";
import { Banner } from "components/helper_components";

export const PublicAccess = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useStateValue()[1];
  const location = useLocation();
  const { from } = location.state || {};
  const queryParams = queryString.parse(location.search);
  const { redirect } = queryParams;
  const { setUserConfigurations, getInitialNavBarPath, setContextHelperData } =
    GlobalFactory();
  const history = useHistory();

  const getAccessId = () => {
    let path = window.location.pathname || "";
    let accessId = path?.slice(path?.lastIndexOf("/PB") + 1);
    return accessId;
  };

  const checkAnalyticsAccess = (userData) => {
    let role = get(userData, "sys_entityAttributes.role");
    if (role && role.toUpperCase() === "ASSETGOV-ADMIN") return true;
    else
      try {
        return get(userData, "Permissions")
          .apps.find((a) => a.name === "Features")
          .modules.find((m) => m.name === "Insights");
      } catch (e) {
        return false;
      }
  };

  const handlePublicAccess = async () => {
    let accessId = getAccessId();
    await publicAPI
      .create(
        {
          uniqueId: accessId,
        },
        {
          ipAddress: "ipAddress",
          accessId: accessId,
        }
      )
      .then((res) => {
        if (res?.success) {
          setIsLoading(false);
          setTimeout(() => {
            dispatch({
              type: "SET_SUMMARY_LEGEND",
              payload: {},
            });
            dispatch({
              type: "SET_SUMMARY_SUBALAYERS",
              payload: {},
            });
          }, 0);
          sessionStorage.removeItem("currentTab");
          sessionStorage.setItem("x-access-token", res?.token);
          sessionStorage.setItem("public-user", true);
          let data = get(res, "data");
          let businessType = get(
            data,
            "sys_agencyData.sys_entityAttributes.businessTypeInfo.businessType",
            "NUEGOV"
          );
          const contextInfo = get(res, "contextualHelpers");
          setUserConfigurations(data);
          setContextHelperData(contextInfo);

          let redirectTo =
            !redirect && from
              ? `${from.pathname}${from.search}`
              : getInitialNavBarPath({
                  userData: data,
                  businessType,
                  analyticsAccess: checkAnalyticsAccess(data),
                });

          history.push(redirectTo);
          history.go();
        } else {
          setIsLoading(false);
          // res.message && setError(res.message);
        }
      })
      .catch((error) => {
        if (error === "Network Error") {
          setIsLoading(false);
          setError(error);
        }
      });
  };

  useEffect(() => {
    handlePublicAccess();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          height: "inherit",
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={30} />
        &nbsp; Please wait... We are loading...
      </div>
    );
  } else if (error) {
    let msgDiv = (
      <>
        It looks like something went wrong
        <br />
        <br />
        <span style={{ fontSize: "18px" }}>
          Please try again in few minutes
        </span>
        <br />
        <br />
        <span style={{ fontSize: "14px" }}>
          If the issue persists please contact our technical team
        </span>
      </>
    );
    return (
      <Banner
        src="https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/erroricon.svg"
        iconSize="350px"
        msg={msgDiv}
      />
    );
  } else {
    let msgDiv = (
      <>
        <h2>Access Denied</h2>You don't have permission to access this page
        <br />
        <span style={{ fontSize: "14px" }}>
          Contact an administrator to get permission
        </span>
      </>
    );
    return (
      <Banner
        src="https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/pfpaccessdenied.svg"
        iconSize="350px"
        msg={msgDiv}
      />
    );
  }
};
