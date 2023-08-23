import React, { useState, useEffect, startTransition } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { v4 as uuidv4 } from "uuid";

import PropTypes from "prop-types";
import {
  DisplayCheckbox,
  DisplayFormControl,
  DisplayFormGroup,
  DisplayHelperText,
  DisplayIcon,
  DisplayIconButton,
} from "../../display_components";
import { SystemLabel } from "../index";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { SystemIcons } from "utils/icons";
import { ToolTipWrapper } from "components/wrapper_components";
import { ThemeFactory } from "utils/services/factory_services";
import { DisplayText } from "../../display_components";
import Stylesheet from "utils/stylesheets/display_component";

const useStyles = makeStyles(() => ({
  main: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingRight: "1.5rem",
  },
}));

export const SystemCheckbox = (props) => {
  let { data, callbackValue, callbackError, fieldError, testid } = props;
  const classes = useStyles();
  let fieldmeta = {
    ...SystemCheckbox.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    canUpdate,
    defaultValue,
    disable,
    name,
    required,
    title,
    values,
    ...others
  } = fieldmeta;
  let {
    displayOnCsv,
    info,
    placeHolder,
    type,
    visible,
    visibleOnCsv,
    ...rest
  } = others;
  const selectAllMeta = values.filter((e) => e.id === "selectAll");
  values = values.filter((e) => e.id !== "selectAll");
  let [error, setError] = useState(false);
  let [helperText, setHelperText] = useState();
  let [valueArray, setValueArray] = useState([]);
  let [selectAllValue, setSelectAllValue] = useState(false);

  const { getVariantForComponent } = ThemeFactory();
  const { useCheckboxStyles } = Stylesheet();
  const defaultVariant = "primary";
  const checkboxClasses = useCheckboxStyles(
    getVariantForComponent("displayCheckBox", defaultVariant)
  );

  useEffect(() => {
    if (fieldError) showError(fieldError);
    setValueArray(data ? data : defaultValue ? defaultValue : []);
    if (data?.length === values?.length) setSelectAllValue(true);
  }, [data, name]);

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  let checkSelected = (val) => valueArray.some((a) => a == val);
  let findValueIndex = (val) => valueArray.findIndex((a) => a == val);

  useEffect(() => {
    // startTransition(()=>{
    callbackValue(valueArray.length ? valueArray : null, props);
    // })
    if (required && !valueArray.length) {
      showError("Required");
    } else clearError();
  }, [valueArray.length]);

  const handleChange = (flag, val) => {
    let arr = [];
    if (!flag) {
      let checkIncludes = values.reduce((cond, option) => {
        if (option?.includeValues) {
          if (
            option.includeValues.includes(val.value) &&
            valueArray.includes(option.value)
          )
            cond = true;
        }
        return cond;
      }, false);

      if (!checkIncludes) {
        arr = [...valueArray];
        arr.splice(findValueIndex(val.value), 1);
      }
    } else {
      if (val.includeValues && val.includeValues.length)
        arr = [...new Set([...valueArray, val.value, ...val.includeValues])];
      else arr = [...valueArray, val.value];
    }
    setValueArray(arr);
  };

  const handleSelectAll = (flag) => {
    let checkboxValues = values.map((e) => {
      return e.value;
    });
    if (!flag) {
      setSelectAllValue(false);
      setValueArray([]);
    } else {
      setSelectAllValue(true);
      setValueArray(checkboxValues);
    }
  };

  const handleClear = () => {
    setValueArray([]);
    setSelectAllValue(false);
  };

  useEffect(() => {
    if (selectAllMeta.length > 0) {
      values.filter((e) => e.id !== "selectAll");
      if (valueArray.length === values.length) setSelectAllValue(true);
      else setSelectAllValue(false);
    }
  }, [JSON.stringify(valueArray)]);

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <DisplayFormControl
        required={required}
        disabled={!canUpdate || disable}
        error={error}
        testid={testid}
        className={classes.main}
      >
        <div>
          <SystemLabel
            toolTipMsg={info}
            required={required}
            error={error}
            filled={!error && valueArray.length}
          >
            <DisplayText variant="caption" style={{ color: "#5F6368" }}>
              {title}
            </DisplayText>
          </SystemLabel>
          {error && (
            <div className="system-helpertext">
              <DisplayHelperText icon={SystemIcons.Info}>
                {helperText}
              </DisplayHelperText>
            </div>
          )}
        </div>
        <div className="system-components">
          <DisplayFormGroup row className={classes.label}>
            {values.map((val, i) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkSelected(val.value)}
                    disabled={!canUpdate || disable}
                    error={error}
                    key={uuidv4()}
                    size="small"
                    testid={fieldmeta.name + "-" + val.value}
                    onChange={(e) => {
                      handleChange(e.target.checked, val);
                    }}
                    classes={{
                      root: checkboxClasses.root,
                      checked: checkboxClasses.checked,
                      disabled: checkboxClasses.disabled,
                    }}
                    {...rest}
                  />
                }
                label={val.value}
              />
            ))}
            {selectAllMeta.length > 0 && (
              <DisplayFormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAllValue === true}
                      disabled={!canUpdate || disable}
                      error={error}
                      key="selectAllCheckboxes"
                      size="small"
                      testid={fieldmeta.name + "- selectAllCheckboxes"}
                      onChange={(e) => {
                        handleSelectAll(e.target.checked, selectAllMeta[0]);
                      }}
                      classes={{
                        root: checkboxClasses.root,
                        checked: checkboxClasses.checked,
                        disabled: checkboxClasses.disabled,
                      }}
                      {...rest}
                    />
                  }
                  label={selectAllMeta[0].value}
                ></FormControlLabel>
              </DisplayFormGroup>
            )}
            {!disable && canUpdate && valueArray.length > 0 && (
              <DisplayIconButton onClick={handleClear} size="small">
                <DisplayIcon name={SystemIcons.Close}></DisplayIcon>
              </DisplayIconButton>
            )}
          </DisplayFormGroup>
        </div>
        <ToolTipWrapper
          title={
            fieldmeta?.description?.length > 57 ? fieldmeta?.description : ""
          }
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
              {fieldmeta?.description}
            </DisplayText>
          </div>
        </ToolTipWrapper>
      </DisplayFormControl>
    </div>
  );
};

SystemCheckbox.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    required: false,
    visibleOnCsv: false,
  },
};
SystemCheckbox.propTypes = {
  data: PropTypes.string,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    values: PropTypes.array,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemCheckbox);
