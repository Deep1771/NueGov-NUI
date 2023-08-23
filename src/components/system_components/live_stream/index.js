import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { get } from "utils/services/helper_services/object_methods";
import { livestream } from "utils/services/api_services/livestream_service";
import { BubbleLoader } from "components/helper_components";
import { LIVESTREAM_URL } from "utils/services/resource_config/base_url";
import { networkQuality } from "utils/services/helper_services/system_methods";

export const SystemLiveStream = (props) => {
  const { formData, fieldmeta } = props;
  const { filters, height, appName, moduleName, entityName, ...rest } =
    fieldmeta;
  const [url, setUrl] = useState();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [filterObj, setFilterObj] = useState({});
  const queryToUrl = (params) =>
    Object.keys(params || {})
      .map((key) => key + "=" + params[key])
      .join("&");
  let CAM_ID = useRef(null);

  const reset = () => {
    setUrl();
    setError(false);
  };

  const setCameraUrl = () => {
    let { cameraId, ...filters } = filterObj;
    let objFilter = { quality: networkQuality(), ...filters };

    if (cameraId) {
      CAM_ID.current = cameraId;
      livestream
        .get({
          appname: appName,
          modulename: moduleName,
          entityname: entityName,
          id: `${cameraId}.m3u8`,
          stream: true,
        })
        .then((res) => {
          reset();
          let baseUrl = `${LIVESTREAM_URL}/${appName}/${moduleName}/${entityName}/${cameraId}.m3u8?${queryToUrl(
            objFilter
          )}`;
          setTimeout(() => {
            setUrl(baseUrl);
          }, 3000);
        })
        .catch(() => setError("Failed to connect to camera"));
    } else {
      setError("No Camera Detected");
    }
  };

  useEffect(() => {
    let obj = {};
    filters.map((i) => {
      if (i.data) obj[i.name] = i.data;
      else obj[i.name] = get(formData, i.path);
    });
    if (JSON.stringify(obj) != JSON.stringify(filterObj) && obj.cameraId)
      setFilterObj(obj);
  }, [JSON.stringify(formData)]);

  useEffect(() => {
    if (mounted && Object.keys(filterObj).length && filterObj.cameraId)
      setCameraUrl();
    else setError("No Camera Detected");
  }, [JSON.stringify(filterObj)]);

  useEffect(() => {
    setMounted(true);
    if (Object.keys(filterObj).length && filterObj.cameraId) setCameraUrl();
    else setError("No Camera Detected");
  }, [fieldmeta.name]);

  useEffect(() => {
    return () => {
      if (CAM_ID.current) {
        livestream.get({
          appname: appName,
          modulename: moduleName,
          entityname: entityName,
          id: `${CAM_ID.current}.m3u8`,
          stream: false,
        });
      }
    };
  }, []);

  if (error)
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          height: height ? `${height}px` : "100%",
          fontSize: "1.1rem",
          color: "#fafafa",
          backgroundColor: "black",
        }}
      >
        {error}
      </div>
    );
  else
    return (
      <div style={{ width: "100%", height: height ? `${height}px` : "100%" }}>
        {!url && <BubbleLoader />}
        {url && (
          <ReactPlayer
            config={{
              file: {
                hlsOptions: {
                  forceHLS: true,
                  debug: false,
                  xhrSetup: function (xhr, url) {
                    xhr.setRequestHeader(
                      "x-access-token",
                      sessionStorage.getItem("x-access-token")
                    );
                    xhr.setRequestHeader("timeout", 30000);
                  },
                },
              },
            }}
            url={url}
            width="100%"
            height={`${height}px`}
            pip={true}
            controls
            playing
            muted
            onError={() => {
              setError("Failed to connect to camera");
            }}
            {...rest}
          />
        )}
      </div>
    );
};

SystemLiveStream.defaultProps = {
  fieldmeta: {
    height: "100px",
  },
};

export default SystemLiveStream;
