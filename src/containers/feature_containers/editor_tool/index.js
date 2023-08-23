import React, { useEffect, useState } from "react";
import { entity } from "utils/services/api_services/entity_service";
import { GlobalFactory } from "utils/services/factory_services";
import {
  DisplayButton,
  DisplayEditor,
  DisplayTabs,
} from "components/display_components";

export const JsonEditor = (props) => {
  let { callbackClose, data, metadata, ...rest } = props;
  const { setSnackBar } = GlobalFactory();
  const [dataValue, setDataValue] = useState();
  const [editorValue, setEditorValue] = useState();
  const [errors, setErrors] = useState([]);
  const [section, setSection] = useState("MetaData");
  const [value, setValue] = useState();

  // Custom Functions
  const changeValue = (v) => {
    setEditorValue(v);
    if (IsValidJSONString(v)) {
      let jData = JSON.parse(v);
      setValue(jData);
    } else return;
  };

  const IsValidJSONString = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  const saveJsonValue = async () => {
    let id = metadata._id;
    let res = await entity.update(
      {
        appname: "NJAdmin",
        modulename: "NJ-System",
        entityname: "EntityTemplate",
        id: id,
      },
      value ? value : metadata
    );
    if (res) {
      setSnackBar({
        message: "Metadata has been successfully saved",
        severit: "success",
      });
      callbackClose(false, "saved");
    }
  };

  // UseEffects
  useEffect(() => {
    setDataValue(JSON.stringify(data, null, 4));
  }, [data]);

  useEffect(() => {
    let template = JSON.parse(JSON.stringify(metadata));
    if (template.sys_entityAttributes.sys_entityType == "Approval") {
      template.sys_entityAttributes.sys_topLevel =
        template.sys_entityAttributes.sys_topLevel.filter((ef) => !ef.approval);
      template.sys_entityAttributes.sys_approvals =
        template.sys_entityAttributes.sys_approvals.map((ef) => {
          delete ef.skipReadMode;
          delete ef.approval;
          return ef;
        });
    }
    setEditorValue(JSON.stringify(template, null, 4));
  }, [metadata]);

  // Render Methods
  const renderSection = () => {
    switch (section) {
      case "MetaData":
        return (
          <DisplayEditor
            {...rest}
            mode="json"
            value={editorValue}
            onChange={changeValue}
            onValidate={(errors) => {
              setErrors(errors);
            }}
            errors={errors}
          />
        );
      case "Data":
        return (
          <DisplayEditor
            disable={true}
            mode="json"
            onValidate={() => {}}
            value={dataValue}
          />
        );
    }
  };

  const showSave = () => {
    return section === "Data" ? false : true;
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", flexShrink: 1 }}>
        <DisplayTabs
          tabs={[
            { name: "Metadata", key: "MetaData" },
            { name: "Data", key: "Data" },
          ]}
          defaultSelect={section}
          titleKey={"name"}
          valueKey={"key"}
          onChange={(value) => {
            setSection(value);
          }}
        />
      </div>
      <div style={{ display: "flex", flex: 11, marginTop: "5px" }}>
        {renderSection()}
      </div>
      <div
        style={{ display: "flex", flexShrink: 1, flexDirection: "row-reverse" }}
      >
        <DisplayButton
          color="primary"
          onClick={() => {
            callbackClose(false, "closed");
          }}
        >
          Close
        </DisplayButton>
        {showSave() && (
          <DisplayButton
            color="primary"
            disabled={errors.length ? true : false}
            onClick={saveJsonValue}
          >
            Save
          </DisplayButton>
        )}
      </div>
    </div>
  );
};
