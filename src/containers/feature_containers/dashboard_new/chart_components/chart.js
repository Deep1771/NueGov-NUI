import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { URLConstructor, updateCurrentTab } from "../helpers";
import { useStateValue } from "utils/store/contexts";
import { GlobalFactory } from "utils/services/factory_services";
import { SaveModal } from "containers/feature_containers/dashboard_new/board/components/saveModal";
import { UserFactory } from "utils/services/factory_services";

export const Chart = (props) => {
  let { config, data, layout, plotId, template, onTitleChange } = props;
  let { staticPlot } = config;
  let { clickable, combinedChart } = template.sys_entityAttributes;
  const history = useHistory();
  const [{ dashboardState }, dispatch] = useStateValue();
  const { boardUpdated } = dashboardState;
  let type = data?.[0].type;
  const [saveModal, setSaveModal] = useState({ flag: false });
  const { getNavbarConfig, getBusinessType } = GlobalFactory();
  const navbarLinks = getNavbarConfig();
  const { getUserInfo } = UserFactory();
  const { sys_gUid } = getUserInfo();

  if (config && Object.keys(config).length) {
    config = { ...config, responsive: true };
  }

  const handleClickEvent = (event) => {
    let url = URLConstructor(template, type, event, sys_gUid);
    if (getBusinessType() === "NUEASSIST") {
      updateCurrentTab({ navbarLinks, template });
      history.push(url);
      history.go();
    } else history.push(url);
  };
  const checkChanges = (event) => {
    if (!staticPlot && boardUpdated)
      setSaveModal({ flag: true, action: event });
    else handleClickEvent(event);
  };

  useEffect(() => {
    combinedChart
      ? window.Plotly.newPlot(
          plotId,
          data[0].simplifiedYaxis,
          data[0].simplifiedXaxis
        )
      : window.Plotly.newPlot(plotId, data, layout, config);
  }, []);

  useEffect(() => {
    combinedChart
      ? window.Plotly.newPlot(
          plotId,
          data[0].simplifiedYaxis,
          data[0].simplifiedXaxis
        )
      : window.Plotly.newPlot(plotId, data, layout, config);
    //plot elem
    let myPlot = document.getElementById(plotId);
    //Click Event
    if (clickable !== false)
      myPlot.on("plotly_click", (event) => checkChanges(event));
  });

  return (
    <>
      <div
        id={plotId}
        className={type === "indicator" ? `indicator_${plotId}` : plotId}
        style={{ height: "100%", width: "100%" }}
      ></div>
      <SaveModal
        openDialog={saveModal.flag}
        onClose={() => {
          setSaveModal(false);
        }}
        action={saveModal.action}
        onContinue={(action) => {
          handleClickEvent(action);
        }}
      />
    </>
  );
};
