import { AppBar, makeStyles, Tabs } from "@material-ui/core";
import React from "react";
import { ThemeFactory } from "utils/services/factory_services";

const useStyles = makeStyles(() => ({
  root: ({ dark }) => ({
    "& .MuiTabs-scrollButtons": {
      width: "30px",
      height: "30px",
      background: dark.bgColor,
      borderRadius: "50%",
      color: dark.text,
      margin: "0px 10px 0px 10px",
    },
    "& .MuiTabs-scroller": {
      alignSelf: "center",
      height: "100%",
    },
    "& .MuiTabs-flexContainer": {
      height: "100%",
    },
    minHeight: "inherit",
    height: "100%",
  }),
}));

export const SystemTabCarousel = (props) => {
  const { getVariantObj } = ThemeFactory();
  const classes = useStyles(getVariantObj("primary"));
  return (
    <>
      <AppBar position="static" color="#ffffff" style={{ ...props.style }}>
        <Tabs
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
          className={classes.root}
          style={{ height: "100%", alignItems: "center" }}
        >
          {props.children}
        </Tabs>
      </AppBar>
    </>
  );
};
