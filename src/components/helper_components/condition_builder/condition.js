import React, { useState, useEffect } from "react";
import { Controller, useWatch } from "react-hook-form";
import {
  DisplayAutocomplete,
  DisplayInput,
  DisplayGrid,
  DisplaySwitch,
  DisplayDatePicker,
  DisplaySelect,
} from "components/display_components";

const ConditionContainer = (props) => {
  const { fieldName, directives, context, disabled, field } = props;
  const { control, setValue, getValues } = context;
  const [isMounted, setMounted] = useState(false);
  const [loadOperator, setLoadOperator] = useState(false);
  const [valueLoader, setValueLoader] = useState(false);
  const requiredMsg = "This field is required";
  const directiveName = useWatch({
    control,
    name: `${fieldName}.name`,
  });

  const operatorWatch = useWatch({
    control,
    name: `${fieldName}.operator`,
  });

  const watchValues = useWatch({
    control,
    name: [`${fieldName}.min`, `${fieldName}.max`, `${fieldName}.value`],
  });

  useEffect(() => {
    if (isMounted) {
      setLoadOperator(true);
      const { directiveInfo, CLASS } = directives[directiveName] || {};
      let path =
        directiveInfo?.mappingField &&
        JSON.parse(directiveInfo?.mappingField)?.path;
      if (operatorWatch) {
        if (directiveName)
          setValue(`${fieldName}`, {
            operator: null,
            class: CLASS,
            path,
          });
      } else setLoadOperator(false);
    }
    return () => {};
  }, [directiveName]);

  useEffect(() => {
    if (isMounted) {
      setValueLoader(true);
      if (directiveName) setLoadOperator(false);
      if (watchValues.some((e) => e)) {
        if (operatorWatch) {
          setValue(fieldName, {
            min: null,
            max: null,
            value: null,
          });
        }
      } else setValueLoader(false);
    }
    return () => {};
  }, [operatorWatch]);

  useEffect(() => {
    if (isMounted && operatorWatch) setValueLoader(false);
    return () => {};
  }, [watchValues]);

  useEffect(() => {
    setMounted(true);
    return () => {};
  }, []);

  const renderTypeIterator = () => {
    let name = getValues(`${fieldName}.name`) || field?.name;
    let directiveObj = directives[name];
    const { dataFormat, filterFormat, directiveInfo } = directiveObj;
    const { mappingField } = directiveInfo;
    let operator = getValues(`${fieldName}.operator`) || field?.operator;

    switch (dataFormat) {
      case "STRING": {
        switch (filterFormat) {
          case "STRING": {
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
                      name={`${fieldName}.value`}
                      control={control}
                      key={`${fieldName}.string.value`}
                      rules={{ required: requiredMsg }}
                      render={({
                        field: { onChange, ref, value, ...rest },
                        fieldState: { error },
                      }) => (
                        <DisplayInput
                          style={{ marginTop: 16, flex: 1, display: "flex" }}
                          label={"Enter Value"}
                          variant="outlined"
                          defaultValue={value || ""}
                          value={value || ""}
                          disabled={disabled}
                          inputRef={ref}
                          onChange={onChange}
                          // onClear={() => onChange("")}
                          error={Boolean(error?.message)}
                          helperText={error?.message || ""}
                          {...rest}
                        />
                      )}
                    />
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexShrink: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Controller
                        name={`${fieldName}.strict_match`}
                        defaultValue={true}
                        key={`${fieldName}.string.strict_match`}
                        render={({ field: { value, ref, ...rest } }) => (
                          <DisplaySwitch
                            label="strict match"
                            labelPlacement="end"
                            onlyValue={true}
                            disabled={disabled}
                            inputRef={ref}
                            checked={Boolean(value)}
                            value={value}
                            {...rest}
                          />
                        )}
                      />
                    </div>
                  </div>
                </DisplayGrid>
              </>
            );
          }

          case "ARRAY": {
            try {
              const { arrayKey, labelKey, valueKey } =
                mappingField && JSON.parse(mappingField);
              let multiple = operator !== "EQUALS";
              return (
                <>
                  <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
                    <Controller
                      name={`${fieldName}.value`}
                      control={control}
                      key={`${fieldName}.array.value`}
                      rules={{ required: requiredMsg }}
                      render={({
                        field: { onChange, value, ref, ...rest },
                        fieldState: { error },
                      }) => (
                        <DisplaySelect
                          label="Select Value"
                          variant="outlined"
                          values={directiveObj[arrayKey]}
                          labelKey={labelKey}
                          valueKey={valueKey}
                          disabled={disabled}
                          limitTags={3}
                          onClear={() => onChange("")}
                          onChange={onChange}
                          multiple={multiple}
                          showNone={false}
                          inputRef={ref}
                          value={!multiple ? value : value || []}
                          hideFooterChips={true}
                          controlStyle={{ marginTop: 16 }}
                          error={Boolean(error?.message)}
                          helperText={error?.message || ""}
                          {...rest}
                        />
                      )}
                    />
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
                    name={`${fieldName}.value`}
                    control={control}
                    key={`${fieldName}.num.value`}
                    rules={{ required: requiredMsg }}
                    render={({
                      field: { onChange, value, ref, ...rest },
                      fieldState: { error },
                    }) => (
                      <DisplayInput
                        style={{ display: "flex", flex: 1, marginTop: 16 }}
                        label={"Enter Value"}
                        variant="outlined"
                        type="NUMBER"
                        defaultValue={value}
                        value={value}
                        inputRef={ref}
                        disabled={disabled}
                        onChange={onChange}
                        onClear={() => onChange(null)}
                        error={Boolean(error?.message)}
                        helperText={error?.message || ""}
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
                      name={`${fieldName}.min`}
                      control={control}
                      key={`${fieldName}.num.min`}
                      render={({
                        field: { onChange, ref, value, ...rest },
                        fieldState: { error },
                      }) => (
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
                          inputRef={ref}
                          disabled={disabled}
                          defaultValue={value}
                          value={value}
                          onClear={() => onChange(null)}
                          onChange={onChange}
                          error={Boolean(error?.message)}
                          helperText={error?.message || ""}
                          {...rest}
                        />
                      )}
                    />
                    <Controller
                      name={`${fieldName}.max`}
                      control={control}
                      key={`${fieldName}.num.max`}
                      render={({
                        field: { onChange, ref, value, ...rest },
                        fieldState: { error },
                      }) => (
                        <DisplayInput
                          style={{ display: "flex", flex: 1, marginTop: 16 }}
                          label={"Enter max value"}
                          placeholder={"Max Value"}
                          variant="outlined"
                          type="NUMBER"
                          inputRef={ref}
                          disabled={disabled}
                          defaultValue={value}
                          value={value}
                          onClear={() => onChange(null)}
                          onChange={onChange}
                          error={Boolean(error?.message)}
                          helperText={error?.message || ""}
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
                    name={`${fieldName}.value`}
                    control={control}
                    key={`${fieldName}.date.equals`}
                    rules={{ required: requiredMsg }}
                    render={({
                      field: { onChange, value, ref, ...rest },
                      fieldState: { error },
                    }) => (
                      <DisplayDatePicker
                        style={{ display: "flex", flex: 1, marginTop: 16 }}
                        label={"Select Date"}
                        inputVariant="outlined"
                        defaultValue={value}
                        inputRef={ref}
                        value={value}
                        disabled={disabled}
                        onChange={onChange}
                        error={Boolean(error?.message)}
                        helperText={error?.message || ""}
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
                      name={`${fieldName}.min`}
                      control={control}
                      key={`${fieldName}.date.min`}
                      rules={{ required: requiredMsg }}
                      render={({
                        field: { onChange, value, ref, ...rest },
                        fieldState: { error },
                      }) => (
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
                          defaultValue={value}
                          inputRef={ref}
                          value={value}
                          disabled={disabled}
                          onChange={onChange}
                          error={Boolean(error?.message)}
                          helperText={error?.message || ""}
                          {...rest}
                        />
                      )}
                    />
                    <Controller
                      name={`${fieldName}.max`}
                      control={control}
                      key={`${fieldName}.date.max`}
                      rules={{ required: requiredMsg }}
                      render={({
                        field: { onChange, ref, value, ...rest },
                        fieldState: { error },
                      }) => (
                        <DisplayDatePicker
                          style={{ display: "flex", flex: 1, marginTop: 16 }}
                          label={"Enter to date"}
                          placeholder={"To Date"}
                          minDate={getValues(`${fieldName}.min`)}
                          inputVariant="outlined"
                          defaultValue={value}
                          inputRef={ref}
                          value={value}
                          disabled={disabled}
                          onChange={onChange}
                          error={Boolean(error?.message)}
                          helperText={error?.message || ""}
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
                  name={`${fieldName}.value`}
                  control={control}
                  key={`${fieldName}.custom.value`}
                  rules={{ required: requiredMsg }}
                  render={({
                    field: { onClear, onChange, value, ref, ...rest },
                    fieldState: { error },
                  }) => (
                    <DisplaySelect
                      label="Select Value"
                      variant="outlined"
                      values={options}
                      labelKey={labelKey}
                      valueKey={valueKey}
                      limitTags={3}
                      inputRef={ref}
                      disabled={disabled}
                      onClear={() => onChange("")}
                      onChange={onChange}
                      multiple
                      showNone={false}
                      hideFooterChips={true}
                      value={value || []}
                      error={Boolean(error?.message)}
                      helperText={error?.message || ""}
                      controlStyle={{ marginTop: 16 }}
                      {...rest}
                    />
                  )}
                />
              </DisplayGrid>
            </>
          );
        } catch (e) {
          console.log("error in custom type ====>", e);
        }
      }
    }
  };

  const renderOperator = () => {
    let name = getValues(`${fieldName}.name`) || field?.name;
    let directiveObj = directives[name];
    return (
      <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
        <Controller
          name={`${fieldName}.operator`}
          control={control}
          key={`${fieldName}.operator`}
          rules={{ required: requiredMsg }}
          render={({
            field: { onChange, value, ref, ...rest },
            fieldState: { error },
          }) => (
            <DisplayAutocomplete
              style={{ display: "flex", flex: 1 }}
              label={"Select operator"}
              labelKey={"title"}
              selectedKey={"name"}
              variant="outlined"
              value={(directiveObj?.operators || []).find(
                (e) => e.name === value
              )}
              inputRef={ref}
              onlyValue={true}
              disabled={disabled}
              options={directiveObj?.operators || []}
              onChange={(v) => {
                setValueLoader(true);
                onChange(v);
              }}
              error={Boolean(error?.message)}
              helperText={error?.message || ""}
              {...rest}
            />
          )}
        />
      </DisplayGrid>
    );
  };

  return (
    <>
      <DisplayGrid container spacing={2}>
        <DisplayGrid item xs={12} sm={12} md={4} lg={4} xl={4}>
          <Controller
            name={`${fieldName}.name`}
            control={control}
            key={`${fieldName}.name`}
            rules={{ required: requiredMsg }}
            render={({
              field: { onChange, value, ref, ...rest },
              fieldState: { error },
            }) => (
              <DisplayAutocomplete
                style={{ display: "flex", flex: 1 }}
                label={"Select field"}
                variant="outlined"
                options={Object.keys(directives) || []}
                getOptionLabel={(option) => directives[option]?.title}
                onlyValue={true}
                inputRef={ref}
                disabled={disabled}
                value={value}
                onChange={(v) => {
                  if (getValues(`${fieldName}.operator`)) {
                    setLoadOperator(true);
                    setValueLoader(true);
                  }
                  onChange(v);
                }}
                error={Boolean(error?.message)}
                helperText={error?.message || ""}
                {...rest}
              />
            )}
          />
        </DisplayGrid>
        {(disabled || (!loadOperator && getValues(`${fieldName}.name`))) &&
          renderOperator()}
        {(disabled ||
          (!loadOperator &&
            !valueLoader &&
            getValues(`${fieldName}.operator`))) &&
          renderTypeIterator()}
      </DisplayGrid>
    </>
  );
};

export default ConditionContainer;
