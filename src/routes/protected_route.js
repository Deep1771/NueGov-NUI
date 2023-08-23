import React, { useState, useEffect, Suspense, useLayoutEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import IdleTimer from "react-idle-timer";
import { AuthFactory, GlobalFactory } from "utils/services/factory_services";
import { DisplayText } from "components/display_components";
import { ContainerWrapper } from "components/wrapper_components";
import { NueAssistNavbar } from "nueassist/containers/navigation_containers";
import { NueGovNavBar } from "nuegov/containers/navigation_container/top/index";
import { SideNav } from "nuegov/containers/navigation_container/side";
import { NavbarSkeleton } from "components/skeleton_components/navigation/navbar";
import { BubbleLoader } from "components/helper_components";
import { useStateValue } from "utils/store/contexts";
import { GlobalComponent } from "../app_layout";

export const ProtectedRoute = ({
  component: Component,
  skeleton: Skeleton,
  includesNav = false,
  includesSideNav = false,
  ...rest
}) => {
  const [authFlag, setAuthFlag] = useState();
  const [isLoading, setLoader] = useState(true);
  const [footer, setFooter] = useState("");
  const { isAuthenticated, logout, getDnsConfigs } = AuthFactory();
  const [{ themeState, configState }] = useStateValue();
  const { isDrawerOpen, fullScreenSize } = configState;
  const { activeTheme } = themeState;
  const { getUserData, getBusinessType } = GlobalFactory();
  const { sys_roleData = {}, sys_agencyData = {} } = getUserData() || {};
  const [sidebarWidth, setSidebarWidth] = useState();
  const isPublicUser = sessionStorage.getItem("public-user");
  let roleLogout = sys_roleData?.sys_entityAttributes?.logoutInMinutes || 0;
  let agencyLogout = sys_agencyData?.sys_entityAttributes?.logoutInMinutes || 0;
  let logoutInMinutes;
  const hour = 3600000;
  const minute = 60000;
  if (roleLogout == 0) {
    if (agencyLogout) {
      logoutInMinutes = agencyLogout * minute;
    } else {
      logoutInMinutes = 1000 * 60 * 30;
    }
  } else {
    logoutInMinutes = roleLogout * minute;
  }
  const Navbar =
    getBusinessType() === "NUEASSIST" ? NueAssistNavbar : NueGovNavBar;

  useEffect(() => {
    isAuthenticated().then((res) => {
      setAuthFlag(res);
      setLoader(false);
    });
    (async () => {
      let response = await getDnsConfigs();
      response = response?.appFooter || "2021 Navjoy All Rights reserved";
      setFooter(response);
    })();
  }, []);

  const onIdle = (e, routerProps) => {
    logout().then((e) => {
      routerProps.history.push("/?redirect=home");
    });
  };

  useLayoutEffect(() => {
    setSidebarWidth(isDrawerOpen ? "240px" : "");
  }, [isDrawerOpen, fullScreenSize]);

  return isLoading ? (
    Skeleton ? (
      <ContainerWrapper>
        {false && <NavbarSkeleton style={{ display: "flex", flex: 2 }} />}
        <Skeleton style={{ display: "flex", flex: 8 }} />
      </ContainerWrapper>
    ) : (
      <BubbleLoader />
    )
  ) : (
    <Route
      {...rest}
      render={(props) =>
        authFlag ? (
          activeTheme && (
            <ContainerWrapper>
              <IdleTimer
                element={document}
                onIdle={(e) => onIdle(e, props)}
                debounce={250}
                timeout={logoutInMinutes}
              />
              {includesNav && <Navbar {...props} />}
              <ContainerWrapper>
                <div
                  style={{
                    flex: 9,
                    display: "flex",
                    height: "calc(100vh - 55px)",
                  }}
                >
                  {includesSideNav && !isPublicUser && (
                    <div
                      style={{
                        width: sidebarWidth,
                        height: "inherit",
                      }}
                      id="sidebarParent"
                    >
                      <SideNav />
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      position: "relative",
                      width: isDrawerOpen
                        ? "80%"
                        : fullScreenSize
                        ? "100%"
                        : "96%",
                      // paddingLeft: isDrawerOpen ? "10px" : "",
                    }}
                    id="globalComponent"
                  >
                    <div id="context-menu"></div>
                    <GlobalComponent />
                    {/*
                    //! DO NOT REMOVE THIS ====> Lingeshwar
                    */}
                    {/* <Suspense fallback={<BubbleLoader />}> */}
                    <Component {...props} />
                    {/* </Suspense> */}
                  </div>
                </div>
                {/* <div style={{ flexShrink: 1, alignSelf: "center", margin: 5 }}>
                  <DisplayText
                    variant="h2"
                    style={{
                      fontFamily: "inherit",
                      fontColor: "#666666",
                      fontSize: "13px",
                    }}
                  >
                    {" "}
                    &copy;{footer}{" "}
                  </DisplayText>
                </div> */}
              </ContainerWrapper>
            </ContainerWrapper>
          )
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: {
                from: props.location,
              },
            }}
          />
        )
      }
    />
  );
};

export default ProtectedRoute;
