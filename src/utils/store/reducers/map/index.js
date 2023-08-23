import { initialState } from "./initial_state";

export const mapReducer = (state = mapInitialState, action) => {
  switch (action.type) {
    case "INIT_MAP_CONTAINER": {
      return {
        ...state,
        ...action.payload,
      };
    }
    case "RESET_MAP_CONTAINER": {
      return {
        ...state,
        summaryData: [],
        type: undefined,
        isGeoFenceApplied: false,
        mapParams: undefined,
        mapFixedShape: null,
        mapPolygon: null,
        mapPreviousView: {},
      };
    }
    default:
      return state;
  }
};

export const mapInitialState = initialState;

export default mapReducer;
