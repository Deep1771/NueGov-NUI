import React, { useState, useContext } from "react";
import { DisplayIconButton } from "components/display_components";
import { SystemIcons } from "utils/icons";
import { ToolTipWrapper } from "components/wrapper_components";
import { tableContext, tableDispatchContext } from "../../tableStore";

export const ReferenceDisplay = (props) => {
  let { data, value, rowIndex } = props || {};
  const { Info } = SystemIcons;
  const [tooltipClick, setTooltipClick] = useState(false);

  let tableData = useContext(tableContext);

  let { cellRendererParams } = props?.colDef || {};
  let { displayFields, fieldmeta } = cellRendererParams || [];
  let { inventory, lineItems } = fieldmeta || {};
  let fieldFromInventoryEntity =
    inventory.entityname === cellRendererParams.entityname;
  let checkSysGuid =
    !tableData["lineItems"]?.[rowIndex]?.hasOwnProperty("sys_gUid");

  let fieldValue = displayFields?.map((el) => value && value[el.name]);
  fieldValue = fieldValue?.filter((fl) => ![undefined, null, ""].includes(fl));

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex" }}>
        {fieldFromInventoryEntity && checkSysGuid ? (
          <DisplayIconButton onClick={() => setTooltipClick(!tooltipClick)}>
            <ToolTipWrapper
              title={`Remaining Quantity - ${data.currentQuantity}`}
              open={tooltipClick}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              onClose={() => setTooltipClick(false)}
            >
              <Info style={{ color: "gray" }} />
            </ToolTipWrapper>
          </DisplayIconButton>
        ) : (
          <></>
        )}
      </div>
      <div style={{ color: "#308cf7" }}>{fieldValue?.toString()}</div>
    </div>
  );
};
