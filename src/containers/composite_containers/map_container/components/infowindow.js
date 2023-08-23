import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { PresetFactory, UserFactory } from "utils/services/factory_services";
import { ContainerWrapper } from "components/wrapper_components";
import { DisplayModal, DisplayButton } from "components/display_components";
import { DetailPage } from "containers/composite_containers/detail_container/components/detail_page";
import { DetailContainerSkeleton } from "components/skeleton_components";
import { getTruncatedMetadata } from "../map_parsers";
import { entityTemplate } from "utils/services/api_services/template_service";
import { get } from "utils/services/helper_services/object_methods";
import {
  mergeApprovalSection,
  queryToUrl,
} from "utils/services/helper_services/system_methods";

const InfoWindow = ({
  showIW,
  setShowIW,
  iw,
  iwShape,
  fixedShape,
  mapControl,
  filters,
  addResetFilters,
  callTriggerSearch,
}) => {
  let history = useHistory();
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(false);

  const { getByAgencyId, getByGroupName, getRoleBasedTemplate } =
    PresetFactory();
  const { isNJAdmin, isRoleBasedLayout, getId } = UserFactory();

  const handleLoadingSkeleton = (started, fetchData) => {
    setLoading(started);
    if (fetchData) window.location.reload();
  };

  const init = async () => {
    try {
      setLoading(true);
      let { entityname, ...metadataParams } = iw.dataParams;
      metadataParams.groupname = entityname;
      let iwMetadata, entityType;
      let baseTemplate = getByGroupName(metadataParams.groupname);

      if (
        isRoleBasedLayout(
          metadataParams.appname,
          metadataParams.modulename,
          metadataParams.groupname
        ) &&
        !isNJAdmin()
      ) {
        if (iw.iwData && iw.iwData.sys_userId) {
          if (getId == iw.iwData.sys_userId)
            iwMetadata = getByGroupName(metadataParams.groupname);
          else
            iwMetadata = await entityTemplate.get({
              ...metadataParams,
              sys_userId: iw.iwData.sys_userId,
            });
        } else {
          iwMetadata = getRoleBasedTemplate(
            metadataParams.groupname,
            iw.iwData.sys_templateName
          );
        }
      } else if (iw.iwData.sys_agencyId)
        iwMetadata = getByAgencyId(
          metadataParams.groupname,
          iw.iwData.sys_agencyId
        );

      if (
        !iwMetadata ||
        (iwMetadata instanceof Object && Object.keys(iwMetadata).length == 0)
      )
        iwMetadata = await entityTemplate.get(metadataParams);

      //Approvals
      entityType = get(iwMetadata, "sys_entityAttributes.sys_entityType");
      if (entityType && entityType === "Approval")
        iwMetadata = mergeApprovalSection(baseTemplate, iwMetadata);

      let fieldMetadata = iwMetadata.sys_entityAttributes.sys_topLevel.find(
        (field) => ["DESIGNER", "LATLONG"].includes(field.type)
      );

      iwMetadata = getTruncatedMetadata(
        JSON.parse(JSON.stringify(iwMetadata)),
        fieldMetadata
      );
      setMetadata(iwMetadata);
      setLoading(false);
    } catch (e) {}
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <DisplayModal open={showIW} fullWidth={true} maxWidth="md" style={{}}>
      <div
        style={{
          height: "85vh",
          padding: "8px 8px 8px 8px",
          display: "flex",
          flex: 1,
        }}
      >
        <ContainerWrapper>
          {loading && !metadata && <DetailContainerSkeleton />}
          {!loading && metadata && (
            <>
              <DetailPage
                data={iw.iwData}
                metadata={metadata}
                appname={iw.dataParams.appname}
                modulename={iw.dataParams.modulename}
                groupname={iw.dataParams.entityname}
                id={iw.dataParams.id}
                saveCallback={() => {
                  setShowIW(false);
                }}
                mode={"read"}
                options={{
                  hideFooter: false,
                  hideNavbar: false,
                  hideTitlebar: false,
                }}
                showToolbar="true"
                handleLoadingSkeleton={handleLoadingSkeleton}
                fromMap={true}
              />
              <div style={{ display: "flex", "justify-content": "end" }}>
                <DisplayButton
                  variant="outlined"
                  systemVariant="secondary"
                  color="error"
                  onClick={() => {
                    setShowIW(false);
                  }}
                >
                  {" "}
                  Close
                </DisplayButton>
                <DisplayButton
                  onClick={() => {
                    let routeLiteral = `/app/summary/${iw.dataParams.appname}/${iw.dataParams.modulename}/${iw.dataParams.entityname}/read/${iw.dataParams.id}`;
                    if (filters) routeLiteral += `?${queryToUrl(filters)}`;
                    history.push(routeLiteral);
                  }}
                >
                  {" "}
                  More Details
                </DisplayButton>

                {iwShape !== null && (
                  <DisplayButton
                    onClick={() => {
                      if (fixedShape.current === null) {
                        let resetFilterDiv = document.createElement("div");
                        resetFilterDiv.style.paddingRight = "10px";
                        resetFilterDiv.style.paddingTop = "10px";
                        addResetFilters(resetFilterDiv);
                        resetFilterDiv.index = 1;
                        mapControl.current.controls[
                          window.google.maps.ControlPosition.TOP_RIGHT
                        ].push(resetFilterDiv);
                      }
                      fixedShape.current = iwShape.shape;
                      callTriggerSearch();
                      mapControl.current.fitBounds(iwShape.bounds);
                      setShowIW(false);
                    }}
                  >
                    {" "}
                    Search This Area
                  </DisplayButton>
                )}
              </div>
            </>
          )}
        </ContainerWrapper>
      </div>
    </DisplayModal>
  );
};

export default InfoWindow;
