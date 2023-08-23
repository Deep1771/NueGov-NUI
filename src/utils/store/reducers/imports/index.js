import { initialState } from "./initial_state";

export const importReducer = (state = importInitialState, action) => {
  switch (action.type) {
    case "SET_ENTITY_TEMPLATE": {
      return {
        ...initialState,
        selectedEntityTemplate: action.payload,
      };
    }

    case "SET_IMPORT_NAME": {
      return {
        ...state,
        importName: action.payload,
      };
    }

    case "SET_IMPORT_MODE": {
      return {
        ...initialState,
        ...state,
        importMode: action.payload,
      };
    }

    case "SET_IMPORT_ENTITY": {
      let { appName, moduleName, entityName } = action.payload;
      return {
        ...initialState,
        importMode: state.importMode,
        ...action.payload,
      };
    }

    case "SET_FILE_ARRAY": {
      let { event, groupName } = action.payload;
      let selectedFile = event.target.files[0];
      if (selectedFile) {
        let obj = {
          file: selectedFile,
          level: groupName === event.target.name ? "TOP" : "COMPONENT",
          fileName: selectedFile.name,
          componentName: event.target.name,
        };

        if (
          state.selectedFiles.find(
            (ef) => ef.componentName === event.target.name
          )
        ) {
          return {
            ...state,
            selectedFiles: state.selectedFiles.map((ef) => {
              if (ef.componentName === event.target.name) {
                return obj;
              }
              return ef;
            }),
          };
        } else {
          return {
            ...state,
            selectedFiles: [...state.selectedFiles, obj],
          };
        }
      }
    }

    case "SET_FILE_TYPE": {
      return {
        ...state,
        fileType: action.payload,
        selectedCheckbox: {},
        selectedFiles: [],
        mappingFields: [],
        selectedShapeFile: undefined,
      };
    }

    case "SET_SHAPE_FILE": {
      return {
        ...state,
        selectedShapeFile: action.payload,
      };
    }

    case "SET_TEMPLATE_OBJECT": {
      return {
        ...state,
        templateObj: action.payload,
      };
    }

    case "SET_MAPPING_FIELDS": {
      // return []
      let { mappingObj } = action.payload;

      if (state.mappingFields.find((ef) => ef.fileKey === mappingObj.fileKey)) {
        return {
          ...state,
          mappingFields: state.mappingFields.map((ef) => {
            if (ef.fileKey === mappingObj.fileKey) {
              return mappingObj;
            }
            return ef;
          }),
        };
      } else {
        return {
          ...state,
          mappingFields: [...state.mappingFields, mappingObj],
        };
      }
    }

    case "RESET_FILE_ARRAY": {
      let { event, groupName } = action.payload;
      return {
        ...state,
        selectedFiles:
          state?.selectedFiles?.filter(
            (ef) => ef.componentName !== event.target.name
          ) || [],
      };
    }

    case "RESET_IMPORT_NAME": {
      return {
        ...state,
        importName: action.payload,
      };
    }

    case "RESET_SHAPE_FILE": {
      return {
        ...state,
        selectedShapeFile: undefined,
      };
    }

    case "CLEAR_IMPORT_STATE": {
      return initialState;
    }

    default:
      return state;
  }
};

export const importInitialState = initialState;

export default importReducer;
