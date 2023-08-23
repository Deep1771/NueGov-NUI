import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  AuthFactory,
  UserFactory,
  ThemeFactory,
  GlobalFactory,
} from "utils/services/factory_services";
import { resetPwd } from "utils/services/api_services/auth_service";
import {
  DisplayButton,
  DisplayGrid,
  DisplayText,
  DisplayModal,
} from "components/display_components";
import { SystemPassword } from "components/system_components";
import { entity } from "utils/services/api_services/entity_service";

const ResetPwd = ({ resetPassword, onClose, screen, id = null }) => {
  const { logout } = AuthFactory();
  let history = useHistory();
  const { getVariantForComponent } = ThemeFactory();
  const { getUserInfo } = UserFactory();
  const { getBusinessType } = GlobalFactory();
  const businessType = getBusinessType() || "NUEGOV";
  const userInfo = getUserInfo();

  const [error, setError] = useState();
  const [open, setOpen] = useState(resetPassword);
  const [password, setPassword] = useState({ newPassword: "" });
  const [passwordError, setPasswordError] = useState(false);
  const [responsePassword, setResponsePassword] = useState();
  const [clearRetypePwd, setClearRetypePwd] = useState(false);

  const [containsUlLl, setContainsUlLl] = useState(false);
  const [checkPwd, setCheckPwd] = useState(0);
  const [containsN, setContainsN] = useState(false);
  const [contains6C, setContains6C] = useState(false);

  const mustContainPwdCriteria = [
    [
      "Must contain at least 1 Uppercase and 1 Lowercase letter (e.g.Aa)",
      containsUlLl,
    ],
    [
      "Must contain at least 1 digit (e.g.0-9) and 1 special character(s) (e.g.!@#$)",
      containsN,
    ],
    ["Minimun length should be at least 6", contains6C],
  ];
  const validatePassword = (passwordOne) => {
    if (
      passwordOne.toLowerCase() != passwordOne &&
      passwordOne.toUpperCase() != passwordOne
    )
      setContainsUlLl(true);
    else setContainsUlLl(false);

    if (
      /\d/.test(passwordOne) &&
      /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?@]/g.test(passwordOne)
    )
      setContainsN(true);
    else setContainsN(false);

    if (passwordOne.length >= 6) setContains6C(true);
    else setContains6C(false);
  };
  const callback = (value) => {
    setPassword((prevVal) => {
      return {
        ...prevVal,
        retypeNewPassword: value,
      };
    });
    // setPassword({ ...password, retypeNewPassword: value });
  };

  const handleClose = (value) => {
    setOpen(false);
    setResponsePassword(null);
    onClose && onClose();
  };

  const SubmitPassword = async (password) => {
    if (screen?.toUpperCase() == "ADMIN_PANEL") {
      let userData = await entity.get({
        appname: "NueGov",
        modulename: "Admin",
        entityname: "User",
        id,
      });
      let obj = {
        ...userData,
        sys_entityAttributes: {
          ...userData.sys_entityAttributes,
          password: password.newPassword,
        },
      };
      entity
        .update(
          {
            appname: "NueGov",
            modulename: "Admin",
            entityname: "User",
            id,
          },
          obj
        )
        .then(
          (res) => {
            setTimeout(() => {
              setResponsePassword([0, `Password updated successfully.`]);
            }, 1000);
            setTimeout(() => {
              onClose();
            }, 3000);
          },
          (e) => {
            console.log(e);
          }
        );
    } else {
      password = {
        ...password,
        id: userInfo.id,
        username: userInfo.username,
      };
      let response = await resetPwd.create({}, password);
      if (response.status === "error") {
        setResponsePassword([1, response.message]);
      } else {
        setResponsePassword([0, "Password " + response.message]);
        setTimeout(() => {
          setOpen(false);
          if (businessType === "NUEGOV") history.push("/signin");
          else history.push("/");
          logout();
        }, 1000);
      }
      return response;
    }
  };

  useEffect(() => {
    setOpen(resetPassword);
    return () => {
      setCheckPwd(0);
    };
  }, [resetPassword]);

  const renderResetModal = () => (
    <DisplayModal open={open} maxWidth="lg" onClose={onClose}>
      <div
        className="main_div"
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          width: "500px",
          height: screen ? "330px" : "400px",
        }}
      >
        <div
          className="text_div"
          style={{
            display: "flex",
            flex: 1,
            paddingBottom: "20px",
            alignItems: "center",
            backgroundColor: getVariantForComponent("", "primary").colors.dark
              .bgColor,
          }}
        >
          <DisplayText
            variant={"h6"}
            style={{ color: "white", marginLeft: "20px" }}
          >
            Reset Password
          </DisplayText>
        </div>
        <div
          className="text_div"
          style={{
            display: "flex",
            flex: 8,
            flexDirection: "column",
            justifyContent: "space-between",
            margin: "20px 20px 20px 20px",
          }}
        >
          {screen?.toUpperCase() != "ADMIN_PANEL" && (
            <SystemPassword
              stateParams="EDIT"
              fieldmeta={{
                name: "password",
                placeHolder: "Enter your current password",
                type: "PASSWORD",
                disable: false,
                canUpdate: true,
                visible: false,
                title: "Current password",
                info: "Enter your current password",
                noErrors: true,
                showInstructions: false,
              }}
              callbackError={() => {}}
              callbackValue={(value) => {
                setPassword({ ...password, oldPassword: value });
              }}
            />
          )}
          <SystemPassword
            stateParams="EDIT"
            fieldmeta={{
              name: "newpassword",
              placeHolder: "Type new password",
              type: "PASSWORD",
              showInstructions: false,
              disable: password.oldPassword
                ? false
                : screen?.toUpperCase() === "ADMIN_PANEL"
                ? false
                : true,
              canUpdate: true,
              visible: false,
              title: " New password",
              info: "Type new password",
            }}
            onPasswordChange={(val) => {
              setCheckPwd(val?.length);
              if (val?.length > 0) {
                validatePassword(val);
              }
            }}
            callbackError={(errorMsg, props) => {
              setError(errorMsg);
            }}
            callbackValue={(value) => {
              setPassword({ ...password, newPassword: value });
              setClearRetypePwd(!clearRetypePwd);
            }}
          />

          {checkPwd > 0 && (
            <>
              <span style={{ fontSize: "12px", opacity: "0.8" }}>
                Password must fulfill following criteria :
              </span>
              <p
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "0px",
                  // paddingLeft: "5px",
                }}
              >
                {mustContainPwdCriteria.map((item) => {
                  return (
                    <span
                      style={{
                        color: item[1] ? "green" : "red",
                        fontSize: "11px",
                      }}
                    >
                      {item[0]}
                    </span>
                  );
                })}
              </p>
            </>
          )}
          <SystemPassword
            stateParams="EDIT"
            fieldmeta={{
              name: "retypepassword",
              placeHolder: "Retype new password",
              type: "PASSWORD",
              errorMsg: "Password did not match",
              disable: password.newPassword && !error ? false : true,
              canUpdate: true,
              visible: false,
              title: "New password",
              info: "Retype new password",
            }}
            successMsg="Password Matched"
            clearRetypePwd={clearRetypePwd}
            callbackError={(errorMsg, props) => {
              setPasswordError(errorMsg);
              console.log(errorMsg);
            }}
            regex={password}
            callbackValue={callback}
          />

          {responsePassword && (
            <DisplayText
              style={{ color: responsePassword[0] == 1 ? "red" : "green" }}
              variant={"subtitle2"}
            >
              {responsePassword[1]}
            </DisplayText>
          )}
        </div>
        <div
          className="text_div"
          style={{ display: "flex", flex: 0.5, flexDirection: "row-reverse" }}
        >
          <DisplayButton onClick={() => handleClose()}>Close</DisplayButton>
          <DisplayButton
            disabled={
              password.retypeNewPassword && !passwordError ? false : true
            }
            onClick={() => SubmitPassword(password)}
          >
            Submit
          </DisplayButton>
        </div>
      </div>
    </DisplayModal>
  );

  return (
    <DisplayGrid
      style={{
        display: "flex",
        padding: "2rem",
        flexDirection: "row",
        flexWrap: "wrap",
        overflowY: "scroll !important",
      }}
    >
      {renderResetModal()}
    </DisplayGrid>
  );
};

