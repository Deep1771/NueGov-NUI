import React, { useState, useEffect } from "react";
import { DisplayText, DisplayDivider } from "components/display_components";
import { Select, MenuItem } from "@material-ui/core";

export const SystemLineItemTotal = (props) => {
  let { fieldmeta, callbackValue, stateParams, formData, data } = props || {};
  let { sys_topLevel } = stateParams?.metadata?.sys_entityAttributes || {};
  let deiscriptionMode = stateParams.mode === "NEW" ? true : false;

  let lineItemDefinations = sys_topLevel?.filter(
    (fl) => fl.type === "LINEITEM"
  );
  let lineItmesDetails = {};
  lineItemDefinations.map((el) => {
    lineItmesDetails[`${el.name}`] = 0;
  });

  let [fieldValue, setFieldValue] = useState({
    total: 0,
    ...lineItmesDetails,
    discount: {
      type: "%",
      value: "",
    },
  });

  let getAllLineItemsCost = () => {
    return lineItemDefinations?.map((eachItem) => {
      return (
        <div
          style={{ display: "flex", flex: 1, justifyContent: "space-between" }}
        >
          <DisplayText
            style={{ fontWeight: 400 }}
          >{`${eachItem?.title} Cost`}</DisplayText>
          <DisplayText>{`$ ${fieldValue?.[eachItem?.name]}`}</DisplayText>
        </div>
      );
    });
  };

  let rendarDiscount = () => {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: ".6rem",
        }}
      >
        <div style={{ display: "flex" }}>
          <DisplayText>Discount</DisplayText>
        </div>
        <div style={{ display: "flex" }}>
          <Select
            defaultValue={"%"}
            value={fieldValue?.discount?.type}
            onChange={(event) => {
              setFieldValue((prevState) => ({
                ...prevState,
                discount: {
                  ...prevState?.discount,
                  type: event.target.value,
                },
              }));
            }}
            style={{ display: "flex", marginLeft: ".2rem", color: "blue" }}
          >
            <MenuItem value={"%"}>%</MenuItem>
            <MenuItem value={"$"}>$</MenuItem>
          </Select>
          <input
            style={{ outline: "solid white", width: "60px" }}
            onChange={(event) => {
              setFieldValue((prevState) => ({
                ...prevState,
                discount: {
                  ...prevState?.discount,
                  value: event.target.value,
                },
              }));
            }}
            value={fieldValue?.discount?.value}
          />
        </div>
      </div>
    );
  };

  //to update the totalcost when form data changes
  useEffect(() => {
    let newFieldValue = {
      ...fieldValue,
    };

    //adding updated linevaue total to loacl state
    let lineItemsTotalValue = lineItemDefinations?.map((eachItem) => {
      newFieldValue[eachItem.name] =
        formData?.sys_entityAttributes?.[eachItem?.name]?.["total"];
      return formData?.["sys_entityAttributes"]?.[eachItem?.name];
    });

    lineItemsTotalValue = lineItemsTotalValue
      .map((el) => el?.total)
      .filter((fl) => !["", null, undefined, 0].includes(fl));

    //to calculate the total of all lineitems total
    let grandTotal = lineItemsTotalValue.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

    //applying the discount
    if (newFieldValue?.discount?.type === "%") {
      grandTotal =
        grandTotal - (newFieldValue?.discount?.value / 100) * grandTotal;
    } else if (newFieldValue?.discount?.type === "$") {
      grandTotal = grandTotal - newFieldValue?.discount?.value;
    }

    //update the local state with new lineitems total value
    setFieldValue({ ...newFieldValue, total: grandTotal });
  }, [JSON.stringify(formData)]);

  //to set the already saved data
  useEffect(() => {
    callbackValue(data ? data : null, props);
    setFieldValue(data);
  }, []);

  //to update the formdata when ever the value changes
  useEffect(() => {
    callbackValue(fieldValue, props);
  }, [JSON.stringify(fieldValue)]);

  return (
    <>
      {deiscriptionMode ? (
        <DisplayText style={{ fontSize: "16", fontWeight: "500" }}>
          {fieldmeta.description
            ? fieldmeta.description
            : "comes from description key from metadata def"}
        </DisplayText>
      ) : (
        <div
          style={{
            display: "flex",
            width: "30%",
            margin: ".8rem",
            flexDirection: "column",
          }}
        >
          <DisplayText variant="h6" style={{ fontWeight: "600" }}>
            {fieldmeta?.title}
          </DisplayText>
          {getAllLineItemsCost()}
          <div style={{ display: "flex", alignItems: "center" }}>
            {rendarDiscount()}
          </div>
          <br />
          <DisplayDivider />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "1rem",
            }}
          >
            <DisplayText style={{ fontWeight: 500 }}>Total</DisplayText>
            <DisplayText>{`$ ${
              fieldValue?.total < 0 ? 0 : fieldValue?.total
            }`}</DisplayText>
          </div>
        </div>
      )}
    </>
  );
};
