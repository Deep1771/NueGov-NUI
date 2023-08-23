import React from "react";
import { Fade } from "@material-ui/core";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import {
  DisplayFormControl,
  DisplayInput,
  DisplayHelperText,
  DisplayButton,
  DisplayText,
  DisplayGrid,
  DisplayCard,
  DisplayCheckbox,
  DisplayModal,
} from "components/display_components";
import { UploadModal } from "components/helper_components";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import {
  dateToString,
  getUploadUrl,
  uploadToS3,
} from "utils/services/helper_services/file_helpers";
import { SystemLabel } from "../index";
import { GridWrapper, ToolTipWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";

export const SystemInlineFiles = (props) => {
  const { callbackError, callbackValue, data, fieldError, stateParams } = props;
  const fieldmeta = {
    ...SystemInlineFiles.defaultProps.fieldmeta,
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
    skipReadMode,
    acceptFormat,
    ...others
  } = fieldmeta;
  const { displayOnCsv, info, length, type, visible, visibleOnCsv, ...rest } =
    others;
  const { mode, appname, modulename, groupname: entityname } = stateParams;
  const params = { appname, modulename, entityname };
  const { getAgencyDetails } = UserFactory();
  const agencyName =
    getAgencyDetails !== undefined
      ? getAgencyDetails.sys_entityAttributes.Name
      : "NJAdmin";
  const [error, setError] = useState(false);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState("");
  const [formData, setFormData] = useState({});
  const [highlight, setHighlight] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [message, setMessage] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [mounted, setMounted] = useState(false);
  let [helperText, setHelperText] = useState();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({ write: false });
  const [selectedData, setSelectedData] = useState([]);
  const [selectionState, setSelectionState] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [inlineMode, setInlineMode] = useState(mode);
  const [currentData, setCurrentData] = useState("");

  const { CloudUpload, Description, Delete, MovieCreationOutlined } =
    SystemIcons;
  const { closeBackDrop, setBackDrop } = GlobalFactory();

  let checkSelected = (val) => selectedData.some((a) => a.id == val);

  let findValueIndex = (val) => selectedData.findIndex((a) => a.id == val);

  const isImage = (val) => new RegExp("image/*").test(val);

  const isVideo = (val) => new RegExp("video/*").test(val);

  let isReadMode = stateParams.mode.toLowerCase() == "read" && !skipReadMode;

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

  const dataInit = (data) => {
    setFiles(data);
    callbackValue(data ? data : [], props);
  };

  const deleteFiles = () => {
    let newArray = files.filter(
      (item) => !selectedData.filter((obj) => obj.id === item.id).length
    );
    setFiles(newArray);
    callbackValue(newArray ? newArray : [], props);
    setSelectedData([]);
    setSelectionState(false);
    setHighlight(null);
  };

  const handleCheckbox = (flag, val) => {
    let arr = [];
    if (!flag) {
      arr = [...selectedData];
      arr.splice(findValueIndex(val.id), 1);
    } else arr = [...selectedData, val];
    setSelectedData(arr);
    arr.length > 0 ? setSelectionState(true) : setSelectionState(false);
  };

  const menuFunction = () => {
    if (imagePreviewUrl) {
      setImagePreviewUrl("");
    }
    setMessage(null);
    setUploadModal(true);
    setInlineMode("new");
  };

  const onChange = (value, field) => {
    setFormData({ ...formData, [field]: value });
  };

  const onClose = () => {
    closeBackDrop();
    setFormData({});
    setImagePreviewUrl(null);
    setModalType(null);
    setUploadModal(false);
    setInlineMode(mode);
    setFile(null);
    setCurrentData({});
  };

  const openModal = (item) => {
    let { documentName, description, doc_url, contentType } = item;
    setUploadModal(true);
    setModalType("file");
    setFileType(contentType);
    setFormData({ documentName, description });
    setImagePreviewUrl(doc_url);
    setFile(doc_url);
    setCurrentData(item);
  };

  const saveForm = () => {
    try {
      if (formData && formData["documentName"]) {
        if (file) {
          let payload = [
            {
              sys_agencyName: agencyName,
              expires: 150,
              fileName: formData["documentName"],
            },
          ];
          if (inlineMode.toLowerCase() === "new") {
            getUploadUrl(params, payload)
              .then((res) => {
                setBackDrop("File uploading...");
                uploadToS3(res[0].tempUrl, file, fileType)
                  .then((uploadStatus) => {
                    if (uploadStatus) {
                      setBackDrop("Saving data..");
                      setMessage("File uploaded");
                      let url = res[0].s3Url,
                        filename = res[0].s3FileName,
                        key = res[0].key,
                        uploadedDate = new Date().toISOString();
                      let newArray = [
                        ...files,
                        {
                          ...formData,
                          doc_url: url,
                          UniqueDocName: key,
                          s3FileName: filename,
                          uploadedDate: uploadedDate,
                          contentType: fileType,
                          id: uuidv4(),
                        },
                      ];
                      setFiles(newArray);
                      callbackValue(newArray ? newArray : [], props);
                      setLoading(false);
                      setTimeout(() => {
                        onClose();
                      }, 1000);
                    } else throw "Error";
                  })
                  .catch((error) => {
                    closeBackDrop();
                    setMessage("File not uploaded");
                  });
              })
              .catch((error) => {
                closeBackDrop();
                setMessage("File not uploaded");
              });
          } else {
            if (currentData.doc_url !== imagePreviewUrl) {
              getUploadUrl(params, payload)
                .then((res) => {
                  setBackDrop("File uploading...");
                  uploadToS3(res[0].tempUrl, file, fileType)
                    .then((uploadStatus) => {
                      if (uploadStatus) {
                        setBackDrop("Saving data..");
                        setMessage("File uploaded");
                        let url = res[0].s3Url,
                          filename = res[0].s3FileName,
                          key = res[0].key,
                          uploadedDate = new Date().toISOString();
                        const dataIdx = files.findIndex(
                          (obj) => obj.id === currentData.id
                        );
                        const updatedObj = {
                          ...files[dataIdx],
                          ...formData,
                          doc_url: url,
                          UniqueDocName: key,
                          s3FileName: filename,
                          uploadedDate: uploadedDate,
                          contentType: fileType,
                        };
                        const updatedArray = [
                          ...files.slice(0, dataIdx),
                          updatedObj,
                          ...files.slice(dataIdx + 1),
                        ];
                        setFiles(updatedArray);
                        callbackValue(updatedArray ? updatedArray : [], props);
                        setLoading(false);
                        setTimeout(() => {
                          onClose();
                        }, 1000);
                      } else throw "Error";
                    })
                    .catch((error) => {
                      closeBackDrop();
                      setMessage("File not uploaded");
                    });
                })
                .catch((error) => {
                  closeBackDrop();
                  setMessage("File not uploaded");
                });
            } else {
              setBackDrop("Saving data...");
              const dataIdx = files.findIndex(
                (obj) => obj.id === currentData.id
              );
              const updatedObj = { ...files[dataIdx], ...formData };
              const updatedArray = [
                ...files.slice(0, dataIdx),
                updatedObj,
                ...files.slice(dataIdx + 1),
              ];
              setFiles(updatedArray);
              callbackValue(updatedArray ? updatedArray : [], props);
              setLoading(false);
              setTimeout(() => {
                onClose();
              }, 1000);
            }
          }
        } else setMessage("No Document Attached");
      } else setMessage("Please enter document name");
    } catch (e) {
      setMessage("Failed to upload Document");
      setLoading(false);
      setUploadModal(false);
    }
  };

  useEffect(() => {
    if (required && !files.length) {
      showError("Required");
    } else clearError();
  }, [files]);

  useEffect(() => {
    mounted && dataInit(data ? data : []);
  }, [data, name]);

  useEffect(() => {
    dataInit(data ? data : []);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isReadMode) {
      setPermissions({ write: false });
    } else setPermissions({ write: true });
  }, [mode]);

  const renderFormSection = () => (
    <div style={{ marginleft: 5, marginRight: 5, padding: 10 }}>
      <DisplayFormControl>
        <SystemLabel filled> DETAILS </SystemLabel>
        <DisplayGrid container direction="column" justify="space-between">
          <DisplayGrid item>
            <DisplayInput
              testid={"doc-name"}
              style={{ display: "flex", padding: 10 }}
              disabled={!canUpdate || disable || isReadMode}
              onChange={(val) => onChange(val, "documentName")}
              placeholder={"Enter Document Name"}
              value={formData["documentName"] ? formData["documentName"] : ""}
              variant="outlined"
              {...globalProps}
              {...rest}
            />
          </DisplayGrid>
          <DisplayGrid item>
            <DisplayInput
              testid={"doc-description"}
              style={{ display: "flex", padding: 10, minHeight: 100 }}
              disabled={!canUpdate || disable || isReadMode}
              onChange={(val) => onChange(val, "description")}
              multiline={true}
              rows="4"
              placeholder={"Enter Document Description"}
              value={formData["description"] ? formData["description"] : ""}
              variant="outlined"
              {...globalProps}
              {...rest}
            />
          </DisplayGrid>
        </DisplayGrid>
      </DisplayFormControl>
    </div>
  );

  const renderHeader = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="system-label">
        {!isReadMode ? (
          <SystemLabel
            toolTipMsg={info}
            required={required}
            error={error}
            filled={!error && files.length}
          >
            {title}
          </SystemLabel>
        ) : (
          <SystemLabel toolTipMsg={info} style={{ color: "#666666" }}>
            {title}
          </SystemLabel>
        )}
        <ToolTipWrapper
          title={
            fieldmeta?.description && fieldmeta?.description?.length > 57
              ? fieldmeta?.description
              : ""
          }
          placement="bottom-start"
        >
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "pre",
              maxWidth: "20vw",
              fontSize: "11px",
              opacity: "0.65",
              height: "16px",
            }}
          >
            <DisplayText
              style={{
                fontSize: "11px",
              }}
            >
              {fieldmeta?.description && fieldmeta?.description}
            </DisplayText>
          </div>
        </ToolTipWrapper>
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {data && selectedData && data.length && selectedData.length ? (
          <DisplayButton
            startIcon={<Delete />}
            size="small"
            onClick={deleteFiles}
          >
            Delete
          </DisplayButton>
        ) : (
          !isReadMode &&
          canUpdate &&
          !disable && (
            <DisplayButton
              testid={"doc-upload"}
              style={{
                visibility:
                  data && selectedData && data.length && selectedData.length
                    ? "hidden"
                    : "visible",
              }}
              aria-controls="upload-menu"
              aria-haspopup="true"
              onClick={menuFunction}
              startIcon={<CloudUpload />}
              size="small"
            >
              Upload
            </DisplayButton>
          )
        )}
      </div>
    </div>
  );

  const renderFile = (type, url) => {
    if (isVideo(type))
      return (
        <MovieCreationOutlined style={{ fontSize: 90, color: "#96948e" }} />
      );
    else return <img style={{ height: 90, width: " 98%" }} src={url} />;
  };

  const renderGrid = () => (
    <DisplayGrid container spacing={2}>
      {files &&
        files.map((item, index) => {
          let {
            documentName: title,
            doc_url,
            contentType,
            id,
            uploadedDate,
          } = item;
          return (
            <Fade in={true} timeout={index * 500}>
              <DisplayGrid
                key={id}
                item
                xs={"auto"}
                md={"auto"}
                sm={"auto"}
                xl={"auto"}
              >
                <DisplayCard
                  onMouseEnter={() =>
                    !isReadMode && !selectionState && setHighlight(index)
                  }
                  onMouseLeave={() => !selectionState && setHighlight(null)}
                  style={{
                    height: 170,
                    width: 150,
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                  variant={"outlined"}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      width: "100%",
                    }}
                  >
                    <DisplayCheckbox
                      key={id}
                      size="small"
                      checked={checkSelected(item.id)}
                      onChange={(value, x) => {
                        handleCheckbox(value, item);
                      }}
                      style={{
                        margin: 0,
                        padding: 3,
                        visibility:
                          !(selectionState || highlight === index) && "hidden",
                      }}
                    />
                  </div>
                  <div
                    onClick={() => openModal(item)}
                    style={{
                      display: "flex",
                      flex: 2,
                      width: "100%",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isImage(contentType) || isVideo(contentType) ? (
                      renderFile(contentType, doc_url)
                    ) : (
                      <Description style={{ fontSize: 90, color: "#96948e" }} />
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "93%",
                      justifyContent: "space-between",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <ToolTipWrapper
                      title={
                        <DisplayText variant="caption">
                          {title ? title : "No Name"}
                        </DisplayText>
                      }
                    >
                      <div
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          flexWrap: "nowrap",
                          textAlign: "center",
                        }}
                      >
                        <DisplayText variant="caption">
                          {title ? title : "No Name"}
                        </DisplayText>
                      </div>
                    </ToolTipWrapper>
                    <DisplayText
                      variant="caption"
                      style={{ color: "grey", textAlign: "center" }}
                    >
                      {uploadedDate
                        ? dateToString(uploadedDate, "MM-DD-YYYY HH:mm")
                        : ""}
                    </DisplayText>
                  </div>
                </DisplayCard>
              </DisplayGrid>
            </Fade>
          );
        })}
    </DisplayGrid>
  );

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
      }}
    >
      {renderHeader()}
      {files.length !== 0 ? (
        renderGrid()
      ) : (
        <DisplayText
          style={{ alignSelf: "center", justifySelf: "center" }}
          variant="subtitle2"
        >
          No Files Added
        </DisplayText>
      )}
      <DisplayModal open={uploadModal} fullWidth={true} maxWidth="md">
        <UploadModal
          states={{
            type: modalType,
            mode: isReadMode ? "READ" : "EDIT",
            file,
            fileType,
            imagePreviewUrl,
            documentType: type,
            acceptFormat: acceptFormat,
          }}
          methods={{
            setFile,
            setUploadModal,
            setType: setModalType,
            setFileType,
            setImagePreviewUrl,
            onClose,
            renderFormSection,
            saveForm,
          }}
          options={{ rootMessage: message, permissions }}
        />
      </DisplayModal>
    </div>
  );
};

SystemInlineFiles.defaultProps = {
  fieldmeta: {
    disable: false,
    canUpdate: true,
    required: false,
    visibleOnCsv: false,
    displayOnCsv: true,
  },
};

SystemInlineFiles.propTypes = {
  value: PropTypes.array,
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

export default GridWrapper(SystemInlineFiles);
