import React from "react";
import { PaperWrapper } from "components/wrapper_components";
import StyleSheet from "utils/stylesheets/display_component";

export const DisplaySkin = ({ headerColor, selected = false }) => {
  const { useSkinStyles } = StyleSheet();
  const classes = useSkinStyles({ colors: headerColor });

  return (
    <PaperWrapper elevation={selected ? 24 : 1}>
      <div className={classes.skinHeader}></div>
      <div className={classes.skinBody}></div>
    </PaperWrapper>
  );
};
