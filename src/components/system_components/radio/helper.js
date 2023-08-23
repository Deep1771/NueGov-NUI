import { UserFactory } from "utils/services/factory_services";
import { entityCount } from "utils/services/api_services/entity_service";

export const RadioHelper = () => {
  const {
    getPublicRolesCount = 3,
    isNJAdmin,
    getPublicEntityCount = 4,
  } = UserFactory() || {};
  const NJAdmin = isNJAdmin();

  const checkPublicRoleCreation = (
    allowRoleCreation,
    setCount,
    mode,
    data,
    showError
  ) => {
    let publicParams = {
      appname: "NueGov",
      modulename: "Admin",
      entityname: "Role",
      isPublicRole: "Yes",
    };
    if (!NJAdmin) {
      entityCount.get(publicParams).then((res) => {
        if (res.status === "success" && res?.data >= 0) {
          allowRoleCreation.current =
            res?.data >= getPublicRolesCount ? false : true;
          if (data === "Yes" && mode !== "edit" && !allowRoleCreation.current)
            showError("Limit reached");
          let count = getPublicRolesCount - res?.data;
          let diff = mode === "edit" ? 0 : 1;
          let roleCount = count <= 0 ? 0 : count - diff;
          setCount(roleCount);
        }
      });
    }
  };

  const checkFeatureAccess = (apps = []) => {
    let haveAccess = false,
      featureNames = "";
    apps.forEach(({ name = "", modules = [] }) => {
      if (name === "Features")
        modules.forEach(({ name: moduleName = "" }) => {
          if (["Lifecycle", "Imports", "Feature"].includes(moduleName)) {
            haveAccess = true;
            if (featureNames?.length > 0)
              featureNames = featureNames.concat(", " + moduleName);
            else featureNames = featureNames.concat(moduleName);
          }
        });
    });
    return { havePublicRestrictedAccess: haveAccess, featureNames };
  };

  const getEntityCount = (apps) => {
    let entitiesCount = 0;
    apps.forEach(({ name = "", modules = [] }) => {
      if (name === "NueGov")
        modules.forEach(({ entities = [] }) => {
          entitiesCount = entitiesCount + (entities?.length || 0);
        });
    });
    return entitiesCount;
  };

  const checkAccessMode = (data, mode, errorMsg) => {
    let { sys_entityAttributes, sys_groupName = "Role" } = data || {};
    if (sys_groupName === "Role") {
      let {
        isPublicRole,
        publicUniqueId,
        rolePermission: { apps = [] } = {},
      } = sys_entityAttributes || {};
      let publicRoleValue = mode === "clone" ? "No" : "Yes";
      if (mode === "new") {
        let entityCount = getEntityCount(apps);
        let { havePublicRestrictedAccess, featureNames } =
          checkFeatureAccess(apps);
        if (isPublicRole === "No") {
          if (entityCount > getPublicEntityCount) {
            errorMsg.current = `Entity limit exceeded for public roles. Maximum limit is ${getPublicEntityCount}`;
            return false;
          } else if (havePublicRestrictedAccess) {
            errorMsg.current = `To have Public role, please unassign ${featureNames} feature/s`;
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      } else if (mode === "edit" && isPublicRole === "Yes") return false;
      else if (isPublicRole === publicRoleValue && publicUniqueId !== undefined)
        return true;
      else return false;
    } else return true;
  };

  return {
    checkAccessMode,
    checkPublicRoleCreation,
    getPublicRolesCount,
    NJAdmin,
  };
};
