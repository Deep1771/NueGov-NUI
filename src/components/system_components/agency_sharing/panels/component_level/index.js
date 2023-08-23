import React from "react";
import { makeStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import { useAgencySharingValue } from "../../agency_sharing_reducer";
import {
  checkAllComponentFields,
  checkComponentField,
  checkComponentHeader,
} from "../../agency_sharing_services";
import {
  DisplayCheckbox,
  DisplayGrid,
  DisplayText,
} from "components/display_components";
import { styles } from "../../styles";

const useStyles = makeStyles(styles);
const READOBJ = { read: true },
  WRITEOBJ = { ...READOBJ, write: true };

export const ComponentLevel = ({ mode, selectedEntity }) => {
  const classes = useStyles();
  const [{ componentLevelPermission, permission }, dispatch] =
    useAgencySharingValue();
  const ACCESS = permission.find(
    (eachObject) => eachObject.name === selectedEntity.name
  ).access;

  return (
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
          <DisplayGrid container item xs={4} style={{ padding: "0% 0% 0% 1%" }}>
            <DisplayText> W </DisplayText>
          </DisplayGrid>
          <DisplayGrid container item xs={2} style={{ padding: "0% 0% 0% 1%" }}>
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
          <DisplayGrid item xs={4}>
            <DisplayCheckbox
              testid={`agency-sharing-componentlevel-allfields-write`}
              checked={checkAllComponentFields(
                componentLevelPermission,
                [selectedEntity],
                "write"
              )}
              disabled={mode !== "READ" && ACCESS.write ? false : true}
              onChange={(checked) => {
                let allFieldWritePermission = selectedEntity.componentArray.map(
                  (eachSection) => {
                    return {
                      name: eachSection.name,
                      title: eachSection.title,
                      fields: eachSection.fields.map((eachField) => {
                        return {
                          name: eachField.name,
                          title: eachField.title,
                          access: checked ? WRITEOBJ : READOBJ,
                        };
                      }),
                    };
                  }
                );
                dispatch({
                  type: "SET_ALL_COMPONENT_FIELDS",
                  payload: allFieldWritePermission,
                });
              }}
            />
          </DisplayGrid>
          <DisplayGrid item xs={2}>
            <DisplayCheckbox
              testid={`agency-sharing-componentlevel-allfields-read`}
              checked={checkAllComponentFields(
                componentLevelPermission,
                [selectedEntity],
                "read"
              )}
              disabled={mode !== "READ" && ACCESS.read ? false : true}
              onChange={(checked) => {
                let allFieldReadPermission = selectedEntity.componentArray.map(
                  (eachSection) => {
                    return {
                      name: eachSection.name,
                      title: eachSection.title,
                      fields: eachSection.fields.map((eachField) => {
                        return {
                          name: eachField.name,
                          title: eachField.title,
                          access: READOBJ,
                        };
                      }),
                    };
                  }
                );
                dispatch({
                  type: checked
                    ? "SET_ALL_COMPONENT_FIELDS"
                    : "RESET_ALL_COMPONENT_FIELDS",
                  payload: allFieldReadPermission,
                });
              }}
            />
          </DisplayGrid>
        </DisplayGrid>
      </DisplayGrid>

      {selectedEntity.componentArray.map((eachHeading, i) => {
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
                className={classes.eachHeading}
              >
                <DisplayGrid container item xs={6} alignItems="center">
                  <DisplayText style={{ fontWeight: 800 }}>
                    {" "}
                    {eachHeading.title}{" "}
                  </DisplayText>
                </DisplayGrid>
                <DisplayGrid item xs={2}>
                  <DisplayCheckbox
                    testid={`agency-sharing-componentlevel-${eachHeading.name}-read`}
                    checked={checkComponentHeader(
                      componentLevelPermission,
                      eachHeading,
                      "read"
                    )}
                    disabled={mode !== "READ" && ACCESS.read ? false : true}
                    onChange={(checked) => {
                      const allReadPermission = [
                        {
                          name: eachHeading.name,
                          title: eachHeading.title,
                          fields: eachHeading.fields.map((eachField) => {
                            return {
                              name: eachField.name,
                              title: eachField.title,
                              access: READOBJ,
                            };
                          }),
                        },
                      ];
                      dispatch({
                        type: checked
                          ? "SET_COMPONENT_SECTION"
                          : "RESET_COMPONENT_SECTION",
                        payload: allReadPermission,
                      });
                    }}
                  />
                </DisplayGrid>
                <DisplayGrid item xs={2}>
                  <DisplayCheckbox
                    testid={`agency-sharing-componentlevel-${eachHeading.name}-write`}
                    checked={checkComponentHeader(
                      componentLevelPermission,
                      eachHeading,
                      "write"
                    )}
                    disabled={mode !== "READ" && ACCESS.write ? false : true}
                    onChange={(checked) => {
                      const allReadPermission = [
                        {
                          name: eachHeading.name,
                          title: eachHeading.title,
                          fields: eachHeading.fields.map((eachField) => {
                            return {
                              name: eachField.name,
                              title: eachField.title,
                              access: checked ? WRITEOBJ : READOBJ,
                            };
                          }),
                        },
                      ];
                      dispatch({
                        type: "SET_COMPONENT_SECTION",
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
                    className={classes.eachItem}
                    key={i}
                  >
                    <DisplayGrid container item xs={6} alignItems="center">
                      <DisplayText> {eachField.title}</DisplayText>
                    </DisplayGrid>
                    <DisplayGrid item xs={2}>
                      <DisplayCheckbox
                        testid={`agency-sharing-componentlevel-${eachHeading.name}-${eachField.name}-read`}
                        checked={checkComponentField(
                          componentLevelPermission,
                          eachHeading,
                          eachField,
                          "read"
                        )}
                        disabled={mode !== "READ" && ACCESS.read ? false : true}
                        onChange={(checked) => {
                          let payload = {
                            name: eachHeading.name,
                            title: eachHeading.title,
                            fields: [
                              {
                                name: eachField.name,
                                title: eachField.title,
                                access: READOBJ,
                              },
                            ],
                          };
                          dispatch({
                            type: checked
                              ? "SET_COMPONENT_FIELD"
                              : "RESET_COMPONENT_FIELD",
                            payload: payload,
                          });
                        }}
                      />
                    </DisplayGrid>
                    <DisplayGrid item xs={2}>
                      <DisplayCheckbox
                        testid={`agency-sharing-componentlevel-${eachHeading.name}-${eachField.name}-write`}
                        checked={checkComponentField(
                          componentLevelPermission,
                          eachHeading,
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
                            name: eachHeading.name,
                            title: eachHeading.title,
                            fields: [
                              {
                                name: eachField.name,
                                title: eachField.title,
                                access: checked ? WRITEOBJ : READOBJ,
                              },
                            ],
                          };
                          dispatch({
                            type: "SET_COMPONENT_FIELD",
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
  );
};

ComponentLevel.propTypes = {
  selectedEntity: PropTypes.object.isRequired,
};
