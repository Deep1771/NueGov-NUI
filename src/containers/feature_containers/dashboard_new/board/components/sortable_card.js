import React, { useRef, useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Menu, MenuItem } from "@material-ui/core";
import {
  DisplayIconButton,
  DisplaySnackbar,
  DisplayModal,
} from "components/display_components";
import { SystemIcons } from "utils/icons/";
import { useStateValue } from "utils/store/contexts";
import {
  ThemeFactory,
  GlobalFactory,
  UserFactory,
} from "utils/services/factory_services";
import { entity } from "utils/services/api_services/entity_service";
import { BoardDetail } from "../screens/board_detail";
import { makeStyles } from "@material-ui/core/styles";
import { ToolTipWrapper } from "components/wrapper_components";
import { SaveModal } from "./saveModal";

const useStyles = makeStyles({
  active: ({ dark }) => ({
    backgroundColor: dark.text,
    color: dark.bgColor,
    borderBottom: `4px solid #FF8A00`,
    fontWeight: 600,
    fontSize: "14px",
    boxShadow: "rgba(0, 0, 0, 0.45) 0px 15px 15px -20px",
  }),
  unactive: ({ dark }) => ({
    backgroundColor: "white",
    color: "#666666",
    borderRight: "1px solid #ebebeb",
    borderLeft: "1px solid #ebebeb",
    fontWeight: 500,
    fontSize: "12px",
  }),
});

const { Clear, MoreVertical } = SystemIcons;

