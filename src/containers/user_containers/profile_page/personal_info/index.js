import React, { useEffect, useState, useRef, useMemo } from "react";
import { Badge, Button, makeStyles } from "@material-ui/core/";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { user } from "utils/services/api_services/user_service";
import {
  DisplayButton,
  DisplayGrid,
  DisplayIconButton,
  DisplayText,
  DisplayInput,
  DisplayModal,
} from "components/display_components";
import { SignModal, UploadMenu } from "components/helper_components";
import { SystemIcons } from "utils/icons";
import "./profile.css";
import { Iterator } from "containers/composite_containers/detail_container/components/iterator";
import AppAccess from "../app_access";
import { ThemePanel } from "containers/user_containers/personalization";
import {
  getUploadUrl,
  uploadToS3,
} from "utils/services/helper_services/file_helpers";
import ResetPwd from "../reset_pwd";

const fieldsmeta = [
  {
    name: "firstName",
    title: "First Name",
    type: "TEXTBOX",
    placeHolder: "First Name",
    info: "Enter User's first name",
    required: true,
    visible: true,
    visibleOnCsv: true,
    displayOnCsv: true,
    canUpdate: true,
    audit: true,
  },
  {
    name: "lastName",
    title: "Last Name",
    type: "TEXTBOX",
    info: "Enter User's last name",
    placeHolder: "Last Name",
    required: true,
    visible: true,
    displayOnCsv: true,
    canUpdate: true,
    audit: true,
  },
  {
    name: "phoneNumber",
    title: "Phone Number",
    type: "PHONENUMBER",
    placeHolder: "Enter User Phone Number",
    info: "Enter User Phone Number",
    validationRegEx: "",
    visible: false,
    displayOnCsv: true,
    required: false,
    canUpdate: true,
    audit: true,
  },

  {
    name: "signature",
    title: "Signature",
    type: "SIGNATURE",
    info: "Default signature of the user",
    required: false,
    visible: false,
    canUpdate: true,
    audit: true,
    disable: false,
    config: {
      hideFeatures: ["AUTOFILL", "ADDTOPROFILE"],
    },
  },
  {
    name: "roleName",
    title: "Role Name",
    type: "TEXTBOX",
    placeHolder: "",
    validationRegEx: "",
    visible: false,
    displayOnCsv: true,
    required: false,
    canUpdate: false,
    audit: true,
  },
  // {
  //   name: "department",
  //   title: "Department",
  //   type: "TEXTBOX",
  //   placeHolder: "",
  //   validationRegEx: "",
  //   visible: false,
  //   displayOnCsv: true,
  //   required: false,
  //   canUpdate: false,
  //   audit: true,
  // },
];

