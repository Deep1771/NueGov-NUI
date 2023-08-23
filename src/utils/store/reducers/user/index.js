import { initialState } from "./initial_state";
export const userReducer = (state = userInitialState, action) => {
  switch (action.type) {
    case "SET_USER_DATA":
      return {
        ...state,
        userData: action.payload,
      };

    case "CLEAR_USER_DATA":
      return initialState;

    case "UPDATE_USER_SYS_ENTITY_ATTRIBUTES": {
      return {
        ...state,
        userData: {
          ...state.userData,
          sys_entityAttributes: {
            ...state.userData.sys_entityAttributes,
            ...action.payload,
          },
        },
      };
    }

    default:
      return state;
  }
};

export const userInitialState = initialState;

export default userReducer;
