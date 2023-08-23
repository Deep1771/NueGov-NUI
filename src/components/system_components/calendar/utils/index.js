import React, { useContext } from "react";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";

import { queryToUrl } from "utils/services/helper_services/system_methods";
import { useHistory } from "react-router-dom";

import { dot } from "dot-object";

import { GlobalFactory } from "utils/services/factory_services";

const CalendarServices = () => {
  const history = useHistory();
  const { updateFilterValues, getBusinessType } = GlobalFactory();
  const businessType = getBusinessType();
  const pageType = businessType === "NUEGOV" ? "summary" : "detail";

  const getRoute = ({
    moduleName,
    entityName,
    id = null,
    mode = "read",
    appName,
    query,
  }) => {
    let dotFilter = query && dot(query);
    query = dotFilter && updateFilterValues(dotFilter);

    if (id)
      history.push(
        `/app/${pageType}/${appName}/${moduleName}/${entityName}/${mode}/${id}?${queryToUrl(
          query
        )} `
      );
    else
      history.push(
        `/app/${pageType}/${appName}/${moduleName}/${entityName}/new?${queryToUrl(
          query
        )} `
      );
  };

  const getData = async (props) => {
    let { appName, moduleName, entityName, startDate, endDate, type } = props;
    let entityParams = {
      appname: appName,
      modulename: moduleName,
      entityname: entityName,
      isCalendar: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      startDate: startDate,
      endDate: endDate,
      limit: 0,
      skip: 0,
    };

    try {
      let resultObj = {};
      if (type === "MetaAndData") {
        let [metadata, data] = await Promise.all([
          entityTemplate.get({
            appname: appName,
            modulename: moduleName,
            groupname: entityName,
          }),
          entity.get(entityParams),
        ]);
        let result = [];
        if (data?.status === "Success")
          result = data?.result?.length > 0 ? data?.result : [];

        resultObj = {
          metaData: metadata,
          data: result,
        };
      } else {
        let [data] = await Promise.all([entity.get(entityParams)]);
        let result = [];
        if (data?.status === "Success")
          result = data?.result?.length > 0 ? data?.result : [];

        resultObj = {
          metaData: {},
          data: result,
        };
      }
      return resultObj;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  return { getData, getRoute };
};

export default CalendarServices;
