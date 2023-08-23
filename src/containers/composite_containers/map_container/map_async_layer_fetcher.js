import React from "react";
import { entity } from "utils/services/api_services/entity_service";
import { clusterer } from "utils/services/api_services/cluster_service";
import { get } from "utils/services/helper_services/object_methods";
import * as parsers from "./map_parsers";
import { isEmpty } from "lodash";

export const getAppModuleName = (
  entityName,
  activePreset,
  noPreset,
  firstTemplate
) => {
  let entityInfo = {};

  // handled in such a way, if preset is there(nuegov), fetch template from that preset
  //or if not, fetch the template of selected entity and print the data
  if (noPreset) {
    let sys_templateName =
      firstTemplate?.sys_entityAttributes?.sys_templateName;

    let sys_groupName =
      firstTemplate?.sys_entityAttributes?.sys_templateGroupName?.sys_groupName;

    let permissionTree = JSON.parse(sessionStorage.getItem("permissionTree"));

    //to fetch the app,module & groupname from template name...
    if (sys_groupName === "User") {
      entityInfo["appName"] = "NueGov";
      entityInfo["moduleName"] = "Admin";
      entityInfo["groupName"] = sys_groupName;
      entityInfo["templateName"] = sys_templateName;
    } else {
      let tempObj = permissionTree?.apps?.find((eachApp) => {
        let module = eachApp?.modules?.find((eachModule) => {
          let entity = eachModule?.entities?.find((eachEntity) => {
            if (eachEntity.name === sys_templateName) {
              entityInfo["appName"] = eachApp.name;
              entityInfo["moduleName"] = eachModule.name;
              entityInfo["groupName"] = eachEntity.groupName;
              return true;
            } else return false;
          });
          return entity;
        });
        return module;
      });
    }

    // getAppModuleFromTemplate(sys_templateName);
    // entityInfo = {
    //   appName: "NueAssist",
    //   moduleName: "Community",
    //   groupName: "Lead",
    // };
  } else {
    // entityInfo = activePreset.sys_entityAttributes.selectedEntities.find(
    //   (entity) => entity.groupName === entityName
    // );
    entityInfo = activePreset.find((entity) => entity.groupName === entityName);
  }
  return entityInfo;
};

const getBBox = (mapControl) => {
  if (mapControl !== null) {
    let bounds = mapControl.current.getBounds();
    if (bounds) {
      let ne = bounds.getNorthEast();
      let sw = bounds.getSouthWest();
      let bbox = [sw.lng(), sw.lat(), ne.lng(), ne.lat()];
      return bbox;
    }
  }
};

const getBBoxAsFence = (mapControl) => {
  let bounds = mapControl.current.getBounds();
  if (bounds) {
    let ne = bounds.getNorthEast();
    let sw = bounds.getSouthWest();
    let bbox = [sw.lng(), sw.lat(), ne.lng(), ne.lat()];
    let SW = [sw.lng(), sw.lat()];
    let NE = [ne.lng(), ne.lat()];
    var NW = [SW[0], NE[1]];
    var SE = [NE[0], SW[1]];
    let fence = [NE, SE, SW, NW, NE];
    return fence;
  }
};

