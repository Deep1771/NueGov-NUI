import React, { useEffect, useContext } from "react";
import { SystemReference } from "components/system_components/reference";
import {
  DisplayGrid,
  DisplayAutocomplete,
  DisplayText,
  DisplayDivider,
  DisplaySelect,
} from "components/display_components";
import { Controller, useFormContext } from "react-hook-form";
import { REFERENCE_GROUP } from "../constants";
import { TriggerContext } from "..";
import { get } from "utils/services/helper_services/object_methods";
// import { useStateValue } from "utils/store/contexts";

const RecipientStep = () => {
  const [triggerState, dispatch] = useContext(TriggerContext);
  const { template, data } = triggerState;
  const topLevel = template?.sys_entityAttributes?.sys_topLevel || [];
  const { watch } = useFormContext();

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
      name: "record_boundary",
      title: "Select Boundary",
      options: topLevel.filter((e) => e.type === "DESIGNER"),
    },
  ];

  const isCritireaExists = CONTEXT_RECIPIENTS.some((e) => e.options.length);

  useEffect(() => {
    return () => {
      let formValues = watch();
      dispatch({
        type: "UPDATE_TRIGGER_FORM",
        payload: formValues,
      });
    };
  }, []);

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
        {REFERENCE_GROUP.map((rg, i) => {
          const { group_name, title, references } = rg;
          // console.log(references);
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
              <DisplayText style={{ fontSize: 16, fontWeight: 500 }}>
                {title}
              </DisplayText>
              <DisplayDivider />
              <br />
              <DisplayGrid container spacing={2} style={{ maginTop: "10px" }}>
                {references.map((r, j) => {
                  return (
                    <DisplayGrid
                      item
                      key={j}
                      xs={12}
                      sm={12}
                      md={6}
                      lg={4}
                      xl={4}
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
                            fieldmeta={r}
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
      {isCritireaExists && (
        <div
          style={{ display: "flex", flexShrink: 1, flexDirection: "column" }}
        >
          <DisplayText style={{ fontSize: 16, fontWeight: 500 }}>
            Notify Record references
          </DisplayText>
          <DisplayDivider />
          <DisplayGrid container spacing={2}>
            {CONTEXT_RECIPIENTS.map((r, i) => {
              const { name, options, title } = r;
              if (!options.length) return null;
              else
                return (
                  <DisplayGrid key={i} item xs={12} sm={6} md={4} lg={3} xl={3}>
                    <Controller
                      name={`context_recipients.${name}`}
                      defaultValue={[]}
                      // render={({ field: { onChange, value, ...rest } }) => (
                      //   <DisplayAutocomplete
                      //     style={{ display: "flex", flex: 1 }}
                      //     label={title}
                      //     limitTags={2}
                      //     variant="outlined"
                      //     options={options}
                      //     selectedKey={"name"}
                      //     labelKey={"title"}
                      //     onlyValue={true}
                      //     defaultValue={get(
                      //       data,
                      //       `sys_entityAttributes.context_recipients.${name}`
                      //     )}
                      //     multiple
                      //     onChange={onChange}
                      //     {...rest}
                      //   />
                      // )}
                      render={({ field: { onClear, onChange, ...rest } }) => (
                        <DisplaySelect
                          placeholder={title}
                          variant="outlined"
                          values={options}
                          labelKey={"title"}
                          valueKey={"name"}
                          limitTags={3}
                          variant="outlined"
                          onClear={() => onChange("")}
                          onChange={onChange}
                          multiple
                          showNone={false}
                          hideFooterChips={true}
                          // controlStyle={{ marginTop: 16 }}
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
      <div style={{ flex: 9, display: "flex", flexDirection: "column" }}>
        {renderReferences()}
      </div>

      {/* <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          marginTop: "10px",
        }}
      >
        <DisplayText style={{ fontSize: 16, fontWeight: 500 }}>
          Recipients
        </DisplayText>
        <DisplayDivider />
        <br />
        <DisplayGrid container spacing={2} style={{ maginTop: "10px" }}>
          {REFERENCES.map((r, i) => {
            return (
              <DisplayGrid item key={i} lg={4}>
                <Controller
                  name={r.name}
                  render={({ field: { onChange } }) => (
                    <SystemReference
                      stateParams="NEW"
                      callbackError={(e) => {}}
                      callbackValue={(data) => {
                        onChange(data);
                      }}
                      data={data?.sys_entityAttributes[r.name]}
                      fieldmeta={r}
                    />
                  )}
                />
              </DisplayGrid>
            );
          })}
        </DisplayGrid>
      </div> */}
    </div>
  );
};

export default RecipientStep;
