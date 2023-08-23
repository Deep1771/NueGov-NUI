import React, { useEffect, useState } from "react";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { DisplayText } from "components/display_components";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";

let Overview = (props) => {
  let { properties } = props;
  let [data, setData] = useState(false);
  let [childData, setChildData] = useState(false);
  let [metadata, setMetadata] = useState(false);
  let [childMetadata, setChildMetadata] = useState(false);

  let getChildData = async (payload) => {
    try {
      if (payload) {
        let child_meta = await entityTemplate.get({
          appname: payload.event.appName,
          modulename: payload.event.moduleName,
          groupname: payload.event.templateName,
        });
        setChildMetadata(child_meta.sys_entityAttributes.app_cardContent);

        let child_data = await entity.get({
          appname: payload.event.appName,
          modulename: payload.event.moduleName,
          entityname: payload.event.templateName,
          id: payload.event.id,
        });
        setChildData(child_data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (properties.metadata.sys_entityAttributes.app_cardContent) {
      setMetadata(properties.metadata.sys_entityAttributes.app_cardContent);
    }
    if (properties.data) {
      setData({ sys_entityAttributes: properties.data });
      getChildData(properties.data);
    }
  }, [properties]);

  return (
    <div style={{ flexDirection: "column", display: "flex" }}>
      {metadata &&
        metadata.titleField.map((title, index) => {
          if (title.visible)
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "black",
                }}
              >
                <DisplayText style={{ fontSize: 16 }}>
                  {title.title}
                </DisplayText>
                <DisplayText style={{ color: "#576574" }}>
                  {textExtractor(data.sys_entityAttributes[title.name], title)}
                </DisplayText>
              </div>
            );
          else return <></>;
        })}
      {data &&
        metadata &&
        metadata.descriptionField.map((description, index) => {
          if (description.visible)
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 10,
                }}
              >
                <DisplayText style={{ fontSize: 16 }}>
                  {description.title}
                </DisplayText>
                <DisplayText style={{ color: "#576574" }}>
                  {textExtractor(
                    data.sys_entityAttributes[description.name],
                    description
                  )}
                </DisplayText>
              </div>
            );
          else return <></>;
        })}
      {childMetadata &&
        childMetadata.titleField.map((title, index) => {
          if (title.visible)
            return (
              <div
                key={index + 100}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 10,
                }}
              >
                <DisplayText style={{ fontSize: 16 }}>
                  {title.title}
                </DisplayText>
                <DisplayText style={{ color: "#576574" }}>
                  {childData &&
                    textExtractor(
                      childData.sys_entityAttributes[title.name],
                      title
                    )}
                </DisplayText>
              </div>
            );
          else return <></>;
        })}
      {childData &&
        childMetadata &&
        childMetadata.descriptionField.map((description, index) => {
          if (description.visible)
            return (
              <div
                key={index + 100}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 10,
                }}
              >
                <DisplayText style={{ fontSize: 16 }}>
                  {description.title}
                </DisplayText>
                <DisplayText style={{ color: "#576574" }}>
                  {childData &&
                    textExtractor(
                      childData.sys_entityAttributes[description.name],
                      description
                    )}
                </DisplayText>
              </div>
            );
          else return <></>;
        })}
    </div>
  );
};

export default Overview;
