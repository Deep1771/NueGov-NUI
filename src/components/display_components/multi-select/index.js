import React, { useEffect, useState } from "react";
import { Checkbox, FormControl } from "@material-ui/core";
import { DisplayText } from "components/display_components";
import { FormThemeWrapper } from "utils/stylesheets/form_theme_wrapper";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";

export const DisplayMultiSelect = (props) => {
  const {
    disabled,
    onChange,
    label,
    values,
    testid,
    value,
    required,
    ...rest
  } = props;
  const [selected, setSelected] = useState([]);
  const { getVariantForComponent } = ThemeFactory();

  const defaultVariant = "primary";

  const { useCheckboxStyles } = Stylesheet();
  const classes = useCheckboxStyles(
    getVariantForComponent("displayCheckBox", defaultVariant)
  );

  let getChecked = (val) => {
    let result = value.includes(val);
    return result;
  };

  const handleChange = (event, selectedValue) => {
    let value = event.target.checked;
    let selectedValues = [...selected];
    if (!value) {
      selectedValues = selectedValues.filter(
        (eachSelectedValue) => eachSelectedValue !== selectedValue
      );
    } else {
      selectedValues = [...selectedValues, selectedValue];
    }
    setSelected([...selectedValues]);
    onChange([...selectedValues]);
  };

  useEffect(() => {
    setSelected([...value]);
  }, [props]);

  let computeWordBreak = (value) => {
    let splitWord = value?.split(" ");
    if (splitWord?.length > 0) {
      if (splitWord[0]?.length > 22) return true;
      else return false;
    }
  };

  return (
    <FormControl
      testid={testid}
      required={required}
      style={{
        display: "flex",
        flexFlow: "wrap",
        height: "100%",
        width: "100%",
        ...props.style,
        ...props.controlStyle,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>
          <DisplayText>
            <b>{label}</b>
          </DisplayText>
        </span>
        <div style={{ display: "flex", flexFlow: "wrap" }}>
          {values.map((eachCheckbox) => {
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  width: "12vw",
                  padding: "2px",
                }}
              >
                <span>
                  <Checkbox
                    disabled={disabled}
                    size="small"
                    key={eachCheckbox.id}
                    checked={getChecked(eachCheckbox.id)}
                    onChange={(event) => handleChange(event, eachCheckbox.id)}
                    classes={{
                      root: classes.root,
                      checked: classes.checked,
                      disabled: classes.disabled,
                    }}
                    {...rest}
                  />
                </span>
                <span
                  style={{
                    display: "flex",
                    whiteSpace: "break-spaces",
                    wordBreak: computeWordBreak(eachCheckbox.value)
                      ? "break-all"
                      : "",
                  }}
                >
                  <DisplayText>{eachCheckbox.value}</DisplayText>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </FormControl>
  );
};

export default FormThemeWrapper(DisplayMultiSelect);
