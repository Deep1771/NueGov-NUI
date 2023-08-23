import React, { useEffect, useState } from "react";
import {
  deleteEntity,
  entity,
  entityCount,
} from "utils/services/api_services/entity_service";
import { useStateValue } from "utils/store/contexts";

import { SystemIcons } from "utils/icons";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import { BubbleLoader, ErrorFallback } from "components/helper_components";
import { ToolTipWrapper } from "components/wrapper_components";
import {
  DisplayDialog,
  DisplayGrid,
  DisplayTabs,
  DisplayCard,
  DisplaySearchBar,
  DisplayCheckbox,
  DisplayPagination,
  DisplayButton,
  DisplayIconButton,
  DisplayText,
} from "components/display_components";

const TABS = [
  {
    id: "MY",
    title: "My Boards",
  },
  {
    id: "OTHER",
    title: "Pre Configured Boards",
  },
];

const ITEMS_PER_PAGE = 40;
const LIMIT_SELECTION = 15;

export const BoardSelector = (props) => {
  const [{ dashboardState }] = useStateValue();
  const { getLoginName } = UserFactory();
  const { setSnackBar } = GlobalFactory();

  const [section, setSection] = useState("MY");
  const [loader, setLoader] = useState(false);
  const [ownBoards, setOwnBoards] = useState([]);
  const [otherBoards, setOtherBoards] = useState([]);
  const [selectedItems, setSelectedItems] = useState(props.selectedItems);
  const [deletedItems, setDeletedItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({});
  const { onClose, onAdd } = props;
  const [alert, setAlert] = useState({ delete: false });
  const { agencyDefaultBoards, roleDefaultBoards, toolTips } = dashboardState;
  const QUERY_OBJ = {
    appname: "Features",
    modulename: "Insights",
    entityname: "Boards",
    "userInfo.username": getLoginName,
  };

  const { Delete, Info } = SystemIcons;

  //Setters
  const onTabSelect = (section) => setSection(section);

  const onDelete = async (id) => {
    setAlert(false);
    setLoader(true);
    await deleteEntity.remove({
      appname: "Features",
      modulename: "Insights",
      entityname: "Boards",
      id,
      templateName: "Boards",
    });
    getData();
    setSelectedItems(selectedItems.filter((ei) => ei.id != id));
    setDeletedItems([...deletedItems, id]);
  };

  let getData = async () => {
    let { page, ...rest } = filters;
    let entityParams = {
      ...QUERY_OBJ,
      skip: page ? (page - 1) * ITEMS_PER_PAGE : 0,
      limit: ITEMS_PER_PAGE,
      ...rest,
    };
    let countParams = { ...QUERY_OBJ, ...rest };
    let [boards, { data: totalCount }] = await Promise.all([
      entity.get(entityParams),
      entityCount.get(countParams),
    ]);
    if (boards) {
      setLoader(false);
      setTotalCount(totalCount);
      let otherBoards = [...roleDefaultBoards, ...agencyDefaultBoards].filter(
        (eb) =>
          get(eb, "sys_entityAttributes.userInfo.username") != getLoginName &&
          (!filters.boardName ||
            get(eb, "sys_entityAttributes.boardName", "").includes(
              filters.boardName
            ))
      );
      setOwnBoards(boards.length ? boards : []);
      setOtherBoards(otherBoards);
    }
  };

  const handleCardClick = (data) => {
    let isPresent = selectedItems.some((item) => item.id === data.id);
    onSelect(data, !isPresent);
  };

  const onSelect = (data, checked) => {
    if (checked && selectedItems.length > LIMIT_SELECTION - 1) {
      setSnackBar({
        message: `You can only select upto ${LIMIT_SELECTION} boards.`,
        severity: "info",
      });
      return false;
    }

    let items = [...selectedItems];
    if (checked) setSelectedItems([...items, data]);
    else setSelectedItems(items.filter((ei) => ei.id !== data.id));
  };

  const handleSearch = (boardName) => {
    setFilters({
      ...filters,
      boardName,
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

  useEffect(() => {
    mounted && getData() && setLoader(true);
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    setMounted(true);
    setLoader(true);
    getData();
  }, []);

  //render Methods
  const renderSection = () => {
    let boards = section === "MY" ? ownBoards : otherBoards;
    boards = boards.map((eb) => {
      let {
        boardName,
        predefined,
        userInfo,
        boardDescription,
        isPublicBoard = false,
      } = eb.sys_entityAttributes;
      return {
        id: eb._id,
        sys_gUid: eb.sys_gUid,
        boardName,
        predefined,
        userInfo,
        boardDescription,
        isPublicBoard,
      };
    });
    if (!boards.length && !loader) return <ErrorFallback slug="no_result" />;
    else
      return boards.map((board) => {
        let isSelected = selectedItems.some((item) => item.id === board.id);
        return (
          <DisplayGrid
            key={board.id}
            item
            xs={6}
            sm={4}
            md={3}
            lg={3}
            xl={3}
            style={{
              minHeight: "125px",
              maxHeight: "125px",
              display: "flex",
              position: "relative",
              height: "100%",
              flexDirection: "column",
            }}
          >
            <DisplayCard
              onClick={() => handleCardClick(board)}
              style={{
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
              id={`add-charts-card-${board.id}`}
              testid={`add-charts-card-${board.boardName}`}
              systemVariant={"default"}
            >
              <div style={{ display: "flex", flex: 1 }}>
                <DisplayText
                  style={{
                    padding: "10px",
                    fontSize: "15px",
                    fontFamily: "inherit",
                  }}
                >
                  {board.boardName}
                </DisplayText>
              </div>
              <div style={{ display: "flex", flex: 1 }}>
                <DisplayText
                  style={{
                    padding: "10px",
                    fontSize: "12px",
                    fontFamily: "inherit",
                  }}
                >
                  {board.boardDescription}
                </DisplayText>
              </div>
              <div style={{ position: "absolute", right: 0 }}>
                <DisplayCheckbox
                  testid={`${board.boardName}-check`}
                  onChange={(checked) => onSelect(board, checked)}
                  checked={isSelected}
                  systemVariant={"primary"}
                ></DisplayCheckbox>
              </div>
              {board?.isPublicBoard && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    margin: "18px 18px 22px 18px",
                  }}
                >
                  <DisplayText
                    style={{
                      fontSize: "12px",
                      fontFamily: "inherit",
                    }}
                  >
                    Public Board
                  </DisplayText>
                </div>
              )}
              {section === "MY" && (
                <>
                  {" "}
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: 0,
                      margin: "18px",
                    }}
                  >
                    <DisplayIconButton
                      testid={`${board.boardName}-delete`}
                      systemVariant={"primary"}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(board.id);
                      }}
                    >
                      <Delete />
                    </DisplayIconButton>
                  </div>{" "}
                </>
              )}
            </DisplayCard>
          </DisplayGrid>
        );
      });
  };

  const renderFilter = () => {
    return (
      <DisplaySearchBar
        testid={"boardNameSearch"}
        placeholder="Search by board name"
        data={filters.boardName}
        onClick={handleSearch}
        onClear={handleSearch}
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
        testid="Insights-Board"
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
                  testid={"boardInfo"}
                  systemVariant="info"
                  size="small"
                  onClick={() => {}}
                >
                  <ToolTipWrapper
                    style={{ zIndex: 9999 }}
                    systemVariant="info"
                    placement="bottom-start"
                    title={toolTips["BORAD_SELECTOR"]}
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
          width: "100%",
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
              flex: 1,
              alignItems: "flex-start",
              padding: "10px",
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
          <DisplayGrid item container xs={3}>
            {section == "MY" && (
              <DisplayPagination
                totalCount={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onChange={onPageChange}
                currentPage={filters.page ? Number(filters.page) : 1}
              />
            )}
          </DisplayGrid>
          <DisplayGrid item container xs={9} justify="flex-end">
            <DisplayButton
              testid={"Insights-BoardModel-Close"}
              style={{ fontFamily: "inherit" }}
              onClick={() => {
                onClose(deletedItems);
              }}
            >
              CLOSE
            </DisplayButton>
            <DisplayButton
              testid={"Insights-BoardModel-Add"}
              style={{ fontFamily: "inherit" }}
              onClick={() => {
                onClose();
                onAdd(selectedItems);
              }}
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
