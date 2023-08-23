import React, { useEffect, useState, useRef, memo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useParams } from "react-router";
import queryString from "query-string";
import {
  deleteEntity,
  entity,
} from "utils/services/api_services/entity_service";
import { getCount, getData } from "./components/summary_services";
import { useStateValue } from "utils/store/contexts";
import {
  FiltersFactory,
  PresetFactory,
  UserFactory,
} from "utils/services/factory_services";
import { CardContainer } from "./components/summary_card";
import { Footer } from "./components/summary_footer";
import { Header } from "./components/summary_header";
import { ContainerWrapper } from "components/wrapper_components/container";
import { SummaryContainerSkeleton } from "components/skeleton_components/summary_page/summary_container";
import { AdvanceSearch, BubbleLoader } from "components/helper_components";
import { styles } from "./styles";
import { VariableSizeList as List, areEqual } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

export const SummaryContainer = (props) => {
  const {
    appName,
    callBackCount,
    entityName,
    moduleName,
    reload,
    summaryMap,
    appliedFilter,
  } = props;
  const { appname, modulename, entityname, id, mode } = useParams();
  const queryParams = queryString.parse(useLocation().search);
  const history = useHistory();

  const [{ presetState }] = useStateValue();
  const { getDefault, getFilterParams } = FiltersFactory();
  const { getByGroupName, getByAgencyId, getRoleBasedTemplate } =
    PresetFactory();
  const { checkDataAccess, isNJAdmin, isRoleBasedLayout } = UserFactory();

  const [bulkData, setBulkData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [expandAll, setExpandAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [template, setTemplate] = useState({});
  const [selectedData, setSelectedData] = useState([]);
  const [totalCount, setCount] = useState();
  const [toggleAdSearch, setToggleAdSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState({});
  const listRef = useRef();
  const cardHeight = useRef(360);

  const { page, drawer, ...restParams } = queryParams;
  const { globalsearch, ...advSearchParams } = restParams;
  const { sortby, orderby, sys_agencyId, ...filterParams } = advSearchParams;
  const filterApplied =
    !globalsearch && !!(restParams && Object.keys(restParams).length);

  const params = { appname, modulename, entityname };
  const checkPreset =
    presetState &&
    presetState.presetTemplates &&
    presetState.presetTemplates.length;

  const ITEMS_PER_PAGE = 30;
  const BASE_URL = `/app/summary/${appname}/${modulename}/${entityname}`;

  //for effect
  let refreshParams = { ...restParams };
  if (page) refreshParams.page = page;

  //declartive
  const handleExpandAll = () => {
    if (expandAll.length) setExpandAll([]);
    else setExpandAll(entityData.map((ed) => ed._id));
  };

  const handleExpandCard = (id) => {
    if (expandAll.find((ei) => ei == id))
      setExpandAll(expandAll.filter((ei) => ei != id));
    else setExpandAll([...expandAll, id]);
  };

  const queryToUrl = (params) =>
    Object.keys(params || {})
      .map((key) => key + "=" + params[key])
      .join("&");

  //To set the initial state
  const getState = async () => {
    !mounted ? setLoading(true) : setCardLoading(true);

    if (checkPreset) {
      let baseParams = {
        ...params,
        ...restParams,
      };
      let entityParams = {
        ...baseParams,
        skip: page ? (page - 1) * ITEMS_PER_PAGE : 0,
        limit: ITEMS_PER_PAGE,
      };
      let template = await getByGroupName(entityname);
      setTemplate(template);

      //set card height
      let { app_cardContent } = template.sys_entityAttributes;
      let { titleField = [], descriptionField = [] } = app_cardContent
        ? app_cardContent
        : {};
      cardHeight.current = (titleField.length + descriptionField.length) * 54;
      //end

      let { projectFields } =
        template?.sys_entityAttributes?.app_cardContent || {};
      if (projectFields) entityParams.displayFields = projectFields.join(",");

      let [entityResult, count] = await Promise.all([
        getData(entityParams),
        getCount(baseParams),
      ]);
      setTemplate(template);
      setEntityData(entityResult);
      setCount(count.data);
      setLoading(false);
      setCardLoading(false);
      props.setReload && props.setReload(false);

      if (!id && !summaryMap) {
        loadFirstData(entityResult);
      }
    }
  };

  //custom functions
  const loadFirstData = (entityResult) => {
    if (entityResult.length) {
      let selectedDocId = id ? id : entityResult[0]._id;
      let writeAccess = checkDataAccess({
        appname: appName,
        modulename: moduleName,
        entityname: entityName,
        permissionType: "write",
        data: entityResult[0],
        metadata: template,
      });
      let r_w = writeAccess ? "edit" : "read";
      let selectedMode = mode ? mode : r_w;
      let baseUrl = `${BASE_URL}/${selectedMode}/${selectedDocId}?${queryToUrl(
        queryParams
      )}`;
      if (mode != "new") {
        history.replace(baseUrl);
        setSelectedData([{ _id: selectedDocId }]);
      }
    }
  };

  const baseParams = () => {
    let obj = {};
    ["drawer"].map((ep) => {
      if (queryParams[ep]) obj[ep] = queryParams[ep];
    });
    return obj;
  };

  const onSearch = (value) => {
    if (value) {
      let params = { globalsearch: value, ...baseParams() };
      history.push(`${BASE_URL}?${queryToUrl(params)}`);
    } else {
      setActiveFilter({});
      let params = { ...baseParams() };
      history.push(`${BASE_URL}?${queryToUrl(params)}`);
    }
  };

  const onAdvanceSearch = (filterObj, filter) => {
    let params = {
      ...filterObj.filters,
      ...baseParams(),
    };
    if (filterObj.sys_agencyId) params.sys_agencyId = filterObj.sys_agencyId;
    if (filterObj.sortby) {
      Object.keys(filterObj.sortby).map((key) => {
        params.sortby = key;
        params.orderby = filterObj.sortby[key];
      });
    }
    setActiveFilter(filter);
    history.push(`${BASE_URL}?${queryToUrl(params)}`);
  };
  const editSearch = (filters) => {
    let params = {
      ...filters,
      ...baseParams(),
    };
    history.push(`${BASE_URL}?${queryToUrl(params)}`);
  };

  const getTemplate = (entityName, data) => {
    try {
      if (isRoleBasedLayout(appName, moduleName, entityName) && !isNJAdmin()) {
        let metadata = getRoleBasedTemplate(entityName, data.sys_templateName);
        return metadata;
      } else {
        let agencyTemplate = getByAgencyId(entityName, data.sys_agencyId);
        if (agencyTemplate && Object.keys(agencyTemplate).length > 0)
          return agencyTemplate;
        else return template;
      }
    } catch {
      return template;
    }
  };

  const handleCardClick = (value) => {
    let selectedValues = [...selectedData];
    let index = selectedValues.findIndex((e) => e._id === value._id);
    let query_params = { ...queryParams };

    if (summaryMap || index === -1) {
      if (index === -1) {
        let writeAccess = checkDataAccess({
          appname: appName,
          modulename: moduleName,
          entityname: entityName,
          permissionType: "write",
          data: value,
          metadata: template,
        });

        let r_w = writeAccess ? "edit" : "read";
        history.push(
          `${BASE_URL}/${r_w}/${value._id}?${queryToUrl(query_params)}`
        );
      } else history.push(`${BASE_URL}?${queryToUrl(query_params)}`);

      index === -1 ? (selectedValues[0] = value) : (selectedValues = []);
      setSelectedData(selectedValues);
    }
  };

  const handleCheckBox = (value) => {
    let selectedValues = [...bulkData];
    let index = bulkData.findIndex((e) => e.sys_gUid === value.sys_gUid);
    index === -1
      ? selectedValues.splice(selectedValues.length, 0, value)
      : selectedValues.splice(index, 1);
    setBulkData(selectedValues);
  };

  const handlePageChange = (page) => {
    const params = { ...queryParams, page };
    history.push(`${BASE_URL}?${queryToUrl(params)}`);
  };

  const handleMenuClose = (sortby, orderby) => {
    let params = { sortby, orderby, ...baseParams() };
    history.push(`${BASE_URL}?${queryToUrl(params)}`);
  };

  const onDelete = async (data) => {
    setCardLoading(true);
    let index = bulkData.findIndex((e) => e._id === data._id);
    if (index !== -1) {
      bulkData.splice(index, 1);
      setBulkData(bulkData);
    }
    let query_params = { ...queryParams };
    if (mode && id && id == data._id)
      history.push(`${BASE_URL}?${queryToUrl(query_params)}`);

    let res = await deleteEntity.remove({
      ...params,
      entityname,
      id: data._id,
      templateName: template.sys_entityAttributes.sys_templateName,
    });
    getState();
  };

  const toggleDrawer = (e) => {
    const params = { ...queryParams };
    params.drawer = params.drawer === "true" ? "false" : true;
    if (mode && id)
      history.push(`${BASE_URL}/${mode}/${id}?${queryToUrl(params)}`);
    else if (mode && !id)
      history.push(`${BASE_URL}/${mode}?${queryToUrl(params)}`);
    else history.push(`${BASE_URL}?${queryToUrl(params)}`);
  };

  const getFilters = (entityName) => {
    let defaultObj = getDefault(entityName);
    if (defaultObj) {
      setActiveFilter(defaultObj);
      return getFilterParams(defaultObj);
    } else {
      setActiveFilter({});
      return {};
    }
  };

  const handleEntitySelect = (entity) => {
    if (presetState) {
      let { selectedEntities } = presetState.activePreset.sys_entityAttributes;
      if (selectedEntities.length && entity !== entityname) {
        let { appName, moduleName, groupName } = selectedEntities.find(
          (e) => e.groupName === entity
        );
        let params = getFilters(entity);
        params.drawer = drawer ? drawer : "true";
        let url = `/app/summary/${appName}/${moduleName}/${groupName}?${queryToUrl(
          params
        )}`;
        history.push(url);
      }
    }
  };

  const renderAdvanceSearch = () => {
    if (toggleAdSearch)
      return (
        <AdvanceSearch
          template={template}
          closeRenderAdvanceSearch={() => setToggleAdSearch(false)}
          onAdSearchOpen={onAdvanceSearch}
          propdata={{ ...(filterParams || {}), sys_agencyId, sortby, orderby }}
          activeFilter={activeFilter}
          resetActiveFilter={() => {
            setActiveFilter({});
          }}
          showModal={toggleAdSearch}
          hideSaveFeature={false}
          entityName={entityname}
        />
      );
  };

  useEffect(() => {
    setActiveFilter(appliedFilter);
  }, [appliedFilter]);

  useEffect(() => {
    if (mounted && checkPreset && appname && modulename && entityname)
      getState();
  }, [
    appname,
    modulename,
    entityname,
    checkPreset,
    JSON.stringify(refreshParams),
  ]);

  useEffect(() => {
    if (reload) getState();
  }, [reload]);

  useEffect(() => {
    getState();
    setMounted(true);
  }, []);

  useEffect(() => {
    callBackCount && callBackCount(totalCount);
  }, [totalCount]);

  const getItemSize = (index) => {
    let item = entityData[index];
    if (expandAll.includes(item._id)) return cardHeight.current;
    else return 180;
  };

  useEffect(() => {
    if (listRef.current) listRef.current.resetAfterIndex(0);
  }, [expandAll]);

  const renderCard = memo(({ index, style }) => {
    let item = entityData[index];
    if (item)
      return (
        <div key={index} style={{ ...style, display: "flex", width: "100%" }}>
          <CardContainer
            entityDoc={item}
            entityTemplate={getTemplate(entityName, item)}
            selectedData={id ? [{ _id: id }] : []}
            mode={"summary"}
            bulkData={bulkData}
            cardClick={(value) => {
              handleCardClick(value);
            }}
            onDelete={onDelete}
            handleCheckBox={handleCheckBox}
            summaryMode={"summary"}
            handleExpandCard={handleExpandCard}
            expandAll={expandAll}
          />
        </div>
      );
    else return null;
  }, areEqual);

  if (loading) return <SummaryContainerSkeleton />;
  else
    return (
      <ContainerWrapper>
        <div style={styles.root}>
          <div style={styles.header}>
            {
              <Header
                template={template}
                handleMenuClose={handleMenuClose}
                sortFields={[]}
                toggleSearch={true}
                toggleDrawer={toggleDrawer}
                callbackSearch={onSearch}
                searchValue={globalsearch}
                style={{ width: "100%" }}
                summaryMode={"summary"}
                data={selectedData}
                expandAll={expandAll.length == entityData.length}
                onEntitySelect={handleEntitySelect}
                handleExpandAll={handleExpandAll}
                onAdvanceSearch={() => setToggleAdSearch(!toggleAdSearch)}
                onEditSearch={editSearch}
                filterApplied={filterApplied}
                filterParams={{ ...(advSearchParams || {}) }}
                params={params}
                mode={mode}
              />
            }
          </div>
          <div style={styles.body}>
            {!cardLoading ? (
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    ref={listRef}
                    useIsScrolling
                    height={height}
                    itemCount={entityData.length}
                    itemSize={getItemSize}
                    width={width}
                    className="hide_scroll"
                  >
                    {renderCard}
                  </List>
                )}
              </AutoSizer>
            ) : (
              <BubbleLoader />
            )}
          </div>
          <div style={styles.footer}>
            <Footer
              totalCount={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
              dataCount={totalCount}
              bulkData={bulkData}
              emptyBulkData={setBulkData}
              entityTemplate={template ? template : null}
              handlePageChange={(event, page) => handlePageChange(page)}
              currentPage={queryParams.page || 1}
              refresh={getState}
              summaryMode={"summary"}
              handleNewClick={(e) =>
                history.push(`/app/${appName}/${moduleName}/${entityName}/new`)
              }
              filters={restParams}
            />
          </div>
          {renderAdvanceSearch()}
        </div>
      </ContainerWrapper>
    );
};
