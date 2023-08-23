import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DisplayFormControl,
  DisplayInput,
  DisplayHelperText,
  DisplayIconButton,
  DisplaySnackbar,
  DisplayModal,
  DisplayReadMode,
  DisplayProgress,
} from "components/display_components";
import { SystemLabel } from "../index";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { checkAvailability } from "../unique_check";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import { UserFactory } from "utils/services/factory_services";
import {
  uploadToS3,
  getUploadUrl,
} from "utils/services/helper_services/file_helpers";

export const SystemLoadPic = (props) => {
  const { callbackError, callbackValue, data, fieldError, stateParams } = props;
  const fieldmeta = {
    ...SystemLoadPic.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  const {
    canUpdate,
    disable,
    defaultValue,
    name,
    placeHolder,
    required,
    title,
    unique,
    validationRegEx,
    skipReadMode,
    ...others
  } = fieldmeta;

  const { displayOnCsv, info, length, type, visible, visibleOnCsv, ...rest } =
    others;
  const { getAgencyDetails } = UserFactory();
  const { mode, appname, modulename, groupname: entityname } = stateParams;
  const params = { appname, modulename, entityname };
  const agencyName =
    getAgencyDetails !== undefined
      ? getAgencyDetails.sys_entityAttributes.Name
      : "NJAdmin";
  let { AddImage, Delete, Close } = SystemIcons;

  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [valueObj, setValueObj] = useState({});
  const [modalVisible, setModalVisible] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isReadMode = stateParams.mode.toLowerCase() == "read" && !skipReadMode;
  const regexp = new RegExp(validationRegEx);

  const clearMessage = () => setMessage(null);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    setValueObj(data);
  }, [data, name]);

  useEffect(() => {
    if (valueObj && Object.keys(valueObj).length) setImageUrl(valueObj["url"]);
    callbackValue(valueObj ? valueObj : null, props);
    if (required && (valueObj ? !valueObj.url : !valueObj)) {
      showError("Required");
    } else {
      clearError();
    }
  }, [valueObj]);

  const onChange = (value) => {
    let data = { ...valueObj, picturename: value };
    setValueObj(data);
    callbackValue(valueObj ? valueObj : null, props);
  };

  const checkUniqueness = async (value) => {
    showError("Checking Availibility..");
    SystemTimeout(async () => {
      let isUnique = await checkAvailability(fieldmeta, stateParams, value);
      if (isUnique) clearError();
      else showError("Already taken");
    }, 2000);
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const addImage = (e, value) => {
    try {
      e.preventDefault();
      let reader = new FileReader();
      let systemFile = e.target.files[0],
        fileType;
      reader.onloadend = () => {
        let uri = reader.result;
        fileType = uri.split(",")[0].split(":")[1].split(";")[0];
      };
      reader.readAsDataURL(systemFile);
      uploadImage(systemFile, fileType);
    } catch (e) {
      console.log("e", e);
    }
  };

  const uploadImage = (file, fileType) => {
    setLoading(true);
    let payload = [
      {
        sys_agencyName: agencyName,
        expires: 150,
        fileName: valueObj && valueObj["picturename"],
      },
    ];
    getUploadUrl(params, payload)
      .then((res) => {
        uploadToS3(res[0].tempUrl, file, fileType)
          .then((uploadStatus) => {
            if (uploadStatus) {
              let url = res[0].s3Url,
                filename = res[0].s3FileName;
              let obj = { ...valueObj, url: url, filename: filename };
              setValueObj(obj);
              callbackValue(obj ? obj : null, props);
              setImageUrl(url);
              setMessage("File Uploaded !");
              setTimeout(() => setLoading(false), 1000);
            }
          })
          .catch((error) => {
            setLoading(false);
            setMessage("File not Uploaded !");
            setTimeout(() => setLoading(false), 1000);
          });
      })
      .catch((error) => {
        setMessage("File not Uploaded !");
        setTimeout(() => setLoading(false), 1000);
      });
  };

  const deleteImage = () => {
    setImageUrl("");
    let data = { ...valueObj };
    delete data.url;
    delete data.filename;
    setValueObj(data);
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      {isReadMode ? (
        <>
          <DisplayReadMode
            data={valueObj && valueObj.picturename ? valueObj.picturename : ""}
            fieldmeta={fieldmeta}
          />
          <div
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <img
              onClick={openModal}
              src={imageUrl}
              style={{
                marginLeft: 5,
                height: "40px",
                width: "40px",
                borderRadius: 5,
              }}
            />
          </div>
          <DisplayModal
            open={modalVisible}
            onClose={closeModal}
            maxWidth="sm"
            style={{ overflow: "hidden" }}
          >
            <DisplayIconButton
              onClick={closeModal}
              systemVariant="primary"
              style={{ position: "absolute", right: 0, opacity: "0.8" }}
            >
              <Close />
            </DisplayIconButton>
            <img
              src={imageUrl}
              onClose={closeModal}
              style={{
                height: "90%",
                width: "99%",
                maxHeight: "60vh",
                maxWidth: "80vw",
                alignSelf: "center",
                margin: 2,
              }}
              alt=""
            />
          </DisplayModal>
        </>
      ) : (
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          <DisplayFormControl
            disabled={!canUpdate || disable}
            required={required}
            error={error}
          >
            <div
              className="system-components"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DisplaySnackbar
                open={!!message}
                message={message}
                onClose={clearMessage}
              />
              <DisplayInput
                label={title}
                disabled={!canUpdate || disable}
                error={error}
                onChange={onChange}
                placeholder={placeHolder}
                onClear={() => setValueObj({ ...valueObj, picturename: "" })}
                value={
                  valueObj && Object.keys(valueObj).length
                    ? valueObj.picturename
                    : ""
                }
                variant="outlined"
                {...rest}
              />
              <input
                accept="jpg, .jpeg, .png, .webp"
                id="add-file"
                onChange={addImage}
                multiple
                type="file"
                style={{ display: "none" }}
              />
              {!imageUrl ? (
                !loading ? (
                  (canUpdate || !disable) &&
                  valueObj &&
                  valueObj.picturename ? (
                    <label htmlFor="add-file">
                      <AddImage color="primary" style={{ marginLeft: 5 }} />
                    </label>
                  ) : (
                    <AddImage color="disabled" />
                  )
                ) : (
                  <DisplayProgress />
                )
              ) : (
                <img
                  onClick={openModal}
                  src={imageUrl}
                  systemVariant="primary"
                  style={{
                    marginLeft: 5,
                    height: "40px",
                    width: "40px",
                    borderRadius: 5,
                  }}
                />
              )}
              {imageUrl && !isReadMode && (canUpdate || !disable) && (
                <DisplayIconButton onClick={deleteImage}>
                  <Delete color="primary" />
                </DisplayIconButton>
              )}

              <DisplayModal
                open={modalVisible}
                onClose={closeModal}
                maxWidth="sm"
                style={{ overflow: "hidden" }}
              >
                <DisplayIconButton
                  onClick={closeModal}
                  style={{ position: "absolute", right: 0, opacity: "0.8" }}
                >
                  <Close />
                </DisplayIconButton>
                <img
                  src={imageUrl}
                  onClose={closeModal}
                  style={{
                    height: "90%",
                    width: "99%",
                    maxHeight: "60vh",
                    maxWidth: "80vw",
                    alignSelf: "center",
                    margin: 2,
                  }}
                  alt=""
                />
              </DisplayModal>
            </div>
            {error && (
              <div className="system-helpertext">
                <DisplayHelperText icon={SystemIcons.Info}>
                  {helperText}
                </DisplayHelperText>
              </div>
            )}
          </DisplayFormControl>
        </div>
      )}
    </>
  );
};

SystemLoadPic.defaultProps = {
  fieldmeta: {
    disable: false,
    canUpdate: true,
    required: false,
    visibleOnCsv: false,
    displayOnCsv: true,
  },
};

SystemLoadPic.propTypes = {
  value: PropTypes.object,
  fieldmeta: PropTypes.shape({
    canUpdate: PropTypes.bool,
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemLoadPic);
