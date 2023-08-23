import React, { useState, useEffect, useMemo } from "react";
import { useStateValue } from "utils/store/contexts";
import { Breadcrumbs, Toolbar, Link, Fade, Popover } from "@material-ui/core";
import {
  entity,
  runTimeService,
} from "utils/services/api_services/entity_service";
import { getEntityMetadata, getUserCreds } from "./services";
import { getAllFiles } from "utils/services/api_services/files_services";
import { dateToString } from "utils/services/helper_services/file_helpers";
import {
  UserFactory,
  ThemeFactory,
  GlobalFactory,
} from "utils/services/factory_services";

import {
  DisplayButton,
  DisplayCard,
  DisplayChips,
  DisplayCheckbox,
  DisplayDialog,
  DisplayFab,
  DisplayGrid,
  DisplayIcon,
  DisplayIconButton,
  DisplayModal,
  DisplaySearchBar,
  DisplaySnackbar,
  DisplayTabs,
  DisplayText,
  DisplayProgress,
} from "components/display_components";
import { ContainerWrapper } from "components/wrapper_components/container";
import { Banner, UploadModal } from "components/helper_components";
import { ToolTipWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import "./file.css";
import { VideoPlayer } from "components/helper_components/video_player";
import { isDefined } from "utils/services/helper_services/object_methods";

const FileManager = (props) => {
  let { hideToolbar, parentMeta, parentMode, refData, securityParams } = props;

  const [{ userState }] = useStateValue();
  const { getContextualHelperData } = GlobalFactory();
  const {
    Admin,
    ArrowDownward,
    ArrowForwardIos,
    ArrowUpward,
    CloudUpload,
    Close,
    CreateNewFolder,
    Delete,
    Description,
    DoneAll,
    FileCopy,
    FilterList,
    Folder,
    Home,
    Info,
    PhotoCamera,
    Sort,
    MovieCreationOutlined,
    Help,
  } = SystemIcons;
  const defaultFilters = [
    { title: "Folders", value: true },
    { title: "Documents", value: true },
    { title: "Images", value: true },
  ];

  const [alertModal, setAlertModal] = useState({
    open: false,
    content: "",
    primaryFunction: null,
  });
  const [anchorSort, setAnchorSort] = useState(null);
  const [anchorFilter, setAnchorFilter] = useState(null);
  const [clicks, setClicks] = useState(0);
  const [counts, setCounts] = useState({ files: 0, folders: 0 });
  const [crumbs, setCrumbs] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(refData);
  const [currentTab, setCurrenTab] = useState("entity");
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [propSize, setFileSize] = useState(null);
  const [filterUi, setFilters] = useState(defaultFilters);
  const { getVariantObj } = ThemeFactory();
  const { dark } = getVariantObj("primary");
  const [openHelp, setHelp] = useState(false);
  const [filterOptions, setFilterOptions] = useState([
    "Folders",
    "Documents",
    "Images",
  ]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [mode, setMode] = useState("read");
  const [options, setOptions] = useState({ limit: 100, skip: 0 });
  const [permissions, setPermissions] = useState({
    createFolder: false,
    delete: false,
    read: false,
    write: false,
  });
  const [page, setPage] = useState(1);
  const [parentData, setParentData] = useState({});
  const [refreshData, setRefreshData] = useState(false);
  const [search, setSearchString] = useState("");
  const [selectedData, setSelectedData] = useState([]);
  const [selectionState, setSelectionState] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [type, setType] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [parentFolder, setParentFolder] = useState({});

  const sortOpen = Boolean(anchorSort);
  const filterOpen = Boolean(anchorFilter);
  const helperData = getContextualHelperData("DOCUMENTS_SCREEN");

  const {
    checkDeleteAccess,
    checkReadAccess,
    checkWriteAccess,
    getAgencyDetails,
    isNJAdmin,
  } = UserFactory();
  const { showHelper = false } = getAgencyDetails?.sys_entityAttributes || {};

  const userData = getUserCreds(userState);

  const appname = "Features",
    modulename = "Files",
    entityname = "Files",
    params = { appname, modulename, entityname };

  const sortFields = [
    { name: "Name", fieldName: "documentName" },
    { name: "Size", fieldName: "size" },
  ];

  const checkSelected = (val) => selectedData.some((a) => a._id == val);

  const clearMessage = () => setMessage(null);

  const clearSearch = () => setOptions({ ...options, searchString: "" });

  const closeAlertmodal = () => setAlertModal({ ...alertModal, open: false });

  const findValueIndex = (val) => selectedData.findIndex((a) => a._id == val);

  const handleClose = (val) =>
    val === "sort" ? setAnchorSort(null) : setAnchorFilter(null);

  const handleFilter = (e) => setAnchorFilter(e.currentTarget);

  const handleSort = (e) => setAnchorSort(e.currentTarget);

  const isImage = (val) => new RegExp("image/*").test(val);

  const sharingIcon = (owner) => (
    <Admin
      style={{
        visibility: !checkOwner(owner ? owner.sys_gUid : "")
          ? "visible"
          : "hidden",
        fontSize: 20,
        color: "#757575",
      }}
    />
  );

  const tabTitle = () => {
    try {
      return parentMeta && parentMeta.sys_entityAttributes.sys_fileTabTitle
        ? parentMeta.sys_entityAttributes.sys_fileTabTitle
        : "Docs / Images";
    } catch (e) {
      return "Local Documents";
    }
  };

  const checkOwner = (itemOwnerId) => {
    try {
      let userId = userState.userData.sys_gUid;
      return userId === itemOwnerId;
    } catch (e) {}
  };

  const deleteItems = async () => {
    try {
      const { userData } = userState;
      const isSuperAdmin = userData.sys_entityAttributes.superAdmin;
      let ownerData = [],
        sharedData = [];

      await selectedData.map((e) => {
        let ownerId = e.sys_entityAttributes.owner.sys_gUid;
        if (!isSuperAdmin) {
          if (checkOwner(ownerId)) {
            ownerData.push(e.sys_gUid);
          } else sharedData.push(e.sys_gUid);
        } else ownerData.push(e.sys_gUid);
      });

      if (!sharedData.length) {
        let payload = {};
        payload["target_entity"] = params["entityname"]; //entityName
        payload["target_collection"] =
          metadata.sys_entityAttributes.sys_entityCollection; //collectionName
        payload["notificationType"] = "BULK"; //"BULK"
        payload["operationType"] = "DELETE"; //"DELETE"
        payload["agencyId"] = userState.userData.sys_agencyId; //agencyId
        payload["selectedIds"] = ownerData; //sys_gUid

        let requestPattern = { type: "ids", name: "selectedIds" };

        await runTimeService
          .create(params, {
            dynamicModuleName: params["modulename"], //moduelName
            dynamicModuleFile: "bulkOperations", //"bulkOperations"
            dynamicModuleFunction: "deleteModuleEntity", //"deleteModuleEntity"
            requestPattern: requestPattern, //{"type": "ids","name": "selectedIds"}
            request: payload,
          })
          .then((result) => {
            setMessage("Successful. Documents Deleted.");
            setSelectedData([]);
            setSelectionState(false);
            setRefreshData(!refreshData);
            setAlertModal({ ...alertModal, open: false });
          })
          .catch((error) => {
            setMessage("Something Went Wrong.");
            setAlertModal({ ...alertModal, open: false });
          });
      } else {
        setMessage("Permission Denied! Deselect Shared files");
        setAlertModal({ ...alertModal, open: false });
      }
      setAlertModal({ ...alertModal, open: false });
    } catch (e) {
      console.log({ e });
      setMessage("Error! Could not delete Files");
      setAlertModal({ ...alertModal, open: false });
    }
  };

  const getData = async (userInfo) => {
    try {
      setLoading(true);
      let refId = [];
      if (currentFolder && currentFolder.id) refId.push(currentFolder.id);
      let res = await getAllFiles.query({
        ...params,
        ids: JSON.stringify(userInfo.ids),
        isRelated: currentFolder && (currentFolder.id ? true : false),
        refId: JSON.stringify(refId),
        contentType: filterOptions,
        ...options,
      });
      if (!res.error) {
        setData(groupData(res.result));
        setTotalCount(res.count);
        setLoading(false);
      } else setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const getMetadata = async () => {
    let filesMetadata = await getEntityMetadata({
      appname,
      modulename,
      groupname: "Files",
    });
    setMetadata(filesMetadata);
  };

  const getSecurityParams = (e_data) => {
    let security = {};
    try {
      if (e_data["sys_entityAttributes"].accessMode)
        security.accessMode = e_data["sys_entityAttributes"].accessMode;
      if (e_data["sys_entityAttributes"].host)
        security.host = [
          ...e_data["sys_entityAttributes"].host,
          e_data["sys_entityAttributes"].owner,
        ];
      if (e_data["sys_entityAttributes"].RoleBased)
        security.RoleBased = e_data["sys_entityAttributes"].RoleBased;
      if (e_data["sys_entityAttributes"].UserBased)
        security.UserBased = e_data["sys_entityAttributes"].UserBased;
      if (e_data["sys_entityAttributes"].UserGroupBased)
        security.UserGroupBased = e_data["sys_entityAttributes"].UserGroupBased;
      return security;
    } catch (e) {}
  };

  const groupData = (data) => {
    let folders = data.filter(
      (item) => item.sys_entityAttributes.fileUploader.type === "folder"
    );
    let files = data.filter(
      (item) => item.sys_entityAttributes.fileUploader.type === "file"
    );
    files &&
      folders &&
      setCounts({ ...counts, files: files.length, folders: folders.length });
    return folders.concat(files);
  };

  const goHome = () => {
    if (currentTab === "entity") {
      setCurrentFolder(refData);
    } else setCurrentFolder(null);
    setPage(1);
    setCrumbs([]);
    setParentFolder({});
  };

  const goToFolder = (val) => {
    let index = crumbs.findIndex((a) => a.id == val.id);
    let newCrumbs = [...crumbs].filter((val, i) => i <= index);
    setCrumbs(newCrumbs);
    setCurrentFolder({ id: val.id, sys_gUid: val.sys_gUid });
    setParentFolder(val);
  };

  const handleCheckbox = (flag, val) => {
    let arr = [];
    if (!flag) {
      arr = [...selectedData];
      arr.splice(findValueIndex(val._id), 1);
    } else arr = [...selectedData, val];
    setSelectedData(arr);
    arr.length > 0 ? setSelectionState(true) : setSelectionState(false);
  };

  const handleDetailModal = (
    modalType,
    selectedFile,
    url,
    contentType,
    clickedData
  ) => {
    setType(modalType);
    selectedFile && setFile(selectedFile);
    setImagePreviewUrl(url);
    setFileType(contentType);
    setParentData(clickedData);
    setClicks(clicks + 1);
    refData ? setMode(parentMode) : setMode("read");
  };

  const handleFilterFields = async (val, title) => {
    try {
      let array = [...filterUi].map((item) => {
        if (item.title === title) {
          if (val) {
            let arr = [...filterOptions];
            arr.push(title);
            setFilterOptions(arr);
          } else {
            let arr = [...filterOptions];
            let id = arr.findIndex((a) => a == title);
            arr.splice(id, 1);
            setFilterOptions(arr);
          }
          return { ...item, value: val };
        } else {
          return item;
        }
      });
      setFilters(array);
    } catch (e) {
      console.log({ e });
    }
  };

  const handlePageChange = async () => {
    let value = page + 1;
    setPage(page + 1);
    let limit = options["limit"];
    let skip = limit * (value - 1);
    let paginationOptions = { ...options, limit: limit, skip: skip };
    let refId = [];
    if (currentFolder && currentFolder.id) refId.push(currentFolder.id);
    try {
      let res = await getAllFiles.query({
        ...params,
        ids: JSON.stringify(userData.ids),
        isRelated: currentFolder && (currentFolder.id ? true : false),
        refId: JSON.stringify(refId),
        contentType: filterOptions,
        ...paginationOptions,
      });
      if (res) {
        if (res.result.length) {
          setData(groupData([...data, ...res.result]));
          setIsFetching(false);
        } else setPage(false);
        setIsFetching(false);
      } else setIsFetching(false);
    } catch (e) {}
  };

  const handlePermissions = async () => {
    let readAccess = checkReadAccess(params),
      writeAccess = checkWriteAccess(params),
      deleteAccess = checkDeleteAccess(params);
    let createFolderAccess = checkReadAccess({
      ...params,
      entityname: "Folder",
    });
    if (!refData) {
      // global FM
      setPermissions({
        ...permissions,
        createFolder: createFolderAccess,
        delete: deleteAccess,
        read: readAccess,
        write: writeAccess,
      });
    } else {
      //entity FM
      setPermissions({
        ...permissions,
        createFolder: false,
        delete: deleteAccess,
        read: readAccess,
        write: writeAccess,
      });
    }
  };

  const handleSearch = () => {
    setOptions({ ...options, searchString: search });
  };

  const handleSortField = async (sortField, order) => {
    let name = sortField.name;
    let queryObject = {
      ...options,
      sortby: name,
      orderby: order,
    };
    setOptions(queryObject);
    setAnchorSort(null);
    handleClose();
  };

  const handleTabs = (val) => {
    if (val === "All") {
      setCurrentFolder(null);
    } else setCurrentFolder(refData);
    setCurrenTab(val);
    setCrumbs([]);
    setSelectedData([]);
  };

  const onClose = () => {
    setImagePreviewUrl(null);
    setUploadModal(false);
    setType(null);
    setFileType(null);
    setParentData({});
    setFileSize(null);
  };

  const openFolder = () => {
    let isFolderSelected = checkSelected(parentData._id);
    if (!isFolderSelected) {
      setPage(1);
      setParentFolder(parentData);
      let id = parentData._id,
        sys_gUid = parentData.sys_gUid;
      setCurrentFolder({ id: id, sys_gUid: parentData.sys_gUid });
      let { documentName: name } = parentData.sys_entityAttributes;
      setCrumbs([...crumbs, { id: id, sys_gUid: sys_gUid, name: name }]);
    } else {
      setMessage("Please Unselect folder");
    }
  };

  const pasteItems = async (type) => {
    let dataForPaste = [...selectedData];
    switch (type) {
      case "copy": {
        await dataForPaste.forEach(async (item) => {
          let clone = { ...item };
          clone.sys_entityAttributes.documentName =
            item.sys_entityAttributes.documentName + " (copy) ";
          clone.sys_entityAttributes.attachedEntity = [];
          clone.sys_entityAttributes.attachedEntity.push(currentFolder);
          if (!refData && !currentFolder)
            clone.sys_entityAttributes.attachedEntity = [];
          delete clone._id;
          delete clone.sys_entityAttributes.source;
          await entity.create(params, clone);
        });
        setSelectedData([]);
        setSelectionState(false);
        setRefreshData(!refreshData);
        break;
      }
      case "move": {
        await dataForPaste.forEach(async (item) => {
          let clone = { ...item };
          clone.sys_entityAttributes.attachedEntity = [];
          clone.sys_entityAttributes.attachedEntity.push(currentFolder);
          if (!refData && !currentFolder)
            clone.sys_entityAttributes.attachedEntity = [];
          if (clone.sys_entityAttributes.source)
            delete clone.sys_entityAttributes.source;
          await entity.update({ ...params, id: clone._id }, clone);
        });
        setSelectedData([]);
        setSelectionState(false);
        setRefreshData(!refreshData);
        break;
      }
    }
  };

  const showInfo = () => {
    let { s3Url, contentType, type } =
      selectedData[0].sys_entityAttributes.fileUploader;
    handleDetailModal(type, {}, s3Url, contentType, selectedData[0]);
    setUploadModal(true);
  };

  const shouldDelete = () => {
    if (permissions.delete) {
      let foldernames = [],
        filenames = [];
      selectedData.forEach((item) => {
        let name = item.sys_entityAttributes.documentName;
        let type = item.sys_entityAttributes.fileUploader.type;
        if (type == "folder") {
          foldernames.push(name);
        } else filenames.push(name);
      });
      let alpha = foldernames.length + " Folders ";
      let beta = filenames.length + " Files";
      let content = alpha + beta + " will be deleted.";
      setAlertModal({
        open: true,
        content: content,
        primaryFunction: deleteItems,
      });
    } else setMessage("You do not have access to Delete files");
  };

  const uploadNew = (type) => {
    setMode("new");
    setType(type);
    setFile(null);
    setImagePreviewUrl(null);
    setFileType(null);
    setUploadModal(true);
  };

  const uploadNewFromDevice = (e, value) => {
    try {
      e.preventDefault();
      let reader = new FileReader();
      let systemFile = e.target.files[0];
      let size = e.target.files[0].size;
      reader.onloadend = () => {
        let uri = reader.result;
        setImagePreviewUrl(uri);
        let fileType = uri.split(",")[0].split(":")[1].split(";")[0];
        setFileType(fileType);
      };
      reader.readAsDataURL(systemFile);
      setType("file");
      setMode("new");
      setFile(systemFile);
      setFileSize(size);
      setUploadModal(true);
    } catch (e) {
      console.log("e", e);
    }
  };
  const isVideo = (val) => new RegExp("video/*").test(val);

  const renderUrl = (type, url, contentType) => {
    if (type === "folder")
      return <Folder style={{ fontSize: 90, color: "#F8D775" }} />;
    else if (isImage(contentType))
      return (
        <img
          style={{ height: "90px", width: "90px", borderRadius: "5px" }}
          src={url}
        />
      );
    else if (isVideo(contentType))
      return (
        <MovieCreationOutlined style={{ fontSize: 90, color: "#F8D775" }} />
      );
    else return <Description style={{ fontSize: 80, color: "#F8D775" }} />;
  };

  let TABS = [
    {
      label: tabTitle(),
      value: "entity",
      visible: refData ? true : false,
    },
    {
      label: "Global Docs / Images",
      value: "All",
      visible: false,
    },
  ];

  const OPERATIONS = [
    //     {
    //     name: "copy",
    //     title: "copy here",
    //     iconName: FileCopy,
    //     action: () => pasteItems('copy'),
    //     visible: true,
    //     disabled: ""
    // },
    // {
    //     name: "move",
    //     title: "move here",
    //     iconName: ArrowForwardIos,
    //     action: () => pasteItems('move'),
    //     visible: true,
    //     disabled: ""
    // },
    {
      name: "delete",
      title: "Delete",
      iconName: Delete,
      action: () => shouldDelete(),
      visible: true,
      disabled: false,
    },
  ];

  // set all effects
  useEffect(() => {
    try {
      setLoading(true);
      !refData && setCurrenTab("All");
      getMetadata();
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    let singleClickTimer;
    if (clicks === 1) {
      singleClickTimer = setTimeout(function () {
        type !== "folder" && setUploadModal(true);
        setClicks(0);
      }, 250);
    } else if (clicks === 2) {
      type !== "file" && openFolder();
      setClicks(0);
    }
    return () => clearTimeout(singleClickTimer);
  }, [clicks]);

  useEffect(() => {
    getData(userData);
  }, [currentFolder, options, refreshData, filterOptions]);

  useEffect(() => {
    if (!isFetching) return;
    handlePageChange();
  }, [isFetching]);

  useEffect(() => {
    handlePermissions();
    if (mode === "new") {
      let initialData = {};
      if (securityParams) {
        initialData = {
          sys_entityAttributes: {
            ...securityParams,
          },
        };
      } else {
        if (Object.keys(parentFolder).length) {
          initialData = {
            sys_entityAttributes: {
              ...getSecurityParams(parentFolder),
            },
          };
        }
      }
      setParentData(initialData);
    }
  }, [mode]);

  useEffect(() => {
    if (parentMode) setMode(parentMode.toLowerCase());
  }, [parentMode]);

  //RENDER FUNCTIONS

  const renderBreadCrumbs = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        marginTop: 5,
        flexWrap: "wrap",
      }}
    >
      <Breadcrumbs
        maxItems={3}
        aria-label="breadcrumb"
        style={{
          marginLeft: 10,
          padding: 8,
          alignItems: "center",
          width: "auto",
        }}
      >
        <Link
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "black",
            visibility: crumbs.length != 0 ? "visible" : "hidden",
          }}
          color="inherit"
          href="#"
          onClick={() => goHome()}
        >
          <Home
            style={{ marginRight: 2, fontSize: "20px", color: "#616161" }}
          />
        </Link>
        {crumbs.map((item) => {
          return (
            <Link
              key={item.id}
              color="textPrimary"
              href="#"
              onClick={() => goToFolder(item)}
            >
              {item.name}
            </Link>
          );
        })}
      </Breadcrumbs>
      <div
        style={{
          visibility: selectedData.length ? "visible" : "hidden",
          float: "right",
        }}
      >
        <DisplayButton
          size="small"
          variant="text"
          startIcon={<DoneAll />}
          onClick={() => setSelectedData(data)}
        >
          {" "}
          Select all{" "}
        </DisplayButton>
        <DisplayButton
          size="small"
          variant="text"
          startIcon={<Close />}
          onClick={() => {
            setSelectionState(false);
            setSelectedData([]);
          }}
        >
          {selectedData.length} items selected{" "}
        </DisplayButton>
      </div>
    </div>
  );

  const renderGrid = () => {
    if (data && data.length) {
      return (
        <DisplayGrid container spacing={2}>
          {data.map((item, index) => {
            let {
                documentName: title,
                description,
                owner,
                uploadedDate,
                sizeinBytes,
                contentType,
              } = item.sys_entityAttributes,
              { s3Url, type } = item.sys_entityAttributes.fileUploader;
            return (
              <DisplayGrid
                item
                key={index}
                xs={6}
                sm={4}
                md={4}
                lg={2}
                xl={2}
                style={{
                  minHeight: "90px",
                  display: "flex",
                  minWidth: hideToolbar ? "300px" : "235px",
                }}
              >
                <div
                  className="myDIV"
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    flexDirection: hideToolbar ? "row" : "column",
                    height: "fit-content",
                    minWidth: "100%",
                  }}
                >
                  <DisplayGrid
                    container
                    alignItems="center"
                    justify="center"
                    style={{ height: "100%", padding: "0px 10px 0px 10px" }}
                  >
                    <DisplayGrid item xs={5} sm={5} md={5} lg={5} xl={4}>
                      <div
                        onClick={() =>
                          handleDetailModal(type, {}, s3Url, contentType, item)
                        }
                        style={{
                          display: "flex",
                          flex: 2,
                          width: "100%",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {renderUrl(type, s3Url, contentType)}
                      </div>
                    </DisplayGrid>
                    <DisplayGrid item xs={7} sm={7} md={7} lg={7} xl={8}>
                      <div
                        style={{
                          display: "flex",
                          flex: 2,
                          flexDirection: "column",
                          textAlign: "inherit",
                          width: "100%",
                          height: "160px",
                          marginLeft: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignSelf: "flex-end" }}>
                          <DisplayCheckbox
                            className={selectedData.length > 0 ? "" : "hide"}
                            key={index}
                            size="small"
                            checked={checkSelected(item._id)}
                            onChange={(value, x) => {
                              handleCheckbox(value, item);
                            }}
                            style={{ margin: 0, visibility: "true" }}
                          />
                        </div>
                        {title && title.length > 15 ? (
                          <ToolTipWrapper
                            title={
                              <DisplayText variant="caption">
                                {title}
                              </DisplayText>
                            }
                          >
                            <div
                              style={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                flexWrap: "nowrap",
                                whiteSpace: "noWrap",
                                lineHeight: 2,
                              }}
                            >
                              <DisplayText variant="subtitle2">
                                {title}
                              </DisplayText>
                            </div>
                          </ToolTipWrapper>
                        ) : (
                          <div
                            style={{
                              overflow: "hidden",
                              flexWrap: "nowrap",
                              whiteSpace: "noWrap",
                              lineHeight: 2,
                            }}
                          >
                            <DisplayText variant="subtitle2">
                              {title ? title : "No Name"}
                            </DisplayText>
                          </div>
                        )}
                        {description && description.length > 40 ? (
                          <ToolTipWrapper
                            title={
                              <DisplayText variant="caption">
                                {description}
                              </DisplayText>
                            }
                          >
                            <div
                              className="ellipsis"
                              style={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                display: "-webkit-box",
                                height: "44px",
                              }}
                            >
                              <DisplayText variant="caption">
                                {description}
                              </DisplayText>
                            </div>
                          </ToolTipWrapper>
                        ) : (
                          <div
                            style={{
                              overflow: "hidden",
                              flexWrap: "nowrap",
                              height: "43px",
                            }}
                          >
                            <DisplayText variant="caption">
                              {description ? description : "No description"}
                            </DisplayText>
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignSelf: "flex-start",
                            color: "grey",
                            width: "100%",
                          }}
                        >
                          <DisplayText variant="caption">
                            {uploadedDate
                              ? dateToString(uploadedDate, "MM-DD-YYYY")
                              : ""}
                          </DisplayText>
                          {/* {sizeinBytes && <DisplayText variant='caption'>{sizeinBytes ? sizeinBytes : ''}</DisplayText>} */}
                          <div
                            style={{
                              display: "flex",
                              alignSelf: "center",
                              padding: "0px 10px 0px 0px",
                            }}
                          >
                            {sharingIcon(owner)}
                          </div>
                        </div>
                      </div>
                    </DisplayGrid>
                  </DisplayGrid>
                </div>
              </DisplayGrid>
            );
          })}
        </DisplayGrid>
      );
    } else
      return (
        <Banner
          msg="No Files Available"
          src="https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/nodocuments.png"
          iconSize={250}
        ></Banner>
      );
  };

  const renderFilterOptions = () => {
    return (
      <>
        <DisplayButton
          onClick={handleFilter}
          startIcon={<FilterList />}
          size="small"
        >
          Filter
        </DisplayButton>
        <Popover
          open={filterOpen}
          anchorEl={anchorFilter}
          onClose={() => handleClose("filter")}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          style={{
            width: "500px",
            height: "500px",
          }}
        >
          <div>
            {filterUi.map((item, idx) => {
              let { title, value } = item;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    margin: "5px 10px 5px 10px",
                    minHeight: "30px",
                    width: "130px",
                    alignItems: "center",
                  }}
                >
                  <DisplayCheckbox
                    size="small"
                    checked={value}
                    onChange={(val, x) => {
                      handleFilterFields(val, title);
                    }}
                  />
                  <DisplayText>{title}</DisplayText>
                </div>
              );
            })}
          </div>
        </Popover>
      </>
    );
  };

  const renderPagination = () => (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "baseline",
        justifyContent: "space-between",
      }}
    >
      <DisplayText variant="overline">
        Showing {counts["folders"]} Folders & {counts["files"]} Files of{" "}
        {totalCount}
      </DisplayText>
      {!isFetching ? (
        <ToolTipWrapper title="Click here to load more">
          <div>
            <DisplayFab
              disabled={
                (data && data.length === totalCount) || !page ? true : false
              }
              size="small"
              onClick={() => setIsFetching(true)}
            >
              <ArrowDownward />
            </DisplayFab>
          </div>
        </ToolTipWrapper>
      ) : (
        <DisplayProgress size={28} />
      )}
    </div>
  );

  const renderSortOptions = () => {
    return (
      <>
        <DisplayButton onClick={handleSort} startIcon={<Sort />} size="small">
          Sort by
        </DisplayButton>
        <Popover
          open={sortOpen}
          anchorEl={anchorSort}
          onClose={() => handleClose("sort")}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          style={{
            width: "500px",
            height: "500px",
          }}
        >
          {sortFields.map((item, idx) => {
            let { name, fieldName } = item;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  margin: "5px",
                  minHeight: "30px",
                  width: "180px",
                  alignItems: "center",
                }}
              >
                <DisplayText style={{ flex: 2, marginRight: "15px" }}>
                  {name}
                </DisplayText>
                <DisplayChips
                  style={{
                    marginRight: "10px",
                    height: "20px",
                    paddingLeft: "8px",
                  }}
                  icon={<ArrowDownward />}
                  onClick={(e) => handleSortField({ name: fieldName }, -1)}
                  size="small"
                />
                <DisplayChips
                  style={{ height: "20px", paddingLeft: "8px" }}
                  icon={<ArrowUpward />}
                  onClick={(e) => handleSortField({ name: fieldName }, 1)}
                  size="small"
                />
              </div>
            );
          })}
        </Popover>
      </>
    );
  };

  const checkForVideoLinks = () => {
    let videoLinks = helperData.videoLinks.filter((e) =>
      isDefined(e.link)
    ).length;
    return videoLinks > 0;
  };

  const renderToolbar = () => (
    <Toolbar
      variant="dense"
      style={{
        width: "auto",
        borderBottom: "1px solid #ebebeb",
        backgroundColor: "white",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      <div style={{ visibility: refData ? "visible" : "hidden" }}>
        {refData && (
          <DisplayTabs
            style={{ whiteSpace: "noWrap" }}
            tabs={TABS.filter((et) => et.visible)}
            defaultSelect={currentTab}
            titleKey={"label"}
            valueKey={"value"}
            onChange={handleTabs}
            variant="scrollable"
          />
        )}
      </div>
      <div
        style={{
          display: hideToolbar ? "none" : "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {selectedData.length == 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!refData && permissions.createFolder && (
              <DisplayButton
                onClick={() => uploadNew("folder")}
                startIcon={<CreateNewFolder />}
                size="small"
                disabled={!metadata}
                variant="text"
                display="inline"
              >
                New Folder
              </DisplayButton>
            )}
            {
              <input
                accept=" .jpg, .jpeg, .png, .pdf, .webp, .csv, .xls, .xlsx, .docx"
                id="newfile"
                onChange={uploadNewFromDevice}
                multiple
                type="file"
                style={{ display: "none" }}
              />
            }
            {permissions.write && (
              <label htmlFor="newfile">
                <DisplayButton
                  disabled={!metadata}
                  component="span"
                  startIcon={<CloudUpload />}
                  size="small"
                >
                  Upload
                </DisplayButton>
              </label>
            )}
            {permissions.write && (
              <DisplayButton
                aria-controls="upload-menu"
                aria-haspopup="true"
                disabled={!metadata}
                onClick={() => uploadNew("camera")}
                startIcon={<PhotoCamera />}
                size="small"
              >
                Camera
              </DisplayButton>
            )}
            {renderSortOptions()}
            {renderFilterOptions()}
            <div style={{ width: 220 }}>
              <DisplaySearchBar
                data={search}
                onClick={handleSearch}
                onChange={(val) => setSearchString(val)}
                onClear={clearSearch}
              />
            </div>
          </div>
        ) : (
          <div>
            {OPERATIONS.map((item, index) => {
              let { title, iconName, action, visible, disabled } = item;
              return (
                visible && (
                  <DisplayButton
                    key={index}
                    size="small"
                    variant="text"
                    display="inline"
                    onClick={action}
                    disabled={disabled}
                  >
                    {iconName && (
                      <DisplayIcon
                        name={iconName}
                        style={{ fontSize: "16px", marginRight: 2 }}
                      />
                    )}
                    {title}
                  </DisplayButton>
                )
              );
            })}
          </div>
        )}
        <DisplayIconButton
          disabled={selectedData.length !== 1}
          onClick={showInfo}
        >
          <Info color={selectedData.length === 1 ? "primary" : "disabled"} />
        </DisplayIconButton>
        {(isNJAdmin() ||
          (helperData && checkForVideoLinks() && showHelper)) && (
          <DisplayIconButton onClick={() => setHelp(true)}>
            <ToolTipWrapper title="Help" placement="bottom-start">
              <Help style={{ color: dark.bgColor, fontSize: "20px" }} />
            </ToolTipWrapper>
          </DisplayIconButton>
        )}
      </div>
    </Toolbar>
  );

  return (
    <ContainerWrapper>
      <Fade in={true} timeout={500}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            flexGrow: 1,
            height: "100%",
            width: "100%",
            backgroundColor: "white",
            overflow: "hidden",
            minWidth: "350px",
            minHeight: "500px",
            contain: !hideToolbar ? "strict" : "none",
          }}
        >
          <DisplaySnackbar
            open={!!message}
            message={message}
            onClose={clearMessage}
          />
          {renderToolbar()}
          {renderBreadCrumbs()}
          <div
            className="hideScroll"
            style={{
              display: "flex",
              overflow: "scroll",
              padding: 10,
              maxHeight: "80vh",
              backgroundColor: "inherit",
            }}
          >
            {!loading ? (
              renderGrid()
            ) : (
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <DisplayProgress />
              </div>
            )}
          </div>
          {data.length != 0 && (
            <div
              style={{
                display: "flex",
                marginTop: "auto",
                paddingLeft: 10,
                paddingRight: 10,
              }}
            >
              {renderPagination()}
            </div>
          )}
        </div>
      </Fade>

      {openHelp && (
        <VideoPlayer
          handleModalClose={() => setHelp(false)}
          screenName={"DOCUMENTS_SCREEN"}
          helperData={helperData}
        />
      )}
      <DisplayModal open={uploadModal} fullWidth={true} maxWidth="md">
        <UploadModal
          states={{ type, mode, file, fileType, imagePreviewUrl, parentData }}
          methods={{
            setFile,
            setFileType,
            getData,
            setImagePreviewUrl,
            onClose,
            setSelectedData,
            setMode,
            setType,
          }}
          options={{
            metadata,
            refData,
            params,
            currentFolder,
            permissions,
            propSize,
          }}
          {...props}
        />
      </DisplayModal>
      <DisplayDialog
        open={alertModal.open}
        title={"Are you Sure?"}
        message={alertModal.content}
        onCancel={closeAlertmodal}
        onConfirm={alertModal.primaryFunction}
      />
    </ContainerWrapper>
  );
};

export default FileManager;
