import React, { createContext, useReducer, useState, useEffect } from "react";
import DetailTrigger from "./main";
import { getTriggerShell } from "./utils/services";
import { TRIGGER_QUERY } from "utils/constants/query";
import { UserFactory } from "utils/services/factory_services";

//trigger reducer
const triggerReducer = (state, action) => {
  switch (action.type) {
    case "SET_TRIGGER_TEMPLATE": {
      return {
        ...state,
        template: action.payload,
      };
    }

    case "UPDATE_ACTIVE_STEP": {
      return {
        ...state,
        activeStep: action.payload,
      };
    }

    default:
      return state;
  }
};

//trigger context
export const TriggerContext = createContext();

const TriggerContainer = (props) => {
  const { properties, detailMode, mode, onClose } = props;
  const { checkWriteAccess } = UserFactory();
  let initialState = {
    activeStep: 0,
    detailMode,
    mode,
    template: properties?.metadata,
    data: getTriggerShell(props),
    editable: checkWriteAccess(TRIGGER_QUERY),
  };
  return (
    <TriggerContext.Provider value={useReducer(triggerReducer, initialState)}>
      <DetailTrigger onClose={onClose} />
    </TriggerContext.Provider>
  );
};

export default TriggerContainer;
