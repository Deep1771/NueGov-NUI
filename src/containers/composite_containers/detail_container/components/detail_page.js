import React, { useEffect, useReducer, useState, useMemo, useRef } from "react";
import { Menu, MenuItem } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { basicEntityData } from "utils/services/helper_services/system_methods";
import {
  entity,
  entityCount,
} from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import {
  GlobalFactory,
  UserFactory,
  ThemeFactory,
} from "utils/services/factory_services";
import {
  ComponentContext,
  constructFormData,
  DetailContext,
  detailReducer,
  errorReducer,
  TopLevelContext,
} from "../detail_state";
import { QuickFlow } from "./quick_flow";
import { TopLevel } from "./top_level";
import { ComponentLevel } from "./component_level";
import { RelatedList } from "./related_list";
import { JsonTool } from "./json_tool";
import { TemplateSelector } from "./template_selector";
import { TriggerSummary } from "containers/extension_containers";
import { ReportGenerator } from "components/helper_components";
import { DetailContainerSkeleton } from "components/skeleton_components/detail_page/detail_container";
import {
  DisplayAvatar,
  DisplayButton,
  DisplayButtonGroup,
  DisplayCard,
  DisplayChips,
  DisplayDialog,
  DisplayGrid,
  DisplayIcon,
  DisplayIconButton,
  DisplayModal,
  DisplaySnackbar,
  DisplayTabs,
  DisplayText,
} from "components/display_components";
import Audits from "containers/feature_containers/audits";
import FileManager from "containers/feature_containers/file_manager";
import { ContextMenuWrapper } from "components/wrapper_components";
import { JsonEditor } from "containers/feature_containers/editor_tool";
import { Notes } from "containers/feature_containers/notes";
import { get, isDefined } from "utils/services/helper_services/object_methods";
import ActionItems from "containers/feature_containers/actionItems";
import Dashboard from "containers/feature_containers/dashboard_new";
import { ToolTipWrapper } from "components/wrapper_components/tool_tip";
import { SystemIcons } from "utils/icons";
import { styles } from "../styles";
import { useStateValue } from "utils/store/contexts";
import { HotButton, Faqs } from "components/helper_components";
import { ScannerModal, CodeGenerator } from "components/extension_components";
import { TRIGGER_QUERY } from "utils/constants/query";
import { MultiAssetsView } from "nuegov/screens/360_view_screen";
import { SystemTabCarousel } from "components/system_components";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { DetailContainer } from "..";
import { ContainerWrapper } from "components/wrapper_components";
import { DisplayFormLabel } from "components/display_components/form_helpers/form_label";
import { switchUser } from "containers/user_containers/profile_page/loginas/switchUser";
import { VideoPlayer } from "components/helper_components/video_player";
import resource from "utils/services/resource_config/resource";
import request from "utils/services/resource_config/config";
import { SystemTimeout } from "utils/services/helper_services/timeout";
import { eventTracker } from "utils/services/api_services/event_services";
import { checkForReportAutoSave } from "./helper";

const useStyles = makeStyles((theme) => ({
  root: ({ dark, light }) => ({
    borderColor: "#ebebeb",
    "&&:hover": {
      backgroundColor: light.bgColor,
      color: light.text,
    },
    "&&:focus": {
      backgroundColor: dark.bgColor,
      color: dark.text,
    },
    "& > *": {
      paddingLeft: theme.spacing(0.5),
    },
  }),
}));

