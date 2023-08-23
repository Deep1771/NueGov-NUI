import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useStateValue } from "utils/store/contexts";
import { get } from "utils/services/helper_services/object_methods";
import { SaveModal } from "containers/feature_containers/dashboard_new/board/components/saveModal";
import { URLConstructor } from "../helpers";
import { UserFactory } from "utils/services/factory_services";

export const Heatmap = (props) => {
  let { config, data, layout, plotId, template, onTitleChange } = props;
  let { title, ...layoutOptions } = layout;
  let { staticPlot } = config;
  let { clickable } = template.sys_entityAttributes;
  let type = data?.[0].type;
  let { TraceOptions = {} } = data?.[0];
  const { getUserInfo } = UserFactory();
  const { sys_gUid } = getUserInfo();

  const history = useHistory();
  const [{ dashboardState }] = useStateValue();
  const { boardUpdated } = dashboardState;

  const [saveModal, setSaveModal] = useState({ flag: false });

  let { totalGroupBy } = data?.[0];
  let resultCopy = JSON.parse(JSON.stringify(data?.[0].result));

  const handleClickEvent = (event) => {
    let url = URLConstructor(template, type, event, sys_gUid);
    history.push(url);
  };

  const checkChanges = (event) => {
    if (!staticPlot && boardUpdated)
      setSaveModal({ flag: true, action: event });
    else handleClickEvent(event);
  };

  let isDateField = (value) => typeof value === "object" && value !== null;

  let result = resultCopy.filter((er) => {
    if (isDateField(er.x1) || isDateField(er.x2)) {
      if (er?.x1?.year !== null && (er?.x2?.year !== null || true)) return true;
      else return false;
    } else {
      return true;
    }
  });

  const FRIENDLY_DATE = ({ year, month, day }) => {
    let DATE_STR = year;
    if (month) DATE_STR = `${DATE_STR}-${month}`;
    if (day) DATE_STR = `${DATE_STR}-${day}`;
    return DATE_STR;
  };

  const listOfYears = [...new Set(result.map((ed) => ed.x1.year))]
    .filter(Boolean)
    .sort();
  let traceData = {};
  let bounds = document.getElementById(plotId)?.getBoundingClientRect();

  let constructDataAndLayout = () => {
    if (totalGroupBy > 1) {
      let [traceData, LAYOUT] = nGroupByDataAndLayout();
      return [traceData, LAYOUT];
    } else {
      let dataArray = listOfYears.map((eachYear, i) => {
        return constructSingleYearData(eachYear, i);
      });
      let LAYOUT = {
        ...layoutOptions,
        title: `${title.text}-${listOfYears[0]}`,
        hovermode: "closest",
        yaxis: {
          ticks: "",
          autorange: "reversed",
          tickson: "boundaries",
          mirror: true,
          showline: true,
          linecolor: "#EEEEEE",
        },
        xaxis: {
          ticks: "",
          tickson: "boundaries",
          mirror: true,
          showline: true,
          linecolor: "#EEEEEE",
        },
        updatemenus: [
          {
            y: 1.5,
            yanchor: "auto",
            x: 1,
            xanchor: "left",
            visible: !staticPlot,
            // active : 0,
            pad: { t: 20 },
            showactive: true,
            buttons: listOfYears.map((eachYear, i) => {
              return {
                method: "update",
                args: [
                  {
                    visible: dataArray.map((ed, index) =>
                      index === i ? true : false
                    ),
                    name: eachYear,
                  },
                  { title: `${title.text}-${eachYear}` },
                ],
                label: eachYear,
                execute: true,
              };
            }),
          },
        ],
      };
      return [dataArray, LAYOUT];
    }
  };

  let nGroupByDataAndLayout = () => {
    let uniquex1 = [...new Set(result.map((e) => e.x1))];
    let uniquex2 = [...new Set(result.map((e) => e.x2))];

    let z = uniquex2.map((eachX2) => {
      return uniquex1.map((eachX1) => {
        let value = result.find(
          (eachResult) => eachResult.x1 === eachX1 && eachResult.x2 === eachX2
        );
        return value?.y1 || null;
      });
    });
    // let TraceOptions = {};
    let trace = [
      {
        ...traceData,
        x: uniquex1,
        y: uniquex2,
        z: z,
        type: "heatmap",
        xgap: 2,
        ygap: 2,
        colorscale: [
          [0, "#E8EAF6"],
          [1, "#1A237E"],
        ],
        hoverongaps: false,
        hovermode: "closest",
        hoverinfo: "all",
        ...TraceOptions,
      },
    ];

    return [trace, layout];
  };

  let constructSingleYearData = (year, i) => {
    for (let i = 1; i <= totalGroupBy; i++) {
      result = result.map((er) => {
        if (get(er, `x${i}.year`)) er[`x${i}`] = FRIENDLY_DATE(er[`x${i}`]);
        return er;
      });
    }
    let filterResponse = result.filter((er) =>
      er?.x1.includes(year.toString())
    );
    let MONTH_LABELS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let WEEK_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let MILLISECONDS_IN_ONE_DAY = 3600 * 24 * 1000;

    let getStartDateInResponse = () => new Date(filterResponse?.[0]?.x1);
    let getEndDateInResponse = () =>
      new Date(filterResponse?.[filterResponse.length - 1]?.x1);

    let getStartDateOfYear = () => new Date(`${year}`);
    let getEndDateOfYear = () => new Date(`${year}-12-31`);

    let numOfEmptyDaysAtEnd = 7 - 1 - getEndDateOfYear().getDay();
    let numOfEmptyDaysAtStart = getStartDateOfYear().getDay();

    let getDateDifferenceInDays = () => {
      const timeDiff =
        getEndDateOfYear().getTime() - getStartDateOfYear().getTime();
      return Math.ceil(timeDiff / MILLISECONDS_IN_ONE_DAY);
    };

    let getStartDateInMap = () => {
      const responseStartDateinMS =
        getStartDateOfYear().getTime() -
        numOfEmptyDaysAtStart * MILLISECONDS_IN_ONE_DAY;
      return new Date(responseStartDateinMS);
    };

    let getEndDateInMap = () => {
      const responseEndDateinMS =
        getEndDateOfYear().getTime() +
        numOfEmptyDaysAtEnd * MILLISECONDS_IN_ONE_DAY;
      return new Date(responseEndDateinMS);
    };

    let getTotalWeeksCount = () => {
      const numOfDaysRoundedToWeek =
        getDateDifferenceInDays() + numOfEmptyDaysAtStart + numOfEmptyDaysAtEnd;
      return Math.ceil(numOfDaysRoundedToWeek / 7);
    };

    let getDateByDayAndWeekIndex = (dayIndex, weekIndex) => {
      let year = getStartDateInMap().getFullYear(),
        month = getStartDateInMap().getMonth(),
        day = getStartDateInMap().getDate() + (++dayIndex + weekIndex * 7);

      let date = new Date(year, month, day - 1).toDateString();
      return date;
    };

    let getMonthLabelsByWeekIndex = (weekIndex) => {
      let year = getStartDateInMap().getFullYear(),
        month = getStartDateInMap().getMonth(),
        startdayIndex = getStartDateInMap().getDate() + weekIndex * 7,
        enddayIndex = getStartDateInMap().getDate() + 6 + weekIndex * 7;

      let startDay = new Date(year, month, startdayIndex),
        endDay = new Date(year, month, enddayIndex);
      let startDayMonth = startDay.getMonth(),
        endDayMonth = endDay.getMonth();
      return {
        label: `${startDay.getDate()} ${
          MONTH_LABELS[startDayMonth]
        }-${endDay.getDate()} ${MONTH_LABELS[endDayMonth]}`,
      };
    };

    let z = [...Array(7).keys()].map((dayIndex) => {
      return [...Array(getTotalWeeksCount()).keys()].map((weekIndex) => {
        let dateExist = filterResponse.find(
          (er) =>
            new Date(er?.x1).toDateString() ==
            getDateByDayAndWeekIndex(dayIndex, weekIndex)
        );
        if (dateExist) return dateExist.y1 || null;
        else return null;
      });
    });

    let text = [...Array(7).keys()].map((dayIndex) => {
      return [...Array(getTotalWeeksCount()).keys()].map((weekIndex) => {
        return getDateByDayAndWeekIndex(dayIndex, weekIndex);
      });
    });

    let x = [...Array(getTotalWeeksCount()).keys()].map((weekIndex) => {
      return getMonthLabelsByWeekIndex(weekIndex);
    });

    traceData = {
      ...traceData,
      name: year,
      x: x.map((eachX) => eachX.label),
      y: WEEK_LABELS,
      z: z,
      type: "heatmap",
      xgap: 2,
      ygap: 2,
      colorscale: [
        [0, "#E8EAF6"],
        [1, "#206e38"],
      ],
      hoverongaps: false,
      hoverinfo: "z+text",
      hovermode: "closest",
      xperiodalignment: "start",
      visible: i === 0,
      text: text,
      ...TraceOptions,
    };

    return traceData;
  };

  //Use Effects
  useEffect(() => {
    let [TRACEDATA, LAYOUT] = constructDataAndLayout();
    window.Plotly.newPlot(plotId, TRACEDATA, LAYOUT, config);
  }, []);

  useEffect(() => {
    let [TRACEDATA, LAYOUT] = constructDataAndLayout();
    window.Plotly.newPlot(plotId, TRACEDATA, LAYOUT, config);
    let myPlot = document.getElementById(plotId);
    //click event
    if (clickable !== false)
      myPlot.on("plotly_click", (event) => checkChanges(event));
    //title change
    myPlot.on("plotly_relayout", (event) => {
      if (event && event["title.text"])
        onTitleChange && onTitleChange(event["title.text"]);
    });
  });

  return (
    <>
      <div id={plotId} style={{ height: "100%", width: "100%" }}></div>
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
