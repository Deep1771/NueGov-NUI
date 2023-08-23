import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { DetailPage } from "containers/composite_containers/detail_container/components/detail_page";
import {
  DisplayInput,
  DisplayButton,
  DisplayCheckbox,
  DisplayText,
} from "components/display_components";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { UserFactory, ThemeFactory } from "utils/services/factory_services";
import { BubbleLoader } from "components/helper_components";
import { SystemIcons } from "utils/icons/";
import { ContainerWrapper } from "components/wrapper_components";
import { DisplayProgress } from "components/display_components/progress_bar";

export const BoardDetail = (props) => {
  const { boardId, mode, onTitleUpdate, onClose, pinnedData, onAddBoard } =
    props;
  const { getRefObj, getAgencyId, getId } = UserFactory();
  const { getVariantObj } = ThemeFactory();
  const [boardData, setBoardData] = useState();
  const [loading, setLoading] = useState(true);
  const [pinnedCheck, setPinnedCheck] = useState(false);
  const [metadata, setMetadata] = useState();
  const [progress, setProgress] = useState(false);
  const { Dashboard } = SystemIcons;
  const secColor = getVariantObj("primary").dark.bgColor;

  const APP_MODULE = {
    appname: "Features",
    modulename: "Insights",
  };
  const QUERY_OBJ = {
    ...APP_MODULE,
    entityname: "Boards",
  };

  const boardsDetail = () => {
    if (mode != "NEW") {
      entity.get({ ...QUERY_OBJ, id: boardId }).then((res) => {
        if (mode == "CLONE") {
          res.sys_gUid = `Boards-${uuidv4()}`;
          res.sys_entityAttributes.userInfo = getRefObj();

          delete res.sys_entityAttributes.predefined;
          delete res.sys_entityAttributes.roleName;
        }
        setBoardData(res);
        setLoading(false);
      });
    } else {
      let boardObj = {
        sys_agencyId: getAgencyId,
        sys_entityAttributes: {
          userInfo: getRefObj(),
        },
        sys_userId: getId,
      };
      setBoardData(boardObj);
    }

    if (mode == "EDIT") {
      entityTemplate
        .get({ ...APP_MODULE, groupname: "Boards" })
        .then((metadataObj) => {
          let sys_topLevel =
            metadataObj.sys_entityAttributes.sys_topLevel.filter(
              (item) =>
                item.type == "SECTION" ||
                [
                  "boardName",
                  "agency",
                  "predefined",
                  "roleName",
                  "boardDescription",
                ].includes(item.name)
            );
          metadataObj = {
            ...metadataObj,
            sys_entityAttributes: {
              ...metadataObj.sys_entityAttributes,
              sys_topLevel,
            },
          };
          setMetadata(metadataObj);
        });
    } else setLoading(false);
  };

  const onBoardTitleChange = (title) => {
    setBoardData({
      ...boardData,
      sys_entityAttributes: {
        ...boardData.sys_entityAttributes,
        boardName: title,
      },
    });
  };

  const saveBoard = () => {
    setProgress(true);
    let updatedData = { ...boardData };
    let { boardName, predefined } = boardData.sys_entityAttributes;
    if (["NEW", "CLONE"].includes(mode)) {
      delete updatedData._id;
      entity
        .create(QUERY_OBJ, updatedData)
        .then((res) => {
          if (pinnedCheck) {
            let newBoard = {
              id: res.id,
              sys_gUid: res.sys_gUid,
              boardName,
              predefined,
              userInfo: getRefObj(),
            };
            let pinnedItems = [...pinnedData, newBoard];
            onAddBoard && onAddBoard(pinnedItems);
          }
          onClose();
          setProgress(false);
        })
        .catch((e) => console.log(e));
    } else {
      entity
        .update({ ...QUERY_OBJ, id: boardId }, updatedData)
        .then((res) => {
          onTitleUpdate && onTitleUpdate(boardName);
          onClose();
          setProgress(false);
        })
        .catch((e) => console.log(e));
    }
  };

  const onPinnedChecked = () => {
    pinnedCheck ? setPinnedCheck(false) : setPinnedCheck(true);
  };

  useEffect(() => {
    boardsDetail();
  }, []);

  if (mode !== "EDIT" && boardData)
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: "auto" }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "center",
            color: "rgb(166, 164, 164)",
            fontSize: "2rem",
            fontFamily: "inherit",
          }}
        >
          {mode == "RENAME" && "Rename Board"} {mode == "NEW" && "Create Board"}{" "}
          {mode == "CLONE" && "Clone Board"}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Dashboard style={{ fontSize: "7rem", color: "lightGrey" }} />
        </div>
        <div style={{ padding: "0px 18px" }}>
          <DisplayInput
            id="standard-basic"
            onChange={onBoardTitleChange}
            onClick={(e) => {
              e.stopPropagation();
            }}
            value={boardData ? boardData.sys_entityAttributes.boardName : ""}
            placeholder="Enter Board name here"
            variant="standard"
            testid="Insights-BoardSetName"
          />
          {progress && (
            <DisplayProgress type="linear" style={{ width: "inherit" }} />
          )}
          {pinnedData.length <= 14 && ["NEW", "CLONE"].includes(mode) && (
            <div>
              <DisplayCheckbox
                checked={pinnedCheck}
                onChange={() => {
                  onPinnedChecked();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{ marginRight: "0px" }}
                testid="Insights-AddToBoardSet"
              />
              <DisplayText variant="h2" style={{ fontColor: "grey" }}>
                Add to Board Set
              </DisplayText>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "row-reverse" }}>
          <DisplayButton
            disabled={!boardData.sys_entityAttributes.boardName}
            onClick={(e) => {
              e.stopPropagation();
              saveBoard();
            }}
            testid="Insights-SaveBoard"
          >
            {" "}
            Save{" "}
          </DisplayButton>
          <DisplayButton
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            testid="Insights-CloseBoard"
          >
            {" "}
            Close{" "}
          </DisplayButton>
        </div>
      </div>
    );
  else if (metadata && boardData)
    return (
      <ContainerWrapper onClick={(e) => e.stopPropagation()}>
        <div style={{ backgroundColor: secColor, padding: "5px 10px" }}>
          <DisplayText
            variant="h5"
            style={{ flex: 8, fontFamily: "inherit", color: "white" }}
          >
            Configure Board
          </DisplayText>
        </div>
        <DetailPage
          data={boardData}
          metadata={metadata}
          appname="Features"
          modulename="Insights"
          groupname="Boards"
          id={boardData._id}
          saveCallback={() => {
            onClose();
            onTitleUpdate(boardData.sys_entityAttributes.boardName);
          }}
          mode={mode}
          options={{
            hideNavbar: true,
            hideTitlebar: true,
            hideFeatureButtons: true,
          }}
          showToolbar="false"
          onClose={() => {
            onClose();
          }}
          formCallback={(formData) => {
            setBoardData(formData);
          }}
        />
      </ContainerWrapper>
    );
  else
    return (
      <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
        <BubbleLoader />
      </div>
    );
};
