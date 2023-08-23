import React, { useEffect, useState } from "react";
import { DisplaySelect } from "components/display_components";
import { get } from "utils/services/helper_services/object_methods";
import { textExtractor } from "utils/services/helper_services/system_methods";

export const ListFilter = (props) => {
  const {
    showNone = true,
    placeHolder,
    type,
    displayFields,
    valueFieldMeta = {},
    delimiter = " ",
    width,
    defaultValue,
    title,
  } = props?.filterMetadata || {};
  const [values, setValues] = useState([]);
  const [value, setValue] = useState(null);
  const { queryObj, onSelectionChange, classes, data, ...rest } = props || {};

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
      onSelectionChange(defaultValue);
    }
  }, [defaultValue]);

  const getStructure = (data) => {
    let values = (data || []).map((val) => {
      let option = {
        value: "",
        id: textExtractor(get(val, valueFieldMeta?.path), {
          type: valueFieldMeta?.type,
          format: valueFieldMeta?.format,
        }),
      };
      let a = displayFields?.map((field) => {
        let value = get(val, field.path);
        let color;
        if (field.colors) color = field.colors.find((i) => i.id === value);
        if (value && color)
          option.value += `<span style="color: ${color.color}">${
            textExtractor(value, { type: field?.type }) + delimiter
          }</span> `;
        else option.value += `${textExtractor(value, { type: field?.type })} `;
      });
      return option;
    });

    if (values?.length) {
      setValues(values);
    }
  };

  useEffect(() => {
    if (data?.length) {
      getStructure(data);
    }
  }, [data]);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
      onSelectionChange(defaultValue);
    }
  }, [defaultValue]);

  return (
    <DisplaySelect
      title={title}
      labelKey={"value"}
      label={title}
      displayChip={true}
      selectView={false}
      placeHolder={placeHolder}
      valueKey={"id"}
      values={values}
      defaultValue={defaultValue}
      InputLabelProps={{ shrink: true }}
      InputProps={{ style: { maxHeight: "35px" } }}
      onChange={(value) => {
        setValue(value);
        onSelectionChange(value);
      }}
      value={value || defaultValue}
      disabled={false}
      variant="outlined"
      showNone={showNone}
      hideFooterChips={true}
      style={{ width: width ? width : "230px", borderRadius: "5px", zIndex: 0 }}
      SelectProps={{
        MenuProps: {
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "right",
          },
          getContentAnchorEl: null,
        },
      }}
      classes={classes}
    />
  );
};
