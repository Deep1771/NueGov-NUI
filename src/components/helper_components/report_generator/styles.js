import { makeStyles } from "@material-ui/core";

export const useDetailStyles = makeStyles({
  modal_container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    maxHeight: "85vh",
    width: "100%",
  },
  modal_header: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "center",
    padding: "1rem 1.5rem 0.5rem 1.5rem",
    position: "sticky",
    top: 0,
  },
  modal_body: {
    display: "flex",
    flexDirection: "column",
    flex: 10,
    padding: "1rem 1.5rem",
    overflow: "auto",
  },
  modal_footer: {
    display: "flex",
    flex: 1,
    // flexDirection: "column",
    padding: "1rem 1.5rem",
    gap: "1rem",
    position: "sticky",
    bottom: 0,
    backgroundColor: "#fafafa",
    justifyContent: "center",
  },
});
