import { makeStyles } from "@material-ui/core/styles";

const DisplayComponents = () => {
  const useBadgeStyles = makeStyles({
    badge: ({ colors, local }) => ({
      color: colors.dark.text,
      backgroundColor: colors.dark.bgColor,
      ...local,
    }),
    root: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      ...local,
    }),
  });

  const useButtonStyles = makeStyles({
    disabled: ({ colors, local }) => ({ ...local }),
    root: ({ colors, local }) => ({ ...local }),
    contained: ({ colors, local }) => ({
      color: colors.dark.text,
      backgroundColor: colors.dark.bgColor,
      textTransform: "capitalize",
      "&:hover": {
        backgroundColor: colors.main.bgColor,
        color: colors.main.text,
      },
      "&$disabled": {
        color: colors.dark.text,
        backgroundColor: colors.dark.bgColor,
        opacity: 0.38,
      },
      ...local,
    }),
    text: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      textTransform: "capitalize",
      "&:hover": {
        backgroundColor: colors.light.bgColor,
        color: colors.light.text,
      },
      "&$disabled": {
        color: colors.dark.bgColor,
        opacity: 0.38,
      },
      ...local,
    }),
    outlined: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      textTransform: "capitalize",
      borderColor: colors.dark.bgColor,
      "&:hover": {
        backgroundColor: colors.light.bgColor,
        // color: colors.light.text,
        // borderColor: colors.light.text,
      },
      "&$disabled": {
        color: colors.dark.bgColor,
        borderColor: colors.dark.bgColor,
        opacity: 0.38,
      },
      ...local,
    }),
  });

  const useCardStyles = makeStyles({
    root: ({ colors, local }) => ({
      color: colors.dark.text,
      backgroundColor: colors.dark.bgColor,
      display: "flex",
      flex: 1,
      ...local,
    }),
  });

  const useCheckboxStyles = makeStyles({
    checked: ({ colors, local }) => ({ ...local }),
    disabled: ({ colors, local }) => ({ ...local }),
    root: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      "&:hover": {
        backgroundColor: colors.light.bgColor,
        color: colors.dark.bgColor,
      },
      "&$checked": {
        color: colors.dark.bgColor,
        "&:hover": {
          backgroundColor: colors.light.bgColor,
        },
      },
      "&$disabled": {
        color: colors.dark.bgColor,
        opacity: 0.38,
      },
      ...local,
    }),
  });

  const useChipStyles = makeStyles({
    root: ({ colors, local }) => ({
      color: colors.dark.text,
      backgroundColor: colors.dark.bgColor,
      "&outlined": {
        color: colors.dark.text,
      },
      "&:hover": {
        // color: colors.light.text,
        backgroundColor: colors.light.bgColor,
      },
      ...local,
    }),
  });

  const useCircularProgressStyles = makeStyles({
    root: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      ...local,
    }),
  });

  const useFABStyles = makeStyles({
    root: ({ colors, local }) => ({
      color: colors.dark.text,
      backgroundColor: colors.dark.bgColor,
      "&:hover": {
        color: colors.main.text,
        backgroundColor: colors.main.bgColor,
      },
      ...local,
    }),
  });

  const useIconStyles = makeStyles({
    root: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      "&:hover": {
        color: colors.dark.bgColor,
      },
      ...local,
    }),
  });

  const useIconButtonStyles = makeStyles({
    root: ({ colors, local }) => ({
      height: "2rem",
      width: "2rem",
      color: colors.dark.bgColor,
      "&:hover": {
        color: colors.dark.bgColor,
      },
      ...local,
    }),
  });

  const useLinearProgressStyles = makeStyles({
    root: ({ colors, local }) => ({
      backgroundColor: colors.dark.bgColor,
    }),
    bar: ({ colors, local }) => ({
      backgroundColor: colors.light.bgColor,
    }),
  });

  const useModalStyles = makeStyles({
    root: {
      height: "100%",
      width: "100%",
      padding: "0px",
    },
  });

  const useDialogContentStyles = makeStyles({
    root: {
      padding: "0px",
    },
  });

  const useRadioboxStyles = makeStyles({
    checked: ({ colors, local }) => ({ ...local }),
    disabled: ({ colors, local }) => ({ ...local }),
    root: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      "&:hover": {
        backgroundColor: colors.light.bgColor,
        color: colors.dark.bgColor,
      },
      "&$checked": {
        color: colors.dark.bgColor,
        "&:hover": {
          backgroundColor: colors.light.bgColor,
        },
      },
      "&$disabled": {
        color: colors.dark.bgColor,
        opacity: 0.38,
      },
      ...local,
    }),
  });

  const useSkinStyles = makeStyles({
    skinHeader: ({ colors, local }) => ({
      backgroundColor: colors.dark.bgColor,
      flex: 2,
      ...local,
    }),
    skinBody: ({ colors, local }) => ({
      backgroundColor: "white",
      flex: 8,
      ...local,
    }),
  });

  const useSnackbarStyles = makeStyles({});

  const useStepConnectorStyles = makeStyles({
    line: ({ colors, local }) => ({
      borderColor: "#eaeaf0",
      borderTopWidth: 3,
      borderRadius: 1,
    }),
    active: ({ colors, local }) => ({
      "& $line": {
        borderColor: colors.dark.bgColor,
      },
      ...local,
    }),
    alternativeLabel: ({ colors, local }) => ({
      top: 10,
      left: "calc(-50% + 16px)",
      right: "calc(50% + 16px)",
    }),
    completed: ({ colors, local }) => ({
      "& $line": {
        borderColor: colors.dark.bgColor,
      },
      ...local,
    }),
  });

  const useStepIconStyles = makeStyles({
    root: ({ colors, local }) => ({
      display: "flex",
      height: 22,
      alignItems: "center",
      ...local,
    }),
    active: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      ...local,
    }),
    circle: ({ colors, local }) => ({
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: colors.dark.bgColor,
      ...local,
    }),
    completed: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      zIndex: 1,
      fontSize: 18,
      ...local,
    }),
  });

  const useSwitchStyles = makeStyles({
    checked: ({ colors, local }) => ({ ...local }),
    track: ({ colors, local }) => ({ ...local }),
    disabled: ({ colors, local }) => ({ ...local }),
    thumb: ({ colors, local }) => ({ ...local }),
    root: ({ colors, local }) => ({}),
    switchBase: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      "&$checked": {
        color: colors.dark.bgColor,
      },
      "&$disabled + $checked": {
        color: colors.dark.bgColor,
        opacity: 0.3,
      },
      "&$checked + $track": {
        backgroundColor: colors.dark.bgColor,
      },
      "&$disabled + $thumb": {
        opacity: 0.38,
      },
      ...local,
    }),
  });

  const useTabStyles = makeStyles({
    root: ({ colors, local }) => ({
      "& .MuiTab-wrapper": {
        flexDirection: "row",
        justifyContent: "flex-start",
      },
      minWidth: 50,
      opacity: 1,
      fontFamily: "inherit",
      fontSize: "14px",
      "&:hover": {
        color: colors.dark.bgColor,
      },
      textTransform: "none",
      ...local,
    }),
    selected: ({ colors, local }) => ({
      "& .MuiTab-wrapper": {
        flexDirection: "row",
        justifyContent: "flex-start",
      },
      fontSize: "14px",
      color: colors.dark.bgColor,
      ...local,
    }),
  });

  const useTabsStyles = makeStyles({
    indicator: ({ colors, local }) => ({
      backgroundColor: "none",
      height: "4px",
      ...local,
    }),
    root: ({ colors, local }) => ({
      textTransform: "none",
      display: "flex",
      flex: 1,
      ...local,
    }),
    scrollButtons: ({ colors, local }) => ({
      color: colors.dark.bgColor,
      ...local,
    }),
  });

  const useTextStyles = makeStyles({
    root: ({ global }) => ({ ...global }),
    h1: ({ h1 }) => ({ fontSize: "0.9rem", fontWeight: 300, ...h1 }),
    h2: ({ h2 }) => ({ fontSize: "0.9rem", fontWeight: 400, ...h2 }),
    h3: ({ h3 }) => ({ ...h3 }),
    h4: ({ h4 }) => ({ ...h4 }),
    h5: ({ h5 }) => ({ ...h5 }),
    h6: ({ h6 }) => ({ ...h6 }),
    subtitle1: ({ subtitle1 }) => ({ ...subtitle1 }),
    subtitle2: ({ subtitle2 }) => ({ ...subtitle2 }),
    body1: ({ defaultClass }) => ({ ...defaultClass }),
    body2: ({ body2 }) => ({ ...body2 }),
    caption: ({ caption }) => ({ ...caption }),
    button: ({ button }) => ({ ...button }),
    overline: ({ overline }) => ({ ...overline }),
    srOnly: ({ srOnly }) => ({ ...srOnly }),
    inherit: ({ inherit }) => ({ ...inherit }),
  });

  const sheets = {
    useBadgeStyles,
    useButtonStyles,
    useCardStyles,
    useCheckboxStyles,
    useChipStyles,
    useCircularProgressStyles,
    useDialogContentStyles,
    useFABStyles,
    useIconStyles,
    useIconButtonStyles,
    useLinearProgressStyles,
    useModalStyles,
    useRadioboxStyles,
    useSkinStyles,
    useSnackbarStyles,
    useStepConnectorStyles,
    useStepIconStyles,
    useSwitchStyles,
    useTabStyles,
    useTabsStyles,
    useTextStyles,
  };
  return { ...sheets };
};

export default DisplayComponents;
