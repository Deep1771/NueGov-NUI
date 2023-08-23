import React, { lazy, Suspense, useReducer } from "react";
//custom hooks
import {
  initialState,
  permissionReducer,
  PermissionContext,
} from "./permission_reducer";
//Custom Components
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { BubbleLoader } from "components/helper_components";
//Inline Components
const AppPanel = lazy(() => import("./app_panel/"));

export const SystemPermission = (props) => {
  return (
    <PermissionContext.Provider
      value={useReducer(permissionReducer, initialState)}
    >
      <Suspense fallback={<BubbleLoader />}>
        <AppPanel {...props} />
      </Suspense>
    </PermissionContext.Provider>
  );
};

export default GridWrapper(SystemPermission);
