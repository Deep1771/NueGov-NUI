import React from "react";
import {
  useTable,
  useBlockLayout,
  usePagination,
  useSortBy,
  useResizeColumns,
} from "react-table";
import { useExportData } from "react-table-plugins";
import { DisplayButton } from "components/display_components";
import { isDefined } from "utils/services/helper_services/object_methods";
import "./table.css";

const Table = ({
  columns,
  data,
  initialState,
  plotId,
  title,
  hideDownload,
  pdfLabel,
  pdfButtonLabel,
}) => {
  let headerHeight = 40;
  const getExportFileBlob = () => {
    const doc = new window.jspdf.jsPDF("l", "pt");
    title && doc.text(`${title} `, 40, 40);
    doc.setFontSize(12);
    pdfLabel &&
      pdfLabel.length &&
      pdfLabel.map((val) => {
        if (val.data && isDefined(val.data)) {
          headerHeight = headerHeight + 20;
          val.title
            ? doc.text(`${val.title} : ${val.data}`, 40, headerHeight)
            : doc.text(`${val.data}`, 40, headerHeight);
        }
      });
    doc.autoTable({
      html: `#${plotId}`,
      margin: { top: headerHeight + 20 },
      didDrawPage: function (data) {
        data.settings.margin.top = 30;
      },
      theme: "grid",
      styles: {
        fontSize: 11,
        cellWidth: "auto",
      },
      columnStyles: { cellWidth: "auto" },
      //overflow: 'linebreak',
      showFoot: "lastPage",
      tableWidth: "wrap",
      horizontalPageBreak: true,
      headStyles: {
        fillColor: "#f2f2f2",
        fontSize: 12,
        textColor: 70,
        lineWidth: 1,
        lineColor: "#ffffff",
      },
      footStyles: {
        fillColor: "#f2f2f2",
        fontSize: 12,
        textColor: 70,
        lineWidth: 1,
        lineColor: "#ffffff",
      },
    });
    doc.save(`${title}.pdf`);
  };
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    prepareRow,
    page,
    exportData,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      getExportFileBlob,
      //canExport: true,
      initialState: { pageIndex: 0, ...initialState, pageSize: data.length },
    },
    useSortBy,
    usePagination,
    useBlockLayout,
    useResizeColumns,
    useExportData
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {!hideDownload && (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <DisplayButton onClick={() => exportData()} size="small">
            {pdfButtonLabel ? pdfButtonLabel : "Download PDF"}
          </DisplayButton>
        </div>
      )}
      <div className="TableWrap hideScroll">
        <table className="hideScroll" id={plotId} {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽 "
                          : " 🔼 "
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            {footerGroups.map((group) => (
              <tr {...group.getFooterGroupProps()}>
                {group.headers.map((column) => (
                  <td {...column.getFooterProps()}>
                    {column.render("Footer")}
                  </td>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Table;
