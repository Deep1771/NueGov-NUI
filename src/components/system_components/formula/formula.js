import React, { useState, useEffect } from "react";
import { SystemLabel } from "../index";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import { entity } from "utils/services/api_services/entity_service";
import { isDefined } from "utils/services/helper_services/object_methods";
import {
  DisplayButton,
  DisplayDivider,
  DisplayFormControl,
  DisplayInput,
  DisplayProgress,
  DisplayText,
} from "components/display_components";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemFormula = (props) => {
  const { callbackValue, data, stateParams, formData, testid } = props;
  const fieldmeta = {
    ...SystemFormula.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  const {
    canUpdate,
    disable,
    name,
    noOfDecimals,
    placeHolder,
    required,
    title,
    unique,
    validationRegEx,
    ...others
  } = fieldmeta;

  const { displayOnCsv, info, length, type, visible, visibleOnCsv, ...rest } =
    others;

  const [mounted, setMounted] = useState(false);
  const [computing, setComputing] = useState(false);
  const [value, setValue] = useState();

  const { appname, modulename, groupname, id, mode } = stateParams;
  const fieldDisabled =
    !canUpdate ||
    disable ||
    (["CLONE", "NEW"].includes(mode) && fieldmeta.fields.some((ef) => ef.type));
  const parseNumber = (num) => {
    if (isNaN(num)) return num;
    if (!isDefined(noOfDecimals)) return parseInt(num);
    else return Number(parseFloat(num).toFixed(noOfDecimals));
  };

  // Setters
  const dataInit = (data) => {
    setValue(isDefined(data) && !isNaN(data) ? parseNumber(data) : "");
    callbackValue(isDefined(data) ? parseNumber(data) : null, props);
  };

  //Custom Functions
  const compute = () => {
    setComputing(true);
    let fetchComputation = async () => {
      let params = {
        appname,
        modulename,
        entityname: groupname,
        formulaName: fieldmeta.name,
      };
      if (id) params.entityId = id;
      let val = await entity.create(params, formData);
      if (isDefined(val) && !isNaN(val)) {
        setValue(parseNumber(val));
        callbackValue(parseNumber(val), props);
      }
      setComputing(false);
    };
    fetchComputation();
  };

  const onChange = (data) => {
    setValue(data);
    SystemTimeout(() => {
      callbackValue(isDefined(data) ? parseNumber(data) : null, props);
    }, 500);
  };

  // Use Effects
  useEffect(() => {
    dataInit(isDefined(data) ? data : "");
    setMounted(true);
    fieldmeta.autoCompute && compute();
  }, []);

  useEffect(() => {
    mounted && dataInit(data);
  }, [data, name]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
      }}
    >
      <DisplayFormControl
        disabled={!canUpdate || disable}
        required={required}
        error={false}
        testid={testid}
      >
        <div className="system-component">
          <DisplayText
            style={{
              color: "#5F6368",
              fontWeight: "400",
              fontSize: "12px",
              paddingBottom: "4px",
            }}
          >
            {title}
          </DisplayText>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <DisplayInput
              // label={title}
              hiddenLabe={true}
              error={false}
              onChange={onChange}
              placeholder={placeHolder}
              type="number"
              testid={fieldmeta.name}
              value={isDefined(value) ? value.toString() : ""}
              {...rest}
              {...globalProps}
            />
            <DisplayButton
              disabled={computing || fieldDisabled}
              onClick={compute}
              testid="compute"
            >
              {fieldmeta.buttonLabel || "RECOMPUTE"}
            </DisplayButton>
          </div>
          <div>
            {computing && (
              <DisplayProgress type="linear" style={{ width: "inherit" }} />
            )}
            <ToolTipWrapper
              title={
                fieldmeta?.description && fieldmeta?.description?.length > 57
                  ? fieldmeta?.description
                  : ""
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
                  {fieldmeta?.description && fieldmeta?.description}
                </DisplayText>
              </div>
            </ToolTipWrapper>
          </div>
        </div>
      </DisplayFormControl>
    </div>
  );
};

SystemFormula.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    required: false,
    visibleOnCsv: false,
  },
};

export default GridWrapper(SystemFormula);
