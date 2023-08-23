import React, { useState, Suspense, useMemo, useEffect, useRef } from "react";
import { ContainerWrapper } from "components/wrapper_components";
import { DetailContainer } from "containers";
import {
  DisplayModal,
  DisplayGrid,
  DisplayText,
  DisplayIconButton,
  DisplayButton,
  DisplayDivider,
} from "components/display_components";
import SummaryContainer from "nuegov/containers/summary_container/index";
import { useDetailStyles } from "./styles";
import { ThemeFactory } from "utils/services/factory_services";
import { SystemIcons } from "utils/icons";
import {
  entity,
  entityCount,
  childEntity,
} from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { GlobalFactory } from "utils/services/factory_services";
import { useHistory } from "react-router-dom";
import { UpdateModal } from "./components/update_modal";
import { Iterator } from "containers/composite_containers/detail_container/components/iterator";
import { UserFactory } from "utils/services/factory_services";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { bulkActions } from "utils/services/api_services/bulk_actions";

export const MultiAssetsView = (properties) => {
  const {
    open360View,
    set360View,
    reload360View = () => {},
    props,
  } = properties;
  const { appname, modulename, groupname, id, metadata, mode, ...rest } = props;
  const { getVariantObj, getAllVariants } = ThemeFactory();
  const { dark } = getVariantObj("primary");
  const { CloseOutlined, ExpandMore } = SystemIcons;
  const { setSnackBar } = GlobalFactory();
  const {
    getUserInfo,
    getEntityFriendlyName,
    checkReadAccess,
    checkWriteAccess,
  } = UserFactory();

  const [newFormData, setFormData] = useState();
  const [openUpdateModal, setUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [linkedAssetsCount, setLinkedAssetsCount] = useState([]);
  const [showDetail, setDetail] = useState(false);
  const [selectedData, setSelectedData] = useState();
  const [showEdit, setEdit] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState("");

  const { username } = getUserInfo();
  const [selectedId, setSeletedId] = useState(null);
  let bulkRef = useRef([]);

  const stateParams = {
    mode: mode.toUpperCase(),
    appname: appname,
    modulename: modulename,
    groupname: groupname,
    id: id,
    metadata: metadata,
  };
  const classes = useDetailStyles();

  const parentMeta = props?.metadata || {};

  const validateAccess = (app, module, entity) => {
    let validateAccess = checkReadAccess({
      appname: app,
      modulename: module,
      entityname: entity,
    });
    return validateAccess;
  };

  const validateWriteAccess = (app, module, entity) => {
    let validateWriteAccess = checkWriteAccess({
      appname: app,
      modulename: module,
      entityname: entity,
    });
    return validateWriteAccess;
  };

  const relatedItems =
    parentMeta?.sys_entityAttributes?.sys_entityRelationships?.filter(
      (e) =>
        e.entityName !== "Audits" &&
        e.viewOn360 === true &&
        validateAccess(e.appName, e.moduleName, e.entityName)
    );

  const entitiesWithWriteAccess =
    parentMeta?.sys_entityAttributes?.sys_entityRelationships?.filter(
      (e) =>
        e.entityName !== "Audits" &&
        e.viewOn360 === true &&
        validateWriteAccess(e.appName, e.moduleName, e.entityName)
    );

  const multiAssetFields = parentMeta.sys_entityAttributes.sys_topLevel.filter(
    (e) => e.visibleOn360 === true
  );
  let data = props.data.sys_entityAttributes;
  const multiAssetsConfig = metadata.sys_entityAttributes.multiAssetsConfig;
  const commonFields = multiAssetsConfig?.commonFields;
  const history = useHistory();
  let [relatedEntity, setRelatedEntity] = useState();
  let [relatedTemplates, setRelatedTemplates] = useState([]);

  const buttonClicked = (buttonIndx, buttonId) => {
    if (buttonId === "defaults") {
      setUpdateModal(true);
    }
  };

  const close360View = () => {
    set360View(false);
    bulkRef.current = [];
    setUpdateData({});
  };

  const findDirectives = (type) => {
    let directives = [];
    commonFields.map((ecf) => {
      if (ecf.type === type) {
        directives.push(ecf.name);
      }
    });
    return directives;
  };

  const handleSave = async (type, relatedEntityInfo) => {
    let { parentEntityParams } = relatedEntityInfo;
    let filterPath = relatedEntityInfo.filterPath;
    if (type === "edit") {
      setEdit(false);
      await childEntity.get({
        ...relatedEntityInfo.parentEntityParams,
        id: props.data._id,
      });
      await entityCount.get({
        ...relatedEntityInfo.childEntityParams,
        [filterPath]: relatedEntityInfo.childEntityParams.id,
      });
    }
  };

  const handleSelectedIds = (data) => {
    setSeletedId(data);
  };

  const handleView = (value, mode) => {
    setSelectedEntity(value.sys_groupName);

    if (mode === "read") {
      setDetail(true);
      setSelectedData(value);
    } else if (mode === "edit") {
      setEdit(true);
      setSelectedData(value);
    }
  };

  const getUpdateModal = useMemo(() => {
    return (
      <UpdateModal
        openUpdateModal={openUpdateModal}
        setUpdateModal={setUpdateModal}
        data={data}
        // mode={mode}
        commonFields={commonFields}
        updateData={updateData}
        setUpdateData={setUpdateData}
        title={multiAssetsConfig?.updateModalTitle}
      ></UpdateModal>
    );
  }, [openUpdateModal]);

  const renderBody = () => {
    return (
      <div className={classes.modal_body}>
        <div
          style={{
            display: "flex",
            order: -1,
            flexDirection: "column",
          }}
        >
          {renderTopLevel()}
        </div>
        <br />
        <div
          style={{
            order: 1,
            display: "flex",
            flexDirection: "column",
            paddingLeft: "14px",
            paddingRight: "24px",
          }}
        >
          <DisplayDivider />
          {relatedItems && renderLinkedAssets()}
        </div>
        {openUpdateModal && getUpdateModal}
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div
        style={{ backgroundColor: "white" }}
        className={classes.modal_footer}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <DisplayButton
            variant="outlined"
            size="small"
            onClick={() => {
              close360View();
            }}
            systemVariant={false ? "default" : "secondary"}
          >
            Cancel
          </DisplayButton>
          {
            <DisplayButton
              variant="contained"
              size="small"
              disabled={!totalLinkedAsset()}
              onClick={() => {
                updateAll();
              }}
              systemVariant={false ? "default" : "primary"}
            >
              Update
            </DisplayButton>
          }
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div
        className={classes.modal_header}
        style={{ backgroundColor: dark.bgColor }}
      >
        <DisplayText variant="h6" style={{ color: "white" }}>
          {multiAssetsConfig?.pageTitle
            ? multiAssetsConfig?.pageTitle
            : "360° View"}
        </DisplayText>
        <DisplayIconButton
          systemVariant="default"
          onClick={close360View}
          style={{ color: "white" }}
        >
          <CloseOutlined />
        </DisplayIconButton>
      </div>
    );
  };

  const totalLinkedAsset = () => {
    let count = false;
    let availableEntities = [];
    availableEntities = entitiesWithWriteAccess.map((ewra) => {
      return ewra.entityName;
    });
    linkedAssetsCount.map((ec) => {
      if (availableEntities.includes(ec.entity) && ec?.data > 0) {
        count = true;
      }
    });
    return count;
  };

  const linkedAssetsTitle = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
          }}
        >
          <DisplayText
            variant="h6"
            style={{
              color: dark.bgColor,
            }}
          >
            {multiAssetsConfig?.attachedAssetsTitle
              ? multiAssetsConfig?.attachedAssetsTitle
              : "Linked Assets"}
          </DisplayText>
        </div>
        <div
          style={{
            display: "flex",
          }}
        >
          {multiAssetsConfig?.buttonConfig?.map((eb, ebi) => {
            if (eb.id === "defaults") {
              return (
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <DisplayButton
                    variant="contained"
                    size="small"
                    disabled={!totalLinkedAsset()}
                    onClick={() => {
                      buttonClicked(ebi, eb.id);
                    }}
                    systemVariant={false ? "default" : "primary"}
                  >
                    {eb.title}
                  </DisplayButton>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  const getTemplate = async (appname, modulename, groupname, path) => {
    let result = await entityTemplate.get({
      appname: appname,
      modulename: modulename,
      groupname: groupname,
    });
    return result;
  };

  const countOfLinkedAsset = async (
    appname,
    modulename,
    groupname,
    pathKey,
    pathValue
  ) => {
    let count = await entityCount.get({
      appname: appname,
      modulename: modulename,
      entityname: groupname,
      [pathKey]: pathValue,
    });
    return count;
  };

  const renderLinkedAssets = () => {
    return (
      <div>
        <br />
        <br />
        {linkedAssetsTitle()}
        <br />
        {relatedItems?.map((e, i) => {
          const relatedEntityInfo = {
            parentEntityParams: {
              appname: props.appname,
              modulename: props.modulename,
              entityname: props.groupname,
              childentity: e.entityName,
            },
            childEntityParams: {
              appname: e.appName,
              modulename: e.moduleName,
              entityname: e.entityName,
              id: props.data._id,
            },
            filterPath: e.path.slice(21),
            parentMeta,
            sys_agencyId: "",
          };

          let res = [];
          res = selectedId?.map((e) => {
            return e.sys_gUid;
          });
          let a = [];
          a = res?.map((e) => {
            return e?.split("-")[0];
          });
          if (a) {
            if (a[0] === e.entityName) {
              let bulk = {
                selectedIds: res,
                collectionName:
                  relatedTemplates[i]?.sys_entityAttributes
                    ?.sys_entityCollection,
                filters: {},
                operationType: "Update",
                appname: e.appName,
                modulename: e.moduleName,
                entityname: e.entityName,
                templatename:
                  relatedTemplates[i]?.sys_entityAttributes?.sys_templateName,
                username: username,
                updatingFields: Object.keys(updateData)?.map((el) => {
                  return {
                    fieldName: el,
                    fieldValue: updateData[el],
                  };
                }),
              };
              if (bulkRef?.current?.length > 0) {
                bulkRef.current = bulkRef.current.filter(
                  (item) => item.entityname != e.entityName
                );

                let indexValue = bulkRef?.current?.findIndex(
                  (item) => item.entityname == e.entityName
                );
                if (!indexValue >= 0) {
                  bulkRef.current = [...bulkRef.current, { ...bulk }];
                }
              } else {
                bulkRef.current = [{ ...bulk }];
                if (!res.length) {
                  bulkRef.current = res;
                }
              }
            }
          }
          if (bulkRef?.current?.length && !res.length) {
            bulkRef.current.map((item) => {
              if (item.entityname === e.entityName) {
                item.selectedIds = res;
              }
            });
          }

          return (
            <div>
              <Accordion TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <DisplayText
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    {e?.title +
                      (linkedAssetsCount[i]?.data
                        ? ` - ` + linkedAssetsCount[i]?.data
                        : " - 0")}
                  </DisplayText>
                </AccordionSummary>
                <AccordionDetails>
                  <ContainerWrapper>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <DisplayGrid
                        container
                        spacing={2}
                        style={{
                          display: "flex",
                          justifyContent:
                            data && data.length === 0 ? "center" : "flex-start",
                        }}
                      >
                        <SummaryContainer
                          appname={e.appName}
                          modulename={e.moduleName}
                          entityname={e.entityName}
                          filters={""}
                          height={"35vh"}
                          screenType={"RELATION"}
                          relatedEntityInfo={relatedEntityInfo}
                          fromPage="360View"
                          handleIdsFor360={handleSelectedIds}
                          editActionCallBack={handleView}
                        />
                        {selectedEntity === e.entityName && (
                          <DisplayModal
                            open={showDetail}
                            fullWidth={true}
                            maxWidth="xl"
                          >
                            <div
                              style={{
                                height: "85vh",
                                width: "100%",
                                display: "flex",
                                flex: 1,
                              }}
                            >
                              <ContainerWrapper>
                                <div
                                  style={{
                                    height: "98%",
                                    width: "98%",
                                    padding: "1%",
                                  }}
                                >
                                  {showDetail && (
                                    <DetailContainer
                                      appname={
                                        e.appName ? e.appName : props.appname
                                      }
                                      modulename={
                                        e.moduleName
                                          ? e.moduleName
                                          : props.modulename
                                      }
                                      groupname={e.entityName}
                                      mode="read"
                                      options={{
                                        hideTitleBar: true,
                                        hideNavButtons: true,
                                      }}
                                      id={selectedData._id}
                                      responseCallback={(e) => setDetail(false)}
                                      onClose={(e) => setDetail(false)}
                                    />
                                  )}
                                </div>
                              </ContainerWrapper>
                            </div>
                          </DisplayModal>
                        )}
                        {selectedEntity === e.entityName && (
                          <DisplayModal
                            open={showEdit}
                            fullWidth={true}
                            maxWidth="xl"
                          >
                            <div
                              style={{
                                height: "85vh",
                                width: "100%",
                                display: "flex",
                                flex: 1,
                              }}
                            >
                              <ContainerWrapper>
                                <div
                                  style={{
                                    height: "98%",
                                    width: "98%",
                                    padding: "1%",
                                  }}
                                >
                                  {showEdit && (
                                    <DetailContainer
                                      appname={
                                        e.appName ? e.appName : props.appname
                                      }
                                      modulename={
                                        e.moduleName
                                          ? e.moduleName
                                          : props.modulename
                                      }
                                      groupname={e.entityName}
                                      mode="edit"
                                      options={{
                                        hideTitleBar: true,
                                        hideNavButtons: true,
                                      }}
                                      id={selectedData._id}
                                      saveCallback={(e) =>
                                        handleSave("edit", relatedEntityInfo)
                                      }
                                      onClose={async (e) => {
                                        setEdit(false);
                                        await childEntity.get({
                                          parentEntityParams:
                                            relatedEntityInfo.parentEntityParams,
                                          id: props.data._id,
                                          globalsearch: null,
                                          limit: 100,
                                          skip: 0,
                                        });
                                        await entityCount.get({
                                          childEntityParams:
                                            relatedEntityInfo.childEntityParams,
                                          filterPath:
                                            relatedEntityInfo.childEntityParams
                                              .id,
                                        });
                                      }}
                                    />
                                  )}
                                </div>
                              </ContainerWrapper>
                            </div>
                          </DisplayModal>
                        )}
                      </DisplayGrid>
                    </div>
                  </ContainerWrapper>
                </AccordionDetails>
              </Accordion>
              <br />
            </div>
          );
        })}
      </div>
    );
  };

  const renderTopLevel = () => {
    let entityFriendlyName = `${getEntityFriendlyName({
      appname: appname,
      modulename: modulename,
      entityname: groupname,
    })}`;
    return (
      <div
        style={{
          // height: "55vh",
          // width: "98%",
          // padding: "1%",
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            paddingLeft: "14px",
          }}
        >
          <DisplayText
            variant="h6"
            style={{
              color: dark.bgColor,
            }}
          >
            {multiAssetsConfig?.topLevelTitle
              ? multiAssetsConfig?.topLevelTitle
              : `${entityFriendlyName} Details`}
          </DisplayText>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {multiAssetFields?.length &&
            ["EDIT", "READ"].includes(mode?.toUpperCase()) &&
            multiAssetFields?.map((eachField, i) => {
              return (
                <Suspense fallback={<div>Loading...</div>}>
                  <Iterator
                    callbackError={() => {}}
                    callbackValue={(ddata) => {
                      setFormData((prevState) => ({
                        ...prevState,
                        [eachField.name]: ddata,
                      }));
                    }}
                    data={
                      data && data[eachField?.name]
                        ? data && data[eachField?.name]
                        : null
                    }
                    formData={props?.data}
                    fieldmeta={eachField}
                    key={`tf - ${i}`}
                    stateParams={{ ...stateParams, mode: "READ" }}
                    // stateParams={stateParams}
                  />
                </Suspense>
              );
            })}
        </div>
      </div>
    );
  };

  const updateAll = async () => {
    let finalData = { ...props.data.sys_entityAttributes, ...newFormData };
    props.data.sys_entityAttributes = finalData;

    if (JSON.stringify(finalData) !== JSON.stringify(data)) {
      let response = await entity.update(
        { appname, modulename, entityname: groupname, id },
        props.data
      );
    }
    let finalPayload = [];
    finalPayload = bulkRef?.current?.filter((e) => e.selectedIds.length > 0);
    finalPayload.map((ep) => {
      ep.updatingFields = Object.keys(updateData)
        ?.map((el) => {
          if (
            typeof updateData[el] == "object" &&
            JSON.stringify(updateData[el]) == "{}"
          ) {
            return;
          } else {
            return {
              fieldName: el,
              fieldValue: updateData[el],
            };
          }
        })
        .filter((g) => ![undefined, null].includes(g));

      ep.updatingFields.map((euf) => {
        let didMatch = false;
        findDirectives("LIST").map(async (ed) => {
          if (ed === euf.fieldName) {
            let template = relatedTemplates.filter(
              (e) =>
                e.sys_entityAttributes.sys_templateGroupName.sys_groupName ===
                ep.entityname
            )[0];
            template.sys_entityAttributes.sys_topLevel
              .filter((e) => e.name === euf.fieldName)[0]
              .values.map((ev) => {
                if (ev.value === euf.fieldValue) {
                  didMatch = true;
                }
              });
            if (!didMatch) {
              euf.fieldValue = null;
              euf.fieldName = null;
            }
          }
        });
      });
    });

    if (Object.keys(updateData).length !== 0) {
      let finalResult = await Promise.all(
        finalPayload.map(async (ep) => {
          let result = await bulkActions.updateMany("", ep);
          return result;
        })
      );
    }

    if (
      JSON.stringify(finalData) === JSON.stringify(data) &&
      (Object.keys(updateData).length == 0 || finalPayload.length === 0)
    ) {
      setSnackBar({
        message: "No changes to update...",
        style: { zIndex: 10010 },
        severity: "info",
      });
    } else {
      setSnackBar({
        message: "Data has been saved successfully",
        style: { zIndex: 10010 },
        severity: "success",
      });
      reload360View();
    }
  };

  useEffect(() => {
    (async () => {
      let assetsCount = await Promise.all(
        relatedItems.map(async (eri) => {
          try {
            let res = await countOfLinkedAsset(
              eri.appName,
              eri.moduleName,
              eri.entityName,
              eri.path.slice(21),
              props.data._id
            );
            res.entity = eri.entityName;
            return res;
          } catch (e) {
            console.log(e);
          }
        })
      );
      setLinkedAssetsCount(assetsCount);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      let templates = await Promise.all(
        relatedItems.map(async (eri) => {
          try {
            let res = await getTemplate(
              eri.appName,
              eri.moduleName,
              eri.entityName
            );
            return res;
          } catch (e) {
            console.log(e);
          }
        })
      );
      setRelatedTemplates(templates);
    })();
  }, []);

  return (
    <DisplayModal open={open360View} fullWidth={true} maxWidth={"xl"}>
      <div className={classes.modal_container}>
        {renderHeader()}
        <DisplayDivider />
        {relatedItems.length > 0 && renderBody()}
        <DisplayDivider />
        {renderFooter()}
      </div>
    </DisplayModal>
  );
};
