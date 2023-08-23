export const URLConstructor = (template, type, event, user_gUid) => {
  let selectedEntityIndex = 0;
  selectedEntityIndex = event?.points[0]?.curveNumber;
  let point = type === "indicator" ? {} : event?.points?.[0];
  let barmode =
    template?.sys_entityAttributes?.layoutOptions?.barmode || "group";
  let { payload } =
    template?.sys_components?.[selectedEntityIndex]?.sys_entityAttributes || {};
  if (!payload) {
    let payloadTemplate = template?.sys_components?.filter(
      (e) => e.sys_entityAttributes?.payload?.entityName === event?.points[0]?.x
    );
    payload = payloadTemplate[0]?.sys_entityAttributes?.payload;
  }
  let {
    appName,
    moduleName,
    entityName,
    aggregateOn,
    filters = [],
    agencyFilter = [],
    urlPaths = [],
  } = payload || {};
  const BASEPATH = `app/summary/${appName}/${moduleName}/${entityName}`;

  let { archiveMode = "Unarchive" } = aggregateOn.aggregate[0] || [];
  if (archiveMode) {
    sessionStorage.setItem("archiveMode", archiveMode);
  }

  const getAgencyFilters = () =>
    agencyFilter.length
      ? `&sys_agencyId=[${agencyFilter.map((ea) => `"${ea}"`)}]`
      : "";

  const getFilterParams = () => {
    let url,
      filterValues = [];

    if (filters.length) {
      filterValues = filters.map((eachObj) => {
        let filterPath = getGroupByPath(eachObj);
        let filterValue =
          user_gUid && eachObj?.values?.equals === "PRIVATE"
            ? user_gUid
            : eachObj?.values?.equals;
        return { filterPath, filterValue };
      });
      if (urlPaths?.length) {
        urlPaths.map((eachObj) => {
          if (eachObj?.path && eachObj?.value)
            filterValues.push({
              filterPath: eachObj?.path,
              filterValue: eachObj?.value,
            });
          return eachObj;
        });
      }
      url = `&${filterValues
        .map((ef) => `${ef.filterPath}=${ef.filterValue}`)
        .join("&")}${getAgencyFilters()}`;
    } else {
      url = `${getAgencyFilters()}`;
    }
    return url;
  };

  const getGroupByPath = (groupByObj) => {
    let { class: CLASS, path, componentName = undefined } = groupByObj;
    if (CLASS === "COMPONENT")
      return `${path.substring(path.indexOf(".") + 1)}|${componentName}`;
    else return path.substring(path.indexOf(".") + 1);
  };

  const getClickedValue = (clickedData, varKey) => {
    let clickedValue;
    let { data } = point;
    if (data.hasOwnProperty("agencyIds")) {
      let clickedObj = data.agencyIds.find(
        (eachObj) => eachObj[varKey] === clickedData
      );
      clickedValue = `["${clickedObj.id}"]`;
      return clickedValue;
    } else return clickedData;
  };

  let filterPath = getFilterParams();

  const getCommonParams = (clickedValue) => {
    let clicked = clickedValue === "N/A" ? null : clickedValue;
    let groupbyPath = getGroupByPath(aggregateOn?.groupBy?.[0]);
    let path = `/${BASEPATH}?${groupbyPath}=${clicked}${filterPath}`;
    return path;
  };

  switch (type) {
    case "bar":
    case "column": {
      switch (barmode) {
        case "group":
        case "stack": {
          let clickedValue = getClickedValue(
            point.fullData.orientation === "v" ? point.x : point.y,
            "x1"
          );
          let groupByValues = aggregateOn?.groupBy?.map((eachItem, i) => {
            if (i == 0) {
              let groupPath = getGroupByPath(eachItem);
              let groupValue = clickedValue === "N/A" ? null : clickedValue;
              return { groupPath, groupValue };
            } else {
              let groupPath = getGroupByPath(eachItem);
              let groupValue = point?.data?.name;
              return { groupPath, groupValue };
            }
          });
          let url = `/${BASEPATH}?${groupByValues
            .map((ev) => `${ev.groupPath}=${ev.groupValue}`)
            .join("&")}${filterPath}`;
          return clickedValue === "Total" || clickedValue === "Remaining"
            ? `/${BASEPATH}?${getAgencyFilters()}`
            : url;
        }
        default: {
          console.log(99);
          let clickedValue = getClickedValue(
            point.fullData.orientation === "v" ? point.x : point.y,
            "x1"
          );
          let url = getCommonParams(clickedValue);
          return clickedValue === "Total" || clickedValue === "Remaining"
            ? `/${BASEPATH}?${getAgencyFilters()}`
            : url;
        }
      }
    }

    case "pie":
    case "donut": {
      let clickedValue = getClickedValue(point.label, "x1");
      let url = getCommonParams(clickedValue);
      return clickedValue === "Total" || clickedValue === "Remaining"
        ? `/${BASEPATH}?${getAgencyFilters()}`
        : url;
    }

    case "scatter": {
      let clickedValue = getClickedValue(point.x, "x1");
      let url = getCommonParams(clickedValue);
      return clickedValue === "Total" || clickedValue === "Remaining"
        ? `/${BASEPATH}?${getAgencyFilters()}`
        : url;
    }

    case "heatmap": {
      let totalGroupBy = aggregateOn?.groupBy?.length || 0;
      if (totalGroupBy && totalGroupBy == 1) {
        let groupPath = getGroupByPath(aggregateOn?.groupBy?.[0]),
          clickedDate = new Date(point.text);
        let groupValueInISO = new Date(
          clickedDate.getTime() - clickedDate.getTimezoneOffset() * 60000
        ).toISOString();
        let groupValue = groupValueInISO.split("T")[0];

        let url = `/${BASEPATH}?${groupPath}=${groupValue}${filterPath}`;
        return url;
      } else {
        let clickedX = point.x === "N/A" ? null : point.x;
        let clickedY = point.y === "N/A" ? null : point.y;
        let groupByValues = aggregateOn?.groupBy.map((eachItem, i) => {
          if (i == 0) {
            let groupPath = getGroupByPath(eachItem);
            let groupValue = getClickedValue(clickedX, "x1");
            return { groupPath, groupValue };
          } else {
            let groupPath = getGroupByPath(eachItem);
            let groupValue = getClickedValue(clickedY, "x2");
            return { groupPath, groupValue };
          }
        });
        let url = `/${BASEPATH}?${groupByValues
          .map((ev) => `${ev.groupPath}=${ev.groupValue}`)
          .join("&")}${filterPath}`;
        return url;
      }
    }

    case "indicator": {
      let url = `/${BASEPATH}?${filterPath}`;
      return url;
    }

    default:
      return null;
  }
};