export const SortableCard = ({
  id,
  text,
  index,
  activeId,
  onCardSort,
  onCardDelete,
  onCardClick,
  pinnedBoards,
  cardData,
  updateTitle,
  onBoardUpdate,
  unmountURL,
  isPublicUser,
}) => {
  const { isNJAdmin, isSuperAdmin, getLoginName } = UserFactory();
  const { predefined, userInfo } = cardData;
  const { getVariantObj } = ThemeFactory();
  const { setUserDefaultBoard, getUserDefaults, setSnackBar } = GlobalFactory();
  const ref = useRef(null);
  const classes = useStyles(getVariantObj("primary"));
  const [{ dashboardState }, dispatch] = useStateValue();
  const { editLayout, boardUpdated, toolTips } = dashboardState;

  const [anchorEl, setAnchorEl] = useState(null);
  const [message, setMessage] = useState();
  const [boardTitle, setBoardTitle] = useState(text);
  const [boardDetail, setBoardDetail] = useState(null);
  const [saveModal, setSaveModal] = useState({ flag: false });

  const [, drop] = useDrop({
    accept: "card",
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      onCardSort(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { type: "card", id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const setUserDefault = (selectedId, index, text) => {
    const selectedBoard = pinnedBoards.find(({ id }) => id === selectedId);
    setUserDefaultBoard(selectedBoard);
    getUserDefaults().then((res) => {
      let query = {
        appname: "NJAdmin",
        modulename: "NJ-Personalization",
        entityname: "UserDefault",
        id: res._id,
      };

      let obj = { ...res };
      obj["sys_entityAttributes"]["boards"] = { ...selectedBoard };
      let updatedData = { ...obj };

      entity
        .update(query, updatedData)
        .then((res) => {})
        .catch((e) => {});
    });
    setAnchorEl(null);
    setSnackBar({
      message: `${text} has been set as default`,
      severity: "info",
    });
  };

  useEffect(() => {
    setBoardTitle(boardTitle);
    if (activeId === id) {
      let ele = document.getElementById("active");
      if (ele)
        ele.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      updateTitle(boardTitle);
    }
  }, [boardTitle]);

  const onChangeAction = (action, prop) => {
    if (prop == "continue") {
      action == "delete" ? onCardDelete(index, id) : onCardClick(cardData);
      dispatch({
        type: "SET_SAVE_POPUP",
        payload: false,
      });
    } else {
      if (boardUpdated) {
        if (action == "delete" && !(activeId === id)) onCardDelete(index, id);
        else setSaveModal({ flag: true, action });
      } else
        action == "delete" ? onCardDelete(index, id) : onCardClick(cardData);
    }
  };

  const clearMessage = () => setMessage(null);

  const createdByMe =
    userInfo && userInfo.username == getLoginName ? true : false;

  return (
    <>
      <div
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onChangeAction("cardClick");
        }}
        id={activeId === id ? "active" : "inactive"}
        className={activeId === id ? classes.active : classes.unactive}
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          padding: "0rem 0.5rem 0rem 0.5rem",
          minWidth: "130px",
          overflow: "hidden",
          height: "100%",
        }}
      >
        <ToolTipWrapper systemVariant="info" title={boardTitle}>
          <div
            style={{
              flex: 1,
              fontFamily: "inherit",
              overflow: "hidden",
              textOverflow: "ellipsis",
              paddingLeft: isPublicUser ? "0rem" : "0.5rem",
              whiteSpace: "nowrap",
              cursor: isDragging ? "move" : "pointer",
              width: "100%",
              ...(isPublicUser && { textAlign: "center" }),
            }}
            testid={`BoardTitle-${boardTitle}`}
          >
            {boardTitle}
          </div>
        </ToolTipWrapper>
        <ToolTipWrapper systemVariant="info" title={toolTips["BOARD_OPTIONS"]}>
          <div>
            {!unmountURL && !isPublicUser ? (
              <DisplayIconButton
                testid={`BoardMenu-${boardTitle}`}
                systemVariant="primary"
                style={{ flex: 0, padding: "4px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setAnchorEl(e.currentTarget);
                }}
              >
                <MoreVertical fontSize="small" />
              </DisplayIconButton>
            ) : (
              <div></div>
            )}
          </div>
        </ToolTipWrapper>
        {anchorEl && (
          <Menu
            id="dashboard-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={(e) => {
              e.stopPropagation();
              setAnchorEl(null);
            }}
          >
            {/* {(isNJAdmin() || isSuperAdmin) && (
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setBoardDetail("EDIT");
                }}
                style={{ fontSize: "14px" }}
                testid="Board-Configure"
              >
                Configure
              </MenuItem>
            )} */}
            {(isNJAdmin() || isSuperAdmin || createdByMe) && (
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setBoardDetail("RENAME");
                }}
                style={{ fontSize: "14px" }}
                testid="Board-Rename"
              >
                Rename
              </MenuItem>
            )}
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setUserDefault(id, index, text);
              }}
              style={{ fontSize: "14px" }}
              testid="Board-Default"
            >
              Set as Default
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setBoardDetail("CLONE");
              }}
              style={{ fontSize: "14px" }}
              testid="Board-Clone"
            >
              Clone
            </MenuItem>
          </Menu>
        )}
        {message && (
          <DisplaySnackbar
            open={!!message}
            message={message}
            onClose={clearMessage}
          />
        )}
        <div>
          <DisplayModal
            open={boardDetail ? true : false}
            onClose={() => {
              setBoardDetail(null);
            }}
            maxWidth="md"
            onClick={(e) => e.stopPropagation()}
            disableBackdropClick
          >
            {boardDetail == "EDIT" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "50vw",
                  height: "60vh",
                }}
              >
                <BoardDetail
                  boardId={cardData.id}
                  mode={boardDetail}
                  onTitleUpdate={(title) => {
                    setBoardTitle(title);
                  }}
                  onClose={() => {
                    setBoardDetail(null);
                    setAnchorEl(null);
                  }}
                  pinnedData={pinnedBoards}
                />
              </div>
            )}
            {["CLONE", "RENAME"].includes(boardDetail) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "31rem",
                  height: "16rem",
                  padding: "1rem",
                }}
              >
                <BoardDetail
                  boardId={cardData.id}
                  mode={boardDetail}
                  onTitleUpdate={(title) => {
                    setBoardTitle(title);
                  }}
                  onClose={() => {
                    setBoardDetail(null);
                    setAnchorEl(null);
                  }}
                  pinnedData={pinnedBoards}
                  onAddBoard={(cards) => onBoardUpdate(cards)}
                />
              </div>
            )}
          </DisplayModal>
        </div>
        {!unmountURL && !isPublicUser && (
          <DisplayIconButton
            style={{ flex: 0, color: "red", padding: "4px" }}
            onClick={(e) => {
              e.stopPropagation();
              onChangeAction("delete");
            }}
            testid={`BoardClose-${boardTitle}`}
          >
            {" "}
            <Clear fontSize="small" />{" "}
          </DisplayIconButton>
        )}
      </div>
      <SaveModal
        openDialog={saveModal.flag}
        onClose={() => {
          setSaveModal(false);
        }}
        action={saveModal.action}
        onContinue={(action) => {
          onChangeAction(action, "continue");
        }}
      />
    </>
  );
};
