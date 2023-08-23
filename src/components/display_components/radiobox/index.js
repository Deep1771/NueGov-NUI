import React from "react";
import { Radio } from "@material-ui/core";
import { ThemeFactory } from "utils/services/factory_services";
import { DisplayFormControlLabel } from "components/display_components/form_helpers";

import Stylesheet from "utils/stylesheets/display_component";

export const DisplayRadiobox = (props) => {
  const { color, disabled, onChange, value, testid, ...rest } = props;
  const { useRadioboxStyles } = Stylesheet();
  const { getVariantForComponent } = ThemeFactory();
  const classes = useRadioboxStyles(getVariantForComponent("RADIO", "primary"));

  return (
    <DisplayFormControlLabel {...rest} value={value}>
      <Radio
        onChange={onChange}
        {...rest}
        color={color}
        disabled={disabled}
        classes={{
          root: classes.root,
          checked: classes.checked,
          disabled: classes.disabled,
        }}
        testid={testid}
      />
    </DisplayFormControlLabel>
  );
};

DisplayRadiobox.defaultProps = {
  size: "small", // small || medium
};
