import React from "react";

const Banner = (props) => {
  const { msg, src } = props;
  const iconSize = props.iconSize ? props.iconSize : "64px";
  const size = props.fontSize ? props.fontSize : 22;
  const imgSrc = src
    ? src
    : "https://assetgov-icons.s3-us-west-2.amazonaws.com/GeneralIcons/charterror.png";
  // const msg = props.msg ? props.msg : "Something went wrong"
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <span>
        <img
          src={imgSrc}
          alt="Error"
          style={{ width: iconSize, height: iconSize }}
        ></img>
        <br />
        {msg && (
          <font
            style={{
              fontFamily: "inherit",
              fontSize: size,
              textShadow: "2px",
              color: "#666666",
            }}
          >
            {msg}
          </font>
        )}
      </span>
    </div>
  );
};

export default Banner;