const PersonalInfo = (props) => {
  const [resetPassword, setResetPassword] = useState();
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePreviewUrl, setPreviewImageUrl] = useState(null);
  const { setSnackBar, setBackDrop, closeBackDrop, getContextualHelperData } =
    GlobalFactory();
  const {
    getUserInfo,
    isNJAdmin,
    setUserSysEntityAttributes,
    getDetails,
    getAgencyDetails,
  } = UserFactory();
  const { Edit, Lock, PhotoCamera, Close } = SystemIcons;
  const [openCropModal, setOpenCropModal] = useState(false);
  const userInfo = getUserInfo();
  const currentUserInfo = useRef(userInfo);
  const [fileType, setFileType] = useState("");

  const [mode, setMode] = useState("read");
  const [value, setValue] = useState(userInfo);
  const requiredFields = useMemo(() => {
    return fieldsmeta.filter((fields) => {
      return fields.required == true;
    });
  }, [fieldsmeta]);
  const helperData = getContextualHelperData("PROFILE_SCREEN");

  const agencyName =
    getAgencyDetails !== undefined
      ? getAgencyDetails.sys_entityAttributes.Name
      : "NJAdmin";

  const {
    inlineInstruction: { resetPasswordInfo = "" },
  } = helperData || {};

  const handleProfilePicture = async () => {
    setOpenUploadModal(false);
    if (imageUrl) {
      let payload = [
        {
          sys_agencyName: agencyName,
          expires: 150,
          fileName: "documentName",
        },
      ];
      let params = {
        appname: "NueGov",
        modulename: "Admin",
        entityname: "User",
        mode: mode,
      };

      getUploadUrl(params, payload).then(async (res) => {
        setBackDrop("File uploading...");
        uploadToS3(res[0].tempUrl, imageUrl, fileType)
          .then(async (uploadStatus) => {
            if (uploadStatus) {
              // setBackDrop("Saving data..");
              let url = res[0].s3Url,
                filename = res[0].s3FileName,
                key = res[0].key;

              let profilePic = {
                doc_url: url,
                UniqueDocName: key,
                s3FileName: filename,
              };
              let data = { profilePicture: { ...profilePic } };
              // setFiles(profilePic);

              // setBackDrop("Uploading Profile Picutre");
              await user
                .update("", {
                  sys_entityAttributes: {
                    ...data,
                  },
                })
                .then((res) => {
                  if (res) {
                    closeBackDrop();
                    setUserSysEntityAttributes(data);
                  }
                })
                .catch(() => {
                  closeBackDrop();
                  setSnackBar({
                    message: "Error in uploading profile picture",
                    severity: "error",
                  });
                });
            } else throw "Error";
          })
          .catch((error) => {
            console.log(200, error);
            closeBackDrop();
          });
      });
    }
  };

  const handleSave = async () => {
    let { firstName, lastName, phoneNumber, signature } = value;
    let data = { firstName, lastName, phoneNumber, signature };
    setBackDrop("Updating user details");
    let res = await user.update("", {
      sys_entityAttributes: {
        ...data,
      },
    });
    if (res) {
      closeBackDrop();
      setUserSysEntityAttributes(data);
    }
  };

  const checkSaveDisable = () => {
    if (requiredFields?.length) {
      for (let i of requiredFields) {
        if ([null, undefined, ""].includes(value[i.name])) {
          return true;
          break;
        }
      }
      return false;
    }
  };

  const deviceUpload = (e, value) => {
    try {
      e.preventDefault();
      let reader = new FileReader();
      let systemFile = e.target.files[0];
      let size = e.target.files[0].size;
      reader.onloadend = () => {
        let uri = reader.result;
        setPreviewImageUrl(uri);
        let fileType = uri.split(",")[0].split(":")[1].split(";")[0];
        setFileType(fileType);
      };
      reader.readAsDataURL(systemFile);
      setImageUrl(systemFile);
    } catch (e) {
      throw e;
    }
  };
  const documentType = "DOCUMENT";

  const croppedImage = (img) => {
    setImageUrl(img);
    setOpenCropModal(false);
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "auto",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "240px",
            margin: "10% 0px 0px 0px",
            boxShadow: "0px 8px 60px -10px rgb(13 28 39 / 30%)",
            borderRadius: "12px",
            minWidth: "80%",
            position: "relative",
          }}
        >
          <div className="profile-card__img">
            <img
              alt="profile card"
              src={
                imagePreviewUrl ||
                (userInfo?.profilePicture?.doc_url &&
                  userInfo?.profilePicture?.doc_url + "?auto=compress") ||
                "https://storage.needpix.com/rsynced_images/blank-profile-picture-973460_1280.png"
              }
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: "50%",
              }}
            />
            <PhotoCamera
              className="profile-card__img__upload_icon"
              onClick={() => setOpenUploadModal(true)}
              style={{
                cursor: "pointer",
                position: "absolute",
                right: "-7px",
                top: "95px",
                backgroundColor: "#1096cc",
                borderRadius: "50%",
                padding: "4px",
                color: "white",
              }}
            />
          </div>
          {/* <div
            style={{
              display: "flex",
              position: "absolute",
              top: 12,
              right: 12,
              alignItems: "center",
            }}
            onClick={setResetPassword}
          >
            <DisplayButton>
              <Lock fontSize="small" style={{ paddingRight: "5px" }} /> Reset
              Password
            </DisplayButton>
          </div> */}
          <div
            className="profile-card__title"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "-70px",
            }}
          >
            <span className="profile-card__name">
              {userInfo?.firstName || ""} {userInfo?.lastName || ""}{" "}
            </span>
            <span> {userInfo?.email || ""} </span>
            <DisplayButton
              size="small"
              variant="outlined"
              onClick={() => setResetPassword(true)}
              style={{ margin: "10px 0px" }}
            >
              <Lock fontSize="small" style={{ paddingRight: "5px" }} /> Reset
              Password
            </DisplayButton>
            <span> {resetPasswordInfo} </span>
          </div>
        </div>
        <div
          style={{
            width: "100%",
            minHeight: "210px",
            margin: "20px 0px 0px 0px",
            boxShadow: "0px 8px 60px -10px rgb(13 28 39 / 30%)",
            borderRadius: "12px",
            minWidth: "80%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}
        >
          <DisplayGrid
            style={{
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              padding: "1rem",
              flexDirection: "row",
              flexWrap: "nowrap",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <DisplayText
              style={{
                fontFamily: "inherit",
                fontWeight: 500,
              }}
              variant="h5"
            >
              Personal Info
            </DisplayText>
            <hr style={{ border: "1px solid #ebebeb", width: "100%" }} />
          </DisplayGrid>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {fieldsmeta.map((field) => {
              return (
                <Iterator
                  data={
                    userInfo[field.name] == "AGENCY ADMIN"
                      ? "ADMIN"
                      : userInfo[field.name]
                  }
                  callbackValue={(data) => {
                    setValue((prev) => {
                      return { ...prev, ...{ [field.name]: data } };
                    });
                  }}
                  fieldError={null}
                  fieldmeta={field}
                  sectionName={"Directives"}
                  stateParams={{ mode: "EDIT" }}
                  callbackError={(r) => console.log("error", r)}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "end" }}>
            <DisplayButton
              style={{ margin: "1.4rem" }}
              testid={"profile-save"}
              disabled={checkSaveDisable()}
              variant="contained"
              onClick={handleSave}
            >
              SAVE
            </DisplayButton>
          </div>
        </div>

        <div style={{}} className="profile_container">
          <AppAccess getDetails={getDetails} />
        </div>

        <div
          className="profile_container"
          style={{ minHeight: "300px", marginBottom: "3rem" }}
        >
          <ThemePanel />
        </div>
      </div>
      <DisplayModal
        open={openUploadModal}
        onClose={() => {}}
        fullWidth={true}
        maxWidth="sm"
      >
        <div
          style={{
            minHeight: "400px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
            }}
          >
            <DisplayText variant="h6">{"Profile Picture"}</DisplayText>
            <DisplayButton
              testid={"doc-close"}
              size="small"
              onClick={() => setOpenUploadModal(false)}
              variant="contained"
            >
              <Close />
            </DisplayButton>
          </div>
          <UploadMenu
            title="Change"
            methods={{ deviceUpload }}
            documentType={documentType}
            acceptFormat={"image / png, image / gif, image / jpeg"}
            fromPanel={true}
          />

          {(imageUrl || imagePreviewUrl) && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src={imagePreviewUrl || imageUrl}
                alt=""
                style={{ height: 320, width: 400 }}
              />
            </div>
          )}
          {!imageUrl && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
              }}
            >
              Please pick an image
            </div>
          )}
          {imageUrl && (
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                padding: "10px",
              }}
            >
              {/* <Button onClick={() => setOpenCropModal(true)}>Crop</Button> */}
              <Button onClick={handleProfilePicture}>Save</Button>
            </div>
          )}
        </div>
      </DisplayModal>

      <DisplayModal
        open={openCropModal}
        onClose={() => {}}
        fullWidth={true}
        maxWidth="sm"
      >
        <div
          style={{
            minHeight: "400px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
            }}
          >
            <DisplayText variant="h6">{"Crop "}</DisplayText>
            <DisplayButton
              testid={"doc-close"}
              size="small"
              onClick={() => setOpenCropModal(false)}
              variant="contained"
            >
              <Close />
            </DisplayButton>
          </div>

          {/* <Cropper
            attachmentObj={imagePreviewUrl}
            croppedImage={croppedImage}
          /> */}
        </div>
      </DisplayModal>
      <ResetPwd
        resetPassword={resetPassword}
        onClose={() => {
          setResetPassword(false);
        }}
      />
    </>
  );
};

export default PersonalInfo;
