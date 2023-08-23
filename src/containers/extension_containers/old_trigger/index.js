import React, { createContext, useReducer } from "react";
import TriggerContainer from "./main";
import { UserFactory } from "utils/services/factory_services";

const triggerReducer = (state, action) => {
  switch (action.type) {
    case "SET_TRIGGER_TEMPLATE": {
      return {
        ...state,
        template: action.payload,
      };
    }

    case "SET_TRIGGER_FLAGS": {
      const { name, value } = action.payload;
      return {
        ...state,
        flags: {
          ...state.flags,
          [name]: value,
        },
      };
    }

    case "UPDATE_TRIGGER_FORM": {
      return {
        ...state,
        data: {
          ...state.data,
          sys_entityAttributes: action.payload,
        },
      };
    }

    case "UPDATE_ACTIVE_STEP": {
      return {
        ...state,
        stepper: {
          ...state.stepper,
          activeStep: action.payload,
        },
      };
    }

    default:
      return state;
  }
};

export const TriggerContext = createContext();

const getDefaultValue = (params) => {
  const { detailMode, properties, data, mode } = params;
  const { getAgencyId, getRefObj } = UserFactory();
  const createdBy = getRefObj();
  const sys_templateName = "Trigger";
  const defValues = {
    title: "",
    entityInfo: null,
    createdBy,
    record_actions: {
      inserted: false,
      updated: false,
      deleted: false,
    },
    subject: "",
    stampagency: null,
    body: "",
  };
  if (detailMode) {
    const {
      id,
      sys_gUid,
      sys_agencyId,
      metadata,
      appname: appName,
      modulename: moduleName,
      groupname: groupName,
    } = properties;
    return {
      stepper: {
        activeStep: 0,
      },
      detailMode,
      mode,
      template: metadata,
      data: data || {
        sys_agencyId,
        sys_templateName,
        sys_entityAttributes: {
          ...defValues,
          doc_id: id,
          doc_sys_gUid: sys_gUid,
          createdBy,
          entityInfo: {
            appName,
            moduleName,
            groupName,
            friendlyName: metadata?.sys_entityAttributes?.sys_friendlyName,
            name: metadata?.sys_entityAttributes?.sys_templateName,
            unique_key: `${appName}-${moduleName}-${groupName}`,
          },
        },
      },
    };
  } else {
    return {
      stepper: {
        activeStep: 0,
      },
      detailMode,
      mode,
      template: undefined,
      data: data || {
        sys_agencyId: getAgencyId,
        sys_templateName,
        sys_entityAttributes: {
          ...defValues,
          createdBy,
        },
      },
    };
  }
};

const Trigger = (props) => {
  let defValue = getDefaultValue(props);
  return (
    <TriggerContext.Provider value={useReducer(triggerReducer, defValue)}>
      <TriggerContainer {...props} />
    </TriggerContext.Provider>
  );
};

export default Trigger;
