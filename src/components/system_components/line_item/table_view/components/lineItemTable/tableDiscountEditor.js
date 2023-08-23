import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  TextField,
  Input,
  InputAdornment,
  FormControl,
  IconButton,
} from "@material-ui/core";

export const TableDiscountEditor = (props) => {
  const [discountObj, setDiscountObj] = useState({});
  const [discountType, setDiscountType] = useState(null);
  const [discountValue, setDiscountValue] = useState(null);

  useEffect(() => {
    setDiscountObj({
      type: discountType,
      value: discountValue,
    });
  }, [discountType, discountValue]);

  useEffect(() => {
    //updating line value in the main state
    let rowNode = props.api?.getRowNode(props.rowIndex);
    rowNode &&
      rowNode.setDataValue(props.colDef.field, {
        type: discountObj?.type,
        value: discountObj?.value,
      });

    // //updating the final value after the discount is applied
    // let lineValue = props?.data?.lineValue;
    // console.log("the linevalue -> ",lineValue);
    // rowNode.setDataValue("finalValue", lineValue);
  }, [discountObj]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        height: "100%",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flex: 2 }}>
        <Select
          value={discountType}
          onChange={(event) => setDiscountType(event.target.value)}
        >
          <MenuItem value={"%"}>%</MenuItem>
          <MenuItem value={"$"}>$</MenuItem>
        </Select>
      </div>
      <div style={{ display: "flex", flex: 6 }}>
        <input
          onChange={(event) => {
            setDiscountValue(event.target.value);
          }}
          value={discountValue}
        />
      </div>
    </div>
  );
};
