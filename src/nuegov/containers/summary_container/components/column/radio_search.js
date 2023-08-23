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

const RadioSearch = (props) => {
  const { getVariantForComponent } = ThemeFactory();
  const { useCheckboxStyles } = Stylesheet();
  const classes = useCheckboxStyles(
    getVariantForComponent("displayCheckBox", "primary")
  );
  let values = props?.column?.values || [];
  const [val, setVal] = useState("");
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
  const [list, setList] = useState([]);

  const handleOnSearch = (value) => {
    if (value == "") {
      delete filterArray[columnKey];
    }
    if (value.length > 0) {
      filterArray[columnKey] = String(value);
    } else {
      delete filterArray[columnKey];
    }
    dispatch({ type: "SET_LOADER", payload: { loader: true } });
    props.column.handleColumnSearch(filterArray);
  };

  const handleChange = (e) => {
    let values = e?.target?.value || [];
    let checkNull = 0;
    // values.forEach((ele) => {
    //   if (ele == undefined) {
    //     setVal([]);
    //     checkNull = 1;
    //   }
    // });
    if (checkNull) {
      if (backupValues) setVal(backupValues);
      else setVal([]);
      setOpen(false);
      return;
    }
    setVal(e.target.value || "");
    handleOnSearch(e.target.value);
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 50 * 4.5 + 8,
        ul: {
          padding: "0px",
        },
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
      for (let i of list) {
        if (i.value == k) {
          selectedValues.push(i.title);
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
    let alteredList = [];
    for (let i of values) {
      alteredList.push({ ...i, value: "" + i.value });
    }
    setList([...alteredList]);
  }, [values]);

  useEffect(() => {
    if (
      props?.businessType === "NUEASSIST" &&
      Object.keys(filter)?.length === 0
    ) {
      setVal("");
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
          open={open}
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
          <MenuItem
            value={""}
            style={{ padding: "8px", fontSize: "14px" }}
            key={"none"}
          >
            {"None"}
          </MenuItem>
          {list.map((li) => {
            return (
              li.title && (
                <MenuItem
                  value={li.value}
                  style={{ padding: "8px", fontSize: "14px" }}
                  key={li.value}
                >
                  {li.title}
                </MenuItem>
              )
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
};
export default RadioSearch;
