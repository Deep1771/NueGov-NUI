import React from "react";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import { ThemeFactory } from "utils/services/factory_services";
import { GlobalFactory } from "utils/services/factory_services";

export const FormThemeWrapper = (Component) => (props) => {
  const { getAllVariants } = ThemeFactory();
  const { getBusinessType } = GlobalFactory();
  const { primary, secondary } = getAllVariants;

  const getFormThemeObj = () => {
    switch (getBusinessType()) {
      case ("NUEASSIST", "NUEGOV"): {
        const materialTheme = createMuiTheme({
          overrides: {
            Mui: {
              "&$error": {
                color: secondary.dark.color,
              },
            },
            MuiFormControlLabel: {
              label: {
                fontSize: "14px",
                fontFamily: "Roboto",
              },
            },
            MuiFormLabel: {
              root: {
                fontSize: 14,
                fontFamily: "Roboto",
                "&$error": {
                  color: secondary.dark.bgColor,
                },
                "&$focused": {
                  color: primary.dark.bgColor,
                },
                "&$filled": {
                  color: primary.dark.bgColor,
                },
              },
              asterisk: {
                color: secondary.dark.bgColor,
                "&$error": {
                  color: secondary.dark.bgColor,
                },
              },
            },

            MuiInput: {
              underline: {
                fontSize: "14px",
                fontFamily: "Roboto",
                "&:after": {
                  borderBottomColor: primary.dark.bgColor,
                },
                "&$error": {
                  "&:after": {
                    borderBottomColor: secondary.dark.bgColor,
                  },
                },
              },
            },
            MuiMenuItem: {
              root: {
                fontSize: "14px",
                fontFamily: "Roboto",
                "&:hover": {
                  backgroundColor: primary.light.bgColor,
                  color: primary.dark.bgColor,
                },
              },
            },
            MuiListItem: {
              root: {
                fontFamily: "Roboto",
                fontSize: "14px",
                "&:hover": {
                  backgroundColor: primary.light.bgColor,
                  color: primary.dark.bgColor,
                },
                "&$selected": {
                  backgroundColor: primary.dark.bgColor,
                  color: primary.dark.text,
                  "&:hover": {
                    backgroundColor: primary.dark.bgColor,
                    color: primary.dark.text,
                  },
                },
              },
            },
            MuiAutocomplete: {
              option: {
                fontSize: "14px",
                fontFamily: "Roboto",
                padding: "8px 16px  !important",
                "&:hover": {
                  backgroundColor: primary.light.bgColor,
                  color: primary.dark.bgColor,
                },
                '&[data-focus="true"]': {
                  backgroundColor: primary.dark.bgColor,
                  color: primary.dark.text,
                },
              },
            },
            MuiOutlinedInput: {
              root: {
                fontSize: "14px",
                fontFamily: "Roboto",
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
                "&$adornedEnd": {
                  paddingRight: "0px",
                },
                "&$disabled": {
                  backgroundColor: "#f5f5f5",
                },
              },

              // notchedOutline : {
              //     "&$error" : {
              //         borderColor : secondary.dark.bgColor
              //     },
              //     "&$focused" : {
              //         borderColor : primary.dark.bgColor
              //     },
              //     "&$filled" : {
              //         borderColor : primary.dark.bgColor
              //     }
              // }
            },
          },
        });
        return materialTheme;
      }
      default: {
        const materialTheme = createMuiTheme({
          overrides: {
            Mui: {
              "&$error": {
                color: secondary.dark.color,
              },
            },
            MuiFormControlLabel: {
              label: {
                fontSize: "14px",
                fontFamily: "Roboto",
              },
            },
            MuiFormLabel: {
              root: {
                fontSize: "14px",
                fontFamily: "Roboto",
                "&$error": {
                  color: secondary.dark.bgColor,
                },
                "&$focused": {
                  color: primary.dark.bgColor,
                },
                "&$filled": {
                  color: primary.dark.bgColor,
                },
              },
              asterisk: {
                color: secondary.dark.bgColor,
                "&$error": {
                  color: secondary.dark.bgColor,
                },
              },
            },
            MuiInput: {
              underline: {
                "&:after": {
                  borderBottomColor: primary.dark.bgColor,
                },
                "&$error": {
                  "&:after": {
                    borderBottomColor: secondary.dark.bgColor,
                  },
                },
              },
            },
            MuiMenuItem: {
              root: {
                fontSize: "14px",
                fontFamily: "Roboto",
                "&:hover": {
                  backgroundColor: primary.light.bgColor,
                  color: primary.dark.bgColor,
                },
              },
            },
            MuiListItem: {
              root: {
                fontSize: "14px",
                fontFamily: "Roboto",
                "&:hover": {
                  backgroundColor: primary.light.bgColor,
                  color: primary.dark.bgColor,
                },
                "&$selected": {
                  backgroundColor: primary.dark.bgColor,
                  color: primary.dark.text,
                  "&:hover": {
                    backgroundColor: primary.dark.bgColor,
                    color: primary.dark.text,
                  },
                },
              },
            },
            MuiAutocomplete: {
              option: {
                fontSize: "14px",
                fontFamily: "Roboto",
                "&:hover": {
                  backgroundColor: primary.light.bgColor,
                  color: primary.dark.bgColor,
                },
                '&[data-focus="true"]': {
                  backgroundColor: primary.dark.bgColor,
                  color: primary.dark.text,
                },
              },
            },
            MuiOutlinedInput: {
              root: {
                fontSize: "14px",
                fontFamily: "Roboto",
                "& fieldset": {
                  borderColor: primary.dark.bgColor,
                },
                "&:hover": {
                  "& fieldset": {
                    borderColor: primary.dark.bgColor,
                  },
                },
                "&$focused $notchedOutline": {
                  borderColor: primary.dark.bgColor,
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
              },
              // notchedOutline : {
              //     "&$error" : {
              //         borderColor : secondary.dark.bgColor
              //     },
              //     "&$focused" : {
              //         borderColor : primary.dark.bgColor
              //     },
              //     "&$filled" : {
              //         borderColor : primary.dark.bgColor
              //     }
              // }
            },
          },
        });
        return materialTheme;
      }
    }
  };
  return (
    <ThemeProvider theme={getFormThemeObj()}>
      <Component {...props} />
    </ThemeProvider>
  );
};
