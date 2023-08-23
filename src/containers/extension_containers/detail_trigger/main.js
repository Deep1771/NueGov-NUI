import React, { useContext, useEffect, useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { RecipientContainer, RuleContainer, MailConstructor } from "./steps";
import { get } from "lodash";
import {
  DisplayButton,
  DisplayDialog,
  DisplayStepper,
  DisplayStep,
  DisplayStepLabel,
} from "components/display_components";
import { CircleProgress } from "./utils/components";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { TriggerContext } from ".";
import { TRIGGER_QUERY } from "utils/constants/query";
import { useTriggerStyles } from "./utils/styles";
import { SystemIcons } from "utils/icons";

const DetailTrigger = (props) => {
  //context
  const [triggerState, dispatch] = useContext(TriggerContext);
  const { activeStep, mode, detailMode, template, data, editable } =
    triggerState;
  //Factory
  const { setBackDrop, closeBackDrop, setSnackBar } = GlobalFactory();
  const { isNJAdmin } = UserFactory();
  //Local states
  const [isLoading, setLoader] = useState(true);
  const [dialogProps, setDialogProps] = useState({ open: false });
  //utils
  const { ArrowBackIos, ArrowForwardIos, Close, Save } = SystemIcons;
  const classes = useTriggerStyles();

  //when component mounts for the first time
  const init = async () => {
    if (mode === "NEW") {
      setLoader(false);
    } else if (mode === "EDIT") {
      if (template) setLoader(false);
      else {
        try {
          let eInfo = data?.sys_entityAttributes?.entityInfo;
          let eParams = {
            appname: eInfo?.appName,
            modulename: eInfo?.moduleName,
            groupname: eInfo?.groupName,
          };
          if (isNJAdmin() && data?.sys_agencyId !== "No Agency")
            eParams = { ...eParams, agencyId: data?.sys_agencyId };
          let res = await entityTemplate.get(eParams);
          dispatch({
            type: "SET_TRIGGER_TEMPLATE",
            payload: res,
          });
          setLoader(false);
        } catch (e) {
          setLoader(false);
        }
      }
    }
  };

  const STEPS = [
    {
      label: "Create trigger rules",
      render: () => <RuleContainer />,
    },
    {
      label: "Construct Notification Template",
      render: () => <MailConstructor />,
    },
    {
      label: "Add recipients",
      render: () => <RecipientContainer />,
    },
  ];
  //Form
  const methods = useForm({
    defaultValues: data?.sys_entityAttributes,
    mode: "all",
  });

  const { trigger, getValues } = methods;

  const validateSave = (data) => {
    if (data?.sandbox) return true;
    else {
      let enableSave = false;
      [
        data?.context_recipients,
        data?.group_recipients,
        data?.custom_recipients,
      ].forEach((r) => {
        enableSave =
          enableSave || Object.entries(r || {}).some((e) => e[1]?.length > 0);
      });
      return enableSave;
    }
  };

  //Triggers only if there are no form errors
  const handleSave = async (formData) => {
    if (validateSave(formData)) {
      try {
        setBackDrop(mode === "NEW" ? "Saving..." : "Updating");
        let detailData = { ...data, sys_entityAttributes: formData };
        if (mode === "NEW") await entity.create(TRIGGER_QUERY, detailData);
        if (mode === "EDIT")
          await entity.update({ ...TRIGGER_QUERY, id: data._id }, detailData);
        closeBackDrop();
        props.onClose(true);
      } catch (e) {
        console.log("error in creating new document", e);
        closeBackDrop();
        props.onClose(true);
      }
    } else
      setSnackBar({
        message: "Select any options in Add recipients step to finish",
        severity: "info",
      });
  };

  //handlers
  const handleStep = (index) => {
    dispatch({
      type: "UPDATE_ACTIVE_STEP",
      payload: index,
    });
  };

  const validateStep = async (stepIndex) => {
    switch (stepIndex) {
      case 1: {
        let fieldNames = ["title", "entityInfo"];
        let rules = getValues("rules") || [];
        let rulesFields = [];
        rules.forEach((rule, ruleIndex) => {
          get(rule, "conditions", []).forEach((c, cIndex) => {
            let cField = `rules[${ruleIndex}].conditions[${cIndex}]`;
            rulesFields = [
              ...rulesFields,
              `${cField}.name`,
              `${cField}.operator`,
            ];
            let operatorValue = getValues(`${cField}.operator`);
            if (operatorValue) {
              if (operatorValue === "RANGE")
                rulesFields = [
                  ...rulesFields,
                  `${cField}.min`,
                  `${cField}.max`,
                ];
              else rulesFields = [...rulesFields, `${cField}.value`];
            }
          });
        });
        fieldNames = [...fieldNames, ...rulesFields];
        try {
          const noErrors = await trigger(fieldNames);
          if (noErrors) {
            if (
              rules.length ||
              Object.entries(getValues("record_actions") || {}).some(
                (e) => e[1]
              )
            )
              handleStep(stepIndex);
          } else
            setSnackBar({
              message: "Fill all the required fields",
              severity: "error",
            });
          return;
        } catch (e) {
          console.log(e);
          return;
        }
      }
      case 2: {
        const fieldNames = ["subject", "body"];
        const noErrors = await trigger(fieldNames);
        if (noErrors) handleStep(stepIndex);
        else
          setSnackBar({
            message: "Fill all the required fields",
            severity: "error",
          });
        return;
      }
      default:
        return false;
    }
  };

  //useEffects
  useEffect(() => {
    init();
  }, []);

  //renderers
  const renderStepper = useMemo(() => {
    return (
      <div className={classes.stepper}>
        <DisplayStepper
          alternativeLabel
          activeStep={activeStep}
          style={{ display: "flex", flex: 1 }}
        >
          {STEPS.map(({ label }, index) => {
            return (
              <DisplayStep key={label}>
                <DisplayStepLabel>{label}</DisplayStepLabel>
              </DisplayStep>
            );
          })}
        </DisplayStepper>
      </div>
    );
  }, [activeStep]);

  const renderDynamicContainer = () => {
    return (
      <div className={classes.dynamic_container}>
        <FormProvider {...methods}>
          <form
            className={classes.dynamic_container}
            onSubmit={methods.handleSubmit(handleSave)}
          >
            {STEPS.map(({ render }, i) => {
              return (
                <div
                  key={i}
                  style={{
                    display: activeStep === i ? "flex" : "none",
                    flex: 1,
                    flexDirection: "column",
                  }}
                >
                  {render()}
                </div>
              );
            })}
            {/* {
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                }}
              >
                {STEPS[activeStep].render()}
              </div>
            } */}
          </form>
        </FormProvider>
      </div>
    );
  };

  const renderFooterActions = () => {
    const STEPPER_BUTTONS = [
      {
        title: "PREV",
        disabled: activeStep === 0,
        onClick: () => handleStep(activeStep - 1),
        startIcon: <ArrowBackIos />,
      },
      {
        title: "NEXT",
        disabled: activeStep === 2,
        onClick: () => validateStep(activeStep + 1),
        endIcon: <ArrowForwardIos />,
      },
    ];
    return (
      <div className={classes.footer}>
        <div className={classes.l_actionbuttons}>
          {STEPPER_BUTTONS.map(({ title, ...buttonProps }) => {
            return (
              <DisplayButton key={title} variant="contained" {...buttonProps}>
                {title}
              </DisplayButton>
            );
          })}
        </div>
        <div className={classes.r_actionbuttons}>
          <DisplayButton
            // className={classes.back}
            startIcon={<Close />}
            variant="contained"
            systemVariant="secondary"
            onClick={() => {
              if (!editable) {
                props.onClose();
              } else
                setDialogProps({
                  testid: "triggerBack",
                  open: true,
                  title: "Are you sure?",
                  message: "Changes made will not be saved",
                  cancelLabel: "Continue",
                  confirmLabel: "Cancel",
                  onCancel: () => {
                    setDialogProps({ open: false });
                    props.onClose();
                  },
                  onConfirm: () => {
                    setDialogProps({ open: false });
                  },
                });
            }}
          >
            CLOSE
          </DisplayButton>
          {activeStep == 2 && editable && (
            <DisplayButton
              variant="contained"
              startIcon={<Save />}
              onClick={methods.handleSubmit(handleSave)}
            >
              Save
            </DisplayButton>
          )}
        </div>
      </div>
    );
  };

  if (!isLoading)
    return (
      <div className={classes.t_container}>
        {renderStepper}
        {renderDynamicContainer()}
        {renderFooterActions()}
        <DisplayDialog {...dialogProps} />
      </div>
    );
  else return <CircleProgress label="Loading..." />;
};

export default DetailTrigger;
