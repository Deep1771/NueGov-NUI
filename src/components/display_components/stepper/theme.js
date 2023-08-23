import React from "react";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import { ThemeFactory } from "utils/services/factory_services";

const ThemeWrapper =
  (Component) =>
  ({ systemVariant, ...props }) => {
    const { getVariantForComponent, getAllVariants } = ThemeFactory();
    const { primary, secondary } = getAllVariants;
    const defaultVariant = systemVariant ? systemVariant : "primary";
    const { colors } = getVariantForComponent("STEPPER", defaultVariant);
    const materialTheme = createMuiTheme({
      overrides: {
        MuiStepper: {
          root: {
            padding: "14px",
            backgroundColor: "inherit",
          },
        },
        MuiStepIcon: {
          root: {
            "&$active": {
              color: colors.dark.bgColor,
            },
            "&$completed": {
              color: colors.dark.bgColor,
            },
          },
        },
        MuiStepConnector: {
          active: {
            "& $line": {
              borderColor: colors.dark.bgColor,
            },
          },
          completed: {
            "& $line": {
              borderColor: colors.dark.bgColor,
            },
          },
          line: {
            borderColor: "#eaeaf0",
            borderTopWidth: 4,
            borderRadius: 1,
          },
        },
        MuiStepLabel: {
          root: {},
        },
      },
    });
    return (
      <ThemeProvider theme={materialTheme}>
        <Component {...props} />
      </ThemeProvider>
    );
  };

export default ThemeWrapper;
