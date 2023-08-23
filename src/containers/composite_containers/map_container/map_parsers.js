import { entity } from "utils/services/api_services/entity_service";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { get } from "utils/services/helper_services/object_methods";
import { v4 as uuidv4 } from "uuid";

const getAppModuleName = (preset, entityName) => {
  return preset.find((entity) => entity.groupName === entityName);
};

export const getTruncatedMetadata = (iwMetadata, fieldMetadata) => {
  let newSysTopLevel = [];
  try {
    newSysTopLevel = iwMetadata.sys_entityAttributes.sys_topLevel.filter(
      (field) => {
        return fieldMetadata.infoWindowContent.topLevel.includes(field.name);
      }
    );
  } catch (e) {
    console.error(e);
  }

  let newComponents = [];
  try {
    newComponents =
      iwMetadata.sys_entityAttributes.sys_components[0].componentList
        .filter((component) => {
          return (
            fieldMetadata.infoWindowContent.components.findIndex((metaComp) => {
              return metaComp.name === component.name;
            }) > -1
          );
        })
        .map((component) => {
          let componentContent =
            fieldMetadata.infoWindowContent.components.find(
              (comp) => component.name === comp.name
            );
          component.sys_entityAttributes =
            component.sys_entityAttributes.filter((field) => {
              return componentContent.mapDisplayFields.includes(field.name);
            });
          return component;
        });
    iwMetadata.sys_entityAttributes.sys_components[0].componentList =
      newComponents;
  } catch (e) {
    console.error(e);
  }

  let sectionStartMarker = {
    canUpdate: true,
    displayOnCsv: true,
    marker: "start",
    name: "Data",
    title: fieldMetadata.infoWindowContent.sectionTitle || "Data",
    type: "SECTION",
    visible: false,
  };

  let sectionEndMarker = {
    canUpdate: true,
    displayOnCsv: true,
    marker: "end",
    name: "Data",
    title: "Data",
    type: "SECTION",
    visible: false,
  };

  newSysTopLevel = [sectionStartMarker, ...newSysTopLevel, sectionEndMarker];
  iwMetadata.sys_entityAttributes.sys_topLevel = newSysTopLevel;

  return iwMetadata;
};
export let designerParser = (
  data,
  metadata,
  fieldMetadata,
  mapControl,
  triggerSearch,
  fixedShape,
  setShowIW,
  setIW,
  setIWShape,
  preset,
  visibility,
  colorCodes,
  subLayerChecked
) => {
  let objects = data.flatMap((datum) => {
    let iwListener = async () => {
      let entityInfo = getAppModuleName(
        preset,
        metadata.sys_entityAttributes.sys_templateGroupName.sys_groupName
      );
      let dataParams = {
        appname: entityInfo.appName,
        modulename: entityInfo.moduleName,
        entityname: entityInfo.groupName,
        id: datum._id,
      };

      let metadataParams = {
        appname: entityInfo.appName,
        modulename: entityInfo.moduleName,
        groupname: entityInfo.groupName,
      };
      let iwData = await entity.get(dataParams);
      let iwMetadata;
      //  = await entityTemplate.get(metadataParams);
      // delete iwMetadata.sys_entityAttributes.sys_components;
      // iwMetadata =  getTruncatedMetadata(iwMetadata, fieldMetadata);
      setIW({ iwData, iwMetadata, dataParams });
      setShowIW(true);
    };
    let fieldData = datum.sys_entityAttributes[fieldMetadata.name];
    try {
      // console.log({ clusteringChecked })
      if (fieldData) {
        let shapes = fieldData.flatMap((shape) => {
          switch (shape.type) {
            case "Polygon":
              let zoneDefaultMarker;
              if (fieldMetadata.zoneDefaultMarkers) {
                let bound = new window.google.maps.LatLngBounds();
                shape.coordinates[0].map((point) => {
                  let p = new window.google.maps.LatLng(point[1], point[0]);
                  bound.extend(p);
                });
                let markerPos = bound.getCenter();
                zoneDefaultMarker = new window.google.maps.Marker({
                  position: markerPos,
                  icon: fieldMetadata.zoneDefaultMarkers[0].icon,
                  id: uuidv4(),
                  visible: visibility,
                  datum,
                  shape,
                  metadata,
                  fieldMetadata,
                  className:
                    metadata.sys_entityAttributes.sys_templateGroupName
                      .sys_groupName,
                });

                zoneDefaultMarker.addListener("click", iwListener);
              }
              let loops = shape.coordinates;
              let paths = loops.map((loop) => {
                let points = loop.map((point) => {
                  return new window.google.maps.LatLng(point[1], point[0]);
                });
                return points;
              });
              let polygonOptions = {
                shapeType: "POLYGON",
                paths: paths,
                fillColor: shape.fillColor,
                strokeColor: shape.strokeColor,
                datum,
                shape,
                id: shape.id ? shape.id : uuidv4(),
                visible: visibility,
                metadata,
                fieldMetadata,
                className:
                  metadata.sys_entityAttributes.sys_templateGroupName
                    .sys_groupName,
                // map: mapControl
              };
              let feature = fieldMetadata.features.find(
                (feature) => feature.name === shape.className
              );

              if (shape.className === "default") {
                polygonOptions.strokeColor = shape.strokeColor;
                polygonOptions.fillColor = shape.fillColor;
              } else {
                polygonOptions = {
                  ...polygonOptions,
                  ...(feature?.options || {}),
                };
              }

              if (colorCodes) {
                try {
                  let subClassName = textExtractor(
                    datum.sys_entityAttributes[colorCodes.name],
                    colorCodes
                  );
                  let subClassColor = colorCodes.values.find(
                    (value) => value.value === subClassName
                  ).color;
                  polygonOptions.subClassName = subClassName;
                  polygonOptions.fillColor = subClassColor;
                  polygonOptions.strokeColor = subClassColor;
                  if (!subLayerChecked[subClassName]) {
                    polygonOptions.visible = false;
                    if (zoneDefaultMarker) {
                      zoneDefaultMarker.visible = false;
                    }
                  }
                } catch (e) {}
              }

              let polygon = new window.google.maps.Polygon(polygonOptions);
              // mapControl.current.objects.push(polygon)
              try {
                if (feature && feature.geofence) {
                  polygon.addListener("mouseout", () => {
                    let newPolygonOptions = { ...polygonOptions };
                    newPolygonOptions.strokeWeight = 3;
                    polygon.setOptions(newPolygonOptions);
                  });
                  polygon.addListener("mouseover", () => {
                    let newPolygonOptions = { ...polygonOptions };
                    newPolygonOptions.strokeWeight = 6;
                    polygon.setOptions(newPolygonOptions);
                  });
                }
                polygon.addListener("click", () => {
                  if (feature && feature.geofence) {
                    let bounds = new window.google.maps.LatLngBounds();
                    let shape = polygon
                      .getPath()
                      .getArray()
                      .map((point) => {
                        bounds.extend(point);
                        return [point.lng(), point.lat()];
                      });
                    setIWShape({ shape, bounds });
                  } else setIWShape(null);
                  iwListener();
                });
              } catch (e) {
                //do nothing if error
              }
              if (fieldMetadata.zoneDefaultMarkers)
                return [polygon, zoneDefaultMarker];
              else return polygon;

            case "LineString":
              let path = shape.coordinates;
              path = path.map((point) => {
                return new window.google.maps.LatLng(point[1], point[0]);
              });
              let zoom = mapControl.getZoom();
              console.log(248, zoom);
              let symbolOne = {
                path: "M -2,0 0,-2 2,0 0,2 z",
                strokeColor: "#F00",
                scale: 1.5,
                fillColor: "#F00",
                fillOpacity: 1,
                rotation: 45,
              };

              let symbolThree = {
                path: "M -2,0 0,-2 2,0 0,2 z",
                fillColor: "#292",
                scale: 1.5,
                strokeColor: "#292",
                fillOpacity: 1,
                rotation: 45,
              };
              let polylineOptions = {
                path: path,
                shapeType: "POLYLINE",
                // ...(zoom > 12
                //   && {
                icons: [
                  {
                    icon: symbolOne,
                    offset: "0%",
                  },
                  {
                    icon: symbolThree,
                    offset: "100%",
                  },
                ],
                // }),
                id: shape.id ? shape.id : uuidv4(),
                strokeWeight: 3,
                className:
                  metadata.sys_entityAttributes.sys_templateGroupName
                    .sys_groupName,
                visible: visibility,
                // map: mapControl
              };
              console.log(290, polylineOptions);
              if (shape.className === "default") {
                polylineOptions.strokeColor = shape.strokeColor;
              } else {
                let feature = fieldMetadata.features.find(
                  (feature) => feature.name === shape.className
                );
                polylineOptions = {
                  ...polylineOptions,
                  ...(feature?.options || {}),
                };
              }

              if (colorCodes) {
                try {
                  let subClassName = textExtractor(
                    datum.sys_entityAttributes[colorCodes.name],
                    colorCodes
                  );
                  let subClassColor = colorCodes.values.find(
                    (value) => value.value === subClassName
                  ).color;
                  polylineOptions.subClassName = subClassName;
                  polylineOptions.fillColor = subClassColor;
                  polylineOptions.strokeColor = subClassColor;
                  if (!subLayerChecked[subClassName]) {
                    polylineOptions.visible = false;
                  }
                } catch (e) {}
              }

              let polyline = new window.google.maps.Polyline(polylineOptions);
              polyline.addListener("click", () => {
                setIWShape(null);
                iwListener();
              });
              return polyline;
            case "Point":
              if (shape.className === "text") {
                let markerOptions = {
                  shapeType: "MARKER",
                  icon: {
                    fillOpacity: 0.0,
                    strokeOpacity: 0.0,
                    labelOrigin: new window.google.maps.Point(
                      shape.text.length / 4,
                      0
                    ),
                    scale: 14,
                    path: "M 0 0 H " + shape.text.length / 2,
                  },

                  visible: visibility,
                  draggable: false,
                  position: {
                    lat: shape.coordinates[1],
                    lng: shape.coordinates[0],
                  },
                  // map: mapControl,
                  className:
                    metadata.sys_entityAttributes.sys_templateGroupName
                      .sys_groupName,
                  id: shape.id ? shape.id : uuidv4(),
                };
                if (colorCodes) {
                  try {
                    let subClassName = textExtractor(
                      datum.sys_entityAttributes[colorCodes.name],
                      colorCodes
                    );
                    let subClassColor = colorCodes.values.find(
                      (value) => value.value === subClassName
                    ).color;
                    markerOptions.subClassName = subClassName;
                    if (!subLayerChecked[subClassName]) {
                      markerOptions.visible = false;
                    }
                  } catch (e) {}
                }
                let marker = new window.google.maps.Marker(markerOptions);
                let labelOptions = {};
                if (fieldMetadata.labelOptions)
                  labelOptions = fieldMetadata.labelOptions;
                marker.setLabel({
                  text: shape.text,
                  ...labelOptions,
                });
                marker.addListener("click", iwListener);
                return marker;
              } else {
                let markerOptions = {
                  position: new window.google.maps.LatLng({
                    lat: shape.coordinates[1],
                    lng: shape.coordinates[0],
                  }),
                  className:
                    metadata.sys_entityAttributes.sys_templateGroupName
                      .sys_groupName,
                  visible: visibility,
                  // map: mapControl,
                  id: shape.id ? shape.id : uuidv4(),
                };
                if (colorCodes) {
                  try {
                    let subClassName = textExtractor(
                      datum.sys_entityAttributes[colorCodes.name],
                      colorCodes
                    );
                    let subClassColor = colorCodes.values.find(
                      (value) => value.value === subClassName
                    ).color;
                    markerOptions.subClassName = subClassName;
                    if (!subLayerChecked[subClassName]) {
                      markerOptions.visible = false;
                    }
                  } catch (e) {}
                }
                let feature = fieldMetadata.features.find(
                  (feature) => feature.name === shape.className
                );
                markerOptions = {
                  ...markerOptions,
                  ...(feature?.options || {}),
                };
                markerOptions.icon = {
                  ...markerOptions.icon,
                  scaledSize: new window.google.maps.Size(30, 30),
                  labelOrigin: new window.google.maps.Point(30, 30),
                };

                let marker = new window.google.maps.Marker(markerOptions);
                marker.addListener("click", iwListener);
                return marker;
              }

            case "Circle":
              return;
              break;
          }
        });
        return shapes;
      }
    } catch (e) {
      console.log(e);
      return [];
    }
  });
  return objects;
};

