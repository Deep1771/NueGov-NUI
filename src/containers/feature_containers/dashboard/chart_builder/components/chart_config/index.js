import React, { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { MenuItem, TextField } from "@material-ui/core";
import { get } from "dot-prop";
import { useStateValue } from "utils/store/contexts";
import TypeIterator from "./components/type_iterator";
import {
  DisplayButton,
  DisplayGrid,
  DisplayTabs,
  DisplayText,
} from "components/display_components";
import Skeleton from "@material-ui/lab/Skeleton";
import { PaperWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
// hide_scroll
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    width: "100%",
    height: "100%",
    marginTop: 5,
    color: "black",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "95%",
  },
  typography: {
    color: "#212121",
    fontSize: 20,
    fontFamily: "Open Sans",
  },
}));

export default function ChartConfig() {
  const classes = useStyles();
  const [{ dashboardState }, dispatch] = useStateValue();
  const { charts, chartGroups, sys_entityAttributes, selectedChartGroup } =
    dashboardState;
  const { chartType, query } = sys_entityAttributes;
  const { appName, moduleName, entityName } = query;

  const { ColorLens, Edit, FilterList } = SystemIcons;

  const [chartArray, setChartArray] = useState([]);
  const [chartGroupArray, setChartGroupArray] = useState([]);
  const [loader, setLoader] = useState(true);
  const [selectedChart, setSelectedChart] = useState(null);
  const [storedChartName, setStoredChartName] = useState(null);
  const [value, setValue] = useState("InputAttributes");

  const CssTextField = withStyles({
    root: {
      "& label.Mui-focused": {
        color: "#666666",
        fontFamily: "Roboto",
        fontSize: 14,
      },
      "& .MuiInput-underline:after": {
        borderBottomColor: "green",
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "black",
        },
        "&:hover fieldset": {
          borderColor: "blue",
        },
        "&.Mui-focused fieldset": {
          borderColor: "blue",
        },
      },
      width: "95%",
    },
  })(TextField);

  //custom functions
  const getDefaultOptions = (selectedChart) => {
    let chartType =
      selectedChart &&
      selectedChart.sys_entityAttributes &&
      selectedChart.sys_entityAttributes.chartName;
    let chartGroup =
      selectedChart &&
      selectedChart.sys_entityAttributes &&
      selectedChart.sys_entityAttributes.chartGroupName.groupName;
    let options =
      chartGroup == "CIRCULAR"
        ? {
            enableLabel: true,
          }
        : chartType == "COLUMN"
        ? {
            xTicks: {
              rotate: "45",
            },
          }
        : {};
    return options;
  };

  const handleChartSelection = (item) => {
    setSelectedChart(item);
    let options = getDefaultOptions(item);
    dispatch({
      type: "SET_CHART_TYPE",
      payload: {
        chartName: item.sys_entityAttributes.chartName,
        id: item._id,
        sys_gUid: item.sys_gUid,
        options: options,
      },
    });
  };

  const handleChangeGroup = (name) => (event) => {
    dispatch({
      type: "SET_CHART_GROUP_NAME",
      payload: event.target.value,
    });
  };

  //useEffect
  useEffect(() => {
    if (charts && chartGroups && charts.length && chartGroups.length) {
      setLoader(false);
      setChartGroupArray(chartGroups);
    }
  }, [charts, chartGroups]);

  useEffect(() => {
    setStoredChartName(get(chartType, "chartName"));
  }, [chartType]);

  useEffect(() => {
    setSelectedChart(null);
    if (selectedChartGroup) {
      let selectedCharts = charts.filter(
        (a) =>
          a.sys_entityAttributes.chartGroupName.groupName == selectedChartGroup
      );
      setChartArray(selectedCharts);

      if (chartType) {
        let chartSelected = selectedCharts.find(
          (a) => a.sys_entityAttributes.chartName === chartType.chartName
        );
        setSelectedChart(chartSelected);
      }
    } else {
      setChartArray([]);
      setSelectedChart(undefined);
    }
  }, [selectedChartGroup]);

  //divided render sections
  const renderIterator = (item) => {
    return <TypeIterator attributes={item} dashboard={dashboardState} />;
  };

  const renderTabs = () => {
    if (selectedChart) {
      switch (value) {
        case "InputAttributes":
          return renderIterator(
            selectedChart.sys_entityAttributes.inputAttributes
          );
        case "FilterAttributes":
          return renderIterator(
            selectedChart.sys_entityAttributes.filterAttributes
          );
        case "CustomizationAttributes":
          return renderIterator(
            selectedChart.sys_entityAttributes.customizationAttributes.filter(
              (e) => e.web == true
            )
          );
      }
    }
  };

  return (
    <div className={classes.root}>
      <div
        style={{
          display: "flex",
          flexShrink: 2,
          flexDirection: "column",
          padding: "10px 10px 5px 10px",
        }}
      >
        <PaperWrapper
          elevation={2}
          style={{ display: "flex", flex: 1, height: "100%" }}
        >
          {!loader ? (
            <>
              <DisplayGrid
                container
                xs
                item
                style={{ disply: "flex", flex: 1, height: "100%" }}
              >
                <DisplayText
                  className={classes.typography}
                  variant="h7"
                  component="h7"
                  style={{ padding: "10px" }}
                >
                  Select Chart Category
                </DisplayText>
                <div
                  style={{
                    width: "100%",
                    overflow: "auto",
                    flexDirection: "column",
                  }}
                >
                  <CssTextField
                    disabled={!appName || !moduleName || !entityName}
                    id="outlined-select-currency"
                    select
                    label="Chart category"
                    className={classes.textField}
                    value={selectedChartGroup}
                    InputProps={{
                      style: {
                        color: "black",
                        borderColor: "#fff",
                      },
                    }}
                    onChange={handleChangeGroup("group")}
                    SelectProps={{
                      MenuProps: {
                        className: classes.menu,
                      },
                      InputProps: {
                        style: {
                          color: "#212121",
                          fontFamily: "Roboto",
                          fontSize: 16,
                          borderColor: "#fff",
                        },
                      },
                    }}
                    margin="normal"
                    variant="outlined"
                  >
                    {chartGroupArray.map((option) => {
                      let { groupName } = option.sys_entityAttributes;
                      return (
                        <MenuItem
                          elevation={0}
                          key={groupName}
                          value={groupName}
                        >
                          {groupName}
                        </MenuItem>
                      );
                    })}
                  </CssTextField>
                </div>
              </DisplayGrid>
              <DisplayGrid direction="row" container xs={12} item>
                {chartArray.map((item, index) => {
                  let { chartName, iconURL } = item.sys_entityAttributes;
                  return (
                    <DisplayGrid key={index} container xs={3} item>
                      <DisplayButton
                        variant="contained"
                        onClick={() => handleChartSelection(item)}
                        style={{
                          margin: "5px",
                          padding: "0px 2px 0px 2px",
                          height: "120px",
                          width: "120px",
                          backgroundColor:
                            storedChartName == chartName
                              ? "#b9b8b8"
                              : "#e0e0e0",
                        }}
                      >
                        <img src={iconURL} height="90%" width="90%" />
                      </DisplayButton>
                    </DisplayGrid>
                  );
                })}
              </DisplayGrid>
            </>
          ) : (
            <div style={{ padding: "10px" }}>
              <Skeleton
                variant="text"
                style={{ backgroundColor: "#dde2e5", width: "60%" }}
              />
              <Skeleton
                variant="rect"
                style={{
                  backgroundColor: "#dde2e5",
                  width: "100%",
                  height: "50px",
                }}
              />
            </div>
          )}
        </PaperWrapper>
      </div>
      <div style={{ flex: 8, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "10px 10px 10px 10px",
            flexShrink: 2,
            display: "flex",
          }}
        >
          {!loader ? (
            <PaperWrapper elevation={2}>
              <DisplayTabs
                tabs={[
                  {
                    titleKey: "Input Data",
                    value: "InputAttributes",
                    icon: <Edit />,
                  },
                  {
                    titleKey: "Filters",
                    value: "FilterAttributes",
                    icon: <FilterList />,
                  },
                  {
                    titleKey: "Customize",
                    value: "CustomizationAttributes",
                    icon: <ColorLens />,
                  },
                ]}
                defaultSelect={value}
                titleKey={"titleKey"}
                valueKey={"value"}
                onChange={(val) => {
                  setValue(val);
                }}
              />
            </PaperWrapper>
          ) : (
            <Skeleton
              variant="rect"
              style={{
                backgroundColor: "#dde2e5",
                width: "100%",
                height: "15%",
              }}
            />
          )}
        </div>
        <div
          style={{ flex: 8, display: "flex", padding: "0px 20px 20px 10px" }}
        >
          {renderTabs()}
        </div>
      </div>
    </div>
  );
}
