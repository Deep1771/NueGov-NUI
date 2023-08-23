import React, { useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useRef } from "react";
import { colors } from "../constants";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import MyLocationIcon from "@material-ui/icons/MyLocation";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Popover from "@material-ui/core/Popover";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";
import { DisplayDialog } from "components/display_components/dialog";
import DisplayInput from "components/display_components/input";
import { entityTemplate } from "../../../../utils/services/api_services/template_service";
import { User } from "../../../../utils/services/factory_services/user_service";
import { useParams } from "react-router";
import {
  deleteEntity,
  entity,
} from "utils/services/api_services/entity_service";
import { get } from "utils/services/helper_services/object_methods";
import {
  createRelatedEntity,
  snapToRoad,
  getDistanceMatrix,
} from "../map_helpers";
import LocationContext from "utils/location";
import { Preset } from "utils/services/factory_services/preset_factory";

export const MenuBar = (props) => {
  let {
    setSnapThroughPoints,
    snapPoints,
    lineThroughMarkers,
    setLineThroughMarkers,
    clearSnappedPoints,
    getOtherObjects,
    setOtherObjects,
    mapControl,
    designerMetadata,
    setRelatedModal,
    formData,
    setTextMode,
    dataInit,
    getEditables,
    setEditables,
    getObjects,
    setObjects,
    getData,
    setData,
    setDistance,
    templates,
  } = props;

  const { getBaseTemplates } = Preset();
  let isMarkerEntityExists = getBaseTemplates()?.some((et) => {
    let sys_topLevel = get(et, "sys_entityAttributes.sys_topLevel");
    let latLngField = sys_topLevel?.some((etl) => etl?.type === "LATLONG");
    return latLngField;
  });

  let location = useContext(LocationContext);
  let { getAgencyId, checkWriteAccess } = User();
  const { appname, modulename, entityname, mode, id, ...rest } = useParams();
  let currentClass = useRef(null);
  let [textDialog, setDialog] = useState(false);
  let enteredText = useRef("");
  let drawingManager = new window.google.maps.drawing.DrawingManager({
    drawingControl: false,
    map: mapControl,
  });
  let [relatedDesignerMetadata, setRDM] = useState([]);
  let relatedDesignerMetadataRef = useRef([]);

  let [relatedLatlongMetadata, setLLM] = useState([]);
  let relatedLatlongMetadataRef = useRef([]);
  let paintColor = "#f00",
    borderColor = {},
    fillColor = {},
    paintMode = false;

  let triggerAddMarker = async (feature) => {
    currentClass.current = feature.name;
    if (location) {
      let position = location;

      let currentLocation = new window.google.maps.LatLng({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      let markerOptions = feature.options
        ? { ...feature.options }
        : { icon: feature.icon };
      markerOptions = {
        ...markerOptions,
        map: mapControl,
        position: currentLocation,
      };
      markerOptions.icon = {
        ...markerOptions.icon,
        scaledSize: new window.google.maps.Size(30, 30),
        labelOrigin: new window.google.maps.Point(30, 30),
      };
      let marker = new window.google.maps.Marker(markerOptions);

      window.google.maps.event.trigger(
        drawingManager,
        "markercomplete",
        marker
      );
    }
  };
  useEffect(() => {
    let initEffect = async () => {
      if (designerMetadata.relatedFeatures) {
        let rdms = await Promise.all(
          designerMetadata.relatedFeatures
            .filter((erf) =>
              checkWriteAccess({
                appname: erf.appName,
                modulename: erf.moduleName,
                entityname: erf.entityName,
              })
            )
            .map(async (entity) => {
              entity = {
                ...entity,
                modulename: entity.moduleName,
                appname: entity.appName,
                entityname: entity.entityName,
              };
              let relatedMetadata = await entityTemplate.get({
                modulename: entity.modulename,
                appname: entity.appname,
                groupname: entity.entityname,
              });
              let designerField;
              try {
                designerField =
                  relatedMetadata.sys_entityAttributes.sys_topLevel.find(
                    (field) => field.type === "DESIGNER"
                  );
                designerField.features = designerField.features.map(
                  (feature) => {
                    return {
                      ...feature,
                      related: true,
                      relatedInfo: { ...entity, metadata: relatedMetadata },
                    };
                  }
                );
                if (
                  !relatedDesignerMetadataRef?.current?.some(
                    (em) =>
                      em.name === designerField.name &&
                      em?.features?.some(
                        (ef) =>
                          ef?.relatedInfo?.entityName === entity.entityName
                      )
                  )
                )
                  relatedDesignerMetadataRef.current.push(designerField);
              } catch (e) {}

              let latLongField =
                relatedMetadata.sys_entityAttributes.sys_topLevel.find(
                  (field) => field.type === "LATLONG"
                );
              if (latLongField) {
                latLongField.related = true;
                latLongField.relatedInfo = {
                  ...entity,
                  metadata: relatedMetadata,
                };
                if (
                  !relatedLatlongMetadataRef?.current?.some(
                    (em) =>
                      em.name === latLongField.name &&
                      em?.relatedInfo?.entityName === entity.entityName
                  )
                )
                  relatedLatlongMetadataRef.current.push(latLongField);
              }
            })
        );

        setRDM(relatedDesignerMetadataRef.current);
        setLLM(relatedLatlongMetadataRef.current);
      }
    };

    initEffect();
  }, [designerMetadata]);

  useEffect(() => {
    if (lineThroughMarkers && snapPoints.length > 0) {
      drawPolyline();
    }
  }, [snapPoints, lineThroughMarkers]);

  let drawPolyline = () => {
    let polylineOptions = {
      path: snapPoints,
      strokeWeight: 3,
      map: mapControl,
      draggable: true,
      strokeColor: "#0000FF",
      zIndex: 250,
    };
    let polyline = new window.google.maps.Polyline(polylineOptions);
    constructPolyline(polyline);
  };

  let constructPolyline = async (polyline) => {
    let array = [
      ...designerMetadata.features,
      ...relatedDesignerMetadataRef.current.flatMap((rdm) =>
        rdm.features.map((feature) => {
          return { ...feature, rdm };
        })
      ),
    ];
    let feature = array.find((feature) => {
      let a = feature.name === currentClass.current;
      return a;
    });
    if (feature.related) {
      polyline.related = true;
      polyline.relatedInfo = feature.relatedInfo;
    }
    polyline.setDraggable(true);
    let distance;
    let updatePolylinePath = async () => {
      if (feature.snapToRoad) {
        await snapToRoad(polyline, updatePolylinePath);
      }
      if (feature.distanceMatrix) {
        await getDistanceMatrix(polyline, setDistance, feature);
      }
      let path = polyline.getPath().getArray();
      path = path.map((point) => {
        let lat = point.lat();
        let lng = point.lng();
        return [lng, lat];
      });
      if (feature.related) {
        let res = await entity.get({
          appname: polyline.appname,
          modulename: polyline.modulename,
          entityname: polyline.entityname,
          id: polyline.dataId,
        });
        let shape = res.sys_entityAttributes[feature.rdm.name].find(
          (shape) => shape.id === polyline.id
        );
        shape.coordinates = path;
        let updateRes = await entity.update(
          {
            appname: polyline.appname,
            modulename: polyline.modulename,
            entityname: polyline.entityname,
            id: polyline.dataId,
          },
          res
        );
      } else {
        let data = getData();
        let index = data.findIndex((datum) => datum.id === polyline.id);
        let polylineObject = data[index];
        polylineObject.coordinates = path;
        setData(data);
      }
    };

    drawingManager.setDrawingMode(null);
    let polylineId = uuidv4();
    polyline.id = polylineId;
    if (feature.snapToRoad) {
      await snapToRoad(polyline, updatePolylinePath);
    }

    if (feature.distanceMatrix) {
      distance = await getDistanceMatrix(polyline, setDistance, feature);
    }

    polyline.addListener("click", () => {
      if (polyline.related) {
        if (polyline.getEditable()) {
          polyline.setEditable(false);
          polyline.setDraggable(false);
          let editables = getEditables();
          editables = editables.filter(
            (editable) => editable.id !== polyline.id
          );
        } else
          setRelatedModal({
            visible: true,
            object: polyline,
            isMarker: false,
          });
      } else if (!polyline.getEditable()) {
        polyline.setEditable(true);
        polyline.setDraggable(true);
        let editables = getEditables();
        editables.push(polyline);
        setEditables(editables);
      } else {
        let editables = getEditables();
        editables = editables.filter((editable) => editable.id !== polylineId);
        setEditables(editables);
        polyline.setEditable(false);
        polyline.setDraggable(false);
      }
    });
    let objects = getObjects();
    objects.push(polyline);
    setObjects(objects);

    polyline.getPath().addListener("insert_at", updatePolylinePath);
    polyline.getPath().addListener("remove_at", updatePolylinePath);
    polyline.getPath().addListener("set_at", updatePolylinePath);
    let path = polyline.getPath().getArray();
    path = path.map((point) => {
      let lat = point.lat();
      let lng = point.lng();
      return [lng, lat];
    });
    let polylineObject = {
      type: "LineString",
      coordinates: path,
      id: polylineId,
    };
    if (feature.related) {
      polyline.appname = feature.relatedInfo.appname;
      polyline.modulename = feature.relatedInfo.modulename;
      polyline.entityname = feature.relatedInfo.entityname;
      polyline.referenceField = feature.relatedInfo.referenceField;
    }
    if (currentClass.current !== "NONE") {
      polylineObject.className = currentClass.current;
    } else {
      polylineObject.className = "default";
      polylineObject.strokeColor = borderColor.hex;
      polylineObject.fillColor = fillColor.hex;
    }
    if (feature.related) {
      createRelatedEntity(
        feature,
        getAgencyId,
        polylineObject,
        polyline,
        id,
        distance,
        formData
      );
    } else dataInit(polylineObject);

    let pointAssets = [],
      otherAssets = [];

    let allAssets = getOtherObjects().map((eo) => {
      if (eo.shapeType === "MARKER") pointAssets.push(eo);
      else otherAssets.push(eo);
    });

    let updatedObjects = pointAssets.map((eo) => {
      eo.set("infoWindow", true);
      if (eo?.selected) {
        let icon = eo.getIcon();
        let newIcon = {
          url: icon.url,
          scaledSize: new window.google.maps.Size(
            icon?.size?.width - 20 || 30,
            icon?.size?.height - 20 || 30
          ),
          labelOrigin: new window.google.maps.Point(30, 30),
        };
        eo.setIcon(newIcon);
        eo.set("selected", false);
      }
      return eo;
    });
    setOtherObjects([...otherAssets, ...updatedObjects]);

    setSnapThroughPoints(false);
    setLineThroughMarkers(false);
    if (snapPoints.length > 0) {
      clearSnappedPoints();
    }
  };

  try {
    setTimeout(() => {
      window.google.maps.event.addListener(
        drawingManager,
        "overlaycomplete",
        (event) => {
          window.google.maps.event.addListener(event.overlay, "click", () => {
            if (paintMode) {
              event.overlay.setOptions({ fillColor: paintColor.hex });
            }
          });
        }
      );

      window.google.maps.event.addListener(
        drawingManager,
        "polygoncomplete",
        (polygon) => {
          let feature = [
            ...designerMetadata.features,
            ...relatedDesignerMetadataRef.current.flatMap((rdm) =>
              rdm.features.map((feature) => {
                return { ...feature, rdm };
              })
            ),
          ].find((feature) => {
            return feature.name === currentClass.current;
          });
          if (feature.related) {
            polygon.related = true;
            polygon.relatedInfo = feature.relatedInfo;
          }
          drawingManager.setDrawingMode(null);
          let polygonId = uuidv4();
          polygon.id = polygonId;
          polygon.addListener("click", () => {
            if (polygon.related) {
              if (polygon.getEditable()) {
                polygon.setEditable(false);
                polygon.setDraggable(false);
                let editables = getEditables();
                editables = editables.filter(
                  (editable) => editable.id !== polygon.id
                );
              } else
                setRelatedModal({
                  visible: true,
                  object: polygon,
                  isMarker: false,
                });
            } else if (!polygon.getEditable()) {
              polygon.setEditable(true);
              polygon.setDraggable(true);
              let editables = getEditables();
              editables.push(polygon);
              setEditables(editables);
            } else {
              let editables = getEditables();
              editables = editables.filter(
                (editable) => editable.id !== polygonId
              );
              setEditables(editables);
              polygon.setEditable(false);
              polygon.setDraggable(false);
            }
          });
          let objects = getObjects();
          objects.push(polygon);
          setObjects(objects);
          let updatePolygonPath = async () => {
            let path = polygon.getPath().getArray();
            path = path.map((point) => {
              let lat = point.lat();
              let lng = point.lng();
              return [lng, lat];
            });
            if (
              path[0][0] !== path[path.length - 1][0] ||
              path[0][1] !== path[path.length - 1][1]
            ) {
              path.push(path[0]);
            }

            if (feature.related) {
              let res = await entity.get({
                appname: polygon.appname,
                modulename: polygon.modulename,
                entityname: polygon.entityname,
                id: polygon.dataId,
              });
              let shape = res.sys_entityAttributes[feature.rdm.name].find(
                (shape) => shape.id === polygon.id
              );
              shape.coordinates = [path];
              let updateRes = await entity.update(
                {
                  appname: polygon.appname,
                  modulename: polygon.modulename,
                  entityname: polygon.entityname,
                  id: polygon.dataId,
                },
                res
              );
            } else {
              let data = getData();
              let index = data.findIndex((datum) => datum.id === polygon.id);
              let polygonObject = data[index];
              polygonObject.coordinates = [path];
              setData(data);
            }
          };
          polygon.getPath().addListener("insert_at", updatePolygonPath);
          polygon.getPath().addListener("remove_at", updatePolygonPath);
          polygon.getPath().addListener("set_at", updatePolygonPath);
          let path = polygon.getPath().getArray();
          path = path.map((point) => {
            let lat = point.lat();
            let lng = point.lng();
            return [lng, lat];
          });
          path.push(path[0]);
          let polygonObject = {
            type: "Polygon",
            coordinates: [path],
            id: polygonId,
          };
          if (currentClass.current !== "NONE") {
            polygonObject.className = currentClass.current;
          } else {
            polygonObject.className = "default";
            polygonObject.strokeColor = borderColor.hex;
            polygonObject.fillColor = fillColor.hex;
          }

          if (feature.related) {
            createRelatedEntity(
              feature,
              getAgencyId,
              polygonObject,
              polygon,
              id,
              formData
            );
          } else dataInit(polygonObject);
        }
      );

      window.google.maps.event.addListener(
        drawingManager,
        "polylinecomplete",
        async (polyline) => {
          constructPolyline(polyline);
        }
      );

      window.google.maps.event.addListener(
        drawingManager,
        "markercomplete",
        (marker) => {
          let feature = [
            ...designerMetadata.features,
            ...relatedDesignerMetadataRef.current.flatMap((rdm) =>
              rdm.features.map((feature) => {
                return { ...feature, rdm };
              })
            ),
            ...relatedLatlongMetadataRef.current,
          ].find((feature) => {
            return feature.name === currentClass.current;
          });
          drawingManager.setDrawingMode(null);
          let markerId = uuidv4();
          marker.id = markerId;
          let value = {
            type: "Point",
            coordinates: [
              marker.getPosition().lng(),
              marker.getPosition().lat(),
            ],
            id: markerId,
            className: currentClass.current,
          };

          if (feature.related) {
            marker.related = true;
            marker.relatedInfo = feature.relatedInfo;
          }

          marker.addListener("click", () => {
            if (marker.related) {
              if (marker.getOpacity() < 1) {
                marker.setOpacity(1);
                let editables = getEditables();
                editables = editables.filter(
                  (editable) => editable.id !== marker.id
                );
                setEditables(editables);
              } else
                setRelatedModal({
                  visible: true,
                  object: marker,
                  isMarker: true,
                });
            } else if (marker.getOpacity() < 1) {
              marker.setOpacity(1);
              let editables = getEditables();
              editables = editables.filter(
                (editable) => editable.id !== marker.id
              );
              setEditables(editables);
            } else {
              marker.setOpacity(0.6);
              let editables = getEditables();
              editables.push(marker);
              setEditables(editables);
            }
          });
          marker.addListener("dragend", async () => {
            if (feature && feature.related) {
              marker.related = true;
              marker.relatedInfo = feature.relatedInfo;
              let res = await entity.get({
                appname: marker.relatedInfo.appname,
                modulename: marker.relatedInfo.modulename,
                entityname: marker.relatedInfo.entityname,
                id: marker.dataId,
              });
              let shape;
              if (feature.type !== "LATLONG")
                shape = res.sys_entityAttributes[feature.rdm.name].find(
                  (shape) => shape.id === marker.id
                );
              else shape = res.sys_entityAttributes[feature.name];
              shape.coordinates = [
                marker.getPosition().lng(),
                marker.getPosition().lat(),
              ];
              let updateRes = await entity.update(
                {
                  appname: marker.relatedInfo.appname,
                  modulename: marker.relatedInfo.modulename,
                  entityname: marker.relatedInfo.entityname,
                  id: marker.dataId,
                },
                res
              );
            } else {
              let data = getData();
              let index = data.findIndex((datum) => datum.id === markerId);
              let markerObj = data[index];
              markerObj.coordinates = [
                marker.getPosition().lng(),
                marker.getPosition().lat(),
              ];
              setData(data);
            }
          });

          if (feature.related) {
            createRelatedEntity(
              feature,
              getAgencyId,
              value,
              marker,
              id,
              undefined,
              formData
            );
          } else dataInit(value);
        }
      );
    }, 5000);
  } catch (e) {
    //ignore error because of timing issue
  }
  let BasicButtons = [
    {
      icon: "timeline",
      title: "Draw line",
      onClick: () => {},
      popup: (
        <List component="nav" aria-labelledby="nested-list-subheader">
          {[
            ...designerMetadata.features.filter((feature) => {
              return feature.type === "CUSTOM_POLYLINE";
            }),
            ...relatedDesignerMetadata.flatMap((rdm) => {
              return rdm.features.filter((feature) => {
                return feature.type === "CUSTOM_POLYLINE";
              });
            }),
          ].map((feature) => {
            return (
              <>
                {((feature?.marker && isMarkerEntityExists) ||
                  !feature.marker) && (
                  <ListItem
                    title={feature.info}
                    onClick={() => {
                      if (feature?.marker) {
                        drawingManager.setDrawingMode(null);
                        mapControl.setClickableIcons(false);
                        currentClass.current = feature.name;
                        let pointAssets = [],
                          otherAssets = [];
                        let allAssets = getOtherObjects().map((eo) => {
                          if (eo.shapeType === "MARKER") pointAssets.push(eo);
                          else otherAssets.push(eo);
                        });
                        let updatedObjects = pointAssets.map((eo) => {
                          eo.set("infoWindow", false);
                          return eo;
                        });
                        setOtherObjects([...otherAssets, ...updatedObjects]);
                        setSnapThroughPoints(true);
                      } else {
                        mapControl.setClickableIcons(true);
                        currentClass.current = feature.name;
                        drawingManager.setDrawingMode("polyline");
                        drawingManager.setOptions({
                          polylineOptions: feature.options,
                        });
                      }
                    }}
                    button
                  >
                    <ListItemText primary={feature.label || feature.name} />
                  </ListItem>
                )}
              </>
            );
          })}
        </List>
      ),
    },
    {
      icon: "crop_square",
      title: "Draw shape",
      onClick: () => {},
      popup: (
        <List component="nav" aria-labelledby="nested-list-subheader">
          {[
            ...designerMetadata.features.filter((feature) => {
              return feature.type === "CUSTOM_POLYGON";
            }),
            ...relatedDesignerMetadata.flatMap((rdm) => {
              return rdm.features.filter((feature) => {
                return feature.type === "CUSTOM_POLYGON";
              });
            }),
          ].map((feature) => {
            return (
              <ListItem
                title={feature.info}
                onClick={() => {
                  mapControl.setClickableIcons(true);
                  currentClass.current = feature.name;
                  drawingManager.setDrawingMode("polygon");
                  drawingManager.setOptions({
                    polygonOptions: feature.options,
                  });
                }}
                button
              >
                <ListItemText primary={feature.label || feature.name} />
              </ListItem>
            );
          })}
        </List>
      ),
    },

    {
      icon: "text_format",
      title: "Add custom text",
      onClick: () => {
        mapControl.setClickableIcons(true);
        setTextMode(true);
        setDialog(true);
      },
    },
    {
      icon: "add",
      title: "Add assets",
      onClick: () => {},
      popup: (
        <List component="nav" aria-labelledby="nested-list-subheader">
          {[
            ...[
              ...designerMetadata.features.filter((feature) => {
                return feature.type === "CUSTOM_ICON";
              }),
              ...relatedDesignerMetadata.flatMap((rdm) => {
                return rdm.features.filter((feature) => {
                  return feature.type === "CUSTOM_ICON";
                });
              }),
            ].map((feature) => {
              return (
                <ListItem
                  onClick={() => {
                    mapControl.setClickableIcons(true);
                    currentClass.current = feature.name;
                    drawingManager.setDrawingMode("marker");
                    let markerOptions = feature.options
                      ? { ...feature.options }
                      : { icon: feature.icon };
                    markerOptions.icon = {
                      ...markerOptions.icon,
                      scaledSize: new window.google.maps.Size(30, 30),
                      labelOrigin: new window.google.maps.Point(30, 30),
                    };
                    markerOptions.draggable = true;
                    drawingManager.setOptions({ markerOptions: markerOptions });
                  }}
                  button
                >
                  <ListItemText primary={feature.label || feature.name} />
                  <ListItemSecondaryAction
                    onClick={() => triggerAddMarker(feature)}
                  >
                    <IconButton
                      edge="end"
                      aria-label="Add Marker At My Location"
                    >
                      <MyLocationIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            }),
            ...relatedLatlongMetadata.map((latLongMetadata) => {
              return (
                <ListItem
                  onClick={() => {
                    mapControl.setClickableIcons(true);
                    currentClass.current = latLongMetadata.name;
                    drawingManager.setDrawingMode("marker");
                    let markerOptions = {};
                    markerOptions.icon = {
                      ...latLongMetadata.icon,
                      scaledSize: new window.google.maps.Size(30, 30),
                      labelOrigin: new window.google.maps.Point(30, 30),
                    };
                    markerOptions.draggable = true;
                    drawingManager.setOptions({ markerOptions: markerOptions });
                  }}
                  button
                >
                  <ListItemText
                    primary={latLongMetadata.label || latLongMetadata.title}
                  />
                  <ListItemSecondaryAction
                    onClick={() => triggerAddMarker(latLongMetadata)}
                  >
                    <IconButton
                      edge="end"
                      aria-label="Add Marker At My Location"
                    >
                      <MyLocationIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            }),
          ]}
        </List>
      ),
    },
  ];

  if (
    designerMetadata.features.filter((feature) => {
      return feature.type === "CUSTOM_POLYLINE";
    }).length === 0
  ) {
    BasicButtons = BasicButtons.filter((button) => button.icon !== "timeline");
  }

  if (
    designerMetadata.features.filter((feature) => {
      return feature.type === "CUSTOM_POLYGON";
    }).length === 0
  ) {
    BasicButtons = BasicButtons.filter(
      (button) => button.icon !== "crop_square"
    );
  }

  if (
    designerMetadata.features.filter((feature) => {
      return feature.type === "CUSTOM_ICON";
    }).length === 0 &&
    relatedLatlongMetadataRef.current.length === 0
  ) {
    BasicButtons = BasicButtons.filter((button) => button.icon !== "add");
  }
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: colors.primary,
        }}
      >
        {BasicButtons.map((button) => {
          let { icon, popup, onClick, title } = button;
          return (
            <ClickPopover
              title={title}
              icon={icon}
              popup={popup}
              onClick={onClick}
            />
          );
        })}
        <hr style={{ width: "90%", color: "#gggggg" }} />
        {
          <ClickPopover
            title={"Delete Selected Items"}
            icon={"delete"}
            onClick={() => {
              let editables = getEditables();
              editables.map((editable) => {
                editable.setMap(null);
                if (editable.related) {
                  let res = deleteEntity.remove({
                    appname: editable.relatedInfo.appname,
                    modulename: editable.relatedInfo.modulename,
                    entityname: editable.relatedInfo.entityname,
                    id: editable.dataId,
                  });
                } else {
                  let currentData = getData();
                  currentData = currentData.filter(
                    (object) => object.id !== editable.id
                  );
                  setData(currentData);
                }
              });
            }}
          />
        }
      </div>
      <DisplayDialog
        open={textDialog}
        title={"Enter the text"}
        message={
          <DisplayInput
            variant="standard"
            onChange={(value) => {
              enteredText.current = value;
            }}
          ></DisplayInput>
        }
        confirmLabel={"Add"}
        onConfirm={() => {
          setTextMode(false);
          let textId = uuidv4();
          let marker = new window.google.maps.Marker({
            icon: {
              fillOpacity: 0.0,
              strokeOpacity: 0.0,
              labelOrigin: new window.google.maps.Point(
                enteredText.current.length / 4,
                0
              ),
              scale: 14,
              path: "M 0 0 H " + enteredText.current.length / 2,
            },
            draggable: true,
            id: textId,
            position: mapControl.getCenter(),
            map: mapControl,
          });
          let labelOptions = {};
          if (designerMetadata.labelOptions)
            labelOptions = designerMetadata.labelOptions;
          marker.setLabel({
            text: enteredText.current,
            ...labelOptions,
          });
          let value = {
            type: "Point",
            coordinates: [
              marker.getPosition().lng(),
              marker.getPosition().lat(),
            ],
            id: textId,
            text: enteredText.current,
            className: "text",
          };
          dataInit(value);
          marker.addListener("click", () => {
            if (marker.getOpacity() < 1) {
              marker.setOpacity(1);
              let editables = getEditables();
              editables = editables.filter(
                (editable) => editable.id !== marker.id
              );
              setEditables(editables);
            } else {
              marker.setOpacity(0.6);
              let editables = getEditables();
              editables.push(marker);
              setEditables(editables);
            }
          });
          marker.addListener("dragend", () => {
            let data = getData();
            let index = data.findIndex((datum) => datum.id === textId);
            let textObj = data[index];
            textObj.coordinates = [
              marker.getPosition().lng(),
              marker.getPosition().lat(),
            ];
            setData(data);
          });

          setDialog(false);
        }}
        onCancel={() => {
          setTextMode(false);
          enteredText.current = "";
          setDialog(false);
        }}
      />
    </>
  );
};

function ClickPopover(props) {
  const useStyles = makeStyles((theme) => ({
    popover: {
      //   pointerEvents: 'auto',
    },
    paper: {
      padding: theme.spacing(1),
    },
  }));
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [background, setBackground] = useState(colors.primary);
  const [color, setColor] = useState("#ffffff");
  const open = Boolean(anchorEl);
  const { icon, popup, onClick, title } = props;

  return (
    <>
      <ClickAwayListener
        onClickAway={() => {
          setBackground(colors.primary);
          // // setAnchorEl(null);
          setColor("#ffffff");
        }}
      >
        <Tooltip title={title} placement="right">
          <Button
            disableElevation
            style={{
              border: "0px",
              borderRadius: "0%",
              height: "50px",
            }}
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
              if (onClick !== undefined || onClick !== null)
                try {
                  onClick();
                } catch (e) {
                  console.log(e);
                }
            }}
          >
            <Icon
              style={{
                color: color,
              }}
            >
              {icon}
            </Icon>
          </Button>
        </Tooltip>
      </ClickAwayListener>
      {popup ? (
        <Popover
          id="mouse-over-popover"
          className={classes.popover}
          classes={{
            paper: classes.paper,
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={() => {
            setBackground(colors.primary);
            setAnchorEl(null);
            setColor("#ffffff");
          }}
          disableRestoreFocus
        >
          <div
            onClick={() => {
              setAnchorEl(null);
            }}
          >
            {popup}
          </div>
        </Popover>
      ) : null}
    </>
  );
}
