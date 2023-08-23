import React from "react";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import { ThemeFactory } from "utils/services/factory_services";

export const ThemeWrapper =
  (Component) =>
  ({ systemVariant, ...props }) => {
    const { getVariantForComponent, getAllVariants } = ThemeFactory();
    const { primary, secondary } = getAllVariants;
    const defaultVariant = systemVariant ? systemVariant : "primary";
    const { colors } = getVariantForComponent("DATE", defaultVariant);
    const materialTheme = createMuiTheme({
      overrides: {
        MuiPickersToolbar: {
          toolbar: {
            backgroundColor: colors.dark.bgColor,
          },
        },
        MuiPickerDTTabs: {
          tabs: {
            backgroundColor: colors.dark.bgColor,
            color: colors.dark.text,
          },
        },
        MuiPickersClock: {
          pin: {
            backgroundColor: colors.dark.bgColor,
          },
        },
        MuiPickersClockPointer: {
          pointer: {
            backgroundColor: colors.dark.bgColor,
          },
          thumb: {
            borderColor: colors.dark.bgColor,
          },
        },
        MuiPickersClockNumber: {
          clockNumber: {
            color: colors.dark.bgColor,
          },
          clockNumberSelected: {
            backgroundColor: colors.dark.bgColor,
          },
        },
        PrivateTabIndicator: {
          root: {
            backgroundColor: colors.dark.bgColor,
          },
          colorSecondary: {
            backgroundColor: colors.light.bgColor,
          },
        },
        MuiPickersCalendarHeader: {
          switchHeader: {
            color: colors.dark.bgColor,
          },
          iconButton: {
            color: colors.dark.bgColor,
            "&:hover": {
              backgroundColor: colors.light.bgColor,
            },
          },
          dayLabel: {
            color: colors.dark.bgColor,
            fontWeight: 600,
          },
        },
        MuiPickersDay: {
          day: {
            color: colors.dark.bgColor,
            "&:hover": {
              backgroundColor: colors.light.bgColor,
            },
          },
          daySelected: {
            backgroundColor: colors.dark.bgColor,
            "&:hover": {
              backgroundColor: colors.light.bgColor,
            },
          },
          dayDisabled: {
            color: colors.light.bgColor,
          },
          current: {
            color: colors.dark.bgColor,
          },
        },
        MuiPickersYear: {
          root: {
            color: colors.dark.bgColor,
            "&:hover": {
              fontSize: 30,
            },
          },
          yearSelected: {
            fontSize: 40,
            color: colors.dark.bgColor,
            "&:hover": {
              fontSize: 40,
            },
          },
          yearDisabled: {
            color: colors.dark.bgColor,
          },
        },
        MuiInput: {
          underline: {
            "&:after": {
              borderBottomColor: colors.dark.bgColor,
            },
            "&$error": {
              "&:after": {
                borderBottomColor: secondary.dark.bgColor,
              },
            },
          },
        },
        MuiButton: {
          textPrimary: {
            color: colors.dark.bgColor,
            "&:hover": {
              backgroundColor: colors.light.bgColor,
            },
          },
        },
        MuiOutlinedInput: {
          root: {
            backgroundColor: "#fdfdfd",
            "& fieldset": {
              // borderColor: primary.dark.bgColor,
              borderColor: "#80868b",
            },
            "&:hover": {
              "& fieldset": {
                borderColor: primary.dark.bgColor,
              },
            },
            "&$focused $notchedOutline": {
              borderColor: primary.dark.bgColor,
              boxShadow: " 0px 0px 1px 2px rgba(227,242,253,1)",
            },
            "&$focused": {
              "&$notchedOutline": {
                borderColor: primary.dark.bgColor,
              },
              "& fieldset": {
                borderColor: primary.dark.bgColor,
              },
            },
            "&$filled": {
              "& fieldset": {
                borderColor: primary.dark.bgColor,
              },
            },
            "&$disabled": {
              backgroundColor: "#f5f5f5",
            },
          },
        },
      },
    });
    return (
      <ThemeProvider theme={materialTheme}>
        <Component {...props} />
      </ThemeProvider>
    );
  };
