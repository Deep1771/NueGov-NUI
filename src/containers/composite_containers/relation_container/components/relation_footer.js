import React from "react";
import { DisplayGrid, DisplayPagination } from "components/display_components/";

export const RelationFooter = (props) => {
  let { totalCount, itemsPerPage, handlePageChange, currentPage } = props;
  return (
    <DisplayGrid item display="flex">
      <DisplayPagination
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
        onChange={handlePageChange}
        currentPage={currentPage}
      />
    </DisplayGrid>
  );
};
