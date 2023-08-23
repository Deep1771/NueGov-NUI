import React, { useState, useEffect } from "react";
import { Iterator } from "../../../../src/containers/composite_containers/detail_container/components/iterator";
import { SystemLabel } from "components/system_components/";
import { isDefined } from "utils/services/helper_services/object_methods";

export const SystemObject = (props) => {
  const {
    fieldmeta,
    callbackValue,
    callbackError,
    data,
    stateParams,
    testid,
    fieldError,
  } = props;
  const { fields, name, info, required, title } = fieldmeta;
  const [dataObject, setObject] = useState(data ? data : {});
  const [err, setErr] = useState({});

  const handleObjects = (fieldData, fieldProps) => {
    let newObj = { ...dataObject };
    newObj[fieldProps.fieldmeta.name] = fieldData;
    if (!isDefined(fieldData)) {
      delete newObj[fieldProps.fieldmeta.name];
    }
    setObject(newObj);
  };

  useEffect(() => {
    callbackValue(
      Object.keys(dataObject)?.length > 0 ? dataObject : null,
      props
    );
  }, [dataObject]);

  const renderIterator = () => {
    return fields.map((ef) => {
      return (
        <Iterator
          data={dataObject[ef.name]}
          fieldmeta={ef}
          fieldError={fieldError ? fieldError.error : null}
          compName={name}
          compIndex={dataObject[ef.name]}
          callbackError={checkError}
          callbackValue={handleObjects}
          stateParams={stateParams}
          testid={stateParams.groupname + "-" + "section" + "-" + ef.name}
        />
      );
    });
  };

  const checkError = (flag, fieldProps) => {
    err[fieldProps.fieldmeta.name] = flag;
    let errorExist = Object.values(err).some((element) => element !== null);
    callbackError(errorExist ? "required" : null, props);
  };

  return (
    <div
      style={{
        display: "flex-inline",
        flexDirection: "column",
        gap: "4px",
        width: "100%",
      }}
    >
      <SystemLabel
        toolTipMsg={info}
        required={required}
        error={Object.values(err).some((element) => element !== null)}
      >
        {title}
      </SystemLabel>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {renderIterator()}
      </div>
    </div>
  );
};
