import React, { useMemo } from "react";
import { makeStyles, Link } from "@material-ui/core";
import { useFieldArray } from "react-hook-form";
import ConditionContainer from "./condition";
import {
  DisplayButton,
  DisplayIconButton,
  DisplayText,
} from "components/display_components";
import { SystemTypeFactory } from "utils/services/factory_services";
import { SystemIcons } from "utils/icons";

const useBuilderStyles = makeStyles({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  condition_row: {
    display: "flex",
    flexShrink: 1,
    width: "100%",
    flexDirection: "row",
  },
  condition_fields: {
    display: "flex",
    flex: 1,
  },
  condition_actions: {
    display: "flex",
    flexShrink: 1,
    alignSelf: "flex-start",
    marginTop: 10,
  },
});

const ConditionBuilder = (props) => {
  const { feature, template, parentField, context, data, disabled } = props;
  const { getAcceptedTypes } = SystemTypeFactory();
  const acceptedDirectives = useMemo(() => {
    return getAcceptedTypes(template, feature);
  }, [template?._id]);
  const classes = useBuilderStyles();
  const { RemoveOutline } = SystemIcons;
  //Form
  const { control } = context;
  const { fields, append, remove } = useFieldArray({
    control,
    name: parentField,
  });

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      {fields.map((field, index) => {
        if (!field.name || acceptedDirectives[field.name]) {
          return (
            <div key={field.id} className={classes.condition_row}>
              <div className={classes.condition_actions}>
                <DisplayIconButton
                  systemVariant="secondary"
                  disabled={disabled}
                  onClick={() => remove(index)}
                >
                  <RemoveOutline />
                </DisplayIconButton>
              </div>
              <div className={classes.condition_fields}>
                <ConditionContainer
                  fieldName={`${parentField}[${index}]`}
                  directives={acceptedDirectives}
                  context={context}
                  disabled={disabled}
                  field={field}
                />
              </div>
            </div>
          );
        } else
          return (
            <div
              key={field.id}
              className={classes.condition_row}
              style={{ marginLeft: 50 }}
            >
              <DisplayText>
                Condition field with name{" "}
                <b style={{ color: "red" }}>" {field.name} "</b> &nbsp; no
                longer exist in the template.
              </DisplayText>
              &nbsp;
              <Link
                component="button"
                color="secondary"
                disabled={disabled}
                onClick={() => remove(index)}
              >
                Click here to delete it from conditions
              </Link>
            </div>
          );
      })}
      <div
        style={{
          display: "flex",
          flexShrink: 1,
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <DisplayButton
          variant="contained"
          disabled={disabled}
          onClick={() =>
            append({
              name: null,
              operator: null,
              value: null,
              min: null,
              max: null,
              class: null,
              path: null,
            })
          }
        >
          Add Condition
        </DisplayButton>
      </div>
    </div>
  );
};

export default ConditionBuilder;
