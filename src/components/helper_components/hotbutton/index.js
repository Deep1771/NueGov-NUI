import React, { useState } from "react";
import { SystemIcons } from "utils/icons";
import { Menu, MenuItem } from "@material-ui/core";
import {
  DisplayButton,
  DisplayText,
} from "components/display_components/index";
import { isDefined } from "utils/services/helper_services/object_methods";
import {
  textExtractor,
  systemTrigger,
} from "utils/services/helper_services/system_methods";
import { entity } from "utils/services/api_services/entity_service";
import { get } from "utils/services/helper_services/object_methods";
import { makeStyles } from "@material-ui/core/styles";

const dotProp = require("dot-prop");

const { ArrowDropDown } = SystemIcons;

const useStyles = makeStyles(() => ({
  buttonDiv: { display: "flex", flexDirection: "row" },
  text: {
    display: "flex",
    alignItems: "center",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  menuitem: { display: "flex", flex: 1, alignItems: "center" },
  img: { height: "20px" },
  icon: {
    margin: "1px 4px 1px 1px",
    height: "20px",
    width: "20px",
    borderRadius: "50%",
    overflow: "hidden",
  },
}));

const HotButton = (props) => {
  const {
    appname,
    modulename,
    entityname,
    entityDoc,
    entityTemplate,
    displayTitle,
    disable: DISABLE,
    buttonStyle,
    textVariant = "body2",
  } = props;
  const { sys_topLevel, sys_hotButtons } = get(
    entityTemplate,
    "sys_entityAttributes"
  );
  const [menu, setMenu] = useState(null);
  const classes = useStyles();

  const updateStatus = (fieldName, statusValue, valueName, currentData) => {
    let query = {
      appname,
      modulename,
      entityname,
      id: entityDoc._id,
    };

    let updateData = dotProp.set(
      entityDoc,
      `sys_entityAttributes.${fieldName}`,
      statusValue
    );

    if (sys_hotButtons.triggers && valueName) {
      let statusfields = sys_hotButtons.triggers.filter(
        (item) => item.onValue == valueName
      );
      if (statusfields && statusfields.length) {
        statusfields.map((statusfield) => {
          let { type, path, data, fromValues } = statusfield;
          if (!fromValues || fromValues.includes(currentData)) {
            let valueToUpdate = systemTrigger(type, data);
            if (isDefined(valueToUpdate))
              updateData = dotProp.set(updateData, path, valueToUpdate);
            else dotProp.delete(updateData, path);
          }
        });
      }
    }
    entity
      .update(query, updateData)
      .then((res) => {
        props.handleLoading(true, true);
      })
      .catch((e) => {
        console.log("message = Try again....!");
      });
  };

  const handleHotbuttons = (statusValue, valueName, checkData) => {
    let fieldName = sys_hotButtons.name;
    setMenu(false);
    props.handleLoading(true);
    updateStatus(fieldName, statusValue, valueName, checkData);
  };

  const setHotButton = () => {
    let { name, keys, title, disable, defaultValue, path } =
      entityTemplate?.sys_entityAttributes?.sys_hotButtons || {};
    let { titleKey, valueKey, listKey, variantKey, iconKey } = keys || {};
    let fieldInfo = sys_topLevel.find((item) => item.name === name);
    if (fieldInfo) {
      let fieldData = get(entityDoc, `sys_entityAttributes.${fieldInfo.name}`);
      let statusArray = fieldInfo[listKey ? listKey : "values"];
      let filteredStatusArray = statusArray.filter(
        (value) => Object.keys(value).length !== 0
      );
      let checkData = get(entityDoc, path);
      let activeIndex = filteredStatusArray.findIndex(
        (item) => item[valueKey || "id"] == checkData
      );
      let activeData = filteredStatusArray.find(
        (item) => item[valueKey || "id"] == checkData
      );
      let activeDataVariant = activeData
        ? activeData[variantKey || "variant"]
        : "primary";
      let { canUpdate, disable: disableList } = fieldInfo;
      let disableSelection = disable || DISABLE || !canUpdate || disableList;

      return (
        <>
          {displayTitle && (
            <div
              style={{
                padding: "0px 8px 0px 0px",
                fontFamily: "inherit",
                fontWeight: "400",
              }}
            >
              {title ? title : ""}
            </div>
          )}
          <DisplayButton
            variant="contained"
            systemVariant={activeDataVariant}
            onClick={(e) => !disableSelection && setMenu(e.currentTarget)}
            endIcon={!disableSelection && <ArrowDropDown />}
            style={{
              boxShadow: "none",
              textTransform: "none",
              justifyContent: "space-around",
              fontWeight: "400",
              padding: "8px",
              borderRadius: "5%",
              ...(buttonStyle || {}),
            }}
            testid={"hotButton-menu"}
          >
            <div className={classes.buttonDiv}>
              {activeData?.[iconKey] && (
                <div className={classes.icon}>
                  <img className={classes.img} src={activeData[iconKey]} />
                </div>
              )}
              <DisplayText className={classes.text} variant={textVariant}>
                {textExtractor(fieldData, fieldInfo)
                  ? textExtractor(fieldData, fieldInfo)
                  : defaultValue}
              </DisplayText>
            </div>
          </DisplayButton>
          <Menu
            id="hotbutton-menu"
            anchorEl={menu}
            keepMounted
            open={Boolean(menu)}
            onClose={(e) => setMenu(null)}
            PaperProps={{
              style: { maxHeight: "150px" },
            }}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            variant="contained"
          >
            {filteredStatusArray?.map((item, index) => {
              let valueName = item?.[titleKey || "value"];
              let statusValue = item?.[valueKey || "id"];
              let iconValue = item?.[iconKey];
              return (
                <MenuItem
                  onClick={(e) =>
                    !(index === activeIndex) &&
                    handleHotbuttons(statusValue, valueName, checkData)
                  }
                  selected={index === activeIndex}
                >
                  <div className={classes.menuitem}>
                    {iconValue && (
                      <div className={classes.icon}>
                        <img className={classes.img} src={iconValue} />
                      </div>
                    )}
                    {isDefined(valueName) && valueName}
                  </div>
                </MenuItem>
              );
            })}
          </Menu>
        </>
      );
    } else return null;
  };
  return setHotButton();
};

export default HotButton;
