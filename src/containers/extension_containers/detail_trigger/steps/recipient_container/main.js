import React, { useContext } from "react";
import { get } from "lodash";
import { SystemReference } from "components/system_components/reference";
import { TriggerContext } from "../../";
import { getContextFields } from "../../utils/services";

const RecipientContainer = () => {
  const [triggerState, dispatch] = useContext(TriggerContext);
  const { template, data } = triggerState;
  const topLevel = get(template, "sys_entityAttributes.sys_topLevel", []);
  if (topLevel.length) getContextFields(topLevel);

  return <div></div>;
};

export default RecipientContainer;
