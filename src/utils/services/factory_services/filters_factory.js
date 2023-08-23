import { dot } from "dot-object";
import { useStateValue } from "utils/store/contexts";
import { deleteEntity, entity } from "../api_services/entity_service";
import { get } from "utils/services/helper_services/object_methods";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";

export const FiltersFactory = () => {
  const FILTER_PARAMS = {
    appname: "NJAdmin",
    modulename: "NJ-Personalization",
    entityname: "EntityFilter",
  };
  const DEFAULTS_PARAMS = {
    appname: "NJAdmin",
    modulename: "NJ-Personalization",
    entityname: "UserDefault",
  };
  const [{ filtersState }, dispatch] = useStateValue();
  const { userDefault, roleDefault, agencyDefault } = filtersState;

  const { isNJAdmin, isSuperAdmin, getRefObj } = UserFactory();
  const { getUserDefaults } = GlobalFactory();

  const getDefault = (entityName) => {
    let defaultObj = userDefault.find((eachFilter) => {
      let sys_groupName = get(
        eachFilter,
        "sys_entityAttributes.entityName.sys_groupName"
      );
      return sys_groupName === entityName;
    });

    if (!isNJAdmin() && !defaultObj) {
      defaultObj = !isSuperAdmin
        ? roleDefault.find((eachFilter) => {
            let sys_groupName = get(
              eachFilter,
              "sys_entityAttributes.entityName.sys_groupName"
            );
            return sys_groupName === entityName;
          })
        : undefined;

      if (!defaultObj) {
        defaultObj = agencyDefault.find((eachFilter) => {
          let sys_groupName = get(
            eachFilter,
            "sys_entityAttributes.entityName.sys_groupName"
          );
          return sys_groupName === entityName;
        });
      }
    }
    return defaultObj;
  };

  const getFilterParams = (defaultObj) => {
    let params;
    if (defaultObj) {
      let filterObj = get(defaultObj, "sys_entityAttributes.filters");
      let dotFilters = filterObj?.fieldFilters
        ? dot(filterObj.fieldFilters)
        : {};
      let dotSort = filterObj?.sortBy ? dot(filterObj.sortBy) : false;

      params = { ...dotFilters };
      if (filterObj) {
        if (filterObj.agencies)
          params.sys_agencyId = JSON.stringify(filterObj.agencies);
        if (dotSort) {
          Object.keys(dotSort).map((key) => {
            params.sortby = key;
            params.orderby = dotSort[key];
          });
        }
      }
    }
    return params;
  };

  const fetchPredefinedFilters = (entityName) => {
    const filtersSet = new Set();
    let roleFilters = roleDefault.filter((eachFilter) => {
      let sys_groupName = get(
        eachFilter,
        "sys_entityAttributes.entityName.sys_groupName"
      );
      return sys_groupName === entityName;
    });

    let agencyFilters = agencyDefault.filter((eachFilter) => {
      let sys_groupName = get(
        eachFilter,
        "sys_entityAttributes.entityName.sys_groupName"
      );
      return sys_groupName === entityName;
    });

    let allFilters = [...roleFilters, ...agencyFilters].filter((eachFilter) => {
      const duplicate = filtersSet.has(eachFilter._id);
      filtersSet.add(eachFilter._id);
      return !duplicate;
    });

    return allFilters;
  };

  const setDefaultFilter = (filter, entityName) =>
    dispatch({
      type: "SET_USER_DEFAULT_FILTER",
      payload: { filter, entityName },
    });

  const createFilter = async (entityName, data, defaultFilter) => {
    let entityData = { ...data };
    entityData["sys_entityAttributes"]["userInfo"] = getRefObj();

    let res = await entity.create(FILTER_PARAMS, entityData);
    if (res) {
      let filterObj = res.ops[0];
      delete filterObj["opData"];
      dispatch({
        type: "ADD_ENTITY_FILTER",
        payload: filterObj,
      });
      if (defaultFilter) makeDefaultFilter(entityName, filterObj);
    }
    return res;
  };

  const updateFilter = async (entityName, filterObj, defaultFilter) => {
    let res = await entity.update(
      { ...FILTER_PARAMS, id: filterObj._id },
      filterObj
    );
    if (res.id === filterObj._id) {
      dispatch({
        type: "UPDATE_ENTITY_FILTER",
        payload: { filterObj },
      });
      if (defaultFilter) makeDefaultFilter(entityName, filterObj);
    }
    return res;
  };

  const deleteFilter = async (filterId) => {
    let existInUserDefaults = userDefault.find((ef) => ef._id === filterId);

    if (existInUserDefaults) {
      getUserDefaults().then(async (res) => {
        let obj = { ...res };
        obj["sys_entityAttributes"]["filters"] = userDefault.filter(
          (ef) => ef._id !== filterId
        );
        let updateres = await entity.update(
          { ...DEFAULTS_PARAMS, id: res._id },
          obj
        );
      });
    }
    let res = await deleteEntity.remove({
      ...FILTER_PARAMS,
      id: filterId,
      templateName: "EntityFilter",
    });
    if (res)
      dispatch({
        type: "REMOVE_ENTITY_FILTER",
        payload: { filterId },
      });
    return res;
  };

  const makeDefaultFilter = async (entityName, filterObj) => {
    let { _id, sys_gUid, sys_entityAttributes } = filterObj;
    let existInUserDefaults = userDefault.find((ef) => {
      let sys_groupName = get(
        ef,
        "sys_entityAttributes.entityName.sys_groupName"
      );
      return sys_groupName === entityName;
    });
    getUserDefaults().then(async (res) => {
      let obj = { ...res };
      if (existInUserDefaults) {
        obj["sys_entityAttributes"]["filters"] = userDefault.map(
          (eachFilter) => {
            if (
              get(
                eachFilter,
                "sys_entityAttributes.entityName.sys_groupName"
              ) === entityName
            )
              return {
                id: _id,
                sys_gUid: sys_gUid,
                filterName: sys_entityAttributes.filterName,
                sys_groupName: entityName,
              };
            return eachFilter;
          }
        );
      } else {
        let filters = userDefault.map((eachFilter) => ({
          id: eachFilter._id,
          sys_gUid: eachFilter.sys_gUid,
          filterName: eachFilter.sys_entityAttributes.filterName,
          sys_groupName:
            eachFilter.sys_entityAttributes.entityName.sys_groupName,
        }));
        obj["sys_entityAttributes"]["filters"] = [
          ...filters,
          {
            id: _id,
            sys_gUid: sys_gUid,
            filterName: sys_entityAttributes.filterName,
            sys_groupName: entityName,
          },
        ];
      }
      await entity.update({ ...DEFAULTS_PARAMS, id: res._id }, obj);
      setDefaultFilter(filterObj, entityName);
    });
  };

  const removeDefaultFilter = async (entityName, filterId) => {
    let existInUserDefaults = userDefault.find((ef) => {
      let sys_groupName = get(
        ef,
        "sys_entityAttributes.entityName.sys_groupName"
      );
      return sys_groupName === entityName;
    });
    if (existInUserDefaults) {
      getUserDefaults().then(async (res) => {
        let obj = { ...res };
        obj["sys_entityAttributes"]["filters"] = userDefault.filter(
          (eachFilter) => eachFilter._id !== filterId
        );
        await entity.update({ ...DEFAULTS_PARAMS, id: res._id }, obj);
      });
    }
    dispatch({
      type: "REMOVE_USER_DEFAULT_FILTER",
      payload: { entityName, filterId },
    });
  };

  const services = {
    createFilter,
    deleteFilter,
    fetchPredefinedFilters,
    getDefault,
    getFilterParams,
    makeDefaultFilter,
    removeDefaultFilter,
    updateFilter,
  };
  return { ...services };
};
export default FiltersFactory;
