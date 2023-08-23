import React, { useState, useContext, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TriggerRules from "./trigger_step";
import TemplateStep from "./template_step";
import RecipientStep from "./recepient_step";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import {
  DisplayButton,
  DisplayDialog,
  DisplayStepButton,
  DisplayStepper,
  DisplayStep,
  DisplayStepLabel,
} from "components/display_components";
import { TriggerContext } from ".";
import { SystemIcons } from "utils/icons";
import { TRIGGER_QUERY } from "utils/constants/query";
import { entity } from "utils/services/api_services/entity_service";
import { GlobalFactory } from "utils/services/factory_services";

const useTriggerStyles = makeStyles({
  tContainer: {
    flex: 1,
    display: "flex",
    backgroundColor: "#fff",
    flexDirection: "column",
    margin: 16,
  },
  stepper: {
    display: "flex",
    flexShrink: 1,
  },
  dynamicContainer: {
    display: "flex",
    flex: 9,
    padding: "0px 20px",
    flexDirection: "column",
  },
  footer: {
    display: "flex",
    flexShrink: 1,
    flexDirection: "row",
    // backgroundColor: "#f6f6f6",
  },
});

const TriggerContainer = (props) => {
  const [dialogProps, setDialogProps] = useState({ open: false });
  const [triggerState, dispatch] = useContext(TriggerContext);
  const { setBackDrop, closeBackDrop } = GlobalFactory();
  const { data, stepper, mode } = triggerState;
  const { activeStep } = stepper;
  const { ArrowBackIos, ArrowForwardIos } = SystemIcons;
  const methods = useForm({
    defaultValues: data?.sys_entityAttributes,
    mode: "all",
  });
  console.log("Global State ====>", triggerState);
  const { control, watch, trigger } = methods;
  const entityDetails = useWatch({
    control,
    defaultValue: "default",
  });
  console.log("Form Watch ====>", entityDetails);

  const onSubmit = async (formData) => {
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
  };
  const classes = useTriggerStyles();

  useEffect(() => {
    return () => {};
  }, []);

  const enableStep = (step_num) => {
    const {
      rules,
      record_actions,
      context_recipients,
      custom_recipients,
      group_recipients,
      subject,
      body,
    } = entityDetails;
    switch (step_num) {
      case 1: {
        if (record_actions)
          return Object.entries(record_actions).some((e) => e[1]);
        else if (rules?.length) {
          return !rules.some((e) => {
            return !e?.conditions.length;
          });
        } else return false;
      }
      case 2: {
        return subject && body;
      }
      case 3: {
        return (
          Object.entries(context_recipients || {}).some((e) => e[1]) ||
          Object.entries(group_recipients || {}).some((e) => e[1]) ||
          Object.entries(custom_recipients || {}).some((e) => e[1])
        );
      }

      default:
        return null;
    }
  };

  const STEPS = [
    {
      label: "Create trigger rules",
      render: () => <TriggerRules />,
    },
    {
      label: "Construct Notification Template",
      disabled: !enableStep(1),
      render: () => <TemplateStep />,
    },
    {
      label: "Add recipients",
      disabled: !enableStep(2),
      render: () => <RecipientStep />,
    },
  ];

  const handleStep = (index) => {
    dispatch({
      type: "UPDATE_ACTIVE_STEP",
      payload: index,
    });
  };

  const renderStepper = () => {
    return (
      <div className={classes.stepper}>
        <DisplayStepper
          nonLinear
          alternativeLabel
          activeStep={activeStep}
          style={{ display: "flex", flex: 1 }}
        >
          {STEPS.map(({ label, disabled }, index) => {
            return (
              <DisplayStep key={label}>
                <DisplayStepButton
                  disabled={disabled}
                  onClick={() => handleStep(index)}
                  completed={activeStep > index}
                >
                  <DisplayStepLabel>{label}</DisplayStepLabel>
                </DisplayStepButton>
              </DisplayStep>
            );
          })}
        </DisplayStepper>
      </div>
    );
  };

  const renderDynamicContainer = () => {
    return (
      <div className={classes.dynamicContainer}>
        <FormProvider {...methods}>
          <form
            className={classes.dynamicContainer}
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            {STEPS[activeStep].render()}
            {/* {activeStep === 0 && <TriggerRules />}
            {activeStep === 1 && <TemplateStep />}
            {activeStep === 2 && <RecipientStep />} */}
          </form>
        </FormProvider>
      </div>
    );
  };

  const renderFooterActions = () => {
    return (
      <div className={classes.footer}>
        <div style={{ display: "flex", flex: 8 }}>
          <DisplayButton
            variant="contained"
            onClick={() => handleStep(activeStep - 1)}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIos />}
          >
            PREV
          </DisplayButton>{" "}
          &nbsp; &nbsp;
          <DisplayButton
            variant="contained"
            disabled={activeStep == 2 || !enableStep(activeStep + 1)}
            onClick={() => handleStep(activeStep + 1)}
            // onClick={() => trigger(["title", "entityInfo", "rules"])}
            endIcon={<ArrowForwardIos />}
          >
            NEXT
          </DisplayButton>
        </div>
        {activeStep === 2 && (
          <div style={{ display: "flex", flex: 4, justifyContent: "flex-end" }}>
            <DisplayButton
              variant="contained"
              disabled={!enableStep(3)}
              onClick={methods.handleSubmit(onSubmit)}
            >
              Save
            </DisplayButton>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={classes.tContainer}>
      {renderStepper()}
      {renderDynamicContainer()}
      {renderFooterActions()}
      <DisplayButton
        style={{ position: "absolute", left: 16, top: 16 }}
        onClick={() => {
          setDialogProps({
            testid: "triggerBack",
            open: true,
            title: "Are you sure you want to go back?",
            message: "Changes made will not be saved",
            cancelLabel: "Yes, Cancel",
            confirmLabel: "Continue",
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
        <ArrowBackIos /> BACK
      </DisplayButton>
      {<DisplayDialog {...dialogProps} />}
    </div>
  );
};

export default TriggerContainer;
