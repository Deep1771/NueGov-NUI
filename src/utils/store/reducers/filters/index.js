import { initialState } from "./initial_state";
import { get } from "utils/services/helper_services/object_methods";

export const filtersReducer = (state = filtersInitialState, action) => {
  switch (action.type) {
    case "SET_FILTERS_DEFAULTS":
      return {
        ...state,
        ...action.payload,
      };

    case "SET_USER_DEFAULT_FILTER": {
      let { filter, entityName } = action.payload;
      let defaultFilterExist = state.userDefault.find((ef) => {
        let sys_groupName = get(
          ef,
          "sys_entityAttributes.entityName.sys_groupName"
        );
        return sys_groupName === entityName;
      });
      if (defaultFilterExist) {
        return {
          ...state,
          userDefault: state.userDefault.map((eachFilter) => {
            if (
              get(
                eachFilter,
                "sys_entityAttributes.entityName.sys_groupName"
              ) === entityName
            ) {
              return filter;
            }
            return eachFilter;
          }),
        };
      } else {
        return {
          ...state,
          userDefault: [...state.userDefault, filter],
        };
      }
    }

    case "REMOVE_USER_DEFAULT_FILTER": {
      let { filterId } = action.payload;
      return {
        ...state,
        userDefault: state.userDefault.filter(
          (eachFilter) => eachFilter._id !== filterId
        ),
      };
    }

    case "SET_ENTITY_FILTERS":
      return {
        ...state,
        entityFilters: action.payload,
      };

    case "RESET_ENTITY_FILTERS":
      return {
        ...state,
        entityFilters: undefined,
      };

    case "ADD_ENTITY_FILTER":
      return {
        ...state,
        entityFilters: [action.payload, ...state.entityFilters],
      };

    case "UPDATE_ENTITY_FILTER": {
      let { filterObj } = action.payload;
      return {
        ...state,
        entityFilters: state.entityFilters.map((eachFilter) => {
          if (eachFilter._id === filterObj._id) return filterObj;
          return eachFilter;
        }),
      };
    }

    case "REMOVE_ENTITY_FILTER":
      return {
        ...state,
        entityFilters: state.entityFilters.filter(
          (ef) => ef._id !== action.payload.filterId
        ),
      };

    case "CLEAR_FILTERS":
      return initialState;

    default:
      return state;
  }
};

export const filtersInitialState = initialState;

export default filtersReducer;
