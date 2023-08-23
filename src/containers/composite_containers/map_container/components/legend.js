import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import {
  DisplayCheckbox,
  DisplayCollapse,
  DisplayIconButton,
  DisplaySwitch,
  DisplayText,
} from "components/display_components";
import { ToolTipWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import { getEntityIcon } from "utils/services/helper_services/system_methods";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    paddingTop: "0px",
  },
  nested: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(2),
  },
}));

export function Legend(props) {
  const classes = useStyles();
  let {
    handleChange,
    handleClusteringChange,
    handleSubChange,
    getChecked,
    getClusteringChecked,
    getSubLayerChecked,
    persistChecked,
    persistClusteringChecked,
    persistSubLayerChecked,
    assets,
    open,
    setOpen,
    mapControl,
  } = props;
  let [checked, setChecked] = useState(getChecked());
  let [clusteringChecked, setClusteringChecked] = useState(
    getClusteringChecked()
  );
  let [subLayerChecked, setSubLayerChecked] = useState(getSubLayerChecked());
  let { ExpandLess, ExpandMore, FiberManual } = SystemIcons;
  let showCluster = assets.some((asset) =>
    asset.sys_entityAttributes.sys_topLevel.find((field) =>
      ["LATLONG"].includes(field.type)
    )
  );
  let zoom = mapControl.current.getZoom();

  const toggleExpand = (sys_groupName) => {
    let newOpen = { ...open };
    newOpen[sys_groupName] = !newOpen[sys_groupName];
    setOpen(newOpen);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          backgroundColor: "white",
          padding: "5px 15px",
        }}
      >
        <div style={{ flex: 6 }}>
          <DisplayText>
            {assets?.length
              ? "Layers"
              : "No layers available in current module"}
          </DisplayText>
        </div>
        <div style={{ flex: 5, display: "flex", justifyContent: "center" }}>
          <DisplayText>{showCluster ? "Cluster" : ""}</DisplayText>
        </div>
      </div>
      <List className={classes.root}>
        {assets.map((asset, index) => {
          let layer = asset.sys_entityAttributes.sys_topLevel.find((field) =>
            ["LATLONG", "DESIGNER"].includes(field.type)
          );
          // let colorCodes = layer.colorCodeBy
          //   ? asset.sys_entityAttributes.sys_topLevel.find(
          //     (field) => field.name === layer.colorCodeBy
          //   )
          //   : asset.sys_entityAttributes.sys_entityType == "Approval" ?
          //     asset.sys_entityAttributes.sys_approvals.find((field) => field.name === layer.colorCodeBy) : null;
          let colorCodes = layer.colorCodeBy
            ? asset.sys_entityAttributes.sys_entityType == "Approval"
              ? asset.sys_entityAttributes.sys_approvals.find(
                  (field) => field.name === layer.colorCodeBy
                )
              : asset.sys_entityAttributes.sys_topLevel.find(
                  (field) => field.name === layer.colorCodeBy
                )
            : null;

          let { sys_groupName } =
            asset.sys_entityAttributes.sys_templateGroupName;
          return (
            <>
              <ListItem button>
                <div style={{ display: "flex", flex: 1 }}>
                  <div
                    style={{ display: "flex", flex: 10, alignItems: "center" }}
                  >
                    <ToolTipWrapper systemVariant="info" title="Show in Map">
                      <div>
                        <DisplayCheckbox
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onChange={(v, pp, e) => {
                            e.stopPropagation();
                            let newChecked = { ...checked };
                            newChecked[sys_groupName] =
                              !newChecked[sys_groupName];
                            setChecked(newChecked);
                            new Promise(() => {
                              persistChecked(newChecked);
                              handleChange(sys_groupName);
                            });
                          }}
                          checked={checked[sys_groupName]}
                          size="small"
                        />
                      </div>
                    </ToolTipWrapper>
                    <ListItemIcon>
                      <img
                        width="30px"
                        height="30px"
                        src={getEntityIcon(sys_groupName)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={asset.sys_entityAttributes.sys_friendlyName}
                    />
                  </div>

                  <div
                    style={{ display: "flex", flex: 2, alignItems: "center" }}
                  >
                    {layer.type != "DESIGNER" && (
                      <ToolTipWrapper
                        systemVariant="info"
                        title={`Clustering can be disabled when the zoom level is 14, current zoom level is ${zoom}`}
                      >
                        <div>
                          <DisplaySwitch
                            size="small"
                            checked={clusteringChecked[sys_groupName]}
                            disabled={zoom < 14}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onChange={(e) => {
                              e.stopPropagation();
                              let newChecked = { ...clusteringChecked };
                              newChecked[sys_groupName] =
                                !newChecked[sys_groupName];
                              setClusteringChecked(newChecked);
                              new Promise(() => {
                                persistClusteringChecked(newChecked);
                                handleClusteringChange(sys_groupName);
                              });
                            }}
                            hideLabel={true}
                          />
                        </div>
                      </ToolTipWrapper>
                    )}
                  </div>
                  {colorCodes !== null &&
                  (layer.type == "DESIGNER" ||
                    (layer.type != "DESIGNER" &&
                      !clusteringChecked[sys_groupName])) ? (
                    <div
                      style={{
                        flex: 2,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {open[sys_groupName] ? (
                        <DisplayIconButton
                          onClick={() => toggleExpand(sys_groupName)}
                          systemVariant="primary"
                        >
                          <ExpandLess fontSize="small" />
                        </DisplayIconButton>
                      ) : (
                        <DisplayIconButton
                          onClick={() => toggleExpand(sys_groupName)}
                          systemVariant="primary"
                        >
                          <ExpandMore fontSize="small" />
                        </DisplayIconButton>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flex: 2 }}></div>
                  )}
                </div>
              </ListItem>
              {colorCodes && (
                <DisplayCollapse
                  in={
                    open[sys_groupName] &&
                    (layer.type == "DESIGNER" ||
                      (layer.type != "DESIGNER" &&
                        !clusteringChecked[sys_groupName]))
                  }
                  unmountOnExit
                >
                  <List
                    style={{ padding: "0px 25px" }}
                    component="div"
                    disablePadding
                  >
                    {colorCodes.values.map((value) => {
                      return (
                        <ListItem button className={classes.nested}>
                          {value.color && (
                            <ListItemIcon
                              style={{
                                color: value.color,
                                fillColor: value.color,
                              }}
                            >
                              <FiberManual />
                            </ListItemIcon>
                          )}
                          <ListItemText primary={value.value} />
                          <ListItemSecondaryAction>
                            <DisplaySwitch
                              size="small"
                              value={value.value}
                              checked={
                                subLayerChecked[sys_groupName][value.value]
                              }
                              onChange={() => {
                                let newSubLayerChecked = { ...subLayerChecked };
                                newSubLayerChecked[sys_groupName][value.value] =
                                  !newSubLayerChecked[sys_groupName][
                                    value.value
                                  ];
                                setSubLayerChecked(newSubLayerChecked);
                                persistSubLayerChecked(newSubLayerChecked);
                                handleSubChange(sys_groupName, value.value);
                              }}
                              hideLabel={true}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                  </List>
                </DisplayCollapse>
              )}
            </>
          );
        })}
      </List>
    </>
  );
}
