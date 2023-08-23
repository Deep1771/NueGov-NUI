import React from "react";
import { useMediaQuery } from "react-responsive";
import { Avatar, Divider, Typography } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

export const SideNavSkeleton = () => {
  const isLargeScreen = useMediaQuery({ query: "(min-device-width: 1920px)" });
  const isMediumScreen = useMediaQuery({ query: "(min-device-width: 1280px)" });

  const ITEMS = isLargeScreen ? 13 : isMediumScreen ? 10 : 8;

  return (
    <div
      style={{
        dislay: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* <Skeleton */}
      <Skeleton width="80%" style={{ margin: "0% 5%" }}>
        <Typography variant={"h3"}>.</Typography>
      </Skeleton>
      <Divider style={{ margin: "1% 0%" }} />
      {Array(ITEMS)
        .fill(ITEMS)
        .map((e, id) => (
          <div style={{ display: "flex", margin: "10% 5%" }} key={id}>
            <Skeleton variant="circle">
              <Avatar />
            </Skeleton>
            &emsp;
            <Skeleton width="80%">
              <Typography variant={"body1"}>.</Typography>
            </Skeleton>
          </div>
        ))}
    </div>
  );
};
