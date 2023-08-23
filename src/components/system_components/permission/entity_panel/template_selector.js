import React, { useEffect, useState } from "react";
import {
  DisplayButton,
  DisplayCard,
  DisplayGrid,
  DisplayText,
} from "components/display_components";
import { get } from "utils/services/helper_services/object_methods";
import BubbleLoader from "components/helper_components/bubble_loader";
import { getRoleTemplate } from "../permission_services";

export const TemplateSelector = (props) => {
  const { entityName, onClose, onSelect } = props;
  const [selectedItem, setSelectedItem] = useState(null);
  const [templates, setTemplates] = useState([]);

  // Custom Functions
  const handleSelect = (template) => setSelectedItem(template);

  useEffect(() => {
    const getTemplates = async () => {
      let templates = await getRoleTemplate({
        "entityName.sys_groupName": entityName,
      });
      if (templates) setTemplates(templates);
    };
    getTemplates();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 11,
          alignItems: "flex-start",
          contain: "strict",
          overflowY: "scroll",
          flexDirection: "column",
          padding: "0 10px",
        }}
        class="hide_scroll"
      >
        {!templates.length && <BubbleLoader />}
        {templates.map((et) => {
          let { sys_friendlyName, sys_templateName } = et.sys_entityAttributes;
          return (
            <DisplayCard
              testid={`${sys_templateName}`}
              key={`cs-${et._id}`}
              style={{
                alignItems: "center",
                marginTop: "10px",
                height: "70px",
                minHeight: "70px",
                maxHeight: "70px",
                width: "100%",
                cursor: "pointer",
              }}
              onClick={() => handleSelect(et)}
              square={true}
              systemVariant={
                selectedItem && selectedItem._id === et._id
                  ? "primary"
                  : "default"
              }
            >
              <DisplayText>&nbsp;&nbsp;{sys_friendlyName}</DisplayText>
            </DisplayCard>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          padding: "0 10px",
        }}
      >
        <DisplayGrid item xs={12} container justify="flex-end">
          <DisplayButton
            testid={"select"}
            onClick={() => {
              selectedItem ? onSelect({ data: [selectedItem] }) : onClose();
            }}
          >
            SELECT
          </DisplayButton>
        </DisplayGrid>
      </div>
    </div>
  );
};
