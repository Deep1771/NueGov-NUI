import React from "react";
import { useStateValue } from "utils/store/contexts";
import { GlobalFactory } from "utils/services/factory_services";
import {
  DisplayBackdrop,
  DisplaySnackbar,
} from "components/display_components";

export const GlobalComponent = (props) => {
  const [{ configState }] = useStateValue();
  const { closeSnackBar } = GlobalFactory();
  const { backDrop, snackBar } = configState;

  return (
    <>
      <DisplayBackdrop {...backDrop} />
      <DisplaySnackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        {...snackBar}
        onClose={() => {
          closeSnackBar();
        }}
      />
    </>
  );
};
