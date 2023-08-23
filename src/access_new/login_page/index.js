import React, { useState, useEffect } from "react";
import queryString from "query-string";
import {
  signin,
  user,
  landing,
  entity,
} from "utils/services/api_services/auth_service";
import { useHistory, useLocation } from "react-router-dom";
import { AuthFactory, GlobalFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import { useStateValue } from "utils/store/contexts";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import {
  Button,
  Card,
  Link,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@material-ui/core/";
import "../login_page/Login.css";
import { Grow } from "@material-ui/core/";
import { styled } from "@material-ui/styles";
import Navbar from "../components/Navbar";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { setBrowserDetails, setMyIp } from "utils/helper_functions";
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@material-ui/icons";

const theme = createMuiTheme({
  overrides: {
    MuiButton: {
      root: {
        borderRadius: "8px",
        fontWeight: "bold",
      },
      text: {
        borderRadius: "2rem",
        color: "#212121",
        fontFamily: "Open Sans",
        fontWeight: "400",
        fontSize: "1rem",
        textTransform: "none",
        "&:hover": {
          fontWeight: "500",
          color: "#0176d3",
        },
      },
    },
  },
});

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#5577ff",
  textTransform: "none",
  borderRadius: "50px",
  color: "#ffffff",
  boxShadow: "#5577ff 0 10px 20px -10px",
  width: "200px",
  padding: "0.5rem 1rem 0.5rem 1rem",
  "&:hover": {
    backgroundColor: "#ff8a65",
  },
}));

const Signin = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
  const history = useHistory();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { from } = location.state || {};
  const { redirect } = queryParams;

  const getDnsConfigs = async () => {
    let url = window.location.href;
    return await landing.query({ url });
  };

  // const handleGoogleLogin = () => {
  //     console.log('handleGoogleLogin')
  //     window.open("http://localhost:5001/api/auth/google/callback", "_self");

  // }

  // const handleMicrosoftAZLogin = () => {
  //   console.log('111')
  //   window.open('http://localhost:5001/api/auth/azuread/callback',"_self")
  // }
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

  const togglePasswordMask = () => {
    setPasswordIsMasked(!passwordIsMasked);
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

  const handleLogin = async () => {
    sessionStorage.removeItem("public-user");
    let loginInfo = await signin.create({}, { username, password });
    if (loginInfo.success) {
      setLoginloader(false);
      // await setMyIp();
      // setBrowserDetails()
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
    checkAuthBeforeLogin();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    // handle login logic here
  };
  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Your forgot password logic here
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="login_container">
        <Navbar />
        <div className="login_form_div_container">
          <Grow in timeout={200} style={{ transformOrigin: "1 1 1" }}>
            <Card
              style={{ borderRadius: "1rem" }}
              elevation={2}
              className="login_form_container"
            >
              <div className="login_header_container">
                <span className="login_heading">Welcome to</span>
                <img
                  className="brand_logo_signin"
                  src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Brandlogos/nuegov_logo.png"
                ></img>
              </div>
              <div className="login_form">
                {/* <span className="login_description">
                Enter your username and password
              </span> */}
                <form
                  onSubmit={() => {
                    if (!loginLoader && username && password) {
                      setLoginloader(true);
                      handleLogin();
                    } else {
                      setError("Enter Username or Password");
                    }
                  }}
                  className="login-form"
                >
                  <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <TextField
                      style={{ marginBottom: "1.5rem" }}
                      variant="outlined"
                      type="email"
                      testid="lg-username"
                      id="email"
                      error={error}
                      helperText={error || " "}
                      value={username ? username : ""}
                      placeholder="Enter your username"
                      onChange={(event) => setUsername(event.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment
                            style={{ color: "#5577ff" }}
                            position="start"
                          >
                            <EmailOutlined />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <TextField
                      variant="outlined"
                      id="password"
                      testid="lg-password"
                      error={error}
                      // helperText={(error && !password) ? "Enter password" : " "}
                      disabled={false}
                      value={password ? password : ""}
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
                      placeholder="Enter your Password"
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      InputProps={{
                        // className: classes.input,
                        type: passwordIsMasked ? "password" : "text",
                        autoComplete: "new-password",
                        startAdornment: (
                          <InputAdornment
                            style={{ color: "#5577ff" }}
                            position="start"
                          >
                            <LockOutlined />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={togglePasswordMask}
                              edge="end"
                            >
                              {passwordIsMasked ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                </form>
              </div>
              <div className="button_container">
                <Link
                  underline="hover"
                  href="#"
                  variant="body2"
                  onClick={() => {
                    history.push("/forgot_pwd");
                  }}
                >
                  Forgot Password?
                </Link>
                <CustomButton
                  type="submit"
                  testid="lg-button"
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
                </CustomButton>
              </div>
              {/* <div class="sso-btn" style={{
                display: 'flex',
                flexDirection: 'horizontal'
              }}>
              <div class="google-btn" onClick={handleGoogleLogin}>
                <div class="google-icon-wrapper">
                  <img class="google-icon" 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"/>
                </div>
                <p class="btn-text"><b>Sign in with google</b></p>
              </div>
              <div class="google-btn"

              onClick={handleMicrosoftAZLogin}
              style={{
                margin:'5px',
                cursor:"pointer",
                backgroundColor: 'white'
              }}>
                    <img
                    class='google-icon'
                     src="https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/microsoftlogo.png"
                     width="30px" 
                     height="30px" 
                     />
                     <p class="btn-text" style={{color:'black'}}><b>Sign in with Microsoft</b></p>
              </div>
              </div> */}
            </Card>
          </Grow>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Signin;
