export const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return {};

    case "SET_CLOCKIN_ADDRESS":
      return {
        ...state,
        clockInAddress: action.payload,
      };

    case "SET_CLOCKIN_DESCRIPTION":
      return {
        ...state,
        clockInDescription: action.payload,
      };

    case "SET_CLOCKIN_LATLONG":
      return {
        ...state,
        clockInLocation: action.payload,
      };

    case "SET_CLOCKIN_TIME":
      return {
        ...state,
        clockInDateTime: action.payload,
      };

    case "SET_CLOCKOUT_ADDRESS":
      return {
        ...state,
        clockOutAddress: action.payload,
      };

    case "SET_CLOCKOUT_DESCRIPTION":
      return {
        ...state,
        clockOutDescription: action.payload,
      };

    case "SET_CLOCKOUT_LATLONG":
      return {
        ...state,
        clockOutLocation: action.payload,
      };
    case "SET_CLOCKOUT_TIME":
      return {
        ...state,
        clockOutDateTime: action.payload,
      };

    case "SET_DATA": {
      return action.payload;
    }

    case "SET_TIME_DURATION":
      return {
        ...state,
        timeDuration: action.payload,
      };

    case "SET_TOTAL_TIME_DIFFERENCE":
      return {
        ...state,
        totalTimeDifference: action.payload,
      };

    default:
      return null;
  }
};
