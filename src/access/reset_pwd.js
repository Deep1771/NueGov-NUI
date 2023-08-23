import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Link,
  Snackbar,
  InputAdornment,
  IconButton,
  Grow,
  CircularProgress,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Footer } from "./index";
import rstpwd from "utils/images/frgtpwd.png";
import { resetViaMail } from "utils/services/api_services/auth_service";
import { Visibility, VisibilityOff } from "@material-ui/icons/";

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
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ResetPwd = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [error1, setError1] = useState(false);
  const [error2, setError2] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [loader, setLoader] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const { token } = useParams();

  const handleChange1 = (val) => {
    if (!val.length) setError1("This field is required");
    setPassword(val);
    validateData(val);
  };

  const handleChange2 = (val) => {
    if (!val.length) setError2("This field is required");
    else if (password != val) setError2("Password did not match");
    else setError2(false);
    setconfirmPassword(val);
  };

  const regexp = new RegExp(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%&!^*()\-=_+[\]{}|;:`~'",.<>/?\\]).{6,20}$/
  );

  const validateData = (value) => {
    if (value) {
      if (regexp.test(value)) setError1(false);
      else
        setError1(
          "Enter strong password (Must include atleast : Special(@,!), Uppercase(A..Z), lowercase(a..z) , Numeric(0-9))"
        );
      if (value == confirmPassword) setError2(false);
      else if (value != confirmPassword) setError2("Password did not match");
    }
  };

  const handleShowPwd = (index) => {
    if (index == 1) setShowPassword1(!showPassword1);
    else if (index == 2) setShowPassword2(!showPassword2);
  };

  const resetPwd = () => {
    if (
      !(
        error1 ||
        error2 ||
        !(password.length && confirmPassword.length) ||
        loader
      )
    ) {
      setLoader(true);
      resetViaMail
        .create({}, { password, confirmPassword, token })
        .then((res) => {
          setErrorMsg(false);
          setLoader(false);
          setSuccessMsg(res.data + ", Redirecting to login page...");
          setTimeout(() => {
            setSuccessMsg(false);
            history.push("/");
          }, 3000);
        })
        .catch((e) => {
          setSuccessMsg(false);
          setLoader(false);
          setErrorMsg(e.data.data + ", Redirecting back...");
          setTimeout(() => {
            setErrorMsg(false);
            history.push("/forgot_pwd");
          }, 3000);
        });
    }
  };

  return (
    <div className={classes.main}>
      <div style={{ flex: 9, display: "flex" }}>
        <Grid
          container
          style={{ height: "100%", width: "100%", display: "flex", flex: 1 }}
        >
          <Grid
            item
            xs={0}
            sm={0}
            md={6}
            lg={8}
            className={classes.item_container}
            style={{ alignItems: "flex-end" }}
          >
            <img
              style={{ display: "flex", width: "60%", height: "60%" }}
              src={rstpwd}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={6}
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
              Reset your password
            </Typography>
            <Typography
              variant="subtitle1"
              style={{
                fontFamily: "inherit",
                color: "#666666",
                paddingBottom: 40,
              }}
            >
              Enter the new password to reset
            </Typography>
            <TextField
              style={{
                backgroundColor: "none",
                minWidth: 350,
                maxWidth: 350,
                paddingBottom: 20,
              }}
              size="small"
              type={!showPassword1 ? "password" : "text"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      style={{ cursor: "pointer" }}
                      aria-label="toggle password visibility1"
                      onClick={() => {
                        handleShowPwd(1);
                      }}
                      edge="end"
                    >
                      {showPassword1 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
              error={error1}
              disabled={false}
              id="standard-password-input1"
              variant="filled"
              helperText={error1}
              label="New Password"
              placeholder="Enter new password"
              title="New Password"
              onChange={(event) => {
                handleChange1(event.target.value);
              }}
              value={password ? password : ""}
            />
            <TextField
              style={{
                backgroundColor: "none",
                minWidth: 350,
                maxWidth: 350,
                paddingBottom: 30,
              }}
              size="small"
              required
              type={!showPassword2 ? "password" : "text"}
              onKeyPress={(ev) => {
                if (ev.key === "Enter") {
                  resetPwd();
                  ev.preventDefault();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      style={{ cursor: "pointer" }}
                      aria-label="toggle password visibility2"
                      onClick={() => {
                        handleShowPwd(2);
                      }}
                      edge="end"
                    >
                      {showPassword2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={error2}
              disabled={false}
              id="standard-password-input2"
              variant="filled"
              helperText={error2}
              label="Confirm New Password"
              placeholder="Retype new password"
              title="Confirm New Password"
              onChange={(event) => {
                handleChange2(event.target.value);
              }}
              value={confirmPassword ? confirmPassword : ""}
            />
            <Button
              style={{
                minWidth: 350,
                backgroundColor:
                  error1 ||
                  error2 ||
                  !(password.length && confirmPassword.length)
                    ? "#0000001f"
                    : "#0156ec",
                color: "white",
                cursor: "pointer",
              }}
              onClick={() => {
                resetPwd();
              }}
              disabled={
                error1 ||
                error2 ||
                !(password.length && confirmPassword.length) ||
                loader
              }
              variant="contained"
            >
              {!loader ? (
                <>Reset Password </>
              ) : (
                <>
                  Resetting password &nbsp;{" "}
                  <CircularProgress style={{ color: "white" }} size={20} />
                </>
              )}
            </Button>
            <br />
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

export default ResetPwd;
