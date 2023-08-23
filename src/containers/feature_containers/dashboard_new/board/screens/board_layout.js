import React, { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import { entity } from "utils/services/api_services/entity_service";
import { BubbleLoader } from "components/helper_components";
import { PaperWrapper, ToolTipWrapper } from "components/wrapper_components";
import { ChartIterator } from "../../chart_components/chart_iterator";
import { ChartSelector } from "./chart_selector";
import { get, isDefined } from "utils/services/helper_services/object_methods";
import {
  DisplayButton,
  DisplayIcon,
  DisplayIconButton,
  DisplayModal,
  DisplayText,
  DisplaySwitch,
  DisplayCard,
} from "components/display_components";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { SystemIcons } from "utils/icons";
import { useStateValue } from "utils/store/contexts";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { ListFilter } from "../components/filter/list_filter";

export const BoardLayout = (props) => {
  const { boardTitle, activeboardId, relationMeta, unmountURL, formData } =
    props;
  const { closeBackDrop, setBackDrop } = GlobalFactory();
  const { isNJAdmin, getLoginName, isSuperAdmin, checkAccess } = UserFactory();
  const history = useHistory();
  const queryParams = queryString.parse(history.location.search);
  let { id } = queryParams;
  const [{ dashboardState }, dispatch] = useStateValue();
  const { boardUpdated, boardSetUpdated, triggerSave, editLayout, toolTips } =
    dashboardState;
  const { AddBox, Delete, DragIndicator, Info, Edit, TouchApp } = SystemIcons;
  const [loader, setLoader] = useState(true);
  const [layout, setLayout] = useState([]);
  const [gridRowHeight, setRowHeight] = useState(50);
  const [template, setTemplate] = useState([]);
  const [showChartSelector, setChartSelector] = useState(false);
  const [filterOptions, setFilterOptions] = useState([]);
  const [filterMetadata, setFilterMetadata] = useState({});
  const { triggerOn } = filterMetadata || {};
  const [filterValue, setFilterValue] = useState();
  const [boardData, setBoardData] = useState();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [title, setTitle] = useState();
  const [enableSave, setEnableSave] = useState(false);
  const [mount, setMount] = useState(false);

  id = activeboardId ? activeboardId : id;
  let { dashboardConfig } = unmountURL ? relationMeta[0]?.metadata || {} : {};
  let { agencyNamePath } = dashboardConfig || {};

  let agencyname = get(formData, agencyNamePath ? agencyNamePath : "");
  agencyname = agencyname ? `of ${agencyname}` : "";
  const query = {
    appname: "Features",
    modulename: "Insights",
  };

  const { EDIT_BUTTON: editMsg, CLICKABLE_ICON: clickableMsg } = toolTips;

  window.addEventListener("resize", () => {
    setWindowWidth(window.innerWidth);
  });

  const checkPermissions = (payload) => {
    const { appName = "", entityName = "", moduleName = "" } = payload || {};
    const permission = checkAccess(appName, moduleName, entityName, "read");
    return permission;
  };
  //filtering charts based on user access
  const validatePermissions = (templates) => {
    return templates?.filter((template) => {
      const { sys_components = [] } = template || {};
      const hasValidPermission = sys_components?.some((component) => {
        const { payload = {} } = component?.sys_entityAttributes || {};
        const permission = checkPermissions(payload);
        return permission;
      });
      return hasValidPermission || false;
    });
  };

  const sortLayout = (layout) => {
    return layout?.sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });
  };

  const getLayouts = (layout, template) => {
    return layout?.filter((el) => template?.some((et) => et._id == el.i)) || [];
  };

  useEffect(() => {
    setLoader(true);
    setLayout([]);
    setTemplate([]);
    setBoardData();
    loadBoard();
    handleLayoutChange(false);
    dispatch({
      type: "EDIT_LAYOUT",
      payload: false,
    });
  }, [id]);

  const loadBoard = async () => {
    setLoader(true);
    setMount(false);
    entity
      .get({ ...query, entityname: "Boards", id })
      .then(async (board) => {
        setBoardData(board);
        const { layout, rowHeight, boardName, filters } =
          board.sys_entityAttributes;
        setFilterMetadata(filters);
        setRowHeight(rowHeight);
        setTitle(boardName);
        if (layout && layout.length) {
          let templates = await entity.get({
            ...query,
            entityname: "ChartTemplate",
            skip: 0,
            limit: layout.length,
            sys_ids: JSON.stringify(layout.map((i) => i.i)),
          });

          if (templates) {
            let validTemplates = validatePermissions(templates) || [];
            //for all templates
            let layouts = getLayouts(layout, templates);
            let filteredTemplateLayout = layoutFilter(layouts);
            let templatesLayout = sortLayout(filteredTemplateLayout);
            //for valid templates
            let validLayouts = getLayouts(layout, validTemplates) || [];
            let validFilteredLayouts = layoutFilter(validLayouts);
            let validTemplatesLayout = sortLayout(validFilteredLayouts) || [];

            validTemplatesLayout =
              validTemplatesLayout?.map((validTempObj, i) => {
                return { ...templatesLayout[i], i: validTempObj.i };
              }) || [];

            setTemplate(validTemplates);
            setLayout(validTemplatesLayout);
            setLoader(false);
            setMount(true);
          }
        } else {
          dispatch({
            type: "EDIT_LAYOUT",
            payload: true,
          });
          setLoader(false);
        }
      })
      .catch((e) => {
        setLoader(false);
      });
  };

  const addCharts = (charts) => {
    //IDS of newly added
    let chartsAdded = charts.map((ec) => ec._id); //Retain Old Layout
    let oldChartsLayout = layout.filter((el) => chartsAdded.includes(el.i)); //Construct layout for newly added
    let extraChartsAdded = charts.filter(
      (ec) => !oldChartsLayout.map((o) => o.i).includes(ec._id)
    );
    let newLayouts = extraChartsAdded.map((chart, i) => ({
      i: chart._id,
      x: ((oldChartsLayout.length + i) * 4) % 12,
      y: Infinity,
      h: 5,
      w: 3,
    }));

    setTemplate([...charts]);
    setLayout(layoutFilter([...oldChartsLayout, ...newLayouts]));
    handleLayoutChange(true);
  };

  const deleteChart = (id) => {
    //update Layout
    let layoutIndex = layout.findIndex((a) => a.i == id);
    let newLayout = [...layout];
    newLayout.splice(layoutIndex, 1);
    setLayout(layoutFilter(newLayout));

    //update templates
    let templateIndex = template.findIndex((a) => a._id == id);
    let templates = [...template];
    templates.splice(templateIndex, 1);
    setTemplate(templates);
  };

  const getTemplateById = (id) =>
    template.length && template.find((a) => a._id == id);

  const handleLayoutChange = (prop) => {
    dispatch({
      type: "BOARD_UPDATE",
      payload: prop,
    });
    dispatch({
      type: "SET_SAVE_POPUP",
      payload: prop,
    });
  };

  const intializeSave = (prop) => {
    dispatch({
      type: "TRIGGER_SAVE",
      payload: prop,
    });
  };

  const getMetaDataForFilter = async () => {
    const { queryObj = {} } = filterMetadata || {};

    let metadata = await entity.get({
      ...queryObj,
      skip: 0,
      limit: 20,
    });
    if (metadata) setFilterOptions(metadata);
  };

  useEffect(() => {
    if (Object.keys(filterMetadata || {})?.length) getMetaDataForFilter();
  }, [JSON.stringify(filterMetadata)]);

  useEffect(() => {
    if (boardUpdated || boardSetUpdated) setEnableSave(true);
  }, [boardUpdated, boardSetUpdated]);

  useEffect(() => {
    if (triggerSave && boardUpdated) saveBoard();
  }, [triggerSave, boardUpdated]);

  const saveBoard = () => {
    setBackDrop("Saving..");
    let payload = { ...boardData };
    payload.sys_entityAttributes.layout = [...layout];
    // delete payload._id;
    entity
      .update({ ...query, entityname: "Boards", id }, payload)
      .then((res) => {
        if (res) closeBackDrop();
        else throw "could not add data!";

        dispatch({
          type: "EDIT_LAYOUT",
          payload: false,
        });
      });
    handleLayoutChange(false);
  };

  useEffect(() => {
    if (!boardUpdated && !boardSetUpdated && triggerSave) {
      intializeSave(false);
      setEnableSave(false);
    }
  }, [boardUpdated, boardSetUpdated]);

  const layoutFilter = (layout) => {
    return layout.map((el) => {
      const { i, x, y, h, w, minH = 5, minW = 3, ...ignore } = el;
      return { i, x, y, h, w, minH, minW };
    });
  };

  const handleLayoutBtn = () => {
    dispatch({
      type: "EDIT_LAYOUT",
      payload: !editLayout,
    });
  };

  useEffect(() => {
    setTitle(boardTitle);
  }, [boardTitle]);

  if (loader || !boardData)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        }}
      >
        <BubbleLoader />
      </div>
    );
  else {
    let { predefined, userInfo } = boardData.sys_entityAttributes;
    let { username } = userInfo;
    let isPreDefined = predefined == "Yes";
    let createdByMe = username === getLoginName;
    let layoutEditable =
      isNJAdmin() || createdByMe || isSuperAdmin || !isPreDefined;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        }}
      >
        <DisplayModal
          disableBackdropClick
          style={{ overflow: "hidden" }}
          open={showChartSelector}
          onClose={() => {
            setChartSelector(false);
          }}
          maxWidth="xl"
          fullWidth={true}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "85vh",
            }}
          >
            <ChartSelector
              onClose={(deletedItems = []) => {
                setChartSelector(false);
                if (deletedItems.length) {
                  deletedItems.map((ei) => deleteChart(ei));
                }
              }}
              onAdd={(charts) => {
                addCharts(charts);
              }}
              selectedItems={template || []}
            />
          </div>
        </DisplayModal>

        <div
          style={{
            display: "flex",
            flexShrink: 1,
            alignSelf: "flex-start",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexShrink: 4,
              alignItems: "center",
              gap: "10px",
            }}
          >
            <DisplayText
              variant="h3"
              style={{
                color: "#212121",
                fontWeight: 300,
                fontSize: "32px",
                fontFamily: "inherit",
                margin: "8px 0px 8px 10px",
              }}
              testid="BoardTitle"
            >
              {`${title} ${agencyname} `}
            </DisplayText>
            {filterMetadata && Object.keys(filterMetadata)?.length && (
              <ListFilter
                onSelectionChange={(value) => {
                  setFilterValue(value);
                }}
                value={filterOptions?.value}
                data={filterOptions}
                filterMetadata={filterMetadata}
              />
            )}
          </div>
          <div
            style={{
              display: "flex",
              flex: 4,
              justifyContent: "flex-end",
              marginRight: "5px",
            }}
          >
            {layoutEditable && editLayout && (
              <DisplayButton
                style={{ fontFamily: "inherit" }}
                size="medium"
                onClick={() => {
                  setChartSelector(!showChartSelector);
                }}
                testid="Insights-AddChart"
              >
                ADD CHARTS
              </DisplayButton>
            )}
            {layoutEditable && (
              <DisplaySwitch
                checked={editLayout}
                label="EDIT MODE"
                labelPlacement="start"
                hideLabel={false}
                systemVariant="primary"
                onChange={handleLayoutBtn}
                testid="Insights-EditMode"
              />
            )}
            {layoutEditable && (
              <>
                <DisplayIconButton
                  systemVariant="info"
                  size="small"
                  onClick={() => {}}
                >
                  <ToolTipWrapper
                    systemVariant="info"
                    placement="bottom-start"
                    title={editMsg}
                  >
                    <Info fontSize="small" />
                  </ToolTipWrapper>
                </DisplayIconButton>
                &nbsp;
              </>
            )}
          </div>
        </div>
        <div
          className="hide_scroll"
          style={{
            display: "flex",
            flex: 9,
            contain: "strict",
            overflowY: "auto",
            width: "100%",
            height: "100%",
          }}
        >
          {layout && layout.length > 0 ? (
            <GridLayout
              className="layout"
              layout={layout}
              cols={12}
              onLayoutChange={(layout) => {
                setLayout(layoutFilter(layout));
                mount &&
                  layoutEditable &&
                  editLayout &&
                  handleLayoutChange(true);
              }}
              style={{
                height: "100%",
                width: "100%",
              }}
              autoSize={true}
              isDraggable={editLayout && layoutEditable}
              isResizable={editLayout && layoutEditable}
              rowHeight={gridRowHeight || 50}
              padding={[10, 10]}
              isDroppable={true}
              width={windowWidth}
            >
              {layout.map((i) => {
                let chart = getTemplateById(i.i);
                if (chart) {
                  let { sys_entityAttributes, sys_components } = chart;
                  let { clickable = true } = sys_entityAttributes;
                  let arr = sys_components.filter(
                    (i) => (i.componentName = "Traces")
                  );
                  let chartType =
                    arr[0].sys_entityAttributes.chartName.chartName;
                  let cursor =
                    editLayout && layoutEditable
                      ? "move"
                      : clickable && chartType != "TEXT"
                      ? "pointer"
                      : "default";
                  return (
                    <div
                      key={i.i}
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        cursor,
                      }}
                    >
                      {clickable && !editLayout && chartType != "TEXT" && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            opacity: 0.8,
                            zIndex: 999,
                            color: "blue",
                            margin: "1px 0 0 16px",
                            fontSize: "smaller",
                          }}
                        >
                          <ToolTipWrapper
                            systemVariant="info"
                            placement="right-start"
                            title={clickableMsg}
                          >
                            <TouchApp fontSize="small" />
                            {/* <div>Clickable...</div> */}
                          </ToolTipWrapper>
                        </div>
                      )}
                      {layoutEditable && editLayout && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            zIndex: 999,
                          }}
                        >
                          <DisplayIconButton
                            size="small"
                            systemVariant={"secondary"}
                            onClick={(e) => {
                              deleteChart(i.i);
                              layoutEditable && handleLayoutChange(true);
                              e.stopPropagation();
                            }}
                          >
                            <Delete />
                          </DisplayIconButton>
                        </div>
                      )}
                      {isNJAdmin() && !editLayout && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            zIndex: 999,
                          }}
                        >
                          <DisplayButton
                            size="small"
                            systemVariant={"primary"}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            href={`/app/summary/Features/Insights/ChartTemplate/edit/${i.i}?drawer=true`}
                            name={Edit}
                          >
                            Edit
                          </DisplayButton>
                        </div>
                      )}
                      {layoutEditable && editLayout && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            opacity: 0.4,
                            zIndex: 999,
                          }}
                        >
                          <DisplayIcon
                            size="small"
                            systemVariant={"primary"}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            name={DragIndicator}
                          />
                        </div>
                      )}
                      <DisplayCard
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "0.75rem",

                          boxShadow:
                            "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
                        }}
                        elevation={0}
                      >
                        {template.length > 0 && chart ? (
                          <ChartIterator
                            template={chart}
                            config={{ staticPlot: editLayout }}
                            plotId={`board-${i.i}`}
                            boardTitle={title}
                            relationMeta={relationMeta}
                            unmountURL={unmountURL}
                            formData={formData}
                            filterValue={filterValue}
                            filterMetadata={filterMetadata}
                            triggerOn={triggerOn}
                          />
                        ) : (
                          <BubbleLoader />
                        )}
                      </DisplayCard>
                    </div>
                  );
                } else return <div key={1} />;
              })}
            </GridLayout>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <DisplayText
                gutterBottom
                align="center"
                variant="h5"
                component="h2"
              >
                <AddBox style={{ height: 200, width: 200, color: "#86898a" }} />
              </DisplayText>
              <DisplayText
                variant="h4"
                align="center"
                style={{ fontFamily: "inherit" }}
                color="textSecondary"
                component="p"
              >
                PLACEHOLDER TO ADD CHARTS
              </DisplayText>
              {layoutEditable && editLayout && (
                <DisplayText
                  variant="h6"
                  align="center"
                  style={{ color: "#999a9b", fontFamily: "inherit" }}
                  component="p"
                >
                  Add Charts from Charts Collection{" "}
                  <DisplayButton
                    onClick={() => {
                      setChartSelector(!showChartSelector);
                    }}
                  >
                    {" "}
                    <u>Click here</u>{" "}
                  </DisplayButton>
                </DisplayText>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
};
