import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import React, { useState, useEffect, useContext } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import { SummaryGridContext } from "../..";
import { NueassistSummaryGridContext } from "nueassist/containers/summary_container";
import { ThemeFactory } from "utils/services/factory_services";
import Stylesheet from "utils/stylesheets/display_component";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { DisplayButton } from "components/display_components";

const ListSearch = (props) => {
  const { getVariantForComponent } = ThemeFactory();
  const { useCheckboxStyles } = Stylesheet();
  const classes = useCheckboxStyles(
    getVariantForComponent("displayCheckBox", "primary")
  );
  let values = props?.column?.values || [];
  const [val, setVal] = useState([]);
  const gridContext =
    props?.businessType === "NUEASSIST"
      ? NueassistSummaryGridContext
      : SummaryGridContext;
  const [gridProps, dispatch] = useContext(gridContext);
  const columnKey = props?.column?.key || "";
  const { filter = [] } = gridProps || {};
  const filterArray = filter || [];
  const [open, setOpen] = useState(false);
  const [backupValues, setBackupValues] = useState([]);

  const handleOnSearch = () => {
    if (val.length == 0) {
      delete filterArray[columnKey];
    }
    if (val?.length > 0) {
      filterArray[columnKey] = String(val);
    } else {
      delete filterArray[columnKey];
    }
    dispatch({ type: "SET_LOADER", payload: { loader: true } });
    setOpen(false);
    props.column.handleColumnSearch(filterArray);
  };

  const handleChange = (e) => {
    let values = e?.target?.value || [];
    if (props?.businessType === "NUEASSIST") {
      if (values?.length > 0 && values[0] === undefined) {
        setOpen(false);
        return;
      }

      let checkNull = 0;
      values.forEach((ele) => {
        if (ele == undefined) {
          // setVal([]);
          checkNull = 1;
        }
      });

      values = values?.filter((ele) => ele);
      if (values?.length === 0) {
        if (backupValues) setVal(backupValues);
        else setVal([]);
        //   setOpen(false);
        return;
      }
      if (checkNull && values?.length >= 0) {
        setOpen(false);
      }
      setVal(values || []);
    } else {
      let checkNull = 0;
      values.forEach((ele) => {
        if (ele == undefined) {
          setVal([]);
          checkNull = 1;
        }
      });
      if (checkNull) {
        if (backupValues) setVal(backupValues);
        else setVal([]);
        setOpen(false);
        return;
      }
      setVal(e?.target?.value || []);
    }
  };

  const MenuProps = {
    MenuListProps: {
      disablePadding: true,
    },
    PaperProps: {
      style: {
        maxHeight: 50 * 4.5 + 8,
      },
    },
    variant: "menu",
    getContentAnchorEl: null,
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const getValue = (id) => {
    let selectedValues = [];
    for (let k of id) {
      for (let i of values) {
        if (i.id == k) {
          selectedValues.push(i.value);
        }
      }
    }
    return selectedValues;
  };

  useEffect(() => {
    if (filterArray.hasOwnProperty(columnKey)) {
      let selectedValues;
      if (Array.isArray(filterArray[columnKey])) {
        selectedValues = filterArray[columnKey];
      } else {
        selectedValues = filterArray[columnKey].split(",");
      }
      setVal(selectedValues);
      setBackupValues(selectedValues);
    }
  }, []);

  useEffect(() => {
    if (
      props?.businessType === "NUEASSIST" &&
      Object.keys(filter)?.length === 0
    ) {
      setVal([]);
    }
  }, [JSON.stringify(filter)]);

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <FormControl style={{ width: "100%" }}>
        <InputLabel
          id="demo-simple-select-label"
          style={{
            marginTop: "-16px",
            marginLeft: "10px",
            opacity: "0.7",
          }}
        >
          Select
        </InputLabel>
        <Select
          style={{ width: "100%", height: "28px", borderRadius: "50px" }}
          variant="outlined"
          value={val}
          size="small"
          onChange={(e) => handleChange(e)}
          multiple
          open={open}
          // onClose={() => {
          //   handleOnSearch();
          // }}
          // InputLabelProps={{ shrink: true }}
          onClose={handleClose}
          onOpen={handleOpen}
          renderValue={(val) => {
            return (
              <span style={{ height: "10px", fontSize: "12px" }}>
                {String(getValue(val))}
              </span>
            );
          }}
          MenuProps={MenuProps}
        >
          {values.map((li) => {
            return (
              li.id && (
                <MenuItem
                  value={li.id}
                  style={{
                    padding: "8px",
                    fontSize: "14px",
                    backgroundColor: "white",
                    color: "black",
                  }}
                  key={li.id}
                >
                  <Checkbox
                    classes={{
                      root: classes.root,
                      checked: classes.checked,
                    }}
                    style={{ padding: "0px 3px", fontSize: "8px" }}
                    checked={val.indexOf(li.id) > -1}
                  />
                  {li.value}
                </MenuItem>
              )
            );
          })}
          <div
            style={{
              backgroundColor: "white",
              position: "sticky",
              bottom: 0,
              display: "flex",
              justifyContent: "end",
              padding: "5px",
            }}
          >
            <DisplayButton
              size="large"
              style={{
                width: "50%",
                height: "27px",
                fontSize: "12px",
              }}
              onClick={(e) => handleChange(e)}
            >
              Cancel
            </DisplayButton>
            <DisplayButton
              variant="contained"
              size="large"
              style={{
                width: "50%",
                height: "27px",
                fontSize: "12px",
              }}
              onClick={handleOnSearch}
            >
              Apply
            </DisplayButton>
          </div>
        </Select>
      </FormControl>
    </div>
  );
};
export default ListSearch;
