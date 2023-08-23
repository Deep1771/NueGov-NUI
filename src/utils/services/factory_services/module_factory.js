import { useStateValue } from "../../store/contexts";
import { presetTemplate } from "utils/services/api_services/template_service";
import { UserFactory } from "utils/services/factory_services";
export const Module = () => {
  const [{ moduleState }, dispatch] = useStateValue();
  const { isNJAdmin } = UserFactory();

  const setActiveEntity = (payload) => {
    dispatch({
      type: "SET_ACTIVE_ENTITY",
      payload: payload,
    });
  };

  const setActiveModule = (payload) => {
    dispatch({
      type: "SET_ACTIVE_MODULE",
      payload: payload,
    });
  };

  const setActiveModuleEntities = async (payload, activeEntity = {}) => {
    const {
      appName: appname,
      moduleName: modulename,
      groupName: entityname,
    } = activeEntity;
    let entities = payload?.entities?.map((e) => ({
      name: e.name,
      groupName: e.groupName,
      moduleName: e.moduleName,
      appName: e.appName,
      friendlyName: e.friendlyName,
    }));

    dispatch({
      type: "SET_ACTIVE_MODULE_ENTITIES",
      payload: entities,
    });

    try {
      let fetchMapLayers = await presetTemplate.create(
        { appname, modulename, entityname },
        {
          selectedEntities: entities,
        }
      );

      dispatch({
        type: "SET_ACTIVE_MODULE_MAPLAYERS",
        payload: fetchMapLayers,
      });
    } catch (e) {
      console.error(`error while fetching map layers`);
    }
  };

  const setAllModules = (payload) => {
    const isAdmin = isNJAdmin();
    if (!isAdmin && payload?.length) {
      const adminIndex = payload.findIndex((module) => module.name === "Admin");
      if (adminIndex !== -1) {
        const adminModule = payload.splice(adminIndex, 1)[0];
        payload.push(adminModule);
      }
    }
    dispatch({
      type: "SET_ALL_MODULES",
      payload: payload,
    });
  };

  const services = {
    setActiveEntity,
    setActiveModule,
    setActiveModuleEntities,
    setAllModules,
  };

  return { ...services };
};

export default Module;
