export const initialState = {
  userDefaultBoard: {},
  roleDefaultBoards: [],
  agencyDefaultBoards: [],
  chartObjects: [],
  toolTips: {},
  boardUpdated: false,
  boardSetUpdated: false,
  triggerSave: false,
  editLayout: false,
  savePopup: false,
  chartConfig: {
    layout: {
      title: {
        font: {
          family: "inherit",
          size: 20,
          color: "#212121",
        },
        xref: "container",
        yref: "container",
        x: 0.1,
      },
      modebar: {
        activecolor: "brown",
      },
      colorway: [
        "#97A1D9",
        "#6978C9",
        "#4A5596",
        "#2C3365",
        "#111539",
        "#77C2FE",
        "#249CFF",
        "#1578CF",
        "#0A579E",
        "#003870",
        "#62BEB6",
        "#0B9A8D",
        "#077368",
        "#034D44",
        "#002B24",
        "#F88FB2",
        "#ED5C8B",
        "#D5255E",
        "#A31246",
        "#740030",
        "#E65F8E",
        "#A86BD1",
        "#3AA5D1",
        "#3BB58F",
        "#3A63AD",
        "#82C272",
        "#00A88F",
        "#0087AC",
        "#005FAA",
        "#323B81",
        "#FFCA3E",
        "#FF6F50",
        "#D03454",
        "#9C2162",
        "#772F67",
        "#619ED6",
        "#6BA547",
        "#F7D027",
        "#E48F1B",
        "#B77EA3",
        "#E64345",
        "#60CEED",
        "#9CF168",
        "#F7EA4A",
        "#FBC543",
        "#FFC9ED",
        "#E6696E",
      ],
      autosize: true,
      font: {
        family: "inherit",
      },
      hovermode: "closest",
    },
    config: {
      displaylogo: false,
      toImageButtonOptions: {
        format: "png", // one of png, svg, jpeg, webp
        scale: 1,
      },
      modeBarButtonsToRemove: [
        "lasso2d",
        "select2d",
        "hoverClosestCartesian",
        "hoverCompareCartesian",
        "hoverClosestPie",
        "sendDataToCloud",
        "toggleSpikelines",
        "resetViewMapbox",
      ],
      edits: {
        annotationPosition: false,
        annotationTail: false,
        annotationText: false,
        axisTitleText: false,
        colorbarPosition: false,
        colorbarTitleText: false,
        legendPosition: false,
        legendText: false,
        shapePosition: false,
      },
    },
  },
};