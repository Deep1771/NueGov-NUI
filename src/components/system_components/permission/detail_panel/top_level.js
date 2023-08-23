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
} from "../../../display_components/";

//Global Constants
const FIELD_WIDTH = "400px";

export const TopLevel = (props) => {
  let { tree, panelDisabled, allowSelection } = props;
  //Custom Hook
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
              testid={`select-read-all`}
              disabled={!access.read || panelDisabled}
              onChange={(checked) => {
                let sections = addAccessToAll(
                  entityTree,
                  "TOP",
                  fieldsTree,
                  READ,
                  allowSelection
                );
                dispatch({
                  type: checked ? "SECTION_SELECT_ALL" : "SECTION_DESELECT_ALL",
                  payload: {
                    level: "TOP",
                    sections,
                  },
                });
              }}
              hideLabel={true}
              checked={isAllSectionFieldsSelected(
                entityTree.topSectionArray,
                fieldsTree,
                "read",
                allowSelection
              )}
            />
            <DisplayCheckbox
              testid={`select-write-all`}
              disabled={!access.read || !access.write || panelDisabled}
              onChange={(checked) => {
                let sections = addAccessToAll(
                  entityTree,
                  "TOP",
                  fieldsTree,
                  checked ? READ_WRITE : READ,
                  allowSelection
                );
                dispatch({
                  type: "SECTION_SELECT_ALL",
                  payload: {
                    level: "TOP",
                    sections,
                  },
                });
              }}
              hideLabel={true}
              checked={isAllSectionFieldsSelected(
                entityTree.topSectionArray,
                fieldsTree,
                "write",
                allowSelection
              )}
            />
          </DisplayGrid>
        </DisplayGrid>
      </DisplayGrid>
      {fieldsTree &&
        fieldsTree.map((es) => {
          let secInfo = {
            name: es.name,
            title: es.title,
          };
          return (
            <DisplayGrid
              key={`tl-${es.name}`}
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
                  <DisplayText variant="h6">{es.title}</DisplayText>
                </DisplayGrid>
                <DisplayGrid item xs={6} container>
                  <DisplayCheckbox
                    testid={`section-${es.name}-read`}
                    disabled={!access.read || panelDisabled}
                    onChange={(checked) => {
                      let fields = addAccessToFields(
                        entityTree.topSectionArray,
                        "TOP",
                        es.fields,
                        READ,
                        allowSelection
                      );
                      dispatch({
                        type: checked ? "SECTION_SELECT" : "SECTION_DESELECT",
                        payload: {
                          level: "TOP",
                          secInfo,
                          fields,
                        },
                      });
                    }}
                    hideLabel={true}
                    checked={isSectionFieldsSelected(
                      entityTree.topSectionArray,
                      es,
                      "read",
                      allowSelection
                    )}
                  />
                  <DisplayCheckbox
                    testid={`section-${es.name}-write`}
                    disabled={!access.read || !access.write || panelDisabled}
                    onChange={(checked) => {
                      let fields = addAccessToFields(
                        entityTree.topSectionArray,
                        "TOP",
                        es.fields,
                        checked ? READ_WRITE : READ,
                        allowSelection
                      );
                      dispatch({
                        type: "SECTION_SELECT",
                        payload: {
                          level: "TOP",
                          secInfo,
                          fields,
                        },
                      });
                    }}
                    hideLabel={true}
                    checked={isSectionFieldsSelected(
                      entityTree.topSectionArray,
                      es,
                      "write",
                      allowSelection
                    )}
                  />
                </DisplayGrid>
              </DisplayGrid>
              <DisplayGrid container>
                {es.fields.map((ef) => {
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
                              !isFieldSelected(fieldsTree, secInfo, ef, "read"))
                          }
                          onChange={(checked) => {
                            dispatch({
                              type: checked ? "FIELD_SELECT" : "FIELD_DESELECT",
                              payload: {
                                level: "TOP",
                                secInfo,
                                fieldInfo: {
                                  ...ef,
                                  access: READ,
                                },
                              },
                            });
                          }}
                          hideLabel={true}
                          checked={isFieldSelected(
                            entityTree.topSectionArray,
                            secInfo,
                            ef,
                            "read"
                          )}
                        />
                        <DisplayCheckbox
                          testid={`field-${ef.name}-write`}
                          disabled={
                            !access.read ||
                            !access.write ||
                            panelDisabled ||
                            (allowSelection &&
                              !isFieldSelected(
                                fieldsTree,
                                secInfo,
                                ef,
                                "write"
                              ))
                          }
                          onChange={(checked) => {
                            dispatch({
                              type: "FIELD_SELECT",
                              payload: {
                                level: "TOP",
                                secInfo,
                                fieldInfo: {
                                  ...ef,
                                  access: checked ? READ_WRITE : READ,
                                },
                              },
                            });
                          }}
                          hideLabel={true}
                          checked={isFieldSelected(
                            entityTree.topSectionArray,
                            secInfo,
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