export default ResetPwd;

{
  /* <DisplayModal open={open} maxWidth="sm" title={"Reset Password"}>
      <div
        style={{
          display: "flex",
          flex: 9,
          flexDirection: "column",
          margin: "0px 20px 20px 20px",
        }}
      >
        <DisplayText variant={"subtitle2"} style={{ paddingBottom: "20px" }}>
          it's a good idea to use a strong password that you don't use elsewhere
        </DisplayText>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
          }}
        >
          <SystemPassword
            stateParams="EDIT"
            fieldmeta={{
              name: "password",
              placeHolder: "Enter your current password",
              type: "PASSWORD",
              disable: false,
              canUpdate: true,
              visible: false,
              title: "Current password",
              info: "Enter your current password",
              noErrors: true,
            }}
            callbackError={() => {}}
            callbackValue={(value) => {
              setPassword({ ...password, oldPassword: value });
            }}
          />
          <SystemPassword
            stateParams="EDIT"
            fieldmeta={{
              name: "newpassword",
              placeHolder: "Type new password",
              type: "PASSWORD",
              disable: password.oldPassword ? false : true,
              canUpdate: true,
              visible: false,
              title: " New password",
              info: "Type new password",
            }}
            callbackError={(errorMsg, props) => {
              setError(errorMsg);
            }}
            callbackValue={(value) => {
              setPassword({ ...password, newPassword: value });
            }}
          />
          <SystemPassword
            stateParams="EDIT"
            fieldmeta={{
              name: "retypepassword",
              placeHolder: "Retype new password",
              type: "PASSWORD",
              errorMsg: "Password did not match",
              disable: password.newPassword && !error ? false : true,
              canUpdate: true,
              visible: false,
              title: "New password",
              info: "Retype new password",
            }}
            callbackError={(errorMsg, props) => {
              setPasswordError(errorMsg);
            }}
            regex={password}
            callbackValue={callback}
          />
          {responsePassword && (
            <DisplayText style={{ color: "red" }} variant={"subtitle2"}>
              {responsePassword}
            </DisplayText>
          )}
        </div>{" "}
        <br />
        <div style={{ display: "flex", flex: 1, flexDirection: "row-reverse" }}>
          <DisplayButton onClick={() => handleClose()}>Close</DisplayButton>
          <DisplayButton
            disabled={
              password.retypeNewPassword && !passwordError ? false : true
            }
            onClick={() => SubmitPassword(password)}
          >
            Submit
          </DisplayButton>
        </div>
      </div>
    </DisplayModal> */
}
