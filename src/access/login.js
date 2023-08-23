import React, { useState, useEffect } from "react";
import queryString from "query-string";
import {
  signin,
  user,
  landing,
  entity,
} from "utils/services/api_services/auth_service";
import { Route, Redirect, useLocation, useHistory } from "react-router-dom";
import { AuthFactory, GlobalFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import { makeStyles } from "@material-ui/core/styles";
import { useStateValue } from "utils/store/contexts";
import {
  IconButton,
  InputAdornment,
  Button,
  Card,
  CircularProgress,
  TextField,
  Typography,
  Link,
  Grid,
  AppBar,
  Divider,
} from "@material-ui/core";
import { BubbleLoader } from "components/helper_components";
import { Footer } from "./footer";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { setBrowserDetails, setMyIp } from "utils/helper_functions";

const useStyles = makeStyles((theme) => ({
  main: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    justifyContent: "center",
    alignItems: "center",
  },
  paper: {
    display: "flex",
    height: "100%",
    width: "100%",
    backgroundColor: "transparent",
    "@media (max-width:1024px)": {
      flexDirection: "column",
    },
  },

  footer: {
    display: "flex",
    flexShrink: 1,
    width: "100%",
    alignItems: "center",
  },
  landing: {
    display: "flex",
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    overflow: "auto",
  },
  brandimage: {
    display: "flex",
    flex: 7,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  brandtitle: {
    display: "flex",
    flex: 4,
    height: "100%",
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#ffffff",
  },
  divider: {
    // Theme Color, or use css color in quote
    background: "white",
    marginBottom: "1rem",
  },
}));

const Login = (props) => {
  let { runtimeData: runTimeData } = props || {};
  const [password, setPassword] = useState();
  const [username, setUsername] = useState();
  const [error, setError] = useState("");
  const [isLoading, setLoader] = useState(true);
  const [loginLoader, setLoginloader] = useState(false);
  const { isAuthenticated, token } = AuthFactory();
  const [authFlag, setAuthFlag] = useState(false);
  const [passwordIsMasked, setPasswordIsMasked] = useState(true);
  const { setUserConfigurations, getInitialNavBarPath, setContextHelperData } =
    GlobalFactory();
  const dispatch = useStateValue()[1];
  const [runtimeData, setRuntimeData] = useState({
    logo: "",
    poster: "",
    title: "",
    sub_text: "",
  });
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { from } = location.state || {};
  const { redirect } = queryParams;
  const classes = useStyles();

  const getDnsConfigs = async () => {
    let url = window.location.href;
    return await landing.query({ url });
  };

  const checkAuthBeforeLogin = () => {
    if (token) {
      user
        .get({ src: "web" })
        .then((res) => {
          setUserConfigurations(res.data);
          isAuthenticated()
            .then((resp) => {
              setAuthFlag(resp);
              setLoader(false);
            })
            .catch((e) => setLoader(false));
        })
        .catch((e) => setLoader(false));
    } else {
      setAuthFlag(false);
      setLoader(false);
    }
  };

  useEffect(() => {
    let applicationTitle = runtimeData?.title || "NUEGOV";
    document.title = applicationTitle;
    sessionStorage.setItem("applicationTitle", document.title);
  }, [runtimeData]);

  useEffect(() => {
    (async () => {
      setMyIp();
      setBrowserDetails();
      let response = await getDnsConfigs();
      setRuntimeData(response);
    })();
    // (async () => {
    //   let response = await getDnsConfigs();
    setRuntimeData(runTimeData);
    // })();
    checkAuthBeforeLogin();
  }, []);

  const history = useHistory();
  const handleLogin = async () => {
    let loginInfo = await signin.create({}, { username, password });
    if (loginInfo.success) {
      setLoginloader(false);
      setTimeout(() => {
        dispatch({
          type: "SET_SUMMARY_LEGEND",
          payload: {},
        });
        dispatch({
          type: "SET_SUMMARY_SUBALAYERS",
          payload: {},
        });
      }, 0);
      sessionStorage.removeItem("currentTab");
      sessionStorage.setItem("x-access-token", loginInfo.token);
      let data = get(loginInfo, "data");
      let businessType = get(
        data,
        "sys_agencyData.sys_entityAttributes.businessTypeInfo.businessType"
      );
      const contextInfo = get(loginInfo, "contextualHelpers");
      setUserConfigurations(data);
      setContextHelperData(contextInfo);
      let redirectTo =
        !redirect && from
          ? `${from.pathname}${from.search}`
          : getInitialNavBarPath({
              userData: data,
              businessType,
              analyticsAccess: checkAnalyticsAccess(data),
            });
      history.push(redirectTo);
    } else {
      setLoginloader(false);
      loginInfo.message && setError(loginInfo.message);
    }
  };

  const checkAnalyticsAccess = (userData) => {
    let role = get(userData, "sys_entityAttributes.role");
    if (role && role.toUpperCase() === "ASSETGOV-ADMIN") return true;
    else
      try {
        return get(userData, "Permissions")
          .apps.find((a) => a.name === "Features")
          .modules.find((m) => m.name === "Insights");
      } catch (e) {
        return false;
      }
  };

  const togglePasswordMask = () => {
    setPasswordIsMasked(!passwordIsMasked);
  };

  const renderLogin = () => {
    return (
      <Card
        elevation={0}
        style={{
          display: "flex",
          flexDirection: "column",
          width: 300,
          backgroundColor: "transparent",
        }}
      >
        <Typography
          variant="h4"
          style={{ marginBottom: "1rem", color: "#ffffff" }}
        >
          Login
        </Typography>
        <Divider
          variant="fullWidth"
          classes={{ root: classes.divider }}
        ></Divider>
        <TextField
          variant="outlined"
          size="small"
          margin="none"
          error={error}
          helperText={error || " "}
          disabled={false}
          id="standard-basic"
          testid="lg-username"
          placeholder="Enter your Username"
          onChange={(event) => setUsername(event.target.value)}
          value={username ? username : ""}
          InputProps={{
            className: classes.input,
          }}
        />
        <TextField
          variant="outlined"
          size="small"
          error={error}
          onKeyPress={(ev) => {
            if (ev.key === "Enter") {
              setError("");
              if (!loginLoader && username && password) {
                setLoginloader(true);
                handleLogin();
              }
              ev.preventDefault();
            }
          }}
          InputProps={{
            className: classes.input,
            type: passwordIsMasked ? "password" : "text",
            autoComplete: "new-password",
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordMask}
                  edge="end"
                >
                  {passwordIsMasked ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          disabled={false}
          margin="none"
          id="standard-password-input"
          testid="lg-password"
          placeholder="Enter your Password"
          onChange={(event) => setPassword(event.target.value)}
          value={password ? password : ""}
        />{" "}
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Button
              style={{
                width: "150px",
                backgroundColor: "#ffffff",
                marginTop: ".5rem",
              }}
              variant="contained"
              disabled={false}
              id="lg-btn"
              testid="lg-btn"
              onClick={() => {
                if (!loginLoader && username && password) {
                  setLoginloader(true);
                  handleLogin();
                } else {
                  setError("Enter Username or Password");
                }
              }}
            >
              {!loginLoader ? (
                <>Login</>
              ) : (
                <>
                  Logging in &nbsp; <CircularProgress size={20} />
                </>
              )}
            </Button>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
            }}
          >
            <Link
              id="fgt-password"
              testid="fgt-password"
              style={{ cursor: "pointer", color: "white" }}
              onClick={() => {
                history.push("/forgot_pwd");
              }}
              variant="body2"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
        &nbsp;&nbsp;
      </Card>
    );
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

  const renderNavbar = () => {
    let { navColor } = runtimeData;
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

  const renderBrandImage = () => {
    if (runtimeData.poster)
      return (
        <>
          <div
            className={classes.brandimage}
            style={{ backgroundColor: runtimeData.bgColor || "#d2d2d2" }}
          >
            <img
              style={{
                maxWidth: "60%",
                objectFit: "contain",
                margin: "25px",
              }}
              src={runtimeData.poster}
            />
          </div>
        </>
      );
    else return null;
  };

  const renderBrandInfo = () => {
    let { logoURL, title, sub_text, bgColor } = runtimeData;
    let visible = logoURL || sub_text || title;
    if (visible)
      return (
        <div
          className={classes.brandtitle}
          style={{ backgroundColor: bgColor || "#d2d2d2" }}
        >
          {logoURL ? (
            <>
              <img
                src={logoURL}
                className="logo_url"
                style={{
                  maxWidth: "25%",
                  objectFit: "contain",
                  margin: "10px",
                }}
              />
            </>
          ) : (
            <Typography
              style={{
                fontFamily: "inherit",
                fontSize: "4rem",
                fontWeight: 500,
                color: "#212121",
                textAlign: "center",
                margin: "10px",
              }}
              className="logo_title"
            >
              {title}
            </Typography>
          )}
          <Typography
            style={{
              fontFamily: "inherit",
              fontSize: "2rem",
              fontWeight: 400,
              color: "#fafafa",
              textAlign: "center",
              margin: "15px",
            }}
            className="logo_subtext"
          >
            {sub_text}
          </Typography>
        </div>
      );
    else return null;
  };

  const renderFeed = () => {
    let { htmlFeed } = runtimeData;
    if (htmlFeed)
      return (
        <div
          style={{ fontFamily: "inherit", width: "100%" }}
          dangerouslySetInnerHTML={{ __html: htmlFeed }}
        ></div>
      );
    else return null;
  };

  const renderLandingPage = () => {
    let { bgColor } = runtimeData;
    return (
      <Route
        render={(props) =>
          !authFlag ? (
            <div className={classes.paper}>
              <div
                style={{
                  display: "flex",
                  flex: 7,
                  height: "100%",
                  flexDirection: "column",
                }}
              >
                {renderFeed()}
              </div>
              <div
                style={{
                  display: "flex",
                  flex: 3,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: bgColor,
                }}
              >
                {" "}
                {renderLogin()}
              </div>
            </div>
          ) : (
            <Redirect
              to={{
                pathname: "/app/summary",
                state: {
                  from: props.location,
                },
              }}
            />
          )
        }
      />
    );
  };

  if (isLoading)
    return (
      <div className={classes.main}>
        <BubbleLoader />
      </div>
    );
  else
    return (
      <div className={classes.main}>
        <div className={classes.navbar}>{renderNavbar()}</div>
        <div className={`${classes.landing} hide_scroll`}>
          {renderLandingPage()}
        </div>
        <div className={classes.footer}>
          <Footer />
        </div>
      </div>
    );
};

export default Login;
