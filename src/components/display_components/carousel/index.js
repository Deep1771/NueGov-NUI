import React, { useRef, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import MobileStepper from "@material-ui/core/MobileStepper";
import { DisplayButton, DisplayText } from "components/display_components";
import { PaperWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import { DisplayIcon } from "components/display_components";
const useStyles = makeStyles((theme) => ({
  root: {
    padding: "10px 32px 0px 32px",
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
  },
  header: {
    display: "flex",
    height: "100%",
    flexWrap: "wrap",
  },
  img: {
    padding: "15px 15px 15px 0px",
    height: "400px",
    width: "800px",
    overflow: "hidden",
    display: "flex",
    objectFit: "fill",
    flex: 1,
  },
}));
const { GetAppIcon } = SystemIcons;

export const DisplayCarousel = ({ props, ...rest }) => {
  const { carouselInfo, helperTitle, videoURL = "", instructions } = props;
  carouselInfo.sort((a, b) => (a.priority_order > b.priority_order ? 1 : -1));
  const { KeyboardArrowLeft, KeyboardArrowRight } = SystemIcons;
  const classes = useStyles();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = carouselInfo.length;
  let activeStepAttachmentType;
  let attachmentType;
  if (activeStep && carouselInfo.length > 0) {
    const urlWithSplit = carouselInfo[activeStep].url.split(".");
    activeStepAttachmentType =
      urlWithSplit && urlWithSplit.length > 0
        ? urlWithSplit[urlWithSplit.length - 1]
        : "";
  }
  if (videoURL?.length > 0) {
    const urlWithSplit = videoURL.split(".");
    attachmentType =
      urlWithSplit && urlWithSplit.length > 0
        ? urlWithSplit[urlWithSplit.length - 1]
        : "";
  }
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <div className={classes.root} style={{ width: "100%" }}>
      <PaperWrapper
        square
        elevation={0}
        className={classes.header}
        style={{ display: "flex", flexShrink: 1, flexDirection: "column" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <DisplayText variant="h5">{helperTitle}</DisplayText>
          {videoURL && (
            <a
              href={videoURL}
              style={{ textDecoration: "none" }}
              target="_blank"
            >
              {attachmentType == "pdf"
                ? "Download pdf"
                : "Click here to watch video"}{" "}
            </a>
          )}
        </div>
      </PaperWrapper>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ display: "flex", flex: 7 }} className="img-hover-zoom">
          {activeStepAttachmentType === "pdf" ||
          activeStepAttachmentType === "mp4" ? (
            <div
              style={{ padding: "15px 15px 15px 0px", position: "relative" }}
            >
              <iframe
                width="760"
                height="366"
                src={carouselInfo[activeStep].url + "#toolbar=0"}
                title="Viewer"
                frameborder="1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <a href={carouselInfo[activeStep].url} target="_blank">
                <DisplayIcon
                  onClick={() => {}}
                  style={{
                    fontSize: "30px",
                    position: "absolute",
                    right: 0,
                    top: 0,
                    cursor: "pointer",
                    color: "rgb(63, 81, 181)",
                    border: "1px solid",
                    borderRadius: "50px",
                    backgroundColor: "white",
                  }}
                  name={GetAppIcon}
                  className={classes.icon}
                  systemVariant="default"
                ></DisplayIcon>
              </a>
            </div>
          ) : (
            <img
              className={classes.img}
              src={carouselInfo[activeStep].url}
              alt={carouselInfo[activeStep].description}
            />
          )}
        </div>
        <div
          style={{
            display: "flex",
            flex: 5,
            flexDirection: "column",
            padding: "15px 0px",
          }}
        >
          <DisplayText variant="h6">Step {activeStep + 1} </DisplayText>
          <div
            style={{
              // color: "#f6f6f6",
              fontSize: "14px",
              fontFamily: "inherit",
              fontWeight: "300",
              color: "black",
            }}
            dangerouslySetInnerHTML={{
              __html: carouselInfo[activeStep].description,
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flex: 3 }}>
        <MobileStepper
          style={{ display: "flex", flex: 1 }}
          {...rest}
          steps={maxSteps}
          position="static"
          variant="text"
          activeStep={activeStep}
          nextButton={
            <DisplayButton
              size="small"
              onClick={handleNext}
              disabled={activeStep === maxSteps - 1}
            >
              Next
              {theme.direction === "rtl" ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </DisplayButton>
          }
          backButton={
            <DisplayButton
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              {theme.direction === "rtl" ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
              Back
            </DisplayButton>
          }
        />
      </div>
    </div>
  );
};
