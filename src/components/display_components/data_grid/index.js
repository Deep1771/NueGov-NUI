import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { rest } from "lodash";

export const DisplayDataGrid = (props) => {
  const { ref, columnDefs, defaultColDef, rowData } = props;

  //send all the props from the component where you call this.
  //above are the minimum required props to print the table

  return (
    <div className="ag-theme-alpine" style={{ width: "100%", height: "100%" }}>
      <AgGridReact {...props} />
    </div>
  );
};
