import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  DisplayButton,
  DisplayCard,
  DisplayGrid,
  DisplayText,
} from "components/display_components";

export const ComponentsSelector = (props) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const { metadata, multiple, selectHandler } = props;
  const { sys_components } = metadata.sys_entityAttributes;
  let { componentList } = sys_components[0];

  //Declarative Methods
  componentList = componentList.sort((pc, nc) => (pc.name > nc.name ? 1 : -1));

  // Custom Functions
  const handleSelect = (ec) => {
    if (selectedItems.includes(ec.name)) {
      let items = selectedItems.filter((ei) => ei !== ec.name);
      setSelectedItems(items);
    } else {
      if (multiple) {
        let items = [...selectedItems, ec.name];
        setSelectedItems(items);
      } else setSelectedItems([ec.name]);
    }
  };

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
        {componentList.map((ec) => (
          <DisplayCard
            testid={`${metadata.sys_entityAttributes.sys_templateGroupName.sys_groupName}-${ec.name}`}
            id={`${ec.componentTitle}`}
            key={`cs-${ec.name}`}
            style={{
              alignItems: "center",
              marginTop: "10px",
              height: "50px",
              minHeight: "50px",
              maxHeight: "50px",
              width: "100%",
              padding: "0 10px",
              cursor: "pointer",
            }}
            onClick={() => handleSelect(ec)}
            square={true}
            systemVariant={
              selectedItems.includes(ec.name) ? "primary" : "default"
            }
          >
            <DisplayText>{ec.componentTitle}</DisplayText>
          </DisplayCard>
        ))}
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
            testid={`comp-select`}
            onClick={() => selectHandler(selectedItems)}
          >
            SELECT
          </DisplayButton>
        </DisplayGrid>
      </div>
    </div>
  );
};

ComponentsSelector.propTypes = {
  metadata: PropTypes.object.isRequired,
  multiple: PropTypes.bool,
};

ComponentsSelector.defaultProps = {
  multiple: true,
};
