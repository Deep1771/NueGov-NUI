import React, { useEffect, useContext, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { get } from "lodash";
import ConditionBuilder from "components/helper_components/condition_builder/new_builder";
import { CircleProgress } from "../../utils/components";
import { Banner } from "components/helper_components";
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
  DisplayIcon,
} from "components/display_components";
import { TriggerContext } from "../..";
import { entityTemplate } from "utils/services/api_services/template_service";
import { UserFactory } from "utils/services/factory_services";
import { useRuleStyles } from "../../utils/styles";
import { SystemIcons } from "utils/icons";

const RuleBuilder = () => {
  //context
  const [triggerState, dispatch] = useContext(TriggerContext);
  const { data, template, editable } = triggerState;
  //Factory
  const { isNJAdmin } = UserFactory();
  //Local states
  const [isMounted, setMounted] = useState(false);
  const [isLoading, setLoader] = useState(false);
  //utils
  const classes = useRuleStyles();
  const { ExpandMore, Delete, Warning } = SystemIcons;

  //Form
  const formContext = useFormContext();
  const { control, setValue, getValues } = formContext;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  //form watchers
  const stampAgency = useWatch({
    control,
    name: "stampagency",
  });
  const entityInfo = useWatch({
    control,
    name: "entityInfo",
  });

  // const watchRules = useWatch({
  //   control,
  //   name: "rules",
  // });

  //fetches template
  const fetchTemplate = async () => {
    setLoader(true);
    dispatch({
      type: "SET_TRIGGER_TEMPLATE",
      payload: null,
    });
    setValue("rules", []);
    if (entityInfo) {
      try {
        let eParams = {
          appname: entityInfo?.appName,
          modulename: entityInfo?.moduleName,
          groupname: entityInfo?.groupName,
        };
        if (isNJAdmin() && stampAgency?.id)
          eParams = { ...eParams, agencyId: stampAgency?.id };
        let res = await entityTemplate.get(eParams);
        dispatch({
          type: "SET_TRIGGER_TEMPLATE",
          payload: res,
        });
        setLoader(false);
      } catch (e) {}
    } else setLoader(false);
  };

  //useEffect
  useEffect(() => {
    if (isMounted) fetchTemplate();
    return () => {};
  }, [stampAgency, entityInfo]);

  useEffect(() => {
    setMounted(true);
    return () => {};
  }, []);

  //renderers
  const renderMain = () => {
    return (
      <DisplayGrid container direction="row" alignItems="center">
        <DisplayGrid item xs={12} sm={12} md={6} lg={6} xl={6}>
          <div
            style={{
              flexShrink: 1,
              display: "flex",
              alignItems: "flex-end",
              flexDirection: "row",
            }}
          >
            <DisplayIcon name={Warning} systemVariant="secondary" /> &nbsp;
            <DisplayText align="center">
              Select either <b> record level actions</b> shown below or add
              <b> custom rules</b> * <br />
            </DisplayText>
          </div>
          <div className={classes.record_actions}>
            <DisplayText>
              <b> Notify when record : </b>&nbsp;
            </DisplayText>
            <DisplayFormGroup row>
              {["inserted", "updated", "deleted"].map((val, i) => (
                <Controller
                  name={`record_actions.${val}`}
                  key={val}
                  render={({ field: { checked, value, ref, ...rest } }) => (
                    <DisplayCheckbox
                      label={val.toUpperCase()}
                      checked={Boolean(value)}
                      value={value}
                      disabled={!editable}
                      inputRef={ref}
                      {...rest}
                    />
                  )}
                />
              ))}
            </DisplayFormGroup>
          </div>
        </DisplayGrid>
        <DisplayGrid item xs={12} sm={12} md={6} lg={6} xl={6}>
          <div className={classes.execute_section}>
            <DisplayText>Execute when &nbsp;</DisplayText>
            <Controller
              name="executeOn"
              defaultValue="ANY"
              render={({ field: { onChange, ref, ...rest } }) => (
                <DisplaySelect
                  placeholder="Any/All"
                  variant="outlined"
                  values={[
                    { name: "Any ( OR )", value: "ANY" },
                    { name: "All ( AND )", value: "ALL" },
                  ]}
                  labelKey="name"
                  valueKey="value"
                  inputRef={ref}
                  disabled={!editable}
                  // onClear={() => onChange("")}
                  onChange={onChange}
                  showNone={false}
                  style={{ width: "150px" }}
                  {...rest}
                />
              )}
            />
            <DisplayText> &nbsp; rules are met &nbsp; </DisplayText>
            <DisplayButton
              variant="contained"
              disabled={!editable}
              onClick={() => {
                append({
                  title: `Rule ${fields.length + 1}`,
                  active: true,
                  conditions: [],
                  executeOn: "ALL",
                });
              }}
            >
              Add Rule
            </DisplayButton>
          </div>
        </DisplayGrid>
      </DisplayGrid>
    );
  };

  const renderRuleBuilder = () => {
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
        {fields.map(({ id, ...field }, index) => {
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
                  Rule {index + 1}
                  {/* {watchRules[index]?.title || getValues(`rules${index}.title`)} */}
                </DisplayText>
                <div style={{ display: "flex" }}>
                  <Controller
                    name={`rules[${index}].active`}
                    defaultValue={true}
                    render={({ field: { value, ref, ...rest } }) => (
                      <DisplaySwitch
                        label="active"
                        labelPlacement="end"
                        onlyValue={true}
                        disabled={!editable}
                        inputRef={ref}
                        checked={Boolean(value)}
                        value={value}
                        {...rest}
                      />
                    )}
                  />
                  <DisplayIconButton
                    systemVariant="secondary"
                    disabled={!editable}
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
                        defaultValue={`Rule ${index + 1}`}
                        render={({ field: { onChange, ref, ...rest } }) => (
                          <DisplayInput
                            placeholder="Enter Rule title"
                            label="Rule title"
                            onChange={onChange}
                            variant="outlined"
                            disabled={!editable}
                            inputRef={ref}
                            onClear={() => onChange("")}
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
                        render={({ field: { onChange, ref, ...rest } }) => (
                          <DisplaySelect
                            placeholder="Any/All"
                            variant="outlined"
                            values={[
                              { name: "Any ( OR )", value: "ANY" },
                              { name: "All ( AND )", value: "ALL" },
                            ]}
                            disabled={!editable}
                            labelKey="name"
                            inputRef={ref}
                            valueKey="value"
                            // onClear={() => onChange("")}
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
                    parentField={`rules[${index}].conditions`}
                    context={formContext}
                    template={template}
                    feature="NOTIFICATION"
                    disabled={!editable}
                    data={get(
                      data,
                      `sys_entityAttributes.rules[${index}].conditions`,
                      []
                    )}
                  />
                </DisplayGrid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    );
  };

  if (!isLoading) {
    if (entityInfo) {
      return (
        <div className={classes.r_container}>
          {template && Object.keys(template).length ? (
            <>
              <div className={classes.m_container}>{renderMain()}</div>
              <br />
              <div className={classes.c_container}>{renderRuleBuilder()}</div>
            </>
          ) : (
            <Banner msg="Template not found" />
          )}
        </div>
      );
    } else
      return (
        <Banner
          msg="Start the process by selecting entity"
          iconSize={350}
          src="https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/startprocess.svg"
        />
      );
  } else return <CircleProgress label="Loading rules..." />;
};

export default RuleBuilder;
