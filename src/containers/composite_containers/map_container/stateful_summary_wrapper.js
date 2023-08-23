import React from "react";
import queryString from "query-string";
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router";
import { useStateValue } from "../../../utils/store/contexts";
import debounce from "lodash/debounce";
import { User } from "utils/services/factory_services/user_service";
import { ContextMenuWrapper } from "components/wrapper_components/context_menu";

import { MapDisplayComponent } from "./map_display_component";
import { Legend } from "./components/legend";
import InfoWindow from "./components/infowindow";
import {
  LegendToggle,
  ResetFilters,
  TrafficLayerToggle,
} from "./components/summary_map_controls";
import triggerSearch from "./map_async_layer_fetcher";
import { isEmpty } from "lodash";

let INTERVAL = null;

export let StatefulSummaryWrapper = ({
  presetTemplates,
  filters,
  noPreset = false,
}) => {
  const { appname, modulename, entityname, mode, id, ...rest } = useParams();
  const routeParams = {
    appname,
    modulename,
    entityname,
    mode,
    id,
  };
  const [{ presetState, configState, moduleState, mapState }, dispatch] =
    useStateValue();
  const { summarySubLayers, summaryLegendState, summaryClustering } =
    configState;
  // const { activePreset } = presetState;
  const { activeModuleEntities } = moduleState;
  const {
    mapFixedShape,
    isGeoFenceApplied,
    mapPolygon,
    mapPreviousView,
    previousEntity,
  } = mapState || {};

  const { getMapDefaults } = User();
  const queryParams = queryString.parse(useLocation().search);
  const { page, drawer, ...restParams } = queryParams;

  let [mapControlState, setMapControl] = useState(null);
  let [showIW, setShowIW] = useState(false);
  let [showLegend, setShowLegend] = useState(false);
  let [iw, setIW] = useState({ iwData: {}, iwMetadata: {}, dataParams: {} });
  let [iwShape, setIWShape] = useState(null);
  let [open, setOpen] = useState({});

  let mapActiveModuleEntities = useRef();
  let activeEntityName = useRef();
  mapActiveModuleEntities.current = activeModuleEntities;
  activeEntityName.current = entityname;

  let mapControl = useRef(null);
  let drawingManager = useRef(null);
  let templates = useRef([]);
  let fixedShape = useRef(null);
  let objects = useRef([]);
  let subLayerChecked = useRef(summarySubLayers);
  let trafficLayer = useRef(
    new window.google.maps.TrafficLayer({ map: null })
  ).current;
  let currentFilters = useRef({});
  currentFilters.current = filters || {};
  let globalSearchRef = useRef(null).current;
  let checked = useRef(summaryLegendState);
  let clusteringChecked = useRef(summaryClustering);
  let refreshTime = useRef(null);
  let mapLoaded = false;

  let getMapData = (data, type, params) => {
    if (type === "geoFence") {
      let { entityname = "" } = params || {};
      if (entityname === activeEntityName.current)
        dispatch({
          type: "INIT_MAP_CONTAINER",
          payload: {
            summaryData: data,
            type: type,
            isGeoFenceApplied: true,
            mapParams: params,
            mapFixedShape: fixedShape.current,
            previousEntity: activeEntityName.current,
          },
        });
    } else {
      dispatch({
        type: "INIT_MAP_CONTAINER",
        payload: {
          summaryData: [],
          type: type,
          isGeoFenceApplied: false,
          mapParams: params,
          mapFixedShape: null,
          mapPolygon: null,
          mapPreviousView: {},
          previousEntity: "",
        },
      });
    }
  };

  let addResetFilters = (resetFilterDiv, polygon, previousView, type) => {
    dispatch({
      type: "INIT_MAP_CONTAINER",
      payload: {
        mapPolygon: polygon,
        mapPreviousView: previousView,
      },
    });
    ResetFilters(
      resetFilterDiv,
      fixedShape,
      () => {
        triggerSearch({
          templates: templates,
          mapControl,
          fixedShape,
          objects,
          routeParams,
          globalSearchRef,
          filters: currentFilters.current,
          setShowIW,
          setIW,
          setIWShape,
          activePreset: mapActiveModuleEntities.current,
          noPreset,
          checked,
          subLayerChecked,
          clusteringChecked,
          getMapData,
          type,
        });
      },
      mapControl.current,
      polygon,
      previousView
    );
  };

  let callTriggerSearch = (type) => {
    globalSearchRef = currentFilters.current;
    triggerSearch({
      templates: templates,
      mapControl,
      fixedShape,
      objects,
      routeParams,
      globalSearchRef,
      filters: currentFilters.current,
      setShowIW,
      setIW,
      setIWShape,
      activePreset: mapActiveModuleEntities.current,
      noPreset,
      checked,
      subLayerChecked,
      clusteringChecked,
      getMapData,
      type,
    });
  };

  let setUpMovableAssets = () => {
    clearInterval(INTERVAL);
    let movableAssets = templates.current.filter((template) => {
      let { sys_entityProperties } = template.sys_entityAttributes;
      return sys_entityProperties && sys_entityProperties.includes("Movable");
    });
    if (movableAssets && movableAssets.length) {
      let intervals = movableAssets.map((template) => {
        let { sys_map_refreshInterval } = template;
        return sys_map_refreshInterval || 15000;
      });
      let minInterval = Math.min(...intervals);
      INTERVAL = setInterval(() => {
        triggerSearch({
          templates: templates,
          mapControl,
          fixedShape,
          objects,
          routeParams,
          globalSearchRef,
          filters: currentFilters.current,
          setShowIW,
          setIW,
          setIWShape,
          activePreset: mapActiveModuleEntities.current,
          noPreset,
          checked,
          subLayerChecked,
          clusteringChecked,
          getMapData,
        });

        if (refreshTime.current) {
          refreshTime.current.style.display = "block";
          refreshTime.current.innerHTML = `Last refreshed: ${new Date().toLocaleTimeString()}`;
        }
      }, minInterval);
    }
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
    // setTimeout(() => {
    //   dispatch({
    //     type: "SET_SUMMARY_LEGEND",
    //     payload: value,
    //   });
    // }, 0);
    setShowLegend(true);
  };

  let persistClusteringChecked = (value) => {
    clusteringChecked.current = value;
    // setTimeout(() => {
    //   dispatch({
    //     type: "SET_SUMMARY_CLUSTERING",
    //     payload: value,
    //   });
    // }, 0);
  };

  let persistSubLayerChecked = (value) => {
    subLayerChecked.current = value;
    // setTimeout(() => {
    //   dispatch({
    //     type: "SET_SUMMARY_SUBLAYERS",
    //     payload: value,
    //   });
    // }, 0);
  };

  let mapEvents = {
    bounds_changed: debounce(() => {
      mapLoaded &&
        triggerSearch({
          templates: templates,
          mapControl,
          fixedShape,
          objects,
          routeParams,
          globalSearchRef,
          filters: currentFilters.current,
          setShowIW,
          setIW,
          setIWShape,
          activePreset: mapActiveModuleEntities.current,
          noPreset,
          checked,
          subLayerChecked,
          clusteringChecked,
          getMapData,
        });
    }, 500),
    idle: debounce(() => {
      mapLoaded &&
        dispatch({
          type: "SET_SUMMARY_MAP_POSITION",
          payload: mapControl.current.getBounds(),
        });
    }, 1000),
  };

  const toggleLegend = () => {
    setShowLegend(!showLegend);
  };

  const toggleTrafficLayer = () => {
    if (trafficLayer.getMap() === null) {
      trafficLayer.setMap(mapControl.current);
      let legend = document.createElement("div");
      legend.style.boxShadow = "0 0 112px 5px #1DB9E8";
      legend.style.border = "3px";
      legend.style.padding = "9px";
      legend.id = "legend";
      let content = [];
      let legendColor =
        '<ul style="padding-left: 9px;list-style: none; font-size: 20px;" >' +
        '<li><span style="background-color: #30ac3e">&nbsp;&nbsp;</span><span> &gt; 49 mile per hour</span></li><br>' +
        '<li><span style="background-color: #ffcf00">&nbsp;&nbsp;</span><span> 24 - 49 mile per hour</span></li><br>' +
        '<li><span style="background-color: #ff0000">&nbsp;&nbsp;</span><span> &lt; 24 mile per hour</span></li><br>' +
        '<li><span style="background-color: #c0c0c0">&nbsp;&nbsp;</span><span> No data available</span></li>' +
        "</ul>";
      content.push(legendColor);
      legend.innerHTML = content.join("");
      legend.index = 1;
      mapControl.current.controls[
        window.google.maps.ControlPosition.LEFT_BOTTOM
      ].push(legend);
    } else {
      trafficLayer.setMap(null);
      mapControl.current.controls[
        window.google.maps.ControlPosition.LEFT_BOTTOM
      ].pop();
    }
  };

  const handleClusteringChange = () => callTriggerSearch();

  const handleChange = (groupName) => {
    objects.current
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

  const handleSubChange = (groupName, subLayerName) => {
    objects.current
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

  const resetMapView = () => {
    if (mapPolygon) {
      fixedShape.current = null;
      let buttonIndex;
      if (mapControlState)
        mapControlState.controls[
          window.google.maps.ControlPosition.TOP_RIGHT
        ].forEach((button, index) => {
          if (button.id === "reset-filter") {
            buttonIndex = index;
          }
        });
      mapControlState.controls[
        window.google.maps.ControlPosition.TOP_RIGHT
      ].removeAt(buttonIndex);
      dispatch({
        type: "INIT_MAP_CONTAINER",
        payload: {
          summaryData: [],
          type: "",
          isGeoFenceApplied: false,
          mapParams: {},
          mapFixedShape: null,
          mapPolygon: null,
          mapPreviousView: {},
          previousEntity: "",
        },
      });
      mapControlState.setCenter(mapPreviousView.previousLatLong);
      mapControlState.setZoom(mapPreviousView.previousZoom);

      if (mapPolygon) {
        mapPolygon.setMap(null);
        if (document.getElementById("drawpolygon"))
          document.getElementById("drawpolygon").style.display = "block";
      }
    }
  };

  const handleViewChange = () => {
    let coordinates = mapFixedShape;
    coordinates = coordinates?.map((eachCoordinate) => {
      return { lat: eachCoordinate[1], lng: eachCoordinate[0] };
    });
    let bounds = new window.google.maps.LatLngBounds();
    let path = mapPolygon.getPath().getArray();
    path = path.map((point) => {
      bounds.extend(point);
      return [point.lng(), point.lat()];
    });
    if (
      path[0][0] !== path[path.length - 1][0] ||
      path[0][1] !== path[path.length - 1][1]
    ) {
      path.push(path[0]);
    }
    let polygon = new window.google.maps.Polygon({
      strokeColor: "#000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#000",
      fillOpacity: 0.35,
      map: mapControl.current,
    });
    fixedShape.current = path;
    mapControl.current.fitBounds(bounds);
    polygon.setPath(coordinates);
    let resetFilterDiv = document.createElement("div");
    resetFilterDiv.style.paddingRight = "10px";
    resetFilterDiv.style.paddingTop = "10px";
    addResetFilters(resetFilterDiv, polygon, mapPreviousView, "reset");
    resetFilterDiv.index = 4;
    mapControl.current.controls[
      window.google.maps.ControlPosition.TOP_RIGHT
    ].push(resetFilterDiv);
    triggerSearch({
      templates: templates,
      mapControl,
      fixedShape,
      objects,
      routeParams,
      globalSearchRef,
      filters: currentFilters.current,
      setShowIW,
      setIW,
      setIWShape,
      activePreset: mapActiveModuleEntities.current,
      noPreset,
      checked,
      subLayerChecked,
      clusteringChecked,
      getMapData,
      type: "geoFence",
      isGeoFenceApplied,
    });
  };

  useEffect(() => {
    setUpMovableAssets();
  }, [JSON.stringify(restParams)]);

  useEffect(() => {
    if (isGeoFenceApplied && previousEntity !== entityname) {
      resetMapView();
    }
    let matchedEntity =
      presetTemplates?.find(
        (eachPreset) => eachPreset?.groupName === entityname
      ) || {};
    if (
      ![null, undefined]?.includes(presetTemplates) &&
      !isEmpty(matchedEntity)
    ) {
      mapLoaded = false;
      let temps;
      if (noPreset) {
        temps = presetTemplates;
      } else {
        temps = presetTemplates.map((pT) => {
          let t = pT.templates.find((temp) => temp.baseTemplate);
          return t?.template ? t.template : {};
        });
      }

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
      setTimeout(async () => {
        await triggerSearch({
          templates: templates,
          mapControl,
          fixedShape,
          objects,
          routeParams,
          globalSearchRef,
          filters: currentFilters.current,
          setShowIW,
          setIW,
          setIWShape,
          activePreset: mapActiveModuleEntities.current,
          noPreset,
          checked,
          subLayerChecked,
          clusteringChecked,
          getMapData,
        });
        mapLoaded = true;
      }, 1000);
      setUpMovableAssets();
      // if (JSON.stringify(checked.current) === "{}") {
      let currentEntity = geoEntities.find(
        (et) =>
          et.sys_entityAttributes.sys_templateGroupName.sys_groupName ===
          entityname
      );
      let defaultModuleMapLayers = geoEntities.filter(
        (et) => et.sys_entityAttributes.defaultMap == true
      );
      defaultModuleMapLayers = currentEntity
        ? [...defaultModuleMapLayers, currentEntity]
        : [...defaultModuleMapLayers];
      if (defaultModuleMapLayers?.length) {
        defaultModuleMapLayers.map((e) => {
          checked.current = {
            [e.sys_entityAttributes.sys_templateGroupName.sys_groupName]: true,
          };
        });
      } else checked.current = {};
      // }
      geoEntities.map((et, index) => {
        clusteringChecked.current[
          et.sys_entityAttributes.sys_templateGroupName.sys_groupName
        ] = true;
      });

      if (JSON.stringify(subLayerChecked.current === "{}")) {
        geoEntities.map((et) => {
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
              ][value.value] = true;
            });
          }
        });
      }
    }
  }, [entityname, presetTemplates]);

  useEffect(() => {
    globalSearchRef = currentFilters.current || {};
    if (mapControlState !== null) {
      let matchedEntity =
        templates?.current?.find((eachTemplate) => {
          let { sys_templateGroupName: { sys_groupName = "" } = {} } =
            eachTemplate?.sys_entityAttributes || {};
          if (sys_groupName === entityname) return true;
        }) || {};
      if (!isEmpty(matchedEntity)) {
        // if (window.google.maps.event.hasListeners(mapControlState, "bounds_changed"))
        //   window.google.maps.event.clearListeners(
        //     mapControlState,
        //     "bounds_changed"
        //   );

        // mapControlState.addListener(
        //   "bounds_changed",
        //   debounce(() => {
        //     triggerSearch({
        //       templates: templates,
        //       mapControl,
        //       fixedShape,
        //       objects,
        //       routeParams,
        //       globalSearchRef,
        //       filters: currentFilters.current,
        //       setShowIW,
        //       setIW,
        //       setIWShape,
        //       activePreset: mapActiveModuleEntities.current,
        //       noPreset,
        //       checked,
        //       subLayerChecked,
        //       clusteringChecked,
        //       getMapData,
        //     });
        //   }, 500)
        // );
        if (
          mapControlState.getBounds() !== undefined &&
          mapControlState.getBounds() !== null
        ) {
          triggerSearch({
            templates: templates,
            mapControl,
            fixedShape,
            objects,
            routeParams,
            globalSearchRef,
            filters: currentFilters.current,
            setShowIW,
            setIW,
            setIWShape,
            activePreset: mapActiveModuleEntities.current,
            noPreset,
            checked,
            subLayerChecked,
            clusteringChecked,
            getMapData,
          });
        }
      }
    }
  }, [checked.current, activeModuleEntities, JSON.stringify(filters)]);

  useEffect(() => {
    if (mapControlState !== null) {
      dispatch({
        type: "SET_MAP",
        payload: mapControlState,
      });
      // if (templates.current.length > 0) {
      try {
        let legendControlDiv = document.createElement("div");
        legendControlDiv.style.paddingRight = "10px";
        legendControlDiv.style.paddingTop = "10px";
        LegendToggle(legendControlDiv, toggleLegend);
        legendControlDiv.index = 1;
        mapControlState.controls[
          window.google.maps.ControlPosition.TOP_RIGHT
        ].push(legendControlDiv);
      } catch (e) {}
      // }

      let trafficLayerDiv = document.createElement("div");
      trafficLayerDiv.style.paddingRight = "10px";
      trafficLayerDiv.style.paddingTop = "10px";
      TrafficLayerToggle(trafficLayerDiv, toggleTrafficLayer);
      trafficLayerDiv.index = 1;
      mapControlState.controls[
        window.google.maps.ControlPosition.RIGHT_BOTTOM
      ].push(trafficLayerDiv);
    }
  }, [mapControlState]);

  useEffect(() => {
    if (isGeoFenceApplied && entityname === previousEntity) {
      handleViewChange();
    }
    return () => {
      clearInterval(INTERVAL);
    };
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        position: "relative",
      }}
    >
      <div
        ref={refreshTime}
        style={{
          position: "absolute",
          right: 75,
          bottom: 30,
          zIndex: 99,
          display: "none",
          backgroundColor: "white",
          padding: "5px",
        }}
      />

      <MapDisplayComponent
        callTriggerSearch={callTriggerSearch}
        addResetFilters={addResetFilters}
        fixedShape={fixedShape}
        setMapControl={setMapControl}
        mapControl={mapControl}
        mapEvents={mapEvents}
        drawingManager={drawingManager}
        initialBounds={configState.summaryMapPosition}
        mapDefaults={getMapDefaults()}
        mode={"summary"}
        geoFenceApplied={isGeoFenceApplied}
        style={{
          flex: 8,
          display: "flex",
        }}
      ></MapDisplayComponent>
      {
        <ContextMenuWrapper
          width="32%"
          onClose={() => {
            setShowLegend(false);
          }}
          title={"Legend"}
          visible={showLegend}
          info="For better experience, we recommend disabling of clustering when you are on a higher zoom level."
        >
          <Legend
            mapControl={mapControl}
            assets={templates.current}
            persistClusteringChecked={persistClusteringChecked}
            persistChecked={persistChecked}
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
          mapControl={mapControl}
          filters={restParams}
          addResetFilters={addResetFilters}
          callTriggerSearch={callTriggerSearch}
        />
      )}
    </div>
  );
};
