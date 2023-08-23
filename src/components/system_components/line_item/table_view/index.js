import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  useReducer,
  useRef,
} from "react";
import {
  TextareaAutosize,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import {
  DisplayText,
  DisplayDialog,
  DisplayDivider,
  DisplayButton,
  DisplayModal,
} from "components/display_components";
import { Select, MenuItem } from "@material-ui/core";
import { AgGridReact } from "ag-grid-react";
import { makeStyles } from "@material-ui/core/styles";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ExpandMore } from "@material-ui/icons";
import { styles } from "./styles";
import { Banner, BubbleLoader } from "components/helper_components";

//own components
import { ScannerModal } from "components/extension_components";
import { EntityTable } from "./components/inventoryTable";
import { getScannerData } from "./utils/scanner";

import {
  tableContext,
  tableReducer,
  tableDispatchContext,
  initialState,
} from "./tableStore";
import {
  getTableDetails,
  getSavedTableItems,
  getTableHeaders,
} from "./utils/columns";
import { constructLineItem, getfieldKeys, getNewLineItem } from "./utils";
import { useDetailData } from "containers/composite_containers/detail_container/detail_state";

export const RenderTable = (props) => {
  let { fieldmeta, callbackValue, stateParams, formData, data } = props;
  const useStyles = makeStyles(styles);
  const styleClasses = useStyles();

  const gridRef = useRef();

  let [tableData, dispatch] = useReducer(tableReducer, initialState);
  const [viewButtons, setViewButtons] = useState(false);
  const [tableModal, setTableModal] = useState(false);
  const [scannerModal, setScannerModal] = useState(false);
  const [inventorySelected, setInventorySelected] = useState([]);
  const [dialogProps, setDialogProps] = useState({ open: false });
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      width: 200,
      resizable: true,
      suppressMenu: true,
    };
  }, []);

  //custom helpers starts
  const displayTableButon = () => {
    return (
      <div style={{ gap: 10 }}>
        <DisplayButton
          variant={"outlined"}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setScannerModal(true);
          }}
        >
          Scan
        </DisplayButton>
        <DisplayButton
          variant={"outlined"}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setTableModal(true);
          }}
        >
          Add
        </DisplayButton>
      </div>
    );
  };

  const getAccordionSummary = () => {
    let { title, description } = fieldmeta || {};
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column " }}>
          <DisplayText
            style={{ fontFamily: "inherit", fontSize: 18, fontWeight: 700 }}
          >
            {title ? title : "comes form metadata[title]"}
          </DisplayText>
          <DisplayText
            style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 400 }}
          >
            {description ? description : "comes form metadata[description]"}
          </DisplayText>
        </div>
        <div>{viewButtons ? displayTableButon() : ""}</div>
      </div>
    );
  };

  const displayTotalCast = () => {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          width: "100%",
          marginLeft: ".3rem",
          minWidth: "250px",
          maxWidth: "300px",
          justifyContent: "space-between",
        }}
      >
        <DisplayText
          style={{ fontFamily: "inherit", fontSize: 16, fontWeight: 550 }}
        >
          {`${fieldmeta.title} Cost (Line Value)`}
        </DisplayText>
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flex: 1,
              marginTop: ".3rem",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <DisplayText>{`${fieldmeta.title} Sub total`}</DisplayText>
            <DisplayText>{tableData?.lineSubTotal}</DisplayText>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              marginBottom: ".3rem",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <DisplayText style={{ display: "flex" }}>Discount</DisplayText>
            <div
              style={{ display: "flex", padding: ".3rem", marginLeft: ".2rem" }}
            >
              <Select
                defaultValue={"%"}
                value={tableData?.discount?.type}
                onChange={(event) => {
                  console.log(
                    "the selected discount type is -> ",
                    event.target.value
                  );
                  dispatch({
                    type: "UPDATE_DISCONT_TYPE",
                    payload: event.target.value,
                  });
                }}
                style={{ display: "flex", marginLeft: ".2rem", color: "blue" }}
              >
                <MenuItem value={"%"}>%</MenuItem>
                <MenuItem value={"$"}>$</MenuItem>
              </Select>
              <div style={{ display: "flex", flex: 6 }}>
                <input
                  style={{ outline: "solid white", width: "60px" }}
                  onChange={(event) => {
                    console.log(
                      "the on chnage value of discount type is -> ",
                      event.target.value
                    );
                    dispatch({
                      type: "UPADTE_DISCOUNT_VALUE",
                      payload: event.target.value,
                    });
                  }}
                  value={tableData?.discount?.value}
                />
              </div>
            </div>
          </div>
        </div>
        <DisplayDivider style={{ height: "2px" }} />
        <div
          style={{
            display: "flex",
            flex: 1.6,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DisplayText
            style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 500 }}
          >
            Total
          </DisplayText>
          <DisplayText
            style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 500 }}
          >
            {tableData?.total}
          </DisplayText>
        </div>
      </div>
    );
  };

  const rendarNotesAndTotalCount = () => {
    return (
      <div className={styleClasses.textDiv}>
        <div
          style={{
            display: "flex",
            margin: ".1rem",
            flexDirection: "column",
            width: "70%",
          }}
        >
          <DisplayText
            style={{ padding: ".1rem", fontSize: "18", fontWeight: 600 }}
          >
            Notes
          </DisplayText>
          <TextareaAutosize
            placeholder="Enter the Details here"
            value={tableData?.notes}
            style={{ display: "flex", width: "99%", height: "100%" }}
            onChange={(e) => {
              dispatch({
                type: "NOTES_DATA",
                notesData: e.target.value,
              });
            }}
          />
        </div>
        <div style={{ display: "flex", margin: ".1rem" }}>
          <DisplayDivider
            style={{ width: "2px", marginRight: ".6rem" }}
            orientation="vertical"
          />
          {displayTotalCast()}
        </div>
      </div>
    );
  };

  const rendarCardDetails = () => {
    return (
      <div className={styleClasses.cardDetails}>
      </div>
    );
  };

  //custom helpers ends

  const init = async () => {
    let tableColumnDefs = getTableHeaders(fieldmeta);
    callbackValue(data, props);
    setColumnDefs(tableColumnDefs);
  };

  const loadingOverlayComponent = () => {
    return <BubbleLoader />;
  };

  const showLoader = () => {
    return gridRef.current ? gridRef.current.api?.showLoadingOverlay() : null;
  };

  const hideLoader = () => {
    return gridRef.current ? gridRef.current.api?.hideOverlay() : null;
  };

  const noRowsOverlayComponent = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DisplayText
          style={{ fontSize: "16", fontWeight: "600" }}
        >{`No ${fieldmeta.title} Found ...!`}</DisplayText>
        <DisplayText>
          {`Click On Add/Scan to add the ${fieldmeta.title} LineItems`}
        </DisplayText>
      </div>
    );
  };

  const onGridReady = useCallback(
    async (params) => {
      showLoader();
      let savedLineitems = await getSavedTableItems(fieldmeta, formData);

      let fieldName = fieldmeta?.name;
      let fieldValue = formData["sys_entityAttributes"][fieldName];

      let isDataLength = data?.lineItems?.length;
      let isFieldLength = fieldValue?.lineItems?.length;

      if (isFieldLength) {
        dispatch({
          type: "",
          payload: fieldValue,
        });
        hideLoader();
      } else if (isDataLength) {
        dispatch({
          type: "",
          payload: props.data,
        });
        hideLoader();
      } else {
        dispatch({
          type: "DB_DATA",
          payload: savedLineitems,
        });
        return savedLineitems.length
          ? hideLoader()
          : gridRef?.current?.api?.showNoRowsOverlay();
      }
    },
    [JSON.stringify(formData)]
  );

  const handleNewSelect = (selectedData) => {
    let result = selectedData?.[0];
    if (result && Object.keys(result).length > 0) {
      let lineItemFields = constructLineItem(result, fieldmeta);

      //adding all the inventorydata to lineitem data(result will be object)
      lineItemFields = {
        sys_entityAttributes: {
          ...lineItemFields?.sys_entityAttributes,
          ...result,
        },
      };

      //construct proper datapoints using the lineitemsfields
      let newLineitem = getNewLineItem(
        fieldmeta,
        lineItemFields,
        result,
        formData
      );

      //adding to global state
      dispatch({
        type: "ROW_ADDED",
        payload: newLineitem,
      });
    }
  };

  const onScannedData = async (scannedData) => {
    let result = await getScannerData(scannedData, fieldmeta);
    setDialogProps({
      open: true,
      title: result?.msg,
      message: result?.message,
      showActionButtons: true,
      cancelLabel: "Cancel",
      confirmLabel: "Continue",
      onCancel: () => {
        setDialogProps({ open: false });
      },
      onConfirm: () => {
        setDialogProps({ open: false });
        setInventorySelected([result.data]);
      },
    });
  };

  const onCellValueChanged = useCallback((event) => {
    let rowNode = event.api.getRowNode(event.rowIndex);
    let newData = { ...event.data };

    let unitCost = newData.purchasePricePerUnit;
    let quantReq = newData.quantityRequired;

    let lineValue = unitCost * quantReq;
    let dicountData = newData.discount;
    newData["lineValue"] = lineValue ? lineValue : "";

    let finalValue = lineValue;

    if (dicountData.type === "%") {
      let discountValue = (dicountData.value / 100) * finalValue;
      finalValue = finalValue - discountValue;
    } else if (dicountData.type === "$") {
      finalValue = finalValue - dicountData.value;
    }
    newData["finalValue"] = finalValue ? finalValue : "";
    rowNode.setData(newData);
  });

  const onCellEditingStopped = useCallback((event) => {
    let rowNode = event.api.getRowNode(event.rowIndex);
    let newData = { ...event.data };

    let unitCost = newData.purchasePricePerUnit;
    let quantReq = newData.quantityRequired;

    let lineValue = unitCost * quantReq;
    let dicountData = newData.discount;
    newData["lineValue"] = lineValue ? lineValue : "";

    let finalValue = lineValue;

    if (dicountData.type === "%") {
      let discountValue = (dicountData.value / 100) * finalValue;
      finalValue = finalValue - discountValue;
    } else if (dicountData.type === "$") {
      finalValue = finalValue - dicountData.value;
    }
    newData["finalValue"] = finalValue ? finalValue : "";

    //cell flashing for more value
    let remainQant = event?.data?.currentQuantity;
    if (remainQant < quantReq) {
      //dont upadte any value
      newData["finalValue"] = "";
      newData["lineValue"] = "";
      newData["discount"] = "";
      newData["quantityRequired"] = "";
      rowNode.setData(newData);
    } else {
      //update all other values
      rowNode.setData(newData);
    }

    //after flasing update the global data and formdata
    let oldFinalValue = tableData.lineItems[event.rowIndex];
    let newFinalValue = {
      ...oldFinalValue,
      sys_entityAttributes: {
        ...oldFinalValue.sys_entityAttributes,
        ...newData,
      },
    };
    dispatch({
      type: "ROW_UPADTED",
      rowIndex: event.rowIndex,
      newData: newFinalValue,
    });
  });

  //components effects
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    let lineItemsTotalSubtotal = tableData?.lineItems?.map(
      (el) => el?.sys_entityAttributes?.finalValue
    );
    lineItemsTotalSubtotal = lineItemsTotalSubtotal.filter(
      (fl) => !["", null, undefined].includes(fl)
    );
    lineItemsTotalSubtotal = lineItemsTotalSubtotal.reduce(
      (accumulator, currentValue) => {
        return accumulator + currentValue;
      },
      0
    );

    let discountType = tableData?.discount?.type;
    let discountValue = tableData?.discount?.value;

    //total value before discount
    let discountedTotal = lineItemsTotalSubtotal;

    if (discountType && discountValue) {
      if (discountType === "%") {
        discountedTotal =
          lineItemsTotalSubtotal -
          (discountValue / 100) * lineItemsTotalSubtotal;
      } else if (discountType === "$") {
        discountedTotal = lineItemsTotalSubtotal - discountValue;
      }
    }

    let newData = {
      ...tableData,
      total: discountedTotal,
      lineSubTotal: lineItemsTotalSubtotal,
    };

    dispatch({
      type: "UPDATE_COST",
      payload: newData,
    });

    callbackValue(tableData, props);
    hideLoader();
  }, [JSON.stringify(tableData)]);

  useEffect(() => {
    if (inventorySelected.length > 0) {
      handleNewSelect(inventorySelected);
    }
  }, [inventorySelected]);

  return (
    <div style={{ display: "flex", width: "90%", flex: 1 }}>
      {stateParams?.mode === "EDIT" && (
        <Accordion
          TransitionProps={{ unmountOnExit: true }}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
          onChange={(e, expanded) => {
            setViewButtons(expanded);
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            {getAccordionSummary()}
          </AccordionSummary>
          <tableContext.Provider value={tableData}>
            <tableDispatchContext.Provider value={dispatch}>
              <AccordionDetails>
                <div className={styleClasses.mainDiv}>
                  <div
                    className={"ag-theme-alpine"}
                    style={{
                      height: "100%",
                      width: "100%",
                      "--ag-value-change-value-highlight-background-color":
                        "red",
                      // outline : "solid blue"
                    }}
                  >
                    <AgGridReact
                      ref={gridRef}
                      editType={"fullRow"}
                      defaultColDef={defaultColDef}
                      onGridReady={onGridReady}
                      rowData={tableData?.lineItems?.map(
                        (el) => el.sys_entityAttributes
                      )}
                      columnDefs={columnDefs}
                      loadingOverlayComponent={loadingOverlayComponent}
                      animateRows={true}
                      pagination={true}
                      paginationPageSize={8}
                      suppressRowClickSelection={true}
                      onCellValueChanged={onCellValueChanged}
                      onCellEditingStopped={onCellEditingStopped}
                      // noRowsOverlayComponent={noRowsOverlayComponent}
                      overlayNoRowsTemplate={`<div style={{color : "red"}}>No ${fieldmeta.title} Found ...! </br></br> Please Click on Scan / Add button to add the ${fieldmeta.title} Line Items<div>`}
                    />
                  </div>
                  {rendarNotesAndTotalCount()}
                  <DisplayDivider />
                  {rendarCardDetails()}
                </div>
              </AccordionDetails>
            </tableDispatchContext.Provider>
          </tableContext.Provider>
        </Accordion>
      )}
      {tableModal && (
        <DisplayModal
          open={tableModal}
          onClose={() => setTableModal(false)}
          maxWidth="lg"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div style={{ display: "flex" }}>
            <EntityTable
              fieldmeta={fieldmeta}
              setInventorySelected={setInventorySelected}
              setTableModal={setTableModal}
            />
          </div>
        </DisplayModal>
      )}
      {scannerModal && (
        <ScannerModal
          onSuccessCallback={onScannedData}
          onClose={setScannerModal}
          scannerTimeout={30000}
        />
      )}
      {<DisplayDialog {...dialogProps} />}
    </div>
  );
};
