import { initialState } from "./initial_state";

export const moduleReducer = (state = moduleInitialState, action) => {
  switch (action.type) {
    case "SET_DEFAULT_ENTITY":
      return {
        ...state,
        defaultEntity: action.payload,
      };
    case "SET_ACTIVE_MODULE":
      return {
        ...state,
        activeModule: action.payload,
      };
    case "SET_ACTIVE_MODULE_ENTITIES":
      return {
        ...state,
        activeModuleEntities: action.payload,
      };
    case "SET_ALL_MODULES":
      return {
        ...state,
        allModules: action.payload,
      };
    case "SET_ACTIVE_MODULE_MAPLAYERS":
      return {
        ...state,
        activeModuleMapLayers: action.payload,
      };
    case "SET_ACTIVE_ENTITY":
      return {
        ...state,
        activeEntity: action.payload,
      };
    case "SET_USER_DEFAULT":
      return {
        ...state,
        userDefault: action.payload,
      };

    case "CLEAR_MODULE_STATE": {
      return initialState;
    }

    default:
      return state;
  }
};

export const moduleInitialState = initialState;

export default moduleReducer;
