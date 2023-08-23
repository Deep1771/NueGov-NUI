import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TahbleHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Switch,
} from "@material-ui/core";
import { TableHeader } from "./components/header";

import { lighten, makeStyles } from "@material-ui/core/styles";
import { TableToolbar } from "./components/toolbar";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { DisplayText } from "../text";

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

export const DisplayTable = (props) => {
  const { values, methods, options } = props;
  const { columns, rows, title, params, totalCount, page, rowsPerPage } =
    values;

  const { onClickRow, handlePageChange, handleSort } = methods;
  const {
    hidePaddingSwitch,
    hideCheckBox,
    hideEmptyRows,
    disableSort,
    progress,
  } = options;

  const classes = useStyles();
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("calories");
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    handleSort(property, isAsc ? -1 : 1);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, row) => {
    onClickRow(row.id);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  let parseOpdata = (row) => {
    let parsingOpData = JSON.parse(row?.opData?.delta);
    let lastUpdatedData =
      (parsingOpData?.$set &&
        Object.values(parsingOpData?.$set?.sys_entityAttributes)) ||
      [];
    let lastRemoved =
      (parsingOpData?.$removed &&
        Object.values(parsingOpData?.$removed?.sys_entityAttributes)) ||
      [];
    return [...lastUpdatedData, ...lastRemoved];
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableToolbar
          title={title}
          progress={progress}
          numSelected={selected.length}
        />
        <TableContainer style={{ maxHeight: 350 }}>
          <Table
            stickyHeader
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
            aria-label="enhanced table"
          >
            <TableHeader
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              headCells={columns}
              hideCheckBox={hideCheckBox}
              disableSort={disableSort}
            />
            <TableBody>
              {rows.map((row, index) => {
                const isItemSelected = isSelected(row.data.name);
                const labelId = `enhanced-table-checkbox-${index}`;
                let updatedArr = [];
                if (row?.opData && row?.opData?.type !== "CREATE") {
                  updatedArr = parseOpdata(row);
                }

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={index}
                    selected={isItemSelected}
                  >
                    {!hideCheckBox && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                    )}
                    {columns.map((col, ci) => {
                      return (
                        <TableCell>
                          {row.opData &&
                          updatedArr?.length > 0 &&
                          updatedArr?.includes(row["data"][col.id]) ? (
                            <DisplayText style={{ color: "#ff7b7b" }}>
                              {textExtractor(
                                row["data"][col.id],
                                col.fieldMeta
                              )}
                            </DisplayText>
                          ) : (
                            textExtractor(row["data"][col.id], col.fieldMeta)
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
              {!hideEmptyRows && emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handlePageChange}
        />
      </Paper>
      {!hidePaddingSwitch && (
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
      )}
    </div>
  );
};
