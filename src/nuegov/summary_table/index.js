import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { unionBy } from "lodash";
import { AgGridReact } from "ag-grid-react";

import ConstructGridColumns from "./components/column_components/construct_grid_columns";
import { jsonParser } from "utils/helper_functions";
import {
  CustomLoadingOverlay,
  CustomNoRowsOverlay,
} from "./components/grid_components/customOverlay";
import { SummaryGridContext } from "../containers/summary_container"; // the AG Grid React Component
import { NueassistSummaryGridContext } from "nueassist/containers/summary_container";
import { CircleProgress } from "containers/extension_containers/detail_trigger/utils/components";

import "./styles/ag-grid.css"; // Core grid CSS, always needed
import "./styles/ag-theme-alpine.css"; // Optional theme CSS

const SUMMARY_TABLE = (props) => {
  let {
    data,
    rows,
    columns,
    clicked,
    height,
    visibleIndex = 0,
    cellEditCallBack,
    handleSort,
    handleDetailPageModal,
    handleTraingModal,
    handleAddFieldValue,
    handleRemoveFieldValue,
    handleColumnSearch,
    checkEachRowDataAccess,
    setDialogProps,
    setSnackBar,
    isRelation,
    businessType,
    themeObj,
    params,
    handleIdsFor360 = () => {},
    showCheckboxSelection = true,
  } = props || {};

  const gridContext =
    businessType === "NUEASSIST"
      ? NueassistSummaryGridContext
      : SummaryGridContext;

  const [gridProps, dispatch] = useContext(gridContext);
  const {
    isLoading,
    metadata: metaData,
    selectedRows,
    isFilterApplied,
    pageNumber,
  } = gridProps || {};

  const gridRef = useRef(); // Optional - for accessing Grid's API
  const [rowData, setRowData] = useState([]); // Set rowData to Array of Objects, one Object per Row.
  const [columnDefs, setColumnDefs] = useState([]); // Each Column Definition results in one Column.
  const [loading, setLoading] = useState(
    businessType != "NUEASSIST" ? "isLoading" : ""
  );
  const { innerWidth } = window;
  const isNueassist = businessType === "NUEASSIST";
  let minLength = innerWidth > 1500 ? 10 : 8;
  let formatedColumns = [];

  let { sys_entityNamePlural = null, displayAgencyLogoOnSummary = false } =
    metaData?.sys_entityAttributes || {};

  let headerHeight = 30,
    floatingFiltersHeight = 34,
    rowHeight = 35;

  if (displayAgencyLogoOnSummary) {
    rowHeight = 45;
  }
  if (isNueassist) {
    headerHeight = 35;
    floatingFiltersHeight = 35;
    rowHeight = 45;
  }

  const initialSetup = (props) => {
    let actionColumn = columns?.find((e) => e?.headerName === "Action");
    let actualColumns = columns?.filter((e) => !e?.headerName);

    formatedColumns = ConstructGridColumns({
      columns: actualColumns,
      clicked,
      metaData,
      cellEditCallBack,
      formData: data,
      handleSort,
      handleDetailPageModal,
      handleTraingModal,
      handleAddFieldValue,
      handleRemoveFieldValue,
      checkEachRowDataAccess,
      setDialogProps,
      setSnackBar,
      handleColumnSearch,
      supressFloatingFilter: isRelation,
      businessType,
      themeObj,
      params,
    });

    if (formatedColumns?.length > 0) {
      let checkboxColumn = {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        showDisabledCheckboxes: true,
        pinned: "left",
        minWidth: 30,
        maxWidth: 40,
      };
      if (showCheckboxSelection) formatedColumns.splice(0, 0, checkboxColumn);
      if (actionColumn) formatedColumns.splice(1, 0, actionColumn);

      setColumnDefs(formatedColumns);
    }
  };

  // DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(() => ({
    sortable: false,
    resizable: true,
    suppressMovable: true,
    ...(columnDefs?.length <= minLength ? { flex: 1 } : { width: 150 }),
    cellStyle: () => ({
      display: "flex",
      alignItems: "center",
    }),
  }));

  const onGridReady = (params) => {
    // if (columns?.length <= 7) gridRef.current.api.sizeColumnsToFit();
    gridRef.current.columnApi.autoSizeColumns(["1", "2"], false);
    //   gridRef.current.columnApi.autoSizeAllColumns(true);
  };

  const scrollTable = () => {
    let table = document.querySelector(".ag-body-viewport");
    let horizontalBar = document.querySelector(
      ".ag-body-horizontal-scroll-viewport"
    );
    if (table) {
      setTimeout(() => {
        const scrollPosition = jsonParser(
          sessionStorage.getItem("summaryGridScrollPosition")
        );
        if (scrollPosition) {
          table.scrollTo(0, scrollPosition?.top);
          if (horizontalBar) horizontalBar.scrollTo(scrollPosition?.left, 0);
        }
        setTimeout(() => {
          sessionStorage.removeItem("summaryGridScrollPosition");
        }, 2500);
      }, 1000);
    }
    setTimeout(() => {
      if (!isLoading) setLoading("isLoadingFalse");
    }, 2000);
  };

  const onFirstDataRendered = useCallback((event) => {
    let allColumnIds = ["1", "2"];
    if (selectedRows?.length > 0) {
      let selectedRowIds = selectedRows.map((e) => e?._id);
      gridRef.current.api.forEachNode(function (node) {
        node.setSelected(selectedRowIds?.includes(node.data._id));
      });
    }
    gridRef.current.columnApi.autoSizeColumns(allColumnIds, false);
    gridRef.current.api.ensureIndexVisible(visibleIndex, "middle");
    // gridRef.current.columnApi.autoSizeAllColumns(true);
    if (!isNueassist) {
      setLoading("isLoading");
      scrollTable();
    }
  }, []);
  const isRowSelectable = useMemo(() => {
    return (params) => {
      return true;
    };
  }, []);

  const loadingOverlayComponent = useMemo(() => {
    return CustomLoadingOverlay;
  }, []);

  const loadingOverlayComponentParams = useMemo(() => {
    return {
      loadingMessage: "Loading, please wait...",
      isLoading: isLoading,
    };
  }, [isLoading]);

  const noRowsOverlayComponent = useMemo(() => {
    return CustomNoRowsOverlay;
  }, []);

  const noRowsOverlayComponentParams = useMemo(() => {
    return {
      name: sys_entityNamePlural,
      height: height,
      businessType: businessType,
      filterApplied: isFilterApplied,
      loadingMessage: "Loading, please wait...",
      isLoading: isLoading,
    };
  }, [isFilterApplied, isLoading]);

  const onSelectionChanged = () => {
    let selectedrows = gridRef.current.api.getSelectedRows();
    selectedrows = selectedrows?.map((eachRow) => {
      return {
        _id: eachRow?._id,
        sys_gUid: eachRow?.sys_gUid,
        sys_agencyId: eachRow?.sys_agencyId,
        pageNumber,
      };
    });

    let selectedIds = [...selectedRows, ...selectedrows];
    selectedIds = selectedIds.filter((obj, index) => {
      return index === selectedIds.findIndex((o) => o._id === obj._id);
    });

    let prevSelectedRows = selectedIds.filter(
      (e) => e.pageNumber === pageNumber
    );

    //When any row is unselected
    if (selectedrows.length < prevSelectedRows.length) {
      let modifiedSelectedIds = [];
      selectedIds.map((e, i) => {
        if (e.pageNumber === pageNumber) {
          let index = selectedrows.findIndex((e1) => e1._id === e._id);
          if (index !== -1 && pageNumber === e.pageNumber) {
            modifiedSelectedIds.push(e);
          }
        } else {
          modifiedSelectedIds.push(e);
        }
      });
      selectedIds = modifiedSelectedIds;
    }

    dispatch({
      type: "SELECTED_DATA",
      payload: {
        selectedRows: selectedIds,
      },
    });
    handleIdsFor360([...selectedIds]);
  };
  useEffect(() => {
    initialSetup();
  }, [JSON.stringify(clicked)]);

  useEffect(() => {
    initialSetup();
  }, [JSON.stringify(columns)]);

  useEffect(() => {
    if (gridRef.current.api) {
      gridRef.current.api.setRowData(rows);
      setRowData(rows);
      if (
        rows?.length === 0 &&
        businessType === "NUEASSIST" &&
        isFilterApplied
      ) {
        gridRef.current.api.showNoRowsOverlay();
      } else {
        scrollTable();
        gridRef.current.api.hideOverlay();
      }
    } else {
      setRowData(rows);
    }
    if (!isNueassist) setLoading("isLoading");
    scrollTable();
  }, [JSON.stringify(rows), isLoading]);

  useEffect(() => {
    if (isLoading) {
      if (gridRef.current.api) {
        gridRef.current.api.setRowData([]);
        gridRef.current.api.showLoadingOverlay();
      } else setRowData([]);
    } else {
      if (gridRef.current.api) {
        gridRef.current.api.hideOverlay();
      }
    }
  }, [isLoading]);

  return (
    <div
      className={businessType != "NUEASSIST" ? `${loading}` : ""}
      style={{ height: "100%" }}
    >
      <div
        style={
          businessType != "NUEASSIST"
            ? {
                width: "100%",
                height: "85%",
                display: `${loading}` == "isLoading" ? "flex" : "none",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
              }
            : { display: "none" }
        }
      >
        <CircleProgress label={" Loading...."} />
      </div>
      <div
        className={`ag-theme-alpine `}
        style={{
          height: `${loading}` == "isLoading" ? "" : height,
          width: "100%",
          visibility: `${loading}` == "isLoading" ? "hidden" : null,
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={"multiple"}
          suppressRowClickSelection={true}
          isRowSelectable={isRowSelectable}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
          floatingFiltersHeight={floatingFiltersHeight}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          onSelectionChanged={onSelectionChanged}
          // onBodyScroll={onBodyScroll}
          // onBodyScrollEnd={onBodyScrollEnd}
          loadingOverlayComponent={loadingOverlayComponent}
          loadingOverlayComponentParams={loadingOverlayComponentParams}
          noRowsOverlayComponent={noRowsOverlayComponent}
          noRowsOverlayComponentParams={noRowsOverlayComponentParams}
          tooltipShowDelay={500}
        />
        {/* <AgGridReact
        ref={gridRef} // Ref for accessing Grid's API
        rowData={rowData} // Row Data for Rows
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        columnDefs={columnDefs} // Column Defs for Columns
        defaultColDef={defaultColDef} // Default Column Properties
        suppressScrollOnNewData={true}
        animateRows={true} // Optional - set to 'true' to have rows animate when sorted
        rowSelection={"multiple"} // Options - allows click selection of rows
        suppressRowClickSelection={true}
        isRowSelectable={isRowSelectable}
        rowHeight={rowHeight}
        groupHeaderHeight={groupHeaderHeight}
        headerHeight={headerHeight}
        floatingFiltersHeight={floatingFiltersHeight}
        overlayNoRowsTemplate={template}
        loadingOverlayComponent={loadingOverlayComponent}
        loadingOverlayComponentParams={loadingOverlayComponentParams}
        noRowsOverlayComponent={noRowsOverlayComponent}
        noRowsOverlayComponentParams={noRowsOverlayComponentParams}
        //   autoGroupColumnDef={autoGroupColumnDef}
        suppressColumnVirtualisation={true}
        // suppressRowVirtualisation={true}
        onBodyScroll={onBodyScroll}
        onBodyScrollEnd={onBodyScrollEnd}
        debounceVerticalScrollbar={true}
        onSelectionChanged={onSelectionChanged}
        onCellClicked={cellClickedListener} // Optional - registering for Grid Event
        rowBuffer={0}
        cacheBlockSize={100}
        cacheOverflowSize={20}
        infiniteInitialRowCount={1000}
        maxBlocksInCache={10}
        // onColumnResized={onColumnResized}
      /> */}
      </div>
    </div>
  );
};

export default SUMMARY_TABLE;
