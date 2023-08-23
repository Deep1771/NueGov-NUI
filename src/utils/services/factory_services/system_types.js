import { useStateValue } from "utils/store/contexts";

export const SystemTypeFactory = () => {
  const [{ configState }] = useStateValue();
  const { systemTypes } = configState;

  const filterByFeature = (feat) => {
    return systemTypes.filter((f) => f?.sys_entityAttributes?.feature === feat);
  };

  const getExcludedDirectives = (feat) => {
    return systemTypes?.filter((e) => {
      const { dataFormat, feature, directiveTypes } = e?.sys_entityAttributes;
      return dataFormat === "EXCLUDED" && feature === feat;
    })[0]?.sys_entityAttributes?.directiveTypes;
  };

  const getFeatSystemTypes = (feat) => {
    let obj = {
      excluded: [],
      included: [],
    };
    systemTypes.forEach((st) => {
      if (st?.sys_entityAttributes?.feature === feat) {
        if (st?.sys_entityAttributes?.dataFormat === "EXCLUDED")
          obj.excluded.push(st);
        else obj.included.push(st);
      }
    });
    return obj;
    // return systemTypes?.filter(
    //   (e) => e?.sys_entityAttributes?.feature === feat
    // );
  };

  // const getAcceptedTypes = (directivesArr, feat) => {
  //   let excludedTypes = getExcludedDirectives(feat);
  //   return directivesArr.filter((d) => {
  //     return !excludedTypes.some((e) => {
  //       const { name, condition } = e;
  //       let conditionKeys = (condition && Object.keys(condition)) || [];
  //       if (conditionKeys.length) {
  //         if (name === d.type)
  //           return conditionKeys.reduce(
  //             (acc, cur) => acc && d[cur] === condition[cur]
  //           );
  //         else return false;
  //       } else return name === d.type;
  //     });
  //   });
  // };

  const getIncludedTypes = (templateDir, excludedDir) => {
    return templateDir.filter(
      (fm) =>
        !excludedDir?.sys_entityAttributes?.directiveTypes.some((e) => {
          let typeCheck = e.name === fm.type;
          if (typeCheck) {
            let customConditions = e.conditions && JSON.parse(e.conditions);
            let conditionKeys =
              customConditions && Object.keys(customConditions);
            if (conditionKeys && conditionKeys.length) {
              let val = true;
              conditionKeys.forEach((key) => {
                if (fm[key]) val &= fm[key] === customConditions[key];
                else val = false;
              });
              return typeCheck && val;
            } else return typeCheck;
          } else return false;
        })
    );
  };

  const getAcceptedTypes = (template, feat) => {
    const { excluded, included } = getFeatSystemTypes(feat);
    const { sys_topLevel } = template?.sys_entityAttributes;
    let acceptedDirs = {};
    // // console.log(sys_topLevel, feat);
    let includedTypes = getIncludedTypes(sys_topLevel, excluded[0]);
    includedTypes.forEach((fm) => {
      let obj = { ...fm, CLASS: "TOPLEVEL" };
      let systemDirType = included.find((e) => {
        return e?.sys_entityAttributes?.directiveTypes.some(
          (e) => e.name === fm.type
        );
      });
      if (systemDirType) {
        let { dataFormat, filterFormat, operators, directiveTypes } =
          systemDirType?.sys_entityAttributes;
        obj = {
          ...obj,
          ["directiveInfo"]: directiveTypes.find((e) => e.name === fm.type),
          dataFormat,
          filterFormat,
          operators,
        };
        acceptedDirs[fm.name] = obj;
      }
    });
    return acceptedDirs;
  };

  return {
    filterByFeature,
    getAcceptedTypes,
  };
};

export default SystemTypeFactory;
