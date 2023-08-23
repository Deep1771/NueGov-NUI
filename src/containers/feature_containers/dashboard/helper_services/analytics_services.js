import { useStateValue } from "utils/store/contexts";
import { entity } from "utils/services/api_services/entity_service";

export const AnalyticServices = () => {
  const [{ dashboardState }, dispatch] = useStateValue();
  const { charts, chartGroups, systemTypes } = dashboardState;

  const setRequiredActions = () => {
    if (!systemTypes.length) setSystemTypes();
    if (!chartGroups.length) setChartGroups();
    if (!charts.length) setCharts();
  };

  const setCharts = () => {
    let chartQuery = {
      appname: "Features",
      modulename: "Insights",
      entityname: "Chart",
      enable: "Yes",
      limit: 50,
      skip: 0,
    };
    entity.get(chartQuery).then((res) => {
      dispatch({
        type: "SET_CHART_PROTOCOL",
        payload: res,
      });
    });
  };

  const setChartGroups = () => {
    let chartGroupQuery = {
      appname: "Features",
      modulename: "Insights",
      entityname: "ChartGroup",
      limit: 50,
      skip: 0,
    };
    entity.get(chartGroupQuery).then((res) => {
      dispatch({
        type: "SET_CHART_GROUPS",
        payload: res,
      });
    });
  };
  const setSystemTypes = () => {
    let systemTypeQuery = {
      appname: "Features",
      modulename: "Insights",
      entityname: "SystemTypes",
      limit: 50,
      skip: 0,
    };
    entity.get(systemTypeQuery).then((res) => {
      dispatch({
        type: "SET_SYSTEM_TYPES",
        payload: res,
      });
    });
  };

  const services = {
    setChartGroups,
    setCharts,
    setRequiredActions,
    setSystemTypes,
  };
  return { ...services };
};

export default AnalyticServices;
