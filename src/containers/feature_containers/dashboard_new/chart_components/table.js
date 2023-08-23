import React, { useEffect, useState } from "react";
import { DisplayDataTable } from "components/display_components";

export const Table = (props) => {
  const { data: DATA, layout, totalTraces, config, plotId } = props;
  const { title, pdfLabel, pdfButtonLabel } = layout;

  //states
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(false);

  //methods
  const getAccessorString = (str) => trimSpaces(str.toString().toLowerCase());
  const trimSpaces = (str) => str.replace(/ /g, "");

  //Use Effects
  useEffect(() => {
    let headers = [];
    let data = {};
    let hiddenColumns = [];

    const constructHeader = () => {
      let { totalGroupBy } = DATA[0];
      let parent = [];
      let childrens = [];

      const constructParentArray = () => {
        DATA.map((ed) => {
          let { result } = ed;
          result.map((e) => {
            parent.push(e["x1"]);
          });
        });
        parent = [...new Set(parent)];
      };

      const constructChildrenArray = () => {
        // childrens
        for (let i = 2; i <= totalGroupBy; i++) {
          let childs = [];
          DATA.map((ed) => {
            let { result } = ed;
            result.map((e) => {
              childs.push(e[`x${i}`]);
            });
          });
          let uniqueItems = [...new Set(childs)];
          childrens.push(uniqueItems);
        }
      };

      const apppendChildren = (el, level, prefix = "") => {
        if (childrens[level]) {
          let columns = childrens[level].map((elem) => {
            if (childrens[level + 1]) {
              return apppendChildren(elem, level + 1, `${prefix}_${el}`);
            } else {
              let accessor = getAccessorString(`${prefix}_${el}_${elem}`);
              hiddenColumns.push(accessor);
              return {
                Header: elem.toString(),
                accessor,
              };
            }
          });
          return {
            Header: el.toString(),
            columns,
          };
        } else {
          let accessor = getAccessorString(`${prefix}_${el}`);
          hiddenColumns.push(accessor);
          return {
            Header: el.toString(),
            accessor,
          };
        }
      };

      const constructHeaderArray = () => {
        if (totalTraces > 1) {
          headers.push({
            Header: layout.categoryLabel || " ",
            accessor: "label",
            categoryColumn: true,
            Cell: ({ value }) => <b>{String(value)}</b>,
          });
        }
        headers = [...headers, ...parent.map((el) => apppendChildren(el, 0))];
      };

      constructParentArray();
      if (parent && parent.length) {
        constructChildrenArray();
        constructHeaderArray();
      }
    };

    const constructData = () => {
      data = DATA.map((ed) => {
        let { result, TraceOptions } = ed;
        let { label } = TraceOptions;

        data = result.reduce((dataObj, er) => {
          let { y1, ...rest } = er;
          let path = Object.keys(rest).map((el) =>
            getAccessorString(`_${rest[el]}`)
          );
          dataObj[`${path.join("")}`] = y1;
          return dataObj;
        }, {});
        data["label"] = label;

        return data;
      });
    };

    const constructHiddenColumns = () => {
      hiddenColumns = hiddenColumns.filter((eh) => {
        return !data.some((ed) => ed[eh]);
      });
    };

    constructHeader();
    constructData();
    constructHiddenColumns();

    if (headers && headers.length)
      setChartData({
        headers,
        data,
        initialState: {
          hiddenColumns: layout.showEmptyColumns ? [] : hiddenColumns,
        },
      });
    else setError(true);
  }, []);

  if (error)
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
        }}
      >
        NO DATA FOUND
      </div>
    );
  else
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "flex-start",
          padding: config.hideTitle ? "0px" : "100px 35px",
          overflow: "auto",
        }}
        className="hide_scroll"
      >
        {chartData && (
          <DisplayDataTable
            {...chartData}
            plotId={plotId}
            showTotals={layout.showTotals}
            title={title.text}
            pdfLabel={pdfLabel}
            hideDownload={layout.hideDownload}
            pdfButtonLabel={pdfButtonLabel}
          />
        )}
      </div>
    );
};
