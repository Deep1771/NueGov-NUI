import React, { useEffect, useState } from "react";
import Hls from "hls.js";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import { DisplayProgress } from "components/display_components";

let VideoStream = (props) => {
  let { streamUrl, status, title } = props;
  let [player, setPlayer] = useState(null);

  let initiateStream = () => {
    if (streamUrl && Hls.isSupported() && player) {
      const video = player;
      let hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        player.play();
      });
    }
  };

  useEffect(() => {
    initiateStream(player, streamUrl);
  }, [player, streamUrl]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafafa",
        width: "30vw",
        height: "40vh",
        alignItems: "center",
        justifyContent: "center",
        margin: 20,
      }}
    >
      <div style={{ display: "flex", flex: 9 }}>
        {status && (
          <div style={{ display: "flex", alignSelf: "center" }}>
            <video
              style={{ height: "30vh", width: "30vw" }}
              ref={(refe) => {
                setPlayer(refe);
              }}
            />
          </div>
        )}
        {!status && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignSelf: "center",
              alignItems: "center",
            }}
          >
            <DisplayProgress />
            <span
              style={{ fontFamily: "inherit", fontSize: 24, color: "#7f8c8d" }}
            >
              Please wait
            </span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignSelf: "center" }}>
        <span
          style={{
            fontFamily: "inherit",
            fontSize: 16,
            color: "#7f8c8d",
            fontWeight: "600",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "row", marginTop: 10 }}>
        <ButtonGroup
          size="small"
          variant="contained"
          color="primary"
          elevation={0}
          aria-label="contained primary button group"
        >
          <Button autoFocus color="default" onClick={async () => {}}>
            {" "}
            Disconnect{" "}
          </Button>
          <Button
            autoFocus
            color="default"
            onClick={async () => {
              initiateStream(player, streamUrl);
            }}
          >
            {" "}
            Refresh{" "}
          </Button>
          <Button autoFocus color="default" onClick={async () => {}}>
            {" "}
            Pan X{" "}
          </Button>
          <Button autoFocus color="default" onClick={async () => {}}>
            {" "}
            Pan Y{" "}
          </Button>
          <Button autoFocus color="default" onClick={async () => {}}>
            {" "}
            ZOOM +{" "}
          </Button>
          <Button autoFocus color="default" onClick={async () => {}}>
            {" "}
            ZOOM -{" "}
          </Button>
          <Button autoFocus color="default" onClick={async () => {}}>
            {" "}
            Stop{" "}
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default VideoStream;
