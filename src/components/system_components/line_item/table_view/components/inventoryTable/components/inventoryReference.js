import React from "react";

export const InventoryReference = (props) => {
  let { data, value } = props || {};
  let { cellRendererParams } = props?.colDef || {};
  let { displayFields } = cellRendererParams || [];
  let fieldValue = displayFields?.map((el) => value?.[el?.name]);
  fieldValue = fieldValue?.filter((fl) => ![undefined, null, ""].includes(fl));

  return (
    <div>
      <div style={{ color: "#308cf7" }}>{fieldValue.toString()}</div>
    </div>
  );
};
