import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Collapse } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { UserFactory } from "utils/services/factory_services";
import { useStateValue } from "utils/store/contexts";
import { get, isDefined } from "utils/services/helper_services/object_methods";
import {
  textExtractor,
  mergeApprovalSection,
} from "utils/services/helper_services/system_methods";
import {
  DisplayAvatar,
  DisplayCard,
  DisplayCheckbox,
  DisplayDialog,
  DisplayIconButton,
  DisplaySnackbar,
  DisplayText,
} from "components/display_components/";
import { switchUser } from "containers/user_containers/profile_page/loginas/switchUser";
import { SystemIcons } from "utils/icons";
import { GlobalFactory } from "utils/services/factory_services";

const useStyles = makeStyles({
  root: {
    flexDirection: "column",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    borderRadius: "0px",
    opacity: 0.9,
  },
  card_container: {
    display: "flex",
    flex: 8,
    flexDirection: "column",
    cursor: "pointer",
  },
  card_title: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  delete: {
    flex: 1,
  },
  doc_cam: {
    display: "flex",
    marginLeft: "15px",
  },
  multiRefContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    margin: "5px",
    border: "1px solid #F0F0F0",
  },
  multiRefHeader: {
    display: "flex",
    flex: 1,
    margin: "0px 0px 5px 0px",
    padding: "5px",
  },
  multiRefValues: {
    display: "flex",
    flex: 1,
    padding: "0px 5px 5px 5px",
  },
  value_container: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    flex: 11,
  },
  footer: {
    display: "flex",
    flex: 1,
  },
});

