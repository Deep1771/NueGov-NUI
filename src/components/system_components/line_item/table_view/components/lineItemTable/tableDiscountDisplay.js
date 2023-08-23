import React from "react";

export const TableDiscountDisplay = (props) => {
  let { value, type } = props.value || {};

  return (
    <div>
      <div style={{ color: "#835ED9" }}>
        {value && type ? `${value}` + " " + `(${type})` : ""}
      </div>
    </div>
  );
};
