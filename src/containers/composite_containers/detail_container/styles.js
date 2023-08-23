export const styles = {
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    height: "100%",
    width: "100%",
    contain: "strict",
    position: "relative",
    backgroundColor: "#f5f5f5",
  },
  comp_btns: {
    display: "flex",
    flexShrink: 3,
    justifyContent: "flex-end",
    marginBottom: "15px",
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    flexShrink: 1,
    padding: "4px 0px 8px 0px",
    backgroundColor: "#ffffff",
  },
  floatBtns: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    flexShrink: 1,
    marginBottom: "2px",
    padding: "0.5rem 0.5rem 0.5rem 1rem",
    boxShadow:
      "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
    backgroundColor: "#ffffff",
  },
  header_btn_sec: {
    alignItems: "center",
    display: "flex",
    flex: 12,
    justifyContent: "flex-end",
  },
  header_title_sec: {
    alignItems: "center",
    display: "flex",
    flex: 9,
  },
  main_tab: {
    display: "flex",
    flexShrink: 1,
  },
  sections: {
    alignItems: "flex-start",
    display: "flex",
    flex: 9,
    overflow: "auto",
  },
  sub_tab: {
    display: "flex",
    height: "42px",
    alignItems: "center",
    // margin: "0% 5% 8px 5 %",
    flexShrink: 1,
    backgroundColor: "#ffffff",
    border: "1px solid #ebebeb",
  },
};

export const computeColSpan = (colSpan) => {
  let computation = 100 / colSpan;
  return computation ? `${parseInt(computation)}%` : undefined;
};
