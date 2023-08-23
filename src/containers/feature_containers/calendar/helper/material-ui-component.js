import React from "react";
//icons
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";

export let getIcons = (props) => {
  let { iconName, color, size } = props;

  let icons = {
    RightArrow: <ArrowRightIcon style={{ color: color, fontSize: size }} />,
    LeftArrow: <ArrowLeftIcon style={{ color: color, fontSize: size }} />,
  };

  return icons[iconName];
};
