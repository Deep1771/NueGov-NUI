import React from "react";

export const InventoryList = (props) => {
  let { data, value } = props || {};
  let { cellRendererParams } = props?.colDef || {};
  let valueObj = cellRendererParams?.values?.find((fl) => fl.id === value);
  return (
    <div>
      <div style={{ color: valueObj ? valueObj?.color : "" }}>{value}</div>
    </div>
  );
};
