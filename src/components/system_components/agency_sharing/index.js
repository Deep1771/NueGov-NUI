import React, { useReducer } from "react";
import { ContextPermission } from "./panels/";
import {
  AgencySharingContext,
  initialState,
  reducer,
} from "./agency_sharing_reducer";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";

export const SystemAgencySharing = (props) => {
  return (
    <AgencySharingContext.Provider value={useReducer(reducer, initialState)}>
      <ContextPermission {...props} />
    </AgencySharingContext.Provider>
  );
};

export default GridWrapper(SystemAgencySharing);
