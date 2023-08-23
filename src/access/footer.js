import React, { useState, useEffect } from "react";
import { Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AuthFactory } from "utils/services/factory_services";

const useStyles = makeStyles(() => ({
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 1,
    minHeight: "3vh",
    width: "100vw",
    backgroundColor: "#f1f1f1",
  },
}));

export const Footer = () => {
  const classes = useStyles();

  const [footer, setFooter] = useState("");

  const { getDnsConfigs } = AuthFactory();

  useEffect(() => {
    (async () => {
      let response = await getDnsConfigs();
      response = response?.loginFooter || "Powered By NAVJOY";
      setFooter(response);
    })();
  }, []);

  return (
    <Paper elevation={0} className={classes.footer}>
      <Typography
        style={{
          fontFamily: "inherit",
          fontSize: ".8rem",
          color: "#212121",
          textAlign: "center",
        }}
      >
        {footer}
      </Typography>
    </Paper>
  );
};
