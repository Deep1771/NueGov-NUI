import React, { useEffect, useRef, useState } from "react";
import { Slide, Fade, Card } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { basicEntityData } from "utils/services/helper_services/system_methods";
import {
  deleteEntity,
  entity,
} from "utils/services/api_services/entity_service";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import { useStateValue } from "utils/store/contexts";
import { Banner, BubbleLoader } from "components/helper_components";
import { AppPanel } from "containers/user_containers/personalization/app_panel";
import {
  DisplayCard,
  DisplayDialog,
  DisplayFab,
  DisplayGrid,
  DisplayIconButton,
  DisplayModal,
  DisplayText,
  DisplaySearchBar,
} from "components/display_components";
import { PaperWrapper, ToolTipWrapper } from "components/wrapper_components";
import Zoom from "@material-ui/core/Zoom";
import { SystemIcons } from "utils/icons";
import { FixedSizeList as List, areEqual } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

export const PresetPanel = () => {
  const { getLoginName, getRefObj } = UserFactory();
  const {
    getUserDefaults,
    setActivePreset,
    setDefaultPreset,
    setSnackBar,
    toggleDrawer,
    handleSidebar,
  } = GlobalFactory();
  const shellObject = basicEntityData();
  const [{ presetState }] = useStateValue();
  const { activePreset, defaultPreset } = presetState;
  const {
    Add,
    CheckCircleOutline,
    DeleteTwoTone,
    Edit,
    NavigateNext,
    RadioOutlined,
  } = SystemIcons;
  const [appPanelProps, setAppPanelProps] = useState({});
  const [dialogProps, setDialogProps] = useState({ open: false });
  const [loader, setLoader] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [presetList, setPresetList] = useState([]);
  const searchInfo = useRef({});
  // Json
  const defaultsQuery = {
    appname: "NJAdmin",
    modulename: "NJ-Personalization",
    entityname: "UserDefault",
  };
  const presetQuery = {
    appname: "NJAdmin",
    modulename: "NJ-Personalization",
    entityname: "Preset",
  };

  // Getters
  const getActivePresetID = get(activePreset, "sys_gUid");
  const getDefaultPresetID = get(defaultPreset, "sys_gUid");

  // Setters
  const activePresetSet = (presetName, presetData) => {
    sessionStorage.setItem("preset-id", get(presetData, "_id"));
    setSnackBar({ message: `${presetName} preset is currently active` });
    setActivePreset(presetData);
  };

  const actionButtonList = [
    {
      testid: "DeletePreset",
      Icon: DeleteTwoTone,
      handler: (presetData, isActive, isDefault) => {
        let presetName = get(presetData, "sys_entityAttributes.presetName");
        if (isDefault)
          setSnackBar({
            message: `You can't delete default preset ${presetName}`,
          });
        else
          setDialogProps({
            testid: "presetDelet",
            open: true,
            title: "Are you sure ?",
            message: "This action cannot be undone",
            confirmLabel: "Yes, Delete it",
            onConfirm: () => {
              deletePreset(presetData, isActive);
              setDialogProps({ open: false });
            },
          });
      },
    },
    {
      Icon: Edit,
      testid: "editPreset",
      handler: (preset, isActive, isDefault) => {
        setAppPanelProps({
          data: preset,
          mode: "edit",
          isActive,
          isDefault,
        });
        setOpenModal(true);
      },
    },
  ];

  // Custom Functions
  const deletePreset = (presetData, isActive) => {
    let presetName = get(presetData, "sys_entityAttributes.presetName");
    setSnackBar({ message: `Deleting preset ${presetName}` });
    let queryObj = {
      ...presetQuery,
      id: presetData._id,
      templateName: "Preset",
    };
    deleteEntity.remove(queryObj).then((res) => {
      setSnackBar({ message: `Preset ${presetName} deleted` });
      fetchPresetList(isActive && defaultPreset);
    });
  };

  const fetchPresetList = (flag) => {
    let queryObj = {
      "userName.username": getLoginName,
      limit: 50,
      skip: 0,
      ...presetQuery,
    };
    entity
      .query(queryObj)
      .then((res) => {
        searchInfo.current.list = res;
        setPresetList(res || []);
        setLoader(false);
        if (flag) setActivePreset(defaultPreset);
      })
      .catch((e) => {
        setLoader(false);
      });
  };

  const handleSearch = (search_key) => {
    let { list } = searchInfo.current;
    searchInfo.current.searchKey = search_key;
    if (!search_key) setPresetList(list);
    else {
      setPresetList(
        list.filter((preset) => {
          let { presetName, selectedEntities } = preset.sys_entityAttributes;
          let regex = new RegExp(search_key.toLowerCase());
          return (
            regex.test(presetName.toLowerCase()) ||
            selectedEntities.some((entity) =>
              regex.test(entity.friendlyName?.toLowerCase())
            )
          );
        })
      );
    }
  };

  const makeDefaultPreset = (presetData) => {
    setSnackBar({
      message: `${get(
        presetData,
        "sys_entityAttributes.presetName"
      )} has been made as default preset`,
    });
    setDefaultPreset(presetData);
    getUserDefaults().then((res) => {
      let obj = res ? { ...res } : { ...shellObject };
      obj["sys_entityAttributes"]["preset"] = {
        id: get(presetData, "_id"),
        sys_gUid: get(presetData, "sys_gUid"),
        presetName: get(presetData, "sys_entityAttributes.presetName"),
      };
      if (res) {
        let queryObj = { id: res._id, ...defaultsQuery };
        entity.update(queryObj, obj);
      } else {
        obj["sys_entityAttributes"]["userName"] = getRefObj();
        entity.create(defaultsQuery, obj);
      }
    });
  };

  // UseEffects
  useEffect(() => {
    fetchPresetList();
  }, []);

  // Render Methods
  const renderActionButtonList = (preset, isActive, isDefault) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "row-reverse" }}>
      {actionButtonList.map(({ Icon, handler, testid }, i) => (
        <DisplayIconButton
          key={i}
          testid={testid}
          onClick={(e) => {
            e.stopPropagation();
            handler(preset, isActive, isDefault);
          }}
          systemVariant={isActive ? "default" : "primary"}
        >
          <Icon />
        </DisplayIconButton>
      ))}
    </div>
  );
  const renderAppPaneModal = () => (
    <DisplayModal open={openModal} fullWidth={true} maxWidth="xl">
      <div style={{ height: "90vh", width: "100%" }}>
        <AppPanel
          {...appPanelProps}
          confirmCallback={() => {
            setOpenModal(false);
            // toggleDrawer(false);
            handleSidebar("60px");
          }}
          closeCallBack={() => {
            setOpenModal(false);
          }}
        />
      </div>
    </DisplayModal>
  );

  const PresetRenderer = ({ index, style }) => {
    let preset = presetList[index];
    let { sys_entityAttributes, sys_gUid } = preset;
    let { presetName, selectedEntities } = sys_entityAttributes;
    let isActive = getActivePresetID === sys_gUid;
    let isDefault = getDefaultPresetID === sys_gUid;
    return (
      <div
        style={{
          ...style,
          display: "flex",
          width: "100%",
        }}
      >
        <DisplayCard
          key={preset._id}
          testid={`preset-card-${presetName}`}
          id={`preset-card-${preset._id}`}
          onClick={() => {
            activePresetSet(presetName, preset);
          }}
          square
          raised={isActive}
          systemVariant={isActive ? "primary" : "default"}
          style={{
            cursor: "pointer",
            margin: "5px 10px 5px 10px",
            display: "flex",
            width: "100%",
          }}
        >
          <ToolTipWrapper
            title={
              <div>
                {selectedEntities.map((n, i) => (
                  <DisplayText key={i}>
                    <li>{n.friendlyName}</li>
                  </DisplayText>
                ))}
              </div>
            }
            placement="auto"
            TransitionComponent={Zoom}
          >
            <div
              style={{
                padding: "3%",
                display: "flex",
                width: "100%",
                flexDirection: "column",
              }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "row" }}>
                <div style={{ flex: 8, padding: "5px 0px 0px 5px" }}>
                  <DisplayText style={{ fontSize: "16px", fontWeight: 300 }}>
                    {presetName}
                  </DisplayText>
                </div>
                <div
                  style={{
                    flex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DisplayIconButton
                    testid={`preset-card-def-${presetName}`}
                    id={`preset-card-def-${preset._id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDefault) makeDefaultPreset(preset);
                    }}
                    systemVariant={isActive ? "default" : "primary"}
                  >
                    {isDefault ? (
                      <CheckCircleOutline
                        testid={"preset-default"}
                        style={{ fontSize: "24px" }}
                      />
                    ) : (
                      <RadioOutlined style={{ fontSize: "24px" }} />
                    )}
                  </DisplayIconButton>
                </div>
              </div>
              {renderActionButtonList(preset, isActive, isDefault)}
            </div>
          </ToolTipWrapper>
        </DisplayCard>
      </div>
    );
  };

  const renderPresetList = () => (
    <Fade in={presetList.length ? true : false} timeout={1500}>
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              useIsScrolling
              height={height}
              itemCount={presetList.length}
              itemSize={115}
              width={width}
              className="hide_scroll"
            >
              {PresetRenderer}
            </List>
          )}
        </AutoSizer>
      </div>
    </Fade>
  );

  return (
    <PaperWrapper
      style={{
        flexDirection: "column-reverse",
        display: "flex",
        width: "100%",
        height: "100%",
      }}
    >
      {loader ? (
        <BubbleLoader />
      ) : (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ flexShrink: 1, display: "flex", alignItems: "center" }}>
            <div style={{ flexShrink: 1 }}>
              <DisplayIconButton
                testid="preset-module-close"
                size="small"
                systemVariant="primary"
                onClick={() => {
                  // toggleDrawer(false);
                  handleSidebar("60px");
                }}
              >
                <NavigateNext />
              </DisplayIconButton>
            </div>
            <div style={{ flexGrow: 1 }}>
              <DisplaySearchBar
                testid="search-preset"
                placeholder="Search Preset or Entity"
                onChange={handleSearch}
                onClick={handleSearch}
                onClear={() => handleSearch("")}
                value={searchInfo.current.searchKey}
              />
            </div>
          </div>
          {presetList.length ? (
            renderPresetList()
          ) : (
            <Banner
              src="https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/nodatafound.png"
              iconSize="300px"
              fontSize={16}
            />
          )}
        </div>
      )}
      <Slide direction="up" in={true} timeout={1000}>
        <div
          style={{
            position: "absolute",
            alignSelf: "center",
            paddingBottom: "10px",
          }}
        >
          <DisplayFab
            testid="preset-add"
            aria-label="add"
            onClick={() => {
              setAppPanelProps({ mode: "new" });
              setOpenModal(true);
            }}
          >
            <Add />
          </DisplayFab>
        </div>
      </Slide>
      {renderAppPaneModal()}
      {dialogProps.open && (
        <DisplayDialog
          {...dialogProps}
          onCancel={() => {
            setDialogProps({ open: false });
          }}
        />
      )}
    </PaperWrapper>
  );
};
