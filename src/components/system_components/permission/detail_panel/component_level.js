import React, { useEffect, useState } from "react";
//Custom Hooks
import { usePermissionState } from "../permission_reducer";
//Services
import {
  READ,
  READ_WRITE,
  addAccessToAll,
  addAccessToFields,
  checkEntityAccess,
  isFieldSelected,
  isSectionFieldsSelected,
  isAllSectionFieldsSelected,
} from "../permission_services";
import { get } from "utils/services/helper_services/object_methods";
//Custom Components
import {
  DisplayCheckbox,
  DisplayGrid,
  DisplayText,
} from "components/display_components/";

//GLobal Constants
const FIELD_WIDTH = "400px";

export const ComponentLevel = (props) => {
  const { tree, panelDisabled, allowSelection } = props;
  //Custom Hooks
  const [{ entityTree }, dispatch] = usePermissionState();
  //Local State
  const [fieldsTree, setFieldsTree] = useState([]);
  const [access, setAccess] = useState({});

  if (allowSelection && get(entityTree, "access.roleBasedLayout"))
    allowSelection = false;

  //Effects
  useEffect(() => {
    setAccess({
      read: checkEntityAccess(entityTree, "read"),
      write: checkEntityAccess(entityTree, "write"),
    });
  }, [entityTree.access]);

  useEffect(() => {
    setFieldsTree(tree);
  }, [tree]);

  return (
    <DisplayGrid container>
      <DisplayGrid container>
        <DisplayGrid
          item
          fluid
          container
          alignItems="center"
          style={{ width: FIELD_WIDTH, paddingRight: "30px" }}
        >
          <DisplayGrid item xs={6}></DisplayGrid>
          <DisplayGrid item xs={6} container>
            <div style={{ width: "45px", textAlign: "center" }}>R</div>
            <div style={{ width: "45px", textAlign: "center" }}>W</div>
          </DisplayGrid>
        </DisplayGrid>
      </DisplayGrid>
      <DisplayGrid container>
        <DisplayGrid
          item
          fluid
          container
          alignItems="center"
          style={{ width: FIELD_WIDTH, paddingRight: "30px" }}
        >
          <DisplayGrid item xs={6}></DisplayGrid>
          <DisplayGrid item xs={6} container>
            <DisplayCheckbox
              testid={`section-all-read`}
              disabled={!access.read || panelDisabled}
              onChange={(checked) => {
                let sections = addAccessToAll(
                  entityTree.topSectionArray,
                  "COMPONENT",
                  fieldsTree,
                  READ,
                  allowSelection
                );
                dispatch({
                  type: checked ? "SECTION_SELECT_ALL" : "SECTION_DESELECT_ALL",
                  payload: {
                    level: "COMPONENT",
                    sections,
                  },
                });
              }}
              hideLabel={true}
              checked={isAllSectionFieldsSelected(
                entityTree.componentArray,
                fieldsTree,
                "read",
                allowSelection
              )}
            />
            <DisplayCheckbox
              testid={`section-all-write`}
              disabled={!access.read || !access.write || panelDisabled}
              onChange={(checked) => {
                let sections = addAccessToAll(
                  entityTree.topSectionArray,
                  "COMPONENT",
                  fieldsTree,
                  checked ? READ_WRITE : READ,
                  allowSelection
                );
                dispatch({
                  type: "SECTION_SELECT_ALL",
                  payload: {
                    level: "COMPONENT",
                    sections,
                  },
                });
              }}
              hideLabel={true}
              checked={isAllSectionFieldsSelected(
                entityTree.componentArray,
                fieldsTree,
                "write",
                allowSelection
              )}
            />
          </DisplayGrid>
        </DisplayGrid>
      </DisplayGrid>
      {fieldsTree &&
        fieldsTree.map((ec) => {
          let compInfo = {
            name: ec.name,
            title: ec.title,
          };
          return (
            <DisplayGrid
              key={`cl-${ec.name}`}
              container
              style={{ marginBottom: "20px" }}
            >
              <DisplayGrid
                item
                fluid
                container
                alignItems="center"
                style={{ width: FIELD_WIDTH, paddingRight: "30px" }}
              >
                <DisplayGrid item xs={6}>
                  <DisplayText variant="h6">{ec.title}</DisplayText>
                </DisplayGrid>
                <DisplayGrid item xs={6} container>
                  <DisplayCheckbox
                    testid={`section-${ec.name}-read`}
                    disabled={!access.read || panelDisabled}
                    onChange={(checked) => {
                      let fields = addAccessToFields(
                        entityTree.componentArray,
                        "COMPONENT",
                        ec.fields,
                        READ,
                        allowSelection
                      );
                      dispatch({
                        type: checked ? "SECTION_SELECT" : "SECTION_DESELECT",
                        payload: {
                          level: "COMPONENT",
                          secInfo: compInfo,
                          fields,
                        },
                      });
                    }}
                    hideLabel={true}
                    checked={isSectionFieldsSelected(
                      entityTree.componentArray,
                      ec,
                      "read",
                      allowSelection
                    )}
                  />
                  <DisplayCheckbox
                    testid={`section-${ec.name}-write`}
                    disabled={!access.read || !access.write || panelDisabled}
                    onChange={(checked) => {
                      let fields = addAccessToFields(
                        entityTree.componentArray,
                        "COMPONENT",
                        ec.fields,
                        checked ? READ_WRITE : READ,
                        allowSelection
                      );
                      dispatch({
                        type: "SECTION_SELECT",
                        payload: {
                          level: "COMPONENT",
                          secInfo: compInfo,
                          fields,
                        },
                      });
                    }}
                    hideLabel={true}
                    checked={isSectionFieldsSelected(
                      entityTree.componentArray,
                      ec,
                      "write",
                      allowSelection
                    )}
                  />
                </DisplayGrid>
              </DisplayGrid>
              <DisplayGrid container>
                {ec.fields.map((ef) => {
                  return (
                    <DisplayGrid
                      key={`tl-${ef.name}`}
                      item
                      fluid
                      container
                      alignItems="center"
                      style={{ width: FIELD_WIDTH, paddingRight: "30px" }}
                    >
                      <DisplayGrid item xs={6}>
                        <DisplayText variant="body1">{ef.title}</DisplayText>
                      </DisplayGrid>
                      <DisplayGrid item xs={6} container>
                        <DisplayCheckbox
                          testid={`field-${ef.name}-read`}
                          disabled={
                            !access.read ||
                            panelDisabled ||
                            (allowSelection &&
                              !isFieldSelected(
                                fieldsTree,
                                compInfo,
                                ef,
                                "read"
                              ))
                          }
                          onChange={(checked) => {
                            dispatch({
                              type: checked ? "FIELD_SELECT" : "FIELD_DESELECT",
                              payload: {
                                level: "COMPONENT",
                                secInfo: compInfo,
                                fieldInfo: {
                                  ...ef,
                                  access: READ,
                                },
                              },
                            });
                          }}
                          hideLabel={true}
                          checked={isFieldSelected(
                            entityTree.componentArray,
                            compInfo,
                            ef,
                            "read"
                          )}
                        />
                        <DisplayCheckbox
                          testid={`field-${ec.name}-write`}
                          disabled={
                            !access.read ||
                            !access.write ||
                            panelDisabled ||
                            (allowSelection &&
                              !isFieldSelected(
                                fieldsTree,
                                compInfo,
                                ef,
                                "write"
                              ))
                          }
                          onChange={(checked) => {
                            dispatch({
                              type: "FIELD_SELECT",
                              payload: {
                                level: "COMPONENT",
                                secInfo: compInfo,
                                fieldInfo: {
                                  ...ef,
                                  access: checked ? READ_WRITE : READ,
                                },
                              },
                            });
                          }}
                          hideLabel={true}
                          checked={isFieldSelected(
                            entityTree.componentArray,
                            compInfo,
                            ef,
                            "write"
                          )}
                        />
                      </DisplayGrid>
                    </DisplayGrid>
                  );
                })}
              </DisplayGrid>
            </DisplayGrid>
          );
        })}
    </DisplayGrid>
  );
};
