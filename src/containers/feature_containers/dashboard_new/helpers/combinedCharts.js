const isDefined = (variable) =>
  !(typeof variable === "undefined" || variable === null || variable === "");
let uniqueValue = [];
let uiqueXaxis = [];
let traceNames = [];
let anchors = [];

const getIntervals = (intervals) => {
  let intervalDiff = 1 / intervals;
  let arrVal = [];
  for (let i = 0; i <= intervals; i++) {
    arrVal.push(i * intervalDiff);
  }
  let realIntervals = [];
  arrVal.reduce((prev, curr) => {
    realIntervals.push([prev, curr]);
    return curr;
  });
  return realIntervals;
};

const dataCleanUp = (data, template) => {
  let { sys_components, sys_entityAttributes } = template || {};
  let cleanData = data.map((el, index) => {
    let { result } = el;

    let traceName = sys_components.find((fl) => fl.componentId === el.traceId);
    traceName = traceName
      ? traceName?.sys_entityAttributes?.TraceOptions?.name
      : "";

    let cleanResult;
    // exclude null value
    for (let i = 1; i <= 2; i++) {
      cleanResult = result.filter((er) => isDefined(er[`x${i}`]));
    }
    uiqueXaxis = [...uiqueXaxis, ...cleanResult.map((el) => el.x1)];
    uiqueXaxis = [...new Set(uiqueXaxis)];
    uniqueValue = [...new Set(cleanResult.map((el) => el.x2))];
    return {
      ...el,
      result: cleanResult,
      name: traceName,
    };
  });
  traceNames = cleanData.map((el) => el.name);
  return cleanData;
};

const getXaxisObject = (intervals) => {
  let xaxisObject = {
    barmode: "stack",
  };

  let res = uiqueXaxis.reduce((prev, curr) => {
    let index = uiqueXaxis.findIndex((fl) => fl === curr);
    anchors.push({
      title: curr,
      value: `x${index + 1}`,
    });
    return {
      ...prev,
      [`xaxis${index + 1}`]: {
        domain: intervals[index],
        anchor: `x${index + 1}`,
        title: curr,
      },
    };
  }, {});

  let simplifiedXaxis = { ...xaxisObject, ...res };
  return simplifiedXaxis;
};

const getYaxisArray = (data) => {
  let yAxisValues = [];
  anchors.map((el) => {
    return uniqueValue.map((el2) => {
      yAxisValues.push({
        x: traceNames,
        y: [],
        type: "bar",
        name: el2,
        xaxis: el.value,
      });
    });
  });

  yAxisValues = yAxisValues.map((el) => {
    let x1 = anchors.find((fl) => fl.value == el.xaxis)?.title;
    let x2 = el.name;
    let trace1Value = data[0]?.result?.find(
      (fl) => fl.x1 === x1 && fl.x2 === x2
    )?.y1;
    let trace2Value = data[1]?.result?.find(
      (fl) => fl.x1 === x1 && fl.x2 === x2
    )?.y1;
    return (el = {
      ...el,
      y: [trace1Value ? trace1Value : "N/A", trace2Value ? trace2Value : "N/A"],
    });
  });

  return yAxisValues;
};

export const combinedChartData = (info) => {
  let { response, template } = info || {};
  response = dataCleanUp(response, template);

  //this interval divides the x axis
  let intervals = getIntervals(uiqueXaxis.length);

  let simplifiedXaxis = getXaxisObject(intervals);
  let simplifiedYaxis = getYaxisArray(response);

  return [
    {
      type: "bar",
      simplifiedXaxis: simplifiedXaxis,
      simplifiedYaxis: simplifiedYaxis,
    },
  ];
};
