import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import { makeStyles } from "@material-ui/core/styles";
import { get, set } from "dot-prop";
import { useStateValue } from "utils/store/contexts";
import { entity } from "utils/services/api_services/entity_service";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import ExpandDialogBox from "./expand_dialog_box";
import ChartIterator from "../../../chart_components/iterator";
import { DisplayButton, DisplayDialog } from "components/display_components";
import { PaperWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";

const ChartDisplay = (props) => {
  const [{ userState, dashboardState }, dispatch] = useStateValue();
  const { closeBackDrop, setSnackBar, setBackDrop } = GlobalFactory();
  const { getRoleRefObj, isNJAdmin, isSuperAdmin, getRefObj } = UserFactory();
  const history = useHistory();
  let { id, mode } = useParams();
  const { userData } = userState;
  let { displayChart, sys_entityAttributes } = dashboardState;
  const { chartType } = sys_entityAttributes;
  let { Clear, FullscreenRounded, PlayArrow, Save } = SystemIcons;
  const [inputAttributes, setInputAttributes] = useState([]);
  const [maximizeChart, setMaximizeChart] = useState(false);
  const [viewMode, setViewMode] = useState(id ? "Preview" : "clear");
  const [openDialogModal, setOpenDialogModal] = useState(false);
  const [preview, setPreview] = useState(true);
  const [template, setTemplate] = useState({});
  const useStyles = makeStyles((theme) => ({
    root: {
      marginTop: 5,
      display: "flex",
      flex: 1,
      padding: "20px",
      flexDirection: "column",
      justifyContent: "center",
      backgroundColor: "#ffffff",
    },
  }));
  const classes = useStyles();
  if (mode) mode = mode.toUpperCase();

  //custom functions
  const clearChart = () => {
    setViewMode("clear");
    setPreview(false);
    setOpenDialogModal(false);
    dispatch({
      type: "RESET_DASHBOARD",
    });
  };

  const expandchart = () => {
    setTemplate({
      template: { sys_entityAttributes },
      onSave: saveChart,
      onReject: () => {
        setMaximizeChart(false);
      },
    });
    setMaximizeChart(true);
  };

  const refreshPreview = () => {
    setViewMode("Preview");
    setPreview(false);
  };

  const saveChart = async () => {
    try {
      setBackDrop("Saving your custom chart");
      let { sys_entityAttributes } = dashboardState;
      let { query } = sys_entityAttributes;

      let entityQuery = {
        appname: "Features",
        modulename: "Insights",
        entityname: "ChartTemplate",
      };
      let entityObject = { sys_entityAttributes };
      let appObj = get(userData, "appStructure").find(
        (a) => a.name === query.appName
      );
      let appTemplateQuery = {
        appname: "NJAdmin",
        modulename: "NJ-System",
        entityname: "AppTemplate",
        sys_appName: appObj.name,
        limit: 5,
        skip: 0,
      };
      let appTemplateObj = (await entity.get(appTemplateQuery))[0];
      let appReferenceObj = {
        id: appTemplateObj._id,
        sys_gUid: appTemplateObj.sys_gUid,
        sys_appName: appObj.name,
        uiGridDisplayString: appObj.name,
        text: appObj.name,
      };
      set(dashboardState, "sys_entityAttributes.appName", appReferenceObj);
      if (id && mode === "EDIT") {
        let updatedData = {
          ...props.chartOptions,
          sys_entityAttributes: {
            ...props.chartOptions.sys_entityAttributes,
            ...entityObject.sys_entityAttributes,
          },
        };
        entity
          .update({ ...entityQuery, id }, updatedData)
          .then((res) => {
            closeBackDrop();
            setSnackBar({
              message: "Your configured chart has been saved",
              severity: "success",
            });
            setOpenDialogModal(false);
            setMaximizeChart(false);
            dispatch({
              type: "RESET_DASHBOARD",
            });
          })
          .catch((e) => {
            closeBackDrop();
            console.log(e, "error");
          });
        history.goBack();
      } else {
        if (id && mode === "CLONE") delete entityObject._id;

        entityObject["sys_agencyId"] = userData.sys_agencyId;
        set(entityObject, "sys_entityAttributes.userInfo", getRefObj());
        try {
          if (isNJAdmin())
            set(entityObject, "sys_entityAttributes.assetgovAdmin", true);
          else if (isSuperAdmin)
            set(entityObject, "sys_entityAttributes.superAdmin", true);
          else
            set(entityObject, "sys_entityAttributes.roleName", [
              getRoleRefObj(),
            ]);
        } catch (e) {
          console.log(e);
        }
        entity
          .create(entityQuery, entityObject)
          .then((res) => {
            closeBackDrop();
            setSnackBar({
              message: "Your configured chart has been saved",
              severity: "success",
            });
            setOpenDialogModal(false);
            setMaximizeChart(false);
            dispatch({
              type: "RESET_DASHBOARD",
            });
            if (mode === "CLONE") history.goBack();
          })
          .catch((e) => {
            closeBackDrop();
            console.log(e, "error");
          });
      }
    } catch (e) {
      closeBackDrop();
      console.log(e, "error");
    }
  };

  const validate = () => {
    if (inputAttributes.length) {
      let template = dashboardState.sys_entityAttributes;
      let { appName, moduleName, entityName } = template.query;
      return (
        !appName ||
        !moduleName ||
        !entityName ||
        inputAttributes
          .filter((ea) => ea.required)
          .map((ea) =>
            Boolean(
              get(
                template,
                ea.parent ? `${ea.parent}.${ea.name}` : `${ea.name}`
              )
            )
          )
          .includes(false)
      );
    }
    return true;
  };

  //useEffect
  useEffect(() => {
    if (chartType && chartType.chartName) {
      let chartName = chartType.chartName;
      let selectedChart = dashboardState.charts.find(
        (ec) => ec.sys_entityAttributes.chartName === chartName
      );
      setInputAttributes(
        selectedChart ? selectedChart.sys_entityAttributes.inputAttributes : []
      );
      id ? setViewMode("Preview") : setViewMode("clear");
      id ? setPreview(true) : setPreview(false);
    }
  }, [chartType]);

  useEffect(() => {
    setPreview(displayChart);
  }, [displayChart]);

  useEffect(() => {
    if (viewMode === "Preview") {
      if (!preview) setPreview(true);
      else {
        dispatch({
          type: "SHOW_CHART",
          payload: false,
        });
      }
    }
  }, [viewMode, preview]);

  return (
    <div className={classes.root}>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignSelf: "flex-start",
          }}
        >
          <DisplayButton
            disabled={validate()}
            onClick={() => {
              refreshPreview();
            }}
          >
            <PlayArrow />
            Preview
          </DisplayButton>
        </div>
        <div
          style={{
            flex: 2,
            display: "flex",
            flexDirection: "row",
            alignSelf: "flex-start",
            justifyContent: "flex-end",
          }}
        >
          <DisplayButton
            disabled={preview === false || validate()}
            systemVariant="secondary"
            onClick={() => {
              setOpenDialogModal(true);
            }}
          >
            <Clear />
            &nbsp;Clear
          </DisplayButton>
          <DisplayButton
            disabled={preview === false || validate()}
            onClick={() => {
              saveChart();
            }}
            style={{ margin: "0px 0px 0px 10px" }}
          >
            <Save /> &nbsp;Save
          </DisplayButton>
        </div>
      </div>

      <div
        elevation={2}
        style={{ flex: 9, flexDirection: "column", display: "flex" }}
      >
        {preview && !validate() && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignSelf: "flex-end",
                justifyContent: "flex-end",
                position: "absolute",
                top: 5,
                right: 5,
              }}
            >
              <DisplayButton
                onClick={() => {
                  expandchart();
                }}
              >
                <FullscreenRounded />{" "}
              </DisplayButton>
              {/* <FullscreenRounded style={{ cursor: 'pointer' }} variant="outlined" color="primary" onClick={() => { expandchart() }} fontSize="large" /> */}
            </div>
            <div style={{ display: "flex", flex: 9, flexDirection: "column" }}>
              <PaperWrapper
                elevation={2}
                style={{
                  backgroundColor: "#ffffff",
                }}
              >
                <ChartIterator template={sys_entityAttributes} />
              </PaperWrapper>
            </div>
          </div>
        )}
      </div>

      {openDialogModal && (
        <DisplayDialog
          title="Are you sure?"
          open={openDialogModal}
          message="You won't be able to undo this action"
          onCancel={() => {
            setOpenDialogModal(false);
          }}
          onConfirm={clearChart}
        />
      )}
      {maximizeChart && (
        <div>
          <ExpandDialogBox options={template} openDialog={maximizeChart} />
        </div>
      )}
    </div>
  );
};
export default ChartDisplay;
