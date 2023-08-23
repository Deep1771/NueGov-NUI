import { useStateValue } from "../../store/contexts";
import { get } from "../helper_services/object_methods";

export const User = () => {
  const [{ userState }, dispatch] = useStateValue();
  const { userData } = userState;

  const getUserDocument = get(userData, "sys_entityAttributes");

  const getAgencyDetails = get(userData, "sys_agencyData");
  const agencyTimeZone = get(
    userData,
    "sys_agencyData.sys_entityAttributes.timeZoneInfo"
  );
  const getPublicRolesCount = get(
    userData,
    "sys_agencyData.sys_entityAttributes.publicRoleCount"
  );
  const getPublicEntityCount = get(
    userData,
    "sys_agencyData.sys_entityAttributes.publicEntityCount"
  );
  const getAgencyId = get(userData, "sys_agencyId");
  const getAppStructure = get(userData, "appStructure");
  const getCalendarConfig = get(userData, "sys_calendarConfigs");
  const getDetails = userData;
  const getId = get(userData, "_id");
  const getSysGuid = get(userData, "sys_gUid");
  const getLoginName = get(userData, "sys_entityAttributes.username");
  //const getModuleStructure = get(userData,"moduleStructure");
  const getPermissions = get(userData, "Permissions");
  const getSharedAgencies = get(userData, "sharedAgencyAccess");
  const getSubAgencies = get(userData, "subAgencyList");
  const getFamilyDetails = get(userData, "familyDetails");

  const getCommunityConfig = () =>
    get(userData, "assessmentConfig.assessmentConfig", []);

  const getModuleStructure = () => {
    let appStructure = getAppStructure;
    let moduleStructure =
      appStructure?.reduce((moduleArr, eachApp) => {
        let modulesInApp = eachApp?.modules?.map((eachModule) => {
          eachModule.entities = eachModule.entities?.sort((a, b) =>
            a.friendlyName > b.friendlyName ? 1 : -1
          );
          eachModule.entities = eachModule.entities?.map((entity) => ({
            ...entity,
            moduleName: eachModule.name,
            appName: eachApp.name,
          }));
          let moduleObj = {
            ...eachModule,
            appName: eachApp.name,
          };
          moduleArr.push(moduleObj);
        });
        return moduleArr;
      }, []) || [];
    return moduleStructure.sort((a, b) =>
      a.friendlyName > b.friendlyName ? 1 : -1
    );
  };

  const getRoleBasedReports = (groupName) => {
    let roleBasedReports =
      get(userData, "sys_roleData.sys_entityAttributes.roleBasedReports") || [];
    roleBasedReports = roleBasedReports?.filter(
      (each) => each.sys_groupName === groupName
    );
    return roleBasedReports;
  };

  const getAllEntities = (conditions, fromImports = false, appModEnt = []) => {
    let appStructure = fromImports ? appModEnt : getAppStructure;
    let entities =
      appStructure?.reduce((entityArr, eachApp) => {
        let modules = eachApp?.modules?.map((eachModule) => {
          let moduleEntities = eachModule?.entities?.map((eachEntity) => {
            if (conditions.every((ec) => !!get(eachEntity, ec.path))) {
              let { name, friendlyName, groupName } = eachEntity;
              let entityObj = {
                name,
                friendlyName,
                groupName,
                moduleName: eachModule.name,
                appName: eachApp.name,
                unique_key: `${eachApp.name}-${eachModule.name}-${groupName}`,
              };
              entityArr.push(entityObj);
            }
          });
        });
        return entityArr;
      }, []) || [];
    let sortedList = entities.sort((a, b) =>
      a.friendlyName > b.friendlyName ? 1 : -1
    );
    return sortedList.map(({ ...ee }, i) => {
      if (
        sortedList[i]?.friendlyName == sortedList[i + 1]?.friendlyName ||
        sortedList[i]?.friendlyName == sortedList[i - 1]?.friendlyName
      ) {
        ee.friendlyName = `${ee.friendlyName} (${ee.moduleName})`;
      }

      return ee;
    });
  };

  const getEntityInfo = (params) => {
    let { appname, modulename, entityname } = params;
    let appArray = [];
    try {
      if (isNJAdmin()) appArray = getAppStructure;
      else appArray = getPermissions.apps;

      let entityInfo = appArray
        .find((a) => a.name === appname)
        .modules.find((m) => m.name === modulename)
        .entities.find((e) => e.groupName === entityname);
      return entityInfo;
    } catch (e) {
      return false;
    }
  };

  const getEntityFriendlyName = (params) => {
    let entityInfo = getEntityInfo(params);
    if (entityInfo) {
      if (entityInfo?.access?.roleBasedLayout) return entityInfo?.groupName;
      else return getEntityInfo(params).friendlyName;
    } else return params.entityname;
  };

  const getAppModuleFromTemplate = (sys_templateName) => {
    if (isNJAdmin()) return true;
    let { apps } = getPermissions;

    let structures = apps.reduce((Obj, item) => {
      let entityObj;
      let moduleObj = item.modules.find((eachModule) =>
        eachModule.entities.find((eachEntity) => {
          if (eachEntity.name === sys_templateName) {
            entityObj = eachEntity;
            return true;
          } else return false;
        })
      );

      if (moduleObj) {
        let { name: appName, friendlyName: appFriendlyName } = item;
        let { name: moduleName, friendlyName: moduleFriendlyName } = moduleObj;
        let { name, groupName, friendlyName } = entityObj || {};

        Obj["appObj"] = { name: appName, friendlyName: appFriendlyName };
        Obj["moduleObj"] = {
          name: moduleName,
          friendlyName: moduleFriendlyName,
        };
        Obj["entityObj"] = { name, groupName, friendlyName };
      }

      return Obj;
    }, {});
    return structures;
  };

  const getFriendlyName = () => {
    let fname = get(userData, "sys_entityAttributes.firstName");
    let lname = get(userData, "sys_entityAttributes.lastName");
    return `${fname ? fname : ""} ${lname ? lname : ""}`;
  };

  const getBannerLogo = () => {
    if (isNJAdmin()) return false;
    else return get(getAgencyDetails, "sys_entityAttributes.BannerLogo");
  };

  const getLogoName = () =>
    isNJAdmin()
      ? "NUEGOV"
      : get(getAgencyDetails, "sys_entityAttributes.Name").toUpperCase();
  //Shared And Sub Agency
  const getSharedAgencyData = (agencyId) => {
    let allAgencies = get(userData, "sharedAgencyAccess");
    if (agencyId) return allAgencies.find((ea) => ea.id === agencyId);
    else return allAgencies;
  };

  const checkSharedAccess = (agencyId, entityName, access) => {
    if (isNJAdmin()) return true;
    try {
      let permission = get(getSharedAgencyData(agencyId), "permission");
      return (
        permission &&
        permission.find((ee) => ee.groupName === entityName).access[access]
      );
    } catch (e) {
      return false;
    }
  };

  const getAgencyTimeZone = () => {
    const indianTimeZone = {
      value: "Asia/Kolkata",
      label: "(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi",
      offset: 5.5,
      abbrev: "IST",
      altName: "India Standard Time",
    };
    return agencyTimeZone ? agencyTimeZone : indianTimeZone;
  };

  const checkSubAgencySharedAccess = (agencyId, entityName, access) => {
    if (isNJAdmin()) return true;
    try {
    } catch (e) {
      return false;
    }
  };

  const getSubAgencyData = (agencyId) => {
    let allAgencies = [...getParents(), ...getChildrens(), ...getSiblings()];
    if (agencyId) return allAgencies.find((ea) => ea._id === agencyId);
    else return allAgencies;
  };
  const getChildrens = () => get(userData, "subAgencyList.child") || [];
  const getParents = () => get(userData, "subAgencyList.parent") || [];
  const getSiblings = () => get(userData, "subAgencyList.sibling") || [];
  const isSharedAgency = (agencyId) =>
    !!(!isNJAdmin() && getSharedAgencyData(agencyId));
  const isChild = (agencyId) =>
    !!getChildrens().find((ea) => ea._id === agencyId);
  const isParent = (agencyId) =>
    !!getParents().find((ea) => ea._id === agencyId);
  const isSibling = (agencyId) =>
    !!getSiblings().find((ea) => ea._id === agencyId);
  const isSubAgency = (agencyId) =>
    !!(!isNJAdmin() && getSubAgencyData(agencyId));
  //Shared And Sub Agency

  const getAgencyProp = (agencyId, prop) => {
    if (isNJAdmin()) return false;
    else if (agencyId && agencyId != getAgencyId) {
      if (isSharedAgency(agencyId))
        return get(getSharedAgencyData(agencyId), prop);
      else if (isSubAgency(agencyId))
        return get(getSubAgencyData(agencyId), `sys_entityAttributes.${prop}`);
    } else return get(getAgencyDetails, `sys_entityAttributes.${prop}`);

    return false;
  };

  const getAgencyLogo = (agencyId = null) =>
    getAgencyProp(agencyId, "LogoName");
  const getAgencyName = (agencyId = null) => getAgencyProp(agencyId, "Name");

  const getMapDefaults = () => {
    let agencyCoords = get(
      getAgencyDetails,
      `sys_entityAttributes.zoomLatLong.coordinates`,
      null
    );
    let zoomLevel = get(getAgencyDetails, "sys_entityAttributes.zoomLevel", 10);
    let coords;
    if (agencyCoords) {
      coords = { lat: agencyCoords[1], lng: agencyCoords[0] };
    } else {
      coords = { lat: 39.742043, lng: -104.991531 };
    }

    return { zoomLevel, coords };
  };

  const getRefObj = () => ({
    id: getId,
    sys_gUid: getSysGuid,
    username: getLoginName,
    firstName: get(userData, "sys_entityAttributes.firstName"),
    lastName: get(userData, "sys_entityAttributes.lastName"),
  });

  const getAgencyRef = (objFlag) =>
    !isNJAdmin()
      ? objFlag
        ? {
            id: getAgencyDetails._id,
            sys_gUid: getAgencyDetails.sys_gUid,
            Name: getAgencyDetails.sys_entityAttributes.Name,
          }
        : {
            _id: getAgencyDetails._id,
            sys_gUid: getAgencyDetails.sys_gUid,
            Name: getAgencyDetails.sys_entityAttributes.Name,
          }
      : {};

  const checkDeleteAccess = ({ appname, modulename, entityname }) => {
    return checkAccess(appname, modulename, entityname, "delete");
  };

  const checkWriteAccess = ({ appname, modulename, entityname }) => {
    return checkAccess(appname, modulename, entityname, "write");
  };

  const checkCreateAccess = ({ appname, modulename, entityname }) => {
    if (isNJAdmin()) return true;
    else
      return !checkAccess(
        appname,
        modulename,
        entityname,
        "disableCreateOption"
      );
  };

  const checkReadAccess = ({ appname, modulename, entityname }) => {
    return checkAccess(appname, modulename, entityname, "read");
  };

  const checkAccess = (appname, modulename, entityname, permissionType) => {
    if (isNJAdmin()) return true;
    else {
      try {
        return getPermissions.apps
          .find((a) => a.name === appname)
          .modules.find((m) => m.name === modulename)
          .entities.find((e) => e.groupName === entityname).access[
          permissionType
        ];
      } catch (e) {
        return false;
      }
    }
  };

  const checkFieldAccess = ({
    appname,
    modulename,
    entityname,
    fieldname,
    componentname = undefined,
    permissionType,
  }) => {
    if (isNJAdmin()) return true;
    else {
      try {
        let level = componentname ? "componentArray" : "topSectionArray";
        let entity = getPermissions.apps
          .find((a) => a.name === appname)
          .modules.find((m) => m.name === modulename)
          .entities.find((e) => e.groupName === entityname);
        if (entity.access[permissionType]) {
          if (level === "topSectionArray") {
            let secFields = entity[level].reduce((arr, eachSection) => {
              arr = [...arr, ...(eachSection?.fields || [])];

              return arr;
            }, []);
            return (
              secFields.find((eachField) => eachField.name === fieldname)
                .access[permissionType] == true
            );
          } else {
            return (
              !!entity[level]
                .find((eachComponent) => eachComponent.name === componentname)
                ?.fields?.find((eachField) => eachField.name === fieldname)
                .access[permissionType] || false
            );
          }
        } else return false;
      } catch (e) {
        return false;
      }
    }
  };

  const checkFieldReadAccess = (params) => {
    return checkFieldAccess({ ...params, permissionType: "read" });
  };

  const checkFieldWriteAccess = (params) => {
    return checkFieldAccess({ ...params, permissionType: "write" });
  };

  const checkSubAgencyAccess = (
    appname,
    modulename,
    entityname,
    permissionType,
    subType
  ) => {
    if (isNJAdmin()) return true;
    else {
      try {
        return getPermissions.apps
          .find((a) => a.name === appname)
          .modules.find((m) => m.name === modulename)
          .entities.find((e) => e.groupName === entityname).shared[subType][
          permissionType
        ];
      } catch (e) {
        return false;
      }
    }
  };

  const checkDataAccess = (info) => {
    try {
      let { appname, modulename, entityname, permissionType, data, metadata } =
        info;
      let agencyId = data.sys_agencyId;
      let disableOn = get(metadata, "sys_entityAttributes.disableOn");

      if (isNJAdmin()) {
        let dataLocked = get(data, "sys_entityAttributes.locked");
        if (dataLocked) return false;
        else return true;
      }
      if (disableOn && permissionType != "delete") {
        let disableFlags = disableOn.reduce((flagArr, ef) => {
          let { path, disable } = ef;
          let currentStatus = get(data, path);
          if (currentStatus && disable.includes(currentStatus))
            flagArr.push(true);

          return flagArr;
        }, []);

        if (disableFlags.some((ef) => ef === true)) return false;
      }

      if (!agencyId || getAgencyId === agencyId)
        return checkAccess(appname, modulename, entityname, permissionType);
      else {
        if (checkAccess(appname, modulename, entityname, permissionType)) {
          if (isSharedAgency(agencyId))
            return checkSharedAccess(agencyId, entityname, permissionType);
          else {
            if (isSubAgency(agencyId)) {
              if (isParent(agencyId)) {
                return checkSubAgencyAccess(
                  appname,
                  modulename,
                  entityname,
                  permissionType,
                  "parent"
                );
              } else if (isChild(agencyId)) {
                return checkSubAgencyAccess(
                  appname,
                  modulename,
                  entityname,
                  permissionType,
                  "child"
                );
              } else if (isSibling(agencyId)) {
                return checkSubAgencyAccess(
                  appname,
                  modulename,
                  entityname,
                  permissionType,
                  "sibling"
                );
              } else {
                return false;
              }
            }
            return false;
          }
        } else return false;
      }
    } catch (e) {
      return false;
    }
  };

  const checkSubAgencyLevel = (agencyId) => {
    if (isSubAgency(agencyId)) {
      if (isParent(agencyId)) {
        return { title: "Parent Agency", color: "primary" };
      } else if (isChild(agencyId)) {
        return { title: "Child Agency", color: "success" };
      } else if (isSibling(agencyId)) {
        if (agencyId == getAgencyId)
          return { title: "Current Agency", color: "primary" };
        else return { title: "Sibling Agency", color: "secondary" };
      } else {
        return false;
      }
    }
  };

  const checkModuleAccess = (appName, moduleName) => {
    if (isNJAdmin()) return true;
    else {
      try {
        return !!getPermissions.apps
          .find((a) => a.name === appName)
          .modules.find((m) => m.name === moduleName);
      } catch (e) {
        return false;
      }
    }
  };

  const checkGlobalFeatureAccess = (featureName) =>
    checkModuleAccess("Features", featureName);

  const checkQMapAccess = (label) => {
    const isSuperAdmin = userData?.sys_entityAttributes?.superAdmin;
    if (isSuperAdmin) {
      return true;
    } else {
      if (
        !["YES", "yes", true, "Yes", "true", undefined, null].includes(
          userData.sys_entityAttributes.qmap
        ) &&
        [
          "Prescriber Medication",
          "OTC Medication",
          "Medication",
          "Medication Orders",
          "Medication Administration",
        ].includes(label)
      ) {
        return false;
      }
      return true;
    }
  };

  const getEntityFeatureAccess = (appName, moduleName, groupName, featName) => {
    if (isNJAdmin()) return true;
    else {
      try {
        return Object.keys(
          get(userData, "Permissions.apps")
            .find((a) => a.name == appName)
            .modules.find((m) => m.name == moduleName)
            .entities.find((e) => e.groupName == groupName).featureAccess
        ).some((f) => f.toUpperCase() == featName.toUpperCase());
      } catch (e) {
        return false;
      }
    }
  };

  const getModuleInfo = (moduleName) => {
    let info = get(userData, "moduleStructure." + moduleName);
    return info ? info : null;
  };

  const isNJAdmin = () => {
    let role = get(userData, "sys_entityAttributes.role");
    return role && role.toUpperCase() === "ASSETGOV-ADMIN";
  };

  //User can lock the data
  const isRootUser = () => {
    let rootUser = get(userData, "sys_entityAttributes.rootUser");
    if (isNJAdmin() && rootUser) {
      return true;
    } else {
      return false;
    }
  };
  const isSuperAdmin = get(userData, "sys_entityAttributes.superAdmin");

  const isApprover = (appName, moduleName, groupName) => {
    if (isNJAdmin()) return false;
    else {
      try {
        return get(userData, "Permissions.apps")
          .find((a) => a.name == appName)
          .modules.find((m) => m.name == moduleName)
          .entities.find((e) => e.groupName == groupName).approver
          ? true
          : false;
      } catch (e) {
        return false;
      }
    }
  };

  const isRoleBasedLayout = (appName, moduleName, groupName) =>
    !!checkAccess(appName, moduleName, groupName, "roleBasedLayout");

  const getRole = () => {
    let aliasName = get(userData, "sys_entityAttributes.aliasName");
    let roleName = get(userData, "sys_entityAttributes.roleName");
    if (isNJAdmin()) return get(userData, "sys_entityAttributes.role");
    else if (isSuperAdmin) return aliasName ? aliasName : "AGENCY ADMIN";
    else if (roleName) return roleName.name;
  };

  const getFamilyIds = () => {
    let familyDetails = get(userData, "sys_entityAttributes.familyDetails");
    let familyIds = Array.isArray(familyDetails)
      ? familyDetails.map((e) => e.sys_gUid)
      : get(userData, "familyDetails");
    return familyIds;
  };

  const getUserInfo = () => ({
    id: getId,
    sys_gUid: getSysGuid,
    username: getLoginName,
    firstName: getRefObj().firstName,
    lastName: getRefObj().lastName,
    phoneNumber: get(userData, "sys_entityAttributes.phoneNumber"),
    department: get(userData, "sys_entityAttributes.department"),
    agencyuser: get(userData, "sys_entityAttributes.agencyuser.Name"),
    roleName: getRole(),
    email: get(userData, "sys_entityAttributes.email"),
    Name: get(userData, "sys_entityAttributes.agencyuser.Name"),
    title: get(userData, "sys_entityAttributes.title"),
    signature: get(userData, "sys_entityAttributes.signature"),
    familyDetails: getFamilyIds(),
    reportsTo: get(userData, "sys_entityAttributes.reportsTo"),
    profilePicture: get(userData, "sys_entityAttributes.profilePicture"),
  });

  const getRoleRefObj = () => get(userData, "sys_entityAttributes.roleName");

  const checkDefaultExists = get(userData, "userDefaults");
  const checkDefaultPresetExists = get(userData, "userDefaults.preset");

  const setUserSysEntityAttributes = (payload) => {
    dispatch({
      type: "UPDATE_USER_SYS_ENTITY_ATTRIBUTES",
      payload: payload,
    });
  };

  const services = {
    checkAccess,
    checkDataAccess,
    checkDeleteAccess,
    checkDefaultExists,
    checkDefaultPresetExists,
    checkGlobalFeatureAccess,
    checkModuleAccess,
    checkReadAccess,
    checkSharedAccess,
    checkSubAgencySharedAccess,
    checkSubAgencyLevel,
    checkWriteAccess,
    checkCreateAccess,
    checkQMapAccess,
    getAgencyLogo,
    getAgencyName,
    getAgencyDetails,
    getAgencyId,
    getAgencyTimeZone,
    getAgencyRef,
    getAllEntities,
    getAppStructure,
    getAppModuleFromTemplate,
    getBannerLogo,
    getCalendarConfig,
    getCommunityConfig,
    getDetails,
    getEntityFeatureAccess,
    getEntityFriendlyName,
    getFamilyDetails,
    getFriendlyName,
    getId,
    getLoginName,
    getLogoName,
    getMapDefaults,
    getModuleInfo,
    getModuleStructure,
    getPermissions,
    getPublicEntityCount,
    getPublicRolesCount,
    getRole,
    getRoleBasedReports,
    getRoleRefObj,
    getRefObj,
    getSharedAgencies,
    getSubAgencies,
    getSysGuid,
    getUserDocument,
    getUserInfo,
    isApprover,
    isChild,
    isNJAdmin,
    isRootUser,
    isParent,
    isRoleBasedLayout,
    isSibling,
    isSharedAgency,
    isSubAgency,
    isSuperAdmin,
    setUserSysEntityAttributes,
    checkFieldAccess,
    checkFieldReadAccess,
    checkFieldWriteAccess,
  };

  return { ...services };
};

export default User;
