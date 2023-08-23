import React from "react";
import { Toolbar } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { AppBarWrapper } from "components/wrapper_components";
import { DisplayIconButton, DisplayText } from "components/display_components";
import { SystemIcons } from "utils/icons";

export const NavbarSkeleton = () => {
  const { AppsIcon, AccountCircle } = SystemIcons;
  return (
    <AppBarWrapper position="relative">
      <Toolbar>
        <div style={{ flex: 2, display: "flex", flexDirection: "row" }}>
          <DisplayText variant="h4" noWrap>
            NUEGOV
          </DisplayText>
        </div>
        <div style={{ display: "flex", flex: 10 }}>
          {[1, 2, 3].map((e, i) => (
            <Skeleton
              key={i}
              variant="rect"
              style={{
                width: "100px",
                borderRadius: "4px",
                margin: "1vw",
                padding: "0.4vh",
                backgroundColor: "#868282",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", flex: 8, flexDirection: "row-reverse" }}>
          <DisplayIconButton onClick={() => {}}>
            <AccountCircle />
          </DisplayIconButton>
          <DisplayIconButton
            onClick={() => {}}
            style={{ padding: "0px 10px 0px 10px" }}
          >
            <AppsIcon />
          </DisplayIconButton>
        </div>
      </Toolbar>
    </AppBarWrapper>
  );
};
