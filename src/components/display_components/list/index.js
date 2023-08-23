import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Collapse from "@material-ui/core/Collapse";
import { SystemIcons } from "utils/icons";
import { DisplayText } from "..";
import { ToolTipWrapper } from "components/wrapper_components";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    minWidth: 250,
    backgroundColor: theme.palette.background.paper,
    padding: "0px",
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

export const DisplayList = ({ items, selected, onClick, ...rest }) => {
  const classes = useStyles();
  const { ExpandMore, FiberManual } = SystemIcons;

  const renderItem = (item, nested = false) => {
    let { id, icon, subItems, title } = item;
    return (
      <ToolTipWrapper title={title}>
        <div>
          <ListItem
            key={id}
            button
            className={nested ? classes.nested : ""}
            selected={id == selected}
            onClick={() => !subItems && onClick(item)}
            {...rest}
          >
            <ListItemIcon>
              {icon && <img width="30" height="30" src={icon} />}
              {!icon && (
                <FiberManual
                  style={{ color: "#dedcdc", width: 30, height: 30 }}
                />
              )}
            </ListItemIcon>
            <DisplayText>{title}</DisplayText>
            {subItems && <ExpandMore />}
          </ListItem>
        </div>
      </ToolTipWrapper>
    );
  };

  return (
    <List component="div" className={classes.root}>
      {items.map((item) => (
        <React.Fragment key={item.id}>
          {renderItem(item)}
          {item.subItems?.map((subItem) => (
            <Collapse in={true} timeout="auto" unmountOnExit>
              {renderItem(subItem, true)}
            </Collapse>
          ))}
        </React.Fragment>
      ))}
    </List>
  );
};
