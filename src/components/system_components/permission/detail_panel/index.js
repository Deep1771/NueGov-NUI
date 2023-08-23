import React, { useEffect, useState } from "react";
import dot from "dot-object";
//Custom Hooks
import { imMutate, usePermissionState } from "../permission_reducer";
//Services
import {
  READ,
  checkEntityAccess,
  checkEntityFlag,
  checkSharedEntityAccess,
  getAllFeatures,
  generateEntityTree,
  getEntityTemplate,
  getRoleTemplate,
  isEntityFeatureSelected,
} from "../permission_services";
import { UserFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
//Inline Components
import { ComponentLevel } from "./component_level";
import { TopLevel } from "./top_level";
//Custom Component
import { BubbleLoader, AdvanceSearch } from "components/helper_components";
import {
  DisplayInput,
  DisplayIconButton,
  DisplayButton,
  DisplayBadge,
  DisplayCheckbox,
  DisplayGrid,
  DisplaySwitch,
  DisplayTabs,
  DisplayText,
} from "../../../display_components/";
import { SystemIcons } from "utils/icons/";

//Global Constants
const ALL_ACCESS = [
  {
    title: "Read",
    value: "read",
  },
  {
    title: "Write",
    value: "write",
  },
  {
    title: "Delete",
    value: "delete",
  },
];

const CREATE_OPTIONS = [
  {
    title: "Disable Create Option",
    value: "disableCreateOption",
  },
];

const AGENCY_SHARING = [
  {
    name: "parent",
    title: "Parent Agency",
    access: [
      {
        title: "Read",
        value: "read",
      },
      {
        title: "Write",
        value: "write",
      },
      {
        title: "Delete",
        value: "delete",
      },
    ],
  },
  {
    name: "child",
    title: "Child Agency",
    access: [
      {
        title: "Read",
        value: "read",
      },
      {
        title: "Write",
        value: "write",
      },
      {
        title: "Delete",
        value: "delete",
      },
    ],
  },
  {
    name: "sibling",
    title: "Sibling Agency",
    access: [
      {
        title: "Read",
        value: "read",
      },
      {
        title: "Write",
        value: "write",
      },
      {
        title: "Delete",
        value: "delete",
      },
    ],
  },
];
const { CheckCircle, Tune, Edit } = SystemIcons;

export const DetailPanel = (props) => {
  const {
    formData,
    selectedEntity,
    entityDetails,
    templateTree,
    changeHandler,
    saveHandler,
    panelDisabled,
    allowSelection,
    subAgencyAccess,
  } = props;
  //Custom Hooks
  const [{ entityTree }, dispatch] = usePermissionState();
  const { isNJAdmin, getAgencyId, getDetails, isSubAgency } = UserFactory();
  const agencyId = getAgencyId;
  const form_stampId = formData.sys_entityAttributes.stampagency
    ? formData.sys_entityAttributes.stampagency.id
    : " ";
  const form_agencyUserId = formData.sys_entityAttributes.agencyuser
    ? formData.sys_entityAttributes.agencyuser.id
    : " ";

  //Local State
  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState();
  const [selectedTab, setSelectedTab] = useState("TL");
  const [name, setName] = useState({
    flag: false,
    value: entityTree ? entityTree.friendlyName : "",
  });
  const [advSearchVisible, setAdvSearchVisibility] = useState(false);
  const [entityTemplate, setEntityTemplate] = useState();
  const [searchValue, setSearchValue] = useState(get(entityTree, "filters"));
  const isPublicRole =
    formData?.sys_entityAttributes?.isPublicRole === "Yes" ? true : false;

  //Functionl Constants
  const TABS = [
    {
      title: "Detail",
      value: "TL",
      visible: true,
    },
    {
      title: "Components",
      value: "CL",
      visible: tree && tree.componentArray && tree.componentArray.length,
    },
  ];
  const MORE_OPTIONS = [
    {
      title: "Show in Calendar",
      value: "isCalendar",
      visible: !allowSelection,
    },
    {
      title: "Make Private",
      value: "isPrivate",
      visible: !allowSelection,
    },
    {
      title: "Role Template Selection",
      value: "roleBasedLayout",
      visible: !allowSelection,
    },
  ].filter((op) => op.visible);

  //Declarative methods
  const handleTabSelect = (tab) => setSelectedTab(tab);

  //Custom methods
  const init = async () => {
    setLoading(true);
    if (typeof templateTree != "string") {
      setTree(imMutate(templateTree));
    } else {
      let res, features;
      //RBEL
      if (allowSelection && get(entityTree, "access.roleBasedLayout")) {
        let groupname = get(entityDetails, "entityInfo.groupName");
        let featureAccess = get(entityDetails, "entityInfo.featureAccess");
        res = await getRoleTemplate({
          "entityName.sys_groupName": groupname,
          "templates.sys_templateName": templateTree,
        });
        if (res && res.length) {
          let tree = generateEntityTree(
            res[0],
            null,
            featureAccess ? featureAccess : {}
          );
          setTree(tree);
        }
      } else {
        [res, features] = await Promise.all([
          getEntityTemplate(templateTree),
          getAllFeatures("entity"),
        ]);
        if (res && res.length) {
          let tree = generateEntityTree(res[0], features);
          setEntityTemplate(...res);
          setTree(tree);
        }
      }
    }
    setLoading(false);
  };

  const handleAccessCheck = (checked, access) => {
    if (access === "read") {
      dispatch({
        type: checked ? "SET_ENTITY_ACCESS" : "RESET_ENTITY_ACCESS",
        payload: READ,
      });
      if (!checked)
        dispatch({
          type: "RESET_ENTITY_TREE",
        });
    } else if (access === "write") {
      dispatch({
        type: "SET_ENTITY_ACCESS",
        payload: checked ? { read: true, write: true } : READ,
      });

      if (!checked)
        dispatch({
          type: "REMOVE_ENTITY_FIELD_ACCESS",
          payload: {
            access,
          },
        });
    } else {
      dispatch({
        type: checked ? "SET_ENTITY_ACCESS" : "REMOVE_ENTITY_ACCESS",
        payload: checked ? { read: true, write: true, delete: true } : access,
      });
    }
  };

  const handleCheckBox = () => {
    if (isNJAdmin()) {
      return AGENCY_SHARING;
    } else if (isSubAgency(agencyId)) {
      let user_parentId = getDetails.sys_agencyData.sys_entityAttributes
        .parentAgency
        ? getDetails.sys_agencyData.sys_entityAttributes.parentAgency.id
        : " ";
      if (form_stampId == user_parentId || form_agencyUserId == user_parentId) {
        return AGENCY_SHARING.filter((fl) => fl.name === "child");
      } else {
        return AGENCY_SHARING.filter((fl) => fl.name != "child");
      }
    } else {
      if (form_stampId == agencyId || form_agencyUserId == agencyId) {
        return AGENCY_SHARING.filter((fl) => fl.name === "child");
      } else {
        return AGENCY_SHARING.filter((fl) => fl.name != "child");
      }
    }
  };

  const handleSharedAccessCheck = (checked, subName, access) => {
    if (access === "read") {
      dispatch({
        type: checked
          ? "SET_SHARED_ENTITY_ACCESS"
          : "RESET_SHARED_ENTITY_ACCESS",
        payload: checked
          ? { value: { [subName]: READ } }
          : { value: { name: subName, data: access } },
      });
    } else if (access === "write") {
      dispatch({
        type: checked
          ? "SET_SHARED_ENTITY_ACCESS"
          : "RESET_SHARED_ENTITY_ACCESS",
        payload: checked
          ? { value: { [subName]: { read: true, write: true } } }
          : { value: { name: subName, data: access } },
      });
    } else {
      dispatch({
        type: checked
          ? "SET_SHARED_ENTITY_ACCESS"
          : "RESET_SHARED_ENTITY_ACCESS",
        payload: checked
          ? { value: { [subName]: { read: true, write: true, delete: true } } }
          : { value: { name: subName, data: access } },
      });
    }
  };

  const onAdvanceSearch = (filterObj) => {
    setSearchValue(dot.object(filterObj.filters));
    if (Object.keys(filterObj.filters).length > 0)
      setSearchValue(filterObj.filters);
    else setSearchValue({});
  };

  const onSave = () => {
    let entityInfo;
    if (typeof searchValue === "object" && Object.keys(searchValue).length)
      entityInfo = {
        ...entityTree,
        filters: searchValue,
        friendlyName: name.value,
      };
    else {
      delete entityTree.filters;
      entityInfo = { ...entityTree, friendlyName: name.value };
    }
    saveHandler(selectedEntity, entityInfo);
  };
  useEffect(() => {
    if (templateTree) init();
  }, [templateTree, entityDetails]);

  useEffect(() => {
    changeHandler && changeHandler(selectedEntity, entityTree);
  }, [entityTree]);

  if (loading) return <BubbleLoader />;
  else
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          contain: "strict",
        }}
        testid={`${name.value}-detail-permission`}
      >
        {tree && (
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                flex: 11,
                contain: "strict",
                marginTop: "2px",
                padding: "0 10px",
                overflowY: "scroll",
              }}
              class="hide_scroll"
            >
              <DisplayGrid
                container
                direction="row"
                alignItems="center"
                justify="space-between"
              >
                <DisplayGrid item xs={4} container>
                  {name.flag ? (
                    <DisplayGrid item>
                      <DisplayInput
                        testid={`entity-name`}
                        onIconClick={() => {
                          setName({
                            value: name.value
                              ? name.value
                              : entityTree.friendlyName,
                            flag: false,
                          });
                        }}
                        iconName={CheckCircle}
                        value={name.value}
                        onChange={(v) => {
                          setName({ ...name, value: v });
                        }}
                        hideClear={true}
                        variant="standard"
                        // onBlur={()=>{  setName({value:name.value ? name.value : entityTree.friendlyName ,flag:false})}}
                      />
                    </DisplayGrid>
                  ) : (
                    <DisplayGrid item>
                      <DisplayText variant="h6">{name.value}</DisplayText>
                      {!allowSelection && (
                        <DisplayIconButton
                          systemVariant="primary"
                          testid={`edit`}
                          size="small"
                          onClick={() => {
                            setName({ ...name, flag: true });
                          }}
                        >
                          <Edit fontSize="small" />{" "}
                        </DisplayIconButton>
                      )}
                    </DisplayGrid>
                  )}
                </DisplayGrid>
                <DisplayGrid
                  item
                  container
                  xs={5}
                  spacing={2}
                  alignItems="center"
                  justify="flex-end"
                >
                  <DisplayGrid item>
                    {!allowSelection && (
                      <DisplayIconButton
                        style={{ margin: "0 1.5%" }}
                        size={"small"}
                        disabled={!entityTemplate}
                        onClick={() => setAdvSearchVisibility(true)}
                        systemVariant="primary"
                        testid={`filter`}
                      >
                        <DisplayBadge
                          variant="dot"
                          invisible={
                            !(
                              typeof searchValue === "object" &&
                              Object.keys(searchValue).length
                            )
                          }
                        >
                          <Tune />
                        </DisplayBadge>
                      </DisplayIconButton>
                    )}
                    {advSearchVisible && (
                      <AdvanceSearch
                        template={entityTemplate}
                        closeRenderAdvanceSearch={() =>
                          setAdvSearchVisibility(false)
                        }
                        onAdSearchOpen={onAdvanceSearch}
                        searchLabel={"Apply"}
                        propdata={
                          typeof searchValue === "object" ? searchValue : {}
                        }
                        activeFilter={{}}
                        resetActiveFilter={{}}
                        showModal={advSearchVisible}
                        hideSaveFeature={true}
                        entityName={templateTree}
                      />
                    )}
                  </DisplayGrid>
                  <DisplayGrid item>
                    <DisplayText variant="body1">Visible</DisplayText>
                    <DisplaySwitch
                      testid={`visible`}
                      onChange={(e, checked) => {
                        dispatch({
                          type: "SET_ENTITY_ACCESS",
                          payload: { ...entityTree.access, visible: checked },
                        });
                      }}
                      checked={
                        checkEntityAccess(entityTree, "visible") ||
                        (entityTree.access &&
                          !entityTree.access.hasOwnProperty("visible"))
                      }
                      disabled={
                        panelDisabled ||
                        (allowSelection &&
                          tree.access &&
                          tree.access.visible === false)
                      }
                      hideLabel={true}
                    />
                  </DisplayGrid>
                </DisplayGrid>
              </DisplayGrid>

              <DisplayGrid container style={{ marginTop: "10px" }}>
                <DisplayGrid container>
                  <DisplayText variant="h6">Actions</DisplayText>
                </DisplayGrid>
                {isPublicRole && (
                  <DisplayGrid container>
                    <DisplayText
                      variant="caption"
                      style={{ color: "#666666", padding: "0px 0px 2px 0px" }}
                    >
                      Note : Be cautious about giving write access to Public
                      roles, as role user can alter the system data.
                    </DisplayText>
                  </DisplayGrid>
                )}
                <DisplayGrid container>
                  {ALL_ACCESS.map((ea) => (
                    <DisplayGrid
                      key={`${ea.value}`}
                      fluid
                      container
                      alignItems="center"
                      style={{ width: "150px" }}
                      testid={`${ea.title}`}
                    >
                      <DisplayGrid item xs={5}>
                        <DisplayText variant="body1">{ea.title}</DisplayText>
                      </DisplayGrid>
                      <DisplayGrid item xs={7}>
                        <DisplayCheckbox
                          testid={`action-${ea.value}`}
                          onChange={(checked) => {
                            handleAccessCheck(checked, ea.value);
                          }}
                          checked={checkEntityAccess(entityTree, ea.value)}
                          disabled={
                            panelDisabled ||
                            (allowSelection &&
                              !(tree.access && tree.access[ea.value]))
                          }
                        />
                      </DisplayGrid>
                    </DisplayGrid>
                  ))}
                  {CREATE_OPTIONS.map((op) => (
                    <DisplayGrid
                      key={`${op.value}`}
                      fluid
                      container
                      alignItems="center"
                      style={{ width: "250px", paddingRight: "80px" }}
                    >
                      <DisplayGrid container alignItems="center">
                        <DisplayGrid item xs={7}>
                          <DisplayText variant="body1">{op.title}</DisplayText>
                        </DisplayGrid>
                        <DisplayGrid item xs={5} container justify="flex-end">
                          <DisplaySwitch
                            testid={`more-options-acess-${op.value}`}
                            onChange={(e, checked) => {
                              dispatch({
                                type: checked
                                  ? "SET_ENTITY_ACCESS"
                                  : "REMOVE_ENTITY_ACCESS",
                                payload: checked
                                  ? {
                                      ...entityTree.access,
                                      [op.value]: checked,
                                    }
                                  : op.value,
                              });
                            }}
                            checked={checkEntityAccess(entityTree, op.value)}
                            disabled={panelDisabled}
                            hideLabel={true}
                          />
                        </DisplayGrid>
                      </DisplayGrid>
                    </DisplayGrid>
                  ))}
                </DisplayGrid>
              </DisplayGrid>
              {subAgencyAccess && (
                <DisplayGrid container style={{ marginTop: "10px" }}>
                  <DisplayGrid container>
                    <DisplayText variant="h6">Sub Agency Sharing</DisplayText>
                  </DisplayGrid>
                  <br />
                  <DisplayGrid container>
                    {handleCheckBox().map((as, index) => (
                      <DisplayGrid container testid={`${as.title}`}>
                        <DisplayText variant="h8">{as.title}</DisplayText>
                        <DisplayGrid container>
                          {as.access.map((ea) => (
                            <DisplayGrid
                              key={`${ea.value}`}
                              fluid
                              container
                              alignItems="center"
                              style={{ width: "150px" }}
                              testid={`${as.title}-${ea.value}`}
                            >
                              <DisplayGrid item xs={5}>
                                <DisplayText variant="body1">
                                  {ea.title}
                                </DisplayText>
                              </DisplayGrid>
                              <DisplayGrid item xs={7}>
                                <DisplayCheckbox
                                  testid={`SubAgency-access-${as.title}-${ea.value}`}
                                  onChange={(checked) => {
                                    handleSharedAccessCheck(
                                      checked,
                                      as.name,
                                      ea.value
                                    );
                                  }}
                                  checked={checkSharedEntityAccess(
                                    entityTree.shared,
                                    as.name,
                                    ea.value
                                  )}
                                  disabled={
                                    (entityTree.access != undefined &&
                                      !entityTree.access[ea.value]) ||
                                    panelDisabled ||
                                    (allowSelection &&
                                      !(tree.access && tree.access[ea.value]))
                                  }
                                />
                              </DisplayGrid>
                            </DisplayGrid>
                          ))}
                        </DisplayGrid>
                      </DisplayGrid>
                    ))}
                  </DisplayGrid>
                </DisplayGrid>
              )}

              {tree.featureAccess &&
                Object.keys(tree.featureAccess).length > 0 && (
                  <DisplayGrid container>
                    <DisplayGrid
                      container
                      alignItems="center"
                      style={{ marginTop: "10px" }}
                    >
                      <DisplayText variant="h6">Features</DisplayText>
                    </DisplayGrid>
                    <DisplayGrid container>
                      {Object.keys(tree.featureAccess).map((ef) => {
                        let disableAccesss =
                          ["ImportCSV"].includes(ef) && isPublicRole
                            ? true
                            : false;
                        return (
                          <DisplayGrid
                            key={`${ef}`}
                            fluid
                            container
                            alignItems="center"
                            style={{ width: "250px", paddingRight: "80px" }}
                            testid={`features`}
                          >
                            <DisplayGrid container alignItems="center">
                              <DisplayGrid item xs={7}>
                                <DisplayText variant="body1">{ef}</DisplayText>
                              </DisplayGrid>
                              <DisplayGrid
                                item
                                xs={5}
                                container
                                justify="flex-end"
                              >
                                <DisplaySwitch
                                  testid={`feature-acess-${ef}`}
                                  onChange={(e, checked) => {
                                    dispatch({
                                      type: checked
                                        ? "ENTITY_FEATURE_SELECT"
                                        : "ENTITY_FEATURE_DESELECT",
                                      payload: ef,
                                    });
                                  }}
                                  checked={isEntityFeatureSelected(
                                    entityTree,
                                    ef
                                  )}
                                  disabled={panelDisabled || disableAccesss}
                                  hideLabel={true}
                                />
                              </DisplayGrid>
                            </DisplayGrid>
                          </DisplayGrid>
                        );
                      })}
                    </DisplayGrid>
                  </DisplayGrid>
                )}
              {tree.approval && (
                <DisplayGrid container testid={`approval-options`}>
                  <DisplayGrid
                    container
                    alignItems="center"
                    style={{ marginTop: "10px" }}
                  >
                    <DisplayText variant="h6">Approval Options</DisplayText>
                  </DisplayGrid>
                  <DisplayGrid container>
                    <DisplayGrid
                      fluid
                      container
                      alignItems="center"
                      style={{ width: "250px", paddingRight: "80px" }}
                    >
                      <DisplayGrid container alignItems="center">
                        <DisplayGrid item xs={7}>
                          <DisplayText variant="body1">
                            {"Approver"}
                          </DisplayText>
                        </DisplayGrid>
                        <DisplayGrid item xs={5} container justify="flex-end">
                          <DisplaySwitch
                            testid={`approval-acess`}
                            onChange={(e, checked) => {
                              dispatch({
                                type: checked
                                  ? "SET_ENTITY_FLAG"
                                  : "RESET_ENTITY_FLAG",
                                payload: "approver",
                              });
                            }}
                            checked={checkEntityFlag(entityTree, "approver")}
                            disabled={panelDisabled}
                            hideLabel={true}
                          />
                        </DisplayGrid>
                      </DisplayGrid>
                    </DisplayGrid>
                  </DisplayGrid>
                </DisplayGrid>
              )}
              {MORE_OPTIONS.length > 0 && (
                <DisplayGrid container>
                  <DisplayGrid
                    container
                    alignItems="center"
                    style={{ marginTop: "10px" }}
                    testid={`more-options`}
                  >
                    <DisplayText variant="h6">More Options</DisplayText>
                  </DisplayGrid>
                  <DisplayGrid container>
                    {MORE_OPTIONS.map((op) => (
                      <DisplayGrid
                        key={`${op.value}`}
                        fluid
                        container
                        alignItems="center"
                        style={{ width: "250px", paddingRight: "80px" }}
                      >
                        <DisplayGrid container alignItems="center">
                          <DisplayGrid item xs={7}>
                            <DisplayText variant="body1">
                              {op.title}
                            </DisplayText>
                          </DisplayGrid>
                          <DisplayGrid item xs={5} container justify="flex-end">
                            <DisplaySwitch
                              testid={`more-options-acess-${op.value}`}
                              onChange={(e, checked) => {
                                dispatch({
                                  type: checked
                                    ? "SET_ENTITY_ACCESS"
                                    : "REMOVE_ENTITY_ACCESS",
                                  payload: checked
                                    ? {
                                        ...entityTree.access,
                                        [op.value]: checked,
                                      }
                                    : op.value,
                                });
                              }}
                              checked={checkEntityAccess(entityTree, op.value)}
                              disabled={panelDisabled}
                              hideLabel={true}
                            />
                          </DisplayGrid>
                        </DisplayGrid>
                      </DisplayGrid>
                    ))}
                  </DisplayGrid>
                </DisplayGrid>
              )}

              <DisplayGrid container style={{ marginTop: "10px" }}>
                <DisplayTabs
                  testid={`tabs`}
                  tabs={TABS.filter((et) => et.visible)}
                  defaultSelect={selectedTab}
                  titleKey="title"
                  valueKey="value"
                  onChange={handleTabSelect}
                  variant="fullWidth"
                />
              </DisplayGrid>

              <DisplayGrid container style={{ marginTop: "10px" }}>
                <DisplayGrid container>
                  {selectedTab == "TL" ? (
                    <TopLevel
                      allowSelection={allowSelection}
                      tree={tree.topSectionArray}
                      panelDisabled={panelDisabled}
                    />
                  ) : (
                    <ComponentLevel
                      allowSelection={allowSelection}
                      tree={tree.componentArray}
                      panelDisabled={panelDisabled}
                    />
                  )}
                </DisplayGrid>
              </DisplayGrid>
            </div>

            {!changeHandler && (
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  marginTop: "10px",
                  justifyContent: "flex-end",
                  padding: "0 10px",
                }}
              >
                <DisplayButton
                  testid={`save`}
                  onClick={onSave}
                  disabled={panelDisabled || !name.value}
                >
                  Save
                </DisplayButton>
              </div>
            )}
          </div>
        )}
      </div>
    );
};
