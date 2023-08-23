import React from "react";
import PropTypes from "prop-types";
import { CircularProgress, LinearProgress, Box } from "@material-ui/core";
import { DisplayText } from "..";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";

export const DisplayProgress = (props) => {
  let { type, value, systemVariant } = props;
  const { useCircularProgressStyles, useLinearProgressStyles } = Stylesheet();
  const { getVariantForComponent } = ThemeFactory();
  const circularClasses = useCircularProgressStyles(
    getVariantForComponent("CIRCULAR_PROGRESS", systemVariant || "primary")
  );
  const linearClasses = useLinearProgressStyles(
    getVariantForComponent("LINEAR_PROGRESS", systemVariant || "primary")
  );
  switch (type) {
    case "circular":
      return (
        <CircularProgress classes={{ root: circularClasses.root }} {...props} />
      );

    case "linear":
      return (
        <LinearProgress
          classes={{ root: linearClasses.root, bar: linearClasses.bar }}
          {...props}
        />
      );

    case "circularValue":
      return (
        <Box position="relative" display="inline-flex">
          <CircularProgress
            classes={{ root: circularClasses.root }}
            variant="static"
            {...props}
          />
          <Box
            top={0}
            left={0}
            bottom={0}
            right={0}
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <DisplayText
              variant="caption"
              component="div"
              color="textSecondary"
            >
              {`${Math.round(value)}%`}
            </DisplayText>
          </Box>
        </Box>
      );

    case "linearValue":
      return (
        <Box display="flex" alignItems="center">
          <Box width="100%" mr={1}>
            <LinearProgress
              classes={{ root: linearClasses.root, bar: linearClasses.bar }}
              variant="determinate"
              {...props}
            />
          </Box>
          <Box minWidth={35}>
            <DisplayText variant="body2" color="textSecondary">{`${Math.round(
              props.value
            )}%`}</DisplayText>
          </Box>
        </Box>
      );

    default:
      return (
        <CircularProgress classes={{ root: circularClasses.root }} {...props} />
      );
  }
};

DisplayProgress.defaultProps = {
  fontSize: "default", // inherit | default | small | large
  systemVariant: "primary",
  type: "circular",
};

DisplayProgress.propTypes = {
  type: PropTypes.string.isRequired,
};
