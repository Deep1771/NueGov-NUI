import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Popover from "@material-ui/core/Popover";
import { UserFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import {
  DisplayBadge,
  DisplayButton,
  DisplayChips,
  DisplayIconButton,
  DisplayText,
  DisplaySearchBar,
} from "components/display_components/";
import { AdvanceSearch, FiltersPopover } from "components/helper_components";
import { SystemIcons } from "utils/icons";

export const RelationHeader = (props) => {
  const {
    childApp,
    childModule,
    childEntity,
    entityTemplate,
    getSearchData,
    handleAssign,
    handleMenuClose,
    handleNew,
    handleSearch,
    isWrite,
    parentTemplate,
    searchData,
    sortFields,
    toggleSearch,
    parentEntity,
  } = props;
  const { app_cardContent, sys_topLevel } = get(
    entityTemplate,
    "sys_entityAttributes"
  );
  const { Tune } = SystemIcons;
  const { getEntityFriendlyName } = UserFactory();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [advSearchVisible, setAdvSearchVisibility] = useState(false);
  let open = Boolean(anchorEl);
  let id = open ? "simple-popover" : undefined;
  const { mode } = useParams();

  if (app_cardContent && Object.keys(app_cardContent).length) {
    if (app_cardContent.descriptionField.length > 4)
      app_cardContent.descriptionField.splice(
        4,
        app_cardContent.descriptionField.length - 1
      );
  }
  //Declarative method to determine field is array or not
  const detectArray = (field) => {
    if (field && Array.isArray(field)) return true;
    else return false;
  };

  const getSearchValue = (type) => getSearchData("search", searchValue);

  const getTitle = (value) => {
    if (value.type === "REFERENCE")
      return value.name.friendlyName ? value.name.friendlyName : "";
    else {
      let definition =
        sys_topLevel && sys_topLevel.find((e) => e.name === value.item.name);
      return definition ? definition.title : "";
    }
  };

  const checkAssign = () => {
    if (parentTemplate.sys_entityAttributes) {
      if (
        detectArray(parentTemplate.sys_entityAttributes.sys_entityRelationships)
      ) {
        let entity_def =
          parentTemplate.sys_entityAttributes.sys_entityRelationships.find(
            (e) => e.entityName === childEntity
          );
        if (entity_def) {
          let { relationButtons } = entity_def;
          if (detectArray(relationButtons)) {
            let assign = relationButtons.find((e) => e.buttonType === "Assign");
            if (assign) return true;
            else return false;
          }
        }
      }
    }
  };

  const constructSortField = (item) => {
    let referenceField,
      sortObj = {
        asc: false,
        dsc: false,
      };
    let sortby, order;
    /* Check for the reference field*/
    // if(item.displayField)

    if (sortFields.length) {
      sortby = sortFields[0].name;
      order = sortFields[0].order;
    }
    if (item.display) {
      referenceField =
        item.display.name.split(".")[item.display.name.split(".").length - 1];
      if (
        `${item.name}.${referenceField}` === sortby &&
        parseInt(order) === 1
      ) {
        sortObj["asc"] = true;
      }

      if (`${item.name}.${referenceField}` === sortby && parseInt(order) === -1)
        sortObj["dsc"] = true;
    } else {
      if (item.name === sortby && parseInt(order) === 1) sortObj["asc"] = true;
      if (item.name === sortby && parseInt(order) === -1) sortObj["dsc"] = true;
    }

    return sortObj;
  };

  const handleArrowClick = (definition, order, type) => {
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

  const handleClose = () => setAnchorEl(null);
  const handleEnter = (e) => {
    if (e.key === "Enter" && searchValue) getSearchData("search", searchValue);
  };
  const handleSort = (event) => setAnchorEl(event.currentTarget);

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
    }
  };

  const onUpdatedFilter = (filters) => {
    let params = {
      ...filters,
    };
    if (Object.keys(params).length > 0) {
      getSearchData("search", params, true);
      setSearchValue(params);
    } else {
      getSearchData("initial", "");
      setSearchValue(params);
    }
  };

  let onChange = (value) => {
    setSearchValue(value);
    if (value) handleSearch(true);
    else {
      handleSearch(false);
      getSearchData("initial", "");
    }
  };

  useEffect(() => {
    setSearchValue(searchData);
  }, [searchData]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        margin: "1% 0",
        alignItems: "center",
      }}
    >
      <DisplaySearchBar
        testid={`${parentEntity}-${childEntity}-relation-globalSearch`}
        data={typeof searchData !== "object" ? searchData : ""}
        onClick={getSearchValue}
        onClear={() => getSearchData("initial", "")}
        onChange={onChange}
        debounce={1000}
      />

      <DisplayIconButton
        testid={`${parentEntity}-${childEntity}-relation-asf`}
        style={{ margin: "0 1.5%" }}
        size={"small"}
        disabled={!entityTemplate}
        onClick={() => setAdvSearchVisibility(true)}
        systemVariant="primary"
      >
        <DisplayBadge
          variant="dot"
          invisible={!(typeof searchData === "object")}
        >
          <Tune />
        </DisplayBadge>
      </DisplayIconButton>

      {advSearchVisible && (
        <AdvanceSearch
          template={entityTemplate}
          closeRenderAdvanceSearch={() => setAdvSearchVisibility(false)}
          onAdSearchOpen={onAdvanceSearch}
          propdata={typeof searchValue === "object" ? searchValue : {}}
          activeFilter={{}}
          resetActiveFilter={{}}
          showModal={advSearchVisible}
          hideSaveFeature={true}
          entityName={childEntity}
        />
      )}

      {typeof searchData === "object" && (
        <FiltersPopover
          filterParams={typeof searchValue == "object" ? searchValue : " "}
          handleClear={() => getSearchData("initial", "")}
          updatedFilter={onUpdatedFilter}
          styles={{ width: "22.5rem" }}
        />
      )}

      <DisplayButton
        testid={`${parentEntity}-${childEntity}-relation-sort`}
        color="primary"
        size="small"
        onClick={handleSort}
      >
        SORT BY
      </DisplayButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        style={{
          width: "500px",
          height: "500px",
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
                        <div style={{ display: "flex", padding: "5px" }}>
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
                              //paddingLeft: '8px',
                              backgroundColor: setOrder.asc ? "#3f51b5" : "",
                            }}
                            // icon={<ArrowDownward style={{ color: setOrder.asc ? '#FFFFFF' : '', 'cursor': 'pointer' }}
                            // onClick={(e) => handleArrowClick({ name: item.name, display: e1 }, 1, 'REF')}
                            // />}
                            label="A - Z"
                            onClick={(e) =>
                              handleArrowClick(
                                { name: item.name, display: e1 },
                                1,
                                "REF"
                              )
                            }
                            size="small"
                          />
                          <DisplayChips
                            style={{
                              height: "20px",
                              //paddingLeft: '8px',
                              marginLeft: "10px",
                              backgroundColor: setOrder.dsc ? "#3f51b5" : "",
                            }}
                            // icon={<ArrowUpward style={{ color: setOrder.dsc ? '#FFFFFF' : '', 'cursor': 'pointer' }}
                            // onClick={(e) => handleArrowClick({ name: item.name, display: e1 }, -1, 'REF')} />}
                            label="Z - A"
                            onClick={(e) =>
                              handleArrowClick(
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
                    <div style={{ display: "flex", padding: "5px" }}>
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
                          //paddingLeft: '8px',

                          backgroundColor: setOrder.asc ? "#3f51b5" : "",
                        }}
                        // icon={<ArrowDownward style={{ color: setOrder.asc ? '#FFFFFF' : '', 'cursor': 'pointer' }} onClick={(e) => handleArrowClick({ name: item.name }, 1)}
                        // />}
                        onClick={(e) =>
                          handleArrowClick({ name: item.name }, 1)
                        }
                        label="A - Z"
                        size="small"
                      />
                      <DisplayChips
                        style={{
                          height: "20px",
                          //paddingLeft: '8px',
                          marginLeft: "10px",
                          backgroundColor: setOrder.dsc ? "#3f51b5" : "",
                        }}
                        //icon={<ArrowUpward style={{ color: setOrder.dsc ? '#FFFFFF' : '', 'cursor': 'pointer' }} onClick={(e) => handleArrowClick({ name: item.name }, -1)} />} size="small"
                        label="Z - A"
                        onClick={(e) =>
                          handleArrowClick({ name: item.name }, -1)
                        }
                      />
                    </div>
                  );
                }
              }
            })}
        </div>
      </Popover>
      {mode === "edit" && isWrite && (
        <>
          {checkAssign() && (
            <DisplayButton
              testid={`${parentEntity}-${childEntity}-relation-assign`}
              color="primary"
              size="small"
              onClick={handleAssign}
            >
              ASSIGN
            </DisplayButton>
          )}
          <DisplayButton
            testid={`${parentEntity}-${childEntity}-relation-new`}
            color="primary"
            onClick={handleNew}
            size="small"
          >{`New ${getEntityFriendlyName({
            appname: childApp,
            modulename: childModule,
            entityname: childEntity,
          })}`}</DisplayButton>
        </>
      )}
    </div>
  );
};
