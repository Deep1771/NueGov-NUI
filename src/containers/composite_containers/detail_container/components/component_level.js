import React, { useEffect, useState, useMemo } from "react";
import { Fade } from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { Iterator } from "./iterator";
import { useComponentData, useDetailData, imMutate } from "../detail_state";
import { ComponentsSelector } from "./components_selector";
import {
  DisplayButton,
  DisplayCard,
  DisplayIconButton,
  DisplayGrid,
  DisplayTabs,
  DisplayText,
} from "components/display_components";
import {
  ContextMenuWrapper,
  PaperWrapper,
} from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import BubbleLoader from "components/helper_components/bubble_loader";
import { styles } from "../styles";

const { Add, Copy, Delete } = SystemIcons;

const InstanceTitle = (props) => {
  const { compMeta, compId } = props;
  const { componentData } = useComponentData();
  const [compTitle, setCompTitle] = useState("");

  // useEffect
  useEffect(() => {
    let data = componentData.find((ec) => ec.componentId === compId);
    let titles = compMeta.instanceTitle.map((et) => {
      let fMeta = compMeta.fields.find((ef) => ef.name == et);
      if (data && data.sys_entityAttributes[et])
        return textExtractor(data.sys_entityAttributes[et], fMeta);
    });
    if (titles.length) setCompTitle(titles.filter((et) => et).join("  /  "));
  }, [componentData, compId]);

  return (
    <span>
      <DisplayText variant="h6">
        {compTitle ? `${compMeta.title} - ` : compMeta.title}
      </DisplayText>
      <DisplayText variant="body1">{compTitle}</DisplayText>
    </span>
  );
};

