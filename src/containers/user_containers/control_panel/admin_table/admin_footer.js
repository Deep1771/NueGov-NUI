import React, { useContext, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useParams } from "react-router";
import queryString from "query-string";
import { DisplayPagination } from "components/display_components";
import GridServices from "./utils/services";
import { SummaryGridContext } from ".";

export const GridPagination = ({ appname, modulename, entityname }) => {
  const history = useHistory();
  const queryParams = queryString.parse(useLocation().search);
  const [{ dataCount, ITEM_PER_PAGE }] = useContext(SummaryGridContext);
  const { getData } = GridServices();
  let { page = 1, globalsearch } = queryParams;

  const BASE_URL = `/app/admin_panel/${entityname}`;

  const queryToUrl = (params) =>
    Object.keys(params || {})
      .map((key) => key + "=" + params[key])
      .join("&");

  const handlePageChange = (page) => {
    const params = { ...queryParams, page };
    history.push(`${BASE_URL}?${queryToUrl(params)}`);
    globalsearch ? getData(globalsearch, page) : getData(null, page);
  };

  return (
    <div style={{ padding: "0.5rem 0rem 0.5rem 0rem" }}>
      <DisplayPagination
        align="flex-end"
        totalCount={dataCount}
        itemsPerPage={ITEM_PER_PAGE}
        onChange={(e, p) => handlePageChange(p)}
        currentPage={page ? Number(page) : 1}
      />
    </div>
  );
};
