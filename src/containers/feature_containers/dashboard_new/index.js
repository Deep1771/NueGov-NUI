import React, { useEffect } from "react";
// import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useStateValue } from "utils/store/contexts";
import { UserFactory } from "utils/services/factory_services";
import { entity } from "utils/services/api_services/entity_service";
import { BubbleLoader, ErrorFallback } from "components/helper_components";
import { ContainerWrapper } from "components/wrapper_components";
import { Board } from "./board";
import "./dashboard.css";

const Dashboard = (props) => {
  const QUERY_OBJ = {
    appname: "Features",
    modulename: "Insights",
  };
  const INFO_OBJ = {
    appname: "NJAdmin",
    modulename: "NJ-SysTools",
    entityname: "Tooltip",
    context: "INSIGHTS",
    skip: 0,
    limit: 1,
  };
  // const handle = useFullScreenHandle();
  const [{ dashboardState }, dispatch] = useStateValue();
  const { chartObjects, toolTip } = dashboardState;
  const { checkGlobalFeatureAccess } = UserFactory();

  const isDashboardAccessible = checkGlobalFeatureAccess("Insights");

  const divStyle = {
    display: "flex",
    flex: 1,
    width: "100%",
    height: "100%",
  };

  const loadChartObjects = async () => {
    let [chartObjects, infos] = await Promise.all([
      entity.get({ ...QUERY_OBJ, entityname: "Chart" }),
      entity.get(INFO_OBJ),
    ]);
    let toolTips = {};
    if (infos && !infos.error && infos.length)
      infos[0].sys_entityAttributes.info.map((i) => {
        toolTips[i.name] = i.label;
      });
    dispatch({
      type: "INIT_INSIGHTS",
      payload: { chartObjects, toolTips },
    });
  };

  useEffect(() => {
    if (!chartObjects.length) loadChartObjects();
  }, []);

  return (
    <ContainerWrapper
      style={{
        display: "flex",
        flex: 1,
        backgroundColor: "#f0f2f5",
        width: "100%",
        height: "100%",
      }}
      id="dashboard-container"
    >
      {isDashboardAccessible ? (
        chartObjects.length ? (
          <div style={divStyle}>
            <Board {...props} />
          </div>
        ) : (
          <div style={divStyle}>
            <BubbleLoader />
          </div>
        )
      ) : (
        <ErrorFallback slug={"permission_denied"} />
      )}
    </ContainerWrapper>
  );
};

export default Dashboard;
