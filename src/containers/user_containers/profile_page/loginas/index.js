import React, { useEffect, useState } from "react";
import { DisplayButton } from "components/display_components";
import { SystemReference } from "components/system_components/reference";
import { UserFactory } from "utils/services/factory_services";
import { BubbleLoader } from "components/helper_components";

import { entityTemplate } from "utils/services/api_services/template_service";
import { switchUser } from "./switchUser";

const LoginAs = (props) => {
  const { getDetails } = UserFactory();
  const [selectedUserInfo, setSelectedUserInfo] = useState();
  const [fieldMeta, setFieldMeta] = useState([]);

  const Query = {
    appname: "NJAdmin",
    modulename: "NJ-Personalization",
    groupname: "ProfilePage",
  };
  useEffect(() => {
    initMetaData();
  }, []);

  const initMetaData = async () => {
    let templateData = await entityTemplate.get(Query);
    if (templateData) {
      let data = templateData.sys_entityAttributes.sys_topLevel;
      let dataArray = data.filter(
        (item) => item.name === "agencyuser" || item.name === "userName"
      );
      dataArray.length && setFieldMeta(dataArray);
    }
  };

  return (
    <div style={{ margin: "1%" }}>
      {fieldMeta.length > 0 ? (
        fieldMeta.map((metadata) => {
          return (
            <SystemReference
              stateParams="NEW"
              callbackError={() => {}}
              fieldError={() => {}}
              callbackValue={(value) => setSelectedUserInfo(value)}
              data={null}
              fieldmeta={metadata}
            />
          );
        })
      ) : (
        <BubbleLoader />
      )}
      <DisplayButton
        disabled={selectedUserInfo == undefined}
        onClick={() => switchUser(props.history, selectedUserInfo, getDetails)}
        color={"primary"}
      >
        Login As
      </DisplayButton>
    </div>
  );
};

export default LoginAs;
