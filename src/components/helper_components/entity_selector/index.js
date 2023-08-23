import React, { memo } from "react";
import { DisplayAutocomplete } from "components/display_components";
import { UserFactory } from "utils/services/factory_services";

const EntitySelector = (props) => {
  const { filterArray, onChange, fromImports = false, ...rest } = props;
  const { getAllEntities } = UserFactory();
  return (
    <DisplayAutocomplete
      options={getAllEntities(
        filterArray || [],
        fromImports,
        rest?.agencyAppStructure
      )}
      labelKey="friendlyName"
      onlyValue={true}
      variant="outlined"
      // label={"Select Entity"}
      placeholder={"select entity"}
      onChange={onChange}
      getOptionSelected={(option, value) =>
        option?.unique_key === value?.unique_key
      }
      disabled={rest?.disabled || false}
      {...rest}
    />
  );
};

export default EntitySelector;
