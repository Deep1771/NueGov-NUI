import React from "react";
import Box from "@material-ui/core/Box";

export const BoxWrapper = ({ children, ...rest }) => {
  return <Box {...rest}>{children}</Box>;
};
