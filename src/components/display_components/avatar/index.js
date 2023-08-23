import React from "react";
import { Avatar } from "@material-ui/core";

export const DisplayAvatar = ({ children, ...rest }) => {
  return <Avatar {...rest}>{children}</Avatar>;
};