export let latlongParser = (
  data,
  metadata,
  fieldMetadata,
  mapControl,
  setShowIW,
  setIW,
  setIWShape,
  preset,
  visibility,
  colorCodes,
  subLayerChecked,
  clusteringEnabled,
  snapThroughPoints,
  setSnapThroughPoints,
  setSnappedPointsRef
) => {
  let markers = data.map((datum) => {
    let geometry = clusteringEnabled
      ? datum.geometry
      : datum.sys_entityAttributes.geoJSONLatLong;
    let position = {
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0],
    };
    let iconSize = fieldMetadata?.icon?.size || 30;
    let iconUrl = datum.sys_entityAttributes
      ? fieldMetadata?.icon?.url
      : fieldMetadata?.icon?.clusterUrl || fieldMetadata?.icon?.url;
    let labelReference = fieldMetadata?.icon?.label;
    let labelOptionsInMetadata = fieldMetadata?.icon?.labelOptions || {};
    let labelOptions;
    let iconLabel = get(datum, `sys_entityAttributes.${labelReference}`);
    if (iconLabel) {
      labelOptions = {
        text: iconLabel,
        color: "#000000",
        fontSize: "16px",
        ...labelOptionsInMetadata,
      };
    }
    let markerOptions = {
      position,
      shapeType: "MARKER",
      selected: false,
      infoWindow: snapThroughPoints ? false : true,
      // map: mapControl,
      icon: {
        url: iconUrl,
        scaledSize: new window.google.maps.Size(iconSize, iconSize),
        labelOrigin: new window.google.maps.Point(30, 30),
      },
      visible: visibility,
      datum,
      id: datum._id ? datum._id : datum.id,
      metadata,
      fieldMetadata,
      className:
        metadata.sys_entityAttributes.sys_templateGroupName.sys_groupName,
      ...(iconLabel && { label: labelOptions }),
    };

    let isDataExists = (field) =>
      datum.sys_entityAttributes && datum.sys_entityAttributes[field.name];

    let getSubClassName = (colorCodes) =>
      textExtractor(datum.sys_entityAttributes[colorCodes.name], colorCodes);

    let getSubClass = (code, subClassName) =>
      code.values.find((value) => value.value === subClassName);

    if (colorCodes) {
      try {
        if (!Array.isArray(colorCodes)) {
          if (isDataExists(colorCodes)) {
            let subClassName = getSubClassName(colorCodes);
            let subClass = getSubClass(colorCodes, subClassName);
            if (subClass && subClass.icon) {
              markerOptions.icon.url = subClass.icon;
            } else {
              markerOptions.icon.url = fieldMetadata.icon.url;
            }
            if (!subLayerChecked[subClassName]) {
              markerOptions.visible = false;
            }
            markerOptions.subClassName = subClassName;
          } else {
            markerOptions.icon.url =
              fieldMetadata.icon.clusterUrl || fieldMetadata.icon.url;
          }
        } else {
          let code = colorCodes.reduce((acc, curr) => {
            if (isDataExists(curr)) {
              let subClassName = getSubClassName(curr);

              switch (curr.type) {
                case "LIST":
                  {
                    let subClass = getSubClass(curr, subClassName);
                    if (subClass && subClass.icon) {
                      acc = { ...curr, subClassName, subClass };
                    }
                  }
                  break;
                case "TEXTBOX":
                  {
                    acc = {
                      ...curr,
                      subClassName,
                      subClass: { icon: subClassName },
                    };
                  }
                  break;
                case "URL":
                  {
                    acc = {
                      ...curr,
                      subClassName,
                      subClass: { icon: subClassName },
                    };
                  }
                  break;
              }
            }
            return acc;
          }, {});

          if (code) {
            if (code?.subClass?.icon) {
              markerOptions.icon.url = code.subClass.icon;
            } else {
              markerOptions.icon.url = fieldMetadata.icon.url;
            }
            if (!subLayerChecked[code.subClassName]) {
              markerOptions.visible = false;
            }
            markerOptions.subClassName = code.subClassName;
          } else {
            markerOptions.icon.url =
              fieldMetadata.icon.clusterUrl || fieldMetadata.icon.url;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (datum.properties && datum.properties.cluster) {
      markerOptions.label = {
        text: `${
          fieldMetadata?.icon?.clusterLabelOptions?.markerTitle
            ? fieldMetadata?.icon?.clusterLabelOptions.markerTitle
            : ""
        }
          ${String(datum.properties.point_count)}`,
        ...(fieldMetadata?.icon?.clusterLabelOptions && {
          ...fieldMetadata.icon.clusterLabelOptions,
        }),
      };
      markerOptions.title = String(datum.properties.point_count);
    } else {
      markerOptions.label = {
        text: `${
          fieldMetadata?.icon?.nonClusterLabelOptions?.markerTitle
            ? fieldMetadata?.icon?.nonClusterLabelOptions.markerTitle
            : ""
        }
          ${String(datum.text || "")}`,
        ...(fieldMetadata?.icon?.nonClusterLabelOptions && {
          ...fieldMetadata.icon.nonClusterLabelOptions,
        }),
      };
      markerOptions.title = String(datum.text);
    }
    let marker = new window.google.maps.Marker(markerOptions);

    marker.addListener("click", async (e) => {
      if (datum.properties && datum.properties.cluster) {
        mapControl.setCenter(position);
        mapControl.setZoom(mapControl.getZoom() + 2);
      } else if (marker?.infoWindow === true) {
        let entityInfo = getAppModuleName(
          preset,
          metadata?.sys_entityAttributes?.sys_templateGroupName?.sys_groupName
        );
        let dataParams = {
          appname: entityInfo?.appName,
          modulename: entityInfo?.moduleName,
          entityname: entityInfo?.groupName,
          id: datum._id,
        };

        let metadataParams = {
          appname: entityInfo?.appName,
          modulename: entityInfo?.moduleName,
          groupname: entityInfo?.groupName,
        };
        let iwData = await entity.get(dataParams);
        let iwMetadata;
        // delete iwMetadata.sys_entityAttributes.sys_components;
        // iwMetadata =  getTruncatedMetadata(iwMetadata, fieldMetadata);
        setIW({ iwData, iwMetadata, dataParams });
        setIWShape(null);
        setShowIW(true);
      } else {
        let point = marker.getPosition();
        let icon = marker.getIcon();
        if (marker?.selected) {
          let newIcon = {
            url: icon.url,
            scaledSize: new window.google.maps.Size(
              icon.size.width - 20,
              icon.size.height - 20
            ),
            labelOrigin: new window.google.maps.Point(30, 30),
          };
          marker.set("selected", false);
          marker.setIcon(newIcon);
          setSnappedPointsRef(point, true);
        } else {
          let newIcon = {
            url: icon.url,
            scaledSize: new window.google.maps.Size(
              icon.size.width + 20,
              icon.size.height + 20
            ),
            labelOrigin: new window.google.maps.Point(30, 30),
          };
          marker.set("selected", true);
          marker.setIcon(newIcon);
          setSnappedPointsRef(point);
        }
      }
    });
    return marker;
  });
  return markers;
};
