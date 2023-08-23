import { makeStyles } from "@material-ui/core/styles";

const WrapperComponent = () => {
  const useAppBarStyles = makeStyles({
    root: ({ colors, local }) => ({
      backgroundColor: colors.dark.bgColor,
      color: colors.dark.text,
    }),
  });

  const useBoxStyles = makeStyles({});

  const useContainerStyles = makeStyles({
    root: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      height: "100%",
      width: "100%",
      backgroundColor: "#fbfbfb",
    },
  });

  const useContextMenuStyles = makeStyles({});

  const useGridStyles = makeStyles({});

  const usePaperStyles = makeStyles({
    root: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      height: "100%",
      width: "100%",
      backgroundColor: "#ffffff",
    },
  });

  const useToolTipStyles = makeStyles({
    tooltip: ({ colors, local }) => ({
      backgroundColor: "#E1F5FE",
      color: "#212121",
      boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
      border: "1px solid #2196F3",
      fontSize: "14px",
      fontWeight: 400,
      zIndex: 11000,
    }),
    arrow: ({ colors, local }) => ({
      color: "#2196F3",
    }),
  });

  const sheets = {
    useAppBarStyles,
    useBoxStyles,
    useContainerStyles,
    useContextMenuStyles,
    useGridStyles,
    usePaperStyles,
    useToolTipStyles,
  };
  return { ...sheets };
};

export default WrapperComponent;
