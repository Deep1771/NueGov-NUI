import { useContext, useRef } from "react";
import {
  entity,
  entityCount,
  childEntity,
} from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { SummaryGridContext } from "..";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { get } from "lodash";
import { isDefined } from "utils/services/helper_services/object_methods";
import { deleteEntity } from "utils/services/api_services/entity_service";
import { useStateValue } from "utils/store/contexts";

const GridServices = () => {
  const history = useHistory();
  const qParams = queryString.parse(useLocation().search);
  const queryParams = useRef();
  queryParams.current = qParams || {};
  const { page = 1, ...restParams } = queryParams.current || {};
  const { globalsearch, ...advSearchParams } = restParams;
  const { sortby, orderby, sys_agencyId, ...filterParams } = advSearchParams;
  const [{ params, metadata, ITEM_PER_PAGE, pageNumber }, dispatch] =
    useContext(SummaryGridContext);
  // const [summaryScreenProps, summaryScreenDispatch] = useContext(SummaryScreenContext);
  const [{ mapState }, mainDispatch] = useStateValue();

  const { checkDataAccess, getUserInfo, getAgencyDetails } = UserFactory();
  const { summaryData, type, isGeoFenceApplied, mapParams, previousEntity } =
    mapState || {};
  let { appname, modulename, entityname, filters, screenType } = params;
  const { getUserData } = GlobalFactory();
  const { sys_roleData = {}, sys_agencyData = {} } = getUserData() || {};
  const sys_userData = getUserData() || {};
  const geoFenceInfo = useRef();
  geoFenceInfo.current = {
    isGeoFenceApplied: isGeoFenceApplied,
    mapParams: mapParams,
    geoFencedMapData: summaryData,
  };
  let ARCHIVE = sessionStorage.getItem("archiveMode");
  let userFilters = {};

  let { showSampleData } = getAgencyDetails?.sys_entityAttributes || {};

  const getUserSpecificFilters = (metadata) => {
    try {
      let { roleName, sys_gUid } = getUserInfo();
      let { userSpecificFilters } = metadata.sys_entityAttributes || null;
      if (userSpecificFilters) {
        let { enableForRoles, value, fieldName } = userSpecificFilters;
        if (enableForRoles && enableForRoles.length) {
          let loggedInUserRoleMatches = enableForRoles.findIndex(
            (e) => e.toLowerCase() === roleName.toLowerCase()
          );
          if (loggedInUserRoleMatches > -1) {
            return {
              [fieldName]: value.toUpperCase() === "PRIVATE" ? sys_gUid : value,
            };
          } else {
            return false;
          }
        } else {
          return {
            [fieldName]: value.toUpperCase() === "PRIVATE" ? sys_gUid : value,
          };
        }
      } else {
        return null;
      }
    } catch (e) {
      console.log("error in getUserSpecificFilters", e);
      return {};
    }
  };

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
      let r_w = writeAccess ? mode : "read";
      history.push(
        `/app/summary/${appName}/${moduleName}/${entityName}/${r_w}/${
          value._id
        }?${queryToUrl(queryParams.current)}`
      );
    } else if (typeof value === "string")
      history.push(
        `/app/summary/${appName}/${moduleName}/${entityName}/${mode}/${value}?${queryToUrl(
          queryParams.current
        )}`
      );
    else
      history.push(`/app/summary/${appname}/${modulename}/${entityname}/new`);
  };

  const getData = async (
    searchValue = null,
    page,
    newFilters = {},
    screenType,
    relatedEntityInfo = {},
    selectedRows = []
  ) => {
    let userFilters = getUserSpecificFilters(metadata);

    let mapFilter = {};

    if (geoFenceInfo.current.isGeoFenceApplied) {
      mapFilter = {
        geoFenceSearch: geoFenceInfo?.current?.mapParams?.geoFenceSearch,
      };
    }
    let { parentEntityParams, childEntityParams, filterPath } =
      relatedEntityInfo;
    let isRelation =
      screenType === "RELATION" &&
      relatedEntityInfo &&
      Object.keys(relatedEntityInfo).length
        ? true
        : false;
    let entityParams;
    let relatedEntityfilters;
    if (isRelation) {
      parentEntityParams = { ...parentEntityParams, ...newFilters };
      entityParams = {
        appname,
        modulename,
        entityname,
        ...newFilters,
        globalsearch: searchValue,
        limit: ITEM_PER_PAGE,
        ...userFilters,
        skip: page ? (page - 1) * ITEM_PER_PAGE : 0,
        archiveMode: ARCHIVE,
        ...(showSampleData && { sampleData: true }),
      };
    } else {
      entityParams = {
        appname,
        modulename,
        entityname,
        ...filters,
        ...userFilters,
        ...mapFilter,
        ...newFilters,
        ...(showSampleData && { sampleData: true }),
        skip: page ? (page - 1) * ITEM_PER_PAGE : 0,
        limit: ITEM_PER_PAGE,
        globalsearch: searchValue,
        archiveMode: ARCHIVE,
      };
    }

    if (!Array.isArray(searchValue) && typeof searchValue === "object") {
      delete entityParams["globalsearch"];
      entityParams = { ...entityParams, ...searchValue };
    }

    try {
      let [data, dataCount] = await Promise.all([
        isRelation
          ? childEntity.get({
              ...parentEntityParams,
              id: childEntityParams.id,
              globalsearch: searchValue,
              limit: ITEM_PER_PAGE,
              skip: page ? (page - 1) * ITEM_PER_PAGE : 0,
              userFilters,
            })
          : entity.get(entityParams),
        isRelation
          ? entityCount.get({
              ...entityParams,
              [filterPath]: childEntityParams.id,
            })
          : entityCount.get(entityParams),
      ]);

      if (dataCount || data) {
        setTimeout(() => {
          dispatch({
            type: "INIT_CONTAINER",
            payload: {
              data,
              dataCount: dataCount.data,
              loader: false,
              isLoading: false,
              selectedRows:
                selectedRows && selectedRows.length ? selectedRows : [],
            },
          });
        }, 1000);
      }
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  const onDelete = async (id, page, relatedEntityInfo) => {
    await deleteEntity
      .remove({
        appname,
        modulename,
        entityname,
        id,
        templateName: metadata.sys_entityAttributes.sys_templateName,
      })
      .then((res) => {
        page
          ? page === "RELATION"
            ? setTimeout(() => {
                getData(null, pageNumber, {}, page, relatedEntityInfo);
              }, 1000)
            : setTimeout(() => {
                getData(null, 1, {}, page);
              }, 1000)
          : setTimeout(() => {
              getData();
            }, 1000);
      })
      .catch((e) => {
        console.log(e);
        setTimeout(() => {
          getData();
        }, 1000);
      });
  };

  const getMetadata = async (
    appname,
    modulename,
    entityname,
    readRouteQuery = true,
    screenType,
    relatedEntityInfo
  ) => {
    let { PAGELAYOUT } = queryParams.current || {};
    try {
      if (screenType === "RELATION") {
        let {
          parentEntityParams,
          childEntityParams,
          filterPath,
          sys_agencyId,
        } = relatedEntityInfo;
        let { appname, modulename, entityname, id } = childEntityParams;

        let metadata = await entityTemplate.get({
          appname,
          modulename,
          groupname: entityname,
        });
        let userFilters = getUserSpecificFilters(metadata);

        let dataParameters = {
          ...parentEntityParams,
          id,
          skip: 0 ? (page - 1) * ITEM_PER_PAGE : 0,
          limit: ITEM_PER_PAGE,
          archiveMode: ARCHIVE,
          ...filters,
          ...userFilters,
          ...getSortByObj(metadata),
          ...(showSampleData && { sampleData: true }),
        };

        let countParameters = {
          appname,
          modulename,
          entityname,
          [filterPath]: id,
          ...filters,
          ...userFilters,
          ...(showSampleData && { sampleData: true }),
        };

        if (metadata && sys_agencyId && sys_agencyId.length) {
          // "sys_agencyId": JSON.stringify(sys_agencyId)
          dataParameters = {
            ...dataParameters,
            sys_agencyId: JSON.stringify(sys_agencyId),
          };
          countParameters = {
            ...countParameters,
            sys_agencyId: JSON.stringify(sys_agencyId),
          };
        }

        let [
          // metadata,
          data,
          dataCount,
        ] = await Promise.all([
          // entityTemplate.get({
          //   appname,
          //   modulename,
          //   groupname: entityname,
          // }),
          childEntity.get(dataParameters),
          entityCount.get(countParameters),
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
      } else {
        // if (entityname !== sessionStorage.getItem("entityName")) {
        //   ARCHIVE = "UnArchive";
        // }
        let entityParams = {
          appname,
          modulename,
          entityname,
          ...filters,
          ...userFilters,
          ...restParams,
          ...(showSampleData && { sampleData: true }),
          skip: page ? (page - 1) * ITEM_PER_PAGE : 0,
          limit: ITEM_PER_PAGE,
          archiveMode: ARCHIVE,
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
        let [
          metadata,
          // dataCount
        ] = await Promise.all([
          entityTemplate.get(metaParams),
          // entityCount.get(entityParams),
        ]);
        if (metadata) {
          let defaultSort = metadata.sys_entityAttributes?.sortFilters;
          if (sortby && orderby) {
            let sortParams = {
              ...queryParams.current,
              sortby: sortby,
              orderby: orderby,
            };
            history.replace(
              `/app/summary/${appname}/${modulename}/${entityname}?${queryToUrl(
                { ...sortParams }
              )}`
            );
            entityParams = { ...entityParams, ...sortParams };
          } else if (defaultSort && Object.keys(defaultSort).length) {
            let displayField =
              metadata.sys_entityAttributes?.sys_topLevel?.filter(
                (e) => e.name === defaultSort.name
              );
            let name =
                displayField && displayField[0]?.type === "REFERENCE"
                  ? `${defaultSort.name}.${displayField[0].name}`
                  : defaultSort.name,
              status =
                defaultSort.sortOrder.toLowerCase() === "ascending" ? 1 : -1;
            let sortParams = {
              ...queryParams.current,
              sortby: name,
              orderby: status,
            };
            history.replace(
              `/app/summary/${appname}/${modulename}/${entityname}?${queryToUrl(
                { ...sortParams }
              )}`
            );
            entityParams = { ...entityParams, ...sortParams };
          }

          let userFilters = {};
          userFilters = getUserSpecificFilters(metadata);
          entityParams = { ...entityParams, ...userFilters };
          let dataCount = await entityCount.get(entityParams);
          let data = await entity.get(entityParams);
          let storedEntityName = sessionStorage.getItem("entityname");
          if (entityname === storedEntityName || storedEntityName === null) {
            let summaryTableData = data,
              summaryTableDataCount = dataCount.data;
            if (isGeoFenceApplied && previousEntity === entityname) {
              let mapData = geoFenceInfo?.current?.geoFencedMapData || [];
              summaryTableData = mapData;
              summaryTableDataCount = mapData?.length;
            }
            dispatch({
              type: "INIT_CONTAINER",
              payload: {
                metadata,
                data: summaryTableData,
                dataCount: summaryTableDataCount,
                params: {
                  appname,
                  modulename,
                  entityname,
                  filters,
                },
                loader: false,
                archiveMode: ARCHIVE,
              },
            });
          }
        }
      }
    } catch (e) {
      console.log(e);
      return e;
    }
  };

  const getSortByObj = (metadata, gridProps) => {
    if (
      gridProps &&
      Object.keys(gridProps)?.length &&
      Object.keys(gridProps?.sortInfo)?.length
    ) {
      return gridProps.sortInfo;
    }
    const defaultSort = metadata.sys_entityAttributes?.sortFilters;
    let displayField = metadata.sys_entityAttributes?.sys_topLevel?.filter(
      (e) => e.name === defaultSort?.name
    );
    if (defaultSort) {
      let name =
          displayField?.length > 0 && displayField[0].type === "REFERENCE"
            ? `${defaultSort.name}.${displayField[0].name}`
            : defaultSort.name,
        status = defaultSort.sortOrder.toLowerCase() === "ascending" ? 1 : -1;
      return { sortby: name, orderby: status };
    }
    return {};
  };

  const getClickedDataInfo = async ({ formData, type, metadata }) => {
    let clickedMetadata = metadata;
    let templateName = get(formData, "sys_templateName", "");
    if (templateName !== entityname) {
      let metaParams = {
        appname,
        modulename,
        groupname: entityname,
        templatename: templateName,
      };
      clickedMetadata = await Promise.resolve(entityTemplate.get(metaParams));
    }
    return { clickedMetadata };
  };

  return {
    getMetadata,
    getData,
    getRoute,
    onDelete,
    getClickedDataInfo,
    getSortByObj,
  };
};

export default GridServices;
