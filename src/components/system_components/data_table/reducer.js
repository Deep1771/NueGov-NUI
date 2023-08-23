export const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return {};

    case "SET_DATA": {
      return action.payload;
    }

    case "SET_START_DATETIME":
      return {
        ...state,
        startDateTime: action.payload,
      };

    case "SET_END_DATETIME":
      return {
        ...state,
        endDateTime: action.payload,
      };

    case "SET_HEADERS":
      return {
        ...state,
        headers: action.payload,
      };

    default:
      return null;
  }
};
