import React, { useState, useEffect } from "react";
import {
  DisplayFormControl,
  DisplayHelperText,
  DisplayInput,
} from "components/display_components";
import { SystemIcons } from "utils/icons";
import { checkAvailability } from "../unique_check";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import PropTypes from "prop-types";
import { globalProps } from "../global-props";
export const SystemMask = (props) => {
  const {
    callbackError,
    callbackValue,
    data,
    stateParams,
    fieldError,
    testid,
  } = props;

  const fieldmeta = {
    ...SystemMask.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  const {
    canUpdate,
    disable,
    defaultValue,
    name,
    placeHolder,
    required,
    title,
    unique,
    validationRegEx,
    splitBy,
    pattern,
    numOfSplits,
    position,
    mask,
    length,
    maskBy,
    ...others
  } = fieldmeta;
  const { ...rest } = others;
  const regexp = new RegExp(validationRegEx);

  const [error, setError] = useState();
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState();

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const returnSum = (array) => {
    let sum = 0;
    array.map((e) => {
      sum += e;
    });
    return sum;
  };

  let total = returnSum(pattern);
  let input;
  let output = "";
  let modifiedInput;
  let output2 = "";

  const dataInit = (data) => {
    if (data) {
      let input1 = data.replaceAll(splitBy, "");
      let output1 = "";
      let numOfSplits = 0;
      let modifiedInput1 = input1.split("");

      modifiedInput1.map((each1, index1, array1) => {
        if (array1[index1 - 1] === splitBy) {
          numOfSplits++;
        }

        if (
          index1 + 1 <= length + numOfSplits &&
          position === "LEFT" &&
          each1 !== splitBy
        ) {
          output1 += "".concat("", mask ? maskBy : each1);
        } else if (
          index1 + 1 > input1.length - (length + numOfSplits) &&
          position === "RIGHT" &&
          each1 !== splitBy
        ) {
          output1 += "".concat("", mask ? maskBy : each1);
        } else {
          output1 += "".concat("", each1);
        }
      });

      let input2 = output1;

      let modifiedInput2 = input2.split("");

      modifiedInput2.map((each2, index2) => {
        let sum2 = 1;
        pattern.map((e2, i2) => {
          sum2 = sum2 + e2;
          if (index2 + 1 === sum2 && each2 !== splitBy) {
            output2 += "".concat("", `${splitBy}`);
          }
        });

        output2 += "".concat("", each2);
      });
      setValue(output2);
      callbackValue(output2 ? output2 : null, props);
      validateData(output2);
    } else {
      setValue(output2);
    }
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const checkUniqueness = async (value) => {
    showError("Checking Availibility..");
    SystemTimeout(async () => {
      let isUnique = await checkAvailability(fieldmeta, stateParams, value);
      if (isUnique) clearError();
      else showError("Already taken");
    }, 2000);
  };

  const onChange = (data) => {
    if (data) {
      input = data;
      modifiedInput = input.split("");
      let numOfSplits = 0;

      modifiedInput.map((ele) => {
        if (ele === splitBy) {
          numOfSplits++;
        }
      });

      if (input.length <= total + numOfSplits) {
        modifiedInput.map((each, index) => {
          let sum = 0;
          pattern.map((e, i) => {
            sum = sum + 1 + e;
            if (index + 1 === sum && each !== splitBy) {
              output += "".concat("", splitBy);
            } else if (index + 1 === sum && each === splitBy) {
              output += "".concat("", splitBy);
            } else if (index + 1 !== sum && each === splitBy) {
              output += "".concat("", "");
            }
          });

          pattern.map((e, i) => {
            sum = sum + 1 + e;
            if (index + 1 !== sum && each === splitBy) {
              each = "";
            }
          });
          output += "".concat("", each);
        });
        setValue(output);
        callbackValue(data ? data : null, props);
        validateData(data, true);
      }
    } else {
      setValue(data);
    }
  };

  const validateData = (value, uniqueCheck = false) => {
    if (value?.length < total + (pattern.length - 1)) {
      showError("Enter minimum" + `${total}` + "characters");
    } else if (value?.length === total + (pattern.length - 1)) {
      clearError();
    } else {
      required ? showError("Required") : clearError();
    }
  };

  const handleClear = () => {
    setValue("");
  };

  useEffect(() => {
    if (fieldError) showError(fieldError);
    dataInit(data ? data : defaultValue);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    mounted && dataInit(data);
  }, [data, name]);

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <DisplayFormControl
        disabled={!canUpdate || disable}
        required={required}
        error={error}
        testid={testid}
      >
        <div>
          <DisplayInput
            // label={title}
            disabled={!canUpdate || disable}
            error={error}
            testid={fieldmeta.name}
            onChange={(value) => onChange(value)}
            placeholder={placeHolder}
            value={value ? value : ""}
            variant="outlined"
            onClear={handleClear}
            {...globalProps}
            {...rest}
          />
        </div>
        {error && (
          <div className="system-helpertex">
            <DisplayHelperText icon={SystemIcons.Info}>
              {helperText}
            </DisplayHelperText>
          </div>
        )}
      </DisplayFormControl>
    </div>
  );
};

SystemMask.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    required: false,
    visibleOnCsv: false,
  },
};

SystemMask.propTypes = {
  value: PropTypes.string,
  fieldmeta: PropTypes.shape({
    canUpdate: PropTypes.bool,
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    required: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};
