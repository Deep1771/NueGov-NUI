import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { DisplayButton } from "../button";

export const DisplayDialog = (props) => {
  const {
    cancelLabel,
    confirmLabel,
    message,
    onCancel,
    onConfirm,
    title,
    testid,
    content,
    showActionButtons,
    confirmButtonVariant,
    ...rest
  } = props;
  return (
    <Dialog onClose={onCancel} {...rest}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {message && <DialogContentText>{message}</DialogContentText>}
        {content}
      </DialogContent>
      {showActionButtons && (
        <DialogActions>
          {onCancel && (
            <DisplayButton
              testid={`${testid}-cancel`}
              systemVariant="secondary"
              onClick={onCancel}
            >
              {cancelLabel}
            </DisplayButton>
          )}
          {onConfirm && (
            <DisplayButton
              testid={`${testid}-save`}
              onClick={onConfirm}
              variant={confirmButtonVariant ? confirmButtonVariant : "text"}
            >
              {confirmLabel}
            </DisplayButton>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

DisplayDialog.defaultProps = {
  cancelLabel: "Cancel",
  confirmLabel: "Okay",
  fullWidth: true,
  maxWidth: "sm",
  showActionButtons: true,
};
