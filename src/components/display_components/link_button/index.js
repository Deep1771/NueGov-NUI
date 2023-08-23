import React from "react";
import { Link, Typography } from "@material-ui/core";
import { withRouter } from "react-router";

export const LinkButton = ({ children, ...others }) => {
  const { history, location, match, onClick, staticContext, to, ...rest } =
    others;
  return (
    <Typography>
      <Link
        {...rest}
        style={{
          padding: "0px 10px 0px 10px",
          alignSelf: "center",
          display: "flex",
          fontFamily: "inherit",
        }}
        component="button"
        underline="none"
        onClick={(e) => {
          if (onClick) onClick(e);
          if (to) history.push(to);
        }}
      >
        {children}
      </Link>
    </Typography>
  );
};

export default withRouter(LinkButton);
