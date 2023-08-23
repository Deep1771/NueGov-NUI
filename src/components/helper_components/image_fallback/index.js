import { DisplayAvatar } from "components/display_components";
import React, { useState } from "react";

const ImageWithFallback = ({ src, alt, style = {} }) => {
  const [isFallback, setIsFallback] = useState(src ? false : true);

  const handleImageError = () => {
    setIsFallback(true);
  };

  return (
    <>
      {isFallback ? (
        <HandleImageOnError text={alt} />
      ) : (
        <img src={src} alt={alt} style={style} onError={handleImageError} />
      )}
    </>
  );
};

export default ImageWithFallback;

const HandleImageOnError = ({ text = "" }) => {
  text = typeof text === "string" ? text : "";
  let firstLetter = text?.charAt(0) || "A";
  return (
    <DisplayAvatar
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        width: "30px",
        height: "30px",
      }}
    >
      {firstLetter}
    </DisplayAvatar>
  );
};
