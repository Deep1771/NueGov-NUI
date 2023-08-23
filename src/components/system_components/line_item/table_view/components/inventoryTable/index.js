import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  DisplayButton,
  DisplayInput,
  DisplayModal,
  DisplayText,
} from "components/display_components";
import { getInventoryTableDetails } from "./columns";
import { BubbleLoader } from "components/helper_components";

import { DetailPage } from "containers/composite_containers/detail_container/components/detail_page";
import { entity } from "utils/services/api_services/entity_service";

export const EntityTable = (props) => {
  let { fieldmeta, setTableModal, setInventorySelected } = props;
  let { appname, modulename, entityname } = fieldmeta?.inventory || {};
  const gridRef = useRef();
  const [columnDefs, setColumnDefs] = useState();
  const [inventoryTemplate, setInventoryTemplate] = useState({});
  const [rowData, setRowData] = useState(null);
  const [selectedData, setSelectedData] = useState([]);
  const [extradata, setExtradata] = useState({});
  const [createInventory, setCreateInventory] = useState(false);

  const containerStyle = useMemo(
    () => ({
      display: "flex",
      flex: 1,
      width: "70vw",
      height: "60vh",
      backgroundColor: "white",
      flexDirection: "column",
    }),
    []
  );
  const gridStyle = useMemo(
    () => ({ height: "50vh", width: "100%", padding: "10px", flex: 8 }),
    []
  );

  const showLoader = () => {
    return gridRef.current ? gridRef.current.api?.showLoadingOverlay() : null;
  };

  const hideLoader = () => {
    return gridRef.current ? gridRef.current.api?.hideOverlay() : null;
  };

  const onGridReady = useCallback(async (params) => {
    showLoader(params);
    setTimeout(async () => {
      let tableDetails = await getInventoryTableDetails(fieldmeta, params);
      setInventoryTemplate(tableDetails?.inventoryTemplate);
      setColumnDefs(tableDetails?.inventoryColumnDefs);
      setRowData(
        tableDetails?.inventoryRowData ? tableDetails?.inventoryRowData : null
      );
      tableDetails?.inventoryRowData?.length > 0 && hideLoader();
    });
  }, []);

  const onSelectionChanged = useCallback((params) => {
    const selectedRows = gridRef.current.api.getSelectedRows();
    console.log("the selectedRows ->", selectedRows);
    setSelectedData(selectedRows);
  });

  const defaultColDef = useMemo(() => {
    return {
      editable: false,
      filter: true,
      width: 200,
      resizable: true,
      suppressMenu: true,
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFilterButton: true,
      },
    };
  }, []);

  const getInventoryInfo = () => {
    let { inventory } = fieldmeta || {};
    let { title, description } = inventory || {};
    return (
      <div
        style={{
          display: "flex",
          flex: 0.5,
          marginLeft: ".5rem",
          justifyContent: "space-between",
          padding: "10px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DisplayText
            style={{ fontFamily: "inherit", fontSize: 20, fontWeight: 700 }}
          >
            {title ? title : "comes from metadata[title]"}
          </DisplayText>
          <DisplayText
            style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 400 }}
          >
            {description ? description : "comes form metadata"}
          </DisplayText>
        </div>
        <div style={{ display: "flex", padding: "5px" }}>
          <DisplayButton
            onClick={() => {
              console.log("to open the new modal for inventory adding");
              setCreateInventory(true);
            }}
          >
            {`Create ${title}`}
          </DisplayButton>
        </div>
      </div>
    );
  };

  const handleChange = (val, field) => {
    let { name } = field || {};
    let obj = {};
    obj[name] = val;
    setExtradata((prevState) => ({
      ...prevState,
      ...obj,
    }));
  };

  const getTableFields = () => {
    let { lineItems } = fieldmeta || {};
    let { displayFields } = lineItems || [];
    displayFields = displayFields?.filter((fl) => fl.isEditable === true);
    return (
      <div style={{ display: "flex", width: "100%", marginLeft: ".3rem" }}>
        {displayFields?.map((el) => {
          return (
            <div style={{ display: "flex" }}>
              <DisplayInput
                style={{ display: "flex", padding: ".2rem" }}
                label={`Enter ${el.title}`}
                onChange={(val) => {
                  handleChange(val, el);
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const loadingOverlayComponent = () => {
    return <BubbleLoader />;
  };

  const handleNewInventorySave = async (result) => {
    let { id, success } = result || {};
    let newData = await entity.get({
      appname,
      modulename,
      entityname: entityname,
      id,
    });
    setRowData([newData, ...rowData]);
    setCreateInventory(false);
  };

  return (
    <div style={containerStyle}>
      {getInventoryInfo()}
      <div style={gridStyle} className="ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          editType={"fullRow"}
          rowData={rowData?.map((el) => el.sys_entityAttributes)}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          pagination={true}
          paginationPageSize={15}
          suppressRowClickSelection={true}
          headerHeight={30}
          rowHeight={35}
          onModelUpdated={(event) => {
            event.api.getDisplayedRowCount() === 0
              ? event.api.showNoRowsOverlay()
              : event.api.hideOverlay();
          }}
          // rowSelection={'multiple'}
          onGridReady={onGridReady}
          onSelectionChanged={onSelectionChanged}
          loadingOverlayComponent={loadingOverlayComponent}
          // overlayLoadingTemplate={`<span class="ag-overlay-loading-center">Please wait while your ${fieldmeta.inventory.title} are loading</span>`}
          overlayNoRowsTemplate={`<span>No data in ${fieldmeta.inventory.title} </br></br> Please Create the ${fieldmeta.inventory.title} to Select</span>`}
        ></AgGridReact>
      </div>
      <div
        style={{
          display: "flex",
          flex: 0.5,
          justifyContent: "flex-end",
          padding: "10px",
        }}
      >
        {/* {
          selectedData.length > 0 && getTableFields()
        } */}
        {selectedData.length > 0 && (
          <DisplayButton
            onClick={() => {
              setTableModal(false);
              setInventorySelected(selectedData);
            }}
          >
            Add
          </DisplayButton>
        )}
        <DisplayButton onClick={() => setTableModal(false)}>
          Cancel
        </DisplayButton>
      </div>
      {createInventory && (
        <DisplayModal
          open={createInventory}
          onClose={() => setCreateInventory(false)}
          maxWidth="lg"
          fullWidth={true}
          style={{}}
        >
          <div
            style={{
              height: "70vh",
              padding: "8px 8px 8px 8px",
              display: "flex",
              flex: 1,
            }}
          >
            <DetailPage
              data={""}
              metadata={inventoryTemplate}
              appname={appname}
              modulename={modulename}
              groupname={entityname}
              mode={"new"}
              saveCallback={(result) => {
                handleNewInventorySave(result);
              }}
              onClose={() => {
                setCreateInventory(false);
                // if (callbackClose) callbackClose(false);
              }}
              options={{
                hideFooter: false,
                hideNavbar: false,
                hideTitlebar: false,
                hideFeatureButtons: true,
              }}
            />
          </div>
        </DisplayModal>
      )}
    </div>
  );
};
