import React, { useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { DisplayInput } from "../../display_components";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";

const InputBoxWrapper = (props) => {
  const [value, setValue] = useState("");
  const { data, onClick, onChange, onClear, placeholder, testid, ...rest } =
    props;

  const handleChange = debounce((value) => {
    onChange && onChange(value);
  }, 500);

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) onClick && onClick(value);
  };

  const handleClear = () => {
    setValue("");
    onClear && onClear();
  };

  useEffect(() => {
    setValue(data ? data : "");
  }, [data]);

  return (
    <DisplayInput
      testid={testid}
      placeholder={placeholder || ""}
      onChange={(val) => {
        setValue(val);
        handleChange(val);
      }}
      onClear={handleClear}
      onKeyDown={handleKeyDown}
      value={value ? value : ""}
      {...rest}
    />
  );
};

export const InputWrapper = FormThemeWrapper(InputBoxWrapper);
