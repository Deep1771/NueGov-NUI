import { isEmpty } from "lodash";

export const removeModificationAccess = ({ entity, mode, previousApps }) => {
  let { topSectionArray = [], featureAccess = {} } = entity || {};
  let modifiedAccess = {},
    modifiedTopSectionArray = [];
  let modifiedFeatureAccess = {
    ...featureAccess,
    ImportCSV: false,
  };

  if (previousApps?.length > 0) {
    let selectedEntity = {};
    previousApps.map((eachApp = {}) => {
      if (eachApp?.modules?.length > 0)
        eachApp.modules.map((eachModule = {}) => {
          eachModule.entities.map((eachEntity) => {
            if (eachEntity?.name === entity?.name) selectedEntity = eachEntity;
          });
        });
    });
    if (!isEmpty(selectedEntity)) {
      modifiedAccess = selectedEntity?.access || {};
      modifiedTopSectionArray = selectedEntity?.topSectionArray || [];
    } else {
      modifiedAccess = {
        read: true,
      };
      modifiedTopSectionArray = topSectionArray.map((eachSection) => {
        let fields = eachSection?.fields?.map((eachField) => {
          return {
            ...eachField,
            access: {
              read: true,
            },
          };
        });
        return {
          ...eachSection,
          fields,
        };
      });
    }
  } else {
    modifiedAccess = {
      read: true,
    };
    modifiedTopSectionArray = topSectionArray.map((eachSection) => {
      let fields = eachSection?.fields?.map((eachField) => {
        return {
          ...eachField,
          access: {
            read: true,
          },
        };
      });
      return {
        ...eachSection,
        fields,
      };
    });
  }

  return {
    topSectionArray: modifiedTopSectionArray,
    access: modifiedAccess,
    featureAccess: modifiedFeatureAccess,
  };
};
