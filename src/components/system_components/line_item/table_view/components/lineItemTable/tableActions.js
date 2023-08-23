import React, { useState, useEffect, useContext } from "react";
import { DisplayIconButton } from "components/display_components";
import { SystemIcons } from "utils/icons";
import { GlobalFactory } from "utils/services/factory_services";
import { tableContext, tableDispatchContext } from "../../tableStore";
import { ToolTipWrapper } from "components/wrapper_components";

export const TableActions = (props) => {
  let tableData = useContext(tableContext);
  let tableDispatch = useContext(tableDispatchContext);

  let [editing, setEditing] = useState(false);
  let [disabled, setDisabled] = useState(false);

  const { setSnackBar } = GlobalFactory();

  const { Edit, Delete, Save, Cancel } = SystemIcons;

  function deleteRow() {
    let rowNode = props.api.getRowNode(props.rowIndex);
    console.log("the rownode is -> ", { rowNode });
    console.log("rowNode index -> ", props.rowIndex);
    let data = props.data;
    // props.api.applyTransaction({ remove: [data] });
    props.api.refreshCells({ force: true });
    console.log("the complete data is -> ", props);
    console.log("the table data is -> ", tableData);
    console.log("the table dispatch is -> ", tableDispatch);
    tableDispatch({
      type: "ROW_DELETED",
      rowIndex: props.rowIndex,
    });
  }

  function isEmptyRow(data) {
    let dataCopy = { ...data };
    delete dataCopy.id;
    return !Object.values(dataCopy).some((value) => value);
  }

  function onRowEditingStarted(params) {
    if (props.node === params.node) {
      setEditing(true);
    } else {
      setDisabled(true);
    }
  }

  function onRowEditingStopped(params) {
    if (props.node === params.node) {
      if (isEmptyRow(params.data)) {
        deleteRow(true);
      } else {
        setEditing(false);
      }
    } else {
      setDisabled(false);
    }
  }

  useEffect(() => {
    props.api.addEventListener("rowEditingStarted", onRowEditingStarted);
    props.api.addEventListener("rowEditingStopped", onRowEditingStopped);

    return () => {
      props.api.removeEventListener("rowEditingStarted", onRowEditingStarted);
      props.api.removeEventListener("rowEditingStopped", onRowEditingStopped);
    };
  }, []);

  function startEditing() {
    console.log("start editing the rows");
    props.api.startEditingCell({
      rowIndex: props.rowIndex,
      colKey: props.column.colId,
    });
  }

  function stopEditing(bool) {
    props.api.refreshCells({ force: true });
    props.api.stopEditing(bool);
  }

  return (
    <div style={{ display: "flex", marginTop: ".2rem" }}>
      {editing ? (
        <>
          <DisplayIconButton
            systemVariant="success"
            onClick={() => stopEditing(false)}
            disabled={disabled}
          >
            <ToolTipWrapper title="Save">
              <Save />
            </ToolTipWrapper>
          </DisplayIconButton>
          <DisplayIconButton
            systemVariant="error"
            onClick={() => stopEditing(true)}
            disabled={disabled}
          >
            <ToolTipWrapper title="Cancel">
              <Cancel />
            </ToolTipWrapper>
          </DisplayIconButton>
        </>
      ) : (
        <>
          <DisplayIconButton
            systemVariant="primary"
            onClick={startEditing}
            disabled={disabled}
          >
            <ToolTipWrapper title="Edit">
              <Edit />
            </ToolTipWrapper>
          </DisplayIconButton>
          <DisplayIconButton
            systemVariant="error"
            onClick={() => deleteRow()}
            disabled={disabled}
          >
            <ToolTipWrapper title="Delete">
              <Delete />
            </ToolTipWrapper>
          </DisplayIconButton>
        </>
      )}
    </div>
  );
};
