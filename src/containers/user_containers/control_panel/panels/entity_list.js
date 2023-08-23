import React, { useContext, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useHistory } from "react-router-dom";
//MaterialUi Component
import { Menu, MenuItem } from "@material-ui/core";
//Custom Hooks
import { ControlPaneContext } from "../index";
import { useStateValue } from "utils/store/contexts";
//Services
import {
  deleteEntity,
  entity,
  entityCount,
} from "utils/services/api_services/entity_service";
import { runTimeService } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { UserFactory } from "utils/services/factory_services";
//Inline Components
import { CardComponent } from "../components/card";
//Custom Components
import {
  ContentSkeleton,
  PaginationSkeleton,
} from "components/skeleton_components/control_panel/index";
import {
  DisplayButton,
  DisplayGrid,
  DisplayPagination,
  DisplaySnackbar,
} from "components/display_components";
import { BulkActions, Export_Csv } from "containers/feature_containers";
import { ErrorFallback } from "components/helper_components";
import { get } from "utils/services/helper_services/object_methods";

export const EntityList = (props) => {
  const {
    appname,
    filters,
    modulename,
    entityname,
    mode,
    page,
    globalsearch,
    setTemplate,
  } = props;
  //hooks
  const isBigScreen = useMediaQuery({ query: "(min-device-width: 1824px)" });
  //Custom Context
  const { onPageChange } = useContext(ControlPaneContext);
  const dispatch = useStateValue()[1];
  const history = useHistory();
  //User Service
  const { getDetails, getEntityFeatureAccess, checkGlobalFeatureAccess } =
    UserFactory();
  //Local State
  const [anchorEl, setAnchorEl] = useState(null);
  const [bulkModal, setBulkModal] = useState(false);
  const [buttonName, setButtonName] = useState([]);
  const [entityInfo, setEntityInfo] = useState();
  const [exportModal, setExportModal] = useState(false);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [newEntityTemplate, setNewEntityTemplate] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [userInfo, setUserInfo] = useState();

  //Constants
  const ITEMS_PER_PAGE = isBigScreen ? 40 : 30;

  //Filters
  let filterParams = {};
  if (globalsearch) filterParams.globalsearch = globalsearch;
  if (filters) filterParams = { ...filterParams, ...JSON.parse(filters) };

  //Custom Functions
  const init = async () => {
    setLoading(true);
    if (appname && modulename && entityname && !mode) {
      let metadata = await entityTemplate.get({
        appname,
        modulename,
        groupname: entityname,
      });
      const { app_cardContent } = metadata.sys_entityAttributes;
      const { projectFields } = app_cardContent ? app_cardContent : {};
      let entityParams = {
        appname,
        modulename,
        entityname,
        skip: page ? (page - 1) * ITEMS_PER_PAGE : 0,
        limit: ITEMS_PER_PAGE,
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

  const onDelete = async (data) => {
    setLoading(true);
    let res = await deleteEntity.remove({
      appname,
      modulename,
      entityname,
      id: data._id,
      templateName: entityInfo.metadata.sys_entityAttributes.sys_templateName,
    });
    init();
  };

  const handleExportModal = () => {
    setExportModal(true);
  };

  const handleExportClose = () => {
    setExportModal(false);
  };

  const handleBulkModal = () => {
    setBulkModal(false);
  };

  const handleClickMenu = (event) => {
    if (selectedItems.length) setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event, gridButton) => {
    if (gridButton.preRequestShowModal) {
      let buttonObject = { ...gridButton };
      let gridButtons = [buttonObject];
      let newEntity = JSON.parse(JSON.stringify(entityInfo.metadata));
      newEntity.sys_entityAttributes.sys_grid_buttons = [];
      gridButtons.map((fieldObject) => {
        try {
          let index = entityInfo.metadata.sys_entityAttributes.sys_grid_buttons
            .map((object) => {
              return object.name;
            })
            .indexOf(gridButton.name);
          newEntity.sys_entityAttributes.sys_grid_buttons.push(
            entityInfo.metadata.sys_entityAttributes.sys_grid_buttons[index]
          );
        } catch (e) {
          console.log(e);
        }
        setNewEntityTemplate(newEntity);
      });
      setBulkModal(true);
      setButtonName(gridButton);
      setAnchorEl(null);
    } else {
      setAnchorEl(null);
      let {
        targetChildEntity,
        targetChildCollection,
        notificationType,
        operationType,
        dynamicModuleFile,
        dynamicModuleFunction,
        dynamicModuleName,
        requestPattern,
      } = gridButton;
      let payload = {};
      //payload
      payload["target_entity"] = targetChildEntity;
      payload["target_collection"] = targetChildCollection;
      payload["notificationType"] = notificationType;
      payload["operationType"] = operationType;
      payload["agencyId"] = userInfo.sys_agencyId;
      payload["selectedIds"] = selectedItems.map((item) => item.sys_gUid); //sys_gUid

      runTimeService
        .create(
          {
            appname: appname,
            modulename: modulename,
            entityname: entityname,
          },
          {
            dynamicModuleName: dynamicModuleName,
            dynamicModuleFile: dynamicModuleFile,
            dynamicModuleFunction: dynamicModuleFunction,
            requestPattern: requestPattern,
            request: payload,
          }
        )
        .then((result) => {
          setMessage("Successful. Documents Deleted.");
          setTimeout(() => {
            setSelectedItems([]);
            init();
          }, 3000);
        })
        .catch((error) => {
          setMessage("Something Went Wrong.");
        });
    }
  };

  const clearMessage = () => setMessage(null);

  const onSelect = (data, checked) => {
    let items = [...selectedItems];
    if (checked) setSelectedItems([...items, data]);
    else setSelectedItems(items.filter((ei) => ei._id !== data._id));
  };

  //Effects
  useEffect(() => {
    init();
    setMounted(true);
    if (getDetails) {
      setUserInfo(getDetails);
    }
  }, []);

  useEffect(() => {
    mounted && init();
  }, [entityname, page, globalsearch, filters]);

  useEffect(() => {
    if (entityInfo && entityInfo.metadata) setTemplate(entityInfo.metadata);
  }, [entityInfo]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          contain: "strict",
          overflow: "hidden",
          overflowY: "auto",
          marginBottom: "20px",
        }}
        class="hide_scroll"
      >
        {loading || !entityInfo ? (
          <ContentSkeleton />
        ) : entityInfo.data.length > 0 ? (
          <DisplayGrid container spacing={3}>
            {entityInfo.data.map((ed, i) => (
              <DisplayGrid
                key={ed._id}
                item
                xs={12}
                sm={6}
                md={4}
                lg={4}
                xl={3}
                style={{ minHeight: "100px", display: "flex" }}
              >
                <CardComponent
                  data={ed}
                  template={entityInfo.metadata}
                  onDelete={onDelete}
                  onSelect={onSelect}
                  selectedItems={selectedItems}
                  {...{ appname, modulename, entityname }}
                />
              </DisplayGrid>
            ))}
          </DisplayGrid>
        ) : (
          <ErrorFallback slug="no_result" />
        )}
      </div>

      <div
        style={{
          flexShrink: 1,
        }}
      >
        {entityInfo ? (
          <DisplayGrid item container>
            <DisplayGrid item container xs={10} sm={6} md={4} lg={8} xl={2}>
              <DisplayPagination
                totalCount={entityInfo.totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onChange={onPageChange}
                currentPage={page ? Number(page) : 1}
              />
            </DisplayGrid>
            <DisplayGrid
              item
              xs={2}
              sm={6}
              md={4}
              lg={14}
              xl={10}
              container
              alignItems="center"
              justify="flex-end"
            >
              {selectedItems.length > 0 && (
                <>
                  <DisplayButton
                    onClick={() => {
                      setSelectedItems([]);
                    }}
                  >
                    Clear
                  </DisplayButton>
                  <DisplayButton
                    onClick={() => {
                      setSelectedItems([...entityInfo.data]);
                    }}
                  >
                    Select All
                  </DisplayButton>
                  &nbsp;&#124;&nbsp;
                  <DisplayButton onClick={handleClickMenu}>
                    {"BULK ACTIONS"}
                  </DisplayButton>
                  {
                    <div>
                      {entityInfo &&
                        entityInfo.metadata.sys_entityAttributes
                          .sys_grid_buttons &&
                        entityInfo.metadata.sys_entityAttributes
                          .sys_grid_buttons.length != 0 && (
                          <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                          >
                            {entityInfo.metadata.sys_entityAttributes.sys_grid_buttons.map(
                              (item, index) => {
                                return (
                                  <MenuItem
                                    key={index}
                                    onClick={(e) => handleMenuClick(e, item)}
                                  >
                                    {item.buttonName}
                                  </MenuItem>
                                );
                              }
                            )}
                          </Menu>
                        )}
                      {bulkModal && (
                        <BulkActions
                          gridButton={buttonName}
                          onClose={handleBulkModal}
                          open={bulkModal}
                          entityTemplate={newEntityTemplate}
                          selectedItems={selectedItems}
                          deSelect={setSelectedItems}
                          refresh={init}
                        />
                      )}
                    </div>
                  }
                </>
              )}
              {checkGlobalFeatureAccess("Imports") &&
                getEntityFeatureAccess(
                  appname,
                  modulename,
                  entityname,
                  "ImportCSV"
                ) && (
                  <DisplayButton
                    testid={"summary-import"}
                    disabled={
                      getEntityFeatureAccess(
                        appname,
                        modulename,
                        entityname,
                        "ImportCSV"
                      )
                        ? false
                        : true
                    }
                    onClick={() => {
                      history.push("/app/import?summary=true");
                      dispatch({
                        type: "SET_IMPORT_ENTITY",
                        payload: {
                          appName: appname,
                          moduleName: modulename,
                          entityName: entityname,
                          selectedEntityTemplate: get(
                            entityInfo.metadata,
                            "sys_entityAttributes.sys_templateName"
                          ),
                          unique_key: `${appname}-${modulename}-${entityname}`,
                          friendlyName:
                            entityInfo.metadata.sys_entityAttributes
                              .sys_friendlyName,
                        },
                      });
                    }}
                  >
                    Import
                  </DisplayButton>
                )}
              <DisplayButton
                onClick={handleExportModal}
                disabled={
                  getEntityFeatureAccess(
                    appname,
                    modulename,
                    entityname,
                    "ExportCSV"
                  )
                    ? false
                    : true
                }
              >
                {"EXPORT"}
              </DisplayButton>
              {exportModal && (
                <Export_Csv
                  entityTemplate={entityInfo.metadata}
                  open={exportModal}
                  onClose={handleExportClose}
                  filters={filterParams}
                  appObject={{ appname, modulename, entityname }}
                />
              )}
            </DisplayGrid>
          </DisplayGrid>
        ) : (
          <PaginationSkeleton />
        )}
      </div>
      <DisplaySnackbar
        open={!!message}
        message={message}
        onClose={clearMessage}
      />
    </div>
  );
};
