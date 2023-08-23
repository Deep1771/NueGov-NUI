import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  DisplayFormControl,
  DisplayInput,
  DisplayText,
} from "components//display_components";
import { SystemLabel } from "../index";
import { GridWrapper } from "components//wrapper_components/grid_wrapper";
import { entity } from "../../../utils/services/api_services/entity_service";
import { UserFactory } from "utils/services/factory_services";
import { useDetailData } from "../../../containers/composite_containers/detail_container/detail_state";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

export const SystemSequence = (props) => {
  const { callbackValue, data, stateParams, testid } = props;
  const { mode } = stateParams;
  const fieldmeta = {
    ...SystemSequence.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  const {
    title,
    type,
    prefix,
    initialCount,
    placeHolder,
    required,
    step,
    ...rest
  } = fieldmeta;

  const { getAgencyId, getRole } = UserFactory();
  const { metadata } = useDetailData() || {};
  const [sequence, setSequence] = useState();
  const groupname =
    metadata?.sys_entityAttributes?.sys_templateGroupName?.sys_groupName;

  useEffect(() => {
    if (["NEW", "CLONE"].includes(mode)) {
      const agency_id = getAgencyId;
      const promise = Promise.resolve(
        entity.get({
          appname: "NJAdmin",
          modulename: "NJ-SysTools",
          entityname: "Sequence",
          agencyid: agency_id,
          groupname: groupname,
        })
      );
      promise.then((res) => {
        if (res.length === 0) {
          let value = `${prefix}${initialCount}`;
          setSequence(value);
          callbackValue(value, props);
        } else {
          let { initialCount, currentCount } = res[0].sys_entityAttributes;
          let incrementalStep = step ? step : 1;
          let value = parseInt(currentCount) + incrementalStep;
          value = `${prefix}${value
            .toString()
            .padStart(initialCount.length, 0)}`;
          setSequence(value);
          callbackValue(value, props);
        }
      });
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
      }}
    >
      <DisplayFormControl disabled={true} required={required} testid={testid}>
        <div className="system-components">
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
          <DisplayInput
            {...globalProps}
            testid={fieldmeta.name}
            disabled={true}
            value={["NEW", "CLONE"].includes(mode) ? sequence : data}
            type="text"
            // label={title}
          />
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
        </div>
      </DisplayFormControl>
    </div>
  );
};
SystemSequence.defaultProps = {
  fieldmeta: {
    visible: false,
    required: false,
    visibleOnCsv: false,
    displayOnCsv: true,
  },
};
SystemSequence.propTypes = {
  data: PropTypes.number,
  fieldmeta: PropTypes.shape({
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    info: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    required: PropTypes.bool,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemSequence);
