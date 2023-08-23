import React, { useEffect, useContext } from "react";
import { SystemReference } from "components/system_components/reference";
import {
  DisplayGrid,
  DisplayText,
  DisplayDivider,
  DisplaySelect,
  DisplaySwitch,
  DisplayIcon,
} from "components/display_components";
import { Controller, useFormContext } from "react-hook-form";
import { REFERENCE_GROUP } from "../../utils/constants";
import { TriggerContext } from "../../";
import { get } from "lodash";
import { SystemIcons } from "utils/icons";
import { UserFactory } from "utils/services/factory_services";

const RecipientContainer = () => {
  const [triggerState, dispatch] = useContext(TriggerContext);
  const { template, data, editable } = triggerState;
  const topLevel = get(template, "sys_entityAttributes.sys_topLevel", []);
  const templateName = get(
    template,
    "sys_entityAttributes.sys_friendlyName",
    ""
  );
  const { isNJAdmin, checkReadAccess } = UserFactory();
  const { Warning } = SystemIcons;

  const CONTEXT_RECIPIENTS = [
    {
      name: "record_users",
      title: "Select User",
      options: topLevel.filter(
        (e) => e.type === "REFERENCE" && e.entityName?.toUpperCase() === "USER"
      ),
    },
    {
      name: "record_contacts",
      title: "Select Contacts",
      options: topLevel.filter(
        (e) =>
          e.type === "REFERENCE" && e.entityName?.toUpperCase() === "CONTACT"
      ),
    },
    {
      name: "record_mails",
      title: "Select mail",
      options: topLevel.filter((e) => e.type === "EMAIL"),
    },
    {
      name: "record_roles",
      title: "Select Roles",
      options: topLevel.filter(
        (e) => e.type === "REFERENCE" && e.entityName?.toUpperCase() === "ROLE"
      ),
    },
    {
      name: "record_usergroups",
      title: "Select User group",
      options: topLevel.filter(
        (e) =>
          e.type === "REFERENCE" && e.entityName?.toUpperCase() === "USERGROUP"
      ),
    },
    {
      name: "record_contactroles",
      title: "Select Contact Role",
      options: topLevel.filter(
        (e) =>
          e.type === "REFERENCE" &&
          e.entityName?.toUpperCase() === "CONTACTROLE"
      ),
    },
    {
      name: "record_boundaries",
      title: "Select Geo boundaries",
      options: topLevel.filter((e) => e.type === "DESIGNER"),
    },
  ];

  const isCritireaExists = CONTEXT_RECIPIENTS.some((e) => e.options.length);

  const renderReferences = () => {
    return (
      <div
        style={{
          flexGrow: 1,
          contain: "strict",
          overflow: "hidden",
          overflowY: "auto",
          height: "100%",
        }}
        className="hide_scroll"
      >
        {isCritireaExists && (
          <div
            style={{ display: "flex", flexShrink: 1, flexDirection: "column" }}
          >
            <DisplayText
              style={{ fontSize: 16, fontWeight: 500, marginBottom: 10 }}
            >
              Notify {templateName} users
            </DisplayText>
            <DisplayGrid container spacing={2}>
              {CONTEXT_RECIPIENTS.map((r, i) => {
                const { name, options, title } = r;
                if (!options.length) return null;
                else
                  return (
                    <DisplayGrid
                      key={i}
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      xl={3}
                    >
                      <Controller
                        name={`context_recipients.${name}`}
                        defaultValue={[]}
                        render={({ field: { onClear, onChange, ...rest } }) => (
                          <DisplaySelect
                            label={title}
                            variant="outlined"
                            values={options}
                            labelKey={"title"}
                            valueKey={"name"}
                            disabled={!editable}
                            limitTags={3}
                            onClear={() => onChange("")}
                            onChange={onChange}
                            multiple
                            showNone={false}
                            hideFooterChips={true}
                            {...rest}
                          />
                        )}
                      />
                    </DisplayGrid>
                  );
              })}
            </DisplayGrid>
          </div>
        )}
        {REFERENCE_GROUP.map((rg, i) => {
          const { group_name, title, references } = rg;
          return (
            <div
              style={{
                display: "flex",
                minHeight: "40vh",
                flexDirection: "column",
                width: "100%",
              }}
              key={i}
            >
              <br />
              <DisplayDivider />
              <DisplayText
                style={{ fontSize: 16, fontWeight: 500, margin: "5px 0px" }}
              >
                {title}
              </DisplayText>
              <DisplayGrid container spacing={2} style={{ maginTop: "10px" }}>
                {references
                  .filter((e) =>
                    checkReadAccess({
                      appname: e.appName,
                      modulename: e.moduleName,
                      entityname: e.entityName,
                    })
                  )
                  .map((r, j) => {
                    return (
                      <DisplayGrid
                        item
                        key={j}
                        xs={12}
                        sm={12}
                        md={6}
                        lg={references.length > 2 ? 4 : 6}
                        xl={references.length > 2 ? 4 : 6}
                      >
                        <Controller
                          name={`${group_name}.${r.name}`}
                          render={({ field: { onChange } }) => (
                            <SystemReference
                              stateParams="NEW"
                              callbackError={(e) => {}}
                              callbackValue={(data) => {
                                onChange(data);
                              }}
                              data={get(
                                data,
                                `sys_entityAttributes.${group_name}.${r.name}`
                              )}
                              fieldmeta={{ ...r, disable: !editable }}
                            />
                          )}
                        />
                      </DisplayGrid>
                    );
                  })}
              </DisplayGrid>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexShrink: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            flexShrink: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <DisplayIcon name={Warning} systemVariant="secondary" /> &nbsp;
          <DisplayText align="center">
            Select any of the options below to complete the step *
          </DisplayText>
        </div>
        {isNJAdmin() && (
          <Controller
            name="sandbox"
            render={({ field: { value, ref, ...rest } }) => (
              <DisplaySwitch
                label="Test mode"
                labelPlacement="end"
                onlyValue={true}
                checked={Boolean(value)}
                inputRef={ref}
                value={value}
                {...rest}
              />
            )}
          />
        )}
      </div>
      <div style={{ flex: 9, display: "flex", flexDirection: "column" }}>
        {renderReferences()}
      </div>
    </div>
  );
};

export default RecipientContainer;
