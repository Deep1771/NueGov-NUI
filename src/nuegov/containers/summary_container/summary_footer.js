import React, { useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";
import { DisplayPagination } from "components/display_components";
import GridServices from "./utils/services";
import { SummaryGridContext } from ".";
import { get, isDefined } from "utils/services/helper_services/object_methods";

export const GridPagination = (props) => {
  const history = useHistory();
  const {
    appname,
    modulename,
    entityname,
    screenType,
    relatedEntityInfo,
    handleRowLimit,
    // archiveMode,
  } = props;
  const [gridProps, dispatch] = useContext(SummaryGridContext);
  const {
    pageNumber,
    metadata,
    selectedRows,
    archiveMode,
    sortInfo,
    globalsearch,
  } = gridProps;
  const queryParams = queryString.parse(useLocation().search);
  const [{ dataCount, ITEM_PER_PAGE }] = useContext(SummaryGridContext);
  const { getData } = GridServices();
  let { page = 1, ...rest } = queryParams;
  let [relSummaryPage, SetRelaSummaryPage] = useState(1);
  const { summaryRowFilters } = get(metadata, "sys_entityAttributes");
  const { archiveConfig } = metadata?.sys_entityAttributes || {};
  const BASE_URL = `/app/summary/${appname}/${modulename}/${entityname}`;

  const queryToUrl = (params) =>
    Object.keys(params || {})
      .map((key) => key + "=" + params[key])
      .join("&");

  const isRelation = () =>
    screenType === "RELATION" &&
    relatedEntityInfo &&
    Object.keys(relatedEntityInfo).length;

  const handlePageChange = (page) => {
    dispatch({
      type: "PAGE_NUMBER",
      payload: {
        pageNumber: page,
        loader: true,
      },
    });
    if (isRelation()) {
      SetRelaSummaryPage(page);
      if (archiveConfig?.archive) {
        getData(
          globalsearch,
          page,
          { archiveMode, sortby: sortInfo?.sortby, orderby: sortInfo.orderby },
          "RELATION",
          relatedEntityInfo,
          selectedRows
        );
      } else {
        getData(
          globalsearch,
          page,
          { sortby: sortInfo?.sortby, orderby: sortInfo.orderby },
          "RELATION",
          relatedEntityInfo,
          selectedRows
        );
      }
    } else {
      if (archiveConfig?.archive) {
        const params = { ...queryParams, page };
        history.push(`${BASE_URL}?${queryToUrl(params)}`);
        globalsearch
          ? getData(globalsearch, page, { archiveMode, ...rest })
          : getData(null, page, { archiveMode, ...rest }, "", "", selectedRows);
      } else {
        const params = { ...queryParams, page };
        history.push(`${BASE_URL}?${queryToUrl(params)}`);
        globalsearch
          ? getData(globalsearch, page, rest, "", "", selectedRows)
          : getData(null, page, rest, "", "", selectedRows);
      }
    }
  };

  useEffect(() => {
    //     history.push(`${BASE_URL}`);
  }, [archiveMode]);

  // const clearSelectedItems = () => {
  //   dispatch({
  //     type: "SELECTED_DATA",
  //     payload: {
  //       selectedRows: [],
  //     },
  //   });
  // };
  return (
    <div
      style={{
        padding: "0.5rem 0.5rem 0.5rem 0.5rem",
        backgroundColor: "#ffffff",
        border: "1px solid #ebebeb",
        marginBottom: "8px",
        borderRadius: "4px",
        width: "100%",
      }}
    >
      <DisplayPagination
        align="flex-end"
        totalCount={dataCount}
        itemsPerPage={ITEM_PER_PAGE}
        onChange={(e, p) => {
          // clearSelectedItems();
          handlePageChange(p);
        }}
        handleRowLimit={handleRowLimit}
        summaryRowFilters={summaryRowFilters}
        currentPage={
          isRelation()
            ? relSummaryPage
              ? Number(relSummaryPage)
              : 1
            : page
            ? Number(page)
            : 1
        }
      />
    </div>
  );
};
