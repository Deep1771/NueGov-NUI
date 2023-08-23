import React, { useState, useEffect, useContext } from "react";
import { TextField, makeStyles } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import { SystemIcons } from "utils/icons";
import { DisplayIconButton } from "components/display_components";
import { SummaryGridContext } from "../..";
import { NueassistSummaryGridContext } from "nueassist/containers/summary_container";

const styles = makeStyles(() => ({
  root: {
    "& fieldset": {
      border: "1px solid #01579b",
    },
  },
}));

const ReferenceSearch = (props) => {
  const { Search } = SystemIcons;
  const [val, setVal] = useState("");
  const gridContext =
    props?.businessType === "NUEASSIST"
      ? NueassistSummaryGridContext
      : SummaryGridContext;
  const [gridProps, dispatch] = useContext(gridContext);
  const { filter = [] } = gridProps || {};
  const filterArray = filter || [];
  const classes = styles();
  const displayFields = props?.column?.displayFields || [];
  const index = props?.index || 0;
  const { visibleInSingleColumn = false } = props?.column?.columnData || {};
  const isMultiReference = displayFields.length > 1;
  const [columnKey, setColumnKey] = useState(props?.column?.key || "");

  const handleOnSearch = () => {
    dispatch({ type: "SET_LOADER", payload: { loader: true } });
    props.column.handleColumnSearch(filterArray);
  };

  const onTextChange = (e) => {
    if (e?.target?.value == "" || e == "") {
      if (Array.isArray(columnKey)) {
        columnKey.forEach((f) => {
          delete filterArray[f];
        });
        setVal(e.target.value || "");
      } else delete filterArray[columnKey];
      setVal("");
      handleOnSearch();
    } else {
      if (Array.isArray(columnKey)) {
        columnKey.map((f) => (filterArray[f] = e.target.value));
        setVal(e.target.value || "");
      } else {
        filterArray[columnKey] = e.target.value;
        setVal(e.target.value || "");
      }
    }
  };

  useEffect(() => {
    if (visibleInSingleColumn)
      setColumnKey(
        displayFields.map((e) => props?.column?.key + "." + e?.name)
      );
    else setColumnKey(props?.column?.key + "." + displayFields[index]?.name);
    props?.businessType !== "NUEASSIST" &&
      setVal(
        filterArray[props?.column?.key + "." + displayFields[index]?.name]
      );
  }, []);

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
      <TextField
        value={val}
        placeholder="Search"
        onChange={(e) => onTextChange(e)}
        variant="outlined"
        size="small"
        classes={classes}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleOnSearch();
          }
        }}
        style={{
          height: 28,
          width: "100%",
          fontSize: "14px",
        }}
        InputProps={{
          style: {
            height: "28px",
            fontSize: "14px",
            borderRadius: "50px",
          },
          endAdornment: (
            <InputAdornment position="end">
              <DisplayIconButton
                systemVariant="primary"
                onClick={handleOnSearch}
                style={{ cursor: "pointer", padding: "0px" }}
              >
                <Search style={{ height: "20px" }} />
              </DisplayIconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};
export default ReferenceSearch;
