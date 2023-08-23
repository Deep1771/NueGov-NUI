import React, { useEffect, useMemo, useState, useRef } from "react";
import { isDefined } from "utils/services/helper_services/object_methods";
import { Iterator } from "./iterator";
import { useDetailData, useTopLevelData } from "../detail_state";
import {
  DisplayCard,
  DisplayGrid,
  DisplayTabs,
  DisplayText,
  DisplayButton,
} from "components/display_components";
import { BubbleLoader } from "components/helper_components";
import { styles } from "../styles";

export const TopLevel = (props) => {
  const { metadata, setFormData, setFormError, stateParams } = useDetailData();
  const { onClose, mode, data } = props;
  const { sys_auditHistory } = data;
  const { sys_entityType, hideFooterNavigation } =
    metadata.sys_entityAttributes;
  const { topLevelData, topLevelErrors } = useTopLevelData();
  const [section, setSection] = useState();
  const [tabs, setTabs] = useState([]);
  const [tabsName, setTabsName] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const myDivRef = useRef(null);
  function scrollToTOp() {
    if (myDivRef?.current)
      myDivRef.current.scrollTop = myDivRef?.current?.scrollIntoView(true);
  }

  //Setters
  const onTabSelect = (sec) => {
    setSection(sec);
    setLoading(true);
    scrollToTOp();
    setTimeout(() => {
      setLoading(false);
    }, [200]);
  };
  const nextBackSelect = (n) => {
    let index = tabsName.indexOf(section);
    setSection(
      n
        ? tabs[(index + 1) % tabsName.length].name
        : tabs[(index - 1) % tabsName.length].name
    );
  };
  const renderAprrovalFooter = () => {
    const footerNavs = () => {
      return (
        <>
          <DisplayButton
            size="medium"
            onClick={() => {
              nextBackSelect(0);
            }}
            disabled={tabsName.indexOf(section) == 0}
          >{`< prev`}</DisplayButton>
          <DisplayButton
            size="medium"
            onClick={() => {
              nextBackSelect(1);
            }}
            disabled={tabsName.indexOf(section) == tabsName.length - 1}
          >{`next >`}</DisplayButton>
        </>
      );
    };
    if (sys_entityType === "Approval")
      return (
        <>
          <div
            style={{
              display: "flex",
              flexShrink: 1,
              alignItems: "center",
              padding: "5px",
              position: "sticky",
              backgroundColor: "white",
              zIndex: 999,
              bottom: 0,
            }}
          >
            <div
              style={{ display: "flex", flex: 4, justifyContent: "flex-start" }}
            >
              {footerNavs()}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flex: 6,
                paddingLeft: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              {mode != "NEW" &&
                sys_auditHistory &&
                [
                  {
                    label: "Created By",
                    value: sys_auditHistory.createdByUser,
                    visible: true,
                  },
                  {
                    label: " Created On",
                    value: new Date(
                      sys_auditHistory.createdTime
                    ).toDateString(),
                    visible: true,
                  },
                ]
                  .filter((el) => el.visible)
                  .map((au) => (
                    <div
                      style={{
                        display: "flex",
                        flex: 1,
                        paddingRight: "8px",
                        color: "#666666",
                      }}
                    >
                      <span style={{ paddingRight: "8px", fontSize: "10px" }}>
                        <DisplayText
                          style={{ fontWeight: 500, color: "#388E3C" }}
                          variant="caption"
                        >
                          {au.label}
                        </DisplayText>
                      </span>
                      <span style={{ paddingRight: "8px" }}>
                        <DisplayText variant="caption">:</DisplayText>
                      </span>
                      <span style={{ fontSize: "10px" }}>
                        <DisplayText variant="caption">{au.value}</DisplayText>
                      </span>
                    </div>
                  ))}
            </div>
            <div
              style={{ display: "flex", flex: 2, justifyContent: "flex-end" }}
            >
              {onClose && (
                <DisplayButton
                  onClick={() => {
                    onClose();
                  }}
                  variant="outlined"
                  systemVariant="secondary"
                >
                  Close
                </DisplayButton>
              )}
            </div>
          </div>
        </>
      );
    else if (!hideFooterNavigation && tabs.length > 1)
      return (
        <>
          <div
            style={{
              display: "flex",
              flexShrink: 1,
              padding: "5px",
              position: "absolute",
              left: 0,
              bottom: 0,
            }}
          >
            {footerNavs()}
          </div>
        </>
      );
  };
  const setTopLevelData = (fieldData, fieldProps) => {
    setFormData({
      type: "SET_TOP_DATA",
      payload: { fieldData, fieldProps },
    });
  };

  const setTopLevelError = (fieldError, fieldProps) => {
    setFormError({
      type: "SET_TOP_ERROR",
      payload: { fieldError, fieldProps },
    });
  };

  //useEffects
  useEffect(() => {
    if (metadata) {
      setTabs([]);
      setSection(null);
      const secTabs = metadata.sys_entityAttributes.sys_topLevel.reduce(
        (sections, ef) => {
          if (ef.type == "SECTION" && ef.marker == "start")
            sections.push({
              ...ef,
              fields: [],
            });
          if (ef.type != "SECTION")
            sections[sections.length - 1].fields.push(ef);
          return sections;
        },
        []
      );
      setTabs(secTabs);
    }
  }, [metadata]);

  useEffect(() => {
    if (tabs && tabs.length) {
      let temp = [...tabs];
      temp.map((elem) => {
        let emptyTab = elem.fields.every((ele) => ele.type === "SUBSECTION");
        if (emptyTab)
          tabs.splice(
            tabs.findIndex((a) => a === elem),
            1
          );
      });
      setSection(tabs[0].name);
    }
    setTabsName(tabs.map((i) => i.name));
  }, [tabs]);

  const renderSection = () => {
    if (section && tabs.length) {
      let tab = tabs.find((es) => es.name === section);
      let fData;
      if (tab)
        return (
          <div
            style={{
              display: "flex",
              flex: 1,
              overflow: "auto",
              flexDirection: "column",
            }}
            ref={myDivRef}
          >
            <div
              style={{
                display: "flex",
                flexFlow: "wrap",
                alignItems: "center",
              }}
              class="hide_scroll"
            >
              {tab.fields.map((ef, i, tabFields) => {
                if (ef.type !== "SUBSECTION") {
                  fData = topLevelData[ef.name];
                } else {
                  if (
                    tabFields[i + 1] !== undefined &&
                    tabFields[i + 1].type !== "SUBSECTION"
                  ) {
                    fData = topLevelData[ef.name];
                  } else return;
                }
                let fieldError = topLevelErrors.find(
                  (ee) => ee.name == ef.name
                );
                return (
                  <Iterator
                    callbackError={setTopLevelError}
                    callbackValue={setTopLevelData}
                    topLevelErrors={topLevelErrors}
                    data={isDefined(fData) ? fData : null}
                    fieldError={fieldError ? fieldError.error : null}
                    fieldmeta={ef}
                    key={`tf-${i}`}
                    sectionName={section}
                    stateParams={stateParams}
                    testid={stateParams.groupname + "-" + ef.name}
                    callFrom={"top_level"}
                  />
                );
              })}
            </div>
            {renderAprrovalFooter()}
          </div>
        );
    }
  };

  const renderTabs = () => {
    if (tabs && section)
      return (
        <div style={styles.sub_tab}>
          <DisplayTabs
            testid={
              metadata.sys_entityAttributes.sys_templateGroupName.sys_groupName
            }
            tabs={tabs}
            defaultSelect={section}
            titleKey="title"
            valueKey="name"
            onChange={onTabSelect}
            variant="scrollable"
          />
        </div>
      );
  };

  return useMemo(
    () => (
      <>
        {renderTabs()}
        <DisplayCard
          elevation={0}
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "0.5rem 5%",
            backgroundColor: "white",
            // border: "1px solid #c3c3c3",
            borderRadius: "0.5rem",
            padding: "1rem 0rem 0.5rem 1rem",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "auto",
              }}
            >
              <BubbleLoader />
            </div>
          ) : (
            renderSection()
          )}
        </DisplayCard>
      </>
    ),
    [section, tabs, stateParams.mode, isLoading]
  );
};
