import React from "react";
import { Checkbox } from "@material-ui/core";
import { DisplayFormControlLabel } from "components/display_components/form_helpers";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";

export const DisplayCheckbox = (props) => {
  let { hideLabel, labelPlacement, onChange, systemVariant, testid, ...rest } =
    props;
  const { getVariantForComponent } = ThemeFactory();
  const { useCheckboxStyles } = Stylesheet();
  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useCheckboxStyles(
    getVariantForComponent("displayCheckBox", defaultVariant)
  );

  const renderCheckbox = () => (
    <Checkbox
      inputProps={{
        testid: testid,
      }}
      {...rest}
      classes={{
        root: classes.root,
        checked: classes.checked,
        disabled: classes.disabled,
      }}
      onChange={(event) => onChange(event.target.checked, props, event)}
    />
  );

  return hideLabel ? (
    renderCheckbox()
  ) : (
    <DisplayFormControlLabel {...rest} labelPlacement={labelPlacement}>
      {renderCheckbox()}
    </DisplayFormControlLabel>
  );
};

DisplayCheckbox.defaultProps = {
  labelPlacement: "end", // start | end | top | bottom
  size: "small", // small || medium
};
