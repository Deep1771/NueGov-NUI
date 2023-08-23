import React, { useEffect, useState } from "react";
import {
  deleteEntity,
  entity,
  entityCount,
} from "utils/services/api_services/entity_service";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { useStateValue } from "utils/store/contexts";
import { BubbleLoader, ErrorFallback } from "components/helper_components";
import { SystemIcons } from "utils/icons";
import { ToolTipWrapper } from "components/wrapper_components";
import {
  DisplayDialog,
  DisplayIconButton,
  DisplayGrid,
  DisplayTabs,
  DisplayText,
  DisplayCard,
  DisplaySearchBar,
  DisplayCheckbox,
  DisplayPagination,
  DisplayButton,
} from "components/display_components";
import { ChartIterator } from "../../chart_components/chart_iterator";

const TABS = [
  {
    id: "OTHER",
    title: "All Charts",
  },
  {
    id: "MY",
    title: "My Charts",
  },
];

const ITEMS_PER_PAGE = 20;
const LIMIT_SELECTION = 16;

const QUERY_OBJ = {
  appname: "Features",
  modulename: "Insights",
  entityname: "ChartTemplate",
};

export const ChartSelector = (props) => {
  const [{ dashboardState }] = useStateValue();
  const { toolTips } = dashboardState;
  const { getRole, isNJAdmin, isSuperAdmin, getLoginName, getAgencyDetails } =
    UserFactory();
  const { setSnackBar } = GlobalFactory();

  const [section, setSection] = useState("OTHER");
  const [loader, setLoader] = useState(false);
  const [ownCharts, setOwnCharts] = useState([]);
  const [otherCharts, setOtherCharts] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(props.selectedItems);
  const [mounted, setMounted] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [alert, setAlert] = useState({ delete: false });

  const { onClose, onAdd } = props;
  const { Delete, Info } = SystemIcons;
  //SET FILTERS
  let defFilters = {};
  let agencyId =
    !isNJAdmin() &&
    getAgencyDetails.sys_entityAttributes &&
    getAgencyDetails.sys_entityAttributes.agencyId;

  if (!isNJAdmin()) {
    if (isSuperAdmin) {
      defFilters["agencyInfo.id"] = agencyId;
    } else {
      defFilters = { "agencyInfo.id": agencyId, "roleName.name": getRole() };
    }
  }
  const [filters, setFilters] = useState(defFilters);

  //Setters
  const onTabSelect = (section) => setSection(section);

  let getOwnData = async () => {
    setOwnCharts([]);
    let entityParams = {
      ...QUERY_OBJ,
      skip: 0,
      limit: 50000,
      "userInfo.username": getLoginName,
      ...filters,
    };
    let charts = await entity.get(entityParams);
    setOwnCharts(charts.length ? charts : []);
  };

  let getData = async () => {
    setOtherCharts([]);
    let { page, ...rest } = filters;
    let entityParams = {
      ...QUERY_OBJ,
      skip: page ? (page - 1) * ITEMS_PER_PAGE : 0,
      limit: ITEMS_PER_PAGE,
      ...rest,
    };
    let countParams = { ...QUERY_OBJ, ...rest };
    let [charts, { data: totalCount }] = await Promise.all([
      entity.get(entityParams),
      entityCount.get(countParams),
    ]);
    if (charts) {
      setLoader(false);
      setTotalCount(totalCount);
      setOtherCharts(charts.length ? charts : []);
    }
  };

  const handleCardClick = (data) => {
    let isPresent = selectedItems.some((item) => item._id === data._id);
    onSelect(data, !isPresent);
  };

  const onSelect = (data, checked) => {
    if (checked && selectedItems.length > LIMIT_SELECTION - 1) {
      setSnackBar({
        message: `You can only select upto ${LIMIT_SELECTION} charts.`,
        severity: "info",
      });
      return false;
    }

    let items = [...selectedItems];
    if (checked) setSelectedItems([...items, data]);
    else setSelectedItems(items.filter((ei) => ei._id !== data._id));
  };

  const handleSearch = (title) => {
    setFilters({
      ...filters,
      title,
      page: 1,
    });
  };

  const onPageChange = (e, page) => {
    setFilters({
      ...filters,
      page,
    });
  };

  const handleDelete = (id) => {
    let prop = {
      delete: true,
      id,
    };
    setAlert(prop);
  };

  const onDelete = async (id) => {
    setAlert(false);
    setLoader(true);
    await deleteEntity.remove({
      ...QUERY_OBJ,
      id,
      templateName: "ChartTemplate",
    });
    getData();
    setSelectedItems(selectedItems.filter((ei) => ei._id != id));
    setDeletedItems([...deletedItems, id]);
    setOwnCharts(ownCharts.filter((ei) => ei._id != id));
  };

  useEffect(() => {
    mounted && getData() && setLoader(true);
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    mounted && getOwnData() && setLoader(true);
  }, [filters.title]);

  useEffect(() => {
    setMounted(true);
    setLoader(true);
    getOwnData();
    getData();
  }, []);

  //render Methods
  const renderSection = () => {
    let charts = section === "MY" ? ownCharts : otherCharts;
    if (!charts.length && !loader) return <ErrorFallback slug="no_result" />;
    return charts.map((chart) => {
      let { firstName } = chart.sys_entityAttributes?.userInfo || {};
      return (
        <DisplayGrid
          key={chart._id}
          item
          xs={6}
          sm={4}
          md={3}
          lg={3}
          xl={3}
          style={{
            minHeight: "300px",
            maxHeight: "300px",
            display: "flex",
            position: "relative",
          }}
        >
          <DisplayCard
            onClick={() => handleCardClick(chart)}
            style={{ cursor: "pointer" }}
            id={`add-charts-card-${chart._id}`}
            testid={`add-charts-card-${chart.sys_entityAttributes.title}`}
          >
            <div style={{ display: "flex", flex: 1 }}>
              <div
                style={{ display: "flex", flex: 1, flexDirection: "column" }}
              >
                <ChartIterator
                  template={chart}
                  layout={{ showlegend: false }}
                  config={{ staticPlot: true }}
                  plotId={`selector-${chart._id}`}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 10,
                  margin: "18px",
                }}
              >
                {section !== "MY" && firstName && (
                  <DisplayText
                    variant="h2"
                    style={{
                      fontFamily: "inherit",
                      textShadow: "white 0px 0px 10px",
                      fontStyle: "italic",
                      fontSize: "11px",
                    }}
                  >
                    Created by : {firstName}
                  </DisplayText>
                )}
              </div>
              <div style={{ position: "absolute", right: 0 }}>
                <DisplayCheckbox
                  onChange={(checked) => onSelect(chart, checked)}
                  checked={selectedItems.some((item) => item._id === chart._id)}
                  systemVariant={"primary"}
                  testid={`${chart.sys_entityAttributes.title}-check`}
                ></DisplayCheckbox>
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  margin: "18px",
                }}
              >
                {section === "MY" && (
                  <DisplayIconButton
                    systemVariant={"primary"}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(chart._id);
                    }}
                  >
                    <Delete />
                  </DisplayIconButton>
                )}
              </div>
            </div>
          </DisplayCard>
        </DisplayGrid>
      );
    });
  };

  const renderFilter = () => {
    return (
      <DisplaySearchBar
        placeholder="Search by chart name"
        data={filters.title}
        onClick={handleSearch}
        onClear={handleSearch}
        testid="ChartNameSearch"
      ></DisplaySearchBar>
    );
  };

  const renderTabs = () => {
    return (
      <DisplayTabs
        tabs={TABS}
        defaultSelect={section}
        titleKey="title"
        valueKey="id"
        onChange={onTabSelect}
        variant="scrollable"
      />
    );
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", flexShrink: 1 }}>
        <DisplayGrid container>
          <DisplayGrid item xs={8}>
            <div
              style={{
                display: "flex",
                flexShrink: 1,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <div style={{ flexShrink: 1 }}>{renderTabs()}</div>
              <div style={{ flexShrink: 1 }}>
                <DisplayIconButton
                  systemVariant="info"
                  size="small"
                  onClick={() => {}}
                >
                  <ToolTipWrapper
                    style={{ zIndex: 9999 }}
                    systemVariant="info"
                    placement="bottom-start"
                    title={toolTips["CHART_SELECTOR"]}
                  >
                    <Info fontSize="small" />
                  </ToolTipWrapper>
                </DisplayIconButton>
              </div>
            </div>
          </DisplayGrid>
          <DisplayGrid item xs={4}>
            <div style={{ flexGrow: 1 }}>{renderFilter()}</div>
          </DisplayGrid>
        </DisplayGrid>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          width: "98%",
          alignSelf: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            contain: "strict",
            overflow: "hidden",
            overflowY: "auto",
            marginBottom: "20px",
            width: "100%",
            height: "100%",
          }}
          className="hide_scroll"
        >
          <div
            style={{
              display: "flex",
              padding: "10px",
              alignItems: "flex-start",
              width: "100%",
              height: "100%",
            }}
          >
            <DisplayGrid
              style={{
                width: "100%",
                height: "100%",
                alignContent: "flex-start",
              }}
              container
              spacing={2}
            >
              {!loader && renderSection()}
              {loader && (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <BubbleLoader />
                </div>
              )}
            </DisplayGrid>
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 1, padding: "5px 20px" }}>
        <DisplayGrid container>
          <DisplayGrid item container xs={8}>
            {section == "OTHER" && (
              <DisplayPagination
                totalCount={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onChange={onPageChange}
                currentPage={filters.page ? Number(filters.page) : 1}
              />
            )}
          </DisplayGrid>
          <DisplayGrid item container xs={12} justify="flex-end">
            <DisplayButton
              style={{ fontFamily: "inherit" }}
              onClick={() => {
                onClose(deletedItems);
              }}
              testid="Insights-CloseModel"
            >
              CLOSE
            </DisplayButton>
            <DisplayButton
              style={{ fontFamily: "inherit" }}
              onClick={() => {
                onClose();
                onAdd(selectedItems);
              }}
              testid="Insights-AddChartsToSet"
            >
              ADD
            </DisplayButton>
          </DisplayGrid>
        </DisplayGrid>
      </div>

      <DisplayDialog
        style={{ zIndex: 10000 }}
        open={alert.delete}
        title="Sure to delete ?"
        message="This action cannot be undone"
        onCancel={() => setAlert(false)}
        onConfirm={() => {
          onDelete(alert.id);
        }}
      />
    </div>
  );
};
