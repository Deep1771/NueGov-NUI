import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import { useStateValue } from "utils/store/contexts";
import { entity } from "utils/services/api_services/entity_service";
import { UserFactory } from "utils/services/factory_services";
import ChartConfig from "./components/chart_config";
import ChartDisplay from "./components/chart_display";
import TemplateSelectionPanel from "./components/template_selection_panel";
import { DisplayGrid } from "components/display_components";
import { BubbleLoader, ErrorFallback } from "components/helper_components";
import { ContainerWrapper } from "components/wrapper_components";

let ChartBuilder = (props) => {
  const useStyles = makeStyles((theme) => ({
    root: {
      padding: theme.spacing(0, 1),
      height: "100%",
      width: "100%",
      display: "flex",
      flex: 1,
      backgroundColor: "#dde2e5",
    },
  }));

  const classes = useStyles();
  let { chartbuilder, mode, id } = useParams();
  const { getUserInfo, isNJAdmin, isSuperAdmin } = UserFactory();
  const { id: userId } = getUserInfo();
  const [{ dashboardState }, dispatch] = useStateValue();
  const [chartOptions, setChartOptions] = useState();
  const [loading, setLoading] = useState(true);
  const [noResult, setNoResult] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  if (mode) mode = mode.toUpperCase();

  const checkOwnerStatus = (sys_entityAttributes) => {
    if (isNJAdmin() || isSuperAdmin) return true;
    if (
      !sys_entityAttributes.userInfo ||
      (sys_entityAttributes.userInfo &&
        sys_entityAttributes.userInfo.id !== userId)
    )
      return false;
    else return true;
  };

  useEffect(() => {
    if (chartbuilder && mode && ["EDIT", "CLONE"].includes(mode) && id) {
      let chartQuery = {
        appname: "Features",
        modulename: "Insights",
        entityname: "ChartTemplate",
        id: id,
      };
      entity
        .get(chartQuery)
        .then((res) => {
          if (res && Object.keys(res).length) {
            const { sys_entityAttributes, ...rest } = res;
            setChartOptions(res);
            dispatch({
              type: "EDIT_CHART",
              payload: sys_entityAttributes,
            });

            if (mode == "EDIT")
              !checkOwnerStatus(sys_entityAttributes) &&
                setPermissionDenied(true);

            setLoading(false);
          } else {
            setNoResult(true);
            setLoading(false);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    } else setLoading(false);
  }, [chartbuilder, mode, id]);

  return (
    <ContainerWrapper style={{ flex: 1 }}>
      {loading ? (
        <BubbleLoader />
      ) : permissionDenied ? (
        <ErrorFallback slug="permission_denied" />
      ) : noResult ? (
        <ErrorFallback slug="no_result" />
      ) : (
        <DisplayGrid className={classes.root} container xs={12}>
          <DisplayGrid
            direction="column"
            container
            xs={3}
            style={{ padding: "2px" }}
          >
            <TemplateSelectionPanel />
          </DisplayGrid>
          <DisplayGrid
            direction="column"
            container
            xs={4}
            style={{ padding: "2px" }}
          >
            <ChartConfig />
          </DisplayGrid>
          <DisplayGrid
            direction="column"
            container
            xs={5}
            style={{ padding: "2px" }}
          >
            <ChartDisplay chartOptions={chartOptions} />
          </DisplayGrid>
        </DisplayGrid>
      )}
    </ContainerWrapper>
  );
};

export default ChartBuilder;
