import React from "react";
import { UserFactory } from "utils/services/factory_services";
import { DisplaySelect } from "../../display_components";

export const AgencyFilter = ({
  defaultValue,
  setValue,
  filled,
  value: VALUE,
  ...rest
}) => {
  const {
    getAgencyId,
    getAgencyName,
    getSharedAgencies,
    getSubAgencies,
    isNJAdmin,
  } = UserFactory();
  const { parent, sibling, child } = getSubAgencies || {};

  let subAgencies = [
    ...(parent ? parent : []),
    ...(sibling ? sibling : []),
    ...(child ? child : []),
  ];
  subAgencies = subAgencies.map((ea) => {
    return {
      agency: ea.sys_entityAttributes.Name,
      id: ea._id,
    };
  });
  let sharedAgencies = getSharedAgencies ? getSharedAgencies : [];
  sharedAgencies = sharedAgencies.map((ea) => {
    return {
      agency: ea.sys_entityAttributes.Name,
      id: ea._id,
    };
  });
  let allAgencies = [];

  if (!isNJAdmin() && (subAgencies.length || sharedAgencies.length)) {
    let agencyInfo = {
      agency: getAgencyName(),
      id: getAgencyId,
    };
    allAgencies = [agencyInfo, ...subAgencies, ...sharedAgencies];
  }

  let value =
    VALUE && VALUE.filter((ev) => allAgencies.some((ea) => ea.id == ev));

  const onChange = (value) => {
    setValue("agencies", value);
  };

  return (
    <>
      {allAgencies.length > 0 ? (
        <DisplaySelect
          title={"Select Agency"}
          labelKey={"agency"}
          label={"Select Agency"}
          displayChip={false}
          selectView={true}
          valueKey={"id"}
          values={allAgencies}
          defaultValue={defaultValue}
          onChange={(value) => onChange(value)}
          value={value}
          filled={filled}
          multiple={true}
          showNone={false}
          MenuProps={{ style: { zIndex: 10001, height: "300px" } }}
          variant="standard"
          hideFooterChips={true}
          {...rest}
        />
      ) : null}
    </>
  );
};
