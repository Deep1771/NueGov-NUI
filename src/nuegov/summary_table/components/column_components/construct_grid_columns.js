import AgCellBuilder from "../grid_components/grid_cell_builder";
import HeaderComponent from "./header_component";

import {
  TextSearch,
  NumberSearch,
  DateSearch,
  ListSearch,
  RadioSearch,
  ReferenceSearch,
} from "../../../containers/summary_container/components/column";

const ConstructGridColumns = (props) => {
  let {
    columns,
    formData,
    metaData,
    clicked,
    cellEditCallBack,
    handleSort,
    handleDetailPageModal,
    handleAddFieldValue,
    handleTraingModal,
    handleRemoveFieldValue,
    handleColumnSearch,
    checkEachRowDataAccess,
    setDialogProps,
    setSnackBar,
    supressFloatingFilter,
    businessType,
    themeObj,
    params,
  } = props || {};

  let { GridCellBuilder } = AgCellBuilder();
  let { sys_topLevel = [] } = metaData?.sys_entityAttributes || {};
  let isMultiColumnExist = sys_topLevel?.find((e) =>
    ["REFERENCE", "PAIREDLIST", "DATAPAIREDLIST"].includes(e?.type)
  );
  let formatedColumns = [],
    colData = [];

  const showTooltip = (directiveDef) => {
    let excludeToolTipFor = ["PHONENUMBER", "DATE", "DATETIME", "DATERANGE"];
    if (params?.entityname !== "ProgressNotes") return false;
    else return !excludeToolTipFor?.includes(directiveDef?.type);
  };

  let fieldLabels = [];
  const constructLabelArray = (label) => {
    if (label) {
      if (Object.keys(label).find((key) => key === "child")) {
        let tempObj = { ...label, visible: true };
        if (tempObj.child) delete tempObj.child;
        fieldLabels = [...fieldLabels, tempObj];
        constructLabelArray(label.child);
      } else fieldLabels = [...fieldLabels, { ...label, visible: true }];
    }
    return fieldLabels;
  };

  const getColumnSearchType = (params, i) => {
    let { colDef = {} } = params?.column || {};
    let { columnData } = colDef || {};
    let column = {
      key: columnData?.name,
      ...colDef,
    };

    switch (columnData?.type) {
      case "TEXTBOX":
        return TextSearch({ column, businessType });
      case "NUMBER":
        return NumberSearch({ column, businessType });
      case "DECIMAL":
        return NumberSearch({ column, businessType });
      case "DATE":
        return DateSearch({ column, businessType });
      case "DATETIME":
        return DateSearch({ column, businessType });
      case "LIST":
        return ListSearch({ column, businessType });
      case "TOGGLE":
      case "RADIO":
        return RadioSearch({ column, businessType });
      case "REFERENCE":
        return ReferenceSearch({ column, index: i, businessType });
      default:
        return TextSearch({ column, businessType });
    }
  };

  if (isMultiColumnExist) {
    columns.map((eachCol, i) => {
      let width = eachCol?.columnWidth;
      let isSortable =
        typeof eachCol?.enableSummarySort === "boolean"
          ? eachCol?.enableSummarySort
          : true;
      let obj = {
        headerName: eachCol?.title,
        field: eachCol?.name,
        floatingFilter: eachCol?.searchable === false ? false : true,
        filter: true,
        sortEnabled: isSortable,
        headerComponent: (params) =>
          HeaderComponent({
            params,
            handleSort,
            config: eachCol,
            clicked,
            index: 0,
          }),
        wrapHeaderText: true,
        autoHeaderHeight: true,
        ...(width && { width: width }),
        // autoHeight: true,
      };

      if (eachCol?.type === "REFERENCE") {
        let { visibleInSingleColumn = false } = eachCol || {};
        if (eachCol?.displayFields?.length > 0) {
          if (!visibleInSingleColumn) {
            let index = 0;
            colData = eachCol?.displayFields
              ?.map((eachDis, i) => {
                let visibleOnSummary =
                  typeof eachDis?.visible === "boolean"
                    ? eachDis?.visible
                    : true;
                let isSortable =
                  typeof eachDis?.enableSummarySort === "boolean"
                    ? eachDis?.enableSummarySort
                    : true;
                let width = eachDis?.columnWidth;
                if (visibleOnSummary) {
                  let isButtonVisible = index === 0 ? true : false;
                  let fieldPath = eachCol?.name + "." + eachDis?.name;
                  let subObj = {
                    field: fieldPath,
                    headerName: eachDis?.friendlyName,
                    filter: true,
                    sortEnabled: isSortable,
                    floatingFilter:
                      eachCol?.searchable === false ? false : true,
                    floatingFilterComponent: (params) =>
                      getColumnSearchType(params, i),
                    floatingFilterComponentParams: {
                      suppressFilterButton: true,
                    },
                    suppressMenu: true,
                    pinned: eachCol?.freezeColumn || false,
                    headerComponent: (params) =>
                      HeaderComponent({
                        params,
                        handleSort,
                        config: eachCol,
                        index: i,
                        clicked,
                      }),
                    handleColumnSearch: handleColumnSearch,
                    columnData: eachCol,
                    screenType: supressFloatingFilter ? "RELATION" : "",
                    values: eachCol?.values || [],
                    displayFields: eachCol?.displayFields,
                    cellRenderer: ({ data }) =>
                      GridCellBuilder({
                        data,
                        metadata: metaData,
                        fieldmeta: eachCol,
                        path: fieldPath,
                        cellEditCallBack,
                        formData,
                        referenceIndex: isButtonVisible ? 1 : 2,
                        handleDetailPageModal,
                        handleAddFieldValue,
                        handleRemoveFieldValue,
                        checkEachRowDataAccess,
                        setDialogProps,
                        setSnackBar,
                        businessType,
                        themeObj,
                        params,
                      }),
                    wrapHeaderText: true,
                    autoHeaderHeight: true,
                    ...(width && { width: width }),
                  };
                  if (eachCol?.multiSelect) {
                    subObj = {
                      ...subObj,
                      wrapText: true,
                      autoHeight: true,
                    };
                  }
                  index = index + 1;
                  formatedColumns.push(subObj);
                }
              })
              .filter((e) => e);
          } else {
            obj = {
              pinned: eachCol?.freezeColumn || false,
              field: eachCol?.name,
              filter: true,
              floatingFilter:
                supressFloatingFilter || eachCol?.searchable === false
                  ? false
                  : true,
              floatingFilterComponent: (params) =>
                getColumnSearchType(params, 0),
              floatingFilterComponentParams: {
                suppressFilterButton: true,
              },
              suppressMenu: true,
              columnData: eachCol,
              screenType: supressFloatingFilter ? "RELATION" : "",
              values: eachCol?.values || [],
              displayFields: eachCol?.displayFields,
              handleColumnSearch: handleColumnSearch,
              cellRenderer: ({ data }) =>
                GridCellBuilder({
                  data,
                  metadata: metaData,
                  fieldmeta: eachCol,
                  path: eachCol?.name,
                  cellEditCallBack,
                  formData,
                  referenceIndex: 1,
                  handleDetailPageModal,
                  handleAddFieldValue,
                  handleRemoveFieldValue,
                  checkEachRowDataAccess,
                  setDialogProps,
                  setSnackBar,
                  businessType,
                  themeObj,
                  params,
                }),
              ...obj,
            };
            if (eachCol?.multiSelect) {
              obj = {
                ...obj,
                wrapText: true,
                autoHeight: true,
              };
            }
            formatedColumns.push(obj);
          }
        }
      } else if (
        ["PAIREDLIST", "DATAPAIREDLIST"].includes(eachCol?.type) &&
        !eachCol?.visibleInSingleColumn
      ) {
        let { labels = {} } = eachCol || {};
        const subColumns = constructLabelArray(labels);
        fieldLabels = [];
        let index = 0;
        colData = subColumns
          ?.map((eachDis, i) => {
            let eachColCopy = {};
            eachColCopy = { ...eachCol };
            let visibleOnSummary =
              typeof eachDis?.visible === "boolean" ? eachDis?.visible : true;
            let isSortable =
              typeof eachDis?.enableSummarySort === "boolean"
                ? eachDis?.enableSummarySort
                : true;
            let width = eachDis?.columnWidth;
            if (visibleOnSummary) {
              let fieldPath = eachCol?.name + "." + eachDis?.name;
              eachColCopy.name = fieldPath;
              let subObj = {};
              subObj = {
                field: fieldPath,
                headerName: eachDis?.title,
                filter: true,
                sortEnabled: isSortable,
                floatingFilter: eachCol?.searchable === false ? false : true,
                floatingFilterComponent: (params) =>
                  getColumnSearchType(params, i),
                floatingFilterComponentParams: {
                  suppressFilterButton: true,
                },
                suppressMenu: true,
                pinned: eachCol?.freezeColumn || false,
                headerComponent: (params) =>
                  HeaderComponent({
                    params,
                    handleSort,
                    config: eachColCopy,
                    index: i,
                    clicked,
                  }),
                handleColumnSearch: handleColumnSearch,
                columnData: { ...eachColCopy },
                screenType: supressFloatingFilter ? "RELATION" : "",
                values: eachColCopy?.values || [],
                displayFields: eachColCopy?.displayFields,
                cellRenderer: ({ data }) =>
                  GridCellBuilder({
                    data,
                    metadata: metaData,
                    fieldmeta: eachColCopy,
                    path: fieldPath,
                    cellEditCallBack,
                    formData,
                    handleDetailPageModal,
                    handleAddFieldValue,
                    handleRemoveFieldValue,
                    checkEachRowDataAccess,
                    setDialogProps,
                    setSnackBar,
                    businessType,
                    themeObj,
                    params,
                  }),
                wrapHeaderText: true,
                autoHeaderHeight: true,
                ...(width && { width: width }),
              };
              index = index + 1;
              formatedColumns.push(subObj);
            }
          })
          .filter((e) => e);
      } else if (eachCol?.type === "TASK") {
        if (true) {
          let index = 0;
          colData = eachCol?.fields
            ?.map((eachDis, i) => {
              let visibleOnSummary =
                typeof eachDis?.visible === "boolean" ? eachDis?.visible : true;
              let isSortable =
                typeof eachDis?.enableSummarySort === "boolean"
                  ? eachDis?.enableSummarySort
                  : true;
              let width = eachDis?.columnWidth;
              if (visibleOnSummary) {
                let isButtonVisible = index === 0 ? true : false;
                let fieldPath =
                  eachCol?.name + "." + (eachDis?.summaryName || eachDis?.name);
                let subObj = {
                  field: fieldPath,
                  headerName: eachDis?.title,
                  filter: true,
                  sortEnabled: isSortable,
                  floatingFilter: eachCol?.searchable === false ? false : true,
                  floatingFilterComponent: (params) =>
                    getColumnSearchType(params, i),
                  floatingFilterComponentParams: {
                    suppressFilterButton: true,
                  },
                  suppressMenu: true,
                  pinned: eachCol?.freezeColumn || false,
                  headerComponent: (params) =>
                    HeaderComponent({
                      params,
                      handleSort,
                      config: eachCol,
                      index: i,
                      clicked,
                    }),
                  handleColumnSearch: handleColumnSearch,
                  columnData: eachDis,
                  autoHeight: eachCol.autoHeight,
                  screenType: supressFloatingFilter ? "RELATION" : "",
                  values: eachDis?.values || [],
                  displayFields: eachCol?.fields,
                  cellRenderer: ({ data }) =>
                    GridCellBuilder({
                      data,
                      metadata: metaData,
                      fieldmeta: eachDis,
                      path: fieldPath,
                      cellEditCallBack,
                      formData,
                      referenceIndex: isButtonVisible ? 1 : 2,
                      handleDetailPageModal,
                      handleAddFieldValue,
                      handleRemoveFieldValue,
                      checkEachRowDataAccess,
                      setDialogProps,
                      setSnackBar,
                      businessType,
                      themeObj,
                      params,
                    }),
                  wrapHeaderText: true,
                  autoHeaderHeight: true,
                  ...(width && { width: width }),
                };

                index = index + 1;
                formatedColumns.push(subObj);
              }
            })
            .filter((e) => e);
        }
      } else {
        obj = {
          pinned: eachCol?.freezeColumn || false,
          field: eachCol?.name,
          filter: true,
          floatingFilter:
            supressFloatingFilter || eachCol?.searchable === false
              ? false
              : true,
          floatingFilterComponent: getColumnSearchType,
          floatingFilterComponentParams: {
            suppressFilterButton: true,
          },
          suppressMenu: true,
          columnData: eachCol,
          screenType: supressFloatingFilter ? "RELATION" : "",
          values: eachCol?.values || [],
          autoHeight: eachCol.autoHeight,
          displayFields: eachCol?.displayFields,
          handleColumnSearch: handleColumnSearch,
          tooltipField: showTooltip(eachCol) ? eachCol?.name : "",
          cellRenderer: ({ data }) =>
            GridCellBuilder({
              data,
              fieldmeta: eachCol,
              path: eachCol?.name,
              cellEditCallBack,
              handleTraingModal,
              businessType,
              themeObj,
              params,
            }),
          ...obj,
        };
        formatedColumns.push(obj);
      }
    });
  } else {
    colData = columns?.map((eachCol, i) => {
      let isSortable =
        typeof eachCol?.enableSummarySort === "boolean"
          ? eachCol?.enableSummarySort
          : true;
      let width = eachCol?.columnWidth;
      formatedColumns.push({
        headerName: eachCol?.title,
        field: eachCol?.name,
        pinned: eachCol?.freezeColumn || false,
        floatingFilter: eachCol?.searchable === false ? true : true,
        floatingFilterComponent: getColumnSearchType,
        floatingFilterComponentParams: {
          suppressFilterButton: true,
        },
        sortEnabled: isSortable,
        filter: true,
        columnData: eachCol,
        screenType: supressFloatingFilter ? "RELATION" : "",
        values: eachCol?.values || [],
        displayFields: eachCol?.displayFields,
        handleColumnSearch: handleColumnSearch,
        suppressMenu: "true",
        wrapHeaderText: true,
        autoHeight: eachCol.autoHeight,
        // wrapText: true,
        ...(width && { width: width }),
        autoHeaderHeight: true,
        tooltipField: showTooltip(eachCol) ? eachCol?.name : "",
        headerComponent: (params) =>
          HeaderComponent({
            params,
            handleSort,
            config: eachCol,
            clicked,
          }),
        cellRenderer: ({ data }) =>
          GridCellBuilder({
            data,
            fieldmeta: eachCol,
            path: eachCol?.name,
            handleTraingModal,
            cellEditCallBack,
            formData,
            businessType,
            themeObj,
            params,
          }),
      });
    });
  }

  return formatedColumns;
};

export default ConstructGridColumns;
