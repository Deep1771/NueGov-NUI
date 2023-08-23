import { makeStyles } from "@material-ui/core/styles";

export const useTriggerStyles = makeStyles({
  t_container: {
    flex: 1,
    display: "flex",
    backgroundColor: "#fff",
    flexDirection: "column",
    margin: 16,
  },
  stepper: {
    display: "flex",
    flexShrink: 1,
  },
  dynamic_container: {
    display: "flex",
    flex: 9,
    padding: "0px 20px",
    flexDirection: "column",
  },
  l_actionbuttons: {
    display: "flex",
    flex: 8,
  },
  r_actionbuttons: {
    display: "flex",
    flex: 4,
    justifyContent: "flex-end",
  },
  back: {
    position: "absolute",
    left: 16,
    top: 16,
  },
  footer: {
    display: "flex",
    flexShrink: 1,
    flexDirection: "row",
  },
});

export const useProgressStyles = makeStyles({
  p_container: {},
});

export const useRuleStyles = makeStyles({
  r_title: {
    display: "flex",
    flexShrink: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  r_control: {
    display: "flex",
    flexShrink: 1,
    flexDirection: "row",
  },
  r_container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  m_container: {
    display: "flex",
    flexShrink: 1,
    flexDirection: "row",
  },
  c_container: {
    display: "flex",
    flex: 9,
    flexDirection: "column",
  },
  record_actions: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  execute_section: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  expanded: {},
  root: {
    display: "flex",
    backgroundColor: "#ddd",
    minHeight: "48px",
    margin: "0px",
    "&$expanded": {
      minHeight: "48px",
      margin: "0px",
    },
  },
  content: {
    margin: "0px",
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    "&$expanded": {
      minHeight: "48px",
      margin: "0px",
    },
  },
});
