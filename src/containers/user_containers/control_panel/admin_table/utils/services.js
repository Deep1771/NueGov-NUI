import { useContext } from "react";
import {
  entity,
  entityCount,
  childEntity,
  deleteEntity,
} from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { UserFactory } from "utils/services/factory_services";
import { SummaryGridContext } from "..";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import queryString from "query-string";

const GridServices = () => {
  const history = useHistory();
  const queryParams = queryString.parse(useLocation().search);
  const { page = 1, ...restParams } = queryParams;
  const { globalsearch, ...advSearchParams } = restParams;
  const { sortby, orderby, sys_agencyId, ...filterParams } = advSearchParams;
  const [{ params, metadata, ITEM_PER_PAGE }, dispatch] =
    useContext(SummaryGridContext);
  const { checkDataAccess } = UserFactory();
  let { appname, modulename, entityname, filters, screenType } = params;

  const queryToUrl = (params) =>
    Object.keys(params)
      .map((key) => key + "=" + params[key])
      .join("&");

  const getRoute = (
    moduleName = modulename,
    entityName = entityname,
    value,
    appName = appname,
    mode = "read"
  ) => {
    if (typeof value === "object") {
      let writeAccess = checkDataAccess({
        appname: appName,
        modulename: moduleName,
        entityname: entityName,
        permissionType: "write",
        data: value,
        metadata: metadata,
      });
      let r_w = writeAccess ? "edit" : "read";
      history.push(
        `/app/admin_panel/${entityName}/${r_w}/${value._id}?${queryToUrl(
          queryParams
        )}`
      );
    } else if (typeof value === "string")
      history.push(
        `/app/admin_panel/${entityName}/${mode}/${value}?${queryToUrl(
          queryParams
        )}`
      );
    else history.push(`/app/admin_panel/${entityname}/new`);
  };

  const getData = async (searchValue = null, page, newFilters = {}) => {
    let entityParams;

    entityParams = {
      appname,
      modulename,
      entityname,
      ...filters,
      ...newFilters,
      skip: page ? (page - 1) * ITEM_PER_PAGE : 0,
      limit: ITEM_PER_PAGE,
      globalsearch: searchValue,
    };

    try {
      let [data, dataCount] = await Promise.all([
        entity.get(entityParams),
        entityCount.get(entityParams),
      ]);
      if (dataCount || data) {
        dispatch({
          type: "INIT_CONTAINER",
          payload: {
            data,
            dataCount: dataCount.data,
            loader: false,
          },
        });
      }
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  const onDelete = async (id) => {
    await deleteEntity
      .remove({
        appname,
        modulename,
        entityname,
        id,
        templateName: metadata.sys_entityAttributes.sys_templateName,
      })
      .then(() => {
        setTimeout(() => {
          getData();
        }, 1000);
      });
  };

  const getMetadata = async (
    appname,
    modulename,
    entityname,
    readRouteQuery = true
  ) => {
    let { PAGELAYOUT } = queryParams;
    try {
      let entityParams = {
        appname,
        modulename,
        entityname,
        ...restParams,
        skip: page ? (page - 1) * ITEM_PER_PAGE : 0,
        limit: ITEM_PER_PAGE,
        globalsearch: globalsearch ? globalsearch : null,
      };

      let metaParams = {
        appname,
        modulename,
        groupname: entityname,
      };
      if (PAGELAYOUT && readRouteQuery)
        metaParams = {
          ...metaParams,
          templatename: PAGELAYOUT,
        };
      let [metadata, data, dataCount] = await Promise.all([
        entityTemplate.get(metaParams),
        entity.get(entityParams),
        entityCount.get(entityParams),
      ]);
      if (metadata) {
        dispatch({
          type: "INIT_CONTAINER",
          payload: {
            metadata,
            data,
            dataCount: dataCount.data,
            params: {
              appname,
              modulename,
              entityname,
              filters,
            },
            loader: false,
          },
        });
      }
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  return { getMetadata, getData, getRoute, onDelete };
};

export default GridServices;
