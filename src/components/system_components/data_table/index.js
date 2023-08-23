import React, { useState, useEffect, useReducer } from "react";
import moment from "moment";
import { eachDayOfInterval, format } from "date-fns";
import { get } from "utils/services/helper_services/object_methods";
import {
  entity,
  entityCount,
} from "utils/services/api_services/entity_service";
import { dashboard } from "utils/services/api_services/dashboard_service";
import { BubbleLoader } from "components/helper_components";
import { ChartIterator } from "containers/feature_containers/dashboard_new/chart_components/chart_iterator";
import {
  DisplayDataTable,
  DisplayDateTimePicker,
  DisplayFormControl,
  DisplayGrid,
  DisplayPagination,
  DisplayRadioGroup,
  DisplayRadiobox,
  DisplaySelect,
  DisplayButton,
  DisplayText,
  DisplayHelperText,
} from "components/display_components";
import { GridWrapper } from "components/wrapper_components";
import { reducer } from "./reducer";
import { SystemLabel } from "../index";
import { ToolTipWrapper } from "components/wrapper_components";

const initValue = (data) => {
  return data;
};

export const SystemDataTable = (props) => {
  const { data, fieldmeta, testid, formData, callbackValue, ...rest } = props;
  const {
    title,
    info,
    dataSource,
    showTotals,
    description,
    dateFormat,
    pdfLabel,
    labels,
  } = fieldmeta;

  const [state, dispatch] = useReducer(reducer, {}, initValue);

  const [filteredHeader, setFilteredHeader] = useState([]);
  const [filters, setFilters] = useState({});
  const [finalQuery, setFinalQuery] = useState(null);
  const [limit, setLimit] = useState(10);
  const [loader, setLoader] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pickers, setPickers] = useState(false);
  const [timePickers, setTimePickers] = useState(false);
  const [range, setRange] = useState({});
  const [selectedHeader, setSelectedHeader] = useState(
    data && data.headers && data.headers.length ? data.headers : []
  );
  const [selectedInterval, setSelectedInterval] = useState(15);
  const [showInterval, setShowInterval] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [totalCount, setTotalCount] = useState();

  const INTERVAL = [
    {
      title: "15",
      id: 15,
    },
    {
      title: "30",
      id: 30,
    },
    {
      title: "45",
      id: 45,
    },
  ];

  let filtersOfInterest = [];
  if (["ANALYTICS", "ENTITY"].includes(dataSource)) {
    let filtersData = [];
    let { sourceInfo } = fieldmeta;
    let { filters } = sourceInfo;
    if (filters && filters.length) {
      filters.map((ef) => {
        if (ef.dataPath) {
          let data = get(formData, ef.dataPath);
          if (data) {
            filtersData.push(data);
          }
        }
      });
    }
    if (
      dataSource == "ANALYTICS" &&
      sourceInfo.rowGrouping &&
      sourceInfo.rowGrouping.min &&
      sourceInfo.rowGrouping.max
    ) {
      let start = get(formData, sourceInfo.rowGrouping.min);
      let end = get(formData, sourceInfo.rowGrouping.max);
      if (start && end && end > start) {
        filtersData = [...filtersData, start, end];
      }
    } else if (
      dataSource == "ANALYTICS" &&
      sourceInfo.rowGrouping &&
      sourceInfo.rowGrouping.equals
    ) {
      let date = get(formData, sourceInfo.rowGrouping.equals);
      if (date) {
        filtersData = [...filtersData, date];
      }
    }
    filtersOfInterest = [...filtersOfInterest, filtersData];
  }

  const onPageChange = (e, page) => {
    setFilters({
      ...filters,
      page,
    });
  };

  const defaultData = () => {
    setLoader(false);
    const { sourceInfo } = fieldmeta;
    const { data, headers } = sourceInfo;
    setTableData({ data, headers });
  };

  const entityData = async () => {
    setTableData(null);
    const { sourceInfo } = fieldmeta;
    const {
      appName,
      moduleName,
      entityName,
      limit,
      headers,
      agencyFilters,
      filters: FILTERS,
    } = sourceInfo;
    setLimit(limit);
    let { page, ...rest } = filters;
    let Query = {
      appname: appName,
      modulename: moduleName,
      entityname: entityName,
    };

    let entityParams = {
      ...Query,
      skip: page ? (page - 1) * limit : 0,
      limit: limit,
      ...rest,
    };

    let countParams = { ...Query, ...rest };

    if (agencyFilters) {
      entityParams.sys_agencyId = JSON.stringify(agencyFilters.map((i) => i));
      countParams.sys_agencyId = JSON.stringify(agencyFilters.map((i) => i));
    }
    if (FILTERS) {
      FILTERS.map((ef) => {
        if (ef.dataPath || ef.data) {
          let data = get(formData, ef.dataPath || " ", ef.data);
          if (data) {
            entityParams[`${ef.name}`] = data;
            countParams[`${ef.name}`] = data;
          }
        }
      });
    }

    let [data, { data: totalCount }] = await Promise.all([
      entity.get(entityParams),
      entityCount.get(countParams),
    ]);
    if (data) {
      setLoader(false);
      setTableData({ data, headers });
      setTotalCount(totalCount);
    }
  };

  const makeTimeIntervals = (increment) => {
    let value = {
      interval: `00:${increment}:00`,
      startTime:
        state.startDateTime &&
        (
          state.startDateTime.getHours() +
          ":" +
          state.startDateTime.getMinutes()
        ).toString(),
      endTime:
        state.endDateTime &&
        (
          state.endDateTime.getHours() +
          ":" +
          state.endDateTime.getMinutes()
        ).toString(),
    };
    var inputDataFormat = "HH:mm";
    var outputFormat = "HH:mm";

    var tmp = moment(value.interval, inputDataFormat);
    var dif = tmp - moment().startOf("day");

    var startIntervalTime = moment(value.startTime, inputDataFormat).add(
      -dif,
      "ms"
    );
    var endIntervalTime = moment(value.startTime, inputDataFormat);
    var finishTime = moment(value.endTime, inputDataFormat);

    var intervals = [];
    while (startIntervalTime < finishTime) {
      var format =
        startIntervalTime.format(outputFormat) +
        " - " +
        endIntervalTime.format(outputFormat);
      intervals.push(format);
      startIntervalTime.add(dif, "ms");
      endIntervalTime.add(dif, "ms");
    }
    intervals.shift();
    return intervals;
  };

  const constructTimeArray = (SPAN) => {
    let intervalArray = [];
    if (state.startDateTime && state.endDateTime && SPAN) {
      var dateToPush = new Date(state.startDateTime.getTime());
      do {
        intervalArray.push(
          intervalArray.length == 0 ? state.startDateTime : dateToPush
        );
        dateToPush = new Date(dateToPush.getTime() + SPAN * 1000 * 60);
      } while (
        new Date(dateToPush.getTime()) < new Date(state.endDateTime.getTime())
      );
    }
    return intervalArray;
  };

  let alterFilter = (query, intervalArray) => {
    let TIME = [];
    if (intervalArray) {
      intervalArray.map((time) => {
        TIME.push({
          ...query,
          filters: query.filters.map((filter) => {
            if (filter) {
              if (
                get(filter, "values.min", "DATA") === "RANGE_DATA" &&
                get(filter, "values.max", "DATA") === "RANGE_DATA"
              ) {
                return {
                  ...filter,
                  values: {
                    min: new Date(time).toISOString(),
                    max: moment(new Date(time).toISOString()).add({
                      minutes: selectedInterval - 1,
                      seconds: 59,
                      milliseconds: 999,
                    }),
                  },
                };
              } else if (get(filter, "values.min", "DATA") === "RANGE_DATA") {
                return {
                  ...filter,
                  values: {
                    min: new Date(time).toISOString(),
                  },
                };
              } else {
                return {
                  ...filter,
                };
              }
            }
          }),
        });
      });
      return TIME;
    }
  };

  const getChartTemplate = (timeArray, timeIntervals, Difference_In_Days) => {
    let res = {
      sys_entityAttributes: {
        configOptions: { hideTitle: true },
        layoutOptions: {
          showTotals: true,
          showEmptyTraces: true,
          categoryLabel: get(fieldmeta, "sourceInfo.rowGrouping.title"),
          pdfLabel: constructPdfLabel(),
          pdfButtonLabel: labels?.pdfButton,
        },
        title: fieldmeta.title,
      },
      _id: "123",
    };

    let compObj = {
      componentName: "Traces",
      componentId: "",
      sys_entityAttributes: {
        TraceOptions: { label: "" },
        payload: {},
        chartName: { chartName: "TABLE" },
      },
    };

    let finalObj = {
      ...res,
      sys_components: timeArray.map((val, index) => {
        let interval = timeIntervals.length && timeIntervals[index];
        return {
          ...compObj,
          componentId: index,
          sys_entityAttributes: {
            ...compObj.sys_entityAttributes,
            payload: val,
            TraceOptions: {
              label:
                Difference_In_Days < 1
                  ? timeIntervals.length && interval
                  : format(interval, "MM/dd/yyyy"),
            },
          },
        };
      }),
    };
    return finalObj;
  };

  const constructQuery = ({
    appName,
    moduleName,
    entityName,
    agencyFilters,
    headers,
    filters,
    rowGrouping,
    Difference_In_Days,
  }) => {
    let queryObj = {
      appName: appName,
      moduleName: moduleName,
      entityName: entityName,
      aggregateOn: {
        aggregate: [
          {
            name: "_id",
            title: "TOTAL COUNT",
            class: "TOPLEVEL",
            path: "_id",
            method: "TOTALCOUNT",
            methodTitle: "Total Count",
          },
        ],
      },
    };
    if (agencyFilters) {
      queryObj.agencyFilter = agencyFilters;
    }

    let alteredQuery = {
      ...queryObj,
      aggregateOn: {
        ...queryObj.aggregateOn,
        groupBy: headers.map((header) => {
          return {
            path: `sys_entityAttributes.${header.name}`,
            class: "TOPLEVEL",
            ...header,
          };
        }),
      },
      filters: constructFilters(
        filters,
        rowGrouping,
        headers,
        Difference_In_Days
      ),
    };
    return alteredQuery;
  };

  const constructFilters = (
    filters,
    rowGrouping,
    headers,
    Difference_In_Days
  ) => {
    let array = [];
    if (filters) {
      filters.map((filter) => {
        if (filter.values && (filter.dataPath || filter.data)) {
          let data = get(formData, filter.dataPath || "", filter.data);
          if (data) {
            Object.keys(filter.values).map((ef) => {
              filter.values[ef] = data;
            });
            array.push({
              path: `sys_entityAttributes.${filter.name}`,
              class: "TOPLEVEL",
              ...filter,
            });
          }
        } else {
          array.push({
            path: `sys_entityAttributes.${filter.name}`,
            class: "TOPLEVEL",
            ...filter,
          });
        }
      });
    }
    if (rowGrouping) {
      if (Difference_In_Days && Difference_In_Days < 1) {
        array.push({
          name: rowGrouping.name,
          path: `sys_entityAttributes.${rowGrouping.name}`,
          class: "TOPLEVEL",
          values: {
            min: "RANGE_DATA",
            max: "RANGE_DATA",
          },
          strictMatch: true,
        });
      } else if (Difference_In_Days && Difference_In_Days >= 1) {
        array.push({
          name: rowGrouping.name,
          units: "DAY",
          path: `sys_entityAttributes.${rowGrouping.name}`,
          class: "TOPLEVEL",
          values: {
            min: "RANGE_DATA",
          },
          span: 1,
          strictMatch: true,
        });
      }
    }
    if (headers) {
      let header = headers[headers.length - 1];
      let head = [];
      filteredHeader && filteredHeader.map((val) => head.push(val.value));
      array.push({
        name: header.name,
        path: `sys_entityAttributes.${header.name}`,
        class: "TOPLEVEL",
        values: {
          includes: selectedHeader.length ? selectedHeader : head,
        },
        strictMatch: true,
      });
    }
    return array;
  };

  const analyticsData = () => {
    setLoader(true);
    setFinalQuery(null);
    const { sourceInfo } = fieldmeta;
    const {
      appName,
      moduleName,
      entityName,
      agencyFilters,
      headers,
      filters,
      rowGrouping,
    } = sourceInfo;
    if (rowGrouping) {
      setShowInterval(true);
    }
    if (rowGrouping) {
      setPickers(true);
      setTimePickers(rowGrouping && !rowGrouping.hidden ? true : false);
      var Difference_In_Time =
        new Date(state.endDateTime).getTime() -
        new Date(state.startDateTime).getTime();
      var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
      let queryObj = constructQuery({
        appName,
        moduleName,
        entityName,
        agencyFilters,
        headers,
        filters,
        rowGrouping,
        Difference_In_Days,
      });

      if (
        state.endDateTime > state.startDateTime &&
        selectedInterval &&
        selectedHeader.length &&
        Difference_In_Days < 1
      ) {
        let timeIntervals = makeTimeIntervals(selectedInterval);
        let timeArr = constructTimeArray(selectedInterval);
        let alteredFilter = alterFilter(queryObj, timeArr);
        if (alteredFilter && timeIntervals) {
          let finalPayload = getChartTemplate(
            alteredFilter,
            timeIntervals,
            Difference_In_Days
          );
          finalPayload && setFinalQuery(finalPayload);

          setTimeout(() => {
            setLoader(false);
          }, 1000);
        }
      } else if (Difference_In_Days >= 1) {
        setShowInterval(false);
        let datesArray = eachDayOfInterval({
          start: new Date(state.startDateTime),
          end: new Date(state.endDateTime),
        });
        let alteredFilter = alterFilter(queryObj, datesArray);
        if (alteredFilter && datesArray) {
          let finalPayload = getChartTemplate(
            alteredFilter,
            datesArray,
            Difference_In_Days
          );
          finalPayload && setFinalQuery(finalPayload);
          setTimeout(() => {
            setLoader(false);
          }, 1000);
        }
      }
    } else {
      let queryObj = constructQuery({
        appName,
        moduleName,
        entityName,
        agencyFilters,
        headers,
        filters,
      });
      let finalPayload = getChartTemplate([queryObj], []);
      finalPayload && setFinalQuery(finalPayload);
      setTimeout(() => {
        setLoader(false);
      }, 1000);
    }
  };

  const iterator = () => {
    switch (dataSource) {
      case "DEFAULT": {
        return defaultData();
      }
      case "ENTITY": {
        return entityData();
      }
      case "ANALYTICS": {
        return analyticsData();
      }
    }
  };

  const getAllHeaders = async ({
    appName,
    moduleName,
    entityName,
    headers,
  }) => {
    let header = headers[headers.length - 1];
    let queryObj = [
      {
        appName: appName,
        moduleName: moduleName,
        entityName: entityName,
        aggregateOn: {
          aggregate: [
            {
              path: `sys_entityAttributes.${header.name}`,
              class: "TOPLEVEL",
              method: "DISTINCT",
              ...header,
            },
          ],
          groupBy: [
            {
              path: `sys_entityAttributes.${header.name}`,
              class: "TOPLEVEL",
              ...header,
            },
          ],
        },
        chartName: "TABLE",
        traceId: 0,
      },
    ];
    await dashboard.create({ id: "123" }, queryObj).then((res) => {
      let result = res && JSON.parse(res.response);
      result &&
        result.map((val) => {
          let headerArray = [];
          val.result &&
            val.result.map((data) => {
              headerArray.push({ value: data.x1, id: data.x1 });
            });
          setFilteredHeader(headerArray);
        });
    });
  };

  const constructPdfLabel = () => {
    if (pdfLabel && pdfLabel.length) {
      let pdfLabelArray = [];
      pickers &&
        dataSource == "ANALYTICS" &&
        state.startDateTime &&
        state.endDateTime &&
        pdfLabelArray.push({
          title: "",
          data: `${moment(state.startDateTime).format(
            "MM/DD/YYYY hh:mm a"
          )} - ${moment(state.endDateTime).format("MM/DD/YYYY hh:mm a")}`,
        });
      pdfLabel.map((val) => {
        if (val.dataPath) {
          let data = get(formData, val.dataPath);
          data && pdfLabelArray.push({ title: val?.title, data: data });
        }
      });
      return pdfLabelArray;
    }
  };

  useEffect(() => {
    if (data && data.startDateTime && data.endDateTime) {
      dispatch({
        type: "SET_START_DATETIME",
        payload: new Date(data.startDateTime),
      });
      dispatch({
        type: "SET_END_DATETIME",
        payload: new Date(data.endDateTime),
      });
      dispatch({ type: "SET_HEADERS", payload: data.headers });
    } else {
      let currentDate = new Date();
      var mins = currentDate.getMinutes();
      var hrs = currentDate.getHours();
      var m = (Math.round(mins / 15) * 15) % 60;
      m = m < 10 ? "0" + m : m;
      var h = mins > 52 ? (hrs === 23 ? 0 : ++hrs) : hrs;
      h = h < 10 ? "0" + h : h;
      currentDate.setMinutes(m);
      currentDate.setHours(h);
      currentDate.setSeconds(0, 0);
      let startTimeSet = new Date(currentDate);
      startTimeSet.setMinutes(currentDate.getMinutes() - 60);
      dispatch({ type: "SET_START_DATETIME", payload: startTimeSet });
      dispatch({ type: "SET_END_DATETIME", payload: currentDate });
    }
    if (dataSource == "ANALYTICS") {
      const { sourceInfo } = fieldmeta;
      const { appName, moduleName, entityName, headers } = sourceInfo;
      getAllHeaders({ appName, moduleName, entityName, headers });
    }
  }, []);

  useEffect(() => {
    if (
      state &&
      state.endDateTime > state.startDateTime &&
      dataSource == "ANALYTICS" &&
      selectedHeader.length
    ) {
      analyticsData();
    }
  }, [
    state?.startDateTime,
    state?.endDateTime,
    selectedHeader,
    selectedInterval,
    JSON.stringify(filtersOfInterest),
  ]);

  useEffect(() => {
    var Difference_In_Time =
      new Date(state.endDateTime).getTime() -
      new Date(state.startDateTime).getTime();
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    Difference_In_Days >= 1 ? setShowInterval(false) : setShowInterval(true);
  }, [state?.startDateTime, state?.endDateTime]);

  useEffect(() => {
    if (filtersOfInterest.length) {
      let { sourceInfo } = fieldmeta;
      if (
        dataSource == "ANALYTICS" &&
        sourceInfo.rowGrouping &&
        sourceInfo.rowGrouping.min
      ) {
        let start = get(formData, sourceInfo.rowGrouping.min);
        let end = get(formData, sourceInfo.rowGrouping.max);
        setRange({ startDate: start, endDate: end });
        if (
          start &&
          end &&
          end > start &&
          (!data ||
            data.startDateTime >= new Date(start) ||
            data.endDateTime <= new Date(end))
        ) {
          if (moment(new Date()).isBetween(start, end)) {
            dispatch({
              type: "SET_START_DATETIME",
              payload: new Date(new Date().setHours(0, 0, 0)),
            });
            dispatch({
              type: "SET_END_DATETIME",
              payload: new Date(new Date().setHours(23, 59, 0)),
            });
          } else {
            dispatch({
              type: "SET_START_DATETIME",
              payload: new Date(new Date(start).setHours(0, 0, 0)),
            });
            dispatch({
              type: "SET_END_DATETIME",
              payload: new Date(new Date(start).setHours(23, 59, 0)),
            });
          }
        }
      } else if (
        dataSource == "ANALYTICS" &&
        sourceInfo.rowGrouping &&
        sourceInfo.rowGrouping.equals
      ) {
        let date = get(formData, sourceInfo.rowGrouping.equals);
        setRange({ startDate: date, endDate: date });
        if (date) {
          dispatch({
            type: "SET_START_DATETIME",
            payload: new Date(new Date(date).setHours(0, 0, 0)),
          });
          dispatch({
            type: "SET_END_DATETIME",
            payload: new Date(new Date(date).setHours(23, 59, 0)),
          });
        }
      }
    }
  }, [JSON.stringify(filtersOfInterest)]);

  useEffect(() => {
    if (mounted && filtersOfInterest.length) {
      dataSource == "ENTITY" && tableData && entityData() && setLoader(true);
    }
  }, [JSON.stringify(filtersOfInterest)]);

  useEffect(() => {
    mounted && dataSource == "ENTITY" && entityData() && setLoader(true);
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    iterator();
    setMounted(true);
  }, [fieldmeta.name]);

  useEffect(() => {
    dispatch({
      type: "SET_HEADERS",
      payload: selectedHeader ? selectedHeader : [],
    });
  }, [selectedHeader]);

  useEffect(() => {
    if (data) {
      dispatch({
        type: "SET_START_DATETIME",
        payload: new Date(data.startDateTime),
      });
      dispatch({
        type: "SET_END_DATETIME",
        payload: new Date(data.endDateTime),
      });
      dispatch({ type: "SET_HEADERS", payload: data.headers });
    }
  }, [data]);

  useEffect(() => {
    pickers && callbackValue(Object.keys(state).length ? state : null, props);
  }, [state]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
      }}
    >
      <DisplayFormControl
        disabled={false}
        required={false}
        error={false}
        testid={testid}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flex: 1 }}>
            <SystemLabel
              toolTipMsg={info}
              required={false}
              error={false}
              filled={true}
            >
              {title}
            </SystemLabel>
          </div>
          <div
            style={{
              flexShrink: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <DisplayButton
              testId={"refresh"}
              size="small"
              onClick={() => {
                analyticsData();
              }}
            >
              {labels?.refreshButton}
            </DisplayButton>
          </div>
        </div>
        <div className="system-component">
          <DisplayGrid
            container
            style={{
              display: "flex",
              flex: 9,
              flexDirection: "column",
              width: "100%",
              height: "100%",
            }}
          >
            <DisplayGrid container>
              {filteredHeader.length > 0 && (
                <DisplayGrid item container xs={9}>
                  <DisplayGrid
                    item
                    xs={11}
                    style={{
                      display: "flex",
                      flex: 3,
                      flexDirection: "column",
                      height: "100%",
                      margin: "0.5rem 0.5rem 0.5rem 0",
                    }}
                  >
                    <DisplayGrid
                      style={{
                        color: "grey",
                        fontSize: "14px",
                        paddingBottom: "0.2rem",
                      }}
                    >
                      {labels && labels.filters
                        ? labels.filters
                        : "Filter Table Columns"}{" "}
                    </DisplayGrid>
                    <DisplaySelect
                      variant="outlined"
                      labelKey="value"
                      valueKey="id"
                      values={filteredHeader ? filteredHeader : ""}
                      onChange={(value) => setSelectedHeader(value)}
                      value={selectedHeader ? selectedHeader : ""}
                      multiple={true}
                      // displayChip = {false}
                      MenuProps={{ style: { zIndex: 10001, height: "400px" } }}
                      filled={selectedHeader}
                      required={true}
                      testId={"filters-select"}
                      placeholder="None"
                      showNone={false}
                    />
                    <div className="system-helpertext">
                      {selectedHeader.length <= 0 && (
                        <DisplayHelperText style={{ color: "grey" }}>
                          {labels && labels.filters
                            ? `Select ${labels.filters}`
                            : "Select headers to preview data"}
                        </DisplayHelperText>
                      )}
                    </div>
                  </DisplayGrid>
                  <DisplayGrid item xs={1} />
                </DisplayGrid>
              )}
              {dataSource == "ANALYTICS" && showInterval && (
                <DisplayGrid item container xs={3}>
                  <DisplayGrid
                    item
                    xs={10}
                    style={{
                      display: "flex",
                      flex: 3,
                      flexDirection: "column",
                      width: "100%",
                      height: "100%",
                      margin: "0.5rem 0.5rem 0.5rem 0",
                    }}
                  >
                    <DisplayGrid
                      style={{
                        paddingBottom: "0.2rem",
                        color: "grey",
                        fontSize: "14px",
                      }}
                    >
                      {labels && labels.interval
                        ? labels.interval
                        : "Time Interval in Minutes"}
                    </DisplayGrid>
                    <DisplayGrid>
                      <DisplayRadioGroup value={selectedInterval} row>
                        {INTERVAL.map((val, i) => (
                          <DisplayRadiobox
                            key={i}
                            testid={"radioBox" + "-" + val.id}
                            label={val.title}
                            value={val.id}
                            onChange={(val) => setSelectedInterval(val)}
                          />
                        ))}
                      </DisplayRadioGroup>
                    </DisplayGrid>
                  </DisplayGrid>
                </DisplayGrid>
              )}
            </DisplayGrid>
            &nbsp;
            <ToolTipWrapper
              title={
                fieldmeta?.description?.length > 57
                  ? fieldmeta?.description
                  : ""
              }
              placement="bottom-start"
            >
              <div
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "pre",
                  maxWidth: "100%",
                  fontSize: "11px",
                  opacity: "0.65",
                  height: "16px",
                }}
              >
                <DisplayText
                  style={{
                    fontSize: "11px",
                  }}
                >
                  {fieldmeta?.description}
                </DisplayText>
              </div>
            </ToolTipWrapper>
            {timePickers && dataSource == "ANALYTICS" && (
              <>
                <br />
                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <DisplayText
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                    variant={"h2"}
                  >
                    <SystemLabel
                      toolTipMsg={info}
                      required={false}
                      error={false}
                    >
                      {description}
                    </SystemLabel>
                  </DisplayText>
                </div>
                <DisplayGrid
                  item
                  style={{
                    display: "flex",
                    flex: 9,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <DisplayGrid
                    item
                    style={{
                      display: "flex",
                      flex: 3,
                      flexDirection: "column",
                      width: "100%",
                      height: "100%",
                      margin: "0.5rem 0.5rem 0.5rem 0",
                    }}
                  >
                    <DisplayGrid
                      style={{
                        color: "grey",
                        fontSize: "14px",
                        paddingBottom: "0.2rem",
                      }}
                    >
                      {labels && labels.startDate
                        ? labels.startDate
                        : "Start Date Time"}{" "}
                    </DisplayGrid>
                    <DisplayDateTimePicker
                      inputVariant="outlined"
                      InputAdornmentProps={{ position: "start" }}
                      value={state?.startDateTime}
                      onChange={(value) => {
                        let data = new Date(value).setSeconds(0, 0);
                        dispatch({
                          type: "SET_START_DATETIME",
                          payload: new Date(data),
                        });
                      }}
                      DialogProps={{ style: { zIndex: 10001 } }}
                      testId={"startDate"}
                      minDate={range?.startDate}
                      maxDate={range?.endDate}
                      format={dateFormat ? dateFormat : "MM-dd-yyyy hh:mm a"}
                      minutesStep={15}
                    />
                  </DisplayGrid>
                  <DisplayGrid
                    item
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 3,
                      width: "100%",
                      height: "100%",
                      margin: "0.5rem 0.5rem 0.5rem 0",
                    }}
                  >
                    <DisplayGrid
                      style={{
                        color: "grey",
                        fontSize: "14px",
                        paddingBottom: "0.2rem",
                      }}
                    >
                      {labels && labels.endDate
                        ? labels.endDate
                        : "End Date Time"}{" "}
                    </DisplayGrid>
                    <DisplayDateTimePicker
                      inputVariant="outlined"
                      InputAdornmentProps={{ position: "start" }}
                      value={state?.endDateTime}
                      onChange={(value) => {
                        let data = new Date(value).setSeconds(0, 0);
                        dispatch({
                          type: "SET_END_DATETIME",
                          payload: new Date(data),
                        });
                      }}
                      DialogProps={{ style: { zIndex: 10001 } }}
                      testId={"endDate"}
                      minDate={range?.startDate}
                      maxDate={range?.endDate}
                      format={dateFormat ? dateFormat : "MM-dd-yyyy hh:mm a"}
                      minutesStep={15}
                      error={
                        state.endDateTime < state.startDateTime ? true : false
                      }
                      helperText={
                        state.endDateTime < state.startDateTime
                          ? "End Date Time should always be greater than Start time"
                          : ""
                      }
                    />
                  </DisplayGrid>
                </DisplayGrid>
              </>
            )}
            {dataSource == "ANALYTICS" && (
              <DisplayGrid item style={{ width: "100%" }}>
                {selectedHeader && selectedHeader.length
                  ? loader && (
                      <div
                        style={{ display: "flex", flex: 1, minHeight: "15rem" }}
                      >
                        <BubbleLoader />
                      </div>
                    )
                  : loader && (
                      <div
                        style={{
                          display: "flex",
                          flex: 1,
                          minHeight: "15rem",
                          fontSize: "14px",
                          fontFamily: "inherit",
                          color: "grey",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        Select all required fields to preview data
                      </div>
                    )}
                {finalQuery && (
                  <div
                    className="hide_scroll"
                    style={{
                      display: "flex",
                      alignSelf: "center",
                      minHeight: "15rem",
                      // maxHeight:'21rem'
                    }}
                  >
                    {!loader && (
                      <ChartIterator
                        plotId={`tc-${fieldmeta.name}`}
                        style={{ height: "100%", width: "100%" }}
                        template={finalQuery}
                        layout={{ showTotals }}
                      />
                    )}
                  </div>
                )}
              </DisplayGrid>
            )}
            {dataSource !== "ANALYTICS" && (
              <DisplayGrid
                item
                style={{ height: "100%", width: "100%", minHeight: "17rem" }}
              >
                {tableData && (
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      alignItems: "flex-start",
                      overflow: "auto",
                      maxHeight: "inherit",
                    }}
                    className="hide_scroll"
                  >
                    <DisplayDataTable
                      plotId={`tc-${fieldmeta.name}`}
                      {...tableData}
                      showTotals={false}
                      title={fieldmeta.title}
                      hideDownload={false}
                      pdfButtonLabel={labels?.pdfButton}
                      pdfLabel={constructPdfLabel()}
                    />
                  </div>
                )}
                {loader && !tableData && !pickers && (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <BubbleLoader />
                  </div>
                )}
              </DisplayGrid>
            )}
            {totalCount && dataSource == "ENTITY" && (
              <DisplayPagination
                totalCount={totalCount}
                itemsPerPage={limit}
                onChange={onPageChange}
                currentPage={filters.page ? Number(filters.page) : 1}
              />
            )}
          </DisplayGrid>
        </div>
      </DisplayFormControl>
    </div>
  );
};
export default GridWrapper(SystemDataTable);
