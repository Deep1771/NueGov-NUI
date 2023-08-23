import { createContext, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { isDefined } from "utils/services/helper_services/object_methods";

//START CONTEXT
export const ComponentContext = createContext();
export const DetailContext = createContext();
export const TopLevelContext = createContext();
export const useComponentData = () => useContext(ComponentContext);
export const useDetailData = () => useContext(DetailContext);
export const useTopLevelData = () => useContext(TopLevelContext);
//END CONTEXT

export const imMutate = (data) => JSON.parse(JSON.stringify(data));

//Declarative Methods
const checkField = (field) =>
  field.required && field.disable !== true && field.canUpdate !== false;

//ERROR REDUCER
export const errorReducer = (state, action) => {
  switch (action.type) {
    case "INIT_COMP_VALIDATION": {
      const { comps, metadata } = action.payload;
      const { sys_entityAttributes } = metadata;
      let errors = comps.map((ec) => {
        let compMeta =
          sys_entityAttributes.sys_components[0].componentList.find(
            (cl) => cl.name === ec.componentName
          );
        let fields = compMeta.sys_entityAttributes
          .filter((ef) => checkField(ef))
          .reduce((errors, ef) => {
            let { sys_entityAttributes } = ec;
            if (!sys_entityAttributes[ef.name])
              errors.push({
                name: ef.name,
                error: "Required",
              });
            return errors;
          }, []);
        return {
          name: ec.componentName,
          compIndex: ec.componentId,
          fields,
        };
      });
      errors = errors.filter((ec) => ec.fields && ec.fields.length);
      return {
        ...state,
        componentLevel: [
          ...(state.componentLevel ? state.componentLevel : []),
          ...errors,
        ],
      };
    }
    case "REMOVE_COMP_VALIDATION": {
      return {
        ...state,
        componentLevel: state.componentLevel.filter(
          (ec) => ec.compIndex != action.payload
        ),
      };
    }
    case "SET_FORM_ERRORS": {
      const { entityData, metadata } = action.payload;
      const { sys_entityAttributes } = metadata;
      let sectionName = "";
      const errors = {
        topLevel: sys_entityAttributes.sys_topLevel
          .filter((ef) => checkField(ef) || ef.type === "SECTION")
          .reduce((errors, ef) => {
            if (ef.type === "SECTION" && ef.marker === "start")
              sectionName = ef.name;

            if (!["SECTION", "SUBSECTION", "EMPTY"].includes(ef.type)) {
              try {
                let fInfo = entityData.sys_entityAttributes?.hasOwnProperty(
                  ef.name
                );
                if (!fInfo)
                  errors.push({
                    name: ef.name,
                    sectionName,
                    error: "Required",
                  });
              } catch (e) {
                console.log(e);
              }
            }

            return errors;
          }, []),
        componentLevel: entityData.sys_components
          ? entityData.sys_components.reduce((comps, ec) => {
              let compMeta =
                sys_entityAttributes.sys_components &&
                sys_entityAttributes.sys_components.length &&
                sys_entityAttributes.sys_components[0].componentList.find(
                  (cl) => cl.name === ec.componentName
                );
              if (compMeta) {
                let fields = compMeta.sys_entityAttributes
                  .filter((ef) => checkField(ef))
                  .reduce((errors, ef) => {
                    let { sys_entityAttributes } = ec;
                    if (!sys_entityAttributes[ef.name])
                      errors.push({
                        name: ef.name,
                        error: "Required",
                      });
                    return errors;
                  }, []);
                comps.push({
                  name: ec.componentName,
                  compIndex: ec.componentId,
                  fields,
                });
              }
              return comps;
            }, [])
          : [],
      };
      errors.componentLevel = errors.componentLevel.filter(
        (ec) => ec.fields && ec.fields.length
      );
      return {
        ...state,
        ...errors,
      };
    }
    case "SET_COMPONENT_ERROR": {
      const { fieldProps, fieldError } = action.payload;
      const { fieldmeta, compIndex, compName } = fieldProps;
      let errorObj = {
        name: fieldmeta.name,
        error: fieldError,
      };
      let componentErrors = state.componentLevel;
      if (componentErrors) {
        let cI = componentErrors.findIndex((ec) => ec.compIndex === compIndex);
        if (cI == -1 && fieldError) {
          return {
            ...state,
            componentLevel: [
              ...state.componentLevel,
              {
                name: compName,
                compIndex,
                fields: [errorObj],
              },
            ],
          };
        } else if (cI > -1) {
          let compErrs = state.componentLevel.map((ec) => {
            if (ec.compIndex === compIndex) {
              let fI = ec.fields.findIndex((ef) => ef.name == fieldmeta.name);
              if (fI == -1 && fieldError) {
                ec.fields = [...ec.fields, errorObj];
              } else if (fI > -1 && fieldError) {
                ec.fields = ec.fields.map((ef) => {
                  if (ef.name == fieldmeta.name) ef.error = fieldError;

                  return ef;
                });
              } else {
                ec.fields = ec.fields.filter(
                  (ef) => ef.name !== fieldmeta.name
                );
              }
            }
            return ec;
          });
          return {
            ...state,
            componentLevel: compErrs.filter(
              (ec) => ec.fields && ec.fields.length
            ),
          };
        } else return state;
      } else if (fieldError) {
        return {
          ...state,
          componentLevel: [
            {
              name: compName,
              compIndex,
              fields: [errorObj],
            },
          ],
        };
      } else return state;
    }
    case "SET_TOP_ERROR": {
      const { fieldProps, fieldError } = action.payload;
      const { fieldmeta, sectionName } = fieldProps;
      let errorObj = {
        name: fieldmeta.name,
        sectionName,
        error: fieldError,
      };
      let topLevelErrors = state.topLevel;
      if (topLevelErrors) {
        let fieldIndex = topLevelErrors.findIndex(
          (err) => err.name === fieldmeta.name
        );
        if (fieldIndex === -1 && fieldError) {
          return {
            ...state,
            topLevel: [...state.topLevel, errorObj],
          };
        } else if (fieldIndex > -1) {
          if (fieldError)
            return {
              ...state,
              topLevel: state.topLevel.map((efe) => {
                if (efe.name == fieldmeta.name) efe.error = fieldError;
                return efe;
              }),
            };
          else
            return {
              ...state,
              topLevel: state.topLevel.filter(
                (efe) => efe.name !== fieldmeta.name
              ),
            };
        } else {
          return state;
        }
      } else if (fieldError)
        return {
          ...state,
          topLevel: [errorObj],
        };
      else return state;
    }
    default:
      return state;
  }
};

//START REDUCER
export const detailReducer = (state, action) => {
  switch (action.type) {
    case "ADD_COMPONENT": {
      return {
        ...state,
        sys_components: [
          ...action.payload,
          ...(state.sys_components ? state.sys_components : []),
        ],
      };
    }
    case "CLONE_COMPONENT": {
      return {
        ...state,
        sys_components: [action.payload, ...state.sys_components],
      };
    }
    case "DELETE_COMPONENT": {
      return {
        ...state,
        sys_components: state.sys_components.filter(
          (ec) => ec.componentId !== action.payload
        ),
      };
    }
    case "SET_COMPONENT_FIELD": {
      const { fieldData, fieldProps } = action.payload;
      const { fieldmeta, compIndex } = fieldProps;
      return {
        ...state,
        sys_components: state.sys_components.map((ecd) => {
          if (ecd.componentId === compIndex) {
            if (isDefined(fieldData))
              ecd.sys_entityAttributes[fieldmeta.name] = fieldData;
            else delete ecd.sys_entityAttributes[fieldmeta.name];
          }
          return ecd;
        }),
      };
    }
    case "SET_ENTITY_DATA": {
      return action.payload;
    }
    case "SET_TOP_DATA": {
      const { fieldData, fieldProps } = action.payload;
      const { fieldmeta } = fieldProps;
      const fieldName = fieldmeta.name;
      const { sys_entityAttributes } = state;
      const topData = {
        ...(sys_entityAttributes ? sys_entityAttributes : {}),
      };
      if (isDefined(fieldData)) topData[fieldName] = fieldData;
      else delete topData[fieldName];

      return {
        ...state,
        sys_entityAttributes: topData,
      };
    }
    default:
      return state;
  }
};

//END REDUCER

//SERVICES
export const constructFormData = (
  data,
  metadata,
  mode,
  basicFormData,
  otherInfo = {}
) => {
  let { sys_templateName, sys_topLevel: TOPLEVEL } =
    metadata.sys_entityAttributes;
  let { userInfo } = otherInfo;
  let entityData;

  if (mode == "NEW") {
    entityData = basicFormData;
    if (data.sys_entityAttributes)
      entityData = {
        ...entityData,
        sys_entityAttributes: {
          ...data.sys_entityAttributes,
        },
      };
    if (data.sys_components && data.sys_components.length) {
      entityData = {
        ...entityData,
        sys_components: data.sys_components.map((ec) => ({
          ...ec,
          parentComponentId: ec.componentId,
          componentId: `${ec.componentName}-${uuidv4()}`,
        })),
      };
    }
  } else if (mode == "CLONE") {
    let { sys_topLevel } = metadata.sys_entityAttributes;

    let transientFields = sys_topLevel.filter((ef) => ef.transient);
    entityData = data;
    delete entityData._id;

    entityData.sys_agencyId = basicFormData.sys_agencyId;
    entityData.sys_userId = basicFormData.sys_userId;

    if (transientFields.length)
      transientFields.map(
        (etf) => delete entityData.sys_entityAttributes[etf.name]
      );

    if (entityData.sys_components)
      entityData.sys_components = entityData.sys_components.map((ec) => {
        ec.componentId = `${ec.componentName}-${uuidv4()}`;
        return ec;
      });
  } else {
    entityData = data;
  }

  if (["NEW", "CLONE"].includes(mode)) {
    let { sys_topLevel } = metadata.sys_entityAttributes;
    let designerFields = sys_topLevel.filter(
      (eachField) => eachField.type === "DESIGNER"
    );
    if (designerFields.length) {
      designerFields.map((edf) => {
        let designerData = entityData.sys_entityAttributes[edf.name]
          ? entityData.sys_entityAttributes[edf.name]
          : [];
        if (designerData.length) {
          entityData.sys_entityAttributes[edf.name] = designerData.map((ed) => {
            return {
              ...ed,
              id: uuidv4(),
            };
          });
        }
      });
    }
  }

  TOPLEVEL.map((ef) => {
    if (
      !isDefined(entityData && entityData.sys_entityAttributes[ef.name]) &&
      !ef.transient &&
      !ef.disable &&
      ef.canUpdate &&
      isDefined(ef.defaultValue) &&
      !["DATE", "DATETIME"].includes(ef.type)
    ) {
      if (ef && ef.defaultValue === "USER_INFO")
        entityData.sys_entityAttributes[ef.name] = userInfo;
      else if (entityData)
        entityData.sys_entityAttributes[ef.name] = ef.defaultValue;
    }
  });

  if (["NEW", "CLONE"].includes(mode)) {
    delete entityData.sys_entityAttributes.sys_batchId;
    delete entityData.sys_entityAttributes.QR_CODE;
    delete entityData.sys_entityAttributes.BAR_CODE;
    entityData.sys_templateName = sys_templateName;
  }
  return entityData;
};
