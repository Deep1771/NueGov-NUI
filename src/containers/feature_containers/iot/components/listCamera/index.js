import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import VideoStream from "../video";
import { entity } from "utils/services/api_services/entity_service";
import { IOT } from "utils/services/api_services/iot_service";

let ListCamera = (props) => {
  let [camera, cameraList] = useState([]);
  let [streamInfo, setStreamInfo] = useState([]);

  useEffect(() => {
    (async () => {
      let data = await entity.get({
        appname: "NueGov",
        modulename: "IOT",
        entityname: "IOTCamera",
        limit: 100,
        skip: 0,
      });
      cameraList(data);
    })();
  }, []);

  return (
    <div style={{ marginLeft: 20, display: "flex", flexDirection: "column" }}>
      {camera.map((cam, index) => {
        return (
          <div>
            {/* <pre>{JSON.stringify(cam, '', 2)}</pre> */}
            <span style={{ marginRight: 10, fontWeight: "700" }}>
              {cam["sys_entityAttributes"]["Manufacturer"]} -{" "}
              {cam["sys_entityAttributes"]["Model"]}
            </span>
            <Button
              autoFocus
              variant={"contained"}
              color="primary"
              onClick={async () => {
                let res = await IOT.create(
                  {
                    appname: "NueGov",
                    modulename: "IOT",
                    entityname: "IOTCamera",
                    id: cam.sys_entityAttributes["SerialNumber"],
                  },
                  cam.sys_entityAttributes
                );
                res = {
                  ...res,
                  title: `${cam.sys_entityAttributes["Manufacturer"]} ${cam.sys_entityAttributes["Model"]}`,
                };
                setStreamInfo([...streamInfo, res]);
              }}
            >
              Connect
            </Button>
            <Button
              autoFocus
              variant={"contained"}
              color="secondary"
              onClick={async () => {
                IOT.remove(
                  { device: cam.sys_entityAttributes["SerialNumber"] },
                  {}
                );
                let streamIndex = streamInfo
                  .map((item) => {
                    return item.id;
                  })
                  .indexOf(cam.sys_entityAttributes["SerialNumber"]);
                if (streamIndex != -1) {
                  setStreamInfo([
                    streamInfo.slice(0, streamIndex),
                    streamInfo.slice(streamIndex + 1),
                  ]);
                }
              }}
            >
              Disconnect
            </Button>
          </div>
        );
      })}
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {streamInfo.length &&
          streamInfo.map((link, index) => {
            return (
              <VideoStream
                key={index}
                streamUrl={link.stream}
                status={link.status}
                title={link.title}
              />
            );
          })}
      </div>
    </div>
  );
};

export default ListCamera;