export const DetailPage = (props) => {
  let {
    appname,
    data,
    errorCallback,
    formCallback,
    groupname,
    id,
    metadata: METADATA,
    modulename,
    onClose,
    onModeChange,
    options,
    saveCallback,
    onMoreOptions,
    prevQuickFlow,
    handleLoadingSkeleton,
    baseTemplate,
    detailMode,
    screenType,
    fromMap,
    showHeaderFields = true,
  } = props;
  let initialData = {
    sys_entityAttributes: {},
    ...data,
  };
  const { sys_batchId } = initialData;
  const [{ configState, presetState, moduleState }, dispatch] = useStateValue();
  const { activeModuleEntities } = moduleState;
  // const { activePreset, defaultPreset } = presetState || {};
  const { lastInteractedPosition, triggerToSave, sidebarClickStatus } =
    configState;
  const MODE = props.mode.toUpperCase();
  const history = useHistory();
  const basicFormData = basicEntityData();
  const {
    closeBackDrop,
    setBackDrop,
    setSnackBar,
    setTriggerSave,
    toggleDrawer,
    getUserData,
    getContextualHelperData,
    handleSidebar,
  } = GlobalFactory();
  const { getVariantObj, getVariantForComponent } = ThemeFactory();
  const themeColor = getVariantForComponent("", "primary");
  const bgColor = themeColor.colors.dark.bgColor;
  const classes = useStyles(getVariantObj("primary"));
  const {
    checkDataAccess,
    checkReadAccess,
    checkWriteAccess,
    checkGlobalFeatureAccess,
    isNJAdmin,
    getEntityFeatureAccess,
    getAgencyId,
    getAgencyRef,
    getUserInfo,
    getEntityFriendlyName,
    getUserDocument,
    getAgencyDetails,
  } = UserFactory();
  const {
    showHelper = false,
    stayInDetailPage = false,
    showSampleData = false,
  } = getAgencyDetails?.sys_entityAttributes || {};
  const { sys_roleData = {} } = getUserData() || {};
  const { username } = getUserDocument;

  let {
    sys_components,
    detailTabLabel,
    componentTabLabel,
    relatedListTabLabel,
    documentTabLabel,
    auditTabLabel,
    sys_hotButtons,
    sys_entityType,
    sys_entityProperties,
    filterRelationships,
    sys_topLevel,
    sys_detailPageTitle,
  } = METADATA?.sys_entityAttributes || {};
  const params = { appname, modulename };
  const {
    hideFooter,
    hideNavbar,
    hideRelation,
    hideModeButtons,
    hideFeatureButtons,
    hideNavButtons,
    hideTitlebar,
    triggerSave,
  } =
    !isNJAdmin() && sys_entityType === "Approval"
      ? {
          hideAprrovalFooter: false,
          hideFooter: true,
          hideModeButtons: true,
          hideFeatureButtons: false,
        }
      : options
      ? options
      : {};

  const {
    ArrowDropDown,
    Chat,
    Code,
    Edit,
    Info,
    Read,
    PlaylistAdd,
    Help,
    HighlightOffTwoTone,
    PictureAsPdf,
    Visibility,
    Camera,
    ArrowLeft,
  } = SystemIcons;
  const [dialog, setDialog] = useState({ dialog: false });
  const [formData, setFormData] = useReducer(detailReducer, {});
  const [formError, setFormError] = useReducer(errorReducer, {});
  const [isQuickFlow, setQuickFlow] = useState(null);
  const [flowTouched, setFlowTouched] = useState(false);
  const [menu, setMenu] = useState(false);
  const [message, setMessage] = useState();
  const [mode, setMode] = useState("READ");
  const [modeEl, setModeEl] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [openCodeModal, setCodeModal] = useState(false);
  const [openScannerModal, setScannerModal] = useState(false);
  const [optionEl, setOptionEl] = useState(null);
  const [quickOptions, setOptions] = useState([]);
  const [section, setSection] = useState("TOP");
  const [showJson, setJson] = useState(false);
  const [showNotes, setNotes] = useState(false);
  const [showActionItems, setActionItem] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [title, setTitle] = useState(groupname);
  const [modal, openModal] = useState(false);
  const [helperButton, setHelperButton] = useState(false);
  const [scanMenu, setScanMenu] = useState(false);
  const [metadata, setMetadata] = useState(METADATA);
  const [reportFlag, setReportFlag] = useState(false);
  const [open360View, set360View] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [autoPopulate, setPopulateData] = useState({});
  const [openHelp, setHelp] = useState(false);
  const QR_CODE = get(formData, "sys_entityAttributes.QR_CODE");
  const BAR_CODE = get(formData, "sys_entityAttributes.BAR_CODE");
  const reports = get(metadata, "sys_entityAttributes.sys_reports", []);
  const enableUpdateRef = useRef(false);
  // const formRef = useRef(null);
  const helperData = getContextualHelperData("DETAIL_PAGE_SCREEN");

  const REPORT_VISIBILITY =
    checkGlobalFeatureAccess("Reports") &&
    getEntityFeatureAccess(appname, modulename, groupname, "Reports") &&
    !isNJAdmin() &&
    reports?.length > 0;

  const isCodeGenerator = sys_entityProperties?.includes("CodeGenerator");

  const formNotInEditing = () =>
    [undefined, "undefined", null, "null", false, "false"].includes(
      sessionStorage.getItem("isFormInEditing")
    );

  const enableInfoPopup =
    isNJAdmin() &&
    [false, undefined].includes(data?.sys_entityAttributes?.locked) &&
    props.summaryMode &&
    props.mode.toUpperCase() === "READ" &&
    formNotInEditing();
  // Setters
  const clearMessage = () => setMessage(null);
  const handleClose = () => {
    // formRef.current = formData;
    // if (
    //   isNJAdmin() &&
    //   data instanceof Object &&
    //   props.summaryMode &&
    //   !["NEW", "CLONE"].includes(props.mode.toUpperCase())
    // ) {
    //   //TO HANDLE SINGLE USER EDIT WITHOUT SAVE OPERATION
    //   if (
    //     !data.sys_entityAttributes.hasOwnProperty("isOpen") &&
    //     !enableUpdateRef.current
    //   ) {
    //     ["editedEntityInfo"].map((e) => sessionStorage.removeItem(e));
    //     entity.update(
    //       { appname, modulename, entityname: groupname, id: data._id },
    //       data
    //     );
    //   }
    //   //TO HANDLE SINGLE USER EDIT WITHOUT SAVE OPERATION WITH HARD REFRESH
    //   else if (
    //     data.sys_entityAttributes.isOpen &&
    //     sessionStorage.getItem("isFormInEditing") === "true" &&
    //     !enableUpdateRef.current
    //   ) {
    //     delete data.sys_entityAttributes.isOpen;
    //     ["editedEntityInfo"].map((e) => sessionStorage.removeItem(e));
    //     entity.update(
    //       { appname, modulename, entityname: groupname, id: data._id },
    //       data
    //     );
    //   }
    //   //TO HANDLE SINGLE USER EDIT WITH SAVE OPERATION
    //   else if (
    //     data.sys_entityAttributes.isOpen &&
    //     sessionStorage.getItem("isFormInEditing") === "true" &&
    //     enableUpdateRef.current
    //   ) {
    //     delete formData.sys_entityAttributes.isOpen;
    //     ["editedEntityInfo"].map((e) => sessionStorage.removeItem(e));
    //     entity.update(
    //       { appname, modulename, entityname: groupname, id: data._id },
    //       formData
    //     );
    //   } else sessionStorage.removeItem("isFormInEditing");
    // }
    // if (props.summaryMode)
    //   ["editedEntityInfo"].map((e) => sessionStorage.removeItem(e));
    onClose && onClose();
  };
  const handleModeClick = (event) => setModeEl(event.currentTarget);
  const handleModeClose = () => setModeEl(null);
  const handleOptionClick = (event) => setOptionEl(event.currentTarget);
  const handleOptionClose = () => setOptionEl(null);
  const handleScanClick = (event) => setScanMenu(event.currentTarget);
  const handleScanClose = () => setScanMenu(null);
  const onTabSelect = (section) => setSection(section);
  const openCloseDialog = () => handleClose();

  const [carNumber, setCarNo] = useState("");
  const showCarNumber =
    sys_topLevel?.find((fields) => fields.name == "carNumber")?.showCarNumber ||
    false;
  const headerFields = sys_topLevel?.filter(
    (e) => e.showOnDetailHeader === true
  );

  const relatedEntities =
    metadata?.sys_entityAttributes?.sys_entityRelationships;

  let entitiesToAttach = relatedEntities?.filter((e) =>
    e?.hasOwnProperty("createButton")
  );

  entitiesToAttach =
    isDefined(entitiesToAttach) && isDefined(entitiesToAttach[0])
      ? [entitiesToAttach[0]]
      : [];

  let childEntity, childModule, childApp;
  const [childParams, setChildParams] = useState({});

  //JSON
  const headerButtons = [
    {
      displayCondition: !hideFeatureButtons && isNJAdmin(),
      icon: <DisplayIcon name={Code} style={{ fontSize: "1.25rem" }} />,
      name: "Json",
      testid: "detailPage-json_editor",
      onClick: () => setJson(true),
    },
    {
      displayCondition: isCodeGenerator,
      icon: <span className="material-icons">qr_code_scanner</span>,
      endIcon: <ArrowDropDown testid={"option-dropdown"} />,
      name: "CodeGenerator",
      testid: "detailPage-CodeGenerator",
      onClick: handleScanClick,
    },
  ];

  const codeGeneratorMenu = [
    {
      displayCondition: isCodeGenerator && mode != "READ",
      name: "Scan and Attach",
      testid: "detailPage-scan-attach",
      onClick: () => {
        setScannerModal(true);
        handleScanClose();
      },
    },
    {
      displayCondition: (QR_CODE || BAR_CODE) && isCodeGenerator,
      name: "View",
      testid: "detailPage-view",
      onClick: () => {
        setCodeModal(true);
        handleScanClose();
      },
    },
  ];

  const modes = [
    // isNJAdmin() && props.summaryMode
    // ? !formNotInEditing() && {
    //   displayCondition: !["EDIT"].includes(mode),
    //   icon: Edit,
    //   name: "EDIT",
    // }
    // :
    {
      displayCondition: !["EDIT"].includes(mode),
      icon: Edit,
      name: "EDIT",
    },
    {
      displayCondition: !["READ"].includes(mode),
      icon: Read,
      name: "READ",
    },
    {
      displayCondition: true,
      icon: Edit,
      name: "CLONE",
    },
  ];

  const optionMenu = [
    // {
    //   displayCondition: !hideFeatureButtons && mode !== "NEW",
    //   icon: Chat,
    //   name: "Collaborator",
    //   testid: "detailPage-Collaborator",
    //   onClick: () => {
    //     setNotes(!showNotes);
    //     handleOptionClose();
    //   },
    // },
    {
      displayCondition:
        !hideFeatureButtons &&
        mode !== "NEW" &&
        getEntityFeatureAccess(appname, modulename, groupname, "ActionItems"),
      icon: PlaylistAdd,
      name: "Action Items",
      testid: "detailPage-Action_Items",
      onClick: () => {
        setActionItem(!showActionItems);
        handleOptionClose();
      },
    },
  ];

  const TABS = [
    {
      label: detailTabLabel || "Details",
      value: "TOP",
      visible: true,
    },
    {
      label: componentTabLabel || "Components",
      value: "COMPONENT",
      visible:
        sys_components &&
        sys_components[0] &&
        (!["READ"].includes(MODE) ||
          (["READ"].includes(MODE) &&
            formData.sys_components &&
            formData.sys_components.length)),
    },
    ...(!hideRelation &&
    ["EDIT", "READ"].includes(MODE) &&
    metadata?.sys_entityAttributes?.sys_entityRelationships
      ? metadata?.sys_entityAttributes?.sys_entityRelationships.reduce(
          (tab, currTab) => {
            // let { sys_entityAttributes } = activePreset || {};
            // let { selectedEntities } = sys_entityAttributes || [];
            if (
              !currTab.hasOwnProperty("showModal") ||
              currTab.showModal == true
            ) {
              let checktabFilter = METADATA.sys_entityAttributes.hasOwnProperty(
                "filterRelationships"
              )
                ? filterRelationships
                  ? activeModuleEntities.some(
                      (fl) => fl.groupName === currTab.entityName
                    )
                  : true
                : true;

              //check for the user stats entity here
              if (currTab.type === "DASHBOARD") {
                tab.push({
                  label: (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {
                        <DisplayAvatar
                          src={currTab.iconUrl}
                          style={{
                            height: "1.5rem",
                            width: "1.5rem",
                            padding: "0.5rem",
                            backgroundColor: "#ffffff",
                          }}
                        />
                      }
                      {currTab.title}
                    </div>
                  ),
                  value: "DASHBOARD",
                  visible:
                    checkGlobalFeatureAccess("Feature") &&
                    checkReadAccess({
                      appname: "Features",
                      modulename: "Feature",
                      entityname: "UserStats",
                    }) &&
                    getEntityFeatureAccess(
                      appname,
                      modulename,
                      groupname,
                      "UserStats"
                    ),
                  iconPosition: "start",
                  metadata: currTab,
                });
              } else if (currTab.entityName !== "Audits" && checktabFilter) {
                // if (currTab.entityName !== "Audits") {
                let validateAccess = checkReadAccess({
                  appname: currTab.appName,
                  modulename: currTab.moduleName,
                  entityname: currTab.entityName,
                });
                if (validateAccess)
                  tab.push({
                    label: (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {
                          <DisplayAvatar
                            src={currTab.iconUrl}
                            style={{
                              height: "1.5rem",
                              width: "1.5rem",
                              marginRight: "0.5rem",
                              backgroundColor: "#ffffff",
                            }}
                          />
                        }
                        {currTab.title}
                      </div>
                    ),
                    value: `RELATION*${currTab.entityName}`,
                    visible: true,
                    iconPosition: "start",
                  });
              }
            }
            return tab;
          },
          []
        )
      : []),
    // {
    //   label: relatedListTabLabel || "Related Items",
    //   value: "RELATION",
    //   visible:
    //     !hideRelation &&
    //     ["EDIT", "READ"].includes(MODE) &&
    //     metadata.sys_entityAttributes.sys_entityRelationships &&
    //     metadata.sys_entityAttributes.sys_entityRelationships.filter((er) => {
    //       if (er.entityName !== "Audits") {
    //         return (
    //           checkReadAccess({
    //             appname: er.appName,
    //             modulename: er.moduleName,
    //             entityname: er.entityName,
    //           }) &&
    //           (() => {
    //             if (er.quickFlow)
    //               if (er.visible) return true;
    //               else return false;
    //             else return true;
    //           })()
    //         );
    //       }
    //     }).length,
    // },
    {
      label: metadata?.sys_entityAttributes?.jsonTool?.title,
      value: "JSON_TOOL",
      visible:
        metadata?.sys_entityAttributes?.jsonTool &&
        getEntityFeatureAccess(appname, modulename, groupname, "JsonTool"),
    },
    {
      label: metadata?.sys_entityAttributes?.wazeTool?.title,
      value: "WAZE_TOOL",
      visible:
        metadata?.sys_entityAttributes?.wazeTool &&
        getEntityFeatureAccess(appname, modulename, groupname, "WazeTool"),
    },
    {
      label: documentTabLabel || "Documents",
      value: "FILES",
      visible:
        !["NEW", "CLONE"].includes(MODE) &&
        groupname !== "Files" &&
        getEntityFeatureAccess(appname, modulename, groupname, "Files"),
    },
    // {
    //   label: "Triggers",
    //   value: "TRIGGERS",
    //   visible:
    //     !["NEW", "CLONE"].includes(MODE) &&
    //     checkReadAccess(TRIGGER_QUERY) &&
    //     formData?.sys_agencyId === getAgencyId,
    // },
    // {
    //   label: "userStats",
    //   value: "userStats",
    //   visible: true,
    // },
    {
      label: auditTabLabel || "Audits",
      value: "AUDITS",
      visible:
        ["EDIT", "READ"].includes(MODE) &&
        metadata?.sys_entityAttributes?.sys_entityRelationships &&
        metadata?.sys_entityAttributes?.sys_entityRelationships.filter((er) => {
          if (er.entityName === "Audits") {
            return (
              checkReadAccess({
                appname: er.appName,
                modulename: er.moduleName,
                entityname: er.entityName,
              }) &&
              getEntityFeatureAccess(appname, modulename, groupname, "Audits")
            );
          }
        }).length,
    },
  ];

  const { inlineInstruction: { detailReportDescription = "" } = {} } =
    helperData || {};

  useEffect(() => {
    if (triggerToSave && triggerToSave == groupname) handleSave();
  }, [triggerToSave]);

  const checkAttachedStatus = (rd) => {
    if (sys_roleData?.sys_entityAttributes?.hideDetailCreateButton) {
      return false;
    } else if (
      entitiesToAttach[0]?.createButton?.hideOn?.values?.includes(
        rd?.sys_entityAttributes[
          entitiesToAttach[0]?.createButton?.hideOn?.path
        ]
      )
    ) {
      return false;
    } else {
      return true;
    }
  };

  const openSaveDialog = () => {
    if (id) {
      let saveModal = {
        dialog: true,
        title: "Sure to save ?",
        msg: "Your changes will be saved",
        confirmLabel: "Save",
        onConfirm: handleSave,
      };
      setDialog(saveModal);
    } else handleSave();
  };

  const openMoreDialog = () => {
    handleSave("event_more_options");
  };

  const reloadPage = (value, status) => {
    if (status === "saved") {
      history.go();
      setJson(value);
    } else setJson(value);
  };

  //Custom Functions
  const checkSaveDisable = () => {
    let { topLevel, componentLevel } = formError;
    return (
      (topLevel && topLevel.length) ||
      (componentLevel && componentLevel.length) ||
      (flowTouched && ["NEW", "CLONE"].includes(mode))
    );
  };

  const checkOpportunityDisable = () => {
    let prevRequestedEntities = Object.keys(data.sys_entityAttributes).filter(
      (e) => /standardPublicSafety/i.test(e)
    );
    let requestedEntities = Object.keys(formData.sys_entityAttributes).filter(
      (e) => /standardPublicSafety/i.test(e)
    );
    if (["NEW", "CLONE"].includes(mode.toUpperCase())) {
      if (requestedEntities.length) return false;
      return true;
    } else if (["EDIT"].includes(mode.toUpperCase())) {
      if (formData?.sys_entityAttributes?.cloudSetupStatus == "Requirements")
        if (!!requestedEntities.length) return false;

      if (prevRequestedEntities.length) {
        if (
          data.sys_entityAttributes.agencyOnboardingMode !=
          formData.sys_entityAttributes.agencyOnboardingMode
        )
          return false;
        else if (requestedEntities.length == 0) return true;
        // else return prevRequestedEntities.length === requestedEntities.length;
        else
          return (
            JSON.stringify(prevRequestedEntities) ===
            JSON.stringify(requestedEntities)
          );
      } else if (requestedEntities.length) return false;

      return true;
    } else {
    }
  };

  const handleOnclickItem = async (itemData, rdata) => {
    let childMeta = await entityTemplate
      .get({
        appname: itemData.appName,
        modulename: itemData.moduleName,
        groupname: itemData.entityName,
      })
      .then((res) => {
        console.log("res ->", res);
        return res;
      })
      .catch((er) => {
        console.log("err -> ", er);
      });

    setChildParams({
      childApp: itemData?.appName,
      childModule: itemData?.moduleName,
      childEntity: itemData?.entityName,
    });

    childApp = itemData.appName;
    childModule = itemData.moduleName;
    childEntity = itemData.entityName;

    setShowModal(true);
    let parentFieldName = itemData.path.split(".")[1];
    let autoData = {
      [parentFieldName]: {},
    };

    let { sys_entityAttributes } = rdata;
    let definition = childMeta.sys_entityAttributes.sys_topLevel.find(
      (e) => e.name === parentFieldName
    );

    definition &&
      definition.displayFields.map((item) => {
        if (item.name.split(".").length > 1) {
          let name = item.name.split(".")[0];
          let childFieldName =
            item.name.split(".")[item.name.split(".").length - 1];
          if (
            sys_entityAttributes[name] &&
            Object.keys(sys_entityAttributes[name]).length
          )
            autoData[parentFieldName][childFieldName] =
              sys_entityAttributes[name][childFieldName];
        } else
          autoData[parentFieldName][item.name] =
            sys_entityAttributes[item.name];
      });
    autoData[parentFieldName]["id"] = rdata._id;
    autoData[parentFieldName]["sys_gUid"] = rdata.sys_gUid;
    let businessInfo = {
      businessTypeInfo: get(
        rdata,
        "sys_entityAttributes.businessTypeInfo",
        false
      ),
    };
    businessInfo?.businessTypeInfo &&
      (autoData = { ...autoData, ...businessInfo });
    setPopulateData({ sys_entityAttributes: autoData });
  };

  const handleCloudCreation = () => {
    let payload = JSON.parse(JSON.stringify(formData));
    let { sys_entityAttributes } = payload;
    let requestedEntities = Object.keys(sys_entityAttributes).filter((e) =>
      /standardPublicSafety/i.test(e)
    );
    if (requestedEntities.length) {
      let { cloudSetupStatus, agencyOnboardingMode } = sys_entityAttributes;
      let handleTrueCond = (cond) => {
        setDialog({
          dialog: true,
          title:
            cond === "CREATE"
              ? `Create ${payload?.sys_entityAttributes?.agencyName} Cloud?`
              : `Update ${payload?.sys_entityAttributes?.agencyName} Cloud?`,
          msg:
            cond === "CREATE"
              ? `Make sure the required business processes are selected\n.
              This action cannot be undone.`
              : `Make sure the required business processes are selected.
            Deselecting selected processes earlier and updating cloud will erase those processes permanently from your cloud.
            This action cannot be undone.`,
          confirmLabel: "Proceed",
          onConfirm: async () => {
            setDialog({ dialog: false });
            if (cond === "CREATE") setBackDrop("Creating Cloud...");
            else setBackDrop("Updating Cloud...");
            if (cond == "CREATE" && mode == "NEW") {
              let result = await entity.create(
                { ...params, entityname: groupname },
                formData
              );
              payload = result.ops[0];
            }
            let demoEntity = resource(
              "api/setupcloud/:appname/:modulename/:entityname",
              request
            );
            let response = await demoEntity
              .create(
                {
                  appname,
                  modulename,
                  entityname: groupname,
                  standardCloud_gUid: entitiesToAttach[0].standardCloud_gUid,
                },
                payload
              )
              .catch((e) => {
                closeBackDrop();
                setSnackBar({
                  message: `Error while creating Cloud. Contact Support.`,
                  severity: "error",
                });
              });
            if (response) {
              closeBackDrop();
              setDialog({
                dialog: true,
                title: `Successfully ${
                  cond == "CREATE" ? "create" : "update"
                }d ${payload?.sys_entityAttributes?.agencyName} Cloud.`,
                msg: `Login to view to ${
                  cond == "CREATE" ? "create" : "update"
                }d cloud?`,
                confirmLabel: "Yes, Login",
                confirmButtonVariant: "contained",
                onConfirm: () => {
                  let path = `/app/summary/${appname}/${modulename}/${groupname}/edit/${payload._id}`;
                  let userInfo =
                    response.result.opportunityData.sys_entityAttributes
                      .superAdminLogin;
                  switchUser(history, userInfo, getUserData(), path);
                  setDialog({ dialog: false });
                },
                onCancel: () => {
                  setDialog({ dialog: false });
                  setTriggerSave(false);
                  SystemTimeout(handleClose, 1000);
                },
              });
            }
          },
        });
      };

      if (cloudSetupStatus == "Requirements" && agencyOnboardingMode == "Trial")
        handleTrueCond("CREATE");
      else if (cloudSetupStatus == "In Trial" && agencyOnboardingMode == "Paid")
        handleTrueCond("UPDATE");
      else if (
        cloudSetupStatus == "Requirements" &&
        agencyOnboardingMode == "Paid"
      )
        handleTrueCond("CREATE");
      else handleTrueCond("UPDATE");
      // else {
      //   setDialog({
      //     dialog: true,
      //     title: "Attention!!",
      //     msg:
      //       cloudSetupStatus == "In Trial"
      //         ? `Cloud is currently in Trial.\n
      //           To move the cloud to Paid mode, select "Paid" in Agency Subscription Mode.`
      //         : "Cloud is in Paid mode, to further add or modify the cloud please contact the Support Team.",
      //     cancelLabel: "Go Back",
      //   });
      // }
    } else
      setDialog({
        dialog: true,
        title: "Attention!!",
        msg: "Select at least one business process (Fleet, Weapons etc) to proceed.",
        cancelLabel: "Go Back",
      });
  };

  const handleAttachClick = (data) => {
    if (entitiesToAttach?.length === 1) {
      if (
        "showModal" in entitiesToAttach[0] &&
        entitiesToAttach[0].showModal == false
      ) {
        handleCloudCreation();
      } else {
        setShowModal(true);
        handleOnclickItem(entitiesToAttach[0], data);
      }
    }
  };

  let handleMenuClick = (index) => {
    handleSave("flow");
    setSelectedIndex(index);
    setMenu(null);
  };

  const handleEventLogs = async (subEventName) => {
    await eventTracker
      .captureEvent("", {
        eventName: "SummaryVisit",
        subEventName: subEventName,
        eventType: "",
        username: username,
        appname: appname,
        modulename: modulename,
        entityname: groupname,
      })
      .then((result) => {
        // console.log("reuslt is -> ", result);
        console.log(`${subEventName} event data saved to db`);
      })
      .catch((err) => {
        // console.log("error is -> ", err);
        console.log(`${subEventName} event error while saving to db`);
      });
  };

  const handleModeChange = (mode) => {
    console.log("the mode is -> ", mode);

    let { name } = mode;
    mounted &&
      setSnackBar({
        message: `Switched to ${name.toLowerCase()} mode `,
        severity: "info",
      });
    handleModeClose();
    if (isNJAdmin() && name === "CLONE") {
      (async () => {
        ["isFormInEditing", "editedEntityInfo"].map((e) =>
          sessionStorage.removeItem(e)
        );
        delete data.sys_entityAttributes.isOpen;
        await entity.update(
          { appname, modulename, entityname: groupname, id: data._id },
          data
        );
      })();
    }
    onModeChange ? onModeChange(name) : setMode(name.toUpperCase());
  };

  const closeModal = () => openModal(false);

  const handleSave = async (type) => {
    if (metadata?.sys_entityAttributes?.sys_autoSaveReports)
      checkForReportAutoSave({
        metadata,
        formData,
        showSampleData,
        appname,
        modulename,
        entityname: groupname,
        id,
      });
    //SAVE MAP INTERACTION
    if (["NEW", "CLONE"].includes(mode) && lastInteractedPosition)
      dispatch({
        type: "SET_SUMMARY_MAP_POSITION",
        payload: lastInteractedPosition,
      });

    let quickFlow = type === "flow" ? true : false;
    setBackDrop("Saving data");
    setDialog({ dialog: false });
    if (metadata) {
      let response;
      if (["NEW", "CLONE"].includes(mode)) {
        delete formData.sys_entityAttributes.isOpen;
        response = await entity.create(
          { ...params, entityname: groupname },
          formData
        );
      } else {
        console.log("formData", formData);
        // formRef.current = formData;
        response = await entity.update(
          { ...params, entityname: groupname, id },
          formData
        );
      }
      closeBackDrop();
      setSnackBar({
        message: "Data has been successfully saved",
        severity: "success",
      });
      if (detailMode === "REFERENCE") onClose();
      if (stayInDetailPage === true && screenType !== "RELATION") {
        handleSidebar("0px");
      }
      setTriggerSave(false);
      if (quickFlow) {
        setQuickFlow(response);
        setFlowTouched(true);
        !prevQuickFlow && saveCallback && saveCallback(response, true, mode);
      } else {
        saveCallback &&
          saveCallback(
            response,
            stayInDetailPage === true ||
              type === "event_more_options" ||
              detailMode == "REFERENCE"
              ? true
              : false,
            mode
          );
        enableUpdateRef.current = true;
        // openCloseDialog();
      }
    }
  };

  const isAccessible = () => {
    return checkDataAccess({
      appname,
      modulename,
      entityname: groupname,
      permissionType: "write",
      data,
      metadata: baseTemplate ? baseTemplate : metadata,
    });
  };

  const isExist = () => {
    let params = {
      appname: "NJAdmin",
      modulename: "NJ-SysTools",
      entityname: "Helpers",
      "sys_templateGroupName.sys_groupName": groupname,
      isFeature: "No",
      skip: 0,
      limit: 1,
    };
    entityCount.get(params).then((res) => {
      if (res.data) setHelperButton(true);
    });
  };

  //useEffects
  useEffect(() => {
    if (mode && metadata) {
      let autoData = props.autodata ? props.autodata : data;
      if (MODE === "NEW" && !isNJAdmin()) {
        let agencyInfo = {
          sys_entityAttributes: {
            agencyuser: getAgencyRef(true),
          },
        };
        if (autoData) {
          autoData.sys_entityAttributes = {
            ...agencyInfo?.sys_entityAttributes,
            ...autoData?.sys_entityAttributes,
          };
        }
      }
      let entityData = constructFormData(
        autoData,
        metadata,
        MODE,
        basicFormData,
        {
          userInfo: getUserInfo(),
        }
      );
      setFormData({ type: "SET_ENTITY_DATA", payload: entityData });
      setFormError({
        type: "SET_FORM_ERRORS",
        payload: { entityData, metadata },
      });

      if (lastInteractedPosition)
        dispatch({
          type: "SET_SUMMARY_INTERACTION",
          payload: null,
        });
    }
    setMounted(true);
    isExist();
  }, []);

  useEffect(() => {
    formCallback && formCallback(formData);
  }, [formData]);

  useEffect(() => {
    let { topLevel, componentLevel } = formError;
    let error =
      (topLevel && topLevel.length) ||
      (componentLevel && componentLevel.length);
    errorCallback &&
      errorCallback({ ...formError, error: error ? true : false });
  }, [formError]);

  useEffect(() => {
    if (metadata) {
      setTitle(metadata.sys_entityAttributes.sys_friendlyName);
      if (metadata.sys_entityAttributes.sys_entityRelationships) {
        let quickEntities =
          metadata.sys_entityAttributes.sys_entityRelationships.filter(
            (e) =>
              e.quickFlow &&
              checkWriteAccess({
                appname: e.appName,
                modulename: e.moduleName,
                entityname: e.entityName,
              })
          );
        if (quickEntities.length) setOptions(quickEntities);
      }
    }
  }, [METADATA]);

  useEffect(() => {
    if (metadata) {
      setTitle(metadata.sys_entityAttributes.sys_friendlyName);
    }
  }, [metadata]);

  useEffect(() => {
    setMode(MODE.toUpperCase());
  }, [MODE]);

  useEffect(() => {
    if (triggerSave) handleSave();
  }, [triggerSave]);

  useEffect(() => {
    formData?.sys_entityAttributes?.carNumber?.carNumber &&
      setCarNo(formData?.sys_entityAttributes?.carNumber?.carNumber || "");
  }, [formData]);

  // useEffect(() => {
  //   return () => {
  //     if (
  //       isNJAdmin() &&
  //       (history.action === "PUSH" || history.action === "POP") &&
  //       sessionStorage.getItem("isFormInEditing")
  //     ) {
  //       sessionStorage.removeItem("isFormInEditing");
  //       sessionStorage.removeItem("editedEntityInfo");
  //       entity.update(
  //         { appname, modulename, entityname: groupname, id: data._id },
  //         formRef.current
  //       );
  //     }
  //   };
  // }, [history]);

  //render Methods
  let getMenu = (quickEntities) => {
    return (
      <Menu
        id="quick-menu"
        anchorEl={menu}
        keepMounte
        open={Boolean(menu)}
        onClose={(e) => setMenu(null)}
      >
        {quickEntities.map((item, index) => {
          return (
            <MenuItem
              testid={`${item.relationButtons[0].title}`}
              onClick={(e) => handleMenuClick(index)}
            >{`${item.relationButtons[0].title}`}</MenuItem>
          );
        })}
      </Menu>
    );
  };

  const getModeDisplay = (modeFlag) => {
    let { name, icon } = modes?.find((a) => a.name === modeFlag) || {
      name: "",
      icon: "NEW",
    };
    name = name.toLowerCase();
    return (
      <>
        <DisplayIcon name={icon} style={{ fontSize: "16px" }} /> &nbsp;
        <DisplayText
          variant="button"
          style={{ "text-transform": "capitalize" }}
        >
          {name}
        </DisplayText>
      </>
    );
  };

  const getQuickFlow = () => {
    if (quickOptions.length === 1) {
      return (
        <DisplayButtonGroup size="small">
          <DisplayButton
            onClick={(e) => handleSave("flow")}
            disabled={checkSaveDisable()}
          >
            {`Save and Add ${quickOptions[0].title}`}
          </DisplayButton>
        </DisplayButtonGroup>
      );
    }
    if (quickOptions.length > 1) {
      return (
        <DisplayButtonGroup size="small">
          <DisplayButton
            testid={"detailPage-qf-save"}
            onClick={(e) => handleSave("flow")}
            disabled={checkSaveDisable()}
            size="small"
          >
            {`Save and Add ${quickOptions[selectedIndex].title}`}
          </DisplayButton>
          <DisplayButton
            testid={"detailPage-qf-dropdown"}
            disabled={checkSaveDisable()}
            size="small"
          >
            <SystemIcons.ArrowDropDown
              onClick={(e) => setMenu(e.currentTarget)}
            />
          </DisplayButton>
          {getMenu(quickOptions)}
        </DisplayButtonGroup>
      );
    }
  };

  const getSections = () => {
    switch (section.split("*")[0]) {
      case "TOP":
        return (
          <TopLevelContext.Provider
            value={{
              topLevelData: formData.sys_entityAttributes
                ? formData.sys_entityAttributes
                : {},
              topLevelErrors: formError.topLevel ? formError.topLevel : [],
            }}
          >
            <TopLevel
              metadata={metadata}
              callSave={() => {
                handleSave();
              }}
              onClose={onClose}
              mode={MODE}
              data={data}
              formError={formError}
            />
          </TopLevelContext.Provider>
        );
      case "COMPONENT":
        return (
          <ComponentContext.Provider
            value={{
              componentData: formData.sys_components
                ? formData.sys_components
                : [],
              componentErrors: formError.componentLevel
                ? formError.componentLevel
                : [],
            }}
          >
            <ComponentLevel />
          </ComponentContext.Provider>
        );
      case "RELATION":
        return (
          <RelatedList
            id={formData._id}
            metadata={metadata}
            appname={appname}
            modulename={modulename}
            entityname={groupname}
            section={section.split("*")[1]}
          />
        );
      case "FILES":
        let { securityParams } = props,
          parentParams = { params, entityname: groupname },
          refData = { id: formData._id, sys_gUid: formData.sys_gUid };
        return (
          <div style={{ display: "flex", flex: 1 }}>
            <FileManager
              hideToolbar={false}
              securityParams={securityParams ? securityParams : null}
              parentMeta={metadata}
              parentMode={mode}
              parentParams={parentParams}
              refData={refData}
            />
          </div>
        );
      case "AUDITS":
        return (
          <div style={{ display: "flex", flex: 1 }}>
            <Audits
              id={formData._id}
              metadata={metadata}
              appname={appname}
              modulename={modulename}
              entityname={groupname}
            />
          </div>
        );
      case "JSON_TOOL":
        return (
          <div style={{ display: "flex", flex: 1 }}>
            <JsonTool
              id={formData._id}
              metadata={metadata}
              appname={appname}
              modulename={modulename}
              groupname={groupname}
              type="jsonTool"
            />
          </div>
        );

      case "WAZE_TOOL":
        return (
          <div style={{ display: "flex", flex: 1 }}>
            <JsonTool
              id={formData._id}
              metadata={metadata}
              appname={appname}
              modulename={modulename}
              groupname={groupname}
              type="wazeTool"
            />
          </div>
        );

      case "TRIGGERS":
        return (
          <TriggerSummary
            id={formData._id}
            sys_gUid={formData.sys_gUid}
            sys_agencyId={formData?.sys_agencyId}
            metadata={metadata}
            appname={appname}
            modulename={modulename}
            groupname={groupname}
          />
        );

      case "DASHBOARD":
        return (
          <Dashboard
            unmountURL={true}
            formData={initialData}
            relationMeta={TABS.filter((fl) => fl.value === "DASHBOARD")}
          />
        );
      default:
        return <div>UNDER DEV</div>;
    }
  };

  const renderAddOns = () => {
    return (
      <>
        <DisplaySnackbar
          open={!!message}
          message={message}
          onClose={clearMessage}
        />
        {
          <Menu
            id="simple-menu"
            anchorEl={modeEl}
            keepMounted
            open={Boolean(modeEl)}
            onClose={handleModeClose}
          >
            {modes.map((eachMode, i) => {
              let { displayCondition, name } = eachMode;
              return (
                displayCondition && (
                  <MenuItem
                    key={name}
                    onClick={(e) => handleModeChange(eachMode)}
                  >
                    {getModeDisplay(name)}
                  </MenuItem>
                )
              );
            })}
          </Menu>
        }
        <ContextMenuWrapper
          options={{ hideTitlebar: true }}
          visible={showJson}
          width="80%"
        >
          <JsonEditor
            metadata={metadata}
            data={formData}
            callbackClose={(value, status) => {
              reloadPage(value, status);
            }}
          />
        </ContextMenuWrapper>
        <DisplayDialog
          testid={"detail"}
          open={dialog.dialog}
          title={dialog.title}
          message={dialog.msg}
          confirmLabel={dialog.confirmLabel}
          onConfirm={dialog.onConfirm}
          onCancel={
            dialog.onCancel
              ? dialog.onCancel
              : () => {
                  setDialog({ dialog: false });
                  setTriggerSave(false);
                }
          }
          {...dialog}
        />
      </>
    );
  };

  const renderBackNavBar = () => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            cursor: "pointer",
          }}
          className="back-button"
          onClick={openCloseDialog}
        >
          <ArrowBackIcon fontSize="medium" />
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    const { sys_auditHistory } = formData;
    if (!hideFooter)
      return (
        <div
          style={{
            ...styles.footer,
            display: "flex",
            ...(section == "RELATION" ? styles.floatBtns : {}),
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 6,
              paddingLeft: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <React.Fragment>
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
                  {
                    label: "Batch ID",
                    value: sys_batchId,
                    visible: sys_batchId,
                  },
                ]
                  .filter((el) => el.visible)
                  .map((au) => (
                    <div
                      style={{
                        display: "flex",
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
            </React.Fragment>
          </div>
          <div style={{ display: "flex", flex: 4, justifyContent: "flex-end" }}>
            {onClose && (
              <DisplayButton
                testid={groupname + "-" + "detailPage-close"}
                onClick={openCloseDialog}
                variant="contained"
                systemVariant="secondary"
              >
                Close
              </DisplayButton>
            )}
            {mode !== "READ" && isAccessible() && onMoreOptions && (
              <DisplayButton
                disabled={checkSaveDisable()}
                onClick={openMoreDialog}
              >
                More Options
              </DisplayButton>
            )}
            {mode !== "READ" && isAccessible() && (
              <>
                &nbsp;&nbsp;
                <DisplayButton
                  testid={groupname + "-" + "detailPage-save"}
                  disabled={checkSaveDisable()}
                  onClick={openSaveDialog}
                  variant="contained"
                  systemVariant="primary"
                >
                  Save
                </DisplayButton>
                &nbsp;&nbsp;
                {getQuickFlow()}
              </>
            )}

            {groupname == "Opportunity" && mode !== "READ" && isAccessible() && (
              <>
                <DisplayButton
                  testid={groupname + "-" + "detailPage-save"}
                  disabled={
                    checkSaveDisable() == false &&
                    checkOpportunityDisable() == false
                      ? false
                      : true
                  }
                  onClick={handleCloudCreation}
                  variant="contained"
                  systemVariant="primary"
                  style={{ textTransform: "inherit" }}
                >
                  {`${
                    formData?.sys_entityAttributes?.cloudSetupStatus ==
                    "Requirements"
                      ? " Save and Create"
                      : "Update"
                  } Cloud`}
                </DisplayButton>
                &nbsp;&nbsp;
              </>
            )}
          </div>
        </div>
      );
    else return null;
  };

  const renderQuickFlow = () => {
    if (isQuickFlow && isQuickFlow.success) {
      return (
        <QuickFlow
          appname={quickOptions[selectedIndex].appName}
          module={quickOptions[selectedIndex].moduleName}
          entity={quickOptions[selectedIndex].entityName}
          path={quickOptions[selectedIndex].path}
          quickFlow={isQuickFlow}
          formData={formData}
          mode={mode}
          closeRenderQuickFlow={() => setQuickFlow(null)}
        />
      );
    }
  };

  const renderSection = () => (
    <DetailContext.Provider
      value={{
        formData,
        metadata,
        setFormData,
        formError,
        setFormError,
        stateParams: { ...params, groupname, id, mode, metadata },
      }}
    >
      {getSections()}
    </DetailContext.Provider>
  );

  const renderTabs = () => {
    if (!hideNavbar)
      return (
        <div
          className="hide_scroll"
          style={{ display: "flex", overflowX: "auto" }}
        >
          <SystemTabCarousel>
            {TABS?.filter((et) => et.visible).map((ef) => {
              return (
                <DisplayChips
                  label={ef.label}
                  variant={"outlined"}
                  style={{
                    margin: "8px 0px 8px 8px",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    border: section == ef.value ? "none" : "1px solid #c3c3c3",
                    fontWeight: section == ef.value ? 500 : 300,
                    color: section == ef.value ? "" : "#212121",
                  }}
                  systemVariant={section == ef.value ? "primary" : ""}
                  onClick={(e) => onTabSelect(ef.value)}
                  className={classes.root}
                />
              );
            })}
          </SystemTabCarousel>
        </div>
      );
    else return null;
  };

  const handleLoading = (value, fetchData) => {
    handleLoadingSkeleton && handleLoadingSkeleton(value, fetchData);
  };

  const handle360ViewClick = () => {
    set360View(true);
  };

  const renderHelperModal = () => {
    return (
      <DisplayModal
        open={modal}
        PaperProps={{ style: { overflow: "visible" } }}
        fullWidth={true}
        maxWidth={"lg"}
        dailogContentProps={{
          style: { overflow: "visible", paddingTop: "0px" },
        }}
        onClose={closeModal}
      >
        <div
          style={{ display: "flex", minHeight: "50vh", overflow: "visible" }}
        >
          <Faqs feature="No" groupName={groupname} />
          <DisplayIcon
            onClick={closeModal}
            name={HighlightOffTwoTone}
            style={{
              fontSize: "35px",
              position: "absolute",
              top: -28,
              right: -28,
              cursor: "pointer",
              color: "white",
            }}
          />
        </div>
      </DisplayModal>
    );
  };

  const uniqueCheck = async (text, formatType) => {
    let res = await entity.get({
      ...params,
      entityname: groupname,
      [formatType]: text,
      limit: 10,
      skip: 0,
    });
    return res?.length > 0 ? true : false;
  };

  const updateCode = async (DOC_PARAMS, formatType, text) => {
    formData["sys_entityAttributes"][formatType] = text;
    try {
      if (mode == "NEW" || mode == "CLONE") {
        setFormData({ type: "SET_ENTITY_DATA", payload: formData });
      } else {
        setFormData({ type: "SET_ENTITY_DATA", payload: formData });
        await entity.update({ ...DOC_PARAMS }, formData);
      }
      setDialog({ dialog: false });
      setSnackBar({
        message:
          formatType == "QR_CODE" ? "QR Code Attached" : "Bar Code Attached",
      });
    } catch (e) {
      setDialog({ dialog: false });
      setSnackBar({ message: "Failed to save data", severity: "error" });
      throw e;
    }
  };

  const onScan = async (scannedData) => {
    const DOC_PARAMS = { ...params, entityname: groupname, id };
    const { format, text } = scannedData;
    let formatType = format === 11 ? "QR_CODE" : "BAR_CODE";
    let checkUnique = await uniqueCheck(text, formatType);

    if (checkUnique) {
      let checkModal = {
        dialog: true,
        title:
          format === 11
            ? "QR Code Already exist!!!"
            : "Bar Code Already exist!!!",
        msg: "Cannot associate scanned code to the current data",
      };
      setDialog(checkModal);
    } else {
      try {
        if (formData["sys_entityAttributes"][formatType]) {
          let checkModal = {
            dialog: true,
            title: `Scanned ${groupname} successfully`,
            msg:
              format === 11
                ? "QR Code already exist do you want to update it?"
                : "Bar Code already exist do you want to update it?",
            confirmLabel: "Update",
            onConfirm: () => {
              updateCode(DOC_PARAMS, formatType, text);
            },
          };
          setDialog(checkModal);
        } else {
          let saveModal = {
            dialog: true,
            title: `Scanned ${groupname} successfully`,
            msg: "Click to Save",
            confirmLabel: "Save",
            onConfirm: () => {
              updateCode(DOC_PARAMS, formatType, text);
            },
          };
          setDialog(saveModal);
        }
      } catch (e) {
        setSnackBar({ message: "Failed to save data", severity: "error" });
      }
    }
  };

  const closeCodeModal = () => {
    setCodeModal(false);
  };

  const renderCodeModal = () => {
    let modalProps = {
      qrCode: QR_CODE,
      barCode: BAR_CODE,
      download: true,
      sys_gUid: formData.sys_gUid,
    };
    return (
      openCodeModal && (
        <DisplayModal
          open={openCodeModal}
          PaperProps={{ style: { overflow: "visible" } }}
          maxWidth={"sm"}
          onClose={closeCodeModal}
        >
          <div style={{ height: "50vh", minWidth: "25vw" }}>
            <CodeGenerator {...modalProps} />
            <DisplayIcon
              onClick={closeCodeModal}
              name={HighlightOffTwoTone}
              style={{
                fontSize: "35px",
                position: "absolute",
                top: -28,
                right: -28,
                cursor: "pointer",
                color: "white",
              }}
            />
          </div>
        </DisplayModal>
      )
    );
  };

  const renderScannerModal = () => {
    return (
      openScannerModal && (
        <ScannerModal
          onSuccessCallback={onScan}
          onClose={setScannerModal}
          scannerTimeout={30000}
        />
      )
    );
  };

  const renderHeaderMenuItem = () => {
    return (
      <>
        {mode !== "NEW" && (
          <Menu
            id="options-menu"
            anchorEl={optionEl}
            keepMounted
            open={Boolean(optionEl)}
            onClose={handleOptionClose}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
          >
            {optionMenu.map(
              ({ displayCondition, name, icon, ...menuItemProps }) => {
                return (
                  displayCondition && (
                    <MenuItem key={name} {...menuItemProps}>
                      <DisplayIcon name={icon} style={{ fontSize: "16px" }} />{" "}
                      &nbsp;
                      <DisplayText variant="button">{name}</DisplayText>
                    </MenuItem>
                  )
                );
              }
            )}
          </Menu>
        )}
        <ContextMenuWrapper
          options={{ hideTitlebar: true }}
          visible={showNotes}
          width="30%"
        >
          <Notes
            appname="Features"
            modulename="Feature"
            parentMode={mode}
            entityname="Notes"
            groupname={groupname}
            id={formData.sys_gUid}
            callbackClose={() => setNotes(false)}
            title="Collaborator"
          />
        </ContextMenuWrapper>
        <DisplayModal
          fullWidth={true}
          maxWidth="lg"
          height="85vh"
          options={{ hideTitlebar: true }}
          open={showActionItems}
          width="40%"
        >
          <div style={{ height: "85vh", width: "100%" }}>
            <ActionItems
              callbackClose={() => setActionItem(false)}
              refData={{
                appName: appname,
                moduleName: modulename,
                templateName: formData.sys_templateName,
                id: formData._id,
                sys_gUid: formData.sys_gUid,
              }}
            />
          </div>
        </DisplayModal>
        {
          <Menu
            id="qrbarscan-menu"
            anchorEl={scanMenu}
            keepMounted
            open={Boolean(scanMenu)}
            onClose={handleScanClose}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
          >
            {codeGeneratorMenu.map(
              ({ displayCondition, name, ...menuItemProps }) => {
                return (
                  displayCondition && (
                    <MenuItem key={name} {...menuItemProps}>
                      <DisplayText variant="button">{name}</DisplayText>
                    </MenuItem>
                  )
                );
              }
            )}
          </Menu>
        }
      </>
    );
  };

  const reload360View = () => {
    set360View(false);
    history.go();
  };

  let getMultiAssetsView = useMemo(() => {
    return (
      <MultiAssetsView
        open360View={open360View}
        set360View={set360View}
        reload360View={reload360View}
        props={props}
      ></MultiAssetsView>
    );
  }, [open360View]);

  const renderHeaderFields = () => {
    return (
      <div
        style={{
          display: "flex",
          // border: "1px solid",
          backgroundColor: "none",
          alignItems: "center",
          height: "30px",
        }}
      >
        <SystemTabCarousel
          style={{
            boxShadow: "none",
            // border: "1px solid",
            height: "inherit",
            backgroundColor: "transparent",
          }}
        >
          {headerFields?.map((ehf) => {
            let ehData =
              data && data?.sys_entityAttributes
                ? data?.sys_entityAttributes[ehf?.name]
                : "";
            let listColor = [];
            if (ehf.type === "LIST") {
              listColor = ehf?.values?.filter(
                (ev) => ev?.id == textExtractor(ehData, ehf)
              );
            }
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "10px 0px 10px 10px",
                  justifyContent: "center",
                  alignSelf: "center",
                  fontSize: "14px",
                  fontFamily: "Poppins",
                }}
              >
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <span style={{ fontWeight: "500" }}>{ehf.title + ": "}</span>
                </div>
                &nbsp;&nbsp;
                <div
                  style={{
                    display: "flex",
                    gap:
                      !listColor[0]?.icon && listColor[0]?.iconColor ? 0 : 12,
                  }}
                >
                  {listColor[0]?.icon && (
                    <div
                      style={{
                        borderRadius: "50%",
                        width: "1px",
                        display: "flex",
                        alignSelf: "center",
                      }}
                    >
                      <img height={15} width={15} src={listColor[0]?.icon} />
                    </div>
                  )}
                  {!listColor[0]?.icon && listColor[0]?.iconColor && (
                    <div
                      style={{
                        borderRadius: "50%",
                        height: "15px",
                        width: "15px",
                        display: "flex",
                        alignSelf: "center",
                        backgroundColor: ehf?.values?.find(
                          (i) => i.value === textExtractor(ehData, ehf)
                        )?.iconColor,
                      }}
                    ></div>
                  )}
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
                    <span
                      style={{
                        color: listColor[0]?.color
                          ? listColor[0]?.color
                          : bgColor || "black",
                        fontWeight: listColor[0]?.color ? 400 : "",
                        paddingLeft: "5px",
                      }}
                    >
                      {textExtractor(ehData, ehf, {}, "HEADERPANEL")}&emsp;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </SystemTabCarousel>
      </div>
    );
  };

  const renderInfoPopup = () => {
    return (
      <div
        style={{
          width: "100%",
          height: "48px",
          backgroundColor: "#F07167",
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
              {`${get(
                data,
                "sys_entityAttributes.currentFormEditor.userFriendlyName",
                "User"
              )}(${get(
                data,
                "sys_entityAttributes.currentFormEditor.username",
                ""
              )})`}{" "}
              is editing the{" "}
              {`${getEntityFriendlyName({
                appname,
                modulename,
                entityname: title,
              })}`}
              .
            </DisplayText>
          </div>
        </div>
      </div>
    );
  };

  const checkForVideoLinks = () => {
    let videoLinks = helperData.videoLinks.filter((e) =>
      isDefined(e.link)
    ).length;
    return videoLinks > 0;
  };

  const renderTitleBar = () => {
    const { sys_auditHistory } = formData;
    if (!hideTitlebar)
      return (
        <div
          style={{
            ...styles.header,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
            }}
          >
            <div style={styles.header_title_sec}>
              <DisplayGrid
                style={{}}
                testid={
                  "detailPage-" +
                  metadata?.sys_entityAttributes?.sys_friendlyName
                }
                item
                container
              >
                {fromMap !== true &&
                  detailMode !== "REFERENCE" &&
                  screenType !== "RELATION" && <div>{renderBackNavBar()}</div>}
                <DisplayGrid>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <DisplayText
                      variant="h6"
                      style={{
                        fontFamily: "Poppins",
                        color: "#212121",
                        fontWeight: 600,
                        paddingLeft: "0.5rem",
                      }}
                    >
                      {sys_detailPageTitle
                        ? sys_detailPageTitle
                        : getEntityFriendlyName({
                            appname,
                            modulename,
                            entityname: title,
                          })}
                      {showCarNumber && carNumber && " - " + carNumber}
                    </DisplayText>
                    {(isNJAdmin() ||
                      (helperData && checkForVideoLinks() && showHelper)) && (
                      <div
                        style={{
                          display: "flex",
                          height: "24px",
                          width: "auto",
                          border: "1px solid #81D4FA",
                          borderRadius: "50px",
                          gap: "4px",
                          padding: "0px 4px",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: "#E1F5FE",
                          cursor: "pointer",
                        }}
                        onClick={() => setHelp(true)}
                      >
                        <HelpOutlineOutlinedIcon
                          style={{ color: "#1976d2", fontSize: "1rem" }}
                        />
                        <span style={{ fontSize: "12px", color: "#0277BD" }}>
                          Help
                        </span>
                      </div>
                    )}
                  </div>
                </DisplayGrid>
              </DisplayGrid>
            </div>
            {
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  flex: 12,
                  justifyContent: "flex-end",
                  // border: "1px solid red",
                  marginTop:
                    fromMap ||
                    detailMode === "REFERENCE" ||
                    screenType === "RELATION"
                      ? "0px"
                      : "0px",
                }}
              >
                {formData.sys_entityAttributes && sys_hotButtons && (
                  <HotButton
                    entityDoc={formData}
                    entityTemplate={metadata}
                    handleLoading={handleLoading}
                    parentMeta={metadata}
                    displayTitle={true}
                    appname={appname}
                    modulename={modulename}
                    entityname={groupname}
                    disable={["NEW", "CLONE"].includes(mode) || !isAccessible()}
                    buttonStyle={{ minWidth: "120px" }}
                  />
                )}
                {mode === "EDIT" &&
                  entitiesToAttach?.length == 1 &&
                  section.split("*")[1] !== entitiesToAttach[0]?.entityName &&
                  checkAttachedStatus(data) && (
                    <DisplayButton
                      testid={"detailHeader-attachButton"}
                      onClick={() => {
                        handleAttachClick(data);
                      }}
                      color="primary"
                      systemVariant="primary"
                      variant="contained"
                    >
                      {entitiesToAttach[0]?.createButton?.title
                        ? entitiesToAttach[0]?.createButton?.title
                        : "Attach"}
                    </DisplayButton>
                  )}
                {
                  <DisplayModal open={showModal} fullWidth={true} maxWidth="xl">
                    <div
                      style={{
                        height: "85vh",
                        width: "100%",
                        display: "flex",
                        flex: 1,
                      }}
                    >
                      <ContainerWrapper>
                        <div
                          style={{ height: "98%", width: "98%", padding: "1%" }}
                        >
                          <DetailContainer
                            appname={childParams.childApp}
                            modulename={childParams.childModule}
                            groupname={childParams.childEntity}
                            mode="new"
                            options={{
                              hideTitleBar: true,
                              hideNavButtons: true,
                            }}
                            detailMode="REFERENCE"
                            autodata={autoPopulate}
                            onClose={(e) => setShowModal(false)}
                          />
                        </div>
                      </ContainerWrapper>
                    </div>
                  </DisplayModal>
                }
                {!hideNavButtons && (
                  <>
                    {headerButtons.map(
                      ({ displayCondition, icon, name, ...buttonProps }) => {
                        return (
                          displayCondition && (
                            <DisplayButton
                              key={name}
                              color="primary"
                              {...buttonProps}
                              style={{ display: "flex", order: -2 }}
                            >
                              {icon}
                            </DisplayButton>
                          )
                        );
                      }
                    )}
                    {!hideModeButtons &&
                      !["NEW", "CLONE"].includes(MODE) &&
                      isAccessible() &&
                      (isNJAdmin() ||
                        groupname.toUpperCase() !== "AGENCY" ||
                        getAgencyId != data.sys_agencyId) && (
                        <DisplayButton
                          testid={"detailPage-read&write"}
                          onClick={handleModeClick}
                          color="primary"
                          endIcon={
                            <ArrowDropDown testid={"detailPage-dropdown"} />
                          }
                        >
                          {getModeDisplay(mode)}
                        </DisplayButton>
                      )}
                    {!hideFeatureButtons &&
                      mode !== "NEW" &&
                      optionMenu.some((eo) => eo.displayCondition) && (
                        <DisplayButton
                          testid={"options"}
                          onClick={handleOptionClick}
                          color="primary"
                          endIcon={<ArrowDropDown testid={"option-dropdown"} />}
                        >
                          Options
                        </DisplayButton>
                      )}
                  </>
                )}
                {helperButton && (
                  <DisplayButton
                    style={{ display: "flex", order: -1 }}
                    onClick={() => {
                      openModal(true);
                    }}
                    startIcon={<Help />}
                  >
                    Help
                  </DisplayButton>
                )}
                {metadata?.sys_entityAttributes?.multiAssetsView === true &&
                  ["EDIT", "READ"].includes(mode?.toUpperCase()) && (
                    <DisplayButton
                      variant="outlined"
                      onClick={handle360ViewClick}
                    >
                      360° View
                    </DisplayButton>
                  )}
                {REPORT_VISIBILITY &&
                  ["EDIT", "READ"].includes(mode?.toUpperCase()) && (
                    <>
                      <DisplayFormLabel
                        style={{
                          fontWeight: 700,
                          fontSize: "18px",
                          color: "#212121",
                        }}
                        toolTipMsg={detailReportDescription}
                        placement="bottom-start"
                      >
                        <DisplayButton
                          variant="outlined"
                          onClick={() => {
                            setReportFlag(true);
                          }}
                        >
                          <PictureAsPdf fontSize="small" />
                          &nbsp; Reports &nbsp;
                        </DisplayButton>
                      </DisplayFormLabel>
                      <ReportGenerator
                        appname={appname}
                        modulename={modulename}
                        entityname={groupname}
                        modalFlag={reportFlag}
                        data={data}
                        metadata={metadata}
                        onClose={() => {
                          setReportFlag(false);
                        }}
                      />
                    </>
                  )}

                {open360View && getMultiAssetsView}
              </div>
            }
          </div>
          {mode !== "NEW" &&
            showHeaderFields &&
            headerFields?.length > 0 &&
            renderHeaderFields()}
        </div>
      );
    else return null;
  };

  if (metadata)
    return (
      <div style={styles.container}>
        {renderTitleBar()}
        {/* {enableInfoPopup && renderInfoPopup()} */}
        {renderTabs()}
        {renderSection()}

        <div>
          {[
            renderFooter,
            renderAddOns,
            renderQuickFlow,
            renderHelperModal,
            renderHeaderMenuItem,
            renderCodeModal,
            renderScannerModal,
          ].map((render) => render())}
        </div>
        {openHelp && (
          <VideoPlayer
            handleModalClose={() => setHelp(false)}
            screenName={"DETAIL_PAGE_SCREEN"}
            helperData={helperData}
          />
        )}
      </div>
    );
  else return <DetailContainerSkeleton />;
};

DetailPage.defaultProps = {
  options: {
    hideFooter: false,
    hideNavbar: false,
    hideModeButtons: false,
    hideFeatureButtons: false,
    hideNavButtons: false,
    hideRelation: false,
    hideTitlebar: false,
    triggerSave: false,
  },
};
