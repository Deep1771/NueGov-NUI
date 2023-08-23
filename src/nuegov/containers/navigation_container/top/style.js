import { makeStyles } from "@material-ui/core";

export const useInAppStyles = makeStyles({
  // main_container: {
  //     flex: 20,
  //     display: "flex",
  //     flexDirection: "column",
  //     gap: 4,
  // },
  main_card: {
    display: "flex",
    height: "500px",
    width: "450px", //"min(0ch, 100ch)",
    // height: "max(0ch, 100ch)",
    borderRadius: "8px",
    background: "#f6ecec",
    flexShrink: 1,
    overflowY: "auto",
    scroll: "hide",
  },
  main_container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  app_header: {
    display: "flex",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  app_footer: {
    display: "flex",
    flex: 0.4,
    margin: ".4rem",
    // justifyContent:"space-between",
  },
  app_body: {
    display: "flex",
    // background: "#F6F5F5",
    flex: 8,
    overflowY: "auto",
    width: "450px",
    height: "400px",
    flexDirection: "column",
  },
});
