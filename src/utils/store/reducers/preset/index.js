import { initialState } from "./initial_state";

export const presetReducer = (state = presetInitialState, action) => {
  switch (action.type) {
    case "SET_DEFAULT_PRESET":
      return {
        ...state,
        defaultPreset: action.payload,
      };
    case "SET_ACTIVE_PRESET":
      return {
        ...state,
        activePreset: action.payload,
      };
    case "SET_PRESET_TEMPLATES":
      return {
        ...state,
        presetTemplates: action.payload,
      };

    case "CLEAR_PRESET":
      return initialState;
    default:
      return state;
  }
};

export const presetInitialState = initialState;

export default presetReducer;
