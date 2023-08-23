import { initialState } from "./initial_state";
export const dashboardReducer = (state = dashboardInitialState, action) => {
  switch (action.type) {
    case "INIT_INSIGHTS": {
      return {
        ...state,
        ...action.payload,
      };
    }
    case "BOARD_UPDATE": {
      return {
        ...state,
        boardUpdated: action.payload,
      };
    }
    case "EDIT_LAYOUT": {
      return {
        ...state,
        editLayout: action.payload,
      };
    }
    case "SET_SAVE_POPUP": {
      return {
        ...state,
        savePopup: action.payload,
      };
    }
    case "BOARD_SET_UPDATE": {
      return {
        ...state,
        boardSetUpdated: action.payload,
      };
    }
    case "TRIGGER_SAVE": {
      return {
        ...state,
        triggerSave: action.payload,
      };
    }

    case "SET_PRECONFIGURED_BOARDS": {
      let { userDefaultBoard = {} } = action.payload || {};
      if (userDefaultBoard) {
        userDefaultBoard = {
          id: userDefaultBoard._id,
          sys_gUid: userDefaultBoard.sys_gUid,
          boardName: userDefaultBoard?.sys_entityAttributes?.boardName || "",
        };
      }

      return {
        ...state,
        ...action.payload,
        userDefaultBoard: userDefaultBoard,
      };
    }

    case "SET_USERDEFAULT_BOARD": {
      return {
        ...state,
        userDefaultBoard: action.payload,
      };
    }

    case "RESET_DEFAULT_BOARD": {
      return {
        ...state,
        userDefaultBoard: {},
      };
    }

    case "CLEAR_DASHBOARD": {
      return initialState;
    }

    default:
      return state;
  }
};

export const dashboardInitialState = initialState;
export default dashboardReducer;
