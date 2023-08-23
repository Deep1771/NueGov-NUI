import { initialState } from "./initial_state";
export const themeReducer = (state = themeInitialState, action) => {
  switch (action.type) {
    case "SET_DEFAULT_THEME":
      return {
        ...state,
        defaultTheme: action.payload,
      };

    case "SET_ACTIVE_THEME":
      return {
        ...state,
        activeTheme: action.payload,
      };

    case "SET_AVAILABLE_THEMES":
      return {
        ...state,
        themes: action.payload,
      };

    case "CLEAR_THEME":
      return initialState;

    default:
      return state;
  }
};

export const themeInitialState = initialState;

export default themeReducer;
