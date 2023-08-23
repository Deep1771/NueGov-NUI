import React from "react";
import FileManager from "containers/feature_containers/file_manager";

let Documents = (props) => {
  if (props.properties.event)
    return (
      <FileManager
        hideToolbar={true}
        securityParams={props.securityParams}
        parentMode="read"
        refData={{
          id: props.properties.event.id,
          sys_gUid: props.properties.event.sys_gUid,
        }}
      />
    );
  else return <></>;
};

export default Documents;
