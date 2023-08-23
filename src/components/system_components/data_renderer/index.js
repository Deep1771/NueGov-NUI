import React, { useState, useEffect } from "react";
import { entity } from "utils/services/api_services/entity_service";
import { get } from "utils/services/helper_services/object_methods";
import { textExtractor } from "utils/services/helper_services/system_methods";

export const SystemDataRenderer = (props) => {
  const { fieldmeta, testid, ...rest } = props;
  const {
    name,
    appName,
    moduleName,
    entityName,
    formName,
    directiveType,
    path,
  } = fieldmeta;

  const [printText, setPrintText] = useState();

  useEffect(() => {
    let Query = {
      appname: appName,
      modulename: moduleName,
      entityname: entityName,
      formName,
      limit: 1,
      skip: 0,
    };
    entity.get(Query).then((res) => {
      if (res && res.length) {
        let printData = get(res[0], path);
        setPrintText(printData);
      }
    });
  }, [name]);

  return (
    <div
      testid={testid}
      style={{ fontFamily: "inherit", width: "auto" }}
      dangerouslySetInnerHTML={{
        __html: textExtractor(printText, { ...fieldmeta, type: directiveType }),
      }}
    ></div>
  );
};
