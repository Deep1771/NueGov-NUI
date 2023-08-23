import { initialState } from "./initial_state";
export const triggerReducer = (state = triggerInitialState, action) => {
  switch (action.type) {
    case "SET_TRIGGER_TEMPLATE": {
      return {
        ...state,
        template: action.payload,
      };
    }

    case "SET_TRIGGER_FLAGS": {
      const { name, value } = action.payload;
      return {
        ...state,
        flags: {
          ...state.flags,
          [name]: value,
        },
      };
    }

    case "UPDATE_TRIGGER_FORM": {
      return {
        ...state,
        data: {
          ...state.data,
          sys_entityAttributes: action.payload,
        },
      };
    }

    case "UPDATE_ACTIVE_STEP": {
      return {
        ...state,
        stepper: {
          ...state.stepper,
          activeStep: action.payload,
        },
      };
    }

    default:
      return state;
  }
};

export const triggerInitialState = initialState;

export default triggerReducer;
