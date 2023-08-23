// contexts/index.js
import React, { createContext, useContext, useReducer } from "react";

export const StateContext = createContext();

export const StateProvider = ({ reducer, initialState, children }) => {
  /*
        Add here your middleware logic....
    */
  return (
    <StateContext.Provider value={useReducer(reducer, initialState)}>
      {" "}
      {/* useReducer returns the state and a dispatch function to update state */}
      {children}
    </StateContext.Provider>
  );
};

export const useStateValue = () => useContext(StateContext);
