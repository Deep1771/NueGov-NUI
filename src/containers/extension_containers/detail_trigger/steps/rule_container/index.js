import React, { useContext } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { get } from "lodash";
import RuleBuilder from "./rule_builder";
import { SystemReference } from "components/system_components";
import { EntitySelector } from "components/helper_components";
import {
  DisplayDivider,
  DisplayGrid,
  DisplayInput,
  DisplaySwitch,
  DisplayText,
} from "components/display_components";
import { TriggerContext } from "../../";
import { AGENCY_REFERENCE } from "../../utils/constants";
import { useRuleStyles } from "../../utils/styles";
import { UserFactory } from "utils/services/factory_services";

const RuleContainer = () => {
  const [triggerState, dispatch] = useContext(TriggerContext);
  const { detailMode, data, editable } = triggerState;
  //checks if it is a document level trigger
  const isDetailDoc = get(data, "sys_entityAttributes.doc_gUid");
  const { isNJAdmin } = UserFactory();

  const classes = useRuleStyles();
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <div className={classes.r_title}>
        <DisplayText variant="h1">
          Enter Notification title and select entity to continue the process
        </DisplayText>
        <Controller
          name="notify"
          render={({ field: { value, ref, ...props } }) => (
            <DisplaySwitch
              label="Notify"
              labelPlacement="end"
              onlyValue={true}
              checked={Boolean(value)}
              inputRef={ref}
              disabled={!editable}
              value={value}
              {...props}
            />
          )}
        />
      </div>
      <div className={classes.r_control}>
        <DisplayGrid
          container
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <DisplayGrid item xs={12} lg={6}>
            <Controller
              name="title"
              rules={{ required: "Enter Notification" }}
              key={"title"}
              render={({
                field: { onChange, ref, value, ...rest },
                fieldState: { error },
              }) => (
                <DisplayInput
                  error={Boolean(error?.message)}
                  placeholder="Enter Notification title"
                  label="Notification title"
                  onChange={onChange}
                  defaultValue={value}
                  variant="outlined"
                  inputRef={ref}
                  disabled={!editable}
                  onClear={() => onChange("")}
                  style={{ width: "50%" }}
                  helperText={error?.message || ""}
                  {...rest}
                />
              )}
            />
          </DisplayGrid>
          <DisplayGrid item xs={12} lg={3}>
            {isNJAdmin() && !detailMode && !isDetailDoc && (
              <Controller
                name={AGENCY_REFERENCE.name}
                render={({ field: { onChange } }) => (
                  <SystemReference
                    stateParams="NEW"
                    callbackError={(e) => {}}
                    callbackValue={(data) => {
                      onChange(data);
                    }}
                    disabled={!editable}
                    showLabel={false}
                    showButtons={false}
                    data={data?.sys_entityAttributes?.stampagency}
                    fieldmeta={{ ...AGENCY_REFERENCE, multiSelect: false }}
                  />
                )}
              />
            )}
          </DisplayGrid>
          <DisplayGrid item xs={12} lg={3}>
            <Controller
              name="entityInfo"
              rules={{ required: "Select entity" }}
              render={({
                field: { onChange, ref, value, ...rest },
                fieldState: { error },
              }) => (
                <EntitySelector
                  onChange={(t) => {
                    onChange(t);
                  }}
                  error={Boolean(error?.message)}
                  disabled={Boolean(detailMode || isDetailDoc || !editable)}
                  value={value}
                  getOptionDisabled={(option) =>
                    option?.unique_key === value?.unique_key
                  }
                  multiple={false}
                  {...rest}
                  helperText={error?.message || ""}
                  style={{
                    marginTop: 0,
                  }}
                />
              )}
            />
          </DisplayGrid>
        </DisplayGrid>
      </div>
      <br />
      <DisplayDivider />
      <br />
      <RuleBuilder />
    </>
  );
};

export default RuleContainer;
