import React from "react";
import { Snackbar } from "@material-ui/core";
import { DisplayIconButton } from "../icon_button";
import { SystemIcons } from "utils/icons";
import { Alert, AlertTitle } from "@material-ui/lab";

export const DisplaySnackbar = ({ onClose, ...rest }) => {
  let { message, severity } = rest;
  return (
    <Snackbar
      testid="snackBar"
      style={{ zIndex: 30000 }}
      action={
        <DisplayIconButton size="small" onClick={onClose}>
          <SystemIcons.Close fontSize="small" />
        </DisplayIconButton>
      }
      onClose={onClose}
      {...rest}
    >
      <Alert severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
DisplaySnackbar.defaultProps = {
  anchorOrigin: { vertical: "top", horizontal: "center" },
  autoHideDuration: 4000,
};
