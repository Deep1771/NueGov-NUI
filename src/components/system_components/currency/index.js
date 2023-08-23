import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { isDefined } from "utils/services/helper_services/object_methods";
import { CurrencyTypes } from "./commonCurrency";
import { SystemDecimal, SystemLabel } from "../index";
import {
  DisplayFormControl,
  DisplaySelect,
  DisplayHelperText,
  DisplayText,
} from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemCurrency = (props) => {
  let { data, callbackValue, callbackError, fieldError, testid } = props;
  let fieldmeta = {
    ...SystemCurrency.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    canUpdate,
    defaultValue,
    decimalValue,
    disable,
    name,
    placeHolder,
    required,
    title,
    description,
    ...others
  } = fieldmeta;
  let { displayOnCsv, info, visible, visibleOnCsv, ...rest } = others;

  const { amount } = data ? data : {};
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState({});

  // Setters
  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const dataInit = (data) => {
    getCurrencySymbol(data);
    setValue(data);
    callbackValue(data && Object.keys(data).length ? data : null, props);
    validateData(data);
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const getCurrencySymbol = (data) => {
    if (data && Object.keys(data).length > 0) {
      let currency = data?.currency;
      let currencySymbol = CurrencyTypes?.filter(
        (e) => e?.code === currency
      )[0];
      data.currencySymbol = currencySymbol ? currencySymbol.value : "";
    }
  };

  // Custom Functions
  const handleAmount = (amount) => {
    let val = { ...value };
    if (isDefined(amount)) val = { ...val, amount };
    else delete val.amount;
    dataInit(val);
  };

  const onChange = (currency) => {
    let val = { ...value };
    if (currency) val = { ...val, currency };
    else delete val.currency;
    dataInit(val);
  };

  const validateData = (value) => {
    if (value && Object.keys(value).length) {
      if (isDefined(value.amount) && value.currency) clearError();
      else required ? showError("Required") : clearError();
    } else {
      required ? showError("Required") : clearError();
    }
  };

  // UseEffects
  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data ? data : defaultValue);
    setMounted(true);
  }, []);

  useEffect(() => {
    mounted && dataInit(data);
  }, [data, name]);

  return (
    <div
      style={{
        flexDirection: "column",
        display: "flex",
        flex: 1,
        width: "100%",
      }}
    >
      <DisplayFormControl
        required={required}
        disabled={!canUpdate || disable}
        testid={testid}
      >
        <div style={{ display: "flex" }}>
          <DisplayText
            style={{
              color: "#5F6368",
              fontWeight: "400",
              fontSize: "12px",
            }}
          >
            {title}
          </DisplayText>
          &nbsp;&nbsp;
          {error && (
            <DisplayHelperText icon={SystemIcons.Error}>
              ({helperText})
            </DisplayHelperText>
          )}
        </div>
        <div
          className="system-components"
          style={{
            flexDirection: "row",
            display: "flex",
            flex: 1,
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, display: "flex", alignSelf: "center" }}>
            <DisplaySelect
              disabled={!canUpdate || disable}
              placeHolder={placeHolder}
              error={error}
              testid={"CT" + "-" + fieldmeta.name}
              labelKey="value"
              valueKey="code"
              values={CurrencyTypes}
              multiSelect={false}
              onChange={onChange}
              value={value && value.currency ? value.currency : ""}
              {...globalProps}
            />
          </div>{" "}
          &nbsp;&nbsp;
          <div
            style={{
              flex: 11,
              display: "flex",
              alignItems: "flex-start",
              padding: "0px 0px 0px 2px",
            }}
          >
            <SystemDecimal
              data={amount && isDefined(amount) ? amount : ""}
              callbackValue={handleAmount}
              callbackError={() => {}}
              fieldmeta={{
                name: name,
                type: "DECIMAL",
                placeHolder: placeHolder,
                info: info,
                numberOfDecimals: decimalValue,
                visible: visible,
                minValue: 0,
                canUpdate: canUpdate,
                disable: disable || !value || !value.currency,
                visibleOnCsv: false,
              }}
            />
          </div>
        </div>
        <ToolTipWrapper
          title={description?.length > 57 ? description : ""}
          placement="bottom-start"
        >
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "pre",
              maxWidth: "100%",
              fontSize: "11px",
              opacity: "0.65",
              height: "16px",
            }}
          >
            <DisplayText
              style={{
                fontSize: "11px",
              }}
            >
              {description}
            </DisplayText>
          </div>
        </ToolTipWrapper>
      </DisplayFormControl>
    </div>
  );
};

SystemCurrency.defaultProps = {
  fieldmeta: {
    visible: false,
    canUpdate: false,
    disable: false,
    required: false,
    visibleOnCsv: false,
    decimalValue: 2,
  },
};

SystemCurrency.propTypes = {
  value: PropTypes.string,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    multiple: PropTypes.bool,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemCurrency);
