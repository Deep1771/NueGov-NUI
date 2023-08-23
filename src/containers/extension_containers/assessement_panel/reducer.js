import { createContext, useContext } from "react";

//START OF CONTEXT
export const AssessmentContext = createContext();
export const useAssessmentState = () => useContext(AssessmentContext);
//END OF CONTEXT

//START OF REDUCER
export const AssessmentReducer = (state, action) => {
  switch (action.type) {
    case "SET_COMMUNITY_TREE": {
    }
  }
};

//INITIALSTATE
export const initialState = {
  communityTree: {},
};
