import React from "react";
import { Pagination } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import { DisplayText, DisplayChips } from "../";
import { ThemeFactory } from "utils/services/factory_services";
import { DisplaySelect } from "../select";

export const DisplayPagination = (props) => {
  let {
    currentPage,
    itemsPerPage,
    onChange,
    totalCount,
    handleRowLimit,
    summaryRowFilters,
    hidePageCount = false,
    ...rest
  } = props;

  const { getVariantObj } = ThemeFactory();
  const { dark } = getVariantObj("primary");
  const useStyles = makeStyles(() => ({
    ul: {
      "& .MuiPaginationItem-page.Mui-selected": {
        backgroundColor: dark.bgColor,
      },
    },
    textField: {
      [`& fieldset`]: {
        borderRadius: "50px",
        height: "40px",
      },
    },
  }));
  let dataCount =
    totalCount % itemsPerPage > 0
      ? parseInt(totalCount / itemsPerPage + 1)
      : parseInt(totalCount / itemsPerPage);
  let startPage = currentPage > 1 ? (currentPage - 1) * itemsPerPage + 1 : 1;
  let endPage =
    startPage <= totalCount && !(totalCount > startPage + itemsPerPage)
      ? totalCount
      : currentPage * itemsPerPage;
  const classes = useStyles();
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "end",
      }}
    >
      <div style={{ flex: 1 }}>
        <DisplayChips
          style={{
            wordSpacing: "4px",
            backgroundColor: dark.bgColor,
            color: dark.text,
          }}
          testid="Pagination"
          label={`${startPage}-${totalCount ? endPage : 0}  of  ${totalCount}`}
        />
      </div>
      {/* {summaryRowFilters && summaryRowFilters[0]?.gridRows && (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "row",
            justifyContent: "end",
          }}
        >
          <SetRowLimit
            classes={classes}
            summaryRowFilters={summaryRowFilters}
            itemsPerPage={itemsPerPage}
            handleRowLimit={handleRowLimit}
          />
        </div>
      )} */}
      <div style={{ display: "flex", justifyContent: props.align }}>
        {summaryRowFilters && summaryRowFilters[0]?.gridRows && (
          <div
            style={{
              padding: "0px 13px",
            }}
          >
            <SetRowLimit
              classes={classes}
              summaryRowFilters={summaryRowFilters}
              itemsPerPage={itemsPerPage}
              handleRowLimit={handleRowLimit}
            />
          </div>
        )}
        <div style={{ alignSelf: "center" }}>
          <Pagination
            count={parseInt(dataCount)}
            onChange={onChange}
            classes={{ ul: classes.ul }}
            page={parseInt(currentPage)}
            color="primary"
            {...rest}
          />
        </div>
      </div>
    </div>
  );
};

DisplayPagination.defaultProps = {
  boundaryCount: 2,
  size: "small",
  align: "center",
};

const SetRowLimit = ({
  itemsPerPage,
  handleRowLimit,
  summaryRowFilters,
  classes,
}) => {
  let title = summaryRowFilters[0]?.title || "Rows per page";
  return (
    <div style={{ flexDirection: "row", display: " flex" }}>
      <span
        style={{
          alignSelf: "center",
          paddingRight: "10px",
          width: "100%",
          fontSize: "15px",
        }}
      >
        {" "}
        {title}
      </span>
      <div>
        <DisplaySelect
          style={{
            backgroundColor: "white",
          }}
          classes={{
            root: classes.textField,
          }}
          // label={title}
          values={summaryRowFilters[0].values}
          valueKey="id"
          variant="outlined"
          testid="setLimit"
          labelKey="value"
          showNone={false}
          value={itemsPerPage}
          onChange={handleRowLimit}
        />
      </div>
    </div>
  );
};
