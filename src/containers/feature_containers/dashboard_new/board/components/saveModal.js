import React, { useEffect } from "react";
import { DisplayDialog, DisplayButton } from "components/display_components";
import { useStateValue } from "utils/store/contexts";

export const SaveModal = (props) => {
  const { onClose, openDialog, onContinue, action } = props;
  const [{ dashboardState }, dispatch] = useStateValue();
  let { boardSetUpdated, boardUpdated } = dashboardState;
  const intializeSave = (prop) => {
    dispatch({
      type: "TRIGGER_SAVE",
      payload: prop,
    });
    // onContinue && onContinue(action)
    onClose();
  };

  const onDiscard = () => {
    boardUpdated &&
      dispatch({
        type: "BOARD_UPDATE",
        payload: false,
      });
    boardSetUpdated &&
      dispatch({
        type: "BOARD_SET_UPDATE",
        payload: false,
      });
    onContinue && onContinue(action);
    onClose();
  };

  return (
    <DisplayDialog
      open={openDialog}
      title={"Unsaved changes in your Board"}
      message={"Do you want to save or discard them ?"}
      confirmLabel={"Save"}
      onConfirm={() => {
        intializeSave(true);
      }}
      onCancel={onDiscard}
      cancelLabel={"Discard"}
      onClose={onClose}
      style={{ zIndex: 10010 }}
    />
  );
};
