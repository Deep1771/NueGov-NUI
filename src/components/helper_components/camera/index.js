import React from "react";
import Camera from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

const DeviceCamera = (props) => {
  const handleTakePhotoAnimationDone = (dataUri) => {
    props.captureImage(dataUri);
  };

  return (
    <div>
      <Camera onTakePhotoAnimationDone={handleTakePhotoAnimationDone} />
    </div>
  );
};

export default DeviceCamera;
