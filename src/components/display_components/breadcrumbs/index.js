import React from "react";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";

export const DisplayBreadCrumbs = ({ children, ...rest }) => (
  <Breadcrumbs {...rest}>{children}</Breadcrumbs>
);
