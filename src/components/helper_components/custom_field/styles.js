import { makeStyles } from "@material-ui/core";

export const useCustomFieldStyles = makeStyles({
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
    alignItems: "center",
    padding: "5px 10px 5px 15px",
    borderRadius: "4px 4px 0 0",
    position: "sticky",
    top: 0,
  },
  modal_body: {
    display: "flex",
    flexDirection: "column",
    flex: 10,
    padding: "15px 20px 50px 20px",
    overflow: "auto",
  },
  modal_footer: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    padding: "8px",
    gap: 10,
    position: "sticky",
    bottom: 0,
  },

  description: {
    paddingLeft: "5px",
  },
});
