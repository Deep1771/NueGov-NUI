import React, { useEffect, useState, useRef, memo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getData, getCount } from "./summary_services";
import { presetTemplate } from "utils/services/api_services/template_service";
import Preset from "utils/services/factory_services/preset_factory";
import { Footer } from "./summary_footer";
import { ContextHeader } from "./context_header";
import { CardContainer } from "./summary_card";
import { SummaryContainerSkeleton } from "components/skeleton_components/summary_page/summary_container";
import { BubbleLoader } from "components/helper_components";
import { VariableSizeList as List, areEqual } from "react-window";
import { UserFactory } from "utils/services/factory_services";
import AutoSizer from "react-virtualized-auto-sizer";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flex: 1,
    height: "100%",
    flexDirection: "column",
    borderStyle: "solid",
    borderColor: "#8080802b",
    borderWidth: "0px 2px 0px 0px",
    backgroundColor: "#F0F0F0",
  },
  body: {
    display: "flex",
    flex: 10,
    flexDirection: "column",
    height: "100%",
    width: "100%",
    marginTop: "10px",
  },
  header: {
    display: "flex",
    flexShrink: 1,
  },
  footer: {
    display: "flex",
    flex: 1.5,
  },
});

export const ContextSummary = (props) => {
  let {
    appName,
    entityName,
    filters,
    handleCancel,
    moduleName,
    options,
    permissionCheck,
    summaryMode,
  } = props;

  const { getByData, getByDataAgencyId } = Preset();
  const classes = useStyles(props);

  const [cardLoading, setCardLoading] = useState(false);
  const [currentPage, setCurrent] = useState(1);
  const [entityData, setEntityData] = useState([]);
  const [searchValue, setSearchValue] = useState();
  const [sortFields, setSortFields] = useState([]);
  const [multipleData, setMultiple] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [template, setTemplate] = useState({});
  const [templateData, setTemplateData] = useState([]);
  const [toggleSearch, setToggleSearch] = useState(false);
  const [totalData, setTotalData] = useState();
  const [totalCount, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandAll, setExpandAll] = useState([]);
  const listRef = useRef();
  const cardHeight = useRef(360);
  const { getAgencyDetails, isNJAdmin } = UserFactory();
  const { showSampleData = false } =
    getAgencyDetails?.sys_entityAttributes || {};

  const params = {
    appname: appName,
    modulename: moduleName,
  };

  const ITEMS_PER_PAGE = 30;

  //Getters
  const getParams = () => {
    let filterObj = {};
    if (isNJAdmin() || showSampleData) filterObj.sampleData = true;
    if (filters) {
      Object.keys(filters).map((item) => {
        filterObj[item] = filters[item];
      });
    }
    return filterObj;
  };

  const getItemSize = (index) => {
    let item = entityData[index];
    if (expandAll.includes(item._id)) return cardHeight.current;
    else return 180;
  };

  const handleExpandAll = () => {
    if (expandAll.length) setExpandAll([]);
    else setExpandAll(entityData.map((ed) => ed._id));
  };

  const handleExpandCard = (id) => {
    if (expandAll.find((ei) => ei == id))
      setExpandAll(expandAll.filter((ei) => ei != id));
    else setExpandAll([...expandAll, id]);
  };

  const getState = async () => {
    try {
      let entityParams = {
        ...params,
        entityname: entityName,
        limit: ITEMS_PER_PAGE,
        skip: 0,
        ...getParams(),
      };
      setLoading(true);
      let api_params = getParams();
      let templateData = await presetTemplate.create({
        ...params,
        groupname: entityName,
      });

      let template = getByData(templateData, entityName);
      if (template && template.sys_entityAttributes) {
        let { projectFields } =
          template?.sys_entityAttributes?.app_cardContent || {};
        if (projectFields) entityParams.displayFields = projectFields.join(",");
        //set card height
        let { app_cardContent } = template.sys_entityAttributes;
        let { titleField = [], descriptionField = [] } = app_cardContent;
        cardHeight.current = (titleField.length + descriptionField.length) * 60;
        //end

        try {
          let [entityResult, count] = await Promise.all([
            getData(entityParams),
            getCount({
              ...params,
              entityname: entityName,
              ...api_params,
              ...getParams(),
            }),
          ]);
          if (options && Object.keys(options).length) {
            if (options.select === "multiple") {
              // let result = await getData({
              //   ...params,
              //   entityname: entityName,
              //   limit: count.data,
              //   skip: 0,
              // });
              // setTotalData(result);
              setTotalData(entityResult);
            }
          }
          setTemplateData(templateData);
          setTemplate(template);
          setEntityData(entityResult);
          setCount(count.data);
          setLoading(false);
        } catch (e) {
          if (e.status === 403) permissionCheck();
        }
      } else permissionCheck();
    } catch (e) {
      if (e.status === 403) permissionCheck();
    }
  };

  const getSearchData = async (type, value, advance) => {
    setCardLoading(true);
    let entityResult, count;
    if (sortFields.length) {
      params["orderby"] = sortFields[0]["order"];
      params["sortby"] = sortFields[0]["name"];
    }
    try {
      if (type === "search") {
        let searchData;
        advance
          ? (searchData = value)
          : (searchData = { globalsearch: value.trimLeft() });
        entityResult = await getData({
          ...params,
          ...{
            entityname: entityName,
            limit: ITEMS_PER_PAGE,
            skip: 0,
            ...searchData,
            ...getParams(),
          },
        });
        count = await getCount({
          ...params,
          ...{ entityname: entityName, ...searchData, ...getParams() },
        });
      } else {
        entityResult = await getData({
          ...params,
          ...{
            entityname: entityName,
            limit: ITEMS_PER_PAGE,
            skip: 0,
            ...getParams(),
          },
        });
        count = await getCount({
          ...params,
          entityname: entityName,
          ...getParams(),
        });
      }
      setSearchValue(value);
      setEntityData(entityResult);
      setCount(count.data);
      setCurrent(1);
      setCardLoading(false);
    } catch (e) {
      console.log("error reported in context summary get Search data", e);
    }
  };

  const getTemplateByAgency = (data, entityName, agencyId) => {
    try {
      let agencyTemplate = getByDataAgencyId(data, entityName, agencyId);
      if (agencyTemplate && Object.keys(agencyTemplate).length > 0)
        return agencyTemplate;
      else return template;
    } catch {
      return template;
    }
  };

  const handleCardClick = (value) => {
    let selectedValues = multipleData?.length ? [...multipleData] : [];
    let index = selectedValues.findIndex((e) => e._id === value._id);
    index === -1 ? (selectedValues[0] = value) : (selectedValues = []);
    let selectedDatas = selectedData;
    index = selectedDatas.findIndex((e) => e.sys_gUid === value.sys_gUid);
    index === -1
      ? selectedDatas.splice(selectedValues.length, 0, value)
      : selectedDatas.splice(index, 1);
    selectedDatas = selectedDatas.filter((e) => e?.sys_gUid);
    selectedValues = selectedValues.filter((e) => e?.sys_gUid);
    setSelectedData(selectedDatas);
    setMultiple(selectedValues);
  };

  const handleCheckBox = (value) => {
    let selectedValues = [...multipleData];
    let index = selectedValues.findIndex((e) => e.sys_gUid === value.sys_gUid);
    index === -1
      ? selectedValues.splice(selectedValues.length, 0, value)
      : selectedValues.splice(index, 1);
    let selectedDatas = selectedData;
    index = selectedDatas.findIndex((e) => e.sys_gUid === value.sys_gUid);
    index === -1
      ? selectedDatas.splice(selectedValues.length, 0, value)
      : selectedDatas.splice(index, 1);
    selectedDatas = selectedDatas.filter((e) => e?.sys_gUid);
    selectedValues = selectedValues.filter((e) => e?.sys_gUid);
    setSelectedData(selectedDatas);
    setMultiple(selectedValues);
  };

  const handleMenuClose = async (name, orderby) => {
    setCardLoading(true);
    let toggleField = sortFields.some(
      (e) => e.sortby === name && parseInt(e.orderby) === orderby
    );
    let searchData;
    try {
      if (!toggleField) {
        if (searchValue) {
          if (typeof searchValue === "object") searchData = searchValue;
          else searchData = { globalsearch: searchValue.trimLeft() };
        }
        let result = await getData({
          ...params,
          entityname: entityName,
          ...{
            orderby: orderby,
            sortby: name,
            limit: ITEMS_PER_PAGE,
            skip: 0,
            ...searchData,
            ...getParams(),
          },
        });
        let count = await getCount({
          ...params,
          entityname: entityName,
          ...{
            orderby: orderby,
            sortby: name,
            limit: ITEMS_PER_PAGE,
            skip: 0,
            ...searchData,
            ...getParams(),
          },
        });
        setEntityData(result);
        setCount(count.data);
        setCurrent(1);
        setSortFields([{ sortby: name, orderby: orderby }]);
      } else {
        let result = await getData({
          ...params,
          ...{
            entityname: entityName,
            limit: ITEMS_PER_PAGE,
            skip: 0,
            ...getParams(),
          },
        });
        let count = await getCount({
          ...params,
          ...{
            entityname: entityName,
            limit: ITEMS_PER_PAGE,
            skip: 0,
            ...getParams(),
          },
        });
        setEntityData(result);
        setCount(count.data);
        setCurrent(1);
        setSortFields([]);
      }
      setCardLoading(false);
    } catch (e) {
      console.log("Error reported in context summary handle menu close", e);
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
    let result = await getData({
      ...params,
      ...{
        entityname: entityName,
        limit: ITEMS_PER_PAGE,
        skip: skip,
        ...searchData,
        ...getParams(),
      },
    });
    let count = await getCount({
      ...params,
      ...{
        entityname: entityName,
        limit: ITEMS_PER_PAGE,
        skip: skip,
        ...searchData,
        ...getParams(),
      },
    });
    setMultiple(multipleData);
    setEntityData(result);
    setTotalData(result);
    setCount(count.data);
    setCurrent(value);
    setCardLoading(false);
  };

  const handleSearch = (value) => setToggleSearch(value);

  useEffect(() => {
    getState();
  }, [appName, moduleName, entityName, filters]);

  useEffect(() => {
    if (options) {
      let { selectedIds = [] } = options || {};
      if (selectedIds?.length) {
        setSelectedData(selectedIds);
        let values = [...multipleData];
        if (totalData && totalData.length) {
          selectedIds.map((e) => {
            let selectedDoc = totalData.find((e1) => e1._id === e.id);
            if (selectedDoc) values.push(selectedDoc);
          });
          values = values.filter((item, i, array) => {
            return i === array.findIndex((e) => e._id === item._id);
          });

          setMultiple(values);
        }
      }
    }
  }, [totalData]);

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
            entityTemplate={getTemplateByAgency(
              templateData,
              entityName,
              item.sys_agencyId
            )}
            selectedData={multipleData}
            summaryMode={"context_summary"}
            cardClick={handleCardClick}
            options={options}
            handleCheckBox={handleCheckBox}
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
      <div className={classes.root}>
        <div className={classes.header}>
          <ContextHeader
            template={template}
            entityName={entityName}
            params={{ appName, moduleName, entityName }}
            handleMenuClose={handleMenuClose}
            sortFields={sortFields}
            handleSearch={handleSearch}
            toggleSearch={toggleSearch}
            getSearchData={getSearchData}
            style={{ width: "100%" }}
            summaryMode={summaryMode}
            data={multipleData}
            handleCancel={(e) =>
              handleCancel({
                entityTemplate: template,
                data: multipleData,
                selectedData: selectedData,
              })
            }
            adSearchData={searchValue}
            handleExpandAll={handleExpandAll}
            expandAll={expandAll.length == entityData.length}
          />
        </div>
        <div className={classes.body}>
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
        <div className={classes.footer}>
          <Footer
            totalCount={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            dataCount={totalCount}
            handlePageChange={(event, page) => handlePageChange(event, page)}
            currentPage={currentPage}
            summaryMode={summaryMode}
            entityTemplate={template}
          />
        </div>
      </div>
    );
};
