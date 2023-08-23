import React, { createContext, useReducer } from "react";

//CONTEXT
export const tableContext = createContext();
export const tableDispatchContext = createContext();

//REDUCER
export const tableReducer = (rowData, action) => {
  switch (action.type) {
    case "ROW_ADDED": {
      return {
        ...rowData,
        lineItems: [action.payload, ...rowData.lineItems],
      };
    }

    case "ROW_UPADTED": {
      let index = action.rowIndex;
      let newData = action.newData;
      rowData.lineItems.splice(index, 1, newData);
      return {
        ...rowData,
      };
    }

    case "ROW_DELETED": {
      //get the index from payload
      let index = action.rowIndex;
      rowData.lineItems.splice(index, 1);
      return {
        ...rowData,
      };
    }

    case "DB_DATA": {
      return {
        ...rowData,
        lineItems: [...action.payload],
      };
    }

    case "NOTES_DATA": {
      return {
        ...rowData,
        notes: action.notesData,
      };
    }

    case "UPDATE_COST": {
      return {
        ...action.payload,
      };
    }

    case "UPDATE_DISCONT_TYPE": {
      return {
        ...rowData,
        discount: {
          ...rowData.discount,
          type: action.payload,
        },
      };
    }

    case "UPADTE_DISCOUNT_VALUE": {
      return {
        ...rowData,
        discount: {
          ...rowData.discount,
          value: action.payload,
        },
      };
    }

    default: {
      console.log("comes to default data ->", { rowData, action });
      return {
        ...action.payload,
      };
    }
  }
};

export const initialState = {
  lineItems: [],
  lineSubTotal: "",
  discount: {
    type: "%",
    value: "",
  },
  total: "",
  notes: "",
};
