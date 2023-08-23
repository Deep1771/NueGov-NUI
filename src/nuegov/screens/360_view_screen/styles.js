import { makeStyles } from "@material-ui/core";

export const useDetailStyles = makeStyles({
  main_container: {
    flex: 20,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  formContainer: {
    display: "flex",
    flex: 9.5,
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },
  header: {
    display: "flex",
    flex: 0.5,
    justifyContent: "space-between",
  },
  header_end_sec: {
    display: "flex",
  },
  header_title_sec: {
    alignSelf: "center",
    display: "flex",
    fontSize: "16px",
    fontWeight: 600,
    paddingLeft: "2px",
  },
  modal_container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: "85vh",
    // padding: "1px"
  },
  modal_header: {
    flexShrink: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 10px",
    borderRadius: "4px 4px 0 0",
    overflow: "hidden",
  },
  modal_body: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    padding: "15px 10px 50px 10px",
    overflow: "auto",
    // fontSize: 12,
  },
  modal_footer: {
    display: "flex",
    flexDirection: "row",
    padding: "0.5rem",
    gap: 10,
    overflow: "hidden",
    // justifyContent: "space-between",
  },
  footer: {
    display: "flex",
    flex: 0.5,
    flexDirection: "row-reverse",
    padding: "0.5rem",
  },
  topLevelContainer: {
    display: "flex",
    flex: 12,
    overflowY: "scroll",
    contain: "strict",
    "&::-webkit-scrollbar": { width: 0, height: 0 },
  },
  rdgEditorContainer: {
    zIndex: 999999,
  },
});
