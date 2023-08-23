import React from "react";
import Barcode from "react-barcode";
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

export const BARGenerator = (props) => {
  const { barCode } = props;
  const classes = useStyles();

  return (
    <div className={classes.main}>
      <div id="bar-gen" className={classes.bargen}>
        <Barcode value={barCode} width={1} renderer="canvas" />
      </div>
    </div>
  );
};

export default BARGenerator;
