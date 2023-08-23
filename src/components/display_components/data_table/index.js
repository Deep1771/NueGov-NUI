import React from "react";
import Table from "./table";

export const DisplayDataTable = (props) => {
  let { headers, showTotals, ...rest } = props;

  if (showTotals) {
    headers.forEach(function iter(a, index) {
      a.Cell = ({ value }) => String(value || "0");
      a.Footer = (info) => {
        const total = info.rows.reduce((sum, row) => {
          if (!isNaN(row.values[a.accessor]))
            return row.values[a.accessor] + sum;
          else return sum;
        }, 0);
        let isString = isNaN(total) || !total;

        if (a.categoryColumn)
          return <div style={{ padding: "0.3rem" }}>Total</div>;
        else
          return isString ? (
            ""
          ) : (
            <div style={{ padding: "0.3rem" }}>{total}</div>
          );
      };
      Array.isArray(a.columns) && a.columns.forEach(iter);
    });
  }

  return <Table columns={headers} {...rest} />;
};
