import React from "react";
import { Drawer } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

export const DisplayDrawer = ({ children, width, ...rest }) => {
  const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: (props) => props?.marginTop || "55px",
      zIndex: theme.zIndex.appBar - 1,
      width: (props) => (props?.width ? props?.width : width),
      padding: "none",
      backgroundColor: (props) =>
        props?.backgroundColor ? props?.backgroundColor : "",
      position: (props) => (props.position ? props.position : ""),
      height: (props) => (props.height ? props.height : ""),
    },
  }));
  const classes = useStyles(rest.style);
  return (
    <Drawer classes={{ root: classes.root, paper: classes.paper }} {...rest}>
      {children}
    </Drawer>
  );
};
DisplayDrawer.defaultProps = {
  anchor: "right",
  width: "auto",
};
