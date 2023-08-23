import React, { useEffect, useState } from "react";
import { DisplayChips } from "components/display_components";
import Popover from "@material-ui/core/Popover";
import { makeStyles } from "@material-ui/core/styles";

const FiltersPopover = (props) => {
  const { filterParams, handleClear, updatedFilter, styles } = props;
  const [filterItem, setFilterItem] = useState(filterParams);
  const [popover, setPopover] = useState(null);

  const open = Boolean(popover);
  const id = open ? "simple-popover" : undefined;

  const useStyles = makeStyles(() => ({
    paper: {
      boxShadow: "none",
      ...styles,
    },
  }));
  const classes = useStyles();

  const handleClick = (event) => {
    setPopover(popover ? null : event.currentTarget);
  };

  const handleDelete = (filterItem) => {
    let removeItem = filterItem[0];
    delete filterParams[removeItem];
    setFilterItem(filterParams);
  };

  useEffect(() => {
    updatedFilter(filterItem);
  }, [filterItem]);

  return (
    <div>
      <DisplayChips
        style={{ borderColor: "white" }}
        onClick={handleClick}
        onDelete={handleClear}
        label={"View Applied Filters"}
        size={"small"}
        systemVariant={"primary"}
      />
      <Popover
        style={{ zIndex: "10000" }}
        id={id}
        open={open}
        anchorEl={popover}
        classes={{ paper: classes.paper }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        onClose={() => {
          setPopover(null);
        }}
      >
        {filterParams && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              padding: "0.6rem 0.4rem 0.4rem 0.6rem",
              flexWrap: "wrap",
              justifyContent: "space-around",
            }}
          >
            {Object.entries(filterParams).map((eachItem, i) => {
              let label = eachItem[1];

              if (eachItem[0] == "sys_agencyId")
                label = "Agency Filters Applied";

              if (eachItem[0] == "sortby") label = `Sort By : ${eachItem[1]}`;

              if (eachItem[0] == "orderby")
                label = eachItem[1] > -1 ? `Order By :ASC` : `Order By : DESC`;
              return (
                <DisplayChips
                  style={{
                    width: "10rem",
                    color: "grey",
                    justifyContent: "space-between",
                    borderColor: "#f5f5f5",
                    background: "#f5f5f5",
                    margin: "0.3rem",
                  }}
                  key={i}
                  label={label.toString()}
                  size="small"
                  onDelete={() => handleDelete(eachItem)}
                />
              );
            })}
          </div>
        )}
      </Popover>
    </div>
  );
};

export default FiltersPopover;
