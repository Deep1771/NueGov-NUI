import React, { useState } from "react";
import { BARGenerator, QRGenerator } from "./components";
import {
  DisplayGrid,
  DisplaySwitch,
  DisplayText,
  DisplayButton,
} from "components/display_components";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  main: {
    display: "flex",
    flexDirection: "column",
    height: "inherit",
  },
  toggle: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  text: {
    fontSize: "14px",
    fontWeight: "400",
  },
  qrText: {
    padding: "0 1.5rem",
  },
  codeGenerator: {
    display: "flex",
    alignItems: "stretch",
  },
  button: {
    display: "flex",
    flex: 1,
    justifyContent: "flex-end",
    paddingRight: "1.5rem",
  },
}));

export const CodeGenerator = (props) => {
  const { qrCode, barCode, sys_gUid, download, ...rest } = props;
  const [toggle, setToggle] = useState(qrCode ? true : false);
  const classes = useStyles();

  const downloadPDF = () => {
    const canvas = document.getElementById(
      toggle ? "qr-gen" : "bar-gen"
    ).firstChild;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = toggle
      ? `${sys_gUid}_QR.png`
      : `${sys_gUid}_BAR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const renderToggle = () => {
    return (
      <DisplayGrid className={classes.toggle}>
        <DisplayText className={classes.text}>BAR</DisplayText>
        <DisplayGrid item direction="row" alignItems="center">
          <DisplaySwitch
            testid={`qr-bar-toggle`}
            onChange={(e, checked) => {
              setToggle(checked);
            }}
            checked={toggle}
          />
        </DisplayGrid>
        <DisplayText className={`${classes.text} ${classes.qrText}`}>
          QR
        </DisplayText>
      </DisplayGrid>
    );
  };
  return (
    <div className={classes.main}>
      {qrCode && barCode && renderToggle()}
      {toggle ? (
        <QRGenerator
          className={classes.codeGenerator}
          qrCode={qrCode}
          id="qr-gen"
        />
      ) : (
        <BARGenerator
          className={classes.codeGenerator}
          barCode={barCode}
          id="bar-gen"
        />
      )}
      {download && (
        <div className={classes.button}>
          <DisplayButton onClick={downloadPDF}>Download</DisplayButton>
        </div>
      )}
    </div>
  );
};
export default CodeGenerator;
