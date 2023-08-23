import React from "react";
import { Toolbar } from "@material-ui/core";
import ReactPlayer from "react-player";
import { useEffect, useState } from "react";
import { useStateValue } from "utils/store/contexts";
import { entity } from "utils/services/api_services/entity_service";
import { checkFileAccess } from "utils/services/api_services/files_services";
import { GlobalFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";

import { getUserCreds } from "../../../containers/feature_containers/file_manager/services";
import {
  b64toBlob,
  bytesToSize,
  getUploadUrl,
  uploadToS3,
} from "utils/services/helper_services/file_helpers";
import { DeviceCamera, UploadMenu } from "components/helper_components";
import {
  DisplayButton,
  DisplayGrid,
  DisplaySnackbar,
  DisplayText,
  DisplayProgress,
} from "components/display_components";
import { DetailPage } from "containers/composite_containers/detail_container/components/detail_page";
import { SystemIcons } from "utils/icons";
import "../style.css";

const UploadModal = (props) => {
  let { methods, options, parentParams, states } = props;
  let {
    currentFolder,
    metadata,
    refData,
    rootMessage,
    params,
    permissions,
    propSize,
  } = options;
  let {
    file,
    fileType,
    imagePreviewUrl,
    parentData,
    mode,
    type,
    documentType,
    acceptFormat,
  } = states;
  let {
    getData,
    onClose,
    renderFormSection,
    setFile,
    setFileType,
    saveForm,
    setImagePreviewUrl,
    setMode,
    setSelectedData,
    setType,
  } = methods;

  const { closeBackDrop, setBackDrop, setSnackBar } = GlobalFactory();

  const [canUserEdit, setAccess] = useState(true);
  const [errorState, setErrorState] = useState(metadata ? true : false);
  const [fileSize, setFileSize] = useState(null);
  const [formData, setFormData] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const [{ userState }] = useStateValue();

  const { userData } = userState;

  const { Close, Edit, Read } = SystemIcons;

  const clearMessage = () => setMessage(null);

  const isImage = (val) => new RegExp("image/*").test(val);

  const isVideo = (val) => new RegExp("video/*").test(val);

  const handleModeClick = () =>
    mode === "read" ? setMode("edit") : setMode("read");

  const renderFile = () => {
    if (isVideo(fileType))
      return (
        <ReactPlayer url={imagePreviewUrl} height={320} width={400} controls />
      );
    else
      return (
        <img src={imagePreviewUrl} alt="" style={{ height: 320, width: 400 }} />
      );
  };

  const formCallback = (value) => setFormData(value);

  const captureImage = (ImageURL) => {
    var block = ImageURL.split(";");
    // Get the content type of the image
    var contentType = block[0].split(":")[1]; // In this case "image/gif"
    // get the real base64 content of the file
    var realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."

    // Convert it to a blob to upload
    var blob = b64toBlob(realData, contentType);
    setFile(blob);
    setFileType(contentType);
    setImagePreviewUrl(ImageURL);
    setFileSize(blob.size);
  };

  const cameraUpload = () => {
    setType("camera");
    setFile(null);
    setFileSize(null);
    setImagePreviewUrl(null);
  };

  const deviceUpload = (e, value) => {
    try {
      e.preventDefault();
      let reader = new FileReader();
      let systemFile = e.target.files[0];
      let size = e.target.files[0].size;
      reader.onloadend = () => {
        let uri = reader.result;
        setImagePreviewUrl(uri);
        let fileType = uri.split(",")[0].split(":")[1].split(";")[0];
        setFileType(fileType);
      };
      reader.readAsDataURL(systemFile);
      setType("file");
      setFile(systemFile);
      setFileSize(size);
    } catch (e) {
      console.log("e", e);
    }
  };

  const handleSave = async () => {
    if (saveForm) {
      saveForm();
    } else {
      if (!formData.sys_entityAttributes.documentName) {
        setSnackBar({
          message: "Please enter document name",
          severity: "error",
        });
        return false;
      }
      let docName = formData.sys_entityAttributes.documentName.trim();
      let agencyName = get(userData, "sys_entityAttributes.agencyuser.Name");
      let payload = [
        { sys_agencyName: agencyName, expires: 150, fileName: docName },
      ];
      if (mode === "new") {
        formData.sys_agencyId = userData.sys_agencyId;
        formData.sys_entityAttributes.attachedEntity = currentFolder
          ? [currentFolder]
          : [];
        formData.sys_entityAttributes.sys_agencyName = agencyName;
        if (parentParams) {
          formData.sys_entityAttributes.parentEntity =
            parentParams["entityname"];
        } else
          formData.sys_entityAttributes.parentEntity = params["entityname"];
        if (formData.sys_entityAttributes.accessMode === undefined)
          formData.sys_entityAttributes.accessMode = true;
      }
      try {
        if (docName) {
          switch (type) {
            case "folder":
              {
                setBackDrop("Saving Data..");
                formData.sys_entityAttributes["fileUploader"] = {
                  type: "folder",
                };
                formData.sys_entityAttributes["uploadedDate"] =
                  new Date().toISOString();
                if (mode === "new") {
                  entity.create(params, formData).then(async (res) => {
                    if (res) {
                      refreshData();
                    } else throw "folder could not be created";
                  });
                } else {
                  let updateData = {
                    ...formData,
                    sys_entityAttributes: {
                      ...formData.sys_entityAttributes,
                      uploadedDate: new Date().toISOString(),
                    },
                  };
                  entity
                    .update({ ...params, id: formData._id }, updateData)
                    .then(async (res) => {
                      if (res) {
                        refreshData();
                      } else throw "could not update data!";
                    });
                }
              }
              break;
            default: {
              if (file || imagePreviewUrl) {
                if (mode === "new") {
                  setBackDrop("File uploading...");
                  getUploadUrl(params, payload)
                    .then((res) => {
                      uploadToS3(res[0].tempUrl, file, fileType)
                        .then((uploadStatus) => {
                          if (uploadStatus === true) {
                            setBackDrop("Saving data");
                            let finalData = {
                              ...formData,
                              sys_entityAttributes: {
                                ...formData.sys_entityAttributes,
                                fileUploader: {
                                  type: "file",
                                  s3Url: res[0].s3Url,
                                  s3FileName: res[0].s3FileName,
                                  key: res[0].key,
                                },
                                size: fileSize,
                                sizeinBytes: bytesToSize(fileSize),
                                uploadedDate: new Date().toISOString(),
                                contentType: fileType,
                              },
                            };
                            entity
                              .create(params, finalData)
                              .then(async (res) => {
                                if (res) {
                                  refreshData();
                                } else throw "could not add data!";
                              });
                          } else {
                            closeBackDrop();
                            throw "Uploading Data failed";
                          }
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
                  if (
                    formData.sys_entityAttributes.fileUploader &&
                    formData.sys_entityAttributes.fileUploader.s3Url !==
                      imagePreviewUrl
                  ) {
                    setBackDrop("File uploading...");
                    getUploadUrl(params, payload).then((res) => {
                      uploadToS3(res[0].tempUrl, file, fileType).then(
                        (uploadStatus) => {
                          if (uploadStatus === true) {
                            setBackDrop("Saving data...");
                            let finalData = {
                              ...formData,
                              sys_entityAttributes: {
                                ...formData.sys_entityAttributes,
                                fileUploader: {
                                  ...formData.sys_entityAttributes.fileUploader,
                                  type: "file",
                                  s3Url: res[0].s3Url,
                                  s3FileName: res[0].s3FileName,
                                  key: res[0].key,
                                },
                                size: fileSize,
                                sizeinBytes: bytesToSize(fileSize),
                                uploadedDate: new Date().toISOString(),
                                contentType: fileType,
                              },
                            };
                            entity
                              .update(
                                { ...params, id: formData._id },
                                finalData
                              )
                              .then(async (res) => {
                                if (res) {
                                  refreshData();
                                } else throw "could not update data!";
                              });
                          } else {
                            closeBackDrop();
                            throw "Uploading Data failed";
                          }
                        }
                      );
                    });
                  } else
                    entity
                      .update({ ...params, id: formData._id }, formData)
                      .then(async (res) => {
                        if (res) {
                          refreshData();
                        } else throw "could not update data!";
                      });
                }
              } else setMessage("Please Attach a file");
            }
          }
        } else setMessage("Enter document name!");
      } catch (e) {
        closeBackDrop();
        console.log(e);
        setMessage(e);
      }
    }
  };

  const downloadFile = () => {
    window.open(imagePreviewUrl);
  };

  const getModeDisplay = (mode) => {
    let name = mode === "read" ? "EDIT" : "READ";
    return (
      <>
        {" "}
        {mode === "read" ? (
          <Edit style={{ fontSize: "16px" }} />
        ) : (
          <Read style={{ fontSize: "16px" }} />
        )}
        &nbsp;
        <DisplayText variant="button">{name}</DisplayText>
      </>
    );
  };

  const handleFileSize = () => {
    if (
      parentData &&
      parentData.sys_entityAttributes &&
      parentData.sys_entityAttributes.fileUploader
    ) {
      let dataFileSize = parentData.sys_entityAttributes.size;
      dataFileSize && setFileSize(dataFileSize);
    }
  };

  const modalTitle = () => {
    if (mode === "new") {
      if (type === "folder") {
        return "Create New Folder";
      } else return "Upload New File";
    } else return "Preview";
  };

  const refreshData = async () => {
    setMessage("Data saved.");
    await getData(getUserCreds(userState));
    closeBackDrop();
    setSelectedData([]);
    onClose();
  };

  useEffect(() => {
    try {
      saveForm && setLoading(false);
      handleFileSize();
      if (!["new", "clone"].includes(mode) && !saveForm) {
        checkFileAccess
          .get({
            fileId: parentData ? parentData.sys_gUid : "",
            userId: userData ? userData.sys_gUid : "",
          })
          .then((result) => {
            setLoading(false);
            setAccess(result);
          });
      } else setLoading(false);
      mode === "new" && setFileSize(propSize);
    } catch (e) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMessage(rootMessage);
  }, [rootMessage]);

  const renderButtons = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        width: "90%",
      }}
    >
      <div
        style={{
          visibility:
            mode.toLowerCase() !== "read" && type !== "folder" && canUserEdit
              ? "visible"
              : "hidden",
        }}
      >
        {permissions["write"] && renderUploadMenu()}
      </div>
      {imagePreviewUrl && mode.toLowerCase() !== "new" && (
        <DisplayButton size="small" onClick={downloadFile}>
          Download
        </DisplayButton>
      )}
    </div>
  );

  const renderDynamicSection = (type, file) => {
    switch (type) {
      case "folder": {
        return (
          <SystemIcons.Folder
            style={{
              padding: "80px 0px 160px 80px",
              fontSize: 200,
              color: "#F8D775",
            }}
          />
        );
      }
      case "file": {
        return (
          <div
            style={{
              display: "flex",
              height: "70vh",
              width: "100%",
              flexDirection: "column",
              flex: 1,
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            {isImage(fileType) || isVideo(fileType) ? (
              renderFile()
            ) : (
              <SystemIcons.Description
                style={{ fontSize: 150, color: "#F8D775" }}
              />
            )}
          </div>
        );
      }
      case "camera": {
        return (
          <div
            style={{
              display: "flex",
              height: "70vh",
              width: "100%",
              flexDirection: "column",
              flex: 1,
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            {file ? renderFile() : <DeviceCamera captureImage={captureImage} />}
          </div>
        );
      }
      default:
        return (
          <div
            style={{
              display: "flex",
              minHeight: 400,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DisplayText variant="h2">Please attach a File.</DisplayText>
          </div>
        );
    }
  };

  const renderForm = () => {
    return (
      <DetailPage
        type={type}
        formCallback={formCallback}
        data={parentData}
        metadata={metadata}
        errorCallback={({ error }) => {
          setErrorState(error);
        }}
        appname={params["appname"]}
        modulename={params["modulename"]}
        groupname={params["entityname"]}
        options={{
          hideFooter: true,
          hideTitlebar: true,
        }}
        mode={canUserEdit ? mode : "read"}
      />
    );
  };

  const renderUploadMenu = () => (
    <UploadMenu
      title="Change"
      methods={{ cameraUpload, deviceUpload }}
      documentType={documentType}
      acceptFormat={acceptFormat}
    />
  );

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "70vh" }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DisplayProgress />{" "}
        </div>
      ) : (
        <>
          <DisplaySnackbar
            open={!!message}
            message={message}
            onClose={clearMessage}
          />
          <Toolbar
            style={{ justifyContent: "space-between", position: "inherit" }}
          >
            <DisplayText variant="h6">{modalTitle()}</DisplayText>
            <div>
              {!["new", "clone"].includes(mode) &&
                !refData &&
                metadata &&
                canUserEdit && (
                  <DisplayButton onClick={handleModeClick} size="small">
                    {getModeDisplay(mode)}
                  </DisplayButton>
                )}
              {mode.toLowerCase() !== "read" && canUserEdit && (
                <DisplayButton
                  testid={"doc-save"}
                  size="small"
                  disabled={errorState}
                  onClick={handleSave}
                >
                  Save
                </DisplayButton>
              )}
              <DisplayButton
                testid={"doc-close"}
                size="small"
                onClick={onClose}
              >
                <Close />
              </DisplayButton>
            </div>
          </Toolbar>
          <DisplayGrid
            container
            style={{ display: "flex", flex: 1, overflow: "hidden" }}
          >
            <DisplayGrid item xs={6}>
              {renderButtons()}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "none",
                  margin: 20,
                }}
              >
                {renderDynamicSection(type, file)}
                {fileSize && (
                  <DisplayText variant="overline">
                    Size : {bytesToSize(fileSize)}
                  </DisplayText>
                )}
              </div>
            </DisplayGrid>
            <DisplayGrid item xs={6}>
              {renderFormSection ? renderFormSection() : renderForm()}
            </DisplayGrid>
          </DisplayGrid>
        </>
      )}
    </div>
  );
};
export default UploadModal;
