import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import update from "immutability-helper";
import queryString from "query-string";
import { Menu, MenuItem } from "@material-ui/core";
import _ from "lodash";
import { entity } from "utils/services/api_services/entity_service";
import {
  UserFactory,
  GlobalFactory,
  ThemeFactory,
} from "utils/services/factory_services";
import { useStateValue } from "utils/store/contexts";
import { BubbleLoader } from "components/helper_components";
import { BoardDetail } from "./screens/board_detail";
import { BoardLayout } from "./screens/board_layout";
import { BoardSelector } from "./screens/board_selector";
import {
  DisplayButton,
  DisplayModal,
  DisplayText,
  DisplayIconButton,
} from "components/display_components";
import { ErrorFallback } from "components/helper_components";
import { SystemIcons } from "utils/icons";
import { SortableCard } from "./components/sortable_card";
import { ToolTipWrapper } from "components/wrapper_components";
import { VideoPlayer } from "components/helper_components/video_player";
import { isDefined } from "utils/services/helper_services/object_methods";
import { SystemTabCarousel } from "components/system_components";

const QUERY_OBJ = {
  appname: "NJAdmin",
  modulename: "NJ-Personalization",
  entityname: "PinnedBoard",
};

export const Board = (props) => {
  const { unmountURL, relationMeta, formData, handleFullscreen, handle } =
    props;

  const { getAllData, setBackDrop, closeBackDrop, getContextualHelperData } =
    GlobalFactory();
  const { getVariantObj } = ThemeFactory();
  const { dark } = getVariantObj("primary");
  const {
    getAgencyId,
    getRefObj,
    getId,
    getAgencyDetails,
    checkModuleAccess,
    isNJAdmin,
  } = UserFactory();
  const { showHelper } = getAgencyDetails?.sys_entityAttributes || {};
  const [{ dashboardState }, dispatch] = useStateValue();
  const history = useHistory();
  const secColor = getVariantObj("info").dark.bgColor;
  const queryParams = queryString.parse(history.location.search);
  let { id } = queryParams;
  let {
    Add,
    Carousel,
    Save,
    Close,
    Info,
    Help,
    FullscreenRounded,
    FullscreenExit,
  } = SystemIcons;
  const {
    userDefaultBoard,
    triggerSave,
    boardSetUpdated,
    boardUpdated,
    savePopup,
    toolTips,
  } = dashboardState;

  const [addMenu, setAddMenu] = useState(null);
  const [boardSelector, setBoardSelector] = useState(false);
  const [boardTitle, setBoardTitle] = useState();
  const [activeboardId, setActiveBoardId] = useState("");
  const [cards, setCards] = useState([]);
  const [createBoard, setCreateBoard] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState(false);
  const [loader, setLoader] = useState(true);
  const [openHelp, setHelp] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isPublicUser = sessionStorage.getItem("public-user");
  //for detailpage dashboard
  id = activeboardId ? activeboardId : id;
  const helperData = getContextualHelperData("DASHBOARD_SCREEN");

  let ISMOUNTED = true;

  const boardBtnStyle = {
    display: "flex",
    flexShrink: 1,
    backgroundColor: "#ffffff",
    boxShadow:
      "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
    clipPath: "inset(-5px 0px -5px 0px)",
    alignItems: "center",
    height: "36px",
    width: "3%",
    justifyContent: "center",
  };
  const filterCards = (cards) => cards?.filter((ec) => Object.keys(ec)?.length);
  const TOOL_TIP_MSG = toolTips["ADD_BOARD"];
  const BOARDS_QUERY = {
    appname: "Features",
    modulename: "Insights",
  };

  const setSavePopup = (prop) => {
    dispatch({
      type: "SET_SAVE_POPUP",
      payload: prop,
    });
  };

  const getData = () => {
    if (unmountURL) {
      let { dashboardConfig } = (unmountURL && relationMeta[0]?.metadata) || {};
      let { defaultBoardIds } = dashboardConfig || [];

      console.log("comes to unmount of url related list dashbaord");
      let ids = defaultBoardIds ? defaultBoardIds : [];
      let boardsDetail = entity.get({
        ...BOARDS_QUERY,
        entityname: "Boards",
        skip: 0,
        limit: 10,
        sys_ids: JSON.stringify(ids),
      });

      boardsDetail
        .then((res) => {
          console.log("ids -> ", ids);
          console.log("boardSet -> ", res);
          res = res?.sort((b1, b2) =>
            b1?.sys_entityAttributes?.boardOrder <
            b2?.sys_entityAttributes?.boardOrder
              ? -1
              : b1?.sys_entityAttributes?.boardOrder >
                b2?.sys_entityAttributes?.boardOrder
              ? 1
              : 0
          );
          let boardSet = res.map((item) => {
            let { boardName, predefined, userInfo } = item.sys_entityAttributes;
            return {
              id: item._id,
              sys_gUid: item.sys_gUid,
              boardName,
              predefined,
              userInfo,
            };
          });
          setCards(boardSet);
          handleActiveBoard(boardSet);
        })
        .then(() => {
          setLoader(false);
        })
        .catch((err) => {
          console.log("error in 107 -> ", err);
        });
    } else {
      getAllData({ entityname: "PinnedBoard" }).then((res) => {
        if (res?.length) {
          res.map((item) => {
            setData(item);
            let pinnedBoards = filterCards(
              item?.sys_entityAttributes?.pinnedItems
            );
            let boardsDetail = entity.get({
              ...BOARDS_QUERY,
              entityname: "Boards",
              skip: 0,
              limit: pinnedBoards?.length,
              sys_ids: JSON.stringify(pinnedBoards?.map((item) => item.id)),
            });
            boardsDetail.then((res) => {
              const filteredBoards = (res || []).filter((board) => {
                const { modules = [] } = board?.sys_entityAttributes || {};
                if (modules.length === 0) return true;
                return modules.some((module) => {
                  if (_.isEmpty(module)) return true;
                  const isModuleAccessible = checkModuleAccess(
                    "NueGov",
                    module?.sys_moduleName
                  );
                  return isModuleAccessible;
                });
              });
              constructBoardSet(filteredBoards, pinnedBoards);
            });
          });
        } else {
          let payload = {
            sys_agencyId: getAgencyId,
            sys_entityAttributes: {
              userInfo: getRefObj(),
            },
            sys_userId: getId,
          };
          entity.create({ ...QUERY_OBJ }, payload).then(({ id, sys_gUid }) => {
            setData({ ...payload, _id: id, sys_gUid });
            setBoardSelector(true);
            setLoader(false);
          });
        }
      });
    }
  };

  function handleFullScreenState(event) {
    if (event?.type === "fullscreenchange") {
      setIsFullScreen((prev) => !isFullScreen);
    }
  }

  [
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "msfullscreenchange",
  ].forEach((eventType) =>
    document.addEventListener(eventType, handleFullScreenState, false)
  );

  const toggleFullScreen = () => {
    let ele = document.getElementById("dashboard-container");
    if (ele)
      if (!isFullScreen) ele.requestFullscreen().catch((e) => {});
      else {
        document.exitFullscreen().catch((e) => {});
      }
  };

  const constructBoardSet = (res, pinnedBoards) => {
    let boardSet = res.map((item) => {
      let { boardName, predefined, userInfo } = item.sys_entityAttributes;
      return {
        id: item._id,
        sys_gUid: item.sys_gUid,
        boardName,
        predefined,
        userInfo,
      };
    });
    boardSet = pinnedBoards?.map((epb) =>
      boardSet.find((ebs) => ebs.id === epb.id)
    );

    boardSet = boardSet?.filter((eb) => !!eb);
    setCards(boardSet);
    if (!boardSet?.length) {
      if (id) setError(true);
      else if (!sessionStorage.getItem("board-selector")) {
        setBoardSelector(true);
        sessionStorage.setItem("board-selector", true);
      }
      setLoader(false);
    } else handleActiveBoard(boardSet);
  };

  const handleActiveBoard = (cards) => {
    if (!userDefaultBoard.id && !id) {
      setActiveBoard(cards[0]);
      setLoader(false);
    } else {
      let result;
      if (userDefaultBoard && !id) {
        let userDef = cards.find((obj) => obj.id === userDefaultBoard.id);
        if (userDef) setActiveBoard(userDef);
        else setActiveBoard(cards[0]);
      } else if (id) {
        let invalidId = cards.find((obj) => id === obj.id);
        if (!invalidId) {
          setActiveBoard(cards[0]);
        }
        result = cards.find((obj) => obj.id === id);
      }
      if (result) setActiveBoard(result);
      setLoader(false);
    }
  };

  const onBoardSort = useCallback(
    (dragIndex, hoverIndex) => {
      const dragCard = cards[dragIndex];
      setCards(
        update(cards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        })
      );
      onboardSetChange(true);
    },
    [cards]
  );

  useEffect(() => {
    if (boardUpdated || boardSetUpdated) {
      setSavePopup(true);
    }
  }, [boardUpdated, boardSetUpdated]);

  let onBoardClose = (index, boardId) => {
    let newTabs = [...cards];
    newTabs.splice(index, 1);
    setCards(newTabs);
    onboardSetChange(true);
    if (boardId === id) {
      if (newTabs.length) setActiveBoard(newTabs[0]);
      else ISMOUNTED && history.push(`/app/dashboard`);
    }
  };

  let setActiveBoard = (board) => {
    if (board) {
      let { id, boardName } = board;
      if (id) {
        setBoardTitle(boardName);
        if (unmountURL) {
          setActiveBoardId(id);
        } else {
          ISMOUNTED && history.push(`/app/dashboard?id=${id}`);
        }
      }
    }
  };

  const renderCard = (card, index) => {
    return (
      <div>
        <SortableCard
          key={card.id}
          index={index}
          id={card.id}
          text={card.boardName}
          onCardSort={onBoardSort}
          onCardDelete={onBoardClose}
          onCardClick={setActiveBoard}
          activeId={id}
          pinnedBoards={cards}
          cardData={card}
          updateTitle={(updatedTitle) => {
            setBoardTitle(updatedTitle);
          }}
          onBoardUpdate={(cards) => {
            addBoards(cards);
            onboardSetChange(true);
            setCards(cards);
          }}
          isPublicUser={isPublicUser}
          unmountURL={unmountURL}
        />
      </div>
    );
  };

  useEffect(() => {
    getData();

    // setInterval(() => {
    //     setSavePopup(true)
    // },30000)

    //first usage in our app
    return () => {
      dispatch({
        type: "EDIT_LAYOUT",
        payload: false,
      });
      dispatch({
        type: "SET_SAVE_POPUP",
        payload: false,
      });
      ISMOUNTED = false;
    };
  }, []);

  useEffect(() => {
    if (triggerSave && boardSetUpdated) saveBoard();
    else intializeSave(false);
  }, [triggerSave, boardSetUpdated]);

  const onboardSetChange = (prop) => {
    dispatch({
      type: "BOARD_SET_UPDATE",
      payload: prop,
    });
    dispatch({
      type: "SET_SAVE_POPUP",
      payload: prop,
    });
  };

  const addBoards = (boards) => {
    setActiveOnNewBoard(boards);
    setCards(boards);
    onboardSetChange(true);
    setError(false);
  };

  const setActiveOnNewBoard = (boards) => {
    if (!id && boards.length) {
      setActiveBoard(boards[0]);
    } else if (boards.length) {
      let toBeActive = boards.filter((el) => {
        return cards.indexOf(el) < 0;
      });
      setActiveBoard(toBeActive[0]);
      if (id) {
        let invalidId = boards.find((obj) => obj.id === id);
        if (!invalidId) {
          setActiveBoard(boards[0]);
        }
      }
    }
  };

  const saveBoard = () => {
    if (data) {
      setBackDrop("Saving..");
      let payload = { ...data };
      payload.sys_entityAttributes.pinnedItems = [...cards];

      entity.update({ ...QUERY_OBJ, id: payload._id }, payload).then((res) => {
        if (res) closeBackDrop();
        else throw "could not add data!";
      });
      onboardSetChange(false);
    }
  };

  const intializeSave = (prop) => {
    dispatch({
      type: "TRIGGER_SAVE",
      payload: prop,
    });
  };

  const checkForVideoLinks = () => {
    let videoLinks = helperData.videoLinks.filter((e) =>
      isDefined(e.link)
    ).length;
    return videoLinks > 0;
  };

  if (loader)
    return (
      <div style={{ height: "100%", width: "100%" }}>
        <BubbleLoader />;
      </div>
    );
  else
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        {(boardUpdated || boardSetUpdated) && savePopup && (
          <div
            style={{
              width: "100%",
              height: "48px",
              backgroundColor: "#FF8F00",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "0 16px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flex: 6,
                  justifyContent: "flex-start",
                }}
              >
                <DisplayText
                  variant="subtitle1"
                  style={{
                    fontFamily: "inherit",
                    fontWeight: 500,
                    color: "white",
                  }}
                >
                  You have unsaved changes, click on Save.
                </DisplayText>
              </div>
              <div
                style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
              >
                <DisplayButton
                  size="medium"
                  systemVariant="default"
                  onClick={() => {
                    intializeSave(true);
                    setSavePopup(false);
                  }}
                  style={{ fontFamily: "inherit", padding: "4px" }}
                  testid="Insights-Board-Save"
                >
                  Save
                </DisplayButton>
                <DisplayIconButton
                  size="small"
                  onClick={() => {
                    setSavePopup(false);
                  }}
                  style={{ fontFamily: "inherit", padding: "4px" }}
                  testid="Insights-Board-Close"
                >
                  <Close fontSize="small" />
                </DisplayIconButton>
              </div>
            </div>
          </div>
        )}

        {openHelp && (
          <VideoPlayer
            handleModalClose={() => setHelp(false)}
            screenName={"DASHBOARD_SCREEN"}
            helperData={helperData}
          />
        )}
        {!isPublicUser && (
          <DisplayModal
            disableBackdropClick
            style={{ overflow: "hidden" }}
            open={boardSelector}
            onClose={() => {
              setBoardSelector(false);
            }}
            maxWidth={"xl"}
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
              <BoardSelector
                onClose={(deletedItems = []) => {
                  setBoardSelector(false);
                  setAddMenu(null);
                  if (deletedItems.length) {
                    let updatedArray = cards.filter(
                      (ec) => !deletedItems.includes(ec.id)
                    );
                    setCards(updatedArray);
                    if (deletedItems == id) setActiveBoard(updatedArray[0]);
                  }
                }}
                onAdd={addBoards}
                selectedItems={cards || []}
              />
            </div>
          </DisplayModal>
        )}

        <div
          style={{
            display: "flex",
            flex: 19,
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {error && !cards.length && (
            <div style={{ display: "flex", flex: 1, contain: "strict" }}>
              <ErrorFallback slug="something_went_wrong" />
            </div>
          )}
          {!unmountURL && !(id || activeboardId) && (
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
                <Carousel
                  style={{ height: 200, width: 200, color: "#86898a" }}
                />
              </DisplayText>
              <DisplayText
                variant="h4"
                align="center"
                style={{ fontFamily: "inherit" }}
                color="textSecondary"
                component="p"
              >
                {isPublicUser ? "YOUR BOARD SET" : "CREATE YOUR OWN BOARD SET"}
              </DisplayText>
              {!isPublicUser && (
                <DisplayText
                  variant="h6"
                  align="center"
                  style={{ color: "#999a9b", fontFamily: "inherit" }}
                  component="p"
                >
                  Select from Collection of Configured Boards{" "}
                  <DisplayButton
                    onClick={() => {
                      setBoardSelector(true);
                    }}
                    testid="Insights-CreateBoardLink"
                  >
                    {" "}
                    <u>Click here</u>{" "}
                  </DisplayButton>
                </DisplayText>
              )}
            </div>
          )}
          {unmountURL && !(id || activeboardId) && (
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
                <Carousel
                  style={{ height: 200, width: 200, color: "#86898a" }}
                />
              </DisplayText>
              <DisplayText
                variant="h4"
                align="center"
                style={{ fontFamily: "inherit" }}
                color="textSecondary"
                component="p"
              >
                CREATING YOUR OWN BOARD SET
              </DisplayText>
              <DisplayText
                variant="h6"
                align="center"
                style={{ color: "#999a9b", fontFamily: "inherit" }}
                component="p"
              >
                {/* Select from Collection of Configured Boards{" "} */}
                we will configure the board automatically
              </DisplayText>
            </div>
          )}
          {(id || activeboardId) && !loader && !error && (
            <BoardLayout
              boardTitle={boardTitle}
              activeboardId={activeboardId}
              unmountURL={unmountURL}
              relationMeta={relationMeta}
              formData={formData}
            />
          )}
        </div>
        <div style={{ display: "flex", flex: 0, marginTop: "1px" }}>
          <div
            style={{
              display: "flex",
              flex: 19,
              flexDirection: "row",
              width: "100%",
              height: "100%",
              backgroundColor: "#ffffff",
              // borderBottom: "1px solid #c3c3c3",
              minWidth: "300px",
              height: "36px",
            }}
          >
            <div
              style={{
                width: unmountURL ? "97%" : !isPublicUser ? "94%" : "97%",
                display: "flex",
                height: "36px",
              }}
            >
              <SystemTabCarousel style={{ zIndex: 0 }}>
                {cards?.map((card, i) => renderCard(card, i))}
              </SystemTabCarousel>
            </div>

            <div style={boardBtnStyle}>
              <ToolTipWrapper
                systemVariant="info"
                title={isFullScreen ? "Exit full screen" : "Full Screen"}
                placement="bottom-start"
              >
                <DisplayButton onClick={toggleFullScreen}>
                  {isFullScreen ? <FullscreenExit /> : <FullscreenRounded />}
                </DisplayButton>
              </ToolTipWrapper>
            </div>

            {!unmountURL && !isPublicUser && (
              <ToolTipWrapper
                systemVariant="info"
                title="Create (or) Select Boards"
              >
                <div style={boardBtnStyle}>
                  <DisplayButton
                    onClick={(e) => setAddMenu(e.currentTarget)}
                    testid="Insights-boardModel-Select-Create"
                  >
                    <Add />
                  </DisplayButton>
                </div>
              </ToolTipWrapper>
            )}
            {addMenu && (
              <Menu
                id="dashboard-Add-menu"
                anchorEl={addMenu}
                keepMounted
                open={Boolean(addMenu)}
                onClose={(e) => {
                  setAddMenu(null);
                }}
              >
                <MenuItem
                  onClick={() => {
                    setBoardSelector(true);
                  }}
                  style={{ fontSize: "14px" }}
                  testid="Insights-BoardModel-Select"
                >
                  Select Boards
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setCreateBoard(true);
                  }}
                  style={{ fontSize: "14px" }}
                  testid="Insights-BoardModel-Create"
                >
                  Create Board
                </MenuItem>
              </Menu>
            )}
            <div>
              <DisplayModal
                open={createBoard}
                onClose={() => {
                  setCreateBoard(false);
                }}
                onClick={(e) => e.stopPropagation()}
                disableBackdropClick
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "31rem",
                    height: "17rem",
                    padding: "1rem",
                  }}
                >
                  <BoardDetail
                    mode={"NEW"}
                    onClose={() => {
                      setCreateBoard(false);
                      setAddMenu(null);
                    }}
                    pinnedData={cards}
                    onAddBoard={(boards) => {
                      addBoards(boards);
                      setCreateBoard(false);
                      setAddMenu(null);
                    }}
                  />
                </div>
              </DisplayModal>
            </div>
          </div>
          <div
            style={{
              flexShrink: 1,
              display: "flex",
              backgroundColor: "#ffffff",
              boxShadow: "0px 3px 8px 0px rgba(0,0,0,0.24)",
              clipPath: "inset(-5px 0px -5px 0px)",
              alignItems: "center",
              height: "36px",
            }}
          >
            {/* <DisplayIconButton
              systemVariant="info"
              size="small"
              onClick={() => {}}
            >
              <ToolTipWrapper systemVariant="info" title={TOOL_TIP_MSG}>
                <Info fontSize="small" />
              </ToolTipWrapper>
            </DisplayIconButton> */}
            {(isNJAdmin() ||
              (helperData && checkForVideoLinks() && showHelper)) && (
              <DisplayIconButton onClick={() => setHelp(true)}>
                <ToolTipWrapper title="Help" placement="bottom-start">
                  <Help style={{ color: dark.bgColor, fontSize: "20px" }} />
                </ToolTipWrapper>
              </DisplayIconButton>
            )}
            &nbsp;
          </div>
        </div>
      </div>
    );
};
