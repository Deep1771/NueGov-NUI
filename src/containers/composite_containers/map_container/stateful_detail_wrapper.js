import { useState, useEffect, useRef } from "react";
import React from "react";
import debounce from "lodash/debounce";

import { User } from "utils/services/factory_services/user_service";
import { useStateValue } from "utils/store/contexts";
import {
  entity,
  childEntity,
} from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";

import { DisplayModal, DisplayButton } from "components/display_components";
import {
  ContainerWrapper,
  ContextMenuWrapper,
} from "components/wrapper_components";

import { MapDisplayComponent } from "./map_display_component";
import { MenuBar } from "./components/designer_tools";
import { LegendToggle, ResetFilters } from "./components/summary_map_controls";
import { Legend } from "./components/legend";
import { paintDesignerLayer } from "./map_helpers";
import triggerSearch from "./map_async_layer_fetcher";
import InfoWindow from "./components/infowindow";

export let StatefulDetailWrapper = (props) => {
  let designerMetadata = props.fieldmeta;
  let {
    data: DATA,
    fieldmeta,
    callbackValue,
    callbackError,
    formData,
    stateParams,
  } = props;
  const { appname, modulename, groupname, mode, id, ...rest } = stateParams;
  let routeParams = { appname, modulename, entityname: groupname, mode, id };
  const [{ presetState, moduleState }, dispatch] = useStateValue();
  // const { activePreset, presetTemplates } = presetState;
  const { activeModuleEntities, activeModuleMapLayers } = moduleState;
  const { getMapDefaults } = User();
  let data =
    DATA &&
    Array.isArray(DATA) &&
    DATA.map((ed) => {
      if (["LineString", "Polygon"].includes(ed.type)) ed.className = groupname;
      return ed;
    });

  let [showIW, setShowIW] = useState(false);
  let [iw, setIW] = useState({ iwData: {}, iwMetadata: {}, dataParams: {} });
  let [iwShape, setIWShape] = useState(null);
  let [showLegend, setShowLegend] = useState(false);
  let [open, setOpen] = useState({});
  let [showRelatedModal, setRelatedModal] = useState({
    visible: false,
    object: undefined,
    isMarker: undefined,
  });
  let [mapControl, setMapControl] = useState(null);
  let [error, setError] = useState(
    !!designerMetadata?.required ? "Required" : null
  );

  let [snapThroughPoints, setSnapThroughPoints] = useState(false);
  let snapPoints = useRef([]);
  let [lineThroughMarkers, setLineThroughMarkers] = useState(false);
  let checked = useRef({});
  let templates = useRef([]);
  let currentData = useRef(data instanceof Array ? data : []);
  if (!(data instanceof Array)) data = [];
  let mapControlRef = useRef({});
  let objects = useRef([]);
  let otherObjects = useRef([]);
  let editables = useRef([]);
  let textMode = useRef(false).current;
  let subLayerChecked = useRef({});
  let clusteringChecked = useRef({});
  let relatedDesignerFields = useRef([]).current;
  let fixedShape = useRef(null);

  let setTextMode = (value) => (textMode = value);

  const handleChange = (groupName) => {
    [...objects.current, ...otherObjects.current]
      .filter((object) => {
        return object.className === groupName;
      })
      .map((object) => {
        let subClassName = object.subClassName;
        if (subClassName)
          object.setVisible(
            checked.current[groupName] &&
              subLayerChecked.current[groupName][subClassName]
          );
        else object.setVisible(checked.current[groupName]);
      });
  };

  const handleClusteringChange = () => callTriggerSearch();

  const handleSubChange = (groupName, subLayerName) => {
    [...objects.current, ...otherObjects.current]
      .filter((object) => {
        return (
          object.className === groupName && object.subClassName === subLayerName
        );
      })
      .map((object) => {
        object.setVisible(
          checked.current[groupName] &&
            subLayerChecked.current[groupName][subLayerName]
        );
      });
  };

  let getChecked = () => {
    return checked.current;
  };

  let getClusteringChecked = () => {
    return clusteringChecked.current;
  };

  let getSubLayerChecked = () => {
    return subLayerChecked.current;
  };

  let persistChecked = (value) => {
    checked.current = value;
  };

  let persistClusteringChecked = (value) => {
    clusteringChecked.current = value;
  };

  let persistSubLayerChecked = (value) => {
    subLayerChecked.current = value;
  };

  const toggleLegend = () => {
    setShowLegend(!showLegend);
  };

  const getEditables = () => editables.current;
  const setEditables = (newValue) => {
    editables.current = newValue;
  };

  const setSnappedPointsRef = (point, remove = false) => {
    if (remove) {
      let arr = [...snapPoints.current];
      let filteredArr = arr.filter(
        (ep) => ep.lat() !== point.lat() && ep.lng() !== point.lng()
      );
      snapPoints.current = filteredArr;
    } else {
      snapPoints.current = [...snapPoints.current, point];
    }
  };

  const clearSnappedPoints = () => {
    snapPoints.current = [];
  };

  const getData = () => currentData.current;
  const setData = (newValue) => {
    currentData.current = newValue;
    callbackValue(currentData.current, props);
    checkError("Required");
  };

  const getObjects = () => objects.current;
  const setObjects = (newValue) => {
    objects.current = newValue;
  };

  const getOtherObjects = () => otherObjects.current;
  const setOtherObjects = (newValue) => {
    otherObjects.current = newValue;
  };

  const setDistance = (distance, className) => {
    let newProps = { ...props };
    newProps.fieldmeta = { ...newProps.fieldmeta };
    newProps.fieldmeta.name = props.fieldmeta.features.find(
      (feature) => feature.name === className
    ).bindDistanceTo;
    callbackValue(distance * 3.28084, newProps);
  };

  let dataInit = (value) => {
    currentData.current.push(value);
    callbackValue(currentData.current, props);
    checkError("Required");
  };

  let callTriggerSearch = () => {
    triggerSearch({
      templates,
      mapControl: mapControlRef,
      fixedShape,
      objects: otherObjects,
      routeParams,
      setShowIW,
      setIW,
      setIWShape,
      activePreset: activeModuleEntities,
      checked,
      subLayerChecked,
      clusteringChecked,
      snapThroughPoints,
      setSnapThroughPoints,
      setSnappedPointsRef,
    });
  };

  let addResetFilters = (resetFilterDiv, polygon) => {
    ResetFilters(
      resetFilterDiv,
      fixedShape,
      callTriggerSearch,
      mapControlRef.current,
      polygon
    );
  };

  const nonRelatedEntityTemplates = (templates) => {
    return {
      current: templates.current.filter((template) => {
        let isARelatedLayer = designerMetadata.relatedFeatures
          ? designerMetadata.relatedFeatures.find(
              (rf) =>
                rf.entityName ===
                template.sys_entityAttributes.sys_templateGroupName
                  .sys_groupName
            )
          : false;
        return !isARelatedLayer;
      }),
    };
  };

  const checkError = (errorValue) => {
    if (designerMetadata?.required && currentData?.current?.length == 0) {
      setError(errorValue);
      callbackError(errorValue, props);
    } else {
      setError(null);
      callbackError(null, props);
    }
  };

  useEffect(() => {
    checkError("Required");
  }, []);

  useEffect(() => {
    if (mapControl !== null) {
      mapControlRef.current = mapControl;
      mapControl.addListener(
        "idle",
        debounce(() => {
          dispatch({
            type: "SET_MAP_INTERACTION",
            payload: mapControl.getBounds(),
          });
        }, 1000)
      );
      mapControl.addListener(
        "bounds_changed",
        debounce(() => {
          triggerSearch({
            templates: nonRelatedEntityTemplates(templates),
            mapControl: mapControlRef,
            fixedShape,
            objects: otherObjects,
            routeParams,
            setShowIW,
            setIW,
            setIWShape,
            activePreset: activeModuleEntities,
            checked,
            subLayerChecked,
            clusteringChecked,
            snapThroughPoints,
            setSnapThroughPoints,
            setSnappedPointsRef,
          });
        }, 500)
      );
      const temps = activeModuleMapLayers
        .filter((pT) => {
          let t = pT.templates.find((temp) => temp.baseTemplate);
          let template = t.template;
          if (template.sys_entityAttributes)
            return (
              template.sys_entityAttributes.sys_templateGroupName
                .sys_groupName !== groupname
            );
        })
        .map((pT) => {
          let t = pT.templates.find((temp) => temp.baseTemplate);
          return t.template;
        });
      let geoEntities = temps.filter((et) => {
        if (et.sys_entityAttributes) {
          let index = et.sys_entityAttributes.sys_topLevel.findIndex(
            (field) => {
              return ["DESIGNER", "LATLONG"].includes(field.type);
            }
          );
          return index > -1;
        }
      });

      templates.current = geoEntities;

      geoEntities.map((et) => {
        checked.current[
          et.sys_entityAttributes.sys_templateGroupName.sys_groupName
        ] = false;
        clusteringChecked.current[
          et.sys_entityAttributes.sys_templateGroupName.sys_groupName
        ] = false;
        let layer = et.sys_entityAttributes.sys_topLevel.find((field) =>
          ["LATLONG", "DESIGNER"].includes(field.type)
        );
        let colorCodes = layer.colorCodeBy
          ? et.sys_entityAttributes.sys_entityType == "Approval"
            ? et.sys_entityAttributes.sys_approvals.find(
                (field) => field.name === layer.colorCodeBy
              )
            : et.sys_entityAttributes.sys_topLevel.find(
                (field) => field.name === layer.colorCodeBy
              )
          : null;
        if (colorCodes) {
          subLayerChecked.current[
            et.sys_entityAttributes.sys_templateGroupName.sys_groupName
          ] = {};
          colorCodes.values.map((value) => {
            subLayerChecked.current[
              et.sys_entityAttributes.sys_templateGroupName.sys_groupName
            ][value.value] = false;
          });
        }
      });

      if (templates.current.length > 0) {
        let legentControlElements =
          document.getElementsByClassName("legendcontroldiv");
        if (!legentControlElements?.length) {
          let legendControlDiv = document.createElement("div");
          legendControlDiv.setAttribute("class", "legendcontroldiv");
          legendControlDiv.style.paddingRight = "10px";
          legendControlDiv.style.paddingTop = "10px";
          LegendToggle(legendControlDiv, toggleLegend);
          legendControlDiv.index = 1;
          mapControl.controls[
            window.google.maps.ControlPosition.TOP_RIGHT
          ].push(legendControlDiv);
        }
      }

      let bounds = new window.google.maps.LatLngBounds();
      paintDesignerLayer(
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
        undefined,
        setRelatedModal
      );

      if (fieldmeta.relatedFeatures) {
        fieldmeta.relatedFeatures.map(async (entityInfo) => {
          entityInfo = {
            ...entityInfo,
            modulename: entityInfo.moduleName,
            appname: entityInfo.appName,
            entityname: entityInfo.entityName,
          };
          let relatedMetadata = await entityTemplate.get({
            modulename: entityInfo.modulename,
            appname: entityInfo.appname,
            groupname: entityInfo.entityname,
          });
          let relatedData = await childEntity.get({
            appname,
            modulename,
            entityname: groupname,
            childentity: entityInfo.entityname,
            id,
          });

          let designerField =
            relatedMetadata.sys_entityAttributes.sys_topLevel.find(
              (field) => field.type === "DESIGNER"
            );
          if (designerField) {
            designerField.features = designerField.features.map((feature) => {
              feature.rdm = designerField;
              feature.relatedInfo = {
                appname: entityInfo.appname,
                modulename: entityInfo.modulename,
                entityname: entityInfo.entityname,
                referenceField: entityInfo.referenceField,
              };
              feature.related = true;
              return feature;
            });
            relatedDesignerFields.push(designerField);
            relatedData.map((relatedDataPoint) => {
              let fieldData =
                relatedDataPoint.sys_entityAttributes[designerField.name];
              let dataId = relatedDataPoint._id;
              paintDesignerLayer(
                fieldData,
                designerField,
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
              );
            });
          }
          let latLongField =
            relatedMetadata.sys_entityAttributes.sys_topLevel.find(
              (field) => field.type === "LATLONG"
            );
          if (latLongField) {
            relatedData.map((relatedDataPoint) => {
              let fieldData =
                relatedDataPoint.sys_entityAttributes[latLongField.name];
              if (!fieldData) {
                return;
              }
              let dataId = relatedDataPoint._id;
              let markerOptions = {
                position: new window.google.maps.LatLng({
                  lat: fieldData.coordinates[1],
                  lng: fieldData.coordinates[0],
                }),
                className: relatedDataPoint.sys_groupName,
                map: mapControl,
                draggable: true,
                id: relatedDataPoint._id,
                ...entityInfo,
                dataId,
                related: true,
                relatedInfo: {
                  ...entityInfo,
                },
              };
              markerOptions.icon = {
                ...latLongField.icon,
                scaledSize: new window.google.maps.Size(30, 30),
                labelOrigin: new window.google.maps.Point(30, 30),
              };
              bounds.extend(
                new window.google.maps.LatLng({
                  lat: fieldData.coordinates[1],
                  lng: fieldData.coordinates[0],
                })
              );
              let marker = new window.google.maps.Marker(markerOptions);
              marker.addListener("dragend", async () => {
                let res = await entity.get({ ...entityInfo, id: dataId });
                let point = res.sys_entityAttributes[latLongField.name];
                point.coordinates = [
                  marker.getPosition().lng(),
                  marker.getPosition().lat(),
                ];
                let updateRes = await entity.update(
                  {
                    ...entityInfo,
                    id: dataId,
                  },
                  res
                );
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
              objects.current.push(marker);
            });
          }
          // mapControl.fitBounds(bounds)
        });
      }

      if (
        mapControl.getBounds() !== undefined &&
        mapControl.getBounds() !== null
      ) {
        triggerSearch({
          templates: nonRelatedEntityTemplates(templates),
          mapControl: mapControlRef,
          fixedShape,
          objects: otherObjects,
          routeParams,
          setShowIW,
          setIW,
          setIWShape,
          activePreset: activeModuleEntities,
          checked,
          subLayerChecked,
          clusteringChecked,
          snapThroughPoints,
          setSnapThroughPoints,
          setSnappedPointsRef,
        });
      }
      mapControl.addListener("rightclick", (e) => {
        if (snapPoints.current.length > 1) {
          setLineThroughMarkers(true);
          mapControl.setClickableIcons(true);
        }
      });
    }
  }, [mapControl]);

  useEffect(() => {
    if (mapControl !== null) {
      mapControlRef.current = mapControl;
      window.google.maps.event.clearListeners(mapControl, "bounds_changed");
      mapControl.addListener(
        "bounds_changed",
        debounce(() => {
          triggerSearch({
            templates: nonRelatedEntityTemplates(templates),
            mapControl: mapControlRef,
            fixedShape,
            objects: otherObjects,
            routeParams,
            setShowIW,
            setIW,
            setIWShape,
            activePreset: activeModuleEntities,
            checked,
            subLayerChecked,
            clusteringChecked,
            snapThroughPoints,
            setSnapThroughPoints,
            setSnappedPointsRef,
          });
        }, 500)
      );
    }
  }, [snapThroughPoints]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        border: error ? "3px solid red" : "unset",
        width: "100%",
      }}
    >
      {
        <ContextMenuWrapper
          width="30%"
          onClose={() => {
            setShowLegend(false);
          }}
          title={"Legend"}
          visible={showLegend}
          info="For better experience, we recommend disabling of clustering when you are on a higher zoom level."
        >
          <Legend
            mapControl={mapControlRef}
            assets={templates.current}
            persistChecked={persistChecked}
            persistClusteringChecked={persistClusteringChecked}
            persistSubLayerChecked={persistSubLayerChecked}
            getChecked={getChecked}
            getClusteringChecked={getClusteringChecked}
            getSubLayerChecked={getSubLayerChecked}
            handleChange={handleChange}
            handleClusteringChange={handleClusteringChange}
            handleSubChange={handleSubChange}
            open={open}
            setOpen={setOpen}
          />
        </ContextMenuWrapper>
      }
      {showIW && iw.iwData._id && (
        <InfoWindow
          showIW={showIW}
          setShowIW={setShowIW}
          iw={iw}
          iwShape={iwShape}
          fixedShape={fixedShape}
          mapControl={mapControlRef}
          filters={null}
          addResetFilters={addResetFilters}
          callTriggerSearch={callTriggerSearch}
        />
      )}
      {showRelatedModal.visible && (
        <DisplayModal
          open={showRelatedModal.visible}
          fullWidth={true}
          maxWidth="sm"
        >
          <div
            style={{
              height: "120px",
              width: "95%",
              padding: "8px 8px 8px 8px",
              display: "flex",
              flex: 1,
            }}
          >
            <ContainerWrapper
              style={{ alignSelf: "center", justifyContent: "center" }}
            >
              <DisplayButton
                onClick={async () => {
                  let dataParams = {
                    appname: showRelatedModal.object.relatedInfo.appname,
                    modulename: showRelatedModal.object.relatedInfo.modulename,
                    entityname: showRelatedModal.object.relatedInfo.entityname,
                    id: showRelatedModal.object.dataId,
                  };

                  let metadataParams = {
                    appname: showRelatedModal.object.relatedInfo.appname,
                    modulename: showRelatedModal.object.relatedInfo.modulename,
                    groupname: showRelatedModal.object.relatedInfo.entityname,
                  };
                  let iwData = await entity.get(dataParams);
                  let iwMetadata = await entityTemplate.get(metadataParams);
                  setRelatedModal({ visible: false });
                  setIW({ iwData, iwMetadata, dataParams });
                  setIWShape(null);
                  setShowIW(true);
                }}
              >
                {" "}
                More Details
              </DisplayButton>
              <DisplayButton
                onClick={async () => {
                  if (showRelatedModal.isMarker) {
                    showRelatedModal.object.setOpacity(0.6);
                    editables.current.push(showRelatedModal.object);
                  } else if (!showRelatedModal.object.getEditable()) {
                    showRelatedModal.object.setEditable(true);
                    showRelatedModal.object.setDraggable(true);
                    editables.current.push(showRelatedModal.object);
                  } else {
                    editables.current = editables.current.filter(
                      (editable) => editable.id !== showRelatedModal.object.id
                    );
                    showRelatedModal.object.setEditable(false);
                    showRelatedModal.object.setDraggable(false);
                  }
                  setRelatedModal({ visible: false });
                }}
              >
                {" "}
                Edit
              </DisplayButton>
              <DisplayButton
                onClick={() => {
                  setRelatedModal({ visible: false, polyline: undefined });
                }}
              >
                {" "}
                Cancel
              </DisplayButton>
            </ContainerWrapper>
          </div>
        </DisplayModal>
      )}
      {designerMetadata !== null &&
      mode !== "read" &&
      designerMetadata !== undefined ? (
        <MenuBar
          setSnapThroughPoints={setSnapThroughPoints}
          snapPoints={snapPoints.current}
          lineThroughMarkers={lineThroughMarkers}
          setLineThroughMarkers={setLineThroughMarkers}
          clearSnappedPoints={clearSnappedPoints}
          getOtherObjects={getOtherObjects}
          setOtherObjects={setOtherObjects}
          mapControl={mapControl}
          callbackValue={callbackValue}
          setDistance={setDistance}
          setTextMode={setTextMode}
          dataInit={dataInit}
          getEditables={getEditables}
          setEditables={setEditables}
          setRelatedModal={setRelatedModal}
          getObjects={getObjects}
          setObjects={setObjects}
          getData={getData}
          formData={formData}
          setData={setData}
          designerMetadata={designerMetadata}
          relatedDesignerFields={relatedDesignerFields}
          data={data}
          templates={templates.current}
          style={{
            flex: "2 0 0",
          }}
        />
      ) : null}
      <MapDisplayComponent
        callTriggerSearch={callTriggerSearch}
        addResetFilters={addResetFilters}
        fixedShape={fixedShape}
        toggleLegend={toggleLegend}
        triggerSearch={triggerSearch}
        setMapControl={setMapControl}
        mapDefaults={getMapDefaults()}
        mode={"detail"}
        style={{
          flex: "8 0 0",
          width: "400px",
        }}
      ></MapDisplayComponent>
    </div>
  );
};
