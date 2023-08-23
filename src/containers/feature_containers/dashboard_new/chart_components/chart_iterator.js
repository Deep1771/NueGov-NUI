import React, { useState, useEffect, useRef } from "react";
import { useStateValue } from "utils/store/contexts";
import { entity } from "utils/services/api_services/entity_service";
import { dashboard } from "utils/services/api_services/dashboard_service";
import { ThemeFactory, UserFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import { BubbleLoader } from "components/helper_components";
import { DisplayIcon } from "components/display_components";
import { Adapter } from "../helpers/adapter";
import { combinedChartData } from "../helpers/combinedCharts";
import { Chart } from "./chart";
import { Heatmap } from "./heatmap";
import { Table } from "./table";
import { SystemIcons } from "utils/icons";

const QUERY_OBJ = {
  appname: "Features",
  modulename: "Insights",
  entityname: "ChartTemplate",
};

const CHART_COMPONENTS = {
  heatmap: Heatmap,
  table: Table,
};

export const ChartIterator = (props) => {
  const [{ dashboardState }] = useStateValue();
  const { Edit } = SystemIcons;
  const { getVariantObj } = ThemeFactory();
  const { isNJAdmin, isSuperAdmin, getLoginName, checkWriteAccess } =
    UserFactory();
  const [chartData, setChartData] = useState();
  const [error, setError] = useState(false);
  const { dark } = getVariantObj("primary");
  const { chartConfig, chartObjects } = dashboardState;

  const {
    boardTitle = "",
    template,
    layout: LAYOUT,
    config: CONFIG,
    plotId,
    unmountURL,
    relationMeta,
    formData,
    filterValue,
    triggerOn,
    filterMetadata: { applyChangeTo = "", defaultValue } = {},
  } = props;

  let getFormAgencyId = () => {
    let { dashboardConfig } = (unmountURL && relationMeta[0]?.metadata) || {};
    let { agencyIdPath } = dashboardConfig || {};
    let agencyId = get(formData, agencyIdPath);
    return agencyId ? [agencyId] : [];
  };

  const { _id, sys_components, sys_entityAttributes } = template;
  const {
    configOptions,
    layoutOptions,
    title = "",
    userInfo,
    combinedChart,
  } = sys_entityAttributes;
  const [titleChart, setTitle] = useState(title);
  const [input, setInput] = useState(titleChart ? false : true);

  const inputEl = useRef(null);
  const hoverIcon = useRef(null);

  const createdByMe = userInfo && userInfo.username == getLoginName;

  const setHovered = (hovStatus) => {
    if (hoverIcon.current && config.editable && !config.staticPlot)
      hoverIcon.current.style.display = hovStatus ? "block" : "none";
  };

  let charts = sys_components.filter((i) => (i.componentName = "Traces"));
  //CONFIG LAYOUT & Traces
  const config = {
    ...get(chartConfig, "config"),
    ...configOptions,
    ...(CONFIG || {}),
    displayModeBar: true,
    toImageButtonOptions: {
      filename: `${title}-${boardTitle}`,
    },
    editable:
      checkWriteAccess(QUERY_OBJ) &&
      (isNJAdmin() || isSuperAdmin || createdByMe),
  };
  let layout = {
    ...get(chartConfig, "layout"),
    ...(layoutOptions || {}),
    title: {
      text: title,
      ...(chartConfig?.layout?.title || {}),
      ...(layoutOptions?.title || {}),
    },
    xaxis: {
      automargin: true,
      ...(layoutOptions?.xaxis || {}),
    },
    yaxis: {
      automargin: true,
      ...(layoutOptions?.yaxis || {}),
    },
    modebar: {
      activecolor: dark.bgColor,
    },
    ...(LAYOUT || {}),
  };

  //CONFIG LAYOUT & Traces

  const onTitleChange = (title) => {
    entity
      .update(
        { ...QUERY_OBJ, id: _id },
        {
          ...template,
          sys_entityAttributes: { ...sys_entityAttributes, title },
        }
      )
      .then((res) => {
        let layoutObj = {
          ...layout,
          title: {
            ...layout.title,
            text: title,
          },
        };
        window.Plotly.relayout(plotId, layoutObj);
      });
  };

  const removeDuplicateLegends = (traces) => {
    const names = {};
    for (let i = 0; i < traces.length; i++) {
      const name = traces[i].name;
      if (names[name]) {
        traces[i].showlegend = false;
      } else {
        names[name] = true;
      }
    }
  };

  const formatTraceText = (traces, layout = {}) => {
    const { showvalue = true } = layout;
    if (!showvalue) {
      return;
    }
    for (let i = 0; i < traces.length; i++) {
      if (traces[i].type === "bar") {
        traces[i].text = traces[i].y.map(String);
        traces[i].textposition = "auto";
      }
    }
  };

  const constructData = async () => {
    //CONSTRUCT PAYLOAD ARRAY
    let payloads = charts.map(({ sys_entityAttributes, componentId }) => {
      let { payload, chartName } = sys_entityAttributes;
      if (payload) {
        payload.chartName = chartName.chartName;
        payload.traceId = componentId;
        if (triggerOn && (filterValue || defaultValue) && payload) {
          (payload.filters || []).map((field) => {
            if (field?.path === triggerOn) {
              try {
                eval(`${applyChangeTo} = '${filterValue || defaultValue}'`);
              } catch (e) {}
              return;
            }
          });
        }

        //agency id from the detail page for related entity dashboard
        if (unmountURL) {
          if (getFormAgencyId()?.length > 0) {
            payload = {
              ...payload,
              agencyFilter: getFormAgencyId(),
            };
          } else {
            payload = {};
          }
        }

        return payload;
      } else
        return {
          traceId: componentId,
        };
    });
    try {
      let response = (
        await dashboard.create(
          { id: `${_id}-${title.replace(/[^a-zA-Z0-9]/g, "")}` },
          payloads
        )
      ).response;

      if (response) {
        try {
          response = JSON.parse(response);

          let simplifiedData = combinedChart
            ? combinedChartData({ response, template })
            : "";
          let traces = [];
          charts.map((trace) => {
            let { color } = trace.sys_entityAttributes;
            let traceResponse = response.find(
              (ep) => ep.traceId === trace.componentId
            );
            let { result, error } = traceResponse;
            if (!error && (result.length || layout.showEmptyTraces)) {
              let traceData = Adapter({
                trace,
                response: traceResponse,
                color: color,
              });

              traces = [...traces, ...traceData];
            }
          });

          if (!traces.length) {
            traces = [
              {
                name: "",
                number: {
                  font: {
                    color: undefined,
                  },
                  prefix: "",
                  valueformat: ",f",
                },
                showlegend: false,
                type: "indicator",
                value: "0",
                visible: true,
              },
            ];
            // setError(true);
            if (traces?.length) {
              removeDuplicateLegends(traces);
              formatTraceText(traces, layout);
            }
            setChartData(traces);
          } else {
            if (traces?.length) {
              setError(false);
              removeDuplicateLegends(traces);
              formatTraceText(traces, layout);
            }
            combinedChart ? setChartData(simplifiedData) : setChartData(traces);
          }
        } catch (e) {
          setError(true);
          console.log(e);
        }
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    }
  };

  useEffect(() => {
    constructData();
  }, [filterValue]);

  useEffect(() => {
    if (input && titleChart) inputEl.current.select();
  }, [input]);

  const saveTitle = () => {
    onTitleChange(titleChart);
    if (titleChart.length) setInput(false);
  };

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          fontFamily: "inherit",
          flexDirection: "column",
        }}
      >
        {!config.hideTitle && (
          <div
            style={{
              display: "flex",
              flex: "1",
              padding: "30px 0px 0px 20px",
              fontSize: "1rem",
              fontWeight: 600,
              justifyContent: "flex-start",
              color: "#616161",
            }}
          >
            {title}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flex: 9,
            alignItems: "flex-start",
            justifyContent: "center",
            fontSize: "90px",
            opacity: 0.7,
            alignItems: "center",
            fontWeight: 400,
          }}
        >
          0
        </div>
      </div>
    );
  } else if (chartData) {
    let ChartComponent = CHART_COMPONENTS[chartData[0]?.type] || Chart;
    return (
      <div
        onMouseOver={() => setHovered(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          flex: 1,
          fontFamily: "inherit",
          flexDirection: "column",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            display: config.hideTitle ? "none" : "flex",
            flex: 1,
            padding: "24px 0px 0px 24px",
            justifyContent: "flex-start",
            fontWeight: 600,
            color: "#616161",
            fontSize: "1rem",
            fontFamily: "inherit",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            width: "85%",
          }}
        >
          {!input ? (
            <>
              <a
                style={{ fontSize: "1rem", cursor: "text" }}
                onClick={() => {
                  config.editable && !config.staticPlot && setInput(true);
                }}
                testid={`ChartTitle-${titleChart}`}
              >
                {titleChart}
              </a>
              <DisplayIcon
                ref={hoverIcon}
                name={Edit}
                onClick={() => {
                  setInput(true);
                }}
                style={{
                  fontSize: "20px",
                  display: "none",
                  padding: "0px 0px 4px 4px",
                }}
              />
            </>
          ) : (
            <textarea
              ref={inputEl}
              style={{
                fontSize: "1rem",
                border: "none",
                outline: "none",
                resize: "none",
                overflow: "hidden",
              }}
              rows="2"
              cols="30"
              onBlur={saveTitle}
              placeHolder="Enter Chart title "
              onKeyDown={(event) => {
                if (event.keyCode === 13 || event.keyCode === 40) saveTitle();
              }}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              testid={`title-${titleChart}`}
              value={titleChart}
            />
          )}
        </div>
        <div style={{ display: "flex", flex: 9 }}>
          <ChartComponent
            style={{ height: "100%", width: "100%" }}
            data={chartData}
            config={config}
            layout={layout}
            plotId={plotId}
            template={template}
            totalTraces={charts.length}
            // onTitleChange={onTitleChange}
          />
        </div>
      </div>
    );
  } else return <BubbleLoader />;
};
