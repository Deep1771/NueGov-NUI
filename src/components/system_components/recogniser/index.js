import React, { useState, useEffect } from "react";
import { Link } from "@material-ui/core";
import PropTypes from "prop-types";
import {
  DisplayModal,
  DisplayChips,
  DisplayButton,
  DisplayIconButton,
  DisplayText,
  DisplayGrid,
} from "components/display_components";
import { entityTemplate } from "utils/services/api_services/template_service";
import { useStateValue } from "utils/store/contexts";
import { entity } from "utils/services/api_services/entity_service";
import { DeviceCamera, UploadMenu } from "components/helper_components";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import {
  b64toBlob,
  bytesToSize,
  getUploadUrl,
  uploadToS3,
} from "utils/services/helper_services/file_helpers";
import { get } from "utils/services/helper_services/object_methods";
import { GridWrapper, ToolTipWrapper } from "components/wrapper_components";
import { SystemLabel } from "../index";
import { SystemIcons } from "utils/icons";

const Clarifai = require("clarifai");

export const SystemRecognizer = (props) => {
  const { callbackError, callbackValue, data, fieldError, stateParams } = props;
  const fieldmeta = {
    ...SystemRecognizer.defaultProps.fieldmeta,
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

  const { openRecogniser, methods } = props;
  const { Close } = SystemIcons;
  const { closeBackDrop, setBackDrop } = GlobalFactory();

  let [file, setFile] = useState(null);
  let [error, setError] = useState(false);
  let [ftype, setfType] = useState(null);
  let [fileSize, setFileSize] = useState(null);
  let [fileType, setFileType] = useState(null);
  let [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  let [metadata, setMetadata] = useState(null);
  let [predictedData, setPredictedData] = useState(null);
  let [values, setValues] = useState([]);
  let [load, setLoad] = useState(false);
  let [val, setVal] = useState(null);
  let [showRecogniser, setRecogniser] = useState(false);
  let [formData, setFormData] = useState({});

  const [{ userState }] = useStateValue();
  const { userData } = userState;

  const isImage = (val) =>
    [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/JPG",
      "image/PNG",
      "image/webp",
      "image",
    ].includes(val);
  // const appname = "FeatureGov", modulename = "Files", entityname = "Files", params = { appname, modulename, entityname };

  const renderImage = () => (
    <img src={imagePreviewUrl} alt="" style={{ height: 320, width: 400 }} />
  );

  const getMetadata = async () => {
    let SignMetadata = await entityTemplate.get({
      appname: "AssetGov",
      modulename: "Inventory",
      groupname: "Sign",
    });
    setMetadata(SignMetadata);
  };

  let payload = [
    { sys_agencyName: agencyName, expires: 150, fileName: "test" },
  ];

  const renderDynamicSection = (ftype, file) => {
    switch (ftype) {
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
            {isImage(fileType) ? (
              renderImage()
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
            {file ? (
              renderImage()
            ) : (
              <DeviceCamera captureImage={captureImage} />
            )}
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
            <DisplayText variant="h2"></DisplayText>
          </div>
        );
    }
  };

  const captureImage = (ImageURL) => {
    var block = ImageURL.split(";");
    var contentType = block[0].split(":")[1];
    var realData = block[1].split(",")[1];

    // Convert it to a blob to upload
    var blob = b64toBlob(realData, contentType);
    setFile(blob);
    setFileType(contentType);
    setImagePreviewUrl(ImageURL);
    setFileSize(blob.size);
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
      setfType("file");
      setFile(systemFile);
      setFileSize(size);
    } catch (e) {
      console.log("e", e);
    }
  };

  const cameraUpload = () => {
    setfType("camera");
    setFile(null);
    setFileSize(null);
    setImagePreviewUrl(null);
  };

  const onClose = () => {
    setfType(null);
    setFileType(null);
    setRecogniser(false);
    setFile(null);
    setFileSize(null);
    setImagePreviewUrl(null);
    setPredictedData(null);
    setValues(null);
    setLoad(false);
  };

  const clarifai = new Clarifai.App({
    apiKey: "976feffb33fe4bff98c105a96de80033",
  });

  let handleRecogniser = async () => {
    try {
      setBackDrop("Recognising...");
      getUploadUrl(params, payload).then((res) => {
        uploadToS3(res[0].tempUrl, file, fileType).then(
          async (uploadStatus) => {
            if (uploadStatus === true) {
              let image = res[0].s3Url;
              let { sys_topLevel } = metadata.sys_entityAttributes;
              let filterField = sys_topLevel.filter(
                (item) => item.name == "postType"
              );
              let fieldValues = filterField[0].values;
              let predictions = await clarifai.models.predict(
                Clarifai.GENERAL_MODEL,
                image
              );
              let predictionValues = predictions.outputs[0].data.concepts;

              let data = predictionValues.map((item) => {
                let filteredData = fieldValues.filter((i) => {
                  i = i.value.toLowerCase();

                  if (item.name == "sign" && i.includes("shape" || "Shape")) {
                    // console.log('item',item.name)
                    return i;
                  } else if (i.includes(item.name)) {
                    return i;
                  }
                });
                return filteredData;
              });
              let modifiedData = data.filter((item) => item.length);

              let uniqueArray = Array.from(
                new Set(modifiedData.map(JSON.stringify)),
                JSON.parse
              );

              let finalData = uniqueArray.flat();
              finalData = Array.from(
                new Set(finalData.map(JSON.stringify)),
                JSON.parse
              );

              setPredictedData(finalData);
              setValues(fieldValues);
              closeBackDrop();
            } else {
              closeBackDrop();
              throw "Uploading Data failed";
            }
          }
        );
      });
    } catch (e) {
      console.log("Error", e);
    }
  };

  const dataInit = (data) => {
    setVal(data);
    callbackValue(data ? data : null, props);
  };

  let handleClick = (val) => {
    dataInit(val);
  };

  let handleLoad = () => {
    let filiteData = values.map((item) => {
      let dat = predictedData.filter((i) => i.value != item.value);
      return [...dat];
    });
    setLoad(true);
  };

  let handleSave = (dataValue) => {
    setFormData({ ...formData, formData });
    entity.create(params, formData).then((res) => {
      getEntityData();
    });
  };

  const getEntityData = () => {
    return entity.get(params).then((res) => {
      // console.log("sucess");
    });
  };

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
        {/* {mode.toLowerCase() !== 'read' ?
              <SystemLabel toolTipMsg={info} required={required} error={error} >
                {title}
              </SystemLabel> :
              <SystemLabel toolTipMsg={info} style={{ color: "#666666" }}>
                {title}
              </SystemLabel>
            } */}
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {mode.toLowerCase() !== "read" && (
          <DisplayButton
            aria-controls="upload-menu"
            aria-haspopup="true"
            onClick={() => setRecogniser(true)}
            size="small"
          >
            Try Recogniser
          </DisplayButton>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    getMetadata();
  }, []);

  return (
    <div>
      <DisplayModal open={showRecogniser} fullWidth={true} maxWidth="md">
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingLeft: "10px",
            }}
          >
            <DisplayText
              variant="h5"
              style={{ fontWeight: 500, fontFamily: "inherit" }}
            >
              {" "}
              Recogniser{" "}
            </DisplayText>
            <DisplayIconButton style={{ color: "black" }} onClick={onClose}>
              <Close />{" "}
            </DisplayIconButton>
          </div>
          <div>
            <DisplayButton onClick={cameraUpload}>
              {" "}
              <DisplayText>Camera</DisplayText>{" "}
            </DisplayButton>
            <label htmlFor="contained-button-file">
              <DisplayButton size="small" component="span">
                <DisplayText>Local</DisplayText>
              </DisplayButton>
            </label>
            <DisplayButton
              onClick={() => {
                handleSave(val);
              }}
              disabled={!file && predictedData}
              style={{ float: "right" }}
            >
              <DisplayText>Save</DisplayText>
            </DisplayButton>
            <DisplayButton
              onClick={handleRecogniser}
              disabled={!file}
              style={{ float: "right" }}
            >
              <DisplayText>Recognise</DisplayText>
            </DisplayButton>
          </div>
          <div>
            {/* <UploadMenu title="Change" methods={{ cameraUpload, deviceUpload }} documentType={type}/> */}
            <DisplayGrid
              container
              style={{ display: "flex", flex: 1, overflow: "hidden" }}
            >
              <DisplayGrid item xs={6}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div>
                    <input
                      accept=" .jpg, .jpeg, .png, .pdf, .webp, .csv, .xls, .xlsx, .docx"
                      id="contained-button-file"
                      onChange={deviceUpload}
                      multiple
                      type="file"
                      style={{ display: "none" }}
                    />
                  </div>
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
                    {renderDynamicSection(ftype, file)}
                    {fileSize && (
                      <DisplayText variant="overline">
                        Size : {bytesToSize(fileSize)}
                      </DisplayText>
                    )}
                  </div>
                </div>
              </DisplayGrid>
              <DisplayGrid item xs={6}>
                <DisplayText style={{ fontSize: "18px" }}>
                  Predictions
                </DisplayText>
                <div>
                  {predictedData &&
                    predictedData.map((item) => {
                      return (
                        <DisplayChips
                          size="small"
                          clickable={true}
                          onClick={() => {
                            handleClick(item.value);
                          }}
                          key={item.value}
                          style={{ margin: "2px" }}
                          label={item.value}
                        />
                      );
                    })}
                </div>
                <div>
                  {predictedData &&
                    load &&
                    values &&
                    values.map((item) => {
                      return (
                        <DisplayChips
                          size="small"
                          clickable={true}
                          onClick={() => {
                            handleClick(item.value);
                          }}
                          key={item.value}
                          style={{ margin: "2px" }}
                          label={item.value}
                        />
                      );
                    })}
                  {predictedData && (
                    <DisplayText>
                      <Link href="#" onClick={handleLoad}>
                        Click here{" "}
                      </Link>
                      to load more...
                    </DisplayText>
                  )}
                </div>
              </DisplayGrid>
            </DisplayGrid>
          </div>
        </div>
      </DisplayModal>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          width: "100%",
        }}
      >
        {renderHeader()}
      </div>
    </div>
  );
};

SystemRecognizer.defaultProps = {
  fieldmeta: {
    disable: false,
    canUpdate: true,
    required: false,
    visibleOnCsv: false,
    displayOnCsv: true,
  },
};

SystemRecognizer.propTypes = {
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
export default GridWrapper(SystemRecognizer);
