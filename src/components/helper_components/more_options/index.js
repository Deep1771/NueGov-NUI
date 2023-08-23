import React, { useState } from "react";
import { Menu, MenuItem } from "@material-ui/core";
import { SystemIcons } from "utils/icons";
import { DisplayFormLabel } from "components/display_components/index";
import { ThemeFactory } from "utils/services/factory_services";

const MoreOptions = (props) => {
  const { moreOptions } = props;
  const { MoreVertical } = SystemIcons;
  const { getAllVariants } = ThemeFactory();
  const { dark } = getAllVariants?.primary;
  const [menu, setMenu] = useState(null);

  return (
    <>
      <DisplayFormLabel>
        <div
          onClick={(e) => setMenu(e.currentTarget)}
          onClose={(e) => setMenu(null)}
          style={{
            color: dark.bgColor,
            cursor: "pointer",
          }}
        >
          <MoreVertical style={{ height: "18px" }} />
        </div>
      </DisplayFormLabel>
      <Menu
        id="hotbutton-menu"
        anchorEl={menu}
        keepMounted
        open={Boolean(menu)}
        onClose={(e) => setMenu(null)}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {moreOptions?.map((item) => {
          return (
            <MenuItem
              onClick={() => {
                item.handler();
                setMenu(null);
              }}
            >
              {item.component ? (
                <>{item.component}</>
              ) : (
                <div
                  style={{
                    color: dark.bgColor,
                    display: "flex",
                  }}
                >
                  <div style={{ display: "flex" }}>{item.icon}</div>
                  &nbsp;
                  <div style={{ display: "flex" }}>{item.title}</div>
                </div>
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default MoreOptions;
