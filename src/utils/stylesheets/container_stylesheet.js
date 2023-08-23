import { makeStyles } from "@material-ui/core/styles";
import { ThemeFactory } from "utils/services/factory_services";

const ContainerStylesheet = () => {
  const { getAllVariants } = ThemeFactory();
  const { primary } = getAllVariants;

  const useDashboardStyles = makeStyles({
    draggableCardHeader: {
      display: "flex",
      flexShrink: 1,
      flexDirection: "row",
      backgroundColor: primary.dark.bgColor,
      color: primary.dark.text,
      alignItems: "center",
    },
  });

  const sheets = {
    useDashboardStyles,
  };
  return { ...sheets };
};

export default ContainerStylesheet;
