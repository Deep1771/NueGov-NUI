import React, { lazy, Suspense, useReducer } from "react";
//custom hooks
import { AssessmentContext, AssessmentReducer, initialState } from "./reducer";
//Custom Components
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { BubbleLoader } from "components/helper_components";
//Inline Components
const Assessment = lazy(() => import("./panels/assessment"));

export const AssessmentPanel = (props) => {
  return (
    <AssessmentContext.Provider
      value={useReducer(AssessmentReducer, initialState)}
    >
      <Suspense fallback={<BubbleLoader />}>
        <Assessment {...props} />
      </Suspense>
    </AssessmentContext.Provider>
  );
};

export default GridWrapper(AssessmentPanel);
