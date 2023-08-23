import { get, isDefined } from "utils/services/helper_services/object_methods";

const NA = "N/A";

export const Adapter = (attribs) => {
  const { trace, response, color } = JSON.parse(JSON.stringify(attribs));
  const {
    chartName: CHARTNAME,
    payload,
    TraceOptions,
    orientation = "v",
    excludeNullValue,
    showTotalCount,
    subCategory,
  } = trace.sys_entityAttributes;
  const { groupBy, lifeCycle = {} } = payload.aggregateOn;
  const { cost, lifecycleId } = lifeCycle;
  const { chartName } = CHARTNAME;
  let { result = [], totalDocuments, currency } = response;
  let traceData = {};

  //Count number of axes
  let totalGroupBy = groupBy ? groupBy.length : 0;
  totalGroupBy = lifecycleId ? totalGroupBy + 1 : totalGroupBy; //LIFECYCLE will internally have a groupby

  const fetchColorSeries = (values) => {
    let { valueColors = [] } = TraceOptions || {};
    let colors = values.map((el) =>
      get(
        valueColors.find((ev) => ev.value === el),
        "color"
      )
    );
    return colors.filter(Boolean).length ? colors : null;
  };

  const FRIENDLY_DATE = ({ year, month, day, hour, minute }) => {
    let DATE_STR = year;
    if (month) DATE_STR = `${DATE_STR}-${month}`;
    if (day) DATE_STR = `${DATE_STR}-${day}`;
    if (hour) DATE_STR = `${DATE_STR} ${hour}`;
    if (minute) DATE_STR = `${DATE_STR}:${minute}`;
    return DATE_STR;
  };

  const INIT_DATA = () => {
    if (subCategory && subCategory.length) {
      let pickedCategory = result.filter((a) =>
        subCategory.map((e) => e.name).includes(a.x1)
      );
      let remainingCount = result
        .filter((a) => !pickedCategory.map((e) => e.x1).includes(a.x1))
        .map((e) => e.y1)
        .reduce((a, b) => a + b, 0);
      let remaniningArray = [{ x1: "Remaining", y1: remainingCount }];
      result = [...pickedCategory, ...remaniningArray];
    }
    // exclude null value
    for (let i = 1; i <= totalGroupBy; i++) {
      if (excludeNullValue)
        result = result.filter((er) => isDefined(er[`x${i}`]));
      else
        result = result.map((er) => {
          if (!isDefined(er[`x${i}`])) er[`x${i}`] = NA;
          return er;
        });
    }

    //append Totals
    if (showTotalCount)
      result = [...result, { x1: "Total", y1: totalDocuments }];

    //convert DATE fields
    let sort = true;
    if (chartName != "HEATMAP" || totalGroupBy > 1) {
      for (let i = 1; i <= totalGroupBy; i++) {
        result = result.map((er) => {
          if (get(er, `x${i}.year`)) {
            er[`x${i}`] = FRIENDLY_DATE(er[`x${i}`]);
            sort = false;
          }
          return er;
        });
        // result =
        //   chartName != "HEATMAP" && sort
        //     ? result.sort((a, b) => (a.x1 > b.x1 ? 1 : -1))
        //     : result;
      }
    }

    //append agencyIds
    if (result?.[0]?.hasOwnProperty("id")) {
      traceData["agencyIds"] = result;
    }
  };

  const PIE_TRACE = (options) => {
    let labels = result.map((e) => e.x1);
    traceData = [
      {
        ...traceData,
        ...options,
        type: "pie",
        textinfo: "value",
        values: result.map((e) => e.y1),
        labels,
        marker: {
          colors: fetchColorSeries(labels),
        },
        ...TraceOptions,
      },
    ];
  };

  const SCATTER_TRACE = (options) => {
    traceData = [
      {
        ...traceData,
        ...options,
        type: "scatter",
        y: result.map((e) => e.y1),
        x: result.map((e) => e.x1),
        ...TraceOptions,
      },
    ];
  };

  const TEXT_TRACE = () => {
    let data = result[0] || {};
    traceData = [
      {
        ...traceData,
        type: "indicator",
        value: `${get(data, "y1", 0)}`,
        ...TraceOptions,
        number: {
          font: {
            color, // theme color if no color from CT
          },
          prefix: cost ? currency : "",
          valueformat: ",f",
          ...get(TraceOptions, "number", {}),
        },
      },
    ];
  };

  const BAR_TRACE = () => {
    let y = result.map((e) => e.x1);
    traceData = [
      {
        ...traceData,
        type: "bar",
        orientation: "h",
        y,
        x: result.map((e) => e.y1),
        marker: {
          color: fetchColorSeries(y),
        },
        ...TraceOptions,
      },
    ];
  };

  const COLUMN_TRACE = () => {
    let x = result.map((e) => e.x1);
    traceData = [
      {
        ...traceData,
        type: "bar",
        y: result.map((e) => e.y1),
        x,
        marker: {
          color: fetchColorSeries(x),
        },
        ...TraceOptions,
      },
    ];
  };

  const GROUPED_TRACE = () => {
    let traceOptions = TraceOptions || [];
    let uniquex1 = [...new Set(result.map((e) => e.x1))];
    let uniquex2 = [...new Set(result.map((e) => e.x2))];

    traceData = uniquex2.map((eachX2, i) => {
      let traces = uniquex1.map((eachX1) => {
        let obj = result.find((er) => er.x1 === eachX1 && er.x2 === eachX2);
        return {
          x: obj?.x1,
          y: obj?.y1,
          colorValue: eachX2,
        };
      });
      let x = traces.map((eachTrace) => eachTrace?.x),
        y = traces.map((eachTrace) => eachTrace?.y),
        value = traces.map((eachTrace) => eachTrace?.colorValue);
      return {
        ...traceData,
        x: orientation == "v" ? x : y,
        y: orientation == "v" ? y : x,
        marker: {
          color: fetchColorSeries(value),
        },
        name: eachX2,
        type: "bar",
        orientation,
        ...traceOptions,
      };
    });
  };

  const TABLE_TRACE = () => {
    traceData = [
      {
        ...traceData,
        TraceOptions,
        type: "table",
        result,
        totalGroupBy,
      },
    ];
  };

  const HEATMAP_TRACE = () => {
    traceData = [
      {
        ...traceData,
        TraceOptions,
        type: "heatmap",
        result: result,
        totalGroupBy,
      },
    ];
  };

  //Generate Traces
  const GENERATE_TRACES = (chartName) => {
    chartName === "TEXT" && TEXT_TRACE();
    chartName === "PIE" && PIE_TRACE();
    chartName === "DONUT" && PIE_TRACE({ hole: 0.4 });
    chartName === "BAR" && BAR_TRACE();
    chartName === "COLUMN" && COLUMN_TRACE();
    ["GROUPED", "STACKED"].includes(chartName) && GROUPED_TRACE();
    chartName === "LINE" &&
      SCATTER_TRACE({ mode: "lines+markers", connectgaps: true });
    chartName === "AREA" && SCATTER_TRACE({ fill: "tozeroy" });
    chartName === "HEATMAP" && HEATMAP_TRACE();
    chartName === "TABLE" && TABLE_TRACE();
  };

  INIT_DATA();
  GENERATE_TRACES(chartName);
  //Generate Traces

  return traceData;
};
