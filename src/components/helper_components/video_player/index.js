import React, { useState } from "react";
import { CircularProgress } from "@material-ui/core";
import ReactPlayer from "react-player";
import {
  DisplayText,
  DisplayIconButton,
  DisplayModal,
  DisplayDivider,
} from "components/display_components";
import { SystemIcons } from "utils/icons/";
import { ThemeFactory } from "utils/services/factory_services";
import "./player.css";
import { ToolTipWrapper } from "components/wrapper_components";
import GetDots from "../page_indicator";

export const VideoPlayer = (props) => {
  const { handleModalClose, helperData: { videoLinks = {} } = {} } =
    props || {};
  const { Close, FiberManual, PlayCircleOutlined } = SystemIcons;
  const { getVariantObj } = ThemeFactory();
  const { dark } = getVariantObj("primary");
  const [index, setIndex] = useState(1);
  let [isLoading, setLoading] = useState(true);
  const max = videoLinks?.length;
  const disabled = index === videoLinks?.length;
  const handleReady = () => {
    setLoading(false);
  };
  const changeIndex = (direction) => {
    if (direction === "forward") {
      if (index < max) setIndex((prev) => prev + 1);
    } else {
      if (index > 1) setIndex((prev) => prev - 1);
    }
  };

  return (
    <DisplayModal fullWidth={true} maxWidth="md" open={true}>
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              // flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              padding: "1.5rem 1.5rem 1rem 1.5rem",
              // backgroundColor: dark.bgColor,
            }}
          >
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <DisplayText variant="h6">
                <b>{videoLinks[index - 1]?.title}</b>
              </DisplayText>
              <DisplayText variant="caption">
                {videoLinks[index - 1]?.description}
              </DisplayText>
            </span>
            <DisplayIconButton
              systemVariant="secondary"
              onClick={handleModalClose}
            >
              <Close size="small" />
            </DisplayIconButton>
          </div>
        </div>
        <DisplayDivider />
        {isLoading && (
          <div className="spinner">
            <CircularProgress />
          </div>
        )}
        <ReactPlayer
          controls
          config={{
            file: {
              attributes: {
                controlsList: "nodownload",
              },
            },
          }}
          onContextMenu={(e) => e.preventDefault()}
          onReady={handleReady}
          // playing={!isLoading}
          url={videoLinks[index - 1]?.link}
          height="59vh"
          width="inherit"
          style={{
            margin: "24px",
            padding: "0px",
            border: "1px solid #ebebeb",
          }}
        />
        {videoLinks?.length > 1 && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              padding: "6px 12px",
              alignItems: "center",
            }}
          >
            <div>
              <GetDots
                videoLinks={videoLinks}
                index={index}
                FiberManual={FiberManual}
              />
            </div>
            <div>
              <DisplayIconButton onClick={() => changeIndex("")}>
                <ToolTipWrapper title="" placement="bottom-start">
                  <PlayCircleOutlined
                    fontSize="large"
                    style={{
                      opacity: index == 1 ? 0.5 : "",
                      color: "black",
                      fontSize: "20px",
                      transform: "rotate(180deg)",
                    }}
                  />
                </ToolTipWrapper>
              </DisplayIconButton>

              <DisplayIconButton onClick={() => changeIndex("forward")}>
                <ToolTipWrapper title="" placement="bottom-start">
                  <PlayCircleOutlined
                    fontSize="large"
                    style={{
                      color: "black",
                      fontSize: "20px",
                      opacity: disabled ? 0.5 : "",
                    }}
                  />
                </ToolTipWrapper>
              </DisplayIconButton>
            </div>
          </div>
        )}
      </>
    </DisplayModal>
  );
};
