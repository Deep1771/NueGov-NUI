// CONTEXT
import React, { createContext, useContext } from "react";

export const AgencySharingContext = createContext();
export const useAgencySharingValue = () => useContext(AgencySharingContext);

// REDUCER

const imMutate = (data) => JSON.parse(JSON.stringify(data));

export const reducer = (state, action) => {
  switch (action.type) {
    // ACTIONS RELATED TO AGENCY LEVEL PERMISSION
    case "DELETE_AGENCY": {
      return {
        ...state,
        sharedAgencies: action.payload,
      };
    }

    case "SET_SHARED_AGENCIES": {
      return {
        ...state,
        sharedAgencies: action.payload,
      };
    }

    case "SET_PERMISSION_TO_AGENCY": {
      let { agencySelected, permissionObject, transitiveObject } =
        action.payload;
      return {
        ...state,
        sharedAgencies: state.sharedAgencies.map((eachAgency) => {
          if (eachAgency.id === agencySelected) {
            return {
              ...eachAgency,
              permission: permissionObject,
              transitive: transitiveObject,
            };
          }
          return eachAgency;
        }),
        permission: [],
        transitive: false,
      };
    }

    case "SET_PERMISSION_OBJECT": {
      let agencyObject = state.sharedAgencies.find(
        (eachAgency) => eachAgency.id === action.payload
      );
      let permissionObject =
        agencyObject && agencyObject.permission ? agencyObject.permission : [];
      let transitiveObject =
        agencyObject && agencyObject.transitive
          ? agencyObject.transitive
          : false;
      return {
        ...state,
        permission: permissionObject,
        transitive: transitiveObject,
      };
    }

    // ACTIONS RELATED TO TRANSITIVE

    case "RESET_TRANSITIVE": {
      return {
        ...state,
        sharedAgencies: state.sharedAgencies.map((eachAgency) => {
          if (eachAgency.id === action.payload.id) {
            return action.payload;
          }
          return eachAgency;
        }),
      };
    }

    case "SET_TRANSITIVE": {
      return {
        ...state,
        sharedAgencies: state.sharedAgencies.map((eachAgency) => {
          if (eachAgency.id === action.payload.id) {
            return {
              ...eachAgency,
              transitive: true,
            };
          }
          return eachAgency;
        }),
      };
    }

    // ACTIONS RELATED TO ENTITY LEVEL ACCESS

    case "RESET_ALL_ENTITY_ACCESS": {
      return {
        ...state,
        permission: [],
      };
    }

    case "RESET_APP_ENTITY_ACCESS": {
      let stateObj = imMutate(state.permission);
      return {
        ...state,
        permission: stateObj.filter((eachObj) =>
          action.payload.every((newObj) => eachObj.name !== newObj.name)
        ),
      };
    }

    case "RESET_ENTITY_ACCESS": {
      return {
        ...state,
        permission: state.permission.filter(
          (eachOb) => eachOb.groupName !== action.payload.groupName
        ),
      };
    }

    case "SET_ALL_ENTITY_ACCESS": {
      return {
        ...state,
        permission: imMutate(action.payload),
      };
    }

    case "SET_APP_ENTITY_ACCESS": {
      return {
        ...state,
        permission: state.permission
          .filter((eachObj) =>
            action.payload.every((newObj) => eachObj.name !== newObj.name)
          )
          .concat(action.payload),
      };
    }

    case "SET_ENTITY_ACCESS": {
      let { groupName } = action.payload;
      let entityIndex = state.permission.findIndex(
        (eachObj) => eachObj.groupName === groupName
      );
      if (entityIndex === -1) {
        return {
          ...state,
          permission: [...state.permission, imMutate(action.payload)],
        };
      } else {
        return {
          ...state,
          permission: state.permission.map((eachObj) => {
            if (eachObj.groupName === groupName) {
              return { ...eachObj, access: action.payload.access };
            } else return eachObj;
          }),
        };
      }
    }

    // ACTIONS RELATED TO TOP LEVEL ACCESS

    case "RESET_ALL_TOP_FIELDS": {
      return {
        ...state,
        topLevelPermission: [],
      };
    }

    case "RESET_TOP_FIELD": {
      return {
        ...state,
        topLevelPermission: state.topLevelPermission.filter(
          (eachObj) => eachObj.name !== action.payload.name
        ),
      };
    }

    case "RESET_TOP_SECTION": {
      let stateObj = imMutate(state.topLevelPermission);
      return {
        ...state,
        topLevelPermission: stateObj.filter((eachObj) =>
          action.payload.every((newObj) => eachObj.name !== newObj.name)
        ),
      };
    }

    case "SET_ALL_TOP_FIELDS": {
      return {
        ...state,
        topLevelPermission: action.payload,
      };
    }

    case "SET_TOP_FIELD": {
      let fieldIndex = state.topLevelPermission.findIndex(
        (eachObj) => eachObj.name === action.payload.name
      );
      if (fieldIndex === -1) {
        return {
          ...state,
          topLevelPermission: [
            ...state.topLevelPermission,
            imMutate(action.payload),
          ],
        };
      } else {
        return {
          ...state,
          topLevelPermission: state.topLevelPermission.map((eachObj) => {
            if (eachObj.name === action.payload.name)
              return imMutate(action.payload);
            else return eachObj;
          }),
        };
      }
    }

    case "SET_TOP_SECTION": {
      return {
        ...state,
        topLevelPermission: state.topLevelPermission
          .filter((eachObj) =>
            action.payload.every((newObj) => eachObj.name !== newObj.name)
          )
          .concat(action.payload),
      };
    }

    // ACTIONS RELATED TO COMPONENT LEVEL ACCESS

    case "RESET_ALL_COMPONENT_FIELDS": {
      return {
        ...state,
        componentLevelPermission: [],
      };
    }

    case "RESET_COMPONENT_FIELD": {
      let section =
        state.componentLevelPermission &&
        state.componentLevelPermission.find(
          (eachObj) => eachObj.name === action.payload.name
        );
      let sectionIndex =
        state.componentLevelPermission &&
        state.componentLevelPermission.findIndex(
          (eachObj) => eachObj.name === action.payload.name
        );
      let numOfFields =
        state.componentLevelPermission &&
        state.componentLevelPermission[sectionIndex].fields.length;
      if (numOfFields && numOfFields === 1) {
        return {
          ...state,
          componentLevelPermission: state.componentLevelPermission.filter(
            (eachSection) => eachSection.name !== action.payload.name
          ),
        };
      } else {
        return {
          ...state,
          componentLevelPermission: state.componentLevelPermission.map(
            (eachSection) => {
              if (eachSection.name === action.payload.name) {
                return {
                  name: action.payload.name,
                  title: action.payload.title,
                  fields: eachSection.fields.filter(
                    (eachField) =>
                      eachField.name !== action.payload.fields[0].name
                  ),
                };
              }
              return eachSection;
            }
          ),
        };
      }
    }

    case "RESET_COMPONENT_SECTION": {
      let stateObj = imMutate(state.componentLevelPermission);
      return {
        ...state,
        componentLevelPermission: stateObj.filter((eachObj) =>
          action.payload.every((newObj) => eachObj.name !== newObj.name)
        ),
      };
    }

    case "SET_ALL_COMPONENT_FIELDS": {
      return {
        ...state,
        componentLevelPermission: action.payload,
      };
    }

    case "SET_COMPONENT_FIELD": {
      let section =
        state.componentLevelPermission &&
        state.componentLevelPermission.find(
          (eachObj) => eachObj.name === action.payload.name
        );
      let sectionIndex =
        state.componentLevelPermission &&
        state.componentLevelPermission.findIndex(
          (eachObj) => eachObj.name === action.payload.name
        );
      if (section === undefined) {
        return {
          ...state,
          componentLevelPermission: [
            ...state.componentLevelPermission,
            imMutate(action.payload),
          ],
        };
      } else {
        let fieldIndex =
          section &&
          section.fields.findIndex(
            (eachField) => eachField.name === action.payload.fields[0].name
          );
        if (fieldIndex === -1) {
          return {
            ...state,
            componentLevelPermission: state.componentLevelPermission.map(
              (eachSection) => {
                if (eachSection.name === action.payload.name) {
                  eachSection.fields = [
                    ...eachSection.fields,
                    ...action.payload.fields,
                  ];
                }
                return eachSection;
              }
            ),
          };
        } else {
          return {
            ...state,
            componentLevelPermission: state.componentLevelPermission.map(
              (eachSection) => {
                if (eachSection.name === action.payload.name) {
                  eachSection.fields[fieldIndex] = action.payload.fields[0];
                }
                return eachSection;
              }
            ),
          };
        }
      }
    }

    case "SET_COMPONENT_SECTION": {
      return {
        ...state,
        componentLevelPermission: state.componentLevelPermission
          .filter((eachObj) =>
            action.payload.every((newObj) => eachObj.name !== newObj.name)
          )
          .concat(action.payload),
      };
    }

    // SET TOP LEVEL AND COMPONENT LEVEL PERMISSION TO PERMISSION OBJECT

    case "SET_TO_MAIN_REDUCER": {
      return {
        ...state,
        permission: state.permission.map((eachObj) => {
          if (eachObj.name === action.payload.selectedEntity) {
            return {
              ...eachObj,
              topSectionArray: action.payload.topLevelPermission,
              componentArray: action.payload.componentLevelPermission,
            };
          }
          return eachObj;
        }),
        topLevelPermission: [],
        componentLevelPermission: [],
      };
    }

    // SET PERMISSION OBJECT BACK TO TOP LEVEL AND COMPONENT LEVEL PERMISSIONS ON CLICKING MORE BUTTON
    case "SET_TO_LOCAL_REDUCER": {
      let { selectEntity } = action.payload;
      let findEntity = state.permission.find(
        (eachEntity) => eachEntity.name === selectEntity
      );
      let topSectionArray = findEntity.topSectionArray;
      let componentSectionArray = findEntity.componentArray;
      return {
        ...state,
        topLevelPermission: topSectionArray,
        componentLevelPermission: componentSectionArray,
      };
    }

    // RESET ALL INNER LEVEL PERMISSION ON DESELECTING THE ENTITY LEVEL PERMISSION
    case "RESET_ALL_READ_ACCESS": {
      return {
        ...state,
        permission: state.permission.map((eachEntity) => {
          if (eachEntity.name === action.payload) {
            return {
              ...eachEntity,
              topSectionArray: [],
              componentArray: [],
            };
          }
          return eachEntity;
        }),
      };
    }

    case "RESET_ALL_WRITE_ACCESS": {
      return {
        ...state,
        permission: state.permission.map((eachEntity) => {
          if (eachEntity.name === action.payload) {
            return {
              ...eachEntity,
              topSectionArray: eachEntity.topSectionArray.map((eachField) => {
                if (eachField.access && eachField.access.write) {
                  delete eachField.access.write;
                }
                return eachField;
              }),
              componentArray: eachEntity.componentArray.map((eachComponent) => {
                return eachComponent.fields.map((eachField) => {
                  if (eachField.access && eachField.access.write) {
                    delete eachField.access.write;
                  }
                  return eachField;
                });
              }),
            };
          }
          return eachEntity;
        }),
      };
    }
  }
};

export const initialState = {
  sharedAgencies: [],
  permission: [],
  topLevelPermission: [],
  componentLevelPermission: [],
  transitive: false,
};
