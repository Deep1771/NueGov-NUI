import React, { useEffect, useState } from "react";
import queryString from "query-string";
import { useParams } from "react-router";
import { useHistory, useLocation } from "react-router-dom";
import { SystemIcons } from "utils/icons";
//Services
import {
  entity,
  entityCount,
} from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { UserFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
//Custom Components
import { PaginationSkeleton } from "components/skeleton_components/control_panel/";
import { ImportsSkeleton } from "components/skeleton_components/imports/skeleton";
import {
  DisplayBadge,
  DisplayButton,
  DisplayDivider,
  DisplayGrid,
  DisplayIconButton,
  DisplayPagination,
  DisplaySearchBar,
  DisplaySelect,
  DisplaySnackbar,
  DisplayText,
} from "components/display_components";
import { ErrorFallback } from "components/helper_components";
import { AdvanceSearch, FiltersPopover } from "components/helper_components";

import { ImportSummary } from "./summary";
import { CardComponent } from "./card";
import { template, update } from "lodash";

const BASE_URL = `/app/import/recents`;
const appname = "Features";
const modulename = "Imports";
const entityname = "Import";

const queryToUrl = (params) =>
  Object.keys(params ? params : {})
    .map((key) => `${key}=${params[key]}`)
    .join("&");

export const Recents = ({ importMode = "", selectedEntity = {} }) => {
  //hooks
  const { id } = useParams();
  const history = useHistory();
  const queryParams = queryString.parse(useLocation().search);

  const { isNJAdmin, isSuperAdmin, getUserInfo } = UserFactory();
  //Local State
  const [entityInfo, setEntityInfo] = useState();
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [advSearchVisible, setAdvSearchVisibility] = useState(false);
  const [activeFilter, setActiveFilter] = useState({});
  const [templateData, setTemplateData] = useState({});

  const { page, globalsearch, ...restParams } = queryParams;
  const { sortby, orderby, sys_agencyId } = restParams;
  const { Tune, Refresh } = SystemIcons;

  //Constants
  const ITEMS_PER_PAGE = 20;
  const showCard = (entityInfo) => {
    return (
      isNJAdmin() ||
      isSuperAdmin ||
      get(entityInfo, "sys_entityAttributes.userInfo.sys_gUid") ===
        getUserInfo()?.sys_gUid
    );
  };

  //Filters
  let filterParams = {};
  if (globalsearch) filterParams.globalsearch = globalsearch;
  if (restParams) filterParams = { ...filterParams, ...restParams };

  const filterApplied = !!(restParams && Object.keys(restParams).length);

  //Custom Functions
  const onPageChange = (e, page) => {
    const params = { ...queryParams };
    params.page = page;
    if (page) history.push(`${BASE_URL}/?${queryToUrl(params)}`);
  };

  const handleCardClick = (id) => {
    const params = { ...queryParams };
    history.push(`${BASE_URL}/${id}/?${queryToUrl(params)}`);
  };

  const init = async () => {
    setLoading(true);
    if (appname && modulename && entityname && !id) {
      let metadata;
      if (Object.keys(templateData).length) {
        metadata = templateData;
      } else {
        metadata = await entityTemplate.get({
          appname,
          modulename,
          groupname: entityname,
        });
        setTemplateData(metadata);
      }
      const { app_cardContent } = metadata.sys_entityAttributes;
      const { projectFields } = app_cardContent ? app_cardContent : {};
      if (!isSuperAdmin && !isNJAdmin()) {
        filterParams = { "userInfo.sys_gUid": getUserInfo()?.sys_gUid };
      }

      if (importMode === "update") {
        filterParams = {
          ...filterParams,
          entityName: selectedEntity?.groupName,
        };
      }
      let entityParams = {
        appname,
        modulename,
        entityname,
        skip: page ? (page - 1) * ITEMS_PER_PAGE : 0,
        limit: importMode === "update" ? 10 : ITEMS_PER_PAGE,
        ...filterParams,
      };
      if (projectFields) entityParams.displayFields = projectFields.join(",");

      let countParams = { appname, modulename, entityname, ...filterParams };
      let [data, { data: totalCount }] = await Promise.all([
        entity.get(entityParams),
        entityCount.get(countParams),
      ]);
      if (data && !data.error) setEntityInfo({ data, metadata, totalCount });
    }
    setLoading(false);
  };

  const clearMessage = () => setMessage(null);

  const resetActiveFilter = () => {
    setActiveFilter({});
  };

  const onAdvSearch = (filterObj, filter) => {
    let params = {
      ...filterObj.filters,
    };
    if (filterObj.sys_agencyId) params.sys_agencyId = filterObj.sys_agencyId;
    if (filterObj.sortby) {
      Object.keys(filterObj.sortby).map((key) => {
        params.sortby = key;
        params.orderby = filterObj.sortby[key];
      });
    }
    setActiveFilter(filter);
    history.push(`${BASE_URL}/?${queryToUrl(params)}`);
  };

  const onUpdatedFilter = (filters) => {
    let params = {
      ...filters,
    };
    history.push(`${BASE_URL}/?${queryToUrl(params)}`);
  };

  const onStausFilter = (status) => {
    const params = { ...queryParams, page: 1, status };

    if (status == "View All") delete params.status;
    history.push(`${BASE_URL}/?${queryToUrl(params)}`);
  };

  const handleClose = () => {
    const params = { ...queryParams };
    history.push(`${BASE_URL}/?${queryToUrl(params)}`);
  };

  const handleClear = () => {
    setActiveFilter({});
    history.push(`${BASE_URL}/`);
  };

  const handleSearch = (query) => {
    if (query) history.push(`${BASE_URL}/?globalsearch=${query}`);
    else history.push(`${BASE_URL}`);
  };

  //Effects
  useEffect(() => {
    init();
    setMounted(true);
  }, []);

  useEffect(() => {
    mounted && init();
  }, [
    page,
    globalsearch,
    JSON.stringify(restParams),
    id,
    JSON.stringify(selectedEntity),
  ]);

  const renderStatusFilter = () => {
    let { sys_topLevel } = entityInfo.metadata.sys_entityAttributes;
    let statusField = sys_topLevel.find((ef) => ef.name == "status") || null;
    if (statusField)
      return (
        <DisplaySelect
          labelKey="value"
          testId={"import-select-primarykey"}
          variant={"outlined"}
          valueKey="id"
          required={true}
          defaultValue="View All"
          values={statusField.values}
          onChange={(value) => onStausFilter(value)}
          value={restParams?.status || "View All"}
          style={{ width: "200px", margin: "10px 0px" }}
        />
      );
  };

  if (id) {
    return <ImportSummary id={id} handleClose={handleClose} />;
  } else
    return (
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        {importMode !== "update" && (
          <div
            style={{
              display: "flex",
              flexShrink: 1,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "5px 50px",
                alignItems: "center",
              }}
            >
              <DisplayText variant="h6">Import History</DisplayText>&nbsp;
              <DisplayIconButton systemVariant="primary" onClick={init}>
                <Refresh />
              </DisplayIconButton>
            </div>
            <div style={{ display: "flex" }}>
              {!filterApplied && (
                <DisplaySearchBar
                  data={globalsearch}
                  onClick={handleSearch}
                  onClear={handleClear}
                  style={{ width: "30vw" }}
                />
              )}
            </div>
            {entityInfo && entityInfo.metadata && advSearchVisible && (
              <AdvanceSearch
                template={entityInfo.metadata}
                closeRenderAdvanceSearch={() => setAdvSearchVisibility(false)}
                onAdSearchOpen={onAdvSearch}
                propdata={{
                  ...(restParams || {}),
                  sys_agencyId,
                  sortby,
                  orderby,
                }}
                activeFilter={activeFilter}
                entityName={entityname}
                resetActiveFilter={resetActiveFilter}
                hideSaveFeature={true}
                showModal={advSearchVisible}
              />
            )}
            <div
              style={{
                display: "flex",
                flexShrink: 2,
                justifyContent: "flex-end",
                padding: "5px 50px",
              }}
            >
              {entityInfo && entityInfo.metadata && renderStatusFilter()}
              {/* <DisplayIconButton
              disabled={!entityInfo || !entityInfo.metadata}
              onClick={() => setAdvSearchVisibility(true)}
              systemVariant="primary"
            >
              <DisplayBadge variant="dot" invisible={!filterApplied}>
                <Tune />
              </DisplayBadge>
            </DisplayIconButton> */}
              {/* {filterApplied && (
              <div style={{ margin: "auto" }}>
                <FiltersPopover
                  filterParams={{ ...restParams }}
                  handleClear={handleClear}
                  updatedFilter={onUpdatedFilter}
                  styles={{ width: "22.5rem" }}
                />
              </div>
            )} */}
            </div>
          </div>
        )}
        <div
          style={{
            flex: 10,
            contain: importMode === "update" ? " " : "strict",
            overflow: importMode === "update" ? " " : "hidden",
            overflowY: importMode === "update" ? " " : "auto",
            marginBottom: "20px",
            padding: importMode === "update" ? "" : "16px",
          }}
          class="hide_scroll"
        >
          {importMode === "update" && (
            <div style={{ textAlign: "center" }}>
              <DisplayText
                variant="subtitle1"
                style={{ fontWeight: "500", color: "#2076d2" }}
              >
                {` Recent 10 ${
                  selectedEntity?.friendlyName
                    ? selectedEntity?.friendlyName
                    : ""
                } Imports`}
                <br />
              </DisplayText>
              <DisplayText style={{ fontSize: "12px" }}>
                <b>Note : </b>
                Click on "Success file" to download the spreadsheet containing
                the NueGov-Ids to perform updates.
              </DisplayText>
              <DisplayDivider style={{ margin: "12px 0px" }} />
            </div>
          )}
          {loading || !entityInfo ? (
            <ImportsSkeleton importMode={importMode} />
          ) : entityInfo.data.length > 0 ? (
            <DisplayGrid
              container
              spacing={3}
              style={{ height: "60vh", overflow: "auto" }}
            >
              {entityInfo.data.map((ed, i) => {
                // if (showCard(ed))
                return (
                  <DisplayGrid
                    key={ed._id}
                    item
                    xs={12}
                    sm={importMode === "update" ? 12 : 6}
                    md={importMode === "update" ? 12 : 4}
                    lg={importMode === "update" ? 12 : 3}
                    xl={importMode === "update" ? 12 : 3}
                    style={{
                      minHeight: "100px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardComponent
                      data={ed}
                      template={entityInfo.metadata}
                      onCardClick={handleCardClick}
                    />
                  </DisplayGrid>
                );
              })}
            </DisplayGrid>
          ) : (
            <ErrorFallback slug="no_result" />
          )}
        </div>

        {importMode !== "update" && (
          <div style={{ flexShrink: 1, padding: "16px" }}>
            {entityInfo ? (
              <DisplayGrid item container>
                <DisplayGrid item container xs={10} sm={6} md={4} lg={4} xl={2}>
                  <DisplayPagination
                    totalCount={entityInfo.totalCount}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onChange={onPageChange}
                    currentPage={page ? Number(page) : 1}
                  />
                </DisplayGrid>
                <DisplayGrid
                  item
                  container
                  xs={2}
                  sm={6}
                  md={8}
                  lg={8}
                  xl={10}
                  justify="flex-end"
                >
                  <DisplayButton
                    size="medium"
                    variant="outlined"
                    onClick={(e) => {
                      history.push(`/app/import`);
                      e.stopPropagation();
                    }}
                    style={{
                      color: "red",
                      borderColor: "red",
                      borderRadius: "8px",
                      height: "32px",
                    }}
                  >
                    Close
                  </DisplayButton>
                </DisplayGrid>
              </DisplayGrid>
            ) : (
              <PaginationSkeleton />
            )}
          </div>
        )}
        <DisplaySnackbar
          open={!!message}
          message={message}
          onClose={clearMessage}
        />
      </div>
    );
};
