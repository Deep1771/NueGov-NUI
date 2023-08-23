import { useStateValue } from "utils/store/contexts";
import { get } from "utils/services/helper_services/object_methods";
import { useHistory } from "react-router-dom";
import { entity } from "utils/services/api_services/entity_service";
import { UserFactory } from "utils/services/factory_services";
import { queryToUrl } from "utils/services/helper_services/system_methods";
import { dot } from "dot-object";

const GlobalFactory = () => {
  const [{ userState, contextualHelperState }, dispatch] = useStateValue();
  const history = useHistory();
  const { userData } = userState;
  const {
    checkReadAccess,
    getAgencyId,
    getAgencyDetails,
    getLoginName,
    getUserInfo,
    isNJAdmin,
  } = UserFactory();

  const getBusinessType = () => {
    let defaultType = "NUEGOV";
    if (isNJAdmin()) return defaultType;
    else {
      let businessType = get(
        getAgencyDetails,
        "sys_entityAttributes.businessTypeInfo.businessType",
        defaultType
      );
      return businessType.toUpperCase();
    }
  };

  const getContextualHelp = async (screenName) => {
    let queryObj = {
      appname: "NueGov",
      modulename: "ContextualHelp",
      entityname: "ContextualHelp",
      screenName: screenName,
      limit: 5,
      skip: 0,
    };
    let contextualHelp = await entity.get(queryObj);
    return contextualHelp[0];
  };

  const getUserDefaults = async () => {
    let queryObj = {
      appname: "NJAdmin",
      modulename: "NJ-Personalization",
      entityname: "UserDefault",
      "userName.username": getLoginName,
      limit: 5,
      skip: 0,
    };
    let userDefault = await entity.get(queryObj);
    return userDefault[0];
  };

  const getDefaultTab = (navbarConfig) => {
    let defaultTab = navbarConfig?.reduce((cur, acc) => {
      if (acc?.entityInfo?.entityname.toUpperCase() === "INSIGHTS")
        cur.splice(0, navbarConfig?.length, acc);
      else if (acc?.defaultTab) {
        cur.splice(0, navbarConfig?.length, acc);
      } else if (acc?.subMenus?.length) {
        let subDefaultTab = acc?.subMenus?.find((sub) => sub?.defaultTab);
        if (subDefaultTab) cur.splice(0, navbarConfig?.length, acc);
      }
      return cur;
    }, []);
    return defaultTab;
  };

  const updateFilterValues = (filter, uData) => {
    let USER_DATA = uData ? uData : getUserInfo();
    let updatedFilter = {};
    Object.entries(filter).map((e) => {
      if (
        !["object", "boolean"].includes(typeof e[1]) &&
        e[1]?.charAt(0) === "$"
      ) {
        let parsedString = e[1].substring(1);
        let path = parsedString.substring(parsedString.indexOf(".") + 1);
        let result = get(USER_DATA, path);
        updatedFilter[e[0]] = result && result.toString();
      } else {
        updatedFilter[e[0]] = e[1];
      }
    });
    return updatedFilter;
  };

  const getInitialNavBarPath = (props) => {
    let { userData, businessType, analyticsAccess } = props;
    let navbarConfig = get(userData, "businessConfig.navbarConfig", []);
    let defaultPath = "/app/dashboard";
    if (businessType?.toUpperCase() === "NUEASSIST") {
      let defaultTab = getDefaultTab(navbarConfig);

      defaultTab = defaultTab?.forEach((tab) => {
        let appname,
          modulename,
          entityname,
          filter = tab?.filter && dot(tab?.filter);
        filter = filter && updateFilterValues(filter, userData);
        if (tab?.subMenus?.length) {
          let subDefaultTab = tab?.subMenus?.find((sub) => sub?.defaultTab);
          if (subDefaultTab) {
            appname = subDefaultTab?.entityInfo?.appname;
            modulename = subDefaultTab?.entityInfo?.modulename;
            entityname = subDefaultTab?.entityInfo?.entityname;
            filter = subDefaultTab?.filter && dot(subDefaultTab?.filter);
          } else
            defaultPath = analyticsAccess
              ? "/app/dashboard"
              : "/nueassist/summary";
        } else {
          appname = tab?.entityInfo?.appname;
          modulename = tab?.entityInfo?.modulename;
          entityname = tab?.entityInfo?.entityname;
        }

        if (entityname?.toUpperCase() === "INSIGHTS") {
          defaultPath = analyticsAccess
            ? "/app/dashboard"
            : "/nueassist/summary";
          return;
        }

        if (tab?.to) defaultPath = tab?.to;
        else {
          defaultPath = `/nueassist/summary/${appname}/${modulename}/${entityname}`;
          defaultPath = filter
            ? `${defaultPath}?${queryToUrl(filter)}`
            : defaultPath;
        }
        return tab;
      });
    } else if (businessType?.toUpperCase() === "NUEGOV")
      defaultPath = "/app/summary";

    return defaultPath;
  };

  const getAllThemesAndStore = async () => {
    let queryObj = {
      appname: "NjAdmin",
      modulename: "NJ-Personalization",
      entityname: "Theme",
      limit: 50,
      skip: 0,
    };
    let availableThemes = await entity.query(queryObj);
    if (availableThemes.length) setAvailableThemes(availableThemes);
  };

  const getActive = async (entityname, id) => {
    let query = {
      appname: "NJAdmin",
      modulename: "NJ-Personalization",
      entityname,
      id,
    };
    let active = await entity.get(query);
    return active;
  };

  const getAllData = async (params) => {
    let userQueryObj = {
      appname: "NJAdmin",
      modulename: "NJ-Personalization",
      ...params,
      "userInfo.username": getLoginName,
      skip: 0,
      limit: 100,
    };
    let userLevelData = await entity.get(userQueryObj);
    return userLevelData || [];
  };

  const getNavbarConfig = () => {
    let navbarConfig = get(userData, "businessConfig.navbarConfig");
    return navbarConfig;
  };

  const getOthersRoleInfo = async (templateData) => {
    let roleInfo = {};
    let templateName = get(
      templateData,
      "sys_entityAttributes.sys_friendlyName",
      false
    );
    let groupName = get(
      templateData,
      "sys_entityAttributes.sys_templateGroupName.sys_groupName",
      false
    );
    if (templateName && templateName !== groupName) {
      await entity
        .get({
          appname: "NueGov",
          modulename: "Admin",
          entityname: "Role",
          skip: 0,
          limit: 30,
          name: templateName,
          "agencyuser.id": getAgencyId,
        })
        .then((res) => {
          if (res?.length) {
            roleInfo = {
              id: get(res[0], "_id").toString(),
              sys_gUid: get(res[0], "sys_gUid"),
              name: get(res[0], "sys_entityAttributes.name"),
            };
          }
        })
        .catch((e) => {
          console.log("Error during " + `${templateName}` + " access");
        });
    }
    return roleInfo;
  };

  const setUserConfigurations = (data) => {
    setUserData(data);
    let theme = get(data, "userDefaults.theme");
    setDefaultActiveTheme(theme, get(data, "defaultTheme"));
    let filters = get(data, "userDefaults.filters");
    setDefaultFilters(filters);
    setSystemTypes();
    setPreconfiguredBoards(get(data, "userDefaults.boards"));

    let businessType = get(
      data,
      "sys_agencyData.sys_entityAttributes.businessTypeInfo.businessType"
    );

    //Used in mapcontainer to fetch appname and module name based on template
    //from permission tree... As it is hard to access data from user reducer(global state)
    // in non react componetn and non react hooks.

    //*Adding public user to session storage"
    let isPublicUser = get(data, "isPublicRole");
    if (isPublicUser) {
      sessionStorage.setItem("public-user", true);
    }

    if (businessType?.toUpperCase() === "NUEASSIST") {
      let permissionTree = get(data, "Permissions");
      sessionStorage.setItem("permissionTree", JSON.stringify(permissionTree));
    }
  };

  const setDefaultFilters = (filters) => {
    dispatch({
      type: "SET_FILTERS_DEFAULTS",
      payload: filters,
    });
  };

  const setSystemTypes = async () => {
    try {
      let sys_types = await entity.get({
        appname: "Features",
        modulename: "Insights",
        entityname: "SystemTypes",
      });
      dispatch({
        type: "SET_SYSTEM_TYPES",
        payload: sys_types,
      });
    } catch (e) {
      if (e?.status === 401) {
        sessionStorage.removeItem("x-access-token");
        history.push("/");
      }
      console.log("error in fetching systemTypes", e);
    }
  };

  const setContextHelperData = (payload) => {
    dispatch({
      type: "SET_CONTEXTUAL_DATA",
      payload: payload,
    });
  };

  const setUserData = (payload) => {
    dispatch({
      type: "SET_USER_DATA",
      payload: payload,
    });
  };
  const getUserData = () => {
    return userData;
  };

  const getContextualHelperData = (screenName) => {
    const contextualData = contextualHelperState?.contextualHelperData?.find(
      (data) => data?.sys_entityAttributes?.screenName === screenName
    );
    if (contextualData && Object.keys(contextualData)?.length > 0) {
      return contextualData?.sys_entityAttributes?.contextualHelp;
    }
    return contextualData;
  };

  // const getUserData = () => {
  //   return userData;
  // };

  const toggleDrawer = (payload) => {
    dispatch({
      type: "SET_DRAWER",
      payload: payload,
    });
  };

  const toggleSidebarStatus = (payload) => {
    dispatch({
      type: "SET_SIDEBAR_CLICK_STATUS",
      payload: payload,
    });
  };

  const setSnackBar = (snackBarObj) => {
    dispatch({
      type: "SET_SNACK_BAR",
      payload: { open: true, ...snackBarObj },
    });
  };

  const closeSnackBar = () => {
    dispatch({
      type: "SET_SNACK_BAR",
      payload: {
        open: false,
        message: "",
      },
    });
  };

  const setBackDrop = (msg) => {
    dispatch({
      type: "SET_BACK_DROP",
      payload: { open: true, message: msg },
    });
  };

  const closeBackDrop = () => {
    dispatch({
      type: "SET_BACK_DROP",
      payload: {
        open: false,
        message: "",
      },
    });
  };

  const setUserDefaults = (payload, defaultTheme) => {
    setDefaultActivePreset(get(payload, "preset"));
    if (payload) setDefaultActiveTheme(get(payload, "theme"), defaultTheme);
    else setActiveTheme(defaultTheme);
  };

  const setDefaultActivePreset = async (preset) => {
    setDefaultPreset(preset);
    let activePresetId = sessionStorage.getItem("preset-id");
    if (activePresetId) {
      let activePreset = await getActive("Preset", activePresetId);
      setActivePreset(activePreset);
    } else {
      if (preset) sessionStorage.setItem("preset-id", get(preset, "_id"));
      setActivePreset(preset);
    }
  };

  const setDefaultActiveTheme = async (theme, defaultTheme) => {
    setDefaultTheme(theme);
    let activeThemeId = sessionStorage.getItem("theme-id");
    if (activeThemeId) {
      let activeTheme = await getActive("Theme", activeThemeId);
      setActiveTheme(activeTheme);
    } else {
      let activeTheme = theme ? theme : defaultTheme;
      if (activeTheme)
        sessionStorage.setItem("theme-id", get(activeTheme, "_id"));
      setActiveTheme(activeTheme);
    }
  };

  const setDefaultTheme = (payload) => {
    dispatch({
      type: "SET_DEFAULT_THEME",
      payload: payload,
    });
  };

  const setActiveTheme = (payload) => {
    dispatch({
      type: "SET_ACTIVE_THEME",
      payload: payload,
    });
  };

  const setDefaultPreset = (payload) => {
    dispatch({
      type: "SET_DEFAULT_PRESET",
      payload: payload,
    });
  };

  const setActivePreset = (payload) => {
    if (payload) {
      let tempObj = { ...payload };
      let entityList = get(tempObj, "sys_entityAttributes.selectedEntities");
      if (entityList && entityList.length)
        tempObj["sys_entityAttributes"]["selectedEntities"] = entityList.filter(
          ({ appName, moduleName, groupName }) =>
            checkReadAccess({
              appname: appName,
              modulename: moduleName,
              entityname: groupName,
            })
        );
      dispatch({
        type: "SET_ACTIVE_PRESET",
        payload: tempObj,
      });
      dispatch({
        type: "SET_SUMMARY_LEGEND",
        payload: {},
      });
      dispatch({
        type: "SET_SUMMARY_SUBLAYERS",
        payload: {},
      });
    } else {
      dispatch({
        type: "SET_ACTIVE_PRESET",
        payload: payload,
      });
      dispatch({
        type: "SET_SUMMARY_SUBLAYERS",
        payload: {},
      });
    }
  };

  const setAvailableThemes = (payload) => {
    dispatch({
      type: "SET_AVAILABLE_THEMES",
      payload: payload,
    });
  };

  const setTriggerSave = (val) => {
    dispatch({
      type: "SET_TRIGGER_STATE",
      payload: val,
    });
  };

  const setPreconfiguredBoards = (payload) => {
    dispatch({
      type: "SET_PRECONFIGURED_BOARDS",
      payload: payload,
    });
  };

  const setUserDefaultBoard = (payload) => {
    dispatch({
      type: "SET_USERDEFAULT_BOARD",
      payload: payload,
    });
  };

  const handleSidebar = (sidebarWidth) => {
    let publicUser = sessionStorage.getItem("public-user");
    if (!publicUser) {
      const sidebarElement = document.getElementById("sidebar");
      const sidebarParentElement = document.getElementById("sidebarParent");
      sidebarElement.style.width = sidebarWidth;
      sidebarParentElement.style.width = sidebarWidth;
    }
  };

  const services = {
    getAllData,
    getBusinessType,
    getContextualHelp,
    getContextualHelperData,
    getDefaultTab,
    getInitialNavBarPath,
    getUserDefaults,
    setActivePreset,
    getNavbarConfig,
    getOthersRoleInfo,
    handleSidebar,
    setActiveTheme,
    setAvailableThemes,
    setBackDrop,
    closeBackDrop,
    setContextHelperData,
    setDefaultActivePreset,
    setDefaultActiveTheme,
    setDefaultPreset,
    setDefaultTheme,
    setPreconfiguredBoards,
    setUserDefaultBoard,
    setUserConfigurations,
    setUserData,
    setUserDefaults,
    getAllThemesAndStore,
    toggleDrawer,
    toggleSidebarStatus,
    setSnackBar,
    closeSnackBar,
    setTriggerSave,
    updateFilterValues,
    getUserData,
  };
  return { ...services };
};

export default GlobalFactory;
