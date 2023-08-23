import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import queryString from "query-string";
import { useStateValue } from "utils/store/contexts";
import {
  GlobalFactory,
  UserFactory,
  ThemeFactory,
} from "utils/services/factory_services";

import { get } from "utils/services/helper_services/object_methods";
import {
  DisplayBadge,
  DisplayChips,
  DisplayDialog,
  DisplaySearchBar,
  DisplayText,
  DisplayIconButton,
  DisplayModal,
} from "components/display_components";
import { DetailModal, FiltersPopover } from "components/helper_components";
import { SystemIcons } from "utils/icons/";
import { ScannerModal } from "components/extension_components";
import { entity } from "utils/services/api_services/entity_service";

const useStyles = makeStyles({
  header: ({ colors }) => ({
    backgroundColor: colors.dark.bgColor,
    color: colors.dark.text,
    flex: 1,
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
    margin: "-4px 0 0 9px",
  },
  labelDiv: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    marginRight: "8px",
  },
  text: ({ colors }) => ({
    color: colors.dark.bgColor,
  }),
  entityList: ({ colors }) => ({
    backgroundColor: colors.dark.bgColor,
    color: colors.dark.text,
  }),
});

export const Header = (props) => {
  const {
    expandAll,
    handleExpandAll,
    handleMenuClose,
    callbackSearch,
    sortFields,
    template,
    toggleDrawer,
    toggleSearch,
    summaryMode,
    systemVariant,
    onAdvanceSearch,
    searchValue,
    filterApplied,
    onEntitySelect,
    filterParams,
    onEditSearch,
    params,
    mode,
  } = props;
  const {
    app_cardContent,
    sys_topLevel,
    sys_summaryOptions,
    sys_entityProperties,
  } = get(template, "sys_entityAttributes");
  const { descriptionField = [], titleField = [] } = app_cardContent
    ? app_cardContent
    : {};
  const description =
    app_cardContent && Object.keys(app_cardContent).length
      ? [...titleField, ...descriptionField]
      : [];
  const history = useHistory();
  const [{ presetState }] = useStateValue();
  const { closeBackDrop, setBackDrop } = GlobalFactory();
  const { getVariantForComponent } = ThemeFactory();
  const { checkReadAccess, getEntityFriendlyName, getRefObj, getAgencyRef } =
    UserFactory();
  const { MoreVertical, ExpandMore, Reorder, Tune } = SystemIcons;
  const isCodeGenerator = sys_entityProperties?.includes("CodeGenerator");
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialog, setDialog] = useState({ dialog: false });
  const [e_anchorEl, sete_AnchorEl] = useState(null);
  const [addClicked, setAddClicked] = useState(null);
  const [autoPopulate, setAutoPopulate] = useState({});
  const [moreMenu, setMoreMenu] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [scanner, setScanner] = useState(false);

  const e_open = Boolean(e_anchorEl);
  const e_id = e_open ? "simple-popover" : undefined;
  const queryParams = queryString.parse(history.location.search);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useStyles(
    getVariantForComponent("SUMMARY_HEADER", defaultVariant)
  );

  const presetName = get(
    presetState,
    "activePreset.sys_entityAttributes.presetName",
    ""
  );
  const showSummaryOptions =
    !!sys_summaryOptions &&
    sys_summaryOptions.some((op) =>
      checkReadAccess({
        appname: op.appName,
        modulename: op.moduleName,
        entityname: op.entityName,
      })
    );

  const queryToUrl = (params) =>
    Object.keys(params || {})
      .map((key) => key + "=" + params[key])
      .join("&");

  //getters
  const getPresetValues = () => {
    if (presetState) {
      let { selectedEntities } = presetState.activePreset.sys_entityAttributes;
      if (selectedEntities.length) {
        return selectedEntities.map(({ groupName, moduleName, appName }) => {
          return {
            groupName,
            moduleName,
            appName,
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

  const handleSearch = (value) => value && callbackSearch(value);

  const handleClear = () => callbackSearch("");

  const handleAddClick = (event, obj) => {
    setAddClicked(obj);
    let autoData = {
      agency: getAgencyRef(),
      userInfo: getRefObj(),
      entityTemplate: {
        sys_templateName: template?.sys_entityAttributes?.sys_templateName,
        sys_groupName:
          template?.sys_entityAttributes?.sys_templateGroupName?.sys_groupName,
        id: template._id,
        sys_gUid: template.sys_gUid,
      },
    };
    setAutoPopulate({ sys_entityAttributes: autoData });
  };

  const handleClose = () => {
    setAddClicked(null);
  };

  const renderEntityList = () => {
    return (
      <div>
        <Popover
          // id={e_id}`
          open={e_open}
          anchorEl={e_anchorEl}
          onClose={() => sete_AnchorEl(null)}
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
            {getPresetValues().map(({ appName, moduleName, groupName }, i) => {
              return (
                <span
                  testid={`entity-select-${groupName}`}
                  id={`entity-select-${groupName}`}
                  className="summary-list-item"
                  key={i}
                  style={{ padding: "5px", cursor: "pointer" }}
                  onClick={() => {
                    sete_AnchorEl(null);
                    onEntitySelect(groupName);
                  }}
                >
                  <DisplayText variant="subtitle1">
                    {getEntityFriendlyName({
                      appname: appName,
                      modulename: moduleName,
                      entityname: groupName,
                    })}
                  </DisplayText>
                </span>
              );
            })}
          </div>
        </Popover>
      </div>
    );
  };

  const onRedirect = (res) => {
    setDialog({ dialog: false });
    setBackDrop("Redirecting");
    history.push(
      `/app/summary/${params.appname}/${params.modulename}/${
        params.entityname
      }/${mode ? mode : "read"}/${res[0]._id}?${queryToUrl(queryParams)}`
    );
    closeBackDrop();
  };

  const onScannedData = async (scannedData) => {
    try {
      if (scannedData) {
        let { format, text } = scannedData;
        let formatType = format === 11 ? "QR_CODE" : "BAR_CODE";
        let res = await entity.get({
          ...params,
          [formatType]: text,
          limit: 1,
          skip: 0,
        });
        if (res.length > 0) {
          let redirectModal = {
            dialog: true,
            title: `Scanned ${params.entityname} successfully`,
            msg: "Do you want to Redirect?",
            confirmLabel: "Redirect",
            onConfirm: () => {
              onRedirect(res);
            },
          };
          setDialog(redirectModal);
        } else {
          let failModal = {
            dialog: true,
            title: `Could not find any ${params.entityname}, please try again. `,
            confirmLabel: "Scan again",
            onConfirm: () => {
              setScanner(true);
              setDialog({ dialog: false });
            },
          };
          setDialog(failModal);
        }
      }
    } catch (e) {
      let failModal = {
        dialog: true,
        title: `Could not find any ${params.entityname}, please try again`,
      };
      setDialog(failModal);
    }
  };

  const renderHeader = () => {
    return (
      <div className={classes.container}>
        <div className={classes.textContainer}>
          <div style={{ display: "flex", flex: 11.5 }}>
            <div
              style={{
                display: "flex",
                flexGrow: 1,
                flexDirection: "column-reverse",
              }}
            >
              <div style={{ display: "flex", flexGrow: 1 }}>
                <IconButton
                  testid={"summary-drawer"}
                  size="small"
                  style={{ color: "#FFFFFF", marginRight: "10px" }}
                  onClick={toggleDrawer}
                >
                  <Reorder />
                </IconButton>

                <span
                  testid="entity-select-menu"
                  id="entity-select-menu"
                  style={{
                    padding: "2px 0 0 5px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={(e) => sete_AnchorEl(e.currentTarget)}
                >
                  <DisplayText
                    variant="h6"
                    style={{
                      color: "#FFFFFF",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {getEntityFriendlyName(params)}
                  </DisplayText>{" "}
                  &nbsp;
                  <ExpandMore />
                </span>

                <div
                  style={{
                    display: "flex",
                    flex: toggleSearch ? 3 : 4,
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    position: "relative",
                  }}
                >
                  {isCodeGenerator && (
                    <DisplayIconButton
                      testid="scanner"
                      size="small"
                      style={{ color: "#FFFFFF", marginRight: "10px" }}
                      onClick={() => setScanner(true)}
                    >
                      <span class="material-icons">qr_code_scanner</span>
                    </DisplayIconButton>
                  )}
                  {scanner && (
                    <ScannerModal
                      onSuccessCallback={onScannedData}
                      onClose={setScanner}
                      scannerTimeout={30000}
                    />
                  )}
                  {(showSummaryOptions || description?.length > 3) && (
                    <DisplayIconButton
                      testid="summary-options"
                      size="small"
                      style={{ color: "#FFFFFF", marginRight: "10px" }}
                      onClick={(e) => setMoreMenu(e.currentTarget)}
                    >
                      <MoreVertical />
                    </DisplayIconButton>
                  )}
                  {moreMenu && (
                    <Menu
                      testid={"summary-list"}
                      anchorEl={moreMenu}
                      keepMounted
                      open={Boolean(moreMenu)}
                      onClose={(e) => {
                        setMoreMenu(false);
                      }}
                    >
                      {sys_summaryOptions?.map((op) => (
                        <MenuItem
                          testid={op.title}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddClick(e, op);
                          }}
                        >
                          {op.title}
                        </MenuItem>
                      ))}
                      {description?.length > 3 && (
                        <MenuItem
                          testid={expandAll ? "Show Less" : "Expand All"}
                          onClick={(event) => handleExpandAll(event)}
                        >
                          {expandAll ? "Show Less" : "Expand All"}{" "}
                        </MenuItem>
                      )}
                    </Menu>
                  )}
                  {renderMenu()}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexShrink: 1,
                  marginLeft: "5px",
                  cursor: "default",
                }}
              >
                <DisplayText
                  testid={"summary-" + presetName}
                  noWrap={true}
                  title={presetName}
                  variant="caption"
                >
                  {presetName}
                </DisplayText>
              </div>
            </div>

            {renderEntityList()}
            {addClicked && (
              <DisplayModal open={addClicked} maxWidth={"lg"} fullWidth={true}>
                <DetailModal
                  onClose={handleClose}
                  queryParams={{
                    appname: addClicked.appName,
                    modulename: addClicked.moduleName,
                    entityname: addClicked.entityName,
                  }}
                  filterParams={
                    addClicked.filterByTemplate !== false
                      ? {
                          entityTemplate: {
                            sys_templateName:
                              template?.sys_entityAttributes
                                ?.sys_templateName || "",
                          },
                        }
                      : {}
                  }
                  formdata={autoPopulate}
                />
              </DisplayModal>
            )}
          </div>
        </div>
        {
          <DisplayDialog
            testid={"detail"}
            open={dialog.dialog}
            title={dialog.title}
            message={dialog.msg}
            confirmLabel={dialog.confirmLabel}
            onConfirm={dialog.onConfirm}
            onCancel={() => {
              setDialog({ dialog: false });
            }}
          />
        }
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
            app_cardContent?.descriptionField?.map((item, idx) => {
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

  const onUpdatedFilter = (filters) => {
    mounted && onEditSearch(filters);
  };

  const renderSearchBar = () => {
    return (
      <div className={classes.container}>
        <div style={{ display: "flex", backgroundColor: "#FFFFFF", flex: 1 }}>
          <DisplayIconButton testid="summary-asf" onClick={onAdvanceSearch}>
            <DisplayBadge variant="dot" invisible={!filterApplied}>
              <Tune className={classes.text} />
            </DisplayBadge>
          </DisplayIconButton>
          {filterApplied ? (
            <div className={classes.labelDiv}>
              <FiltersPopover
                testid={"advSearch-filters"}
                filterParams={filterParams}
                handleClear={handleClear}
                updatedFilter={onUpdatedFilter}
                styles={{ left: "0 !important", width: "25% !important" }}
              />
            </div>
          ) : (
            <DisplaySearchBar
              testid={"summary-globalSearch"}
              data={searchValue || ""}
              onClick={handleSearch}
              onClear={handleClear}
            />
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={classes.header}>
      {renderHeader()}
      {renderSearchBar()}
    </div>
  );
};