export const ComponentLevel = () => {
  const { metadata, setFormData, setFormError, stateParams, compName } =
    useDetailData();
  const { componentData, componentErrors } = useComponentData();
  const [section, setSection] = useState();
  const [sectionData, setSectionData] = useState([]);
  const [sectionCounts, setSectionCounts] = useState({});
  const [sectionMeta, setSectionMeta] = useState();
  const [showContext, setShowContext] = useState(false);
  const [activeComp, setActiveComp] = useState();
  const [loading, setLoading] = useState(false);
  const [tabs, setTabs] = useState([]);
  const mode = stateParams.mode;

  //    Setters
  const onTabSelect = (section) => {
    setActiveComp(null);
    setSection(section);
  };

  const addComponents = (selectedComps) => {
    setShowContext(false);
    if (selectedComps.length) {
      let payload = selectedComps.map((ec) => ({
        componentName: ec,
        componentId: `${ec}-${uuidv4()}`,
        sys_entityAttributes: {},
      }));
      setFormData({
        type: "ADD_COMPONENT",
        payload,
      });
      setFormError({
        type: "INIT_COMP_VALIDATION",
        payload: { comps: payload, metadata },
      });
      setSection(payload[0].componentName);
      setActiveComp(null);
    }
  };

  const handleCompSelect = (comp) => {
    if (activeComp && activeComp.componentId == comp.componentId) {
      setActiveComp(null);
      return false;
    }

    setLoading(true);
    setActiveComp(comp);
    setTimeout(() => {
      setLoading(false);
    }, 200);
  };

  const handleClone = (compId) => {
    let docToClone = imMutate(
      componentData.find((ec) => ec.componentId == compId)
    );
    docToClone.componentId = uuidv4();
    setFormData({
      type: "CLONE_COMPONENT",
      payload: docToClone,
    });
    setFormError({
      type: "INIT_COMP_VALIDATION",
      payload: { comps: [docToClone], metadata },
    });
  };

  const handleDelete = (compId) => {
    setFormData({
      type: "DELETE_COMPONENT",
      payload: compId,
    });
    setFormError({
      type: "REMOVE_COMP_VALIDATION",
      payload: compId,
    });

    if (activeComp && activeComp.componentId == compId) setActiveComp(null);
  };

  const setComponentData = (fieldData, fieldProps) =>
    setFormData({
      type: "SET_COMPONENT_FIELD",
      payload: { fieldData, fieldProps },
    });

  const setComponentError = (fieldError, fieldProps) =>
    setFormError({
      type: "SET_COMPONENT_ERROR",
      payload: { fieldError, fieldProps },
    });

  // useEffects
  useEffect(() => {
    if (metadata) {
      let { sys_components } = metadata.sys_entityAttributes;
      let sec_meta = sys_components[0].componentList.map((ec) => ({
        name: ec.name,
        title: ec.componentTitle,
        fields: ec.sys_entityAttributes,
        instanceTitle: ec.instanceTitle,
      }));
      setSectionMeta(sec_meta);
    }
  }, [metadata]);

  useEffect(() => {
    if (sectionMeta && componentData) {
      const secCounts = {};
      const compData = componentData
        .filter((ec) => {
          let compMeta = sectionMeta.find((m) => m.name == ec.componentName);
          return !!compMeta;
        })
        .map((ec) => ec)
        .sort((pc, nc) =>
          pc.componentName.toLowerCase() > nc.componentName.toLowerCase()
            ? 1
            : -1
        );
      let comps = compData.reduce((comps, ec) => {
        secCounts[ec.componentName] = secCounts[ec.componentName]
          ? secCounts[ec.componentName] + 1
          : 1;
        let compIndex = comps.findIndex((c) => c.name === ec.componentName);
        if (compIndex === -1) {
          comps.push({
            name: ec.componentName,
            title: sectionMeta.find((esm) => esm.name == ec.componentName)
              .title,
          });
        }
        return comps;
      }, []);
      setTabs(comps);
      setSectionCounts(secCounts);
      if (
        comps.length &&
        (!section || !compData.find((ec) => ec.componentName === section))
      ) {
        setSection(comps[0].name);
        setActiveComp(null);
      }
    }
  }, [sectionMeta, componentData.length]);

  useEffect(() => {
    if (section && componentData.length) {
      let comps = componentData.filter((ec) => ec.componentName === section);
      setSectionData(comps);
    } else {
      setSectionData([]);
      setActiveComp(null);
    }
  }, [componentData.length, section]);

  // Render Methods
  const renderAddOns = () => {
    return (
      <>
        {mode !== "READ" && (
          <ContextMenuWrapper
            onClose={() => {
              setShowContext(false);
            }}
            title="Select Components"
            visible={showContext}
            width="25%"
          >
            <ComponentsSelector
              selectHandler={addComponents}
              metadata={metadata}
            />
          </ContextMenuWrapper>
        )}
      </>
    );
  };

  const renderButtons = () => {
    return (
      <>
        {mode !== "READ" && (
          <DisplayButton
            testid={`${metadata.sys_entityAttributes.sys_templateGroupName.sys_groupName}-addComponents`}
            onClick={() => {
              setShowContext(true);
            }}
          >
            + ADD COMPONENTS
          </DisplayButton>
        )}
      </>
    );
  };

  const renderDetail = () => {
    if (loading)
      return (
        <div style={styles.sections}>
          <BubbleLoader />
        </div>
      );
    else if (sectionData && sectionMeta && section && activeComp) {
      let compMeta = sectionMeta.find((esm) => esm.name == section);
      let comp = sectionData.find(
        (es) => es.componentId === activeComp.componentId
      );
      if (compMeta && compMeta.fields) {
        return (
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              flex: 1,
              alignItems: "flex-start",
              contain: "strict",
            }}
          >
            <Fade in={true} timeout={1500}>
              <>
                <DisplayGrid
                  key={`c-${comp.componentId}`}
                  item
                  xs={12}
                  container
                  style={{ marginBottom: "20px", backgroundColor: "inherit" }}
                >
                  <DisplayGrid container style={{ padding: "5px 15px" }}>
                    <DisplayGrid item xs={8} container alignItems="center">
                      <InstanceTitle
                        compMeta={compMeta}
                        compId={comp.componentId}
                      />
                    </DisplayGrid>
                  </DisplayGrid>
                  {compMeta.fields.map((ef) => {
                    let errors = componentErrors.find(
                      (e) => e.compIndex === comp.componentId
                    );
                    let fieldError =
                      errors && errors.fields.find((f) => f.name === ef.name);
                    return (
                      <Iterator
                        data={comp.sys_entityAttributes[ef.name]}
                        fieldmeta={ef}
                        fieldError={fieldError ? fieldError.error : null}
                        compIndex={comp.componentId}
                        compName={section}
                        callbackError={setComponentError}
                        callbackValue={setComponentData}
                        stateParams={stateParams}
                        testid={
                          stateParams.groupname + "-" + section + "-" + ef.name
                        }
                      />
                    );
                  })}
                </DisplayGrid>
              </>
            </Fade>
          </div>
        );
      }
    }
    return (
      <div style={styles.sections}>
        {mode !== "READ" && (
          <PaperWrapper
            style={{
              flex: 4.5,
              display: "flex",
              backgroundColor: "inherit",
              flexDirection: "column",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <DisplayText
              variant="h4"
              align="center"
              style={{
                fontFamily: "inherit",
                position: "absolute",
                alignSelf: "center",
                opacity: 0.3,
              }}
            >
              {sectionData && sectionData.length
                ? `Select component from above to modify`
                : `Click Add components to add`}
            </DisplayText>
          </PaperWrapper>
        )}
      </div>
    );
  };

  const renderCards = () => {
    if (sectionData && sectionMeta && section) {
      let compMeta = sectionMeta.find((esm) => esm.name == section);
      if (compMeta && compMeta.fields)
        return (
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              flexShrink: 1,
              paddingBottom: "10px",
              width: "100%",
            }}
          >
            {sectionData.map((ec) => {
              let selected =
                activeComp && activeComp.componentId === ec.componentId;
              return (
                <DisplayCard
                  style={{
                    height: "100px",
                    width: "350px",
                    minWidth: "350px",
                    maxWidth: "350px",
                    margin: "0px 10px 5px 0px ",
                    padding: "10px",
                    position: "relative",
                  }}
                  testid={`componentCard-${ec.componentId}`}
                  systemVariant={selected ? "primary" : "default"}
                  onClick={() => handleCompSelect(ec)}
                >
                  <DisplayGrid>
                    <InstanceTitle
                      compMeta={compMeta}
                      compId={ec.componentId}
                    />
                  </DisplayGrid>
                  {mode !== "READ" && (
                    <div style={{ position: "absolute", right: 0, bottom: 0 }}>
                      {
                        <DisplayIconButton
                          systemVariant={!selected ? "primary" : "default"}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClone(ec.componentId);
                          }}
                        >
                          <Copy />
                        </DisplayIconButton>
                      }
                      {
                        <DisplayIconButton
                          systemVariant={!selected ? "primary" : "default"}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ec.componentId);
                          }}
                        >
                          <Delete />
                        </DisplayIconButton>
                      }
                    </div>
                  )}
                </DisplayCard>
              );
            })}
          </div>
        );
    }
  };

  const renderSectionHeader = () => (
    <DisplayGrid container alignItems="center">
      {section && sectionCounts[section] > 0 && (
        <>
          <DisplayGrid item container xs={6} alignItems="center">
            <DisplayText variant="button" style={{ color: "#616161" }}>
              Total Count:
            </DisplayText>
            &nbsp;
            <DisplayText variant="h6">{sectionCounts[section]}</DisplayText>
          </DisplayGrid>
          <DisplayGrid item container xs={6} justify="flex-end">
            {mode !== "READ" && (
              <DisplayButton
                testid={"create-Component"}
                onClick={() => {
                  addComponents([section]);
                }}
                startIcon={<Add />}
              >
                Create New
              </DisplayButton>
            )}
          </DisplayGrid>
        </>
      )}
    </DisplayGrid>
  );

  const renderTabs = () => {
    if (tabs)
      return (
        <>
          {tabs.length > 0 && (
            <DisplayTabs
              testid={
                metadata.sys_entityAttributes.sys_templateGroupName
                  .sys_groupName
              }
              tabs={tabs}
              defaultSelect={section ? section : false}
              titleKey="title"
              valueKey="name"
              onChange={onTabSelect}
              variant="scrollable"
            />
          )}
        </>
      );
  };

  return (
    <>
      <DisplayGrid
        container
        justify="flex-end"
        style={{ marginBottom: "10px", backgroundColor: "#ffffff" }}
      >
        <DisplayGrid item container xs={10}>
          {useMemo(() => {
            return renderTabs();
          }, [section, sectionData, sectionCounts, stateParams.mode])}
        </DisplayGrid>
        <DisplayGrid item container xs={2} justify="flex-end">
          {useMemo(() => {
            return renderButtons();
          }, [section, sectionCounts, stateParams.mode])}
        </DisplayGrid>
      </DisplayGrid>
      {renderSectionHeader()}
      <DisplayGrid
        item
        container
        display="flex"
        direction="column"
        style={{
          flex: 1,
          backgroundColor: "inherit",
          width: "100%",
          height: "100%",
        }}
      >
        {useMemo(() => {
          return renderCards();
        }, [sectionData, stateParams.mode, activeComp])}
        {useMemo(() => {
          return renderDetail();
        }, [sectionData, activeComp, loading, stateParams.mode])}
      </DisplayGrid>
      {renderAddOns()}
    </>
  );
};
