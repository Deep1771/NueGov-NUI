import React, { useState } from "react";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { get } from "utils/services/helper_services/object_methods";
//Custom Components
import {
  DisplayButton,
  DisplayCard,
  DisplayGrid,
  DisplayText,
} from "components/display_components";

import { SystemIcons } from "utils/icons";

export const CardComponent = (props) => {
  const { data, template, onCardClick } = props;

  //system-icons
  let { GetApp } = SystemIcons;
  //Local variables

  const { app_cardContent, sys_topLevel } = template.sys_entityAttributes;
  const { descriptionField, titleField } = app_cardContent
    ? app_cardContent
    : {};
  const cardFields = [
    ...titleField,
    ...descriptionField.filter(
      (ed) => titleField.findIndex((etf) => etf.name == ed.name) === -1
    ),
  ];
  const { sys_entityAttributes } = data;
  let status = get(sys_entityAttributes, "status");

  //Local State
  const [hovered, setHovered] = useState(false);

  const getDisplayText = (defn) => {
    let fieldmeta = sys_topLevel.find((ef) => ef.name === defn.name);
    let data = sys_entityAttributes[defn.name];
    return fieldmeta ? textExtractor(data, fieldmeta) : "";
  };

  const getDisplayTitle = (defn) => {
    let fieldmeta = sys_topLevel.find((ef) => ef.name === defn.name);
    return fieldmeta ? fieldmeta.title : "";
  };

  const handleCardClick = () => {
    onCardClick(data._id);
  };

  let getStatusColor = (ed) => {
    if (ed["name"] === "status") {
      let importStatus = status?.toLowerCase();
      if (importStatus === "success") {
        return "#50C878";
      } else if (importStatus === "in progress") {
        return "#CD853F";
      } else return "#CE2029";
    } else if (ed["name"] === "totalFailedDocuments") {
      return "#CE2029";
    } else if (ed["name"] === "totalInsertedDocuments") {
      return "#50C878";
    } else if (ed["name"] === "totalDocumentsProcessed") {
      return "#16589b";
    } else if (ed["name"] === "uploadedTime") {
      return "#2076d2";
    }
  };

  let getFontSize = (ed) => {
    if (
      ed["name"] === "totalFailedDocuments" ||
      ed["name"] === "totalInsertedDocuments" ||
      ed["name"] === "totalDocumentsProcessed"
    ) {
      return "20px";
    }
  };

  return (
    <>
      <DisplayCard
        onClick={handleCardClick}
        id={`cp-card-${data._id}`}
        testid={`cp-card-${data._id}`}
        style={{ backgroundColor: "white", maxHeight: "290px" }}
      >
        <DisplayGrid
          container
          style={{ margin: "10px", minHeight: "150px", position: "relative" }}
        >
          <DisplayGrid
            container
            alignItems="flex-start"
            justify="flex-start"
            direction="column"
            item
            xs={12}
            style={{
              rowGap: "4px",
              height: "235px",
              overflowY: "auto",
              flexWrap: "nowrap",
            }}
          >
            {cardFields.map((ed) => (
              <DisplayGrid
                key={data._id + "-" + ed.title}
                container
                style={{ justifyContent: "space-between" }}
              >
                {(ed?.title || getDisplayTitle(ed)) && (
                  <>
                    <DisplayGrid item xs={6}>
                      <DisplayText
                        variant="h1"
                        style={{ padding: "2px", fontSize: "13px" }}
                      >
                        {ed.title ? ed.title : getDisplayTitle(ed)}
                      </DisplayText>
                    </DisplayGrid>
                    <DisplayGrid item xs={6} style={{ textAlign: "end" }}>
                      <DisplayText
                        variant="h2"
                        style={{
                          fontSize: getFontSize(ed),
                          padding: "2px",
                          color: getStatusColor(ed),
                          textTransform: "capitalize",
                        }}
                      >
                        {getDisplayText(ed)}
                      </DisplayText>
                    </DisplayGrid>
                  </>
                )}
              </DisplayGrid>
            ))}
          </DisplayGrid>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
              marginTop: "8px",
            }}
          >
            <DisplayButton
              variant="outlined"
              size="small"
              disabled={!sys_entityAttributes["successfileLoc"]}
              href={sys_entityAttributes["successfileLoc"]}
              onClick={(event) => {
                event.stopPropagation();
              }}
              style={{
                borderColor: "green",
                color: "green",
                width: "fit-content",
                padding: "2px",
              }}
              startIcon={<GetApp size="small" />}
              download
            >
              Success File
            </DisplayButton>
            <DisplayButton
              variant="outlined"
              size="small"
              disabled={!getDisplayText({ name: "fileLoc" })}
              href={getDisplayText({ name: "fileLoc" })}
              onClick={(event) => {
                event.stopPropagation();
              }}
              style={{
                borderColor: "red",
                color: "red",
                width: "fit-content",
                padding: "2px",
              }}
              startIcon={<GetApp size="small" />}
              download
            >
              Error File
            </DisplayButton>
          </div>
        </DisplayGrid>
      </DisplayCard>
    </>
  );
};
