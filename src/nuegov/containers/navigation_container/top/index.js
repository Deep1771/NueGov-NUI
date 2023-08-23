import React, { useEffect, useState, lazy, Suspense, useMemo } from "react";
import { useParams } from "react-router";
import {
  Fade,
  Menu,
  MenuItem,
  Slide,
  Toolbar,
  Badge,
  Popper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  DisplayAvatar,
  DisplayButton,
  DisplayCard,
  DisplayDrawer,
  DisplayBadge,
  DisplayDivider,
  DisplayGrid,
  DisplayIcon,
  DisplayIconButton,
  DisplayText,
  LinkButton,
} from "components/display_components";
import {
  AuthFactory,
  GlobalFactory,
  UserFactory,
  ThemeFactory,
  ModuleFactory,
} from "utils/services/factory_services";
import { useStateValue } from "utils/store/contexts";
import { AppBarWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import { utilities } from "containers/feature_containers/calendar/helper";
import { getUserCreds } from "containers/feature_containers/calendar/services";
import { syncNotification } from "utils/services/api_services/sync_services";
import {
  getAvatarText,
  getEntityIcon,
} from "utils/services/helper_services/system_methods";
// import DrawerPage from "../components/drawer_page";
import { TRIGGER_QUERY } from "utils/constants/query";
// import { retry } from "utils/services/helper_services/loader";
// const DrawerPage = lazy(() => retry(() => import("./components/drawer_page")));

import { entity } from "utils/services/api_services/entity_service";
import { eventTracker } from "utils/services/api_services/event_services";
import { InAppNotification } from "./inappAlert";
import { ToolTipWrapper } from "components/wrapper_components";
import _ from "lodash";

import { signout } from "utils/services/api_services/auth_service";

const useStyles = makeStyles({
  regular: {
    minHeight: "55px",
  },
  selectedNavButton: {
    bottom: "1px",
    borderWidth: "0 0 1px",
    borderStyle: "solid",
    fontWeight: "bold",
  },
});

export const NueGovNavBar = (props) => {
  const { mode, ...rest } = useParams();
  const { history } = props;
  const { toggleDrawer, toggleSidebarStatus, getContextualHelperData } =
    GlobalFactory();
  const [{ userState, configState }] = useStateValue();
  const { isDrawerOpen, sidebarClickStatus } = configState;
  const { logout } = AuthFactory();
  const {
    checkModuleAccess,
    checkGlobalFeatureAccess,
    checkReadAccess,
    getFriendlyName,
    getBannerLogo,
    getLogoName,
    getAllEntities,
    getAppStructure,
    getUserDocument,
    isNJAdmin,
  } = UserFactory();
  let { inAppNotification, username } = getUserDocument;
  const { setActiveModule, setAllModules, setActiveEntity } = ModuleFactory();
  const { getVariantForComponent } = ThemeFactory();
  const {
    AppsIcon,
    ArrowDropDown,
    CustomMenu,
    ExitToApp,
    Notification,
    Tune,
    NotificationsActive,
  } = SystemIcons;
  const [parentInfo, setParentInfo] = useState();
  const [userEl, setUserEl] = useState(null);
  const [featureEl, setFeatureEl] = useState(null);
  const [hoveredEl, setHoveredEl] = useState(null);
  const isPublicUser = sessionStorage.getItem("public-user");
  const getPathName = (path) =>
    path.split("/")[isPublicUser ? (path.split("/")?.length <= 3 ? 2 : 5) : 2];
  const selectedPath = getPathName(history.location.pathname);
  const [eventNotifications, setNotificationCount] = useState(0);
  const classes = useStyles(getVariantForComponent("", "primary"));
  const entities = isPublicUser
    ? getAllEntities([], isNJAdmin(), getAppStructure)
    : [];

  const [isOpen, setIsOpen] = useState(false);
  const [inappanchorEl, setInAppAnchorEl] = useState(null);
  const [inappData, setInappData] = useState(null);
  const helperData = getContextualHelperData("GLOBAL_SCREEN");

  const {
    inlineInstruction: {
      actionItems = "",
      calendar = "",
      imports = "",
      gridIcon = "",
      inAppNotifications = "",
      triggers = "",
      profilePage = "",
    } = {},
  } = helperData || {};

  // Json

  const getPublicEntities = () => {
    if (entities?.length) {
      let publicEntities = entities.map((e) => {
        let path = `/app/summary/${e?.appName}/${e?.moduleName}/${e?.groupName}`;
        return {
          title: e?.friendlyName,
          to: path,
          visibleCondition: true,
          id: e?.unique_key,
          entityInfo: e,
        };
      });
      return publicEntities;
    }
  };

  let bucketList = [
    {
      title: "Features",
      items: [
        {
          title: "Import",
          to: "/app/import",
          color: "primary",
          icon: "Imports",
          visibleCondition: checkGlobalFeatureAccess("Imports"),
          message: imports,
        },
        {
          title: "Trigger",
          to: "/app/trigger",
          color: "primary",
          icon: "triggerfeatureicon",
          visibleCondition: checkReadAccess(TRIGGER_QUERY),
          message: triggers,
        },
      ],
    },
    {
      title: "Calendar",
      items: [
        {
          title: "Calendar",
          to: "/app/calendar",
          color: "primary",
          icon: "Calendar",
          visibleCondition: checkGlobalFeatureAccess("Calendar"),
          badge: eventNotifications > 0,
          message: calendar,
        },
        {
          title: "Action Items",
          to: "/app/actionitem",
          color: "primary",
          icon: "ActionItem",
          visibleCondition: checkReadAccess({
            appname: "Features",
            modulename: "Calendar",
            entityname: "ActionItem",
          }),
          message: actionItems,
        },
      ],
    },
  ];

  let buttonList = [
    {
      handler: (event) => {
        handleFeatureClick(event);
      },
      Icon: AppsIcon,
      visibleCondition: bucketList.some(({ items }) => {
        return items.some((ei) => ei.visibleCondition);
      }),
      id: "nav-bucket-icon",
      badge: eventNotifications > 0,
      title: gridIcon,
    },
    {
      handler: (event) => {
        handleExitOutClick(event);
      },
      Icon: ExitToApp,
      visibleCondition: parentInfo,
      id: "nav-login-exit",
    },
  ];

  let navLinks = [
    {
      title: "Dashboard",
      to: "/app/dashboard",
      visibleCondition: checkGlobalFeatureAccess("Insights"),
      id: "nav-insights",
    },
    {
      title: "Summary",
      to: "/app/summary",
      visibleCondition: isPublicUser ? false : true,
      id: "summary",
    },
    {
      title: "Documents",
      to: "/app/file_manager",
      visibleCondition: checkGlobalFeatureAccess("Files"),
      id: "nav-docs",
    },
    // ...(checkModuleAccess("NueGov", "Admin")
    //   ? [
    //       {
    //         title: "Admin",
    //         to: "/app/admin_panel",
    //         visibleCondition: true,
    //         id: "nav-admin",
    //       },
    //     ]
    //   : []),
    ...(isPublicUser ? getPublicEntities() : []),
  ];

  const handleFeatureClick = (event) => {
    setFeatureEl(event.currentTarget);
  };

  // Setters
  const handleUserClick = (event) => {
    setUserEl(event.currentTarget);
  };

  const handleClose = () => {
    setUserEl(null);
    setFeatureEl(null);
  };

  // Custom Functions
  const handleExitOutClick = (event) => {
    if (parentInfo) {
      sessionStorage.setItem("masqMode", false);
      sessionStorage.removeItem("masqMode");
      sessionStorage.removeItem("parent");
      sessionStorage.removeItem("preset-id");
      sessionStorage.removeItem("theme-id");
      // localStorage.removeItem("board-selector");
      sessionStorage.setItem("x-access-token", parentInfo["token"]);
      history.push(parentInfo["path"]);
      history.go();
    }
  };

  // useEffects
  useEffect(() => {
    let parent = JSON.parse(sessionStorage.getItem("parent"));
    if (parent) {
      setParentInfo(parent);
    }
    let dateRange = utilities.getMonthDateRange("", true);
    let userInfo = getUserCreds(userState);
    if (
      checkReadAccess({
        appname: "Features",
        modulename: "Calendar",
        entityname: "Event",
      })
    ) {
      syncNotification
        .query({
          appname: "Features",
          modulename: "Calendar",
          entityname: "Event",
          limit: 100,
          skip: 0,
          dateRange: JSON.stringify(dateRange),
          ids: JSON.stringify(userInfo.ids),
        })
        .then((r) => {
          setNotificationCount(r.length);
        });
    }
    if (isPublicUser) {
      let initialEntity = entities?.find((e) => e?.groupName === selectedPath);
      if (_.isEmpty(initialEntity)) {
        initialEntity = entities?.find((e) => e);
      }
      setActiveEntity(initialEntity);
      setActiveModule({
        appName: initialEntity?.appName,
        entities: [initialEntity],
        name: initialEntity?.moduleName,
        friendlyName: initialEntity?.moduleName,
      });
    }
  }, []);

  const renderMenu = () => (
    <DisplayCard
      elevation={0}
      style={{
        display: "flex",
        minHeight: "120px",
        maxHeight: "480px",
        overflow: "auto",
        width: "260px",
        padding: "0px 8px",
      }}
    >
      <DisplayGrid container style={{ padding: "0px !impoortant" }}>
        {bucketList.map(({ items, title }, index) => {
          return (
            <React.Fragment key={`bucket-${title}`}>
              <DisplayGrid container>
                {items.map(
                  ({ to, icon, title, visibleCondition, badge, message }, i) =>
                    visibleCondition && (
                      <DisplayGrid
                        onMouseOver={() => setHoveredEl(title)}
                        onMouseEnter={() => setHoveredEl(title)}
                        onMouseLeave={() => setHoveredEl(null)}
                        key={`bucket-item-${title}`}
                        item
                        xs={4}
                        lg={4}
                        sm={4}
                        md={4}
                        xl={4}
                        style={{
                          backgroundColor:
                            title == hoveredEl ? "#f2f2f2" : "white",
                          minHeight: "80px",
                          height: "80px",
                          maxHeight: "80px",
                          width: "120px",
                          maxWidth: "120px",
                          minWidth: "120px",
                          display: "flex",
                          padding: "4px",
                          alignItems: "center",
                          borderRadius: "20px",
                        }}
                      >
                        <DisplayCard
                          elevation={0}
                          style={{
                            display: "flex",
                            flex: 1,
                            flexDirection: "column",
                            backgroundColor: "inherit",
                            alignItems: "center",
                          }}
                        >
                          <LinkButton to={to} color="primary">
                            <Badge
                              color="secondary"
                              overlap="circle"
                              invisible={!badge}
                              badgeContent={eventNotifications}
                            >
                              <ToolTipWrapper title={message}>
                                <div
                                  style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                  }}
                                  onClick={() => {
                                    handleClose();
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flex: 9,
                                      flexDirection: "column",
                                    }}
                                  >
                                    <DisplayAvatar
                                      style={{
                                        width: "2rem",
                                        height: "2rem",
                                      }}
                                      alt={getAvatarText(icon)}
                                      src={getEntityIcon(icon)}
                                    />
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flex: 1,
                                      alignItems: "center",
                                      alignSelf: "center",
                                      padding: "5px",
                                    }}
                                  >
                                    <DisplayText
                                      style={{
                                        color: "black",
                                        display: "flex",
                                        flex: 2,
                                        alignSelf: "center",
                                      }}
                                    >
                                      {title}
                                    </DisplayText>
                                  </div>
                                </div>
                              </ToolTipWrapper>
                            </Badge>
                          </LinkButton>
                        </DisplayCard>
                      </DisplayGrid>
                    )
                )}
              </DisplayGrid>
              {items.some((ei) => ei.visibleCondition) &&
                bucketList[index + 1]?.items.some(
                  (ei) => ei.visibleCondition
                ) && (
                  <DisplayDivider
                    style={{ margin: "8px 0px", width: "100%" }}
                  />
                )}
            </React.Fragment>
          );
        })}
      </DisplayGrid>
    </DisplayCard>
  );

  const rendarInappNotification = async (e) => {
    setIsOpen(!isOpen);
    setInAppAnchorEl(e.currentTarget);
  };

  const handleLogout = async () => {
    let res = await signout.get({});
    return res;
  };

  const handleEventLogs = async (title) => {
    if (["Dashboard", "Documents"].includes(title)) {
      await eventTracker
        .captureEvent("", {
          eventName: "Dashboards",
          subEventName: "Dashboards",
          eventType: "",
          username: username,
        })
        .then((result) => {
          // console.log("reuslt is -> ", result);
          console.log("navbar link captured in db");
        })
        .catch((err) => {
          // console.log("error is -> ", err);
          console.log("error while capturing in db");
        });
    }
  };

  return (
    <Fade in={true} direction="down" timeout={850}>
      <div>
        <AppBarWrapper
          elevation={0}
          testid="navBar"
          position="static"
          style={{ height: "55px" }}
        >
          <Toolbar
            style={{ padding: "0px 8px 0px 8px", overflow: "auto" }}
            className={`${classes.regular} hide_scroll`}
          >
            <div
              style={{
                flexShrink: 2,
                display: "flex",
                flexDirection: "row",
              }}
            >
              {/* {![
                "trigger",
                "dashboard",
                "file_manager",
                "admin_panel",
                "profile_page",
                "calendar",
                "import",
              ].includes(selectedPath) && (
                <DisplayIconButton
                  onClick={() => {
                    toggleDrawer(!isDrawerOpen);
                    toggleSidebarStatus(!sidebarClickStatus);
                  }}
                >
                  <CustomMenu />
                </DisplayIconButton>
              )} */}
              {getBannerLogo() ? (
                <img height="50px" src={getBannerLogo()} alt="No Logo found" />
              ) : (
                <DisplayText
                  variant="h5"
                  style={{
                    fontFamily: "inherit",
                    fontWeight: 600,
                    alignSelf: "center",
                  }}
                  noWrap
                >
                  {getLogoName()}
                </DisplayText>
              )}
            </div>
            <div
              style={{
                display: "flex",
                paddingLeft: "20px",
                flex: 10,
                alignItems: "center",
              }}
            >
              {navLinks.map(
                (
                  { to, title, icon, badge, visibleCondition, id, entityInfo },
                  i
                ) => {
                  const isActive = getPathName(to) === selectedPath;
                  return (
                    visibleCondition && (
                      <LinkButton
                        id={id}
                        testid={id}
                        to={!isActive ? to : null}
                        key={i}
                        color="inherit"
                        onClick={() => {
                          if (isPublicUser) {
                            setActiveModule({
                              appName: entityInfo?.appName,
                              entities: [entityInfo],
                              name: entityInfo?.moduleName,
                              friendlyName: entityInfo?.moduleName,
                            });
                            setActiveEntity(entityInfo);
                          }
                          handleEventLogs(title);
                        }}
                      >
                        {icon && (
                          <DisplayIcon name={icon} systemVariant="default" />
                        )}{" "}
                        &nbsp;
                        <DisplayText
                          style={{
                            fontFamily: "inherit",
                            fontSize: "0.9rem",
                          }}
                          className={isActive ? classes.selectedNavButton : ""}
                          noWrap
                        >
                          {title}
                        </DisplayText>
                      </LinkButton>
                    )
                  );
                }
              )}
            </div>
            <div
              style={{
                display: "flex",
                flex: 8,
                flexDirection: "row-reverse",
                alignItems: "center",
              }}
            >
              {!isPublicUser && (
                <ToolTipWrapper title={profilePage}>
                  <div>
                    <DisplayButton
                      variant="contained"
                      onClick={(event) => {
                        handleUserClick(event);
                      }}
                      style={{
                        boxShadow: "none",
                        textTransform: "none",
                        fontWeight: "400",
                        padding: "3px",
                      }}
                      endIcon={<ArrowDropDown />}
                      id="nav-my-info"
                      testid="nav-my-info"
                    >
                      Hi, {getFriendlyName()}
                    </DisplayButton>
                  </div>
                </ToolTipWrapper>
              )}
              <DisplayText style={{ opacity: 0.3 }}>&nbsp;|&nbsp;</DisplayText>
              {buttonList.map(
                ({ Icon, handler, visibleCondition, id, badge, title }, i) =>
                  visibleCondition && (
                    <React.Fragment key={id}>
                      &nbsp;&nbsp;&nbsp;
                      <DisplayIconButton
                        edge="end"
                        variant="contained"
                        key={id}
                        id={id}
                        testid={id}
                        onClick={handler}
                      >
                        <ToolTipWrapper title={title}>
                          <Badge
                            color="secondary"
                            overlap="circle"
                            variant="dot"
                            systemVariant="default"
                            invisible={!badge}
                          >
                            <Icon />
                          </Badge>
                        </ToolTipWrapper>
                      </DisplayIconButton>
                    </React.Fragment>
                  )
              )}
              <div className="inapp_notification">
                {inAppNotification && (
                  <DisplayIconButton
                    onClick={(e) => {
                      rendarInappNotification(e);
                      setInappData(null);
                    }}
                  >
                    <ToolTipWrapper title={inAppNotifications}>
                      <Badge
                        color="secondary"
                        overlap="circle"
                        badgeContent={inappData}
                        invisible={!inappData > 0}
                      >
                        <NotificationsActive />
                      </Badge>
                    </ToolTipWrapper>
                  </DisplayIconButton>
                )}
                <InAppNotification
                  isOpen={isOpen}
                  inappanchorEl={inappanchorEl}
                  setIsOpen={setIsOpen}
                  data={inappData}
                  setInappData={setInappData}
                />
              </div>
            </div>
          </Toolbar>
          {!isPublicUser && (
            <Menu
              anchorEl={userEl}
              keepMounted
              getContentAnchorEl={null}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              open={Boolean(userEl)}
              onClose={handleClose}
              TransitionComponent={Fade}
              id="nav-menu"
              testid="nav-menu"
            >
              {/* {checkModuleAccess("NueGov", "Admin") && (
              <MenuItem
                testid="control-panel"
                id="control-panel"
                onClick={(e) => {
                  history.push("/app/admin_panel");
                  handleClose(e);
                }}
              >
                Admin Panel
              </MenuItem>
            )} */}
              <MenuItem
                testid="profile-page"
                id="profile-page"
                onClick={(e) => {
                  history.push("/app/profile_page");
                  handleClose(e);
                }}
              >
                Profile
              </MenuItem>
              <MenuItem
                testid="log-out"
                id="log-out"
                onClick={(e) => {
                  logout().then(() => {
                    handleClose(e);
                    history.push("/signin");
                  });
                }}
              >
                Log out
              </MenuItem>
            </Menu>
          )}
          <Menu
            id="simple-menu1"
            anchorEl={featureEl}
            keepMounted
            getContentAnchorEl={null}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            open={Boolean(featureEl)}
            onClose={handleClose}
          >
            {renderMenu()}
          </Menu>
        </AppBarWrapper>
        {/* {isDrawerOpen ? (
          <DisplayDrawer
            variant="persistent"
            anchor="right"
            width={300}
            style={{ zIndex: 5000 }}
            elevation={20}
            open={isDrawerOpen}
          >
            <DrawerPage />
          </DisplayDrawer>
        ) : null} */}
      </div>
    </Fade>
  );
};
