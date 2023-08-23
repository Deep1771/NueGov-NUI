import React, { useEffect, useContext } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  useFormContext,
  Controller,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import {
  DisplaySwitch,
  DisplayInput,
  DisplayButton,
  DisplayFormGroup,
  DisplayGrid,
  DisplayCheckbox,
  DisplayText,
  DisplayIconButton,
  DisplaySelect,
  DisplayDivider,
} from "components/display_components";
import { SystemIcons } from "utils/icons";
import { get } from "utils/services/helper_services/object_methods";
import ConditionBuilder from "components/helper_components/condition_builder/builder";
import { TriggerContext } from "..";

const useStyles = makeStyles({
  expanded: {},
  root: {
    display: "flex",
    backgroundColor: "#ddd",
    minHeight: "48px",
    margin: "0px",
    "&$expanded": {
      minHeight: "48px",
      margin: "0px",
    },
  },
  content: {
    margin: "0px",
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    "&$expanded": {
      minHeight: "48px",
      margin: "0px",
    },
  },
});

const RuleBuilder = () => {
  const formContext = useFormContext({ shouldUnregister: false });
  const [triggerState] = useContext(TriggerContext);
  const { template, data } = triggerState;

  const { control, setValue } = formContext;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });
  const { ExpandMore, Delete } = SystemIcons;
  const classes = useStyles();
  const templateExists = useWatch({
    control,
    name: "entityInfo",
    defaultValue: undefined,
  });
  const updateRules = useWatch({
    control,
    name: "rules",
    defaultValue: data?.sys_entityAttributes?.rules || [],
  });

  useEffect(() => {
    if (data?.sys_entityAttributes?.entityInfo?.name !== templateExists?.name)
      setValue("rules", []);
  }, [templateExists?.name]);

  const renderRules = () => {
    return (
      <div
        style={{
          flexGrow: 1,
          contain: "strict",
          overflow: "hidden",
          overflowY: "auto",
          height: "100%",
        }}
        class="hide_scroll"
      >
        {fields.map(({ id, title }, index) => {
          const ruleDefault = "Rule " + (index + 1);
          return (
            <Accordion
              key={id}
              style={{
                width: "100%",
                display: "flex",
                margin: "10px 0px",
                flexDirection: "column",
              }}
            >
              <AccordionSummary
                classes={{
                  content: classes.content,
                  expanded: classes.expanded,
                  root: classes.root,
                }}
                expandIcon={<ExpandMore />}
              >
                <DisplayText style={{ fontSize: "16px", fontWeight: 500 }}>
                  {updateRules[index]?.title}
                </DisplayText>
                <div style={{ display: "flex" }}>
                  <Controller
                    name={`rules[${index}].active`}
                    defaultValue={updateRules[index]?.active || true}
                    render={({ field: { value, ...props } }) => (
                      <DisplaySwitch
                        label="active"
                        labelPlacement="end"
                        onlyValue={true}
                        checked={value}
                        value={value}
                        {...props}
                      />
                    )}
                  />
                  <DisplayIconButton
                    systemVariant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(index);
                    }}
                  >
                    <Delete />
                  </DisplayIconButton>
                </div>
              </AccordionSummary>
              <AccordionDetails style={{ padding: "20px" }}>
                <DisplayGrid container>
                  <DisplayGrid item xs={12} sm={12} md={4} lg={6} xl={6}>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Controller
                        name={`rules[${index}].title`}
                        defaultValue={ruleDefault}
                        render={({ field: { onChange, onClear, ...rest } }) => (
                          <DisplayInput
                            placeholder="Enter Rule title"
                            label="Rule title"
                            onChange={onChange}
                            variant="outlined"
                            onClear={() => onChange(ruleDefault)}
                            style={{ width: "250px", marginRight: "10px" }}
                            {...rest}
                          />
                        )}
                      />
                    </div>
                  </DisplayGrid>
                  <DisplayGrid item xs={12} sm={12} md={8} lg={6} xl={6}>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <DisplayText>Execute when &nbsp;</DisplayText>
                      <Controller
                        name={`rules[${index}].executeOn`}
                        defaultValue="ALL"
                        render={({ field: { onClear, onChange, ...rest } }) => (
                          <DisplaySelect
                            placeholder="Any/All"
                            variant="outlined"
                            values={[
                              { name: "Any ( OR )", value: "ANY" },
                              { name: "All ( AND )", value: "ALL" },
                            ]}
                            labelKey="name"
                            valueKey="value"
                            onClear={() => onChange("")}
                            onChange={onChange}
                            showNone={false}
                            style={{ width: "150px" }}
                            {...rest}
                          />
                        )}
                      />
                      <DisplayText>
                        {" "}
                        &nbsp; conditions are met &nbsp;{" "}
                      </DisplayText>
                    </div>
                  </DisplayGrid>
                  <br />
                  <br />
                  <DisplayText
                    style={{
                      marginTop: "10px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Conditions
                  </DisplayText>
                  <DisplayDivider />
                  <br />

                  <ConditionBuilder
                    name={`rules[${index}]`}
                    context={formContext}
                    template={template}
                    feature="NOTIFICATION"
                    data={
                      (data?.sys_entityAttributes?.rules &&
                        data?.sys_entityAttributes?.rules[index]?.conditions) ||
                      []
                    }
                  />
                </DisplayGrid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    );
  };
  if (templateExists)
    return (
      <div
        style={{
          display: "flex",
          flex: 9,
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexShrink: 1,
            flexDirection: "row",
          }}
        >
          <DisplayGrid container>
            <DisplayGrid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <DisplayText>
                  <b> Notify when record : </b>&nbsp;
                </DisplayText>
                <DisplayFormGroup row>
                  {["inserted", "updated", "deleted"].map((val, i) => (
                    <Controller
                      name={`record_actions.${val}`}
                      key={val}
                      render={({ field: { checked, value, ...props } }) => (
                        <DisplayCheckbox
                          label={val}
                          checked={value}
                          value={value}
                          {...props}
                        />
                      )}
                    />
                  ))}
                </DisplayFormGroup>
              </div>
            </DisplayGrid>
            <DisplayGrid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <DisplayText>Execute when &nbsp;</DisplayText>
                <Controller
                  name="executeOn"
                  defaultValue="ANY"
                  render={({ field: { onClear, onChange, ...rest } }) => (
                    <DisplaySelect
                      placeholder="Any/All"
                      variant="outlined"
                      values={[
                        { name: "Any ( OR )", value: "ANY" },
                        { name: "All ( AND )", value: "ALL" },
                      ]}
                      labelKey="name"
                      valueKey="value"
                      onClear={() => onChange("")}
                      onChange={onChange}
                      showNone={false}
                      style={{ width: "150px" }}
                      {...rest}
                    />
                  )}
                />
                <DisplayText> &nbsp; rules are met &nbsp; </DisplayText>
                <DisplayButton variant="contained" onClick={() => append({})}>
                  Add Rule
                </DisplayButton>
              </div>
            </DisplayGrid>
          </DisplayGrid>
        </div>
        <div
          style={{
            display: "flex",
            flex: 9,
            flexDirection: "column",
          }}
        >
          {template && renderRules()}
        </div>
      </div>
    );
  else return null;
};

export default RuleBuilder;
