import { loginas } from "utils/services/api_services/auth_service";

export const switchUser = async (history, userInfo, userData, path = null) => {
  const parentUserToken = sessionStorage.getItem("x-access-token");
  let id = userInfo.sys_gUid;
  let loginInfo = await loginas.get({ id });
  try {
    if (loginInfo.success) {
      let parent = {
        token: parentUserToken,
        name:
          userData.sys_entityAttributes.firstName +
          " " +
          userData.sys_entityAttributes.lastName,
        path: path || history.location.pathname + history.location.search,
      };
      sessionStorage.removeItem("preset-id");
      sessionStorage.removeItem("theme-id");
      sessionStorage.setItem("parent", JSON.stringify(parent));
      sessionStorage.setItem("masqMode", true);
      sessionStorage.setItem("x-access-token", loginInfo.token);
      history.push("/app/summary");
      history.go();
      window.location.reload(false);
    } else {
      console.log(loginInfo.error);
    }
  } catch (error) {
    console.log(error);
  }
};