export const CardContainer = (props) => {
  let {
    bulkData,
    cardClick,
    entityDoc,
    entityTemplate,
    expandAll,
    handleCheckBox,
    onDelete,
    options,
    selectedData,
    summaryMode,
    handleExpandCard,
  } = props;
  entityTemplate = mergeApprovalSection(entityTemplate, entityTemplate);
  const { app_cardContent, sys_topLevel } = get(
    entityTemplate,
    "sys_entityAttributes"
  );
  const { descriptionField = [], titleField = [] } = app_cardContent
    ? app_cardContent
    : {};
  const description =
    app_cardContent && Object.keys(app_cardContent).length
      ? [...titleField, ...descriptionField]
      : [];
  const selectMode = get(options, "select");
  const { setSnackBar } = GlobalFactory();

  const { appname, modulename, entityname, id } = useParams();
  const history = useHistory();
  const classes = useStyles(props);
  const {
    checkDataAccess,
    getAgencyId,
    getAgencyLogo,
    getAgencyName,
    isNJAdmin,
    getEntityFeatureAccess,
  } = UserFactory();

  const [{ userState, configState }] = useStateValue();
  const { userData } = userState;

  const { Delete, ExpandLess, ExpandMore, LocationOn } = SystemIcons;
  const [deleteData, setData] = useState();
  const [expand, setExpand] = useState(expandAll.includes(entityDoc._id));
  const [message, setMessage] = useState();
  const [hoverDelete, setHoverDelete] = useState(false);
  const [showConfirm, setConfirm] = useState(false);
  const [showLoginAs, setShowLoginAs] = useState(false);

  const agencyLogo = getAgencyLogo(entityDoc?.sys_agencyId);
  const agencyName = getAgencyName(entityDoc?.sys_agencyId);

  const bulkPermission = getEntityFeatureAccess(
    appname,
    modulename,
    entityname,
    "BulkOperations"
  );
  const checkData = summaryMode !== "context_summary" ? bulkData : selectedData;
  const cardColor =
    (bulkData && bulkData.some((e) => e._id === entityDoc._id)) ||
    selectedData.some((e) => e._id === entityDoc._id);
  const expandData = description.length > 3 ? description.slice(3) : [];
  const showCheckbox =
    (summaryMode !== "context_summary" && hoverDelete && bulkPermission) ||
    checkData.length > 0
      ? true
      : false;
  const showDelete =
    summaryMode !== "context_summary" &&
    (isNJAdmin() ||
      checkDataAccess({
        appname,
        modulename,
        entityname,
        permissionType: "delete",
        data: entityDoc,
        metadata: entityTemplate,
      })) &&
    !(
      getAgencyId == entityDoc.sys_agencyId &&
      entityname == "Agency" &&
      !isNJAdmin()
    );
  const showZoomToAsset =
    entityTemplate.sys_entityAttributes.sys_topLevel.findIndex((field) =>
      ["DESIGNER", "LATLONG"].includes(field.type)
    ) > -1;

  if (description.length > 3) {
    description.splice(3);
  }

  const getLabelValue = (item) => {
    if (!item.path) {
      let toplevelFieldsMeta = JSON.parse(JSON.stringify(sys_topLevel));
      toplevelFieldsMeta = toplevelFieldsMeta?.reduce((acc, curr) => {
        if (!acc.length) acc.push(curr);
        else {
          if (curr.type === "LIST") {
            let checkForDuplicate = acc.findIndex((e) => e.name === curr.name);
            if (checkForDuplicate != -1)
              acc[checkForDuplicate] = {
                ...acc[checkForDuplicate],
                values: [...acc[checkForDuplicate].values, ...curr.values],
              };
          }
          let checkForDuplicate = acc.find((e) => e.name === curr.name);
          if (!checkForDuplicate) acc.push(curr);
        }
        return acc;
      }, []);
      let definition = toplevelFieldsMeta.find((e) => e.name === item.name);
      let isMultiReference = item.type === "REFERENCE" && item.multiSelect;
      let isDataExist = get(entityDoc, `sys_entityAttributes.${item.name}`);
      let data = isDataExist ? isDataExist : "";
      let txt = isMultiReference
        ? referenceExtractor(data, item)
        : textExtractor(data, { ...definition, ...item });
      if (isDataExist && isDefined(txt)) {
        return isMultiReference ? txt : txt.toString();
      } else return "";
    } else if (item.path) {
      return get(entityDoc, `sys_entityAttributes.${item.path}`, "").toString();
    }
  };

  const getLabel = (item) => {
    let definition = sys_topLevel
      ? sys_topLevel.find((e) => e.name === item.name)
      : "";
    let appTitle = get(item, "title");
    let metadataTitle = get(definition, "title");
    return appTitle ? appTitle : metadataTitle;
  };

  const referenceExtractor = (data, fieldmeta = {}) => {
    const empty = "";
    if (
      data &&
      Object.keys(data).length &&
      Array.isArray(fieldmeta.displayFields)
    ) {
      let keys = fieldmeta.displayFields.map((e) => {
        if (e.name.split(".").length > 1) {
          if (fieldmeta.multiSelect)
            return {
              name: e.name.split(".")[e.name.split(".").length - 1],
              friendlyName: e.friendlyName,
            };
          else return e.name.split(".")[e.name.split(".").length - 1];
        } else {
          if (fieldmeta.multiSelect)
            return {
              name: e.name,
              friendlyName: e.friendlyName,
            };
          else return e.name;
        }
      });

      let values = Object.values(data).filter(Boolean);
      let refValues = keys.map((e) => data[e]).filter(Boolean);
      let multiValue = { keys, data };
      if (fieldmeta.multiSelect) return multiValue;
      else if (values.length && refValues.length)
        return keys.map((e) => data[e]).join(" | ");
      else return empty;
    } else return empty;
  };

  const confirmDelete = () => (
    <DisplayDialog
      testid={"delete"}
      open={showConfirm}
      title={showLoginAs ? "Sure to switch another user ?" : "Sure to delete ?"}
      message={showLoginAs ? "" : "This action cannot be undone"}
      onCancel={(e) => {
        e.stopPropagation();
        setConfirm(false);
      }}
      onConfirm={(e) => {
        e.stopPropagation();
        if (showLoginAs) {
          switchUser(history, props.entityDoc, userData);
        } else {
          setConfirm(false);
          deleteData && onDelete(deleteData);
        }
      }}
    />
  );

  const handleDelete = (e, data) => {
    e.stopPropagation();
    setShowLoginAs(false);
    setData(data);
    setConfirm(true);
  };

  const handleZoomToAsset = (e, data) => {
    e.stopPropagation();
    let mapControl = configState.map;
    if (mapControl !== null) {
      let geoField = entityTemplate.sys_entityAttributes.sys_topLevel.find(
        (field) => ["DESIGNER", "LATLONG"].includes(field.type)
      );
      let bounds = new window.google.maps.LatLngBounds();
      switch (geoField.type) {
        case "LATLONG":
          try {
            let location = data.sys_entityAttributes[geoField.name];
            bounds.extend(
              new window.google.maps.LatLng({
                lat: location.coordinates[1],
                lng: location.coordinates[0],
              })
            );
            mapControl.fitBounds(bounds);
            break;
          } catch (e) {
            //ignore if no data point
            setSnackBar({
              message: `No Location data Present in selected asset.`,
            });
          }
          break;
        case "DESIGNER":
          try {
            if (data.sys_entityAttributes[geoField.name].length === 0)
              throw { error: "no data" };
            data.sys_entityAttributes[geoField.name].map((shape) => {
              switch (shape.type) {
                case "Polygon":
                  shape.coordinates[0].map((point) => {
                    let p = new window.google.maps.LatLng(point[1], point[0]);
                    bounds.extend(p);
                  });
                  break;
                case "LineString":
                  shape.coordinates.map((point) => {
                    let p = new window.google.maps.LatLng(point[1], point[0]);
                    bounds.extend(p);
                  });
                  break;
                case "Point":
                  let p = new window.google.maps.LatLng(
                    shape.coordinates[1],
                    shape.coordinates[0]
                  );
                  bounds.extend(p);
              }
            });
            mapControl.fitBounds(bounds);
          } catch (e) {
            //ignore if no data
            setSnackBar({
              message: `No Location data Present in selected asset.`,
            });
          }
          break;
      }
    }
  };

  const renderCardBody = () => {
    return (
      <div className={classes.card_container}>
        <div className={classes.value_container}>
          {description &&
            description.length > 0 &&
            description.map((item) => {
              return renderSection(item);
            })}
          <Collapse in={expand} timeout="auto" unmountOnExit>
            {expandData &&
              expandData.length > 0 &&
              expandData.map((item) => {
                return renderSection(item);
              })}
          </Collapse>
        </div>
        <div className={classes.footer}>
          <br />
        </div>
      </div>
    );
  };

  const renderCardDelete = () => {
    return (
      <DisplayIconButton
        testid={"delete"}
        style={{ color: cardColor ? "#FFFFFF" : "#000000" }}
        size="small"
        onClick={(e) => handleDelete(e, entityDoc)}
      >
        <Delete />
      </DisplayIconButton>
    );
  };

  // const renderCheckBox = () => {
  //   return (
  //     <div>
  //       <DisplayCheckbox
  //         checked={
  //           checkData.some((e) => e._id === entityDoc._id) ? true : false
  //         }
  //         onChange={(e) => handleCheckBox(entityDoc)}
  //         testid={`summary-card-${entityDoc.sys_groupName}-${entityDoc._id
  //           }-${"checkbox"}`}
  //         onClick={(e) => e.stopPropagation()}
  //         size="small"
  //         style={{
  //           display: "flex",
  //           marginLeft: 0,
  //           marginRight: 0,
  //           color: cardColor ? "#FFFFFF" : "#000000",
  //         }}
  //         systemVariant={
  //           !checkData.some((e) => e._id === entityDoc._id)
  //             ? "primary"
  //             : "default"
  //         }
  //       />
  //     </div>
  //   );
  // };

  const renderExpand = () => {
    return (
      <DisplayIconButton
        testid={"expand"}
        style={{ color: cardColor ? "#FFFFFF" : "#000000" }}
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleExpandCard(entityDoc._id);
        }}
      >
        {expand ? <ExpandLess /> : <ExpandMore />}
      </DisplayIconButton>
    );
  };

  const renderSection = (item) => {
    let label = getLabel(item),
      labelValue = getLabelValue(item);
    let keys,
      multiValues,
      multiReference = item.type === "REFERENCE" && item.multiSelect;
    if (multiReference) {
      keys = labelValue.keys;
      multiValues = labelValue.data;
    }
    return (
      <div
        key={"card-title-" + entityDoc._id + "-" + item.name}
        style={{ marginBottom: "8px" }}
      >
        <DisplayText variant="subtitle2">{label}</DisplayText>
        {multiReference &&
          multiValues &&
          Object.keys(multiValues[0]).length > 0 &&
          label && (
            <div className={classes.multiRefContainer}>
              <div className={classes.multiRefHeader}>
                {keys.map((eachKey) => {
                  return (
                    <div
                      key={
                        "card-mv-label-" +
                        entityDoc._id +
                        "-" +
                        eachKey.friendlyName
                      }
                      style={{ display: "flex", flex: 1 }}
                    >
                      <DisplayText variant="subtitle2">
                        {eachKey.friendlyName}
                      </DisplayText>
                    </div>
                  );
                })}
              </div>
              {multiValues.map((eachValue, i) => {
                return (
                  <div
                    key1={"card-mv-row-" + i + "-" + entityDoc._id}
                    className={classes.multiRefValues}
                  >
                    {keys.map((eachKey) => {
                      return (
                        <div
                          key1={
                            "card-mv-row-" +
                            i +
                            "-" +
                            entityDoc._id +
                            "-" +
                            eachKey.name
                          }
                          style={{ display: "flex", flex: 1 }}
                        >
                          <DisplayText variant="h1">
                            {eachValue[eachKey.name]}
                          </DisplayText>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        {label && !multiReference && (
          <div>
            <DisplayText variant="h1">
              {labelValue ? labelValue : "-"}
            </DisplayText>
          </div>
        )}
      </div>
    );
    // refactor
  };

  const renderZoomToAsset = () => {
    return (
      <DisplayIconButton
        testid={"location"}
        style={{ color: cardColor ? "#FFFFFF" : "#000000" }}
        size="small"
        onClick={(event) => {
          handleZoomToAsset(event, entityDoc);
        }}
      >
        <LocationOn />
      </DisplayIconButton>
    );
  };

  return (
    <DisplayCard
      className={classes.card}
      raised={selectedData.some((e) => e._id === entityDoc._id)}
      systemVariant={cardColor ? "primary" : "default"}
      style={{
        margin: "0px 5px 10px 5px",
        display: "flex",
        width: "100%",
      }}
      onClick={
        !selectMode
          ? (e) => cardClick(entityDoc)
          : (e) => handleCheckBox(entityDoc)
      }
      onMouseEnter={() => setHoverDelete(true)}
      onMouseLeave={() => setHoverDelete(false)}
      id={`summary-card-${entityDoc._id}`}
      testid={`summary-card-${entityDoc.sys_groupName}-${entityDoc._id}`}
    >
      <div style={{ display: "flex", padding: "1% 0 0 3%" }}>
        {renderCardBody()}
        {confirmDelete()}
        <DisplaySnackbar
          open={!!message}
          message={message}
          onClose={() => setMessage(null)}
        />
      </div>
      <div style={{ position: "absolute", right: 10 }}>
        {
          // selectMode === "multiple"
          //   ? renderCheckBox()
          //   : summaryMode === "summary" && showCheckbox
          //     ? renderCheckBox()
          //     :
          !isNJAdmin() && (
            <DisplayAvatar
              style={{ margin: "5px 5px 0px 0px" }}
              alt={agencyName}
              src={agencyLogo}
            />
          )
        }
      </div>
      <div
        style={{ display: "flex", position: "absolute", right: 12, bottom: 12 }}
      >
        {showDelete && (
          <div style={{ display: "flex" }}>
            {hoverDelete && renderCardDelete()}
          </div>
        )}
        {!id && showZoomToAsset && (
          <div style={{ display: "flex" }}>{renderZoomToAsset()}</div>
        )}

        {expandData.length > 0 && (
          <div style={{ display: "flex" }}>{renderExpand()}</div>
        )}
      </div>
    </DisplayCard>
  );
};
