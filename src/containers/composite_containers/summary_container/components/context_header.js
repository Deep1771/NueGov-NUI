import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import queryString from "query-string";
import { useStateValue } from "utils/store/contexts";
import { ThemeFactory } from "utils/services/factory_services";
import { UserFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import {
  DisplayBadge,
  DisplayChips,
  DisplayText,
  DisplayIconButton,
  DisplaySearchBar,
} from "components/display_components";
import { AdvanceSearch, FiltersPopover } from "components/helper_components";
import { SystemIcons } from "utils/icons/";

const useStyles = makeStyles({
  header: ({ colors, local }) => ({
    backgroundColor: colors.dark.bgColor,
    color: colors.dark.text,
    flex: 1,
    padding: "10px 0 0 0",
    opacity: 0.9,
  }),
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    marginTop: "8px",
  },
  textContainer: {
    display: "flex",
    flex: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    margin: "-4px 0 0 12px",
  },
  labelDiv: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    marginLeft: "4%",
  },
  text: ({ colors }) => ({
    color: colors.dark.bgColor,
  }),
  entityList: ({ colors, local }) => ({
    backgroundColor: colors.dark.bgColor,
    color: colors.dark.text,
  }),
});

export const ContextHeader = (props) => {
  const {
    adSearchData,
    data,
    entityName,
    expandAll,
    getSearchData,
    handleCancel,
    handleExpandAll,
    handleMenuClose,
    handleSearch,
    sortFields,
    template,
    toggleDrawer,
    toggleSearch,
    summaryMode,
    systemVariant,
    params,
  } = props;
  const { app_cardContent, sys_topLevel } = get(
    template,
    "sys_entityAttributes"
  );
  const { descriptionField = [], titleField = [] } = app_cardContent;
  const description =
    app_cardContent && Object.keys(app_cardContent).length
      ? [...titleField, ...descriptionField]
      : [];
  const { entityname } = useParams();
  const history = useHistory();
  const [{ presetState, moduleState }] = useStateValue();
  const { getVariantForComponent } = ThemeFactory();
  const { getEntityFriendlyName } = UserFactory();
  const {
    ArrowDownward,
    ArrowUpward,
    CloseOutlined,
    Done,
    ExpandMore,
    Reorder,
    Search,
    Sort,
    UnfoldLess,
    UnfoldMore,
    Tune,
  } = SystemIcons;

  const [adSearchValue, setAdSearchValue] = useState();
  const [adSearchFlag, setAdSearchFlag] = useState(false);
  const [toggleAdSearch, setToggleAdSearch] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextValue, setContextValue] = useState();
  const [e_anchorEl, sete_AnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState();
  const [selectedEntity, setSelectedEntity] = useState();

  const e_open = Boolean(e_anchorEl);
  const e_id = e_open ? "simple-popover" : undefined;
  const queryParams = queryString.parse(history.location.search);
  const { drawer } = queryParams;

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useStyles(
    getVariantForComponent("SUMMARY_HEADER", defaultVariant)
  );

  //getters

  const getSearchValue = (searchedData) => {
    getSearchData("search", searchedData);

    setAdSearchValue();
  };

  const onAdvanceSearch = (filterObj, filter) => {
    let params = {
      ...filterObj.filters,
    };
    if (filterObj.sys_agencyId) {
      params.sys_agencyId = filterObj.sys_agencyId;
    }
    if (Object.keys(params).length > 0) {
      getSearchData("search", params, true);
      setSearchValue(params);
      setContextValue("");
    }
  };

  const onUpdatedFilter = (filters) => {
    let params = {
      ...filters,
    };
    if (Object.keys(params).length > 0) {
      getSearchData("search", params, true);
      setSearchValue(params);
      setContextValue("");
    } else {
      getSearchData("initial", "");
      setSearchValue("");
    }
  };

  const getPresetValues = () => {
    if (moduleState) {
      let selectedEntities = moduleState.activeModuleEntities;
      if (selectedEntities.length) {
        return selectedEntities.map((e) => {
          return {
            groupName: e.groupName,
            friendlyName: e.friendlyName,
          };
        });
      } else return [];
    }
  };

  const getTitle = (value) => {
    if (value.type === "REFERENCE")
      return value.name.friendlyName ? value.name.friendlyName : "";
    else {
      let definition =
        sys_topLevel && sys_topLevel.find((e) => e.name === value.item.name);
      return definition ? definition.title : "";
    }
  };

  //custom functions

  const constructSortField = (item) => {
    let referenceField,
      sortObj = {
        asc: false,
        dsc: false,
      };
    let sortby, orderby;
    /* Check for the reference field*/
    // if(item.displayField)
    if (summaryMode === "summary") {
      /* if sort field is in query string */
      if (get(queryParams, "sortby") && get(queryParams, "orderby")) {
        sortby = queryParams.sortby;
        orderby = queryParams.orderby;
      } else {
        if (sortFields.length) {
          sortby = sortFields[0].sortby;
          orderby = sortFields[0].orderby;
        }
      }
      if (item.display) {
        referenceField =
          item.display.name.split(".")[item.display.name.split(".").length - 1];
        if (
          `${item.name}.${referenceField}` === sortby &&
          parseInt(orderby) === 1
        ) {
          sortObj["asc"] = true;
        }

        if (
          `${item.name}.${referenceField}` === sortby &&
          parseInt(orderby) === -1
        )
          sortObj["dsc"] = true;
      } else {
        if (item.name === sortby && parseInt(orderby) === 1)
          sortObj["asc"] = true;
        if (item.name === sortby && parseInt(orderby) === -1)
          sortObj["dsc"] = true;
      }
    } else {
      if (sortFields.length) {
        sortby = sortFields[0].sortby;
        orderby = sortFields[0].orderby;
      }
      if (item.display) {
        referenceField =
          item.display.name.split(".")[item.display.name.split(".").length - 1];
        if (
          `${item.name}.${referenceField}` === sortby &&
          parseInt(orderby) === 1
        ) {
          sortObj["asc"] = true;
        }

        if (
          `${item.name}.${referenceField}` === sortby &&
          parseInt(orderby) === -1
        )
          sortObj["dsc"] = true;
      } else {
        if (item.name === sortby && parseInt(orderby) === 1)
          sortObj["asc"] = true;
        if (item.name === sortby && parseInt(orderby) === -1)
          sortObj["dsc"] = true;
      }
    }
    return sortObj;
  };

  const handleChip = (definition, order, type) => {
    setAnchorEl(null);
    let sortField;
    if (type === "REF") {
      if (definition.display.name.split(".").length > 1)
        sortField = `${definition.name}.${
          definition.display.name.split(".")[
            definition.display.name.split(".").length - 1
          ]
        }`;
      else sortField = `${definition.name}.${definition.display.name}`;
    } else sortField = definition.name;
    handleMenuClose(sortField, order);
  };

  const handleEnter = (e) => {
    let filterValue = summaryMode === "summary" ? searchValue : contextValue;
    if (e.key === "Enter" && filterValue) getSearchData("search", filterValue);
  };

  const handleMenu = (event) => setAnchorEl(event.currentTarget);

  const onChange = (value) => {
    //To handle summary container search
    summaryMode == "context_summary"
      ? setContextValue(value)
      : setSearchValue(value);
    if (value) handleSearch(true);
    else {
      handleSearch(false);
      // getSearchData("initial", "");
    }
  };

  const switchEntity = (entity) => {
    sete_AnchorEl(null);
    if (moduleState) {
      let selectedEntities = moduleState.activeModuleEntities;
      if (selectedEntities.length && entity !== entityname) {
        let { appName, moduleName, groupName, friendlyName } =
          selectedEntities.find((e) => e.groupName === entity);
        setSelectedEntity(friendlyName);
        let url = `/app/summary/${appName}/${moduleName}/${groupName}?drawer=${
          drawer ? drawer : "true"
        }`;
        history.push(url);
      }
    }
  };

  useEffect(() => {
    if (get(queryParams, "globalsearch"))
      setSearchValue(queryParams.globalsearch);
    if (get(queryParams, "filters"))
      setAdSearchValue(
        queryParams.filters.split("*").reduce(function (prev, curr, i, arr) {
          var p = curr.split(":");
          prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
          return prev;
        }, {})
      );
  }, []);

  useEffect(() => {
    typeof adSearchData == "object" && setAdSearchValue(adSearchData);
    adSearchData &&
    typeof adSearchData == "object" &&
    Object.keys(adSearchData).length
      ? setAdSearchFlag(true)
      : setAdSearchFlag(false);
  }, [adSearchData]);

  useEffect(() => {
    if (searchValue) setSearchValue("");
    if (contextValue) setContextValue("");
    if (adSearchValue) {
      setAdSearchValue("");
      setAdSearchFlag(false);
    }
  }, [template]);

  const renderEntityList = () => {
    return (
      <div>
        <Popover
          id={e_id}
          open={e_open}
          anchorEl={e_anchorEl}
          onClose={(e) => sete_AnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxHeight: "200px",
              minWidth: "156px",
              padding: "10px 5px 10px 5px",
            }}
          >
            {getPresetValues().map((e, i) => {
              return (
                <span
                  className="summary-list-item"
                  key={i}
                  style={{ padding: "5px", cursor: "pointer" }}
                  onClick={(event) => switchEntity(e.groupName)}
                >
                  <DisplayText variant="subtitle1">
                    {e.friendlyName}
                  </DisplayText>
                </span>
              );
            })}
          </div>
        </Popover>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className={classes.container}>
        <div className={classes.textContainer}>
          {summaryMode === "context_summary" ? (
            <div style={{ display: "flex", flex: 11.5 }}>
              {
                <DisplayText
                  variant="h6"
                  style={{ color: "#FFFFFF", fontFamily: "inherit" }}
                >
                  {getEntityFriendlyName({
                    appname: params.appName,
                    modulename: params.moduleName,
                    entityname: params.entityName,
                  })}
                </DisplayText>
              }
            </div>
          ) : (
            <div style={{ display: "flex", flex: 11.5 }}>
              <IconButton
                size="small"
                style={{ color: "#FFFFFF", marginRight: "10px" }}
                onClick={toggleDrawer}
              >
                <Reorder />
              </IconButton>

              {
                <DisplayText
                  variant="h6"
                  style={{
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                  onClick={(e) => sete_AnchorEl(e.currentTarget)}
                >
                  {selectedEntity
                    ? selectedEntity
                    : template.sys_entityAttributes.sys_friendlyName}
                </DisplayText>
              }
              <span
                style={{ padding: "2px 0 0 10px", cursor: "pointer" }}
                onClick={(e) => sete_AnchorEl(e.currentTarget)}
              >
                <ExpandMore />
              </span>
              {renderEntityList()}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flex: toggleSearch ? 3 : 4,
            justifyContent: "flex-end",
          }}
        >
          {description?.length > 3 && (
            <div>
              <IconButton
                size="small"
                style={{ color: "#FFFFFF", marginRight: "10px" }}
                onClick={(event) => handleExpandAll(event)}
              >
                {expandAll ? <UnfoldLess /> : <UnfoldMore />}{" "}
              </IconButton>
            </div>
          )}
          <div>
            <IconButton
              size="small"
              style={{ color: "#FFFFFF", marginRight: "10px" }}
              onClick={handleMenu}
            >
              <Sort />
            </IconButton>
            {renderMenu()}
          </div>
          <div>
            {summaryMode === "context_summary" &&
              (data.length > 0 ? (
                <IconButton
                  testid={"contextMenu-select"}
                  size="small"
                  style={{ color: "#FFFFFF", marginRight: "10px" }}
                  onClick={handleCancel}
                >
                  <Done />
                </IconButton>
              ) : (
                <IconButton
                  testid={"contextMenu-close"}
                  size="small"
                  style={{ color: "#FFFFFF", marginRight: "10px" }}
                  onClick={handleCancel}
                >
                  <CloseOutlined />
                </IconButton>
              ))}
          </div>
        </div>
      </div>
    );
  };
  const renderMenu = () => {
    return (
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={(e) => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{
          width: "500px",
          height: "500px",
          zIndex: 1700,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "200px",
            padding: "10px",
          }}
        >
          {app_cardContent &&
            Object.keys(app_cardContent).length > 0 &&
            app_cardContent.descriptionField.map((item, idx) => {
              if (item.visible) {
                if (item.type === "REFERENCE") {
                  return (
                    item.displayFields &&
                    item.displayFields.map((e1) => {
                      let setOrder = constructSortField(
                        { name: item.name, display: e1 },
                        "REF"
                      );
                      return (
                        <div style={{ display: "flex", paddingTop: "10px" }}>
                          <DisplayText
                            variant="subtitle2"
                            style={{
                              flex: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              contain: "strict",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {getTitle({ name: e1, type: "REFERENCE" })}
                          </DisplayText>
                          <DisplayChips
                            style={{
                              height: "20px",
                            }}
                            systemVariant={setOrder.asc ? "primary" : "default"}
                            size="small"
                            label="A - Z"
                            onClick={(e) =>
                              handleChip(
                                { name: item.name, display: e1 },
                                1,
                                "REF"
                              )
                            }
                          />
                          <DisplayChips
                            style={{
                              height: "20px",
                              marginLeft: "10px",
                            }}
                            systemVariant={setOrder.dsc ? "primary" : "default"}
                            label="Z - A"
                            onClick={(e) =>
                              handleChip(
                                { name: item.name, display: e1 },
                                -1,
                                "REF"
                              )
                            }
                            size="small"
                          />
                        </div>
                      );
                    })
                  );
                } else {
                  let setOrder = constructSortField({ name: item.name });

                  return (
                    <div
                      key={idx}
                      style={{ display: "flex", paddingTop: "10px" }}
                    >
                      <DisplayText
                        variant="subtitle2"
                        style={{
                          flex: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          contain: "strict",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getTitle({ item, type: "" })}
                      </DisplayText>
                      <DisplayChips
                        style={{
                          height: "20px",
                        }}
                        systemVariant={setOrder.asc ? "primary" : "default"}
                        label="A - Z"
                        onClick={(e) => handleChip({ name: item.name }, 1)}
                        size="small"
                      />
                      <DisplayChips
                        style={{
                          height: "20px",
                          marginLeft: "10px",
                        }}
                        systemVariant={setOrder.dsc ? "primary" : "default"}
                        label="Z - A"
                        onClick={(e) => handleChip({ name: item.name }, -1)}
                        size="small"
                      />
                    </div>
                  );
                }
              }
            })}
        </div>
      </Popover>
    );
  };

  const renderAdvanceSearch = () => {
    if (toggleAdSearch)
      return (
        <AdvanceSearch
          template={template}
          closeRenderAdvanceSearch={() => setToggleAdSearch(false)}
          onAdSearchOpen={onAdvanceSearch}
          propdata={adSearchValue ? adSearchValue : {}}
          activeFilter={{}}
          resetActiveFilter={{}}
          showModal={toggleAdSearch}
          hideSaveFeature={true}
          entityName={entityName}
        />
      );
  };

  const renderSearchBar = () => {
    let value = summaryMode == "context_summary" ? contextValue : searchValue;
    return (
      <div className={classes.container}>
        <div
          style={{
            display: "flex",
            backgroundColor: "#FFFFFF",
            flex: 1,
            alignItems: "center",
          }}
        >
          <DisplayIconButton onClick={() => setToggleAdSearch(true)}>
            <DisplayBadge
              testid={`${entityName}-context-asf`}
              variant="dot"
              invisible={!adSearchFlag}
            >
              <Tune className={classes.text} />
            </DisplayBadge>
          </DisplayIconButton>

          {adSearchFlag ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                paddingLeft: "0.8rem",
                margin: "auto",
                width: "100%",
                float: "right",
              }}
            >
              <FiltersPopover
                filterParams={adSearchData}
                handleClear={() => {
                  getSearchData("initial", "");
                  setAdSearchValue();
                }}
                updatedFilter={onUpdatedFilter}
                styles={{
                  left: "auto !important",
                  width: "29.7%",
                  right: "0px !important",
                }}
              />
            </div>
          ) : (
            <DisplaySearchBar
              testid={"context-globalSearch"}
              data={adSearchData || ""}
              onClick={getSearchValue}
              onClear={() => getSearchData("initial", "")}
              onChange={onChange}
              style={{ display: "flex", flex: 3 }}
            />
          )}
          {renderAdvanceSearch()}
        </div>
      </div>
    );
  };

  return (
    <div className={classes.header}>
      {renderHeader()}
      {renderSearchBar()}
    </div>
  );
};
