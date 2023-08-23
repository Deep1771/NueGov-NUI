import React, { useState, useEffect, useContext } from "react";
import { Controller } from "react-hook-form";
import { EntitySelector } from "components/helper_components";
import {
  DisplaySwitch,
  DisplayInput,
  DisplayDivider,
  DisplayProgress,
  DisplayText,
  DisplayGrid,
} from "components/display_components";
import { useFormContext, useWatch } from "react-hook-form";
import RuleBuilder from "./rule_builder";
import { SystemReference } from "components/system_components";
import { entityTemplate } from "utils/services/api_services/template_service";
import { AGENCY_REFERENCE, REFERENCE_SHELL } from "../constants";
import { TriggerContext } from "../index";
import { UserFactory } from "utils/services/factory_services";

const MainContainer = () => {
  const [loader, setLoader] = useState(false);
  const [triggerState, dispatch] = useContext(TriggerContext);
  const { template, data, detailMode } = triggerState;
  const {
    watch,
    control,
    formState: { errors },
  } = useFormContext();

  const { isNJAdmin } = UserFactory();

  const watchEntity = useWatch({
    control,
    name: "entityInfo",
    defaultValue: {},
  });

  const { appName, groupName: entityName, moduleName } = watchEntity || {};

  const fetchTempalte = async (t) => {
    setLoader(true);
    dispatch({
      type: "SET_TRIGGER_TEMPLATE",
      payload: undefined,
    });
    try {
      const {
        appName: appname,
        moduleName: modulename,
        groupName: groupname,
      } = t;

      let res = await entityTemplate.get({
        appname,
        modulename,
        groupname,
      });
      dispatch({
        type: "SET_TRIGGER_TEMPLATE",
        payload: res,
      });
      setLoader(false);
    } catch (e) {
      setLoader(false);
      console.log(e);
    }
  };

  useEffect(() => {
    if (data?.sys_entityAttributes?.entityInfo) {
      if (!template) fetchTempalte(data?.sys_entityAttributes?.entityInfo);
    }

    return () => {
      let formValues = watch();
      dispatch({
        type: "UPDATE_TRIGGER_FORM",
        payload: formValues,
      });
    };
  }, []);

  const renderMainInfo = () => {
    return (
      <div
        style={{
          display: "flex",
          flexShrink: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Controller
          name="title"
          rules={{ required: true }}
          render={({ field: { onChange, onClear, ...rest } }) => (
            <DisplayInput
              error={Boolean(errors?.title)}
              placeholder="Enter Notification title"
              label="Notification title"
              onChange={onChange}
              variant="outlined"
              onClear={() => onChange("")}
              style={{ width: "250px", marginRight: "10px" }}
              helperText={errors?.title ? "This field is required" : ""}
              {...rest}
            />
          )}
        />
        <div style={{ display: "flex", flexDirection: "row" }}>
          {!detailMode && (
            <Controller
              name="entityInfo"
              rules={{ required: true }}
              render={({ field: { onChange, ...props } }) => (
                <EntitySelector
                  error={Boolean(errors?.entityInfo)}
                  // defaultValue={data?.sys_entityAttributes?.entityInfo}
                  onChange={(t) => {
                    // dispatch({
                    //   type: "UPDATE_TRIGGER_FORM",
                    //   payload: { entityInfo: t },
                    // });
                    fetchTempalte(t);
                    onChange(t);
                  }}
                  helperText={
                    errors?.entityInfo ? "This field is required" : ""
                  }
                  {...props}
                  style={{
                    width: "250px",
                    marginTop: "0px",
                    marginRight: "10px",
                  }}
                />
              )}
            />
          )}
          <Controller
            name="notify"
            defaultValue={true}
            render={({ field: { value, ...props } }) => (
              <DisplaySwitch
                label="Notify"
                labelPlacement="end"
                onlyValue={true}
                checked={value}
                value={value}
                {...props}
              />
            )}
          />
        </div>
      </div>
    );
  };

  const renderAgencyInfo = () => {
    return (
      <div
        style={{
          display: "flex",
          flexShrink: 1,
          flexDirection: "row",
        }}
      >
        <DisplayGrid container>
          <DisplayGrid item xs={12} sm={6} md={6} lg={6}>
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              <div style={{ display: "flex", width: 400 }}>
                <Controller
                  name={AGENCY_REFERENCE.name}
                  render={({ field: { onChange } }) => (
                    <SystemReference
                      stateParams="NEW"
                      callbackError={(e) => {}}
                      callbackValue={(data) => {
                        onChange(data);
                      }}
                      showLabel={false}
                      data={data?.sys_entityAttributes[AGENCY_REFERENCE.name]}
                      fieldmeta={AGENCY_REFERENCE}
                    />
                  )}
                />
              </div>
            </div>
          </DisplayGrid>

          {/* <DisplayGrid item xs={12} sm={6} md={6} lg={6}>
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "flex-start",
              }}
            >
              <div style={{ display: "flex", width: 400 }}>
                <Controller
                  name={REFERENCE_SHELL.name}
                  render={({ field: { onChange } }) => (
                    <SystemReference
                      stateParams="NEW"
                      callbackError={(e) => {}}
                      callbackValue={(data) => {
                        onChange(data);
                      }}
                      showLabel={false}
                      data={data?.sys_entityAttributes[REFERENCE_SHELL.name]}
                      fieldmeta={{
                        ...REFERENCE_SHELL,
                        appName,
                        moduleName,
                        entityName,
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </DisplayGrid> */}
        </DisplayGrid>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      {renderMainInfo()}
      {isNJAdmin() && !detailMode && renderAgencyInfo()}
      <br />
      <DisplayDivider />
      <br />
      {!loader ? (
        template && <RuleBuilder />
      ) : (
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <DisplayProgress />
          <br />
          <DisplayText style={{ color: "#666666" }}>
            Loading rules...
          </DisplayText>
        </div>
      )}
    </div>
  );
};

export default MainContainer;
