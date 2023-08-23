import React from "react";
import { Chip } from "@material-ui/core";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";
import Avatar from "@material-ui/core/Avatar";

export const DisplayChips = (props) => {
  let { systemVariant, avatar, ...rest } = props;
  const { getVariantForComponent } = ThemeFactory();
  const { useChipStyles } = Stylesheet();
  const defaultVariant = systemVariant ? systemVariant : "default";
  const classes = useChipStyles(getVariantForComponent("CHIP", defaultVariant));
  return (
    <div>
      <Chip
        {...rest}
        avatar={avatar ? <Avatar alt="icon" src={avatar} /> : null}
        classes={{
          root: classes.root,
        }}
        variant="outlined"
      />
    </div>
  );
};
