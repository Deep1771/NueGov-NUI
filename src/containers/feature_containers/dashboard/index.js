import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { UserFactory } from "utils/services/factory_services";
import { useStateValue } from "utils/store/contexts";
import AnalyticServices from "./helper_services/analytics_services";
import ChartBuilder from "./chart_builder";
import { DisplayDialog, DisplayTabs } from "components/display_components";
import { ContainerWrapper, GridWrapper } from "components/wrapper_components";
import { ErrorFallback } from "components/helper_components/error_handling/error_fallback";

const DashBoardContainer = () => {
  const { setRequiredActions } = AnalyticServices();
  const { checkGlobalFeatureAccess } = UserFactory();
  const [{ dashboardState }, dispatch] = useStateValue();
  const { chartbuilder, mode, id } = useParams();
  const history = useHistory();

  const [dialog, setDialog] = useState({ dialog: false });
  const [section, setSection] = useState("My Dashboard");
  const isAccessible = checkGlobalFeatureAccess("Insights");
  const tabs = [
    {
      name: "Custom chart builder",
      component: <ChartBuilder />,
    },
  ];

  const handleSwitchTab = () => {
    history.goBack();
    dispatch({
      type: "RESET_DASHBOARD",
    });
    setDialog({ dialog: false });
  };

  const handleSection = (value) => {
    if (value === "Custom chart builder") {
      if (chartbuilder && id) {
      } else history.push("/app/dashboard/chartbuilder/new");
    } else {
      if (id) {
        let saveModal = {
          dialog: true,
          title: "Are you sure, you want to switch ?",
          msg: "You changes will be lost",
          confirmLabel: "Switch",
          onConfirm: handleSwitchTab,
        };
        setDialog(saveModal);
      } else {
        history.goBack();
        dispatch({
          type: "RESET_DASHBOARD",
        });
      }
    }
  };

  const onCancel = () => {
    setSection("Custom chart builder");
    setDialog({ dialog: false });
  };

  useEffect(() => {
    setRequiredActions();
    chartbuilder && setSection("Custom chart builder");
  }, []);

  useEffect(() => {
    chartbuilder
      ? setSection("Custom chart builder")
      : setSection("My Dashboard");
  }, [chartbuilder, mode, id]);

  return (
    <ContainerWrapper style={{ flex: 1 }}>
      {isAccessible ? (
        <>
          <div style={{ display: "flex", flexShrink: 1 }}>
            <DisplayTabs
              tabs={tabs}
              defaultSelect={section}
              titleKey={"name"}
              valueKey={"name"}
              variant="standard"
              onChange={(value) => {
                handleSection(value);
              }}
            />
          </div>
          <div style={{ display: "flex", flex: 9 }}>
            {tabs.find((a) => a.name === section).component}
          </div>
          {dialog && (
            <DisplayDialog
              open={dialog.dialog}
              title={dialog.title}
              message={dialog.msg}
              confirmLabel={dialog.confirmLabel}
              onConfirm={dialog.onConfirm}
              onCancel={onCancel}
            />
          )}
        </>
      ) : (
        <ErrorFallback slug={"permission_denied"} />
      )}
    </ContainerWrapper>
  );
};
export default GridWrapper(DashBoardContainer);
