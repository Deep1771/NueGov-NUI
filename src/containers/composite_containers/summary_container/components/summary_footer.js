import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useParams } from "react-router";
//MaterialUi Components
import { makeStyles } from "@material-ui/core";
//Factory Services
import { useStateValue } from "utils/store/contexts";
import { runTimeService } from "utils/services/api_services/entity_service";
import { UserFactory } from "utils/services/factory_services";
//Custom Components
import { Export_Csv } from "containers/feature_containers";
import {
  DisplayButton,
  DisplayFab,
  DisplayPagination,
  DisplaySnackbar,
} from "components/display_components";
//Icons
import { SystemIcons } from "utils/icons";
import { get } from "utils/services/helper_services/object_methods";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  buttonContainer: {
    display: "flex",
    flex: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  bulkActions: {
    display: "flex",
    flex: 5,
    justifyContent: "center",
  },
  fabButton: {
    display: "flex",
    flex: 2,
    justifyContent: "center",
  },
  exportButton: {
    display: "flex",
    flex: 5,
    justifyContent: "center",
  },
  paginationContainer: {
    display: "flex",
    flex: 4,
    alignItems: "center",
    padding: "0 10px 0 20px",
  },
});
export const Footer = (props) => {
  const {
    entityTemplate,
    currentPage,
    handlePageChange,
    itemsPerPage,
    summaryMode,
    totalCount,
    bulkData,
    emptyBulkData,
    refresh,
    filters,
  } = props;
  const history = useHistory();
  //Factory Services
  const { appname, modulename, entityname } = useParams();
  const {
    checkWriteAccess,
    getDetails,
    getEntityFeatureAccess,
    checkGlobalFeatureAccess,
  } = UserFactory();
  const dispatch = useStateValue()[1];
  //UseStyles
  const classes = useStyles();
  //Icons
  const { Add } = SystemIcons;
  //Local State
  const [anchorEl, setAnchorEl] = useState(null);
  const [buttonName, setButtonName] = useState([]);
  const [bulkModal, setBulkModal] = useState(false);
  const [message, setMessage] = useState("");
  const [newEntityTemplate, setNewEntityTemplate] = useState();
  const [userInfo, setUserInfo] = useState();
  const [open, setOpen] = useState(false);

  const { sys_friendlyName } = entityTemplate.sys_entityAttributes;

  const appObject = { appname, modulename, entityname };

  //Custom Functions
  const clearMessage = () => setMessage(null);

  const handleClickMenu = (event) => {
    if (bulkData.length) setAnchorEl(event.currentTarget);
  };

  const handleBulkModal = () => {
    setBulkModal(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event, gridButton) => {
    if (gridButton.preRequestShowModal) {
      let buttonObject = { ...gridButton };
      let gridButtons = [buttonObject];
      let newEntity = JSON.parse(JSON.stringify(entityTemplate));
      newEntity.sys_entityAttributes.sys_grid_buttons = [];
      gridButtons.map((fieldObject) => {
        try {
          let index = entityTemplate.sys_entityAttributes.sys_grid_buttons
            .map((object) => {
              return object.name;
            })
            .indexOf(gridButton.name);
          newEntity.sys_entityAttributes.sys_grid_buttons.push(
            entityTemplate.sys_entityAttributes.sys_grid_buttons[index]
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
      payload["target_entity"] = targetChildEntity;
      payload["target_collection"] = targetChildCollection;
      payload["notificationType"] = notificationType;
      payload["operationType"] = operationType;
      payload["agencyId"] = userInfo.sys_agencyId;
      payload["selectedIds"] = bulkData.map((item) => item.sys_gUid); //sys_gUid
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
            emptyBulkData([]);
            refresh();
          }, 5000);
        })
        .catch((error) => {
          setMessage("Something Went Wrong.");
        });
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  //Effect
  useEffect(() => {
    if (getDetails) {
      setUserInfo(getDetails);
    }
  }, []);

  let renderFooter = () => {
    return (
      <div className={classes.buttonContainer}>
        <div className={classes.bulkActions}>
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
                        entityTemplate,
                        "sys_entityAttributes.sys_templateName"
                      ),
                      unique_key: `${appname}-${modulename}-${entityname}`,
                      friendlyName: sys_friendlyName,
                    },
                  });
                }}
              >
                Import
              </DisplayButton>
            )}
        </div>
        <Link
          to={`/app/summary/${appname}/${modulename}/${entityname}/new?drawer=true`}
          style={{ textDecoration: "none" }}
        >
          {checkWriteAccess(appObject) && (
            <div className={classes.fabButton}>
              <DisplayFab
                testid={"summary-new"}
                aria-label="add"
                style={{ opacity: 0.9 }}
              >
                <Add />
              </DisplayFab>
            </div>
          )}
        </Link>
        <div className={classes.exportButton}>
          <DisplayButton
            testid={"summary-export"}
            onClick={handleClickOpen}
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
            EXPORT
          </DisplayButton>
          <div>
            {open && (
              <Export_Csv
                entityTemplate={entityTemplate}
                open={open}
                onClose={handleClose}
                totalCount={totalCount}
                appObject={appObject}
                filters={filters}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={classes.container}>
      {summaryMode === "summary" && renderFooter()}
      <div className={classes.paginationContainer}>
        <DisplayPagination
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
          onChange={handlePageChange}
          currentPage={currentPage}
          boundaryCount={0}
        />
      </div>
      <DisplaySnackbar
        open={!!message}
        message={message}
        onClose={clearMessage}
      />
    </div>
  );
};
