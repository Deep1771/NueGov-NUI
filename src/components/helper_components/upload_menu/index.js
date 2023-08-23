import React, { useState } from "react";
import { Menu, MenuItem } from "@material-ui/core";
import { SystemIcons } from "utils/icons";
import { DisplayButton, DisplayText } from "components/display_components";

const UploadMenu = (props) => {
  let { methods, documentType, title, acceptFormat, fromPanel } = props;
  let { cameraUpload, deviceUpload } = methods;
  let { AttachFile, Devices, PhotoCamera } = SystemIcons;

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <div>
      <input
        accept={acceptFormat ? acceptFormat : "*"}
        id={fromPanel ? "contained-button-profile" : "contained-button-file"}
        onChange={deviceUpload}
        multiple
        type="file"
        style={{ display: "none" }}
      />
      {documentType === "DOCUMENT" ? (
        <div>
          <label
            htmlFor={
              fromPanel ? "contained-button-profile" : "contained-button-file"
            }
          >
            <DisplayButton
              testid={"doc-attach"}
              size="small"
              startIcon={<AttachFile />}
              component="span"
              //  disabled={!open || mode === "read"}
            >
              Attach
            </DisplayButton>
          </label>
        </div>
      ) : (
        <div>
          <DisplayButton
            aria-controls="upload-menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
            startIcon={<AttachFile />}
            size="small"
          >
            {title ? title : "Attach"}
          </DisplayButton>
          <Menu
            id="upload-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => {
              setAnchorEl(null);
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                cameraUpload();
              }}
            >
              <PhotoCamera />
              <DisplayText style={{ marginLeft: 5 }}>Camera</DisplayText>
            </MenuItem>
            <label htmlFor="contained-button-file">
              <MenuItem onClick={() => setAnchorEl(null)}>
                <Devices />
                <DisplayText style={{ marginLeft: 5 }}>Device</DisplayText>
              </MenuItem>
            </label>
          </Menu>
        </div>
      )}
    </div>
  );
};

export default UploadMenu;
