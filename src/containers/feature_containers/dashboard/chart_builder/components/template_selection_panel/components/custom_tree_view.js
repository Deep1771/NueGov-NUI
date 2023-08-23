import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TreeItem, TreeView } from "@material-ui/lab/";
import { useStateValue } from "utils/store/contexts";
import { entityTemplate } from "utils/services/api_services/template_service";
import { TemplateSkeleton } from "components/skeleton_components";
import DraggableTreeView from "./draggable_tree_view";
import { SystemIcons } from "utils/icons";

let CustomTreeView = (props) => {
  const { appName, moduleName, entityName } = props;
  const [{ dashboardState }, dispatch] = useStateValue();
  const { systemTypes } = dashboardState;

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      maxWidth: 400,
      padding: "3px 10px 0px 10px",
      marginTop: 5,
      color: "black",
    },
    compTitle: {
      backgroundColor: "red",
    },
  }));

  const classes = useStyles();
  let { ExpandMore, ChevronRight } = SystemIcons;

  const [component, setComponent] = useState(undefined);
  const [loader, setLoader] = useState(true);
  const [topLevel, setTopLevel] = useState([]);
  const [detailTabLabelText, setDetailTabLabel] = useState(
    "Top Level Attributes"
  );
  const [componentTabLabelText, setComponentTabLabel] = useState("Components");

  //custom methods
  let getExclusionArray = () => {
    return systemTypes
      .find((e) => e.sys_entityAttributes.dataFormat == "EXCLUDED")
      .sys_entityAttributes.directiveTypes.map((e) => e.name);
  };

  const typeRenderer = (metadata, src, i, compName) => {
    let fieldMetadata = { ...metadata };
    if (src == "COMPONENT") fieldMetadata["componentName"] = compName;
    switch (fieldMetadata.type) {
      case "REFERENCE":
        return (
          <TreeItem
            key={fieldMetadata.name + i}
            nodeId={fieldMetadata.name + i}
            label={fieldMetadata.title}
          >
            {fieldMetadata.displayFields.map((df, j) => (
              <DraggableTreeView
                fieldMetadata={fieldMetadata}
                key={fieldMetadata.name + df.name + j}
                src={src}
                name={df.name.split(".")[df.name.split(".").length - 1]}
                nodeId={fieldMetadata.name + df.name + j}
                label={df.friendlyName}
              />
            ))}
          </TreeItem>
        );
      case "APPROVAL":
        return (
          <DraggableTreeView
            fieldMetadata={fieldMetadata}
            key={fieldMetadata.name + i}
            src={src}
            nodeId={fieldMetadata.name + i}
            name={fieldMetadata.name}
            label={fieldMetadata.title}
          />
        );
      case "PAIREDLIST":
      case "DATAPAIREDLIST":
        return (
          <TreeItem
            key={fieldMetadata.name + i}
            nodeId={fieldMetadata.name + i}
            label={fieldMetadata.title}
          >
            <DraggableTreeView
              fieldMetadata={fieldMetadata}
              src={src}
              name={fieldMetadata.labels.name}
              nodeId={fieldMetadata.labels.name}
              label={fieldMetadata.labels.name}
            />
            <DraggableTreeView
              fieldMetadata={fieldMetadata}
              src={src}
              name={fieldMetadata.labels.child.name}
              nodeId={fieldMetadata.labels.child.name}
              label={fieldMetadata.labels.child.name}
            />
          </TreeItem>
        );
      default:
        return (
          <DraggableTreeView
            fieldMetadata={fieldMetadata}
            key={fieldMetadata.name + i}
            src={src}
            nodeId={fieldMetadata.name + i}
            name={fieldMetadata.name}
            label={fieldMetadata.title}
          />
        );
    }
  };

  //useEffects
  useEffect(() => {
    if (appName && moduleName && entityName) {
      setTopLevel([]);
      setLoader(true);
      let query = {
        appname: appName,
        modulename: moduleName,
        groupname: entityName,
      };
      entityTemplate.get(query).then((res) => {
        if (res && Object.keys(res).length) {
          let {
            sys_topLevel,
            sys_components,
            detailTabLabel,
            componentTabLabel,
          } = res.sys_entityAttributes;
          if (sys_topLevel) setTopLevel(sys_topLevel);
          else setTopLevel([]);
          if (detailTabLabel) setDetailTabLabel(detailTabLabel);
          if (componentTabLabel) setComponentTabLabel(componentTabLabel);
          if (sys_components && sys_components[0])
            setComponent(sys_components[0]);
          else setComponent(undefined);
          setLoader(false);
        } else {
          setTopLevel([]);
          setComponent(undefined);
          setLoader(false);
        }
      });
    } else {
      setTopLevel([]);
      setLoader(true);
    }
  }, [appName, moduleName, entityName]);

  useEffect(() => {}, [systemTypes]);

  return (
    <div style={{ padding: "10px", display: "flex", flex: 1, height: "100%" }}>
      <div
        style={{
          flexGrow: 1,
          contain: "strict",
          overflow: "hidden",
          overflowY: "auto",
        }}
        class="hide_scroll"
      >
        {!loader && systemTypes ? (
          <div style={{ overflowY: "auto", flex: 1, flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "Open Sans",
                fontSize: "20px",
                color: "#212121",
              }}
            >
              {" "}
              Select Attributes
            </span>
            <br />
            <span
              style={{
                fontFamily: "Roboto",
                fontSize: "12px",
                color: "#666666",
                fontStyle: "Italic",
              }}
            >
              {" "}
              (Select Chart Category then Drag and Drop attributes to the right
              panel)
            </span>
            <TreeView
              className={classes.root}
              defaultCollapseIcon={<ExpandMore />}
              defaultExpandIcon={<ChevronRight />}
            >
              <TreeItem nodeId="10000" label={detailTabLabelText}>
                {topLevel
                  .filter((e) => !getExclusionArray().includes(e.type))
                  .map((field, i) => typeRenderer(field, "TOPLEVEL", i))}
              </TreeItem>
            </TreeView>
            {component && (
              <TreeView
                className={classes.root}
                //   defaultExpanded={['100001']}
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
              >
                <TreeItem nodeId="100001" label={componentTabLabelText}>
                  {component.componentList.map((comp, i) => (
                    <div key={i}>
                      <DraggableTreeView
                        fieldMetadata={{
                          title: comp.componentTitle,
                          name: comp.name,
                          componentName: comp.name,
                        }}
                        src="COMPONENTTITLE"
                        nodeId={comp.name + i}
                        name="componentId"
                        label={comp.componentTitle}
                      />
                      <TreeItem
                        nodeId={`${comp.name}${i}`}
                        label={`${comp.componentTitle} component attributes`}
                      >
                        {comp.sys_entityAttributes
                          .filter((e) => !getExclusionArray().includes(e.type))
                          .map((field, i) =>
                            typeRenderer(field, "COMPONENT", i, comp.name)
                          )}
                      </TreeItem>
                    </div>
                  ))}
                </TreeItem>
              </TreeView>
            )}
          </div>
        ) : (
          <TemplateSkeleton />
        )}
      </div>
    </div>
  );
};

export default CustomTreeView;
