import { initialState } from "./initial_state";
export const configReducer = (state = configInitialState, action) => {
  switch (action.type) {
    case "SET_DRAWER":
      return {
        ...state,
        isDrawerOpen: action.payload,
      };

    case "SET_SNACK_BAR":
      return {
        ...state,
        snackBar: action.payload,
      };
    case "SET_BACK_DROP":
      return {
        ...state,
        backDrop: action.payload,
      };

    case "CLEAR_CONFIG":
      return initialState;

    case "SET_MAP":
      return {
        ...state,
        map: action.payload,
      };

    case "SET_SUMMARY_LEGEND":
      return {
        ...state,
        summaryLegendState: action.payload,
      };
    case "SET_SUMMARY_CLUSTERING":
      return {
        ...state,
        summaryClustering: action.payload,
      };
    case "SET_SUMMARY_SUBLAYERS":
      return {
        ...state,
        summarySubLayers: action.payload,
      };

    case "SET_SUMMARY_MAP_POSITION":
      return {
        ...state,
        summaryMapPosition: action.payload,
      };

    case "SET_MAP_INTERACTION":
      return {
        ...state,
        lastInteractedPosition: action.payload,
      };

    case "SET_TRIGGER_STATE":
      return {
        ...state,
        triggerToSave: action.payload,
      };

    case "SET_SYSTEM_TYPES":
      return {
        ...state,
        systemTypes: action.payload,
      };

    case "SET_SUMMARY_FULLSCREEN":
      return {
        ...state,
        fullScreenSize: action.payload,
      };

    case "SET_SIDEBAR_CLICK_STATUS":
      return {
        ...state,
        sidebarClickStatus: action.payload,
      };

    case "SET_PREVIOUS_ENTITY":
      return {
        ...state,
        previousEntity: action.payload,
      };

    default:
      return state;
  }
};

export const configInitialState = initialState;

export default configReducer;
