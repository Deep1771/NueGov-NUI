import React, { useState, useEffect } from "react";
import { lighten, makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { DisplayText, DisplayProgress } from "components/display_components";
import { Toolbar, IconButton, Tooltip } from "@material-ui/core";

import clsx from "clsx";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";

export const TableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected, title, progress } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <DisplayText
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </DisplayText>
      ) : (
        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <DisplayText
            className={classes.title}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            {title}
          </DisplayText>
          {progress && <DisplayProgress size={22} />}
        </div>
      )}

      {/* {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton aria-label="delete">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                    <Tooltip title="Filter list">
                        <IconButton aria-label="filter list">
                            <FilterListIcon />
                        </IconButton>
                    </Tooltip>
                )} */}
    </Toolbar>
  );
};

TableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
    paddingRight: 5,
  },
}));
