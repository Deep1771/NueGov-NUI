import React, { useEffect, useMemo, useState } from "react";
import { RelationContainer } from "../../relation_container";
import { User } from "utils/services/factory_services/user_service";
import { UserFactory } from "utils/services/factory_services";
import { useDetailData } from "../detail_state";
import { DisplayGrid, DisplayTabs } from "components/display_components";
import { styles } from "../styles";

export const RelatedList = (props) => {
  const { appname, entityname, id, metadata, modulename, section } = props;
  const { checkReadAccess, getEntityFeatureAccess } = User();
  const { getEntityFriendlyName } = UserFactory();
  const { stateParams, formData } = useDetailData();
  // const [section, setSection] = useState();
  const [tabs, setTabs] = useState([]);

  // Setters
  // const onTabSelect = (section) => setSection(section);

  const isShowQuickEntity = (definition) => {
    if (definition.quickFlow)
      if (definition.visible) return true;
      else return false;
    else return true;
  };
  // useEffects
  useEffect(() => {
    if (metadata) {
      const { sys_entityRelationships } = metadata.sys_entityAttributes;
      const { appname, groupname, modulename } = stateParams;
      const relations = sys_entityRelationships
        .filter((er) => {
          if (er.entityName !== "Audits") {
            return (
              checkReadAccess({
                appname: er.appName,
                modulename: er.moduleName,
                entityname: er.entityName,
              }) && isShowQuickEntity(er)
            );
          }
        })
        .map((er) => {
          let { appName, moduleName, entityName } = er;
          return {
            name: er.entityName,
            title: getEntityFriendlyName({
              appname: appName,
              modulename: moduleName,
              entityname: entityName,
            }),
            data: er,
          };
        });

      setTabs(relations);
    }
  }, [metadata]);

  // useEffect(() => {
  //   setSection(section.split("*")[1]);
  // }, [section]);

  //render Methods
  const renderSection = () => {
    if (section && tabs.length) {
      let tab = tabs.find((es) => es.name === section);

      if (tab)
        return (
          <div style={styles.sections} class="hide_scroll">
            <DisplayGrid container style={{ width: "100%", height: "100%" }}>
              <RelationContainer
                parentApp={appname}
                parentModule={modulename}
                childEntity={tab.data.entityName}
                childModule={tab.data.moduleName}
                childApp={tab.data.appName}
                path={tab.data.path}
                formData={formData}
                parentMeta={metadata}
                parentEntity={entityname}
                id={id}
                {...tab.data}
              />
            </DisplayGrid>
          </div>
        );
    }
  };

  // const renderTabs = () => {
  //   if (tabs && section)
  //     return (
  //       <div style={styles.sub_tab}>
  //         <DisplayTabs
  //           testid={metadata.sys_entityAttributes.sys_templateName}
  //           tabs={tabs}
  //           defaultSelect={section}
  //           titleKey="title"
  //           valueKey="name"
  //           onChange={onTabSelect}
  //           variant="scrollable"
  //         />
  //       </div>
  //     );
  // };

  return useMemo(
    () => (
      <>
        {/* {renderTabs()} */}
        {renderSection()}
      </>
    ),
    [section, tabs]
  );
};
