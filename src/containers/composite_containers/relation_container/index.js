import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { entity } from "utils/services/api_services/entity_service";
import { getChildData, getCount } from "./components/relation_services";
import { presetTemplate } from "utils/services/api_services/template_service";
import Preset from "utils/services/factory_services/preset_factory";
import { UserFactory } from "utils/services/factory_services";
import { RelationCard } from "./components/relation_card";
import { RelationHeader } from "./components/relation_header";
import { RelationContextMenuWrapper } from "components/wrapper_components/relation_context_menu/";
import { ContextSummary } from "../summary_container/components/context_summary";
import { ContainerWrapper } from "components/wrapper_components/container";
import { DetailContainer } from "../detail_container";
import SummaryContainer from "nuegov/containers/summary_container/index";
import {
  DisplayGrid,
  DisplayModal,
  DisplayPagination,
} from "components/display_components/";
import { RelationGridSkeleton } from "components/skeleton_components/relation_grid/";
import { SummaryCardSkeleton } from "components/skeleton_components/summary_page/summary_card";
import { ErrorFallback } from "components/helper_components";
import { get } from "utils/services/helper_services/object_methods";

export const RelationContainer = (props) => {
  const {
    childApp,
    childEntity,
    childModule,
    formData,
    id,
    parentApp,
    parentEntity,
    parentMeta,
    parentModule,
    path,
    sys_hotButton,
  } = props;
  const { mode } = useParams();
  const { getByData, getByDataAgencyId, getRoleBasedTemplateByData } = Preset();
  const { checkWriteAccess, isNJAdmin, isRoleBasedLayout } = UserFactory();

  const [assign, setAssign] = useState(false);
  const [autoPopulate, setAuto] = useState({});
  const [cardLoading, setCardLoading] = useState(false);
  const [context, setContext] = useState(false);
  const [currentPage, setCurrent] = useState(1);
  const [entityCount, setEntityCount] = useState();
  const [entityData, setEntityData] = useState([]);
  const [entityTemplate, setTemplate] = useState();
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedData, setSelectedData] = useState();
  const [showDetail, setDetail] = useState(false);
  const [showEdit, setEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortFields, setSortFields] = useState([]);
  const [templateData, setTemplateData] = useState([]);
  const [toggleSearch, setToggle] = useState(false);

  const filterPath = `${path.split(".")[1]}.${path.split(".")[2]}`;
  const isLogin = isNJAdmin() && childEntity === "User" ? true : false;
  const isWrite = checkWriteAccess({
    appname: childApp,
    modulename: childModule,
    entityname: childEntity,
  });
  let filterAgencyID = get(formData, "sys_entityAttributes.stampagency.id");
  const params = {
    appname: parentApp,
    modulename: parentModule,
    entityname: parentEntity,
    childentity: childEntity,
    id,
  };
  const childParams = {
    appname: childApp ? childApp : parentApp,
    modulename: childModule ? childModule : parentModule,
    entityname: childEntity,
  };
  const relatedEntityInfo = {
    parentEntityParams: {
      appname: parentApp,
      modulename: parentModule,
      entityname: parentEntity,
      childentity: childEntity,
    },
    childEntityParams: {
      appname: childApp,
      modulename: childModule,
      entityname: childEntity,
      id: id,
    },
    filterPath,
    parentMeta,
    sys_agencyId: filterAgencyID ? [filterAgencyID] : "",
  };
  const ITEMS_PER_PAGE = 30;
  //getters

  let getData = async () => {
    try {
      // let templateData = await presetTemplate.get({
      //   appname: childParams.appname,
      //   modulename: childParams.modulename,
      //   groupname: childEntity,
      // });
      // let template = getByData(templateData, childEntity);
      // let [childData, count] = await Promise.all([
      //   getChildData({ ...params, limit: ITEMS_PER_PAGE, skip: 0 }),
      //   getCount({ ...childParams, [filterPath]: id, limit: 0, skip: 0 }),
      // ]);
      // console.log("template is",template)
      // setTemplateData(templateData);
      // setTemplate(template);
      // setEntityData(childData);
      // setEntityCount(count.data);
      // setLoading(false);
    } catch (e) {
      console.log("Error reported in fetch data in relation", e);
    }
  };

  const getQuickEntities = (data, entityName, agencyId) => {
    let entityTemplate = getTemplateByAgency(data, entityName, agencyId);
    if (entityTemplate && Object.keys(entityTemplate).length > 0) {
      let { sys_entityRelationships } =
        entityTemplate.sys_entityAttributes || {};
      if (sys_entityRelationships && sys_entityRelationships.length) {
        let quickEntities = sys_entityRelationships.filter(
          (entity) =>
            entity.cardButton &&
            entity.cardButton.showOnCard &&
            checkWriteAccess({
              appname: entity.appName,
              modulename: entity.moduleName,
              entityname: entity.entityName,
            })
        );

        return quickEntities;
      } else return [];
    } else return [];
  };
  const getSearchData = async (type, value, advance) => {
    setCardLoading(true);
    try {
      let entityResult, count;
      if (sortFields.length) {
        params["orderby"] = sortFields[0]["order"];
        params["sortby"] = sortFields[0]["name"];
      }

      if (type === "search") {
        let searchData;
        advance
          ? (searchData = value)
          : (searchData = { globalsearch: value.trimLeft() });
        entityResult = await getChildData({
          ...params,
          limit: ITEMS_PER_PAGE,
          skip: 0,
          ...searchData,
        });
        count = await getCount({
          ...childParams,
          [filterPath]: id,
          limit: 0,
          skip: 0,
          ...searchData,
        });
      } else {
        entityResult = await getChildData({
          ...params,
          limit: ITEMS_PER_PAGE,
          skip: 0,
        });
        count = await getCount({
          ...childParams,
          [filterPath]: id,
          limit: 0,
          skip: 0,
        });
        setToggle(false);
      }

      setSearchValue(value);
      setEntityData(entityResult);
      setEntityCount(count.data);
      setCurrent(1);
      setCardLoading(false);
    } catch (e) {
      console.log("Error reported in get search data relation", e);
    }
  };
  const getTemplateByAgency = (data, entityName, agencyId) => {
    try {
      let agencyTemplate = getByDataAgencyId(data, entityName, agencyId);
      if (agencyTemplate && Object.keys(agencyTemplate).length > 0)
        return agencyTemplate;
      else return entityTemplate;
    } catch {
      return entityTemplate;
    }
  };
  const getTemplate = (data) => {
    try {
      if (
        isRoleBasedLayout(childApp, childModule, childEntity) &&
        !isNJAdmin()
      ) {
        let roleTemplate = getRoleBasedTemplateByData(
          templateData,
          childEntity,
          data.sys_templateName
        );
        if (roleTemplate && Object.keys(roleTemplate).length > 0)
          return roleTemplate;
        else return entityTemplate;
      } else {
        return getTemplateByAgency(
          templateData,
          childEntity,
          data.sys_agencyId
        );
      }
    } catch {
      return entityTemplate;
    }
  };

  const handleAssign = () => {
    setAssign(true);
    setContext(true);
  };

  const handleAssignCancel = async (values) => {
    setContext(false);
    setAssign(false);

    if (values.data.length) {
      setCardLoading(true);
      setRefresh(true);
      let data = [...values.data];
      let fieldName = path.split(".")[1];
      let parentData = { ...formData };

      let fieldDefinition =
        entityTemplate.sys_entityAttributes.sys_topLevel.find(
          (e) => e.name === fieldName
        );

      data.map((item, index) => {
        item.sys_entityAttributes[fieldName] = {
          id: id,
          sys_gUid: parentData.sys_gUid,
        };
        fieldDefinition.displayFields.map((e) => {
          if (e.name.split(".").length > 1) {
            let parentDisplayName =
              e.name.split(".")[e.name.split(".").length - 1];
            let parentFieldName = e.name.split(".")[0];
            if (
              parentData["sys_entityAttributes"][parentFieldName] &&
              Object.keys(parentData["sys_entityAttributes"][parentFieldName])
                .length
            )
              item.sys_entityAttributes[fieldName][parentDisplayName] =
                parentData["sys_entityAttributes"][parentFieldName][
                  parentDisplayName
                ];
          } else
            item.sys_entityAttributes[fieldName][e.name] =
              parentData["sys_entityAttributes"][e.name];
        });
      });
      try {
        let result = await Promise.all(
          data.map((item) =>
            entity.update(
              { ...childParams, entityname: childEntity, id: item._id },
              item
            )
          )
        );
        let [childData, count] = await Promise.all([
          getChildData({ ...params, limit: ITEMS_PER_PAGE, skip: 0 }),
          getCount({ ...childParams, [filterPath]: id, limit: 0, skip: 0 }),
        ]);
        setEntityData(childData);
        setEntityCount(count.data);
        setCardLoading(false);
      } catch (e) {
        console.log("Error reported in assign function");
      }
    }
  };

  const handleEdit = (value) => {
    setEdit(true);
    setSelectedData(value);
  };

  const handleMenuClose = async (name, order) => {
    let toggleField = sortFields.some(
      (e) => e.name === name && parseInt(e.order) === order
    );
    let searchData;
    setCardLoading(true);
    try {
      if (!toggleField) {
        if (searchValue) {
          if (typeof searchValue === "object") searchData = searchValue;
          else searchData = { globalsearch: searchValue.trimLeft() };
        }
        let result = await getChildData({
          ...params,
          orderby: order,
          sortby: name,
          limit: ITEMS_PER_PAGE,
          skip: 0,
          ...searchData,
        });
        let count = await getCount({
          ...childParams,
          [filterPath]: id,
          limit: 0,
          skip: 0,
        });
        setEntityData(result);
        setEntityCount(count.data);
        setSortFields([{ name, order }]);
      } else {
        let result = await getChildData({
          ...params,
          limit: ITEMS_PER_PAGE,
          skip: 0,
        });
        let count = await getCount({
          ...childParams,
          [filterPath]: id,
          limit: 0,
          skip: 0,
        });
        setEntityCount(count.data);
        setEntityData(result);
        setSortFields([]);
      }
      setCardLoading(false);
    } catch (e) {
      console.log("Error reported in handle menu close", e);
    }
  };

  const handlePageChange = async (event, value) => {
    setCardLoading(true);
    let skip = ITEMS_PER_PAGE * (value - 1);
    let searchData;
    if (sortFields.length) {
      params["sortby"] = sortFields[0].name;
      params["orderby"] = sortFields[0].order;
    }
    if (searchValue) {
      if (typeof searchValue === "object") searchData = searchValue;
      else searchData = { globalsearch: searchValue.trimLeft() };
    }
    try {
      let result = await getChildData({
        ...params,
        limit: ITEMS_PER_PAGE,
        skip: skip,
        ...searchData,
      });
      setEntityData(result);
      setCurrent(value);
      setCardLoading(false);
    } catch (e) {
      console.log("Error reported in handle page change relation", e);
    }
  };

  const handleNew = (metadata) => {
    let parentFieldName = path.split(".")[1];
    let autoData = {
      [parentFieldName]: {},
    };
    let { sys_entityAttributes } = formData;

    let definition = metadata.sys_entityAttributes.sys_topLevel.find(
      (e) => e.name === parentFieldName
    );
    definition &&
      definition.displayFields.map((item) => {
        if (item.name.split(".").length > 1) {
          let name = item.name.split(".")[0];
          let childFieldName =
            item.name.split(".")[item.name.split(".").length - 1];
          if (
            sys_entityAttributes[name] &&
            Object.keys(sys_entityAttributes[name]).length
          )
            autoData[parentFieldName][childFieldName] =
              sys_entityAttributes[name][childFieldName];
        } else
          autoData[parentFieldName][item.name] =
            sys_entityAttributes[item.name];
      });
    autoData[parentFieldName]["id"] = formData._id;
    autoData[parentFieldName]["sys_gUid"] = formData.sys_gUid;
    let businessInfo = {
      businessTypeInfo: get(
        formData,
        "sys_entityAttributes.businessTypeInfo",
        false
      ),
    };
    businessInfo?.businessTypeInfo &&
      (autoData = { ...autoData, ...businessInfo });
    setAuto({ sys_entityAttributes: autoData });
    setShowModal(true);
  };

  const handleRelatedItemRefresh = (value) => {
    setRefresh(value);
  };
  const handleSave = (type) => {
    if (type === "new") {
      setShowModal(false);
      setRefresh(true);
    } else {
      setEdit(false);
      setRefresh(true);
    }

    setLoading(true);
    getData();
  };

  const handleView = (value, mode, metadata) => {
    if (mode === "read") {
      setDetail(true);
      setSelectedData(value);
    } else if (mode === "edit") {
      setEdit(true);
      setSelectedData(value);
    } else if (mode === "Assign") {
      setTemplate(metadata);
      setAssign(true);
      setContext(true);
    } else {
      handleNew(metadata);
    }
  };

  const handleLoadingSkeleton = (value, fetchData) => {
    setLoading(value);
    if (fetchData) {
      getData();
    }
  };

  useEffect(() => {
    setLoading(true);
    getData();
    setSearchValue("");
  }, [childEntity]);

  if (false)
    return (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <RelationGridSkeleton />
      </div>
    );
  else
    return (
      <ContainerWrapper>
        <div
          className="main_c"
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
          {/* <div
            className="relation_header"
            style={{ display: "flex", justifyContent: "flex-end", flex: 1 }}
          >
            {/* <RelationHeader
              mode={mode}
              childApp={childApp}
              childModule={childModule}
              childEntity={childEntity}
              handleNew={handleNew}
              handleMenuClose={handleMenuClose}
              entityTemplate={entityTemplate}
              handleSearch={(e) => setToggle(true)}
              toggleSearch={toggleSearch}
              getSearchData={getSearchData}
              entityData={entityData}
              parentEntity={parentEntity}
              sortFields={sortFields}
              handleAssign={handleAssign}
              isWrite={isWrite}
              parentTemplate={parentMeta}
              searchData={searchValue}
            />
          </div> */}
          <div
            style={{
              display: "flex",
              flex: 12,
              overflowY: "scroll",
              contain: "strict",
              marginTop: "10px",
              // marginBottom: "10px",
              alignItems: "flex-start",
            }}
            class="hide_scroll"
          >
            <DisplayGrid
              container
              spacing={2}
              style={{
                display: "flex",
                justifyContent:
                  entityData && entityData.length === 0
                    ? "center"
                    : "flex-start",
                height: "80%",
              }}
            >
              <SummaryContainer
                appname={childApp}
                modulename={childModule}
                entityname={childEntity}
                filters={""}
                height={"51vh"}
                screenType={"RELATION"}
                relatedEntityInfo={relatedEntityInfo}
                editActionCallBack={handleView}
                relatedItemRefresh={refresh}
                changeRelatedItemRefresh={handleRelatedItemRefresh}
                detailPageData={formData}
                //alterScreenSize={handelScreenAlter}
                //fullScreenSize={fullScreenSize}
                //summaryMap={summaryMap}
              />
              {
                <RelationContextMenuWrapper
                  options={{
                    hideTitlebar: showDetail ? false : true,
                  }}
                  onClose={() => {
                    setDetail(false);
                  }}
                  title={
                    <div style={{ margin: "1%", color: "#3f51b5" }}>
                      {`${childEntity} detail`}{" "}
                    </div>
                  }
                  visible={context ? context : false}
                  width="30%"
                >
                  {context && (
                    <ContextSummary
                      appName={childApp ? childApp : parentApp}
                      moduleName={childModule ? childModule : parentModule}
                      entityName={childEntity}
                      summaryMode="context_summary"
                      handleCancel={
                        assign ? handleAssignCancel : (e) => setContext(false)
                      }
                      filters={
                        assign ? { _notExists: JSON.stringify([path]) } : ""
                      }
                      options={
                        assign ? { select: "multiple" } : { select: "single" }
                      }
                    />
                  )}
                </RelationContextMenuWrapper>
              }
              {
                <DisplayModal open={showModal} fullWidth={true} maxWidth="xl">
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
                        style={{ height: "98%", width: "98%", padding: "1%" }}
                      >
                        <DetailContainer
                          appname={childApp ? childApp : parentApp}
                          modulename={childModule ? childModule : parentModule}
                          groupname={childEntity}
                          mode="new"
                          options={{
                            hideTitleBar: true,
                            hideNavButtons: true,
                          }}
                          relationMode="relation"
                          // data={autoPopulate}
                          autodata={autoPopulate}
                          saveCallback={(e) => handleSave("new")}
                          onClose={(e) => setShowModal(false)}
                        />
                      </div>
                    </ContainerWrapper>
                  </div>
                </DisplayModal>
              }
              {
                <DisplayModal open={showDetail} fullWidth={true} maxWidth="xl">
                  <div
                    style={{
                      height: "85vh",
                      width: "100%",
                      display: "flex",
                      flex: 1,
                    }}
                    id="display-modal"
                  >
                    <ContainerWrapper>
                      <div
                        style={{ height: "98%", width: "98%", padding: "1%" }}
                      >
                        {showDetail && (
                          <DetailContainer
                            appname={childApp ? childApp : parentApp}
                            modulename={
                              childModule ? childModule : parentModule
                            }
                            groupname={childEntity}
                            mode="read"
                            options={{
                              hideTitleBar: true,
                              hideNavButtons: true,
                            }}
                            id={selectedData._id}
                            responseCallback={(e) => setDetail(false)}
                            onClose={(e) => setDetail(false)}
                            setReload={() => {
                              getData();
                            }}
                            screenType={"RELATION"}
                          />
                        )}
                      </div>
                    </ContainerWrapper>
                  </div>
                </DisplayModal>
              }
              {
                <DisplayModal open={showEdit} fullWidth={true} maxWidth="xl">
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
                        style={{ height: "98%", width: "98%", padding: "1%" }}
                      >
                        {showEdit && (
                          <DetailContainer
                            appname={childApp ? childApp : parentApp}
                            modulename={
                              childModule ? childModule : parentModule
                            }
                            groupname={childEntity}
                            mode="edit"
                            options={{
                              hideTitleBar: true,
                              hideNavButtons: true,
                            }}
                            id={selectedData._id}
                            saveCallback={(e) => handleSave("edit")}
                            onClose={(e) => setEdit(false)}
                            setReload={() => {
                              getData();
                            }}
                            screenType={"RELATION"}
                          />
                        )}
                      </div>
                    </ContainerWrapper>
                  </div>
                </DisplayModal>
              }
            </DisplayGrid>
          </div>
          {/* <div
            style={{
              display: "flex",
              flex: 1,
              paddingTop: "12px",
              paddingLeft: "15px",
              width: "65%",
            }}
          ></div> */}
        </div>
      </ContainerWrapper>
    );
};
