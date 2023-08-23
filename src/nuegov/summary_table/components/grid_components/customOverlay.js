import React from "react";
import { Banner } from "components/helper_components/";
import { DisplayText } from "components/display_components";
import { CircleProgress } from "containers/extension_containers/detail_trigger/utils/components";

export const CustomNoRowsOverlay = (props) => {
  let { height, businessType, name, filterApplied, isLoading, loadingMessage } =
    props || {};
  let iconSize =
    typeof height === "number" && businessType === "NUEASSIST"
      ? "50px"
      : "100px";
  let subMessage = filterApplied
    ? "Please try again with another keywords"
    : "";
  return isLoading ? (
    <div>
      <CircleProgress label={loadingMessage} />
    </div>
  ) : (
    <Banner
      src={""}
      iconSize={iconSize}
      msg={
        <>
          <DisplayText variant="subtitle1" style={{ fontWeight: "bold" }}>
            No {name || "data"} found
          </DisplayText>
          <br />
          <DisplayText>{subMessage}</DisplayText>
        </>
      }
      fontSize="16"
    />
  );
};

export const CustomLoadingOverlay = (props) => {
  let { isLoading, loadingMessage } = props || {};
  return (
    <div>
      <CircleProgress label={loadingMessage} />
    </div>
  );
};
