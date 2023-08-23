import React, { useEffect, useState } from "react";
import { DisplayIconButton, DisplayModal } from "components/display_components";
import { SystemIcons } from "utils/icons";
import { ToolTipWrapper } from "components/wrapper_components";

import { entityTemplate } from "utils/services/api_services/template_service";
import { DetailPage } from "containers/composite_containers/detail_container/components/detail_page";

export const InventoryActions = (props) => {
  let { data } = props || {};
  let { cellRendererParams } = props?.colDef || {};
  const [poPage, setPoPage] = useState(false);
  const [poTemplate, setPoTemplate] = useState({});
  const [InventoryDetail, setInventoryDetail] = useState(false);
  const [inventoryTemplate, setInventoryTemplate] = useState({});

  data = {
    ...data,
    sys_entityAttributes: {
      ...data,
      partType: cellRendererParams?.title,
    },
  };

  const { Description, Launch, Visibility, Update } = SystemIcons;

  const makePurchaseOrder = async () => {
    let poTmplate = await entityTemplate.get({
      appname: "NueGov",
      modulename: "PartsAndSupplies",
      groupname: "purchaseOrder",
    });
    setPoTemplate(poTmplate);
    setPoPage(true);
  };

  const openInventoryDetailPage = async () => {
    let inventoryTemplate = await entityTemplate.get({
      appname: cellRendererParams?.appname,
      modulename: cellRendererParams?.modulename,
      groupname: cellRendererParams?.entityname,
    });
    setInventoryTemplate(inventoryTemplate);
    Object.keys(inventoryTemplate).length > 0 && setInventoryDetail(true);
  };

  return (
    <div>
      <DisplayIconButton
        systemVariant="primary"
        size="small"
        onClick={() => makePurchaseOrder()}
        color={"blue"}
        // disabled={disabled}
      >
        <ToolTipWrapper title="Create Purchase Order">
          <Description />
        </ToolTipWrapper>
      </DisplayIconButton>
      <DisplayIconButton
        size="small"
        systemVariant="primary"
        onClick={() => openInventoryDetailPage()}
      >
        <ToolTipWrapper title="View">
          <Visibility />
        </ToolTipWrapper>
      </DisplayIconButton>
      {poPage && (
        <DisplayModal
          open={poPage}
          onClose={() => setPoPage(false)}
          maxWidth="lg"
          fullWidth={true}
          style={{}}
        >
          <div
            style={{
              height: "70vh",
              padding: "8px 8px 8px 8px",
              display: "flex",
              flex: 1,
            }}
          >
            <DetailPage
              data={data}
              metadata={poTemplate}
              appname="NueGov"
              modulename="PartsAndSupplies"
              groupname="purchaseOrder"
              mode={"new"}
              saveCallback={(e) => {
                setPoPage(false);
              }}
              onClose={() => {
                setPoPage(false);
              }}
              options={{
                hideFooter: false,
                hideNavbar: false,
                hideTitlebar: false,
                hideFeatureButtons: true,
              }}
              showToolbar="true"
            />
          </div>
        </DisplayModal>
      )}
      {InventoryDetail && (
        <DisplayModal
          open={InventoryDetail}
          onClose={() => setInventoryDetail(false)}
          maxWidth="lg"
          fullWidth={true}
          style={{}}
        >
          <div
            style={{
              height: "70vh",
              padding: "8px 8px 8px 8px",
              display: "flex",
              flex: 1,
            }}
          >
            <DetailPage
              data={data}
              id={data._id}
              appname={cellRendererParams.appname}
              modulename={cellRendererParams.modulename}
              groupname={cellRendererParams.entityname}
              entityname={cellRendererParams.entityname}
              metadata={inventoryTemplate}
              mode={"read"}
              saveCallback={(e) => {
                setInventoryDetail(false);
              }}
              onClose={() => {
                setInventoryDetail(false);
              }}
              options={{
                hideFooter: false,
                hideNavbar: false,
                hideTitlebar: false,
                hideFeatureButtons: true,
              }}
              showToolbar="true"
            />
          </div>
        </DisplayModal>
      )}
    </div>
  );
};
