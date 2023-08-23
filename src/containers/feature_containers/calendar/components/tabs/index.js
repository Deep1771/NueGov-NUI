import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";
import { UserList, Documents, Overview } from "./components";
import ActionItems from "containers/feature_containers/actionItems";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

let TabSection = (props) => {
  const { getVariantForComponent } = ThemeFactory();
  const { useTabStyles, useTabsStyles } = Stylesheet();

  const tabClasses = useTabStyles(getVariantForComponent("TAB", "primary"));
  const tabListClasses = useTabsStyles(
    getVariantForComponent("TABS", "primary")
  );

  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      flexGrow: 1,
      width: 350,
      flexWrap: "wrap",
      overflow: "hidden",
    },
  }));
  const classes = useStyles();
  let { tabs } = props;
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  let createTabs = () => {
    return (
      tabs &&
      tabs.map((tab, index) => {
        return (
          <Tab
            classes={{
              root: tabClasses.root,
              selected: tabClasses.selected,
            }}
            key={index}
            label={tab.title}
            {...a11yProps(index)}
          />
        );
      })
    );
  };

  let getSecurityParams = (eventInfo) => {
    let security = {};
    try {
      if (eventInfo.host) security.host = [...eventInfo.host, eventInfo.owner];
      if (eventInfo.RoleBased) security.RoleBased = eventInfo.RoleBased;
      if (eventInfo.UserBased) security.UserBased = eventInfo.UserBased;
      if (eventInfo.UserGroupBased)
        security.UserGroupBased = eventInfo.UserGroupBased;
      return security;
    } catch (e) {}
  };

  let createTabPanel = () => {
    return (
      tabs &&
      tabs.map((tab, index) => {
        switch (tab.runtimeComponent.toUpperCase()) {
          case "OVERVIEW": {
            return (
              <TabPanel
                key={index}
                value={value}
                index={index}
                style={{ overflow: "auto" }}
              >
                <Overview type={tab["type"]} properties={tab["properties"]} />
              </TabPanel>
            );
          }
          case "USERLIST": {
            return (
              <TabPanel key={index} value={value} index={index}>
                <UserList type={tab["type"]} properties={tab["properties"]} />
              </TabPanel>
            );
          }
          case "DOCUMENT": {
            return (
              <TabPanel key={index} value={value} index={index}>
                <Documents
                  properties={tab["properties"]}
                  securityParams={getSecurityParams()}
                />
              </TabPanel>
            );
          }
          case "ACTIONITEM": {
            return (
              <TabPanel key={index} value={value} index={index}>
                <ActionItems
                  toolbar={false}
                  cardWidth={280}
                  refData={tab["properties"].event}
                  securityParams={getSecurityParams(tab["properties"])}
                />
              </TabPanel>
            );
          }
        }
      })
    );
  };

  return (
    <div className={classes.root}>
      <AppBar
        position="static"
        style={{ backgroundColor: "#fafafa", color: "black" }}
        elevation={0}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          classes={{
            indicator: tabListClasses.indicator,
            root: tabListClasses.root,
            scrollButtons: tabListClasses.scrollButtons,
          }}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {createTabs()}
        </Tabs>
      </AppBar>
      <div style={{ display: "flex" }}>{createTabPanel()}</div>
    </div>
  );
};
export default TabSection;
