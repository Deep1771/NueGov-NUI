import React, { useEffect, useState } from "react";
import { ContainerWrapper } from "components/wrapper_components/container";
import { DetailContainer } from "../";
import { DisplayModal } from "components/display_components";
import { entityTemplate } from "utils/services/api_services/template_service";

export const QuickFlow = (props) => {
  const [quickFlowData, setQuickFlowData] = useState({});
  const [showModal, setShowModal] = useState(false);

  const {
    appname,
    closeRenderQuickFlow,
    entity: groupname,
    module: modulename,
    formData,
    quickFlow,
    mode,
    path,
  } = props;

  const constructReference = (childMeta, parentField, savedData) => {
    if (Object.keys(childMeta).length) {
      let parentFieldDef = childMeta.sys_entityAttributes.sys_topLevel.find(
        (e) => e.name === parentField
      );
      if (parentFieldDef) {
        let referenceObj = {};
        let { sys_entityAttributes } = savedData;
        parentFieldDef.displayFields.map((e) => {
          if (e.type === "AUTOFILL") {
            let fieldName = e.name.split(".")[e.name.split(".").length - 1];
            if (sys_entityAttributes) {
              if (sys_entityAttributes.geoJSONLatLong)
                referenceObj[fieldName] =
                  sys_entityAttributes.geoJSONLatLong[fieldName];
            }
          } else {
            if (e.name.split(".").length > 1) {
              let name = e.name.split(".")[0];
              let fieldName = e.name.split(".")[e.name.split(".").length - 1];
              if (sys_entityAttributes[name])
                if (sys_entityAttributes[name][fieldName])
                  referenceObj[fieldName] =
                    sys_entityAttributes[name][fieldName];
            } else {
              if (sys_entityAttributes)
                referenceObj[e.name] = sys_entityAttributes[e.name];
            }
          }
        });
        return {
          ...referenceObj,
          id: savedData._id,
          sys_gUid: savedData.sys_gUid,
        };
      }
    }
  };
  const getPopulateValues = async () => {
    if (["NEW", "CLONE"].includes(mode)) {
      formData._id = quickFlow.id;
      formData.sys_gUid = quickFlow.sys_gUid;
    }
    let savedData = { ...formData };
    let modifiedData = { ...formData };
    let parentField = path.split(".")[1];
    let childMeta = await entityTemplate.get({
      appname,
      modulename,
      groupname,
    });
    let referenceObj = constructReference(childMeta, parentField, savedData);
    modifiedData["sys_entityAttributes"][parentField] = referenceObj;
    modifiedData["sys_components"] = savedData.sys_components;
    return modifiedData;
  };

  useEffect(() => {
    getPopulateValues()
      .then((res) => {
        setQuickFlowData(res);
        setShowModal(true);
      })
      .catch((err) => {
        console.error("Error in get populate values", err);
      });
  }, []);

  return (
    <DisplayModal open={showModal} fullWidth={true} maxWidth="xl">
      <div style={{ height: "85vh", width: "100%", display: "flex", flex: 1 }}>
        <ContainerWrapper>
          <div style={{ height: "98%", width: "98%", padding: "1%" }}>
            <DetailContainer
              appname={appname}
              modulename={modulename}
              groupname={groupname}
              mode="new"
              options={{
                hideTitleBar: true,
              }}
              data={quickFlowData}
              saveCallback={() => {
                setShowModal(false);
                closeRenderQuickFlow();
              }}
              prevQuickFlow={quickFlow}
              onClose={() => {
                setShowModal(false);
                closeRenderQuickFlow();
              }}
            />
          </div>
        </ContainerWrapper>
      </div>
    </DisplayModal>
  );
};
