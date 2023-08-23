import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { SystemTypeFactory } from "utils/services/factory_services";
import {
  DisplayAutocomplete,
  DisplayInput,
  DisplayGrid,
  DisplayButton,
  DisplaySwitch,
  DisplayIconButton,
  DisplayDatePicker,
  DisplaySelect,
} from "components/display_components";
import { SystemIcons } from "utils/icons";
import { useFieldArray, Controller, useWatch } from "react-hook-form";
import { get } from "lodash";

const useStyles = makeStyles({
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
  const { context, name, feature, template, data } = props;
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = context;
  const [loadOperator, setloadOperator] = useState({});
  const [valueLoader, setValueLoader] = useState({});
  const classes = useStyles();
  const fieldName = `${name}.conditions`;
  const { fields, append, remove, prepend } = useFieldArray({
    control,
    name: fieldName,
  });
  const { getAcceptedTypes } = SystemTypeFactory();
  const acceptedDirectives = getAcceptedTypes(template, feature);

  const watchConditions = useWatch({
    control,
    name: fieldName,
    defaultValue: data || [],
  });

  const { RemoveOutline } = SystemIcons;

  const handleFieldChange = (v, index) => {
    setloadOperator({ ...loadOperator, [index]: true });
    const { directiveInfo, CLASS } = acceptedDirectives[v] || {};
    let path =
      directiveInfo?.mappingField &&
      JSON.parse(directiveInfo?.mappingField)?.path;

    setValue(`${fieldName}[${index}]`, {
      name: v,
      operator: undefined,
      value: undefined,
      min: undefined,
      max: undefined,
      class: CLASS,
      path,
    });
    setTimeout(() => {
      setloadOperator({
        ...loadOperator,
        [index]: false,
      });
    }, 100);
  };

  const handleOperatorChange = (v, index) => {
    setValueLoader({ ...valueLoader, [index]: true });
    setValue(`${fieldName}[${index}]`, {
      ...getValues(`${fieldName}[${index}]`),
      operator: v,
      value: null,
      min: undefined,
      max: undefined,
    });
    setTimeout(() => {
      setValueLoader({
        ...valueLoader,
        [index]: false,
      });
    }, 100);
  };

  const renderTypeIterator = (info, operator, i) => {
    const { dataFormat, filterFormat, directiveInfo } = info;
    const { mappingField } = directiveInfo;
    switch (dataFormat) {
      case "STRING": {
        switch (filterFormat) {
          case "STRING":
            return (
              <>
                <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      flexDirection: "column",
                    }}
                  >
                    <Controller
                      name={`${fieldName}[${i}].value`}
                      control={control}
                      defaultValue={watchConditions[i]?.value}
                      render={({ field: { onChange, ...rest } }) => (
                        <DisplayInput
                          style={{ marginTop: 16, flex: 1, display: "flex" }}
                          label={"Enter Value"}
                          variant="outlined"
                          defaultValue={watchConditions[i]?.value || ""}
                          onChange={onChange}
                          {...rest}
                        />
                      )}
                    />
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Controller
                        name={`${fieldName}[${i}].strict_match`}
                        defaultValue={watchConditions[i]?.strict_match || true}
                        render={({ field: { value, ...props } }) => (
                          <DisplaySwitch
                            label="strict match"
                            labelPlacement="end"
                            onlyValue={true}
                            checked={value}
                            value={value}
                            {...props}
                          />
                        )}
                      />
                    </div>
                  </div>
                </DisplayGrid>
              </>
            );

          case "ARRAY": {
            try {
              const { arrayKey, labelKey, valueKey } =
                mappingField && JSON.parse(mappingField);

              let multiple = operator !== "EQUALS";
              const val = watchConditions[i]?.value;
              const defVal = !multiple ? val : val || [];
              // const getVal = (filledVal) =>
              //   multiple
              //     ? filledVal
              //     : info[arrayKey].find((e) => e[valueKey] === filledVal);
              // let defValue = getVal(val);

              return (
                <>
                  <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
                    <Controller
                      name={`${fieldName}[${i}].value`}
                      control={control}
                      defaultValue={defVal}
                      render={({
                        field: { onClear, onChange, value, ...rest },
                      }) => (
                        <DisplaySelect
                          placeholder="Select Value"
                          variant="outlined"
                          values={info[arrayKey]}
                          labelKey={labelKey}
                          valueKey={valueKey}
                          limitTags={3}
                          onClear={() => onChange("")}
                          onChange={onChange}
                          multiple={multiple}
                          showNone={false}
                          value={defVal}
                          hideFooterChips={true}
                          controlStyle={{ marginTop: 16 }}
                          {...rest}
                        />
                      )}
                    />

                    {/* <Controller
                      name={`${fieldName}[${i}].value`}
                      control={control}
                      defaultValue={watchConditions[i]?.operator}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <DisplayAutocomplete
                          style={{ display: "flex", flex: 1 }}
                          label={"Select Value"}
                          variant="outlined"
                          limitTags={2}
                          options={info[arrayKey]}
                          labelKey={labelKey}
                          selectedKey={valueKey}
                          onlyValue={true}
                          multiple={multiple}
                          defaultValue={defValue}
                          value={getVal(val)}
                          onChange={onChange}
                          {...rest}
                        />
                      )}
                    /> */}
                  </DisplayGrid>
                </>
              );
            } catch (e) {
              console.log("errro in", e);
            }
          }

          default:
            return null;
        }
      }

      case "NUMBER": {
        switch (operator) {
          case "EQUALS": {
            return (
              <>
                <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
                  <Controller
                    name={`${fieldName}[${i}].value`}
                    control={control}
                    defaultValue={watchConditions[i]?.value}
                    render={({ field: { onChange, ...rest } }) => (
                      <DisplayInput
                        style={{ display: "flex", flex: 1, marginTop: 16 }}
                        label={"Enter Value"}
                        variant="outlined"
                        type="NUMBER"
                        defaultValue={watchConditions[i]?.value}
                        onChange={onChange}
                        {...rest}
                      />
                    )}
                  />
                </DisplayGrid>
              </>
            );
          }

          case "RANGE": {
            return (
              <>
                <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
                  <div
                    style={{ flex: 1, display: "flex", flexDirection: "row" }}
                  >
                    <Controller
                      name={`${fieldName}[${i}].min`}
                      control={control}
                      defaultValue={watchConditions[i]?.min}
                      render={({ field: { onChange, ...rest } }) => (
                        <DisplayInput
                          style={{
                            display: "flex",
                            flex: 1,
                            marginTop: 16,
                            marginRight: 5,
                          }}
                          label={"Enter min value"}
                          placeholder={"Min Value"}
                          variant="outlined"
                          type="NUMBER"
                          defaultValue={watchConditions[i]?.min || ""}
                          onChange={onChange}
                          {...rest}
                        />
                      )}
                    />
                    <Controller
                      name={`${fieldName}[${i}].max`}
                      control={control}
                      defaultValue={watchConditions[i]?.max}
                      render={({ field: { onChange, ...rest } }) => (
                        <DisplayInput
                          style={{ display: "flex", flex: 1, marginTop: 16 }}
                          label={"Enter max value"}
                          placeholder={"Max Value"}
                          variant="outlined"
                          type="NUMBER"
                          defaultValue={watchConditions[i]?.max || ""}
                          onChange={onChange}
                          {...rest}
                        />
                      )}
                    />
                  </div>
                </DisplayGrid>
              </>
            );
          }

          default:
            return null;
        }
      }

      case "DATE": {
        switch (operator) {
          case "EQUALS": {
            return (
              <>
                <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
                  <Controller
                    name={`${fieldName}[${i}].value`}
                    control={control}
                    defaultValue={watchConditions[i]?.value}
                    render={({ field: { onChange, ...rest } }) => (
                      <DisplayDatePicker
                        style={{ display: "flex", flex: 1, marginTop: 16 }}
                        label={"Select Date"}
                        inputVariant="outlined"
                        defaultValue={watchConditions[i]?.value}
                        onChange={onChange}
                        {...rest}
                      />
                    )}
                  />
                </DisplayGrid>
              </>
            );
          }

          case "RANGE": {
            return (
              <>
                <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
                  <div
                    style={{ flex: 1, display: "flex", flexDirection: "row" }}
                  >
                    <Controller
                      name={`${fieldName}[${i}].min`}
                      control={control}
                      defaultValue={watchConditions[i]?.min}
                      render={({ field: { onChange, ...rest } }) => (
                        <DisplayDatePicker
                          style={{
                            display: "flex",
                            flex: 1,
                            marginTop: 16,
                            marginRight: 5,
                          }}
                          label={"Enter from date"}
                          placeholder={"From Date"}
                          inputVariant="outlined"
                          // defaultValue={watchConditions[i]?.min || undefined}
                          onChange={onChange}
                          {...rest}
                        />
                      )}
                    />
                    <Controller
                      name={`${fieldName}[${i}].max`}
                      control={control}
                      defaultValue={watchConditions[i]?.max}
                      render={({ field: { onChange, ...rest } }) => (
                        <DisplayDatePicker
                          style={{ display: "flex", flex: 1, marginTop: 16 }}
                          label={"Enter to date"}
                          placeholder={"To Date"}
                          minDate={watchConditions[i]?.min}
                          inputVariant="outlined"
                          // defaultValue={watchConditions[i]?.max || undefined}
                          onChange={onChange}
                          {...rest}
                        />
                      )}
                    />
                  </div>
                </DisplayGrid>
              </>
            );
          }

          default:
            return null;
        }
      }

      case "CUSTOM": {
        try {
          const { options, labelKey, valueKey } =
            mappingField && JSON.parse(mappingField);
          return (
            <>
              <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
                <Controller
                  name={`${fieldName}[${i}].value`}
                  control={control}
                  defaultValue={watchConditions[i]?.value || []}
                  render={({
                    field: { onClear, onChange, value, ...rest },
                  }) => (
                    <DisplaySelect
                      placeholder="Select Value"
                      variant="outlined"
                      values={options}
                      labelKey={labelKey}
                      valueKey={valueKey}
                      limitTags={3}
                      onClear={() => onChange("")}
                      onChange={onChange}
                      multiple
                      showNone={false}
                      hideFooterChips={true}
                      value={value || []}
                      controlStyle={{ marginTop: 16 }}
                      {...rest}
                    />
                  )}
                  // render={({ field: { onChange, value, ...rest } }) => (
                  //   <DisplayAutocomplete
                  //     style={{ display: "flex", flex: 1 }}
                  //     label={"Select Value"}
                  //     variant="outlined"
                  //     limitTags={2}
                  //     options={options}
                  //     labelKey={labelKey}
                  //     selectedKey={valueKey}
                  //     onlyValue={true}
                  //     multiple={true}
                  //     defaultValue={watchConditions[i]?.value}
                  //     onChange={onChange}
                  //     {...rest}
                  //   />
                  // )}
                />
              </DisplayGrid>
            </>
          );
        } catch (e) {
          console.log("error in custom type ====>", e);
        }
      }
      default:
        return null;
    }
  };

  return (
    <div className={classes.container}>
      {fields.map((item, index) => {
        const { name, operator } = watchConditions[index] || {};
        let formatInfo = name && acceptedDirectives[name];
        let fieldErrors = get(errors, `${fieldName}[${index}]`);
        return (
          <div key={item.id} className={classes.condition_row}>
            <div className={classes.condition_actions}>
              <DisplayIconButton
                systemVariant="secondary"
                onClick={() => remove(index)}
              >
                <RemoveOutline />
              </DisplayIconButton>
            </div>
            <div className={classes.condition_fields}>
              <DisplayGrid container spacing={2}>
                <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
                  <Controller
                    name={`${fieldName}[${index}].name`}
                    control={control}
                    rules={{ required: true }}
                    // defaultValue={watchConditions[index]?.name}
                    render={({ field: { onChange, value, ...rest } }) => (
                      <DisplayAutocomplete
                        error={get(fieldErrors, "name", false)}
                        style={{ display: "flex", flex: 1 }}
                        label={"Select field"}
                        variant="outlined"
                        options={Object.keys(acceptedDirectives)}
                        getOptionLabel={(option) =>
                          acceptedDirectives[option].title
                        }
                        onlyValue={true}
                        defaultValue={name}
                        onChange={(v) => {
                          handleFieldChange(v, index);
                        }}
                        helperText={
                          get(fieldErrors, "name", false) &&
                          "This field is required"
                        }
                        {...rest}
                      />
                    )}
                  />
                </DisplayGrid>
                {!loadOperator[index] && name && (
                  <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
                    <Controller
                      name={`${fieldName}[${index}].operator`}
                      control={control}
                      rules={{ required: true }}
                      // defaultValue={watchConditions[index]?.operator}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <DisplayAutocomplete
                          error={get(fieldErrors, "operator", false)}
                          style={{ display: "flex", flex: 1 }}
                          label={"Select operator"}
                          labelKey={"title"}
                          selectedKey={"name"}
                          variant="outlined"
                          defaultValue={(formatInfo?.operators || []).find(
                            (e) => e.name === operator
                          )}
                          onlyValue={true}
                          options={formatInfo?.operators}
                          onChange={(v) => handleOperatorChange(v, index)}
                          helperText={
                            get(fieldErrors, "operator", false) &&
                            "This field is required"
                          }
                          {...rest}
                        />
                      )}
                    />
                  </DisplayGrid>
                )}
                {!valueLoader[index] &&
                  operator &&
                  renderTypeIterator(formatInfo, operator, index)}
              </DisplayGrid>
            </div>
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
