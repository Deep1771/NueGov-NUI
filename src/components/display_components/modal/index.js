import React from "react";
import { Dialog, DialogContent, DialogTitle, Grow } from "@material-ui/core";
import StyleSheet from "utils/stylesheets/display_component";

export const DisplayModal = ({
  children,
  title,
  dailogContentProps,
  ...rest
}) => {
  const { useModalStyles, useDialogContentStyles } = StyleSheet();
  const classes = useModalStyles();
  const contentClasess = useDialogContentStyles();
  return (
    <Dialog {...rest} classes={{ root: classes.root }}>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <Grow in={true} timeout={200}>
        <DialogContent
          classes={{ root: contentClasess.root }}
          style={{ paddingTop: "0px" }}
          {...dailogContentProps}
        >
          {children}
        </DialogContent>
      </Grow>
    </Dialog>
  );
};

DisplayModal.defaultProps = {
  disableRestoreFocus: true,
  disableEnforceFocus: true,
  dailogContentProps: {},
};
