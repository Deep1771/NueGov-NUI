import React, { useState } from "react";
import { makeStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import { useAgencySharingValue } from "../../agency_sharing_reducer";
import {
  checkAllTopFields,
  checkTopField,
  checkTopHeader,
} from "../../agency_sharing_services";
import { ComponentLevel } from "../component_level";
import {
  DisplayButton,
  DisplayCheckbox,
  DisplayGrid,
  DisplayTabs,
  DisplayText,
} from "components/display_components";
import { styles } from "../../styles";

const useStyles = makeStyles(styles);
const READOBJ = { read: true },
  WRITEOBJ = { ...READOBJ, write: true };

export const TopLevel = (props) => {
  const { mode, onClose, onSave, selectedEntity } = props;
  const classes = useStyles();
  const [
    { componentLevelPermission, permission, topLevelPermission },
    dispatch,
  ] = useAgencySharingValue();
  const [selectedLevel, setLevel] = useState("topSectionArray");

  //local variables
  const ACCESS = permission.find(
    (eachObject) => eachObject.name === selectedEntity.name
  ).access;
  const TABS = [
    {
      label: "TOPLEVEL",
      value: "topSectionArray",
      visible:
        selectedEntity &&
        selectedEntity.topSectionArray &&
        selectedEntity.topSectionArray.length > 0,
    },
    {
      label: "COMPONENTLEVEL",
      value: "componentArray",
      visible:
        selectedEntity &&
        selectedEntity.componentArray &&
        selectedEntity.componentArray.length > 0,
    },
  ];

  const handleChange = (level) => {
    return setLevel(level);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flex: 0.5 }}>
        <DisplayGrid item container xs={12}>
          <DisplayTabs
            tabs={TABS.filter((eachTab) => eachTab.visible)}
            defaultSelect={selectedLevel}
            titleKey="label"
            valueKey="value"
            onChange={handleChange}
          ></DisplayTabs>
        </DisplayGrid>
      </div>

      <div style={{ display: "flex", flex: 10, overflowY: "scroll" }}>
        {selectedLevel === "topSectionArray" && (
          <DisplayGrid
            container
            className={classes.mainContainer}
            alignContent="flex-start"
          >
            <DisplayGrid container item xs={12} sm={12} md={12} lg={6}>
              <DisplayGrid
                container
                item
                xs={12}
                className={classes.eachItem}
                direction="row-reverse"
              >
                <DisplayGrid
                  container
                  item
                  xs={4}
                  style={{ padding: "0% 0% 0% 1%" }}
                >
                  <DisplayText> W </DisplayText>
                </DisplayGrid>
                <DisplayGrid
                  container
                  item
                  xs={2}
                  style={{ padding: "0% 0% 0% 1%" }}
                >
                  <DisplayText> R </DisplayText>
                </DisplayGrid>
              </DisplayGrid>

              <DisplayGrid
                container
                item
                xs={12}
                className={classes.eachItem}
                direction="row-reverse"
              >
                <DisplayGrid container item xs={4}>
                  <DisplayCheckbox
                    testid={`agency-sharing-toplevel-allfields-write`}
                    checked={checkAllTopFields(
                      topLevelPermission,
                      [selectedEntity],
                      "write"
                    )}
                    disabled={mode !== "READ" && ACCESS.write ? false : true}
                    onChange={(checked) => {
                      let allFieldWritePermission =
                        selectedEntity.topSectionArray.reduce(
                          (accumulator, eachObj) => {
                            let allFields = eachObj.fields.map((eachField) => ({
                              name: eachField.name,
                              title: eachField.title,
                              access: checked ? WRITEOBJ : READOBJ,
                            }));
                            let newaccumulator = accumulator.concat(allFields);
                            return newaccumulator;
                          },
                          []
                        );

                      dispatch({
                        type: "SET_ALL_TOP_FIELDS",
                        payload: allFieldWritePermission,
                      });
                    }}
                  />
                </DisplayGrid>
                <DisplayGrid container item xs={2}>
                  <DisplayCheckbox
                    testid={`agency-sharing-toplevel-allfields-read`}
                    checked={checkAllTopFields(
                      topLevelPermission,
                      [selectedEntity],
                      "read"
                    )}
                    disabled={mode !== "READ" && ACCESS.read ? false : true}
                    onChange={(checked) => {
                      let allFieldReadPermission =
                        selectedEntity.topSectionArray.reduce(
                          (accumulator, eachObj) => {
                            let allFields = eachObj.fields.map((eachField) => ({
                              name: eachField.name,
                              title: eachField.title,
                              access: READOBJ,
                            }));
                            let newaccumulator = accumulator.concat(allFields);
                            return newaccumulator;
                          },
                          []
                        );

                      dispatch({
                        type: checked
                          ? "SET_ALL_TOP_FIELDS"
                          : "RESET_ALL_TOP_FIELDS",
                        payload: allFieldReadPermission,
                      });
                    }}
                  />
                </DisplayGrid>
              </DisplayGrid>
            </DisplayGrid>

            {selectedEntity.topSectionArray.map((eachHeading, i) => {
              return (
                <>
                  <DisplayGrid container item xs={12} key={i}>
                    <DisplayGrid
                      container
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={6}
                      alignItems="center"
                      className={classes.eachHeading}
                    >
                      <DisplayGrid container item xs={6} alignItems="center">
                        <DisplayText style={{ fontWeight: 800 }}>
                          {" "}
                          {eachHeading.title}{" "}
                        </DisplayText>
                      </DisplayGrid>
                      <DisplayGrid container item xs={2}>
                        <DisplayCheckbox
                          testid={`agency-sharing-toplevel-${eachHeading.name}-read`}
                          checked={checkTopHeader(
                            topLevelPermission,
                            eachHeading,
                            "read"
                          )}
                          disabled={
                            mode !== "READ" && ACCESS.read ? false : true
                          }
                          onChange={(checked) => {
                            const allReadPermission = eachHeading.fields.map(
                              (eachField) => {
                                return {
                                  name: eachField.name,
                                  title: eachField.title,
                                  access: READOBJ,
                                };
                              }
                            );
                            dispatch({
                              type: checked
                                ? "SET_TOP_SECTION"
                                : "RESET_TOP_SECTION",
                              payload: allReadPermission,
                            });
                          }}
                        />
                      </DisplayGrid>
                      <DisplayGrid container item xs={2}>
                        <DisplayCheckbox
                          testid={`agency-sharing-toplevel-${eachHeading.name}-write`}
                          checked={checkTopHeader(
                            topLevelPermission,
                            eachHeading,
                            "write"
                          )}
                          disabled={
                            mode !== "READ" && ACCESS.write ? false : true
                          }
                          onChange={(checked) => {
                            const allReadPermission = eachHeading.fields.map(
                              (eachField) => {
                                return {
                                  name: eachField.name,
                                  title: eachField.title,
                                  access: checked ? WRITEOBJ : READOBJ,
                                };
                              }
                            );
                            dispatch({
                              type: "SET_TOP_SECTION",
                              payload: allReadPermission,
                            });
                          }}
                        />
                      </DisplayGrid>
                    </DisplayGrid>
                  </DisplayGrid>
                  {eachHeading.fields.map((eachField, i) => {
                    return (
                      <>
                        <DisplayGrid
                          container
                          item
                          xs={12}
                          sm={12}
                          md={12}
                          lg={6}
                          alignItems="center"
                          className={classes.eachItem}
                          key={i}
                        >
                          <DisplayGrid
                            container
                            item
                            xs={6}
                            alignItems="center"
                          >
                            <DisplayText> {eachField.title}</DisplayText>
                          </DisplayGrid>
                          <DisplayGrid container item xs={2}>
                            <DisplayCheckbox
                              testid={`agency-sharing-toplevel-${eachHeading.name}-${eachField.name}-read`}
                              checked={checkTopField(
                                topLevelPermission,
                                eachField,
                                "read"
                              )}
                              disabled={
                                mode !== "READ" && ACCESS.read ? false : true
                              }
                              onChange={(checked) => {
                                let payload = {
                                  name: eachField.name,
                                  title: eachField.title,
                                  access: READOBJ,
                                };
                                dispatch({
                                  type: checked
                                    ? "SET_TOP_FIELD"
                                    : "RESET_TOP_FIELD",
                                  payload: payload,
                                });
                              }}
                            />
                          </DisplayGrid>
                          <DisplayGrid container item xs={2}>
                            <DisplayCheckbox
                              testid={`agency-sharing-toplevel-${eachHeading.name}-${eachField.name}-write`}
                              checked={checkTopField(
                                topLevelPermission,
                                eachField,
                                "write"
                              )}
                              disabled={
                                mode !== "READ" &&
                                ACCESS.write &&
                                eachField.access &&
                                eachField.access.write
                                  ? false
                                  : true
                              }
                              onChange={(checked) => {
                                let payload = {
                                  name: eachField.name,
                                  title: eachField.title,
                                  access:
                                    checked && ACCESS.write
                                      ? WRITEOBJ
                                      : READOBJ,
                                };
                                dispatch({
                                  type: "SET_TOP_FIELD",
                                  payload: payload,
                                });
                              }}
                            />
                          </DisplayGrid>
                        </DisplayGrid>
                      </>
                    );
                  })}
                </>
              );
            })}
          </DisplayGrid>
        )}
        {selectedLevel === "componentArray" && (
          <ComponentLevel
            selectedEntity={selectedEntity}
            selectedLevel={selectedLevel}
            mode={mode}
          />
        )}
      </div>
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        <DisplayGrid
          container
          item
          xs={12}
          direction="row-reverse"
          justify="flex-start"
        >
          <DisplayGrid container item xs={1}>
            <DisplayButton
              disabled={mode === "READ" ? true : false}
              onClick={() =>
                onSave(topLevelPermission, componentLevelPermission)
              }
              testid={`agency-sharing-toplevel-save`}
            >
              Save
            </DisplayButton>
          </DisplayGrid>

          <DisplayGrid container item xs={1}>
            <DisplayButton
              onClick={() => onClose()}
              testid={`agency-sharing-toplevel-close`}
            >
              Close
            </DisplayButton>
          </DisplayGrid>
        </DisplayGrid>
      </div>
    </div>
  );
};

TopLevel.propTypes = {
  selectedEntity: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};
