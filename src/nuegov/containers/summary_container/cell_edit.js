import React, { useEffect, useRef } from "react";
import {
  DisplayModal,
  DisplayButton,
  DisplayText,
} from "components/display_components";
import { Iterator } from "containers/composite_containers/detail_container/components/iterator";
import data_pairedlist from "components/system_components/data_pairedlist";

export const CellEdit = (props) => {
  let {
    open,
    fieldMeta: fieldDef,
    cellEditCallback,
    closeCallback,
    eachRowData,
    stateParams,
  } = props;
  let modifiedData = useRef();

  const handleValueChange = (data) => {
    if (data) {
      modifiedData.current = data;
    }
  };

  const handleClose = () => {
    modifiedData.current = null;
    closeCallback();
  };
  const handleSave = () => {
    eachRowData.sys_entityAttributes[fieldDef.name] = modifiedData.current;
    cellEditCallback(fieldDef, eachRowData);
  };

  const renderCellBody = () => {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <DisplayButton
          onClick={handleClose}
          size="small"
          variant="outlined"
          style={{
            height: "30px",
            marginRight: "0.5rem",
          }}
        >
          Cancel
        </DisplayButton>
        <DisplayButton
          variant="contained"
          size="large"
          style={{
            height: "30px",
            marginRight: "0.5rem",
          }}
          onClick={handleSave}
          ///disabled={isSavedDisabled()}
        >
          Save
        </DisplayButton>
      </div>
    );
  };
  const renderCellEditBody = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flex: 2,
        }}
      >
        <Iterator
          callbackError={() => {}}
          fieldmeta={{ ...fieldDef, colSpan: 1 }}
          stateParams={stateParams}
          callbackValue={(data) => {
            handleValueChange(data);
          }}
        />
      </div>
    );
  };
  return (
    <>
      <DisplayModal open={open} fullWidth={false} maxWidth={"sm"}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "150px",
            width: "100%",
            minWidth: "300px",
          }}
        >
          {renderCellEditBody()}
          {renderCellBody()}
        </div>
      </DisplayModal>
    </>
  );
};
