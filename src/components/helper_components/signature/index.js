import React, { useEffect, useRef, useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Menu, MenuItem } from "@material-ui/core";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { user } from "utils/services/api_services/user_service";
import { generateHash } from "utils/services/helper_services/system_methods";
import { BubbleLoader, DeviceCamera } from "components/helper_components";
import {
  b64toBlob,
  getUploadUrl,
  uploadToS3,
} from "utils/services/helper_services/file_helpers";
import {
  DisplayButton,
  DisplayModal,
  DisplayButtonGroup,
  DisplayCheckbox,
  DisplayTabs,
} from "components/display_components";
import { DrawingPad, TextPad } from "./components";

import { SystemIcons } from "utils/icons";

const SignModal = (prop) => {
  let { url, onChange, onClear, testid, readOnly, config } = prop;
  let { hideFeatures = [] } = config || {};
  let { Close, CloudUpload, Crop, ArrowDropDown } = SystemIcons;
  const { getUserInfo, getDetails, setUserSysEntityAttributes } = UserFactory();
  const { setSnackBar } = GlobalFactory();
  const { username, firstName } = getUserInfo();
  const inputFileRef = useRef(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(url ? url : "");
  const [proccessingImg, setProccessingImg] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [uploadParams, setUploadParams] = useState({ showButton: false });
  const [profileSig, setProfileSig] = useState(
    !hideFeatures?.includes("AUTOFILL") || config?.setSignAsDefault
  );
  const [digital, setDigital] = useState(false);
  const [croppedImage, setCroppedImg] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState();
  const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState("Draw It");
  const drawerTabs = [
    {
      title: "Draw It",
      component: (
        <DrawingPad
          onChange={(url) => {
            onCallBackChange(url);
          }}
        />
      ),
    },
    {
      title: "Type It",
      component: (
        <TextPad
          onChange={(url) => {
            onCallBackChange(url);
          }}
        />
      ),
    },
  ];
  const menuList = [
    {
      title: "From Device",
      id: "from_device",
      setStates: () => {
        inputFileRef.current.click();
      },
    },
    {
      title: "Camera",
      id: "from_camera",
      setStates: () => {
        setCameraOn(true);
        setUploadParams({ showButton: false });
        setDigital(false);
        setFlags();
      },
    },
    {
      title: "Digital Sign",
      id: "from_signpad",
      setStates: () => {
        setDigital(true);
        setCameraOn(false);
        setFlags();
      },
    },
  ];

  const callHandler = (src) => menuList.find((e) => e.id === src);

  const onCallBackChange = (url) => {
    if (url) {
      let blob = convertToBlob(url);
      setUploadParams({ file: blob, fileType: undefined, showButton: true });
    } else setUploadParams({ showButton: false });
  };

  const setFlags = (url) => {
    setAnchorEl(null);
    !modal && setModal(true);
    setProccessingImg(url ? url : "");
    setLoading(false);
  };

  const convertToBlob = (imageUrl) => {
    if (imageUrl) {
      var block = imageUrl.split(";");
      var contentType = block[0].split(":")[1];
      var realData = block[1].split(",")[1];
      var blob = b64toBlob(realData, contentType);
      return blob;
    }
  };

  const captureImage = (ImageURL) => {
    let blob = convertToBlob(ImageURL);
    setUploadParams({ file: blob, fileType: undefined, showButton: true });
    setFlags(ImageURL);
  };

  const addSignature = (e) => {
    setProccessingImg("");
    cameraOn && setCameraOn(false);
    digital && setDigital(false);
    try {
      e.preventDefault();
      let reader = new FileReader();
      let selected = e.target.files.length;
      let file = e.target.files[0],
        fileType;
      if (selected) {
        reader.onloadend = () => {
          let uri = reader.result;
          setFlags(uri);
          fileType = uri.split(",")[0].split(":")[1].split(";")[0];
        };
        reader.readAsDataURL(file);
      }
      setUploadParams({ file, fileType, showButton: true });
      e.target.value = null;
    } catch (e) {
      console.log("e", e);
    }
  };

  const generateFilename = () => {
    let fileName;
    if (profileSig) fileName = `signature-${generateHash(username)}`;
    else fileName = `signature-${uuidv4()}`;
    return fileName;
  };

  const uploadImage = () => {
    setLoading(true);
    setImagePreviewUrl("");
    setModal(false);
    let { file, fileType } = croppedImage
      ? { file: croppedBlob, fileType: undefined }
      : uploadParams;
    setCroppedImg(false);
    let params = {
      appname: "Features",
      entityname: "Files",
      modulename: "Files",
    };
    let payload = [
      {
        sys_agencyName: "Signature",
        expires: 150,
        fileName: generateFilename(),
        unique: false,
      },
    ];
    getUploadUrl(params, payload).then((res) => {
      uploadToS3(res[0].tempUrl, file, fileType).then((status) => {
        if (status) {
          let url = res[0].s3Url,
            filename = res[0].s3FileName;
          setLoading(false);
          setImagePreviewUrl(url);
          onChange(url);
          if (profileSig) updateProfileSig(url);
        }
      });
    });
  };

  const updateProfileSig = async (url) => {
    let sig = {
      signature: { url, date: new Date().toISOString(), name: firstName },
    };
    let res = await user.update("", {
      sys_entityAttributes: {
        ...sig,
      },
    });
    if (res) {
      setUserSysEntityAttributes(sig);
      setSnackBar({
        message: "Signature is updated to your Profile",
        autoHideDuration: 400,
      });
    }
  };

  const autoFill = () => {
    let sigUrl = getDetails.sys_entityAttributes?.signature?.url;
    setImagePreviewUrl(sigUrl);
    onChange(sigUrl);
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  const checkForAutofill = () => {
    if (getDetails.sys_entityAttributes?.signature?.url) {
      autoFill();
    } else inputFileRef.current.click();
  };

  useEffect(() => {
    if (!completedCrop) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    let imageUrl = ctx.canvas.toDataURL();
    let blob = convertToBlob(imageUrl);
    setCroppedBlob(blob);
  }, [completedCrop]);

  const showAutoFillBtn = () =>
    !hideFeatures?.includes("AUTOFILL") &&
    !!getDetails.sys_entityAttributes?.signature?.url &&
    !imagePreviewUrl;

  return (
    <>
      <div style={{ display: "flex" }}>
        {loading ? (
          <div
            style={{
              height: 39,
              width: 468,
              borderRadius: "8px",
              margin: "0px 10px 10px 0px",
              border: "1px #dad4d4 solid",
            }}
          >
            {" "}
            <BubbleLoader />{" "}
          </div>
        ) : (
          <>
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl + `?v=${uuidv4()}`}
                alt="Signature"
                style={{
                  height: 39,
                  width: 468,
                  borderRadius: "8px",
                  margin: "0px 10px 10px 0px",
                  border: "1px #dad4d4 solid",
                }}
              />
            ) : (
              <div
                style={{
                  height: 39,
                  width: 468,
                  background: "#e8e8e8",
                  borderRadius: "8px",
                }}
              />
            )}
          </>
        )}
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {!readOnly && (
              <>
                <DisplayButtonGroup size="small">
                  {showAutoFillBtn() && (
                    <DisplayButton
                      testid={testid + "-" + "Device"}
                      size="small"
                      onClick={checkForAutofill}
                    >
                      &nbsp;&nbsp;Sign&nbsp;&nbsp;
                    </DisplayButton>
                  )}
                  {!showAutoFillBtn() && (
                    <DisplayButton
                      testid={testid + "-" + "Choose"}
                      onClick={() => {
                        inputFileRef.current.click();
                      }}
                    >
                      Choose
                    </DisplayButton>
                  )}
                  <DisplayButton
                    testid={testid + "-" + "dropdown"}
                    onClick={(event) => {
                      setAnchorEl(event.currentTarget);
                    }}
                  >
                    <ArrowDropDown />
                  </DisplayButton>
                </DisplayButtonGroup>
                {imagePreviewUrl && (
                  <DisplayButton
                    testid={testid + "-" + "Clear"}
                    onClick={() => {
                      setImagePreviewUrl("");
                      onClear(true);
                    }}
                  >
                    Clear
                  </DisplayButton>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DisplayModal
        open={modal}
        maxWidth="sm"
        onClose={() => {
          setModal(false);
        }}
        testid={testid + "-" + "Sign_Modal"}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            width: "100%",
            height: "50vh",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              justifyContent: "space-between",
              margin: "2px 4px 2px 4px",
            }}
          >
            <DisplayButton
              size="small"
              onClick={() => {
                setModal(false);
              }}
            >
              <Close />
            </DisplayButton>
            {!digital && (
              <DisplayButton
                testid={testid + "-" + "Sign_Modal_Crop"}
                startIcon={<Crop />}
                size="small"
                onClick={() => {
                  setCroppedImg(!croppedImage);
                }}
              >
                Crop
              </DisplayButton>
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 8,
              width: "500px",
            }}
          >
            {proccessingImg && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                {croppedImage ? (
                  <ReactCrop
                    src={proccessingImg}
                    onImageLoaded={onLoad}
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    imageStyle={{ height: 300, width: 400 }}
                    onComplete={(c) => setCompletedCrop(c)}
                    keepSelection={true}
                  />
                ) : (
                  <img
                    testid={testid + "-" + "Sign_Modal_Image"}
                    src={proccessingImg}
                    alt="Signature"
                    style={{ height: 300, width: 400 }}
                  />
                )}
              </div>
            )}
            {cameraOn && !proccessingImg && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  width: 400,
                }}
              >
                <DeviceCamera
                  idealResolution={{ height: 300, width: 400 }}
                  captureImage={captureImage}
                />
              </div>
            )}

            {digital && (
              <div
                style={{
                  border: "0.5px #d2cbcb solid",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", flex: 1 }}>
                  <DisplayTabs
                    tabs={drawerTabs}
                    defaultSelect={selectedTab}
                    valueKey={"title"}
                    titleKey={"title"}
                    variant="fullWidth"
                    onChange={(value) => {
                      setSelectedTab(value);
                      setUploadParams({ showButton: false });
                    }}
                  />
                </div>
                <div style={{ display: "flex", flex: 9 }}>
                  {drawerTabs.find((a) => a.title === selectedTab).component}
                </div>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              justifyContent: "space-between",
              margin: "2px 4px 2px 8px",
            }}
          >
            <DisplayButton
              testid={testid + "-" + "Sign_Modal_Upload"}
              disabled={uploadParams.showButton ? false : true}
              startIcon={<CloudUpload />}
              onClick={uploadImage}
            >
              Upload
            </DisplayButton>
            {!hideFeatures?.includes("ADDTOPROFILE") && (
              <DisplayCheckbox
                testid={testid + "-" + "Sign_Modal_Checkbox"}
                checked={profileSig}
                label={"Default this as your profile signature"}
                onChange={(v) => {
                  setProfileSig(v);
                }}
              />
            )}
          </div>
        </div>
      </DisplayModal>
      <input
        accept=" .jpg, .jpeg, .png"
        ref={inputFileRef}
        onChange={addSignature}
        type="file"
        style={{ display: "none" }}
      />
      <Menu
        testid={testid + "-" + "Drop_Down"}
        id="upload-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        {menuList.map(({ title, id, setStates }) => {
          return (
            <MenuItem
              onClick={() => {
                croppedImage && setCroppedImg(false);
                setStates();
              }}
              testid={testid + "-" + id}
            >
              {title}
            </MenuItem>
          );
        })}
      </Menu>
      <canvas
        ref={previewCanvasRef}
        style={{
          display: "none",
          width: Math.round(completedCrop?.width ?? 0),
          height: Math.round(completedCrop?.height ?? 0),
        }}
      />
    </>
  );
};
export default SignModal;
