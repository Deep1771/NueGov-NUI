import configReducer, { configInitialState } from "./system_config.js";
import dashboardReducer, { dashboardInitialState } from "./dashboard";
import filtersReducer, { filtersInitialState } from "./filters";
import presetReducer, { presetInitialState } from "./preset";
import themeReducer, { themeInitialState } from "./theme";
import triggerReducer, { triggerInitialState } from "./trigger";
import userReducer, { userInitialState } from "./user";
import importReducer, { importInitialState } from "./imports";
import moduleReducer, { moduleInitialState } from "./modules/";
import contextualHelperReducer, {
  contextHelperInitialState,
} from "./contextual_helper/index.js";
import mapReducer, { mapInitialState } from "./map";

export const initialState = {
  configState: configInitialState,
  dashboardState: dashboardInitialState,
  filtersState: filtersInitialState,
  presetState: presetInitialState,
  themeState: themeInitialState,
  triggerState: triggerInitialState,
  userState: userInitialState,
  importState: importInitialState,
  moduleState: moduleInitialState,
  contextualHelperState: contextHelperInitialState,
  mapState: mapInitialState,
};

const mainReducer = (
  {
    dashboardState,
    filtersState,
    themeState,
    triggerState,
    userState,
    presetState,
    configState,
    importState,
    moduleState,
    contextualHelperState,
    mapState,
  },
  action
) => ({
  configState: configReducer(configState, action),
  dashboardState: dashboardReducer(dashboardState, action),
  filtersState: filtersReducer(filtersState, action),
  presetState: presetReducer(presetState, action),
  themeState: themeReducer(themeState, action),
  triggerState: triggerReducer(triggerState, action),
  userState: userReducer(userState, action),
  importState: importReducer(importState, action),
  moduleState: moduleReducer(moduleState, action),
  contextualHelperState: contextualHelperReducer(contextualHelperState, action),
  mapState: mapReducer(mapState, action),
});

export default mainReducer;
