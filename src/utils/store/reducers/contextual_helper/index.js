import { initialState } from "./initial_state";
export const contextualHelperReducer = (
  state = contextHelperInitialState,
  action
) => {
  switch (action.type) {
    case "SET_CONTEXTUAL_DATA":
      return {
        ...state,
        contextualHelperData: action.payload,
      };

    default:
      return state;
  }
};

export const contextHelperInitialState = initialState;

export default contextualHelperReducer;
