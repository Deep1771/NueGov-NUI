import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import {
  DisplayModal,
  DisplayIcon,
  DisplayDialog,
} from "components/display_components";
import { SystemIcons } from "utils/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  main: { display: "flex", flexDirection: "column", padding: "3rem" },
  icon: {
    fontSize: "35px",
    position: "absolute",
    top: -28,
    right: -28,
    cursor: "pointer",
    color: "white",
  },
  paperProps: { overflow: "visible" },
}));

const ScannerModal = (props) => {
  const { onClose, onSuccessCallback, scannerTimeout } = props;
  const { HighlightOffTwoTone } = SystemIcons;

  const [value, setValue] = useState(null);
  const [dialog, setDialog] = useState({ dialog: false });
  const [stopStream, setStopStream] = useState(false);
  const classes = useStyles();

  const onUpdate = (err, result) => {
    console.log("hello from the onUpdate -> ", result);
    if (result) {
      setValue({ format: result.format, text: result.text });
      setStopStream(true);
    }
  };
  const onError = (error) => {
    if (error) {
      let errorModal = {
        dialog: true,
        title: "Please check your camera access",
      };
      setDialog(errorModal);
    }
  };

  useEffect(() => {
    if (value) {
      onSuccessCallback({
        format: value.format,
        text: value.text,
      });
      onClose(false);
    }
  }, [value]);

  useEffect(() => {
    console.log("comes for the scanner");
    if (!value) {
      setTimeout(() => {
        let exitModal = {
          dialog: true,
          title: "Unable to detect code, please try again",
          confirmLabel: "Scan Again",
          onConfirm: () => {
            setDialog({ dialog: false });
          },
        };
        setDialog(exitModal);
      }, scannerTimeout);
    }
  }, []);

  return (
    <>
      <DisplayModal
        maxWidth="md"
        open={true}
        PaperProps={{ className: classes.paperProps }}
      >
        <div className={classes.main}>
          {
            <BarcodeScannerComponent
              style={{ height: "325px" }}
              width={400}
              onUpdate={onUpdate}
              onError={onError}
              stopStream={stopStream}
            />
          }

          <DisplayIcon
            onClick={() => onClose(false)}
            name={HighlightOffTwoTone}
            className={classes.icon}
            systemVariant="default"
          />
        </div>
      </DisplayModal>

      <DisplayDialog
        testid={"scannerDailog"}
        open={dialog.dialog}
        title={dialog.title}
        message={dialog.msg}
        confirmLabel={dialog.confirmLabel}
        onConfirm={dialog.onConfirm}
        onCancel={() => {
          setDialog({ dialog: false });
          onClose(false);
        }}
      />
    </>
  );
};

ScannerModal.defaultProps = {
  scannerTimeout: 30000,
};

export default ScannerModal;
