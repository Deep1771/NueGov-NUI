import React, { createContext, useReducer } from "react";
import SummaryGridContainer from "./main";

const INIT_CONTAINER = "INIT_CONTAINER";
const ADD_ROWS_COLUMNS = "ADD_ROWS_COLUMNS";
const SELECTED_DATA = "SELECTED_DATA";
export const gridReducer = (state, action) => {
  switch (action.type) {
    case INIT_CONTAINER: {
      return {
        ...state,
        ...action.payload,
      };
    }
    case ADD_ROWS_COLUMNS: {
      return {
        ...state,
        ...action.payload,
      };
    }

    case SELECTED_DATA: {
      console.log("action", action, state);
      return {
        ...state,
        ...action.payload,
      };
    }

    case "SET_LOADER": {
      return {
        ...state,
        ...action.payload,
      };
    }

    default:
      return state;
  }
};

export const SummaryGridContext = createContext();

const SummaryContainer = (props) => {
  let initialState = {
    metadata: undefined,
    data: undefined,
    rows: undefined,
    columns: undefined,
    globalsearch: undefined,
    dataCount: 0,
    ITEM_PER_PAGE: 100,
    relationInfo: undefined,
    params: {
      appname: undefined,
      modulename: undefined,
      entityname: undefined,
      filters: undefined,
    },
    selectedRows: [],
    loader: true,
  };

  return (
    <SummaryGridContext.Provider value={useReducer(gridReducer, initialState)}>
      <SummaryGridContainer {...props} />
    </SummaryGridContext.Provider>
  );
};
export default SummaryContainer;
