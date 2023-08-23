import React from "react";
import QRCode from "qrcode.react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  main: {
    display: "flex",
    flexDirection: "column",
    padding: "0 3rem",
    alignItems: "center",
    flex: "5",
    justifyContent: "center",
  },
}));

const QRGenerator = (props) => {
  const { qrCode } = props;
  const classes = useStyles();

  return (
    <div className={classes.main} id="qr-gen">
      <QRCode value={qrCode} size={300} includeMargin={true} />
    </div>
  );
};

export default QRGenerator;
