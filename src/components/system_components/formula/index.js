import React, { useState, useEffect } from "react";
import { DisplayText } from "components/display_components/text";
import PropTypes from "prop-types";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
const dotProp = require("dot-prop");

export const SystemFormula = (props) => {
  const [computedValue, setcomputedValue] = useState();
  const { data, callbackValue } = props;
  const { dataType, expression, fields, title } = props.fieldmeta;

  useEffect(() => {
    if (valueExists(fields))
      dataType === "DATERANGE" ? dateEvaluator() : expEvaluator();
    else setcomputedValue("Calculating........");
  }, [data]);

  const dateEvaluator = () => {
    const obValues = fields.map((field) =>
      dotProp.get(data, `sys_entityAttributes.${field.path}`)
    );
    const date1 = new Date(obValues[0]);
    const date2 = new Date(obValues[1]);

    let res = Math.abs(date1 - date2) / 1000;
    let diffDays = Math.floor(res / 86400);
    let diffHours = Math.floor(res / 3600) % 24;
    let diffMinutes = Math.floor(res / 60) % 60;
    let diffSeconds = res % 60;

    return setcomputedValue(
      `${diffDays} days, ${diffHours} hrs, ${diffMinutes} mins and ${diffSeconds} secs`
    );
  };

  const expEvaluator = () => {
    let newe = fields.reduce((finalExp, exp) => {
      let regex = new RegExp(exp.name, "g");
      return finalExp.replace(
        regex,
        exp.path ? `data.sys_entityAttributes.${exp.path}` : exp.value
      );
    }, expression);
    return setcomputedValue(eval(newe));
  };

  const valueExists = (fields) => {
    return fields.every((field) => {
      if (field.path)
        return dotProp.get(data, `sys_entityAttributes.${field.path}`);
      else return field.hasOwnProperty("value");
    });
  };

  return (
    <div>
      <DisplayText variant={"h4"}>{title}</DisplayText>:
      <DisplayText variant={"h4"}>{computedValue} </DisplayText>
    </div>
  );
};

SystemFormula.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  fieldmeta: PropTypes.shape({
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visible: PropTypes.bool,
  }),
};

export default GridWrapper(SystemFormula);
