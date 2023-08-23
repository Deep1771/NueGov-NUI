import React from "react";
import { useParams } from "react-router";
const error_images = {
  permission_denied:
    "https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/permissiondenied.png",
  something_went_wrong:
    "https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/somethingwenwrong.png",
  page_not_found:
    "https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/errorcode404.png",
  unexpected:
    "https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/errorcode500.png",
  no_data_found:
    "https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/nodatafound.png",
  no_internet: `${process.env.PUBLIC_URL}/nointernet.png`,
  no_result:
    "https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/noresults.png",
};
export const ErrorFallback = (props) => {
  const { slug } = useParams();
  const actual_slug = props.slug ? props.slug : slug ? slug : "unexpected";
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        justifyContent: "center",
        width: "100%",
        height: "100%",
        alignItems: "center",
      }}
    >
      <img
        src={error_images[actual_slug]}
        alt="error"
        title="error"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
};
export default ErrorFallback;