const fetchLatlongs = async (
  firstTemplate,
  metadata,
  bbox,
  zoom,
  fence,
  mapControl,
  routeParams,
  globalSearchRef,
  filters,
  setShowIW,
  setIW,
  setIWShape,
  activePreset,
  noPreset,
  checked,
  subLayerChecked,
  clusteringEnabled,
  snapThroughPoints,
  setSnapThroughPoints,
  setSnappedPointsRef,
  getMapData,
  type
) => {
  const ARCHIVE = sessionStorage.getItem("archiveMode");
  const { appname, modulename, entityname, mode, id } = routeParams;
  let layer = metadata.sys_entityAttributes.sys_topLevel.find((field) =>
    ["DESIGNER", "LATLONG"].includes(field.type)
  );

  let colorCodes, labelField;
  let displayFields = ["geoJSONLatLong"];
  if (layer.type === "LATLONG") labelField = layer?.icon?.label;
  if (labelField) displayFields.push(labelField);
  let entityInfo = getAppModuleName(
    metadata.sys_entityAttributes.sys_templateGroupName.sys_groupName,
    activePreset,
    noPreset,
    firstTemplate
  );

  try {
    let params = {
      appname: entityInfo.appName,
      modulename: entityInfo.moduleName,
      entityname: entityInfo.groupName,
    };
    if (entityInfo?.templateName) {
      params = { ...params, PAGELAYOUT: entityInfo?.templateName };
    }
    if (layer.colorCodeBy) {
      if (!Array.isArray(layer.colorCodeBy)) {
        colorCodes = metadata.sys_entityAttributes.sys_topLevel.find(
          (field) => field.name === layer.colorCodeBy
        );
        displayFields.push(colorCodes.name);
      } else {
        colorCodes = layer?.colorCodeBy?.reduce((arr, field) => {
          let code = metadata.sys_entityAttributes.sys_topLevel.find(
            (fieldMeta) => fieldMeta.name === field
          );
          if (code) arr.push(code);
          return arr;
        }, []);
        let codeNames = colorCodes.map((e) => e.name);
        displayFields = [...displayFields, ...codeNames];
      }
    }
    params.displayFields = displayFields.join(",");
    if (fence !== undefined && fence !== null)
      params["fence"] = JSON.stringify([fence]);
    if (
      ![null, undefined].includes(globalSearchRef) &&
      entityname ===
        metadata.sys_entityAttributes.sys_templateGroupName.sys_groupName
    ) {
      let searchValue;
      if (globalSearchRef.globalsearch) {
        if (globalSearchRef.globalsearch.charAt(0) === " ")
          searchValue = globalSearchRef.globalsearch.substring(
            1,
            globalSearchRef.globalsearch.length
          );
        else searchValue = globalSearchRef.globalsearch;
        params.globalsearch = searchValue;
      } else {
        params = { ...params, ...(filters ? filters : {}) };
      }
    }

    if (clusteringEnabled) {
      params = {
        ...params,
        bbox: encodeURIComponent(JSON.stringify(bbox)),
        zoom,
      };
    } else {
      let geoFenceSearch = [
        {
          type: "polygon",
          coords: bbox,
        },
      ];
      params = {
        ...params,
        geoFenceSearch: JSON.stringify(geoFenceSearch),
        skip: 0,
        limit: 1000000,
      };
    }

    if (ARCHIVE === "Archive") {
      params = {
        ...params,
        archiveMode: ARCHIVE,
      };
    }
    let res = await (clusteringEnabled
      ? clusterer.get(params)
      : entity.get(params));

    if (["geoFence", "reset"]?.includes(type)) {
      let resultData = res;
      let mapParams = params;
      if (clusteringEnabled) {
        let fenceData =
          params?.fence?.length > 0 ? JSON.parse(params?.fence) : [];
        fenceData = fenceData?.find((e) => e);
        let geoFenceSearch = [
          {
            type: "polygon",
            coords: fenceData,
          },
        ];
        mapParams = {
          appname: params?.appname,
          modulename: params?.modulename,
          entityname: params?.entityname,
          geoFenceSearch: JSON.stringify(geoFenceSearch),
          skip: 0,
          limit: 1000000,
        };
        resultData = await entity.get(mapParams);
      }
      getMapData(resultData, type, mapParams);
    }

    let mapObjects = parsers.latlongParser(
      res,
      metadata,
      layer,
      mapControl.current,
      setShowIW,
      setIW,
      setIWShape,
      activePreset,
      checked.current[entityInfo.groupName],
      colorCodes,
      subLayerChecked.current[entityInfo.groupName],
      clusteringEnabled,
      snapThroughPoints,
      setSnapThroughPoints,
      setSnappedPointsRef
    );
    return mapObjects;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const fetchDesignerElements = async (
  firstTemplate,
  metadata,
  fence,
  mapControl,
  routeParams,
  globalSearchRef,
  filters,
  fixedShape,
  setShowIW,
  setIW,
  setIWShape,
  activePreset,
  noPreset,
  checked,
  subLayerChecked,
  triggerSearch,
  getMapData,
  type
) => {
  const ARCHIVE = sessionStorage.getItem("archiveMode");
  const { appname, modulename, entityname, mode, id } = routeParams;
  let colorCodes;
  let entityInfo = getAppModuleName(
    metadata.sys_entityAttributes.sys_templateGroupName.sys_groupName,
    activePreset,
    noPreset,
    firstTemplate
  );
  let layer = metadata.sys_entityAttributes.sys_topLevel.find((field) =>
    ["DESIGNER", "LATLONG"].includes(field.type)
  );
  if (layer.colorCodeBy) {
    colorCodes =
      metadata.sys_entityAttributes.sys_entityType == "Approval"
        ? metadata.sys_entityAttributes.sys_approvals.find(
            (e) => e.name == layer.colorCodeBy
          )
        : metadata.sys_entityAttributes.sys_topLevel.find(
            (field) => field.name === layer.colorCodeBy
          );
  }
  try {
    let params = {
      appname: entityInfo.appName,
      modulename: entityInfo.moduleName,
      entityname: entityInfo.groupName,
      limit: 1000,
      skip: 0,
    };

    let geoFenceSearch = [
      {
        type: "polygon",
        coords: fence,
      },
    ];
    params.geoFenceSearch = JSON.stringify(geoFenceSearch);
    if (
      globalSearchRef &&
      entityname ===
        metadata.sys_entityAttributes.sys_templateGroupName.sys_groupName
    ) {
      let searchValue;
      if (globalSearchRef.globalsearch) {
        if (globalSearchRef.globalsearch.charAt(0) === " ")
          searchValue = globalSearchRef.globalsearch.substring(
            1,
            globalSearchRef.globalsearch.length
          );
        else searchValue = globalSearchRef.globalsearch;
        params.globalsearch = searchValue;
      } else {
        params = { ...params, ...(filters ? filters : {}) };
      }
    }

    if (ARCHIVE === "Archive") {
      params = {
        ...params,
        archiveMode: ARCHIVE,
      };
    }

    let res = await entity.get(params);

    if (["geoFence", "reset"]?.includes(type)) getMapData(res, type, params);

    let mapObjects = parsers.designerParser(
      res,
      metadata,
      layer,
      mapControl.current,
      triggerSearch,
      fixedShape,
      setShowIW,
      setIW,
      setIWShape,
      activePreset,
      checked.current[entityInfo.groupName],
      colorCodes,
      subLayerChecked.current[entityInfo.groupName]
    );
    return mapObjects;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const triggerSearch = async ({
  templates,
  mapControl,
  fixedShape,
  objects,
  routeParams,
  globalSearchRef = null,
  filters = null,
  setShowIW,
  setIW,
  setIWShape,
  activePreset,
  noPreset = false,
  checked,
  subLayerChecked,
  clusteringChecked,
  snapThroughPoints,
  setSnapThroughPoints,
  setSnappedPointsRef,
  getMapData,
  type = "",
  isGeoFenceApplied = false,
}) => {
  let bbox = getBBox(mapControl);
  let bboxAsFence = getBBoxAsFence(mapControl);
  let newData = [];
  if (checked.current && Object.keys(checked.current).length) {
    let checkedEntities = Object.keys(checked.current);
    let layers = checkedEntities
      ?.reduce((a, c) => {
        let temp = templates.current.filter(
          (e) => e.sys_entityAttributes.sys_templateGroupName.sys_groupName == c
        );
        a.push(temp[0]);
        return a;
      }, [])
      ?.filter((e) => e);
    let layerPromises = layers.map(async (template) => {
      let modifiedTemplate = JSON.parse(JSON.stringify(template));
      modifiedTemplate.sys_entityAttributes.sys_topLevel =
        modifiedTemplate.sys_entityAttributes.sys_topLevel.reduce(
          (acc, curr) => {
            if (!acc.length) acc.push(curr);
            else {
              if (curr.type === "LIST") {
                let checkForDuplicate = acc.findIndex(
                  (e) => e.name === curr.name
                );
                if (checkForDuplicate != -1)
                  acc[checkForDuplicate] = {
                    ...acc[checkForDuplicate],
                    ...(acc[checkForDuplicate]?.values && {
                      values: [
                        ...acc[checkForDuplicate].values,
                        ...curr.values,
                      ],
                    }),
                  };
              }
              let checkForDuplicate = acc.find((e) => e.name === curr.name);
              if (!checkForDuplicate) acc.push(curr);
            }
            return acc;
          },
          []
        );
      let layerData;
      let layer = modifiedTemplate.sys_entityAttributes.sys_topLevel.find(
        (field) => ["DESIGNER", "LATLONG"].includes(field.type)
      );
      let entityInfo = getAppModuleName(
        modifiedTemplate.sys_entityAttributes.sys_templateGroupName
          .sys_groupName,
        activePreset,
        noPreset,
        templates.current[0]
      );
      let zoom = mapControl.current.getZoom();

      let clusteringEnabled =
        modifiedTemplate.sys_entityAttributes.hasOwnProperty("enableCluster")
          ? modifiedTemplate.sys_entityAttributes.enableCluster
          : (clusteringChecked.current &&
              clusteringChecked.current[entityInfo?.groupName]) ||
            zoom < 14;

      if ((bbox || isGeoFenceApplied) && !isEmpty(entityInfo)) {
        switch (layer.type) {
          case "LATLONG":
            layerData = await fetchLatlongs(
              templates.current[0],
              modifiedTemplate,
              clusteringEnabled
                ? bbox
                : fixedShape.current !== null
                ? fixedShape.current
                : bboxAsFence,
              zoom,
              fixedShape.current,
              mapControl,
              routeParams,
              globalSearchRef,
              filters,
              setShowIW,
              setIW,
              setIWShape,
              activePreset,
              noPreset,
              checked,
              subLayerChecked,
              clusteringEnabled,
              snapThroughPoints,
              setSnapThroughPoints,
              setSnappedPointsRef,
              getMapData,
              type
            );
            newData = [...newData, ...layerData];
            break;
          case "DESIGNER":
            layerData = await fetchDesignerElements(
              templates.current[0],
              modifiedTemplate,
              fixedShape.current !== null ? fixedShape.current : bboxAsFence,
              mapControl,
              routeParams,
              globalSearchRef,
              filters,
              fixedShape,
              setShowIW,
              setIW,
              setIWShape,
              activePreset,
              noPreset,
              checked,
              subLayerChecked,
              triggerSearch,
              getMapData,
              type
            );
            newData = [...newData, ...layerData];
            break;
        }
        return Promise.resolve();
      }
    });

    await Promise.all(layerPromises);
    if (!isEmpty(filters) || newData?.length > 0) {
      objects.current.map((object) => {
        let objectExistsInNew =
          newData.findIndex((newObject) => newObject?.id === object?.id) > -1;
        if (!objectExistsInNew) object.setMap(null);
      });

      newData.map((newObject) => {
        let oldObject = objects.current.find(
          (obj) =>
            newObject?.id === obj?.id && newObject.className === obj.className
        );
        if (!oldObject && newObject) {
          newObject.setMap(mapControl.current);
          objects.current.push(newObject);
        } else if (oldObject && newObject) {
          let { datum: old_data } = oldObject;
          let { datum: new_data } = newObject;
          if (old_data && new_data) {
            let oldCoords = get(old_data, "geometry.coordinates");
            let newCoords = get(new_data, "geometry.coordinates");
            if (
              oldCoords &&
              newCoords &&
              oldCoords.toString() !== newCoords.toString()
            ) {
              oldObject.setMap(null);
              newObject.setMap(mapControl.current);
              objects.current.push(newObject);
            }
          }
        }
      });

      objects.current = objects.current.filter(
        (object) => object.getMap() !== null
      );
    }
    return true;
  }
};

export default triggerSearch;
