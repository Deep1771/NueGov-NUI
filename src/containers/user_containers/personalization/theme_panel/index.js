import React, { useEffect } from "react";
import { Fade } from "@material-ui/core";
import { basicEntityData } from "utils/services/helper_services/system_methods";
import { entity } from "utils/services/api_services/entity_service";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import { useStateValue } from "utils/store/contexts";
import { BubbleLoader } from "components/helper_components";
import {
  DisplayGrid,
  DisplayIconButton,
  DisplaySkin,
  DisplayText,
} from "components/display_components";
import { PaperWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";

const ThemePanel = () => {
  const {
    getAllThemesAndStore,
    getUserDefaults,
    setActiveTheme,
    setDefaultTheme,
    setSnackBar,
  } = GlobalFactory();
  const { getRefObj } = UserFactory();
  const [{ themeState }] = useStateValue();
  const shellObject = basicEntityData();
  const { activeTheme, defaultTheme, themes } = themeState;
  const { CheckCircleOutline, RadioOutlined } = SystemIcons;

  // JSon
  const defaultsQuery = {
    appname: "NJAdmin",
    modulename: "NJ-Personalization",
    entityname: "UserDefault",
  };

  // Setters
  const setThemeActive = (themeData, title) => {
    sessionStorage.setItem("theme-id", get(themeData, "_id"));
    setSnackBar({ message: `${title} theme is currently active` });
    setActiveTheme(themeData);
  };

  // Getters
  const getActiveThemeID = get(activeTheme, "sys_gUid");
  const getDefaultThemeID = get(defaultTheme, "sys_gUid");

  // Custom Function
  const makeDefaultTheme = (themeData, title) => {
    setSnackBar({
      message: `${title} has been made as default theme`,
      severity: "info",
    });
    setDefaultTheme(themeData);
    getUserDefaults().then((res) => {
      let obj = res ? { ...res } : { ...shellObject };
      obj["sys_entityAttributes"]["theme"] = {
        id: get(themeData, "_id"),
        sys_gUid: get(themeData, "sys_gUid"),
        presetName: get(themeData, "sys_entityAttributes.themeName"),
      };
      if (res) {
        let queryObj = { id: res._id, ...defaultsQuery };
        entity.update(queryObj, obj);
      } else {
        obj["sys_entityAttributes"]["userName"] = getRefObj();
        entity.create(defaultsQuery, obj);
      }
    });
  };

  // UseEffects
  useEffect(() => {
    if (!themes || !themes.length) getAllThemesAndStore();
  }, [themes]);

  return (
    <PaperWrapper style={{ boxShadow: "none", borderRadius: "12px" }}>
      <div
        style={{
          flexShrink: 1,
          display: "flex",
          padding: "1rem",
          flexDirection: "column",
        }}
      >
        <DisplayText
          style={{
            fontFamily: "inherit",
            fontWeight: 500,
          }}
          variant="h5"
        >
          Select Skins
        </DisplayText>
        <hr style={{ border: "1px solid #ebebeb", width: "100%" }} />
      </div>
      {themes && themes.length ? (
        <Fade in={true} timeout={1500}>
          <div style={{ flex: 9, display: "flex", flexDirection: "column" }}>
            <DisplayGrid container>
              {themes.map((theme, i) => {
                const { sys_entityAttributes, sys_gUid } = theme;
                const { themeTitle, themeObject } = sys_entityAttributes;
                const navColor = get(themeObject, "variants.primary");
                const isActive = getActiveThemeID === sys_gUid;
                const isDefault = getDefaultThemeID === sys_gUid;
                return (
                  <DisplayGrid
                    testid={`theme-card-${theme._id}`}
                    id={`theme-card-${theme._id}`}
                    key={theme._id}
                    onClick={() => {
                      setThemeActive(theme, themeTitle);
                    }}
                    item
                    style={{
                      height: "12rem",
                      width: "10rem",
                      margin: "1rem",
                      display: "flex",
                      cursor: "pointer",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flex: 7,
                        flexDirection: "column-reverse",
                      }}
                    >
                      <DisplaySkin
                        selected={isActive}
                        headerColor={navColor}
                        title={themeTitle}
                      />
                      <div
                        style={{ position: "absolute", alignSelf: "flex-end" }}
                      >
                        <DisplayIconButton
                          testid={`theme-card-def-${theme._id}`}
                          id={`theme-card-def-${theme._id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            makeDefaultTheme(theme, themeTitle);
                          }}
                          style={{ padding: "0px 5px 5px 0px" }}
                          systemVariant="primary"
                        >
                          {isDefault ? (
                            <CheckCircleOutline style={{ fontSize: "20px" }} />
                          ) : (
                            <RadioOutlined style={{ fontSize: "20px" }} />
                          )}
                        </DisplayIconButton>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flex: 3,
                        alignSelf: "center",
                        justifyContent: "center",
                        paddingTop: "10px",
                      }}
                    >
                      <DisplayText
                        style={{
                          fontColor: isActive ? "black" : "#f5f5f5",
                          fontWeight: 300,
                        }}
                      >
                        {themeTitle}
                      </DisplayText>
                    </div>
                  </DisplayGrid>
                );
              })}
            </DisplayGrid>
          </div>
        </Fade>
      ) : (
        <div
          style={{
            height: "100%",
            width: "70vw",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BubbleLoader />
        </div>
      )}
    </PaperWrapper>
  );
};

export default ThemePanel;
