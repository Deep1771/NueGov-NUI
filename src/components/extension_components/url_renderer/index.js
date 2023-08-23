import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Typography, Snackbar } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  main: {
    display: "flex",
    flexDirection: "row",
    border: "1px solid #c2c4c5",
    borderRadius: "0.3rem",
  },
  btn: {
    color: "#ffff",
    backgroundColor: "#16589b",
    "&:hover": {
      backgroundColor: "#1965b1",
      color: "#ffff",
    },
  },
  getDiv: { display: "flex", flexShrink: 1, margin: "10px" },
  urlDiv: {
    display: "flex",
    flexGrow: 1,
    margin: "10px",
    alignItems: "center",
    overflow: "scroll",
  },
  copyDiv: { display: "flex", flexShrink: 1, alignItems: "center" },
}));

const URLRenderer = (props) => {
  const { dataObj } = props;
  const { url, version, agencyName } = dataObj;
  const [snackBar, setSnackbar] = useState(false);
  const classes = useStyles();

  const getURL = () => {
    window.open(url, "_blank");
  };

  const copyURL = () => {
    const el = document.createElement("textarea");
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setSnackbar(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Typography>{agencyName}</Typography>
      <div className={classes.main}>
        <div className={classes.getDiv}>
          <Button variant="contained" className={classes.btn} onClick={getURL}>
            GET
          </Button>
        </div>
        <div className={`${classes.urlDiv} hide_scroll`}>
          <Typography>{url}</Typography>
        </div>
        <div className={`${classes.getDiv} ${classes.copyDiv}`}>
          <Typography>Version : {version}</Typography> &nbsp;&nbsp;&nbsp;&nbsp;
          <Button variant="contained" className={classes.btn} onClick={copyURL}>
            Copy
          </Button>
        </div>
      </div>
      <br />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackBar}
        onClose={() => setSnackbar(false)}
        message="Copied to clipboard"
        autoHideDuration={3000}
      />
    </div>
  );
};

export default URLRenderer;
