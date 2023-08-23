import { user, landing } from "../api_services/auth_service";
import { useStateValue } from "../../store/contexts";
import { GlobalFactory } from "utils/services/factory_services";
import { USER_DEFAULT_QUERY } from "containers/user_containers/personalization/service";
import { entity } from "utils/services/api_services/entity_service";
import { get } from "lodash";
export const Auth = () => {
  const [{ userState, moduleState }, dispatch] = useStateValue();
  const { userData } = userState;
  const { userDefault } = moduleState;
  const { setUserConfigurations, setUserData, setContextHelperData } =
    GlobalFactory();
  const token = sessionStorage.getItem("x-access-token");

  const isAuthenticated = async () => {
    if (!token) return false;
    else if (userData) return true;
    else
      try {
        let userInfo = await user.get({ src: "web" });
        setUserConfigurations(userInfo.data);
        let contextInfo = get(userInfo, "contextualHelpers");
        setContextHelperData(contextInfo);
        return true;
      } catch (e) {
        return false;
      }
  };

  const updateEntityDocumnet = async () => {
    let entityParams = JSON.parse(sessionStorage.getItem("editedEntityInfo"));
    let { data } = entityParams;
    if (data && Object.keys(data).length) {
      delete data.sys_entityAttributes.isOpen;
      delete entityParams.data;
      await entity.update(entityParams, data);
    }
  };

  const logout = async () => {
    if (sessionStorage.getItem("editedEntityInfo")) {
      await updateEntityDocumnet();
    }
    clearSessionStorage();
    clearStore();
  };

  const getDnsConfigs = async () => {
    let url = window.location.href;
    return await landing.query({ url });
  };

  const clearSessionStorage = () => {
    // sessionStorage.removeItem("x-access-token");
    // sessionStorage.removeItem("preset-id");
    // sessionStorage.removeItem("theme-id");
    // sessionStorage.removeItem("currentTab");
    // // localStorage.removeItem("board-selector");
    // sessionStorage.removeItem("parent");
    // sessionStorage.removeItem("masqMode");
    // sessionStorage.removeItem("summaryTabLink");
    sessionStorage.clear();
  };

  const clearStore = () => {
    dispatch({ type: "CLEAR_USER_DATA" });
    dispatch({ type: "CLEAR_DASHBOARD" });
    dispatch({ type: "CLEAR_PRESET" });
    dispatch({ type: "CLEAR_THEME" });
    dispatch({ type: "CLEAR_CONFIG" });
    dispatch({ type: "CLEAR_FILTERS" });
    dispatch({ type: "CLEAR_IMPORT_STATE" });
    dispatch({ type: "CLEAR_MODULE_STATE" });
  };

  const services = {
    token,
    isAuthenticated,
    setUserData,
    getDnsConfigs,
    logout,
  };
  return { ...services };
};

export default Auth;
