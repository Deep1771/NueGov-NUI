import React, { useEffect, useMemo, useState } from "react";
import { useAgencySharingValue } from "./../agency_sharing_reducer";
import { getEntityData } from "./../agency_sharing_services";
import { EntityLevel } from "./entity_level";
import { ContextSummary } from "containers/composite_containers/summary_container/components/context_summary";
import {
  DisplayCard,
  DisplayFormControl,
  DisplayGrid,
  DisplayHelperText,
  DisplayIconButton,
  DisplayIcon,
  DisplayText,
} from "components/display_components/";
import { SystemLabel } from "../../label";
import { ContextMenuWrapper } from "components/wrapper_components/context_menu";
import { SystemIcons } from "utils/icons";

export const ContextPermission = (props) => {
  const {
    callbackError,
    callbackValue,
    data,
    fieldError,
    formData,
    stateParams,
    testid,
  } = props;
  const fieldmeta = {
    ...ContextPermission.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  const { canUpdate, disable, info, required, title } = fieldmeta;

  const [{ sharedAgencies }, dispatch] = useAgencySharingValue();

  const { Add, Clear, Info, MoreHorizontal } = SystemIcons;

  const [error, setError] = useState();
  const [helperText, setHelperText] = useState();
  const [selectedAgency, setSelectedAgency] = useState();
  const [shareeAgency, setShareeAgency] = useState();
  const [showContext, setShowContext] = useState(false);
  const [showAgencyList, setAgencyList] = useState(false);

  let agencyObject;

  //callback functions

  const closeHandler = () => {
    setSelectedAgency(null);
    setShowContext(false);
  };

  const handleCancel = (value) => {
    setAgencyList(false);
    if (value.data.length > 0) {
      let response;
      let array = value.data.map((eachValue) => ({
        id: eachValue.sys_agencyId,
        sys_gUid: eachValue.sys_gUid,
        name: eachValue.sys_entityAttributes.Name,
      }));

      if (sharedAgencies.length === 0) {
        response = array;
      } else {
        response = sharedAgencies.concat(
          array.filter(
            (eachObj) =>
              !sharedAgencies.some(
                (existedAgency) => existedAgency.id === eachObj.id
              )
          )
        );
      }

      dispatch({
        type: "SET_SHARED_AGENCIES",
        payload: response,
      });
    } else {
      let response = sharedAgencies;
      dispatch({
        type: "SET_SHARED_AGENCIES",
        payload: response,
      });
    }
  };

  const saveHandler = (permissionObject, localTransitive, agencySelected) => {
    dispatch({
      type: "SET_PERMISSION_TO_AGENCY",
      payload: {
        agencySelected: agencySelected.id,
        permissionObject: permissionObject,
        transitiveObject: localTransitive,
      },
    });
    setSelectedAgency(null);
    setShowContext(false);
  };

  //custom functions
  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const deleteHandler = (eachAgency) => {
    let payload = sharedAgencies.filter(
      (eachObject) => eachObject.id !== eachAgency.id
    );
    dispatch({
      type: "DELETE_AGENCY",
      payload: payload,
    });
  };

  const init = async () => {
    agencyObject =
      formData.sys_entityAttributes &&
      formData.sys_entityAttributes.shareeAgency
        ? formData.sys_entityAttributes.shareeAgency
        : {};
    if (Object.keys(agencyObject).length > 0) {
      let shareePermission = (
        await getEntityData({
          appname: "NueGov",
          modulename: "Admin",
          entityname: "Agency",
          id: agencyObject.id,
        })
      ).sys_entityAttributes.agencyPermission;
      setShareeAgency(shareePermission);
    } else setShareeAgency({});
  };

  const moreHandler = (eachAgency) => {
    setSelectedAgency(eachAgency);
    setShowContext(true);
    dispatch({
      type: "SET_PERMISSION_OBJECT",
      payload: eachAgency.id,
    });
  };

  const showError = (msg) => {
    if (stateParams.mode !== "READ") {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    } else {
      callbackError(null, props);
      setError(false);
      setHelperText();
    }
  };

  //useEffects
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (fieldError) {
      showError(fieldError);
    }
    data
      ? dispatch({
          type: "SET_SHARED_AGENCIES",
          payload: data.sharedAgencies,
        })
      : dispatch({
          type: "SET_SHARED_AGENCIES",
          payload: [],
        });
  }, [data]);

  useEffect(() => {
    init();
  }, [
    formData &&
      formData.sys_entityAttributes &&
      formData.sys_entityAttributes.shareeAgency,
  ]);

  useEffect(() => {
    stateParams.mode !== "READ" && required && !sharedAgencies.length > 0
      ? showError()
      : clearError();
    callbackValue(
      {
        shareeAgency:
          formData &&
          formData.sys_entityAttributes &&
          formData.sys_entityAttributes.shareeAgency
            ? formData.sys_entityAttributes.shareeAgency
            : {},
        sharedAgencies: sharedAgencies,
      },
      props
    );
  }, [shareeAgency, sharedAgencies]);

  return useMemo(
    () => (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <DisplayFormControl
          disabled={!canUpdate || disable}
          required={required}
          error={error}
          testid={testid}
        >
          <div className="system-label">
            <SystemLabel
              toolTipMsg={info}
              required={required}
              error={error}
              filled={!error && sharedAgencies.length > 0}
            >
              {" "}
              {title}
            </SystemLabel>
          </div>
          <div className="system-component" style={{ margin: "1% 0% 0% 0%" }}>
            {
              <ContextMenuWrapper
                options={{
                  hideTitlebar: true,
                }}
                visible={showContext && Object.keys(shareeAgency).length > 0}
                width="70%"
              >
                <EntityLevel
                  shareeAgencyPermission={shareeAgency}
                  sharedAgencyPermission={selectedAgency}
                  onSave={saveHandler}
                  onClose={closeHandler}
                  mode={stateParams.mode}
                />
              </ContextMenuWrapper>
            }

            <DisplayGrid item xs={12} container spacing={3}>
              {sharedAgencies && sharedAgencies.length > 0
                ? sharedAgencies.map((eachAgency, i) => {
                    return (
                      <DisplayGrid item key={i} style={{ width: "250px" }}>
                        <DisplayCard
                          elevation={1}
                          style={{
                            height: "100px",
                            width: "100%",
                          }}
                          testid={`agency-sharing-${eachAgency.name}-${eachAgency.id}`}
                          systemVariant={
                            selectedAgency &&
                            selectedAgency.id === eachAgency.id
                              ? "primary"
                              : "default"
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              height: "100%",
                              width: "100%",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flex: 8,
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    marginLeft: "15px",
                                  }}
                                >
                                  <DisplayText
                                    testid={`agency-sharing-agencytitle-${eachAgency.name}`}
                                  >
                                    {eachAgency.name}
                                  </DisplayText>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flex: 4,
                                  flexDirection: "row-reverse",
                                }}
                              >
                                <DisplayIconButton
                                  testid={`agency-sharing-${eachAgency.name}-${eachAgency.id}-clear`}
                                  onClick={() => deleteHandler(eachAgency)}
                                  disabled={
                                    stateParams.mode === "READ" ? true : false
                                  }
                                  systemVariant={
                                    selectedAgency &&
                                    selectedAgency.id === eachAgency.id
                                      ? "default"
                                      : "primary"
                                  }
                                >
                                  <Clear style={{ fontSize: 16 }} />
                                </DisplayIconButton>
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row-reverse",
                                  flex: 3,
                                  justifyContent: "flex-start",
                                  alignItems: "center",
                                  height: "100%",
                                }}
                              >
                                <DisplayIconButton
                                  testid={`agency-sharing-${eachAgency.name}-${eachAgency.id}-more`}
                                  onClick={() => moreHandler(eachAgency)}
                                  systemVariant={
                                    selectedAgency &&
                                    selectedAgency.id === eachAgency.id
                                      ? "default"
                                      : "primary"
                                  }
                                >
                                  <MoreHorizontal />
                                </DisplayIconButton>
                              </div>
                            </div>
                          </div>
                        </DisplayCard>
                      </DisplayGrid>
                    );
                  })
                : required
                ? showError("required")
                : clearError()}
              {stateParams.mode !== "READ" && (
                <DisplayGrid item style={{ width: "250px" }}>
                  <DisplayCard
                    testid={`agency-sharing-addagency`}
                    elevation={1}
                    style={{
                      height: "100px",
                      width: "100%",
                    }}
                    onClick={() => {
                      setAgencyList(true);
                    }}
                    systemVariant="primary"
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        height: "100%",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flex: 4,
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <DisplayIcon
                          name={Add}
                          size="large"
                          systemVariant="default"
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          flex: 8,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <DisplayText variant="subtitle1">
                          Click here to add agency
                        </DisplayText>
                      </div>
                    </div>
                  </DisplayCard>
                </DisplayGrid>
              )}
            </DisplayGrid>
            {
              <ContextMenuWrapper
                options={{
                  hideTitlebar: true,
                }}
                visible={showAgencyList}
                width="40%"
              >
                {showAgencyList && (
                  <ContextSummary
                    appName="NueGov"
                    moduleName="Admin"
                    entityName="Agency"
                    summaryMode="context_summary"
                    handleCancel={handleCancel}
                    options={{
                      select: "multiple",
                      selectedIds: sharedAgencies,
                    }}
                  />
                )}
              </ContextMenuWrapper>
            }
          </div>
          {error && (
            <div className="system-helpertext">
              <DisplayHelperText icon={Info}>{helperText}</DisplayHelperText>
            </div>
          )}
        </DisplayFormControl>
      </div>
    ),
    [
      required,
      error,
      helperText,
      sharedAgencies,
      shareeAgency,
      showContext,
      showAgencyList,
      title,
      stateParams.mode,
    ]
  );
};

ContextPermission.defaultProps = {
  fieldmeta: {
    disable: false,
    canUpdate: true,
    required: false,
    info: "select agencies to share the data",
  },
};
