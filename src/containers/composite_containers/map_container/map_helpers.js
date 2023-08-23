import axios from "axios";
import { entity } from "../../../utils/services/api_services/entity_service";
import debounce from "lodash/debounce";
import get from "lodash/get";
import { entityTemplate } from "../../../utils/services/api_services/template_service";

export async function snapToRoad(polyline, updatePolylinePath) {
  let path = polyline.getPath();
  let pathArray = path.getArray();
  let lastPath = pathArray[pathArray.length - 1];
  var pathValues = [];
  for (let i = 0; i < path.getLength(); i++) {
    pathValues.push(path.getAt(i).toUrlValue());
  }
  let chunks = [];
  let newPath = [];
  let latLng1, latLng2, step, steps;

  for (let i = 1; i < path.length; i++) {
    latLng1 = path.getAt(i - 1);
    latLng2 = path.getAt(i);
    let distanceDiff =
      window.google.maps.geometry.spherical.computeDistanceBetween(
        latLng1,
        latLng2
      );
    steps = Math.ceil(distanceDiff / 200);
    step = 1 / steps;
    let arr = [];
    for (let j = 0; j < steps; j++) {
      let interpolated = window.google.maps.geometry.spherical.interpolate(
        latLng1,
        latLng2,
        step * j
      );
      arr.push(interpolated.toUrlValue());
    }
    chunks[i] = arr;
  }
  let chunkPromises = chunks.map(async (chunk, i) => {
    let snappedPath = await axios.get(
      `https://roads.googleapis.com/v1/snapToRoads?interpolate=true&path=${chunk.join(
        "|"
      )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    );
    newPath[i] = snappedPath.data.snappedPoints.map((point) => {
      return new window.google.maps.LatLng(
        point.location.latitude,
        point.location.longitude
      );
    });
    return Promise.resolve();
  });
  await Promise.all(chunkPromises);
  let joinedNewPath = newPath.flatMap((chunkPath) => chunkPath);
  polyline.setPath([...joinedNewPath, lastPath]);
  let handler = debounce(updatePolylinePath, 500);
  polyline.getPath().addListener("insert_at", handler);
  polyline.getPath().addListener("remove_at", handler);
  polyline.getPath().addListener("set_at", handler);
  polyline.addListener("drag", () => {
    handler(false);
  });
  return polyline;
}

export const createRelatedEntity = async (
  feature,
  getAgencyId,
  dataObject,
  object,
  referenceId,
  distance,
  formData
) => {
  let obj = {
    sys_templateName:
      feature.relatedInfo.metadata.sys_entityAttributes.sys_templateName,
    sys_groupName: feature.relatedInfo.entityname,
    sys_agencyId: getAgencyId,
    sys_entityAttributes: {
      [feature.relatedInfo.referenceField]: {
        id: formData._id,
        sys_gUid: formData.sys_gUid,
      },
    },
  };

  let relatedMetadata = await entityTemplate.get({
    modulename: feature.relatedInfo.modulename,
    appname: feature.relatedInfo.appname,
    groupname: feature.relatedInfo.entityname,
  });
  let referenceField = relatedMetadata.sys_entityAttributes.sys_topLevel.find(
    (field) => field.name === feature.relatedInfo.referenceField
  );
  referenceField.displayFields.map((displayField) => {
    let key = displayField.name;
    let value = get(formData.sys_entityAttributes, key);
    obj.sys_entityAttributes[feature.relatedInfo.referenceField][key] = value;
  });

  if (feature.type !== "LATLONG") {
    obj.sys_entityAttributes[feature.rdm.name] = [dataObject];
  } else {
    obj.sys_entityAttributes[feature.name] = dataObject;
  }
  if (feature.bindDistanceTo !== undefined) {
    obj.sys_entityAttributes[feature.bindDistanceTo] = distance;
  }
  let res = await entity.create(
    {
      appname: feature.relatedInfo.appname,
      modulename: feature.relatedInfo.modulename,
      entityname: feature.relatedInfo.entityname,
    },
    obj
  );
  object.dataId = res.id;
};

export let getDistanceMatrix = async (polyline, setDistance, feature) => {
  let path = polyline.getPath().getArray();
  let length = window.google.maps.geometry.spherical.computeLength(path);
  if (setDistance && !feature.related) setDistance(length, feature.name);
  return length;
};

export let createPolygonFromData = (object, mapControl, fieldmeta, bounds) => {
  let loops = object.coordinates;
  let paths = loops.map((loop) => {
    let points = loop.map((point) => {
      let latlng = new window.google.maps.LatLng(
        Number(point[1]),
        Number(point[0])
      );
      bounds.extend(latlng);
      return latlng;
    });
    return points;
  });
  let polygonOptions = {
    paths: paths,
    strokeWeight: 3,
    className: object.className,
    map: mapControl,
    id: object.id,
  };

  if (object.className === "default") {
    polygonOptions.strokeColor = object.strokeColor;
    polygonOptions.fillColor = object.fillColor;
  } else {
    let feature = fieldmeta.features.find(
      (feature) => feature.name === object.className
    );
    polygonOptions = { ...polygonOptions, ...feature.options };
  }
  let polygon = new window.google.maps.Polygon(polygonOptions);
  return polygon;
};

export let makePolygonEditable = (
  polygon,
  editables,
  updatePolygonPath,
  setRelatedModal
) => {
  if (polygon.related) {
    polygon.addListener("click", () => {
      if (polygon.getEditable()) {
        polygon.setEditable(false);
        polygon.setDraggable(false);
        editables.current = editables.current.filter(
          (editable) => editable.id !== polygon.id
        );
      } else
        setRelatedModal({
          visible: true,
          object: polygon,
          isMarker: false,
        });
    });
  } else
    polygon.addListener("click", () => {
      if (!polygon.getEditable()) {
        polygon.setEditable(true);
        polygon.setDraggable(true);
        editables.current.push(polygon);
      } else {
        editables.current = editables.current.filter(
          (editable) => editable.id !== polygon.id
        );
        polygon.setEditable(false);
        polygon.setDraggable(false);
      }
    });
  let handler = debounce(updatePolygonPath, 500);
  polygon.getPath().addListener("insert_at", handler);
  polygon.getPath().addListener("remove_at", handler);
  polygon.getPath().addListener("set_at", handler);
  polygon.addListener("drag", () => {
    handler(false);
  });
};

export let createPolylineFromData = (object, mapControl, fieldmeta, bounds) => {
  let path = object.coordinates;
  path = path.map((point) => {
    let latlng = new window.google.maps.LatLng(point[1], point[0]);
    bounds.extend(latlng);
    return latlng;
  });
  let polylineOptions = {
    path: path,
    strokeWeight: 3,
    className: object.className,
    map: mapControl,
    id: object.id,
    draggable: true,
  };
  if (object.className === "default") {
    polylineOptions.strokeColor = object.strokeColor;
  } else {
    let feature = fieldmeta.features.find(
      (feature) => feature.name === object.className
    );
    polylineOptions = { ...polylineOptions, ...feature.options };
  }
  let polyline = new window.google.maps.Polyline(polylineOptions);

  return polyline;
};

export let makePolylineEditable = (
  polyline,
  editables,
  updatePolylinePath,
  mapControl,
  setRelatedModal
) => {
  if (polyline.related) {
    polyline.addListener("click", () => {
      if (polyline.getEditable()) {
        polyline.setEditable(false);
        polyline.setDraggable(false);
        editables.current = editables.current.filter(
          (editable) => editable.id !== polyline.id
        );
      } else
        setRelatedModal({
          visible: true,
          object: polyline,
          isMarker: false,
        });
    });
  } else
    polyline.addListener("click", () => {
      if (!polyline.getEditable()) {
        polyline.setEditable(true);
        polyline.setDraggable(true);
        editables.current.push(polyline);
      } else {
        editables.current = editables.current.filter(
          (editable) => editable.id !== polyline.id
        );
        polyline.setEditable(false);
        polyline.setDraggable(false);
      }
    });

  let handler = debounce(updatePolylinePath, 500);
  polyline.getPath().addListener("insert_at", handler);
  polyline.getPath().addListener("remove_at", handler);
  polyline.getPath().addListener("set_at", handler);
  polyline.addListener("drag", () => {
    handler(false);
  });
};

export let createTextFromData = (object, mapControl, fieldmeta, bounds) => {
  let marker = new window.google.maps.Marker({
    icon: {
      fillOpacity: 0.0,
      strokeOpacity: 0.0,
      labelOrigin: new window.google.maps.Point(object.text.length / 4, 0),
      scale: 14,
      path: "M 0 0 H " + object.text.length / 2,
    },
    draggable: true,
    position: { lat: object.coordinates[1], lng: object.coordinates[0] },
    map: mapControl,
    id: object.id,
  });

  bounds.extend({ lat: object.coordinates[1], lng: object.coordinates[0] });
  let labelOptions = {};
  if (fieldmeta.labelOptions) labelOptions = fieldmeta.labelOptions;
  marker.setLabel({
    text: object.text,
    ...labelOptions,
  });

  return marker;
};

export let createPointFromData = (object, mapControl, fieldmeta, bounds) => {
  let markerOptions = {
    position: new window.google.maps.LatLng({
      lat: object.coordinates[1],
      lng: object.coordinates[0],
    }),
    className: object.className,
    map: mapControl,
    id: object.id,
  };
  let feature = fieldmeta.features.find(
    (feature) => feature.name === object.className
  );
  markerOptions = { ...markerOptions, ...feature.options };
  markerOptions.icon = {
    ...markerOptions.icon,
    scaledSize: new window.google.maps.Size(30, 30),
    labelOrigin: new window.google.maps.Point(30, 30),
  };
  bounds.extend(
    new window.google.maps.LatLng({
      lat: object.coordinates[1],
      lng: object.coordinates[0],
    })
  );
  let marker = new window.google.maps.Marker(markerOptions);
  return marker;
};

export let paintDesignerLayer = (
  data,
  fieldmeta,
  mapControl,
  bounds,
  currentData,
  callbackValue,
  objects,
  editables,
  props,
  setDistance,
  dataId,
  setRelatedModal
) => {
  if (data !== undefined)
    data.map((object) => {
      let feature = fieldmeta.features.find((feature) => {
        try {
          return feature.name === object.className;
        } catch (e) {
          return false;
        }
      });
      if (feature)
        switch (object.type) {
          case "Polygon":
            let polygon = createPolygonFromData(
              object,
              mapControl,
              fieldmeta,
              bounds
            );
            if (feature.related) {
              polygon.related = true;
              polygon.relatedInfo = feature.relatedInfo;
              polygon.dataId = dataId;
            }
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
                  appname: feature.relatedInfo.appname,
                  modulename: feature.relatedInfo.modulename,
                  entityname: feature.relatedInfo.entityname,
                  id: dataId,
                });
                let shape = res.sys_entityAttributes[feature.rdm.name].find(
                  (shape) => shape.id === polygon.id
                );
                shape.coordinates = [path];
                let updateRes = await entity.update(
                  {
                    appname: feature.relatedInfo.appname,
                    modulename: feature.relatedInfo.modulename,
                    entityname: feature.relatedInfo.entityname,
                    id: dataId,
                  },
                  res
                );
              } else {
                let index = currentData.current.findIndex(
                  (data) => data.id === polygon.id
                );
                let polygonObject = currentData.current[index];
                polygonObject.coordinates = [path];
                callbackValue(currentData.current, props);
              }
            };

            makePolygonEditable(
              polygon,
              editables,
              updatePolygonPath,
              setRelatedModal
            );

            objects.current.push(polygon);

            break;
          case "LineString":
            let polyline = createPolylineFromData(
              object,
              mapControl,
              fieldmeta,
              bounds
            );
            if (feature.related) {
              polyline.related = true;
              polyline.relatedInfo = feature.relatedInfo;
              polyline.dataId = dataId;
            }
            async function updatePolylinePath(forceNoSnap) {
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
                  appname: feature.relatedInfo.appname,
                  modulename: feature.relatedInfo.modulename,
                  entityname: feature.relatedInfo.entityname,
                  id: dataId,
                });
                let shape = res.sys_entityAttributes[feature.rdm.name].find(
                  (shape) => shape.id === polyline.id
                );
                shape.coordinates = path;
                let updateRes = await entity.update(
                  {
                    appname: feature.relatedInfo.appname,
                    modulename: feature.relatedInfo.modulename,
                    entityname: feature.relatedInfo.entityname,
                    id: dataId,
                  },
                  res
                );
              } else {
                let index = currentData.current.findIndex(
                  (data) => data.id === polyline.id
                );
                let polylineObject = currentData.current[index];
                polylineObject.coordinates = path;
                callbackValue(currentData.current, props);
              }
            }

            makePolylineEditable(
              polyline,
              editables,
              updatePolylinePath,
              mapControl,
              setRelatedModal
            );

            objects.current.push(polyline);
            break;

          case "Point":
            if (object.className === "text") {
              let marker = createTextFromData(
                object,
                mapControl,
                fieldmeta,
                bounds
              );
              if (dataId) {
                marker.related = true;
                marker.dataId = dataId;
                marker.relatedInfo = fieldmeta.features[0].relatedInfo;
              }

              marker.addListener("dragend", async () => {
                if (marker.related) {
                  let res = await entity.get({
                    appname: marker.relatedInfo.appname,
                    modulename: marker.relatedInfo.modulename,
                    entityname: marker.relatedInfo.entityname,
                    id: dataId,
                  });
                  let shape = res.sys_entityAttributes[feature.rdm.name].find(
                    (shape) => shape.id === marker.id
                  );
                  shape.coordinates = [
                    marker.getPosition().lng(),
                    marker.getPosition().lat(),
                  ];
                  let updateRes = await entity.update(
                    {
                      appname: feature.relatedInfo.appname,
                      modulename: feature.relatedInfo.modulename,
                      entityname: feature.relatedInfo.entityname,
                      id: dataId,
                    },
                    res
                  );
                } else {
                  let index = currentData.current.findIndex(
                    (datum) => datum.id === marker.id
                  );
                  let textObj = data[index];
                  textObj.coordinates = [
                    marker.getPosition().lng(),
                    marker.getPosition().lat(),
                  ];
                  callbackValue(currentData.current, props);
                }
              });

              marker.addListener("click", () => {
                if (marker.getOpacity() < 1) {
                  marker.setOpacity(1);
                  editables.current = editables.current.filter(
                    (editable) => editable.id !== marker.id
                  );
                } else {
                  marker.setOpacity(0.6);
                  editables.current.push(marker);
                }
              });
            } else {
              let marker = createPointFromData(
                object,
                mapControl,
                fieldmeta,
                bounds
              );
              if (feature.related) {
                marker.related = true;
                marker.relatedInfo = feature.relatedInfo;
                marker.dataId = dataId;
              }
              marker.addListener("dragend", async () => {
                if (feature.related) {
                  let res = await entity.get({
                    appname: feature.relatedInfo.appname,
                    modulename: feature.relatedInfo.modulename,
                    entityname: feature.relatedInfo.entityname,
                    id: dataId,
                  });
                  let shape = res.sys_entityAttributes[feature.rdm.name].find(
                    (shape) => shape.id === marker.id
                  );
                  shape.coordinates = [
                    marker.getPosition().lng(),
                    marker.getPosition().lat(),
                  ];
                  let updateRes = await entity.update(
                    {
                      appname: feature.relatedInfo.appname,
                      modulename: feature.relatedInfo.modulename,
                      entityname: feature.relatedInfo.entityname,
                      id: dataId,
                    },
                    res
                  );
                } else {
                  let index = currentData.current.findIndex(
                    (datum) => datum.id === marker.id
                  );
                  let markerObj = data[index];
                  markerObj.coordinates = [
                    marker.getPosition().lng(),
                    marker.getPosition().lat(),
                  ];
                  callbackValue(currentData.current, props);
                }
              });

              marker.addListener("click", () => {
                if (marker.related) {
                  if (marker.getOpacity() < 1) {
                    marker.setOpacity(1);
                    editables.current = editables.current.filter(
                      (editable) => editable.id !== marker.id
                    );
                  } else
                    setRelatedModal({
                      visible: true,
                      object: marker,
                      isMarker: true,
                    });
                } else if (marker.getOpacity() < 1) {
                  marker.setOpacity(1);
                  editables.current = editables.current.filter(
                    (editable) => editable.id !== marker.id
                  );
                } else {
                  marker.setOpacity(0.6);
                  editables.current.push(marker);
                }
              });
            }
            break;
        }
    });

  if (data && data.length > 0) mapControl.fitBounds(bounds);
};
