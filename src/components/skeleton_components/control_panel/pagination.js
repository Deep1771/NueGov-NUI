import React from "react";
import { Pagination, Skeleton } from "@material-ui/lab";
import { DisplayGrid } from "components/display_components";

export const PaginationSkeleton = () => {
  return (
    <DisplayGrid
      item
      container
      xs={10}
      sm={6}
      md={4}
      lg={4}
      xl={4}
      alignItems="center"
      style={{ height: "41px" }}
    >
      <div style={{ display: "flex", flexGrow: 1 }}>
        <Skeleton style={{ width: "50%", height: "30px" }} />
      </div>
      <div style={{ display: "flex", flexShrink: 10 }}>
        <Pagination
          size="small"
          count={2}
          onChange={() => {}}
          page={1}
          disabled
        />
      </div>
    </DisplayGrid>
  );
};
