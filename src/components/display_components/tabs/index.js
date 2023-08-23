import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "@material-ui/core";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";
import { DisplayBadge } from "components/display_components";
export const DisplayTabs = (props) => {
  let {
    defaultSelect,
    onChange,
    style,
    systemVariant,
    tabs,
    titleKey,
    valueKey,
    testid,
    ...rest
  } = props;
  const { getVariantForComponent } = ThemeFactory();
  const { useTabStyles, useTabsStyles } = Stylesheet();
  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useTabsStyles(getVariantForComponent("TABS", defaultVariant));
  const tabClasses = useTabStyles(
    getVariantForComponent("TAB", defaultVariant)
  );

  const [value, setValue] = useState(
    defaultSelect ? defaultSelect : tabs[0][titleKey]
  );

  useEffect(() => {
    if (defaultSelect) setValue(defaultSelect);
  }, [defaultSelect]);

  const onTabSelect = (e, section) => {
    onChange &&
      onChange(
        section,
        tabs.find((tab) => tab[valueKey] === section)
      );
  };

  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const getRequiredFields = (tab) => {
    let { fields = [] } = tab || {};
    return fields.filter((e) => e.required === true);
  };

  return (
    <Tabs
      value={value}
      classes={{
        indicator: classes.indicator,
        root: classes.root,
        scrollButtons: classes.scrollButtons,
      }}
      indicatorColor="transparent"
      onChange={onTabSelect}
      {...rest}
      testid={testid}
      style={{ ...style }}
    >
      {tabs.map((tab, i) => {
        let requiredFields = getRequiredFields(tab);
        return (
          <Tab
            testid={`${testid || ""}-${tab[valueKey]}`}
            {...rest}
            classes={{
              root: tabClasses.root,
              selected: tabClasses.selected,
            }}
            key={i}
            label={
              <DisplayBadge
                classes={{
                  selected: tabClasses.selected,
                }}
                style={{
                  // color: defaultSelect == `${tab[valueKey]}` ? "" : "#212121",
                  fontWeight: defaultSelect == `${tab[valueKey]}` ? 500 : 300,
                }}
                invisible={!tab.count}
                badgeContent={
                  <div style={{ position: "absolute", "text-align": "center" }}>
                    {tab.count}{" "}
                  </div>
                }
              >
                <span>
                  {tab[titleKey]}
                  {requiredFields.length > 0 ? (
                    <span style={{ color: "red", fontWeight: 500 }}> *</span>
                  ) : (
                    <></>
                  )}
                </span>
              </DisplayBadge>
            }
            value={tab[valueKey]}
            {...a11yProps(i)}
            icon={tab.icon}
          />
        );
      })}
    </Tabs>
  );
};
DisplayTabs.defaultProps = {
  variant: "fullWidth",
};
