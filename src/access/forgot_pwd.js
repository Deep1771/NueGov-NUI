import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  Link,
  Grow,
  AppBar,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Footer } from "./index";
import frgtpwd from "utils/images/frgtpwd.png";
import { forgotPwd, landing } from "utils/services/api_services/auth_service";

const useStyles = makeStyles(() => ({
  main: {
    width: "100%",
    height: "100%",
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  item_container: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
}));

function Alert(props) {
  return (
    <MuiAlert testid="alertBox" elevation={6} variant="filled" {...props} />
  );
}

const ForgotPwd = () => {
  const [userEmail, setMail] = useState("");
  const [error, setError] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [loader, setLoader] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const url = window.location.href.split("forgot_pwd")[0];
  const [runtimeData, setRuntimeData] = useState({
    logo: "",
    poster: "",
    title: "",
    sub_text: "",
  });
  const [signInPath, setSignInPath] = useState("/");
  const handleChange = (val) => {
    if (!val.length) setError("Email is required");
    setMail(val);
    validateData(val);
  };

  const regexp = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  const validateData = (value) => {
    if (value) {
      if (regexp.test(value)) setError(false);
      else setError("Enter valid email");
    }
  };

  const getDnsConfigs = async () => {
    let url = window.location.href;
    return await landing.query({ url });
  };

  const renderLogo = () => {
    let { logo } = runtimeData;
    return (
      <>
        &nbsp;&nbsp;
        <img style={{ height: "45px", maxWidth: "275px" }} src={logo} />
      </>
    );
  };

  useEffect(() => {
    (async () => {
      let response = await getDnsConfigs();
      setRuntimeData(response);
      if (response?.title === "NUEGOV") setSignInPath("/signin");
    })();
  }, []);

  const renderNavbar = () => {
    return (
      <AppBar
        elevation={0}
        container
        style={{ backgroundColor: "transparent" }}
        alignItems="center"
      >
        <Grid
          item
          container
          xs={12}
          sm={12}
          md={3}
          lg={4}
          xl={4}
          alignContent="center"
          style={{ padding: "5px" }}
        >
          {renderLogo()}
        </Grid>
        <Grid
          item
          container
          xs={12}
          sm={12}
          md={9}
          lg={8}
          xl={8}
          justify="flex-end"
          alignItems="center"
          style={{ padding: "5px" }}
          className="hide_autofill"
        ></Grid>
      </AppBar>
    );
  };

  const sendMail = () => {
    if (!(error || !userEmail.length || loader)) {
      setLoader(true);
      forgotPwd
        .create({}, { userEmail, url })
        .then((res) => {
          setLoader(false);
          setErrorMsg(false);
          setSuccessMsg(res.data);
          setTimeout(() => {
            setSuccessMsg(false);
          }, 5000);
        })
        .catch((e) => {
          setLoader(false);
          setSuccessMsg(false);
          setErrorMsg(e.data.data);
          setTimeout(() => {
            setErrorMsg(false);
          }, 5000);
        });
    }
  };
  return (
    <div className={classes.main}>
      <div className={classes.navbar}>{renderNavbar()}</div>
      <div style={{ flex: 9, display: "flex" }}>
        <Grid
          container
          style={{ height: "100%", width: "100%", display: "flex", flex: 1 }}
        >
          <Grid
            item
            xs={0}
            sm={0}
            md={7}
            lg={8}
            className={classes.item_container}
            style={{ alignItems: "flex-end" }}
          >
            <img
              style={{ display: "flex", width: "60%", height: "60%" }}
              src={frgtpwd}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={5}
            lg={4}
            className={classes.item_container}
            style={{ alignItems: "center" }}
          >
            <Typography
              variant="h4"
              style={{
                fontFamily: "inherit",
                color: "#666666",
                paddingBottom: 10,
                fontWeight: "600",
                paddingTop: 10,
              }}
            >
              Forgot your password ?
            </Typography>
            <Typography
              variant="subtitle1"
              style={{
                fontFamily: "inherit",
                color: "#666666",
                paddingBottom: 40,
                paddingTop: 10,
              }}
            >
              Don't worry! Resetting your password is easy.
              <br />
              Just type in the contact email you registered
            </Typography>
            <TextField
              style={{
                backgroundColor: "none",
                minWidth: 330,
                maxWidth: 330,
                paddingBottom: 30,
              }}
              error={error}
              disabled={false}
              id="standard-outlined"
              label="Email"
              variant="filled"
              placeholder="Enter your contact mail"
              title="Email"
              helperText={error}
              type="email"
              size="small"
              onKeyPress={(ev) => {
                if (ev.key === "Enter") {
                  sendMail();
                  ev.preventDefault();
                }
              }}
              required
              onChange={(event) => {
                handleChange(event.target.value);
              }}
              value={userEmail ? userEmail : ""}
            />
            <Button
              testid="sendMail"
              style={{
                minWidth: 330,
                backgroundColor:
                  error || !userEmail.length ? "none" : "#0156ec",
                color: "white",
                cursor: "pointer",
              }}
              onClick={() => {
                sendMail();
              }}
              disabled={error || !userEmail.length}
              variant="contained"
            >
              {!loader ? (
                <>Send mail</>
              ) : (
                <>
                  Sending mail &nbsp;{" "}
                  <CircularProgress style={{ color: "white" }} size={20} />
                </>
              )}
            </Button>
            <Typography
              variant="subtitle1"
              style={{
                fontFamily: "inherit",
                color: "#666666",
                paddingBottom: 20,
                paddingTop: 20,
              }}
            >
              Did you remember your password ?{" "}
              <Link
                underline="always"
                onClick={() => {
                  history.push(signInPath);
                }}
                style={{ fontWeight: "600", cursor: "pointer" }}
              >
                Try logging in
              </Link>
            </Typography>
            {(successMsg || errorMsg) && (
              <Grow in={true} timeout={500}>
                <Alert severity={successMsg ? "success" : "error"}>
                  {successMsg || errorMsg || false}
                </Alert>
              </Grow>
            )}
          </Grid>
        </Grid>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPwd;
