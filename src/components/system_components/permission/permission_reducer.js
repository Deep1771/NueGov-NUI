import { createContext, useContext } from "react";
import { get } from "utils/services/helper_services/object_methods";

//START OF CONTEXT
export const PermissionContext = createContext();
export const usePermissionState = () => useContext(PermissionContext);
//END OF CONTEXT

//MUTATION HELPER
export const imMutate = (data) => JSON.parse(JSON.stringify(data));

const retainAccessFlags = (tree) => {
  //retain other flags inside Access Object
  let accessObj = {};
  ["isPrivate", "isCalendar", "roleBasedLayout"].map((ea) => {
    if (get(tree, `access.${ea}`)) {
      accessObj[ea] = true;
    }
  });
  return accessObj;
};

//START OF REDUCER
export const permissionReducer = (state, action) => {
  switch (action.type) {
    case "APP_SELECT": {
      let appInfo = action.payload;
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: [...appInfo.map((app) => imMutate(app))],
        },
      };
    }
    case "APP_DESELECT": {
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: [],
        },
      };
    }
    case "SET_PRESET_DATA": {
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          preset: { ...state.permissionTree.preset, ...action.payload },
        },
      };
    }
    case "SET_ROLE_PRESET_DATA": {
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          rolePreset: { ...action.payload },
        },
      };
    }

    case "ENTITY_SELECT": {
      let { appInfo, moduleInfo, entityInfo } = action.payload;
      if (!entityInfo.access) {
        entityInfo = {
          ...entityInfo,
          access: { read: true },
        };
      }
      let ai = state.permissionTree.apps.findIndex(
        (ea) => ea.name === appInfo.name
      );
      if (ai === -1) {
        return {
          ...state,
          permissionTree: {
            ...state.permissionTree,
            apps: [
              ...state.permissionTree.apps,
              {
                name: appInfo.name,
                friendlyName: appInfo.name,
                modules: [
                  {
                    ...moduleInfo,
                    entities: [entityInfo],
                  },
                ],
              },
            ],
          },
        };
      } else {
        return {
          ...state,
          permissionTree: {
            ...state.permissionTree,
            apps: state.permissionTree.apps.map((ea) => {
              if (ea.name === appInfo.name) {
                if (!ea.modules) ea.modules = [];
                let mi = ea.modules.findIndex(
                  (em) => em.name === moduleInfo.name
                );
                if (mi === -1) {
                  ea.modules.push({
                    ...moduleInfo,
                    entities: [entityInfo],
                  });
                } else {
                  if (!ea.modules[mi].entities) ea.modules[mi].entities = [];

                  let ei = ea.modules[mi].entities.findIndex(
                    (ee) => ee.groupName === entityInfo.groupName
                  );
                  if (ei === -1) ea.modules[mi].entities.push(entityInfo);
                  else
                    ea.modules[mi].entities = ea.modules[mi].entities.map(
                      (ee) => {
                        if (ee.name === entityInfo.name)
                          return imMutate(entityInfo);
                        else return ee;
                      }
                    );
                }
              }
              return ea;
            }),
          },
        };
      }
    }
    case "ENTITY_SELECT_ALL": {
      let { appInfo, moduleInfo } = action.payload;
      let ai = state.permissionTree.apps.findIndex(
        (ea) => ea.name === appInfo.name
      );
      if (ai === -1) {
        return {
          ...state,
          permissionTree: {
            ...state.permissionTree,
            apps: [
              ...state.permissionTree.apps,
              {
                name: appInfo.name,
                friendlyName: appInfo.friendlyName,
                modules: imMutate(moduleInfo),
              },
            ],
          },
        };
      } else {
        return {
          ...state,
          permissionTree: {
            ...state.permissionTree,
            apps: state.permissionTree.apps.map((ea) => {
              if (ea.name === appInfo.name) {
                ea.modules = imMutate(moduleInfo);
              }
              return ea;
            }),
          },
        };
      }
    }
    case "ENTITY_FEATURE_SELECT": {
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          featureAccess: {
            ...state.entityTree.featureAccess,
            [action.payload]: true,
          },
        },
      };
    }
    case "ENTITY_FEATURE_DESELECT": {
      const feats = { ...state.entityTree.featureAccess };
      delete feats[action.payload];
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          featureAccess: { ...feats },
        },
      };
    }
    case "ENTITY_DETAIL_SAVE": {
      let { appName, moduleName, entityTree } = action.payload;
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: state.permissionTree.apps.map((ea) => {
            if (ea.name === appName) {
              let mi = ea.modules.findIndex((em) => em.name === moduleName);
              if (mi !== -1) {
                ea.modules[mi].entities = ea.modules[mi].entities.map((ee) => {
                  if (ee.groupName === entityTree.groupName) return entityTree;
                  else return ee;
                });
              }
            }
            return ea;
          }),
        },
      };
    }
    case "ENTITY_DESELECT": {
      let { appInfo, moduleInfo, entityInfo } = action.payload;
      let apps = imMutate(state.permissionTree.apps).map((ea) => {
        if (ea.name === appInfo.name && ea.modules) {
          let mi = ea.modules.findIndex((em) => em.name === moduleInfo.name);
          if (mi !== -1) {
            if (ea.modules[mi].entities) {
              ea.modules[mi].entities = ea.modules[mi].entities.filter(
                (ee) => ee.groupName !== entityInfo.groupName
              );
              if (!ea.modules[mi].entities.length) ea.modules.splice(mi, 1);
            }
          }
        }
        return ea;
      });
      apps = apps.filter((ea) => ea.modules && ea.modules.length);
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: apps && apps.length ? apps : [],
        },
      };
    }
    case "ENTITY_DESELECT_ALL": {
      let { appInfo } = action.payload;
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: state.permissionTree.apps.map((ea) => {
            if (ea.name === appInfo.name) {
              delete ea.modules;
            }
            return ea;
          }),
        },
      };
    }
    case "FEATURE_SELECT": {
      let { appInfo, featureInfo } = action.payload;
      let ai = state.permissionTree.apps.findIndex(
        (ea) => ea.name === appInfo.name
      );
      if (ai === -1) {
        return {
          ...state,
          permissionTree: {
            ...state.permissionTree,
            apps: [
              ...state.permissionTree.apps,
              {
                name: appInfo.name,
                friendlyName: appInfo.name,
                features: [featureInfo],
              },
            ],
          },
        };
      } else {
        return {
          ...state,
          permissionTree: {
            ...state.permissionTree,
            apps: state.permissionTree.apps.map((ea) => {
              if (ea.name === appInfo.name) {
                if (ea.features) {
                  let fi = ea.features.findIndex(
                    (ef) => ef.name === featureInfo.name
                  );
                  if (fi === -1) ea.features = [...ea.features, featureInfo];
                  else
                    ea.features = ea.features.map((ef) => {
                      if (ef.name === featureInfo.name) ef = featureInfo;
                      return ef;
                    });
                } else {
                  ea.features = [
                    ...(ea.features ? ea.features : []),
                    featureInfo,
                  ];
                }
              }
              return ea;
            }),
          },
        };
      }
    }
    case "FEATURE_SELECT_ALL": {
      let { appInfo, featureInfo } = action.payload;
      let ai = state.permissionTree.apps.findIndex(
        (ea) => ea.name === appInfo.name
      );
      if (ai === -1) {
        return {
          ...state,
          permissionTree: {
            ...state.permissionTree,
            apps: [
              ...state.permissionTree.apps,
              {
                name: appInfo.name,
                friendlyName: appInfo.name,
                features: featureInfo,
              },
            ],
          },
        };
      } else {
        return {
          ...state,
          permissionTree: {
            ...state.permissionTree,
            apps: state.permissionTree.apps.map((ea) => {
              if (ea.name === appInfo.name) {
                ea.features = featureInfo;
              }
              return ea;
            }),
          },
        };
      }
    }
    case "FEATURE_DESELECT": {
      let { appInfo, featureInfo } = action.payload;
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: state.permissionTree.apps.map((ea) => {
            if (ea.name === appInfo.name) {
              ea.features = ea.features.filter(
                (ef) => ef.name !== featureInfo.name
              );
            }
            return ea;
          }),
        },
      };
    }
    case "FEATURE_DESELECT_ALL": {
      let { appInfo } = action.payload;
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: state.permissionTree.apps.map((ea) => {
            if (ea.name === appInfo.name) {
              delete ea.features;
            }
            return ea;
          }),
        },
      };
    }

    case "FIELD_SHARED_SELECT": {
      let { fieldInfo, level, sharedSecInfo } = action.payload;
      let path = level === "TOP" ? "topSectionArray" : "componentArray";
      let tree = state.entityTree[path];
      let secIndex = tree.findIndex((es) => es.name === sharedSecInfo.name);
      if (secIndex === -1) {
        return {
          ...state,
          entityTree: {
            ...state.entityTree,
            [path]: [
              ...state.entityTree[path],
              {
                ...sharedSecInfo,
                fields: [fieldInfo],
              },
            ],
          },
        };
      } else {
        return {
          ...state,
          entityTree: {
            ...state.entityTree,
            [path]: state.entityTree[path].map((es) => {
              if (es.name === sharedSecInfo.name) {
                if (es.fields.find((ef) => ef.name === fieldInfo.name))
                  es.fields = es.fields.map((ef) => {
                    if (ef.name === fieldInfo.name) {
                      fieldInfo.shared = { ...ef.shared, ...fieldInfo.shared };
                      ef = { ...ef, shared: fieldInfo.shared };
                      return ef;
                    } else {
                      return ef;
                    }
                  });
                else es.fields.push(fieldInfo);
              }
              return es;
            }),
          },
        };
      }
    }

    case "FIELD_SELECT": {
      let { fieldInfo, level, secInfo } = action.payload;
      let path = level === "TOP" ? "topSectionArray" : "componentArray";
      let tree = state.entityTree[path];
      let secIndex = tree.findIndex((es) => es.name === secInfo.name);
      if (secIndex === -1) {
        return {
          ...state,
          entityTree: {
            ...state.entityTree,
            [path]: [
              ...state.entityTree[path],
              {
                ...secInfo,
                fields: [fieldInfo],
              },
            ],
          },
        };
      } else {
        return {
          ...state,
          entityTree: {
            ...state.entityTree,

            [path]: state.entityTree[path].map((es) => {
              if (es.name === secInfo.name) {
                if (es.fields.find((ef) => ef.name === fieldInfo.name))
                  es.fields = es.fields.map((ef) => {
                    if (ef.name === fieldInfo.name) {
                      // let existingFields = state.entityTree[path][0]['fields'].find(efl=>efl.name==ef.name);
                      // fieldInfo['shared']=existingFields.shared;
                      ef = fieldInfo;
                      return ef;
                    } else {
                      return ef;
                    }
                  });
                else {
                  es.fields.push(fieldInfo);
                }
              }
              return es;
            }),
          },
        };
      }
    }

    case "FIELD_DESELECT": {
      let { fieldInfo, level, secInfo } = action.payload;
      let path = level === "TOP" ? "topSectionArray" : "componentArray";
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          [path]: state.entityTree[path]
            .map((es) => {
              if (es.name === secInfo.name) {
                es.fields = es.fields.filter(
                  (ef) => ef.name !== fieldInfo.name
                );
              }
              return es;
            })
            .filter((es) => es.fields.length),
        },
      };
    }
    case "GLOBAL_FEATURE_SELECT": {
      let { featureInfo } = action.payload;
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          features: [
            ...(state.permissionTree.features
              ? state.permissionTree.features
              : []),
            { ...featureInfo },
          ],
        },
      };
    }
    case "GLOBAL_FEATURE_MOD_SET": {
      let { fInfo, checked, featureApp } = action.payload.featureInfo;
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: state.permissionTree.apps.map((ea) => {
            if (ea.name === featureApp) {
              ea.modules = ea.modules.map((em) => {
                if (em.name === fInfo.name)
                  em.flags = {
                    ...(em.flags ? em.flags : {}),
                    allowModification: checked,
                  };
                return em;
              });
            }
            return ea;
          }),
        },
      };
    }
    case "GLOBAL_FEATURE_DESELECT": {
      let { featureInfo } = action.payload;
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          features: state.permissionTree.features.filter(
            (ef) => ef.name !== featureInfo.name
          ),
        },
      };
    }
    case "INIT_DATA": {
      return {
        ...state,
        permissionTree: action.payload,
      };
    }
    case "MODULE_DESELECT": {
      let { appInfo, moduleInfo } = action.payload;
      let apps = state.permissionTree.apps.map((ea) => {
        if (ea.name === appInfo.name) {
          ea.modules = ea.modules.filter((em) => em.name !== moduleInfo.name);
        }
        return ea;
      });
      apps = apps.filter((ea) => ea.modules && ea.modules.length);
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: apps.length ? apps : [],
        },
      };
    }
    case "MODULE_SELECT": {
      let { appInfo, moduleInfo } = action.payload;
      let ai = state.permissionTree.apps.findIndex(
        (ea) => ea.name === appInfo.name
      );
      if (ai === -1) {
        return {
          ...state,
          permissionTree: {
            ...state.permissionTree,
            apps: [
              ...state.permissionTree.apps,
              {
                name: appInfo.name,
                friendlyName: appInfo.name,
                modules: [moduleInfo],
              },
            ],
          },
        };
      } else {
        return {
          ...state,
          permissionTree: {
            ...state.permissionTree,
            apps: state.permissionTree.apps.map((ea) => {
              if (ea.name === appInfo.name) {
                if (!ea.modules) ea.modules = [];
                let mi = ea.modules.findIndex(
                  (em) => em.name === moduleInfo.name
                );
                if (mi === -1) {
                  ea.modules.push(moduleInfo);
                }
              }
              return ea;
            }),
          },
        };
      }
    }
    case "REMOVE_ENTITY_ACCESS": {
      let access = { ...state.entityTree.access };
      let shared = { ...state.entityTree.shared };
      delete access[action.payload];
      Object.keys(shared).forEach((key) => {
        delete state.entityTree.shared[key][action.payload];
      });
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          access,
        },
      };
    }

    case "RESET_SHARED_ENTITY_ACCESS": {
      let shared = { ...state.entityTree.shared };
      action.payload.value.data == "read"
        ? delete shared[action.payload.value.name]
        : delete shared[action.payload.value.name][action.payload.value.data];
      action.payload.value.data == "read"
        ? delete shared[action.payload.value.name]
        : delete shared[action.payload.value.name]["delete"];
      if (action.payload.comPath) {
        return {
          ...state,
          entityTree: {
            ...state.entityTree,
            shared,
          },
        };
      } else {
        return {
          ...state,
          entityTree: {
            ...state.entityTree,
            shared,
          },
        };
      }
    }

    case "REMOVE_ENTITY_FIELD_ACCESS": {
      if (state.entityTree.shared) {
        Object.keys(state.entityTree.shared).forEach((key) => {
          delete state.entityTree.shared[key]["write"];
          delete state.entityTree.shared[key]["delete"];
        });
      }
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          topSectionArray: state.entityTree.topSectionArray.map((es) => ({
            ...es,
            fields: es.fields.map((ef) => {
              if (ef.access) delete ef.access[action.payload.access];
              //     Object.keys(ef.shared ).forEach( key => {
              //         delete  ef.shared[key][action.payload.access]
              //  });
              return ef;
            }),
          })),
          componentArray: state.entityTree.componentArray.map((es) => ({
            ...es,
            fields: es.fields.map((ef) => {
              if (ef.access) delete ef.access[action.payload.access];
              //     Object.keys(ef.shared ).forEach( key => {
              //         delete  ef.shared[key][action.payload.access]
              //  })
              return ef;
            }),
          })),
        },
      };
    }
    case "RESET_ENTITY_ACCESS": {
      let access = { ...state.entityTree.access };
      delete access[action.payload];
      let accessObj = retainAccessFlags(state.entityTree);
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          access: { ...accessObj },
          shared: {},
        },
      };
    }
    case "RESET_ENTITY_SHARED": {
      let access = { ...state.entityTree.access };
      delete access[action.payload];
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          shared: {},
        },
      };
    }

    case "RESET_ENTITY_FLAG": {
      let tree = imMutate(state.entityTree);
      delete tree[action.payload];
      return {
        ...state,
        entityTree: tree,
      };
    }
    case "RESET_ENTITY_TREE": {
      let access = retainAccessFlags(state.entityTree);
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          topSectionArray: [],
          componentArray: [],
          access: { ...access },
          shared: {},
        },
      };
    }

    case "RESET_MODULE_FLAG": {
      let { appName, moduleName, flag } = action.payload;
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: state.permissionTree.apps.map((ea) => {
            if (ea.name === appName) {
              ea.modules = ea.modules.map((em) => {
                if (em.name === moduleName) {
                  delete em.flags[flag];
                  if (!Object.keys(em.flags).length) delete em.flags;
                }
                return em;
              });
            }
            return ea;
          }),
        },
      };
    }

    case "SECTION_SELECT": {
      let { fields, secInfo, level } = action.payload;
      let path = level === "TOP" ? "topSectionArray" : "componentArray";
      let tree = state.entityTree[path];
      let secIndex = tree.findIndex((es) => es.name === secInfo.name);
      if (secIndex === -1) {
        return {
          ...state,
          entityTree: {
            ...state.entityTree,
            [path]: [
              ...state.entityTree[path],
              {
                ...secInfo,
                fields,
              },
            ],
          },
        };
      } else {
        return {
          ...state,
          entityTree: {
            ...state.entityTree,
            [path]: state.entityTree[path].map((es) => {
              if (es.name === secInfo.name) es.fields = fields;
              return es;
            }),
          },
        };
      }
    }
    case "SECTION_SHARED_DESELECT": {
      let { sharedSecInfo, fieldInfo, level, middlePath, access } =
        action.payload;
      let path = level === "TOP" ? "topSectionArray" : "componentArray";
      let sec = state.entityTree[path].filter(
        (es) => es.name === sharedSecInfo.name
      );
      let field = sec[0].fields.filter((ef) => {
        if (ef.name === fieldInfo.name) {
          delete ef.shared[middlePath];
          return ef;
        }
      });
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          [path]: sec,
        },
      };
    }

    case "SECTION_DESELECT": {
      let { secInfo, level } = action.payload;
      let path = level === "TOP" ? "topSectionArray" : "componentArray";
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          [path]: state.entityTree[path].filter(
            (es) => es.name !== secInfo.name
          ),
        },
      };
    }
    case "SECTION_SELECT_ALL": {
      let { sections, level } = action.payload;
      let path = level === "TOP" ? "topSectionArray" : "componentArray";
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          [path]: sections,
        },
      };
    }
    case "SECTION_DESELECT_ALL": {
      let { level } = action.payload;
      let path = level === "TOP" ? "topSectionArray" : "componentArray";
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          [path]: [],
        },
      };
    }
    case "SET_ENTITY_ACCESS": {
      let { payload } = action;
      let access = retainAccessFlags(state.entityTree);

      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          access: {
            ...access,
            ...payload,
          },
        },
      };
    }
    case "SET_SHARED_ENTITY_ACCESS": {
      let { payload } = action;
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          shared: {
            ...state.entityTree.shared,
            ...payload.value,
          },
        },
      };
    }

    case "SET_SHARED_FIELD_ACCESS": {
      let { payload } = action;

      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          shared: {
            ...state.entityTree.shared,
            ...imMutate(payload),
          },
        },
      };
    }

    case "SET_ENTITY_FLAG": {
      return {
        ...state,
        entityTree: {
          ...state.entityTree,
          [action.payload]: true,
        },
      };
    }
    case "SET_ENTITY_TREE": {
      return {
        ...state,
        entityTree: {
          ...action.payload,
        },
      };
    }
    case "SET_MODULE_FLAG": {
      let { appName, moduleName, flag } = action.payload;
      return {
        ...state,
        permissionTree: {
          ...state.permissionTree,
          apps: state.permissionTree.apps.map((ea) => {
            if (ea.name === appName) {
              ea.modules = ea.modules.map((em) => {
                if (em.name === moduleName) {
                  em.flags = {
                    ...(em.flag ? em.flag : {}),
                    [flag]: true,
                  };
                }
                return em;
              });
            }
            return ea;
          }),
        },
      };
    }
    default:
      return state;
  }
};

export const initialState = {
  entityTree: {
    componentArray: [],
    topSectionArray: [],
  },
  permissionTree: {
    apps: [],
  },
};
