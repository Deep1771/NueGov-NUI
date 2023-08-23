import React, { useState, useEffect, useRef, useMemo } from "react";
import Slide from "@material-ui/core/Slide";
import debounce from "lodash/debounce";
import { makeStyles } from "@material-ui/core/styles";
import { entity } from "utils/services/api_services/entity_service";
import { csv } from "utils/services/api_services/export_service";
import { awsDel } from "utils/services/api_services/aws_service";
import {
  ThemeFactory,
  UserFactory,
  GlobalFactory,
} from "utils/services/factory_services";
import { BubbleLoader, Banner } from "components/helper_components";
import Checkbox from "@material-ui/core/Checkbox";
import {
  DisplayButton,
  DisplayCard,
  DisplayGrid,
  DisplayIconButton,
  DisplayModal,
  DisplaySnackbar,
  DisplayTabs,
  DisplayText,
  DisplaySelect,
  DisplayDivider,
} from "components/display_components/index";
import {
  ContainerWrapper,
  ToolTipWrapper,
} from "components/wrapper_components";
import { SystemIcons } from "utils/icons/index";
import { useStateValue } from "utils/store/contexts";
import { InputWrapper } from "components/wrapper_components";
import Stylesheet from "utils/stylesheets/display_component";
import { VideoPlayer } from "components/helper_components/video_player";
import { isDefined } from "utils/services/helper_services/object_methods";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles({
  modal_header: ({ colors }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // paddingRight: "10px",
    // backgroundColor: colors.dark.bgColor,
    padding: "1.5rem 1.5rem 0rem 1.5rem",
  }),
  checkbox_selected: ({ colors }) => ({
    color: colors.dark.bgColor,
    ":selection": colors.dark.bgColor,
  }),
  checkbox_selected: ({ colors }) => ({
    color: colors.dark.bgColor,
    ":selection": colors.dark.bgColor,
  }),
});

const FORMATS = [
  {
    title: "CSV",
    id: "CSV",
  },
  {
    title: "XML",
    id: "XML",
  },
  {
    title: "JSON",
    id: "JSON",
  },
];

export const Export_Csv = (props) => {
  const { getContextualHelperData } = GlobalFactory();
  let { entityTemplate, open, onClose, totalCount, filters, appObject } = props;
  let { sys_entityAttributes } = entityTemplate;
  let { sys_topLevel, sys_components, csvRunLimit, csvFetchLimit } =
    sys_entityAttributes;

  const helperData = getContextualHelperData("EXPORT_SCREEN");

  sys_topLevel = sys_topLevel.reduce((acc, curr) => {
    if (!acc.length) acc.push(curr);
    else {
      if (curr.type === "LIST") {
        let checkForDuplicate = acc.findIndex((e) => e.name === curr.name);
        if (checkForDuplicate != -1)
          acc[checkForDuplicate] = {
            ...acc[checkForDuplicate],
            values: [...acc[checkForDuplicate].values, ...curr.values],
          };
      }
      if (curr.type !== "SECTION") {
        if (!curr.hasOwnProperty("displayOnCsv")) {
          curr["displayOnCsv"] = true;
        }
      }
      let checkForDuplicate = acc.find((e) => e.name === curr.name);
      if (!checkForDuplicate) acc.push(curr);
    }
    return acc;
  }, []);
  const { getDetails, getEntityFeatureAccess, isNJAdmin, getAgencyDetails } =
    UserFactory();
  const { getVariantForComponent, getVariantObj } = ThemeFactory();
  const [{ contextualHelperState }] = useStateValue();
  const { dark } = getVariantObj("primary");
  const { useCheckboxStyles } = Stylesheet();
  const classes = useStyles(getVariantForComponent("", "primary"));
  const checkBoxClasses = useCheckboxStyles(
    getVariantForComponent("displayCheckBox", "primary")
  );
  const { showHelper = false, showSampleData = false } =
    getAgencyDetails?.sys_entityAttributes || {};

  let { HighlightOff, CloudDownload, Delete, Help } = SystemIcons;
  const [data, setData] = useState();
  const [exports, setExports] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedTab, setSelectedTab] = useState("exportCsv");
  const [userInfo, setUserInfo] = useState();
  const [buttonName, setButtonName] = useState({ name: "Select All" });
  const [fileOptions, setFileOptions] = useState({});
  const [openHelp, setHelp] = useState(false);
  const inputRef = useRef({
    exportFormat: "CSV",
  });

  let secTabs = sys_topLevel.reduce((sections, ef) => {
    if (ef.type == "SECTION" && ef.marker == "start")
      sections.push({
        ...ef,
        fields: [],
      });

    if (
      !["SECTION", "SUBSECTION"].includes(ef.type) &&
      !["", null, undefined].includes(ef.title)
    )
      sections[sections.length - 1].fields.push(ef);
    return sections;
  }, []);

  let getDocumentsAccess = getEntityFeatureAccess(
    appObject.appname,
    appObject.modulename,
    appObject.entityname,
    "Files"
  );
  if (getDocumentsAccess) {
    secTabs = [
      ...secTabs,
      ...[
        {
          name: "documents",
          title: "Document",
          fields: [
            { name: "documents", title: "Documents", displayOnCsv: true },
          ],
        },
      ],
    ];
  }
  let getAuditAccess = getEntityFeatureAccess(
    appObject.appname,
    appObject.modulename,
    appObject.entityname,
    "Audits"
  );
  if (getAuditAccess) {
    secTabs = [
      ...secTabs,
      ...[
        {
          name: "audits",
          title: "Audit",
          fields: [{ name: "audit", title: "Audits", displayOnCsv: true }],
        },
      ],
    ];
  }
  const isComponent = sys_components && sys_components.length > 0;
  let componentFields;
  let componentsItems =
    isComponent &&
    sys_components[0].componentList.map((item) => {
      return {
        name: item.name,
        sys_entityAttributes: item.sys_entityAttributes,
        componentTitle: item.componentTitle,
      };
    });
  if (isComponent) {
    componentFields = componentsItems.map((item) => {
      let index = item.sys_entityAttributes.filter((e) => e.displayOnCsv);
      let newAttributes = [
        ...index,
        ...[{ name: "gUidField", title: "UniqueId", displayOnCsv: true }],
      ];
      return {
        name: item.name,
        sys_entityAttributes: newAttributes,
        componentTitle: item.componentTitle,
      };
    });
  }

  const TABS = [
    {
      label: "EXPORT CSV",
      value: "exportCsv",
      visible: true,
    },
    {
      label: "RECENT CSV",
      value: "recentCsv",
      visible: true,
      action: () => getExports(),
    },
  ];

  const checkForVideoLinks = () => {
    let videoLinks = helperData.videoLinks.filter((e) =>
      isDefined(e.link)
    ).length;
    return videoLinks > 0;
  };

  useEffect(() => {
    if (getDetails) {
      setUserInfo(getDetails);
    }
    constructInitialData();
  }, []);

  let getExports = async () => {
    let { exportFormat } = inputRef.current;
    let params = {
      appname: appObject.appname ? appObject.appname : "",
      entityname: "Job",
      modulename: "Report",
      limit: csvFetchLimit ? csvFetchLimit : 100,
      type: exportFormat,
    };
    let recentCsvData = [];
    let response = await entity.query(params);
    if (response.status == "error") {
      return "No documents found";
    } else {
      response.forEach((object) => {
        let obj = {};
        obj["_id"] = object._id;
        obj["name"] = object.sys_entityAttributes.sys_customName;
        obj["status"] = object.sys_entityAttributes.status;
        obj["description"] = object.sys_entityAttributes.description;
        obj["date"] = object.sys_entityAttributes.date;
        obj["url"] = object.sys_entityAttributes.fileLoc;
        recentCsvData.push(obj);
      });
    }
    setExports(recentCsvData);
  };

  const constructInitialData = () => {
    let finalObj = {
      component: {},
      noncomponent: {},
      section: {},
      componentName: {},
      indeterminate: {},
    };
    let { sys_components } = entityTemplate.sys_entityAttributes;
    if (secTabs && secTabs.length) {
      secTabs.map((item) => {
        finalObj["section"][item.name] = false;
      });

      secTabs.map((item) => {
        let Obj = {};
        item.fields
          .filter((item1) => item1.displayOnCsv)
          .map((item3) => {
            Obj[item3.name] = false;
          });
        finalObj["noncomponent"][item.name] = Obj;
      });
    }
    if (sys_components && sys_components.length) {
      sys_components[0].componentList.map((item) => {
        finalObj["componentName"][item.name] = false;
      });
      sys_components[0].componentList.map((item) => {
        finalObj["component"][item.name] = {};
        item.sys_entityAttributes
          .filter((e) => e.displayOnCsv)
          .map((e1) => {
            finalObj["component"][item.name][e1.name] = false;
          });
        finalObj["component"][item.name]["gUidField"] = false;
      });
    }
    setData(finalObj);
  };

  const clearMessage = () => setMessage(null);

  const handleChange = debounce((value, type) => {
    setFileOptions((prevState) => {
      return {
        ...prevState,
        [type]: value,
      };
    });
  }, 1200);

  const handleCheckBox = (event, value, level) => {
    let { exportName } = inputRef.current;
    let prevState = Object.assign({}, { ...data, Name: exportName });

    if (level === "section" && prevState["indeterminate"][value.section]) {
      prevState["indeterminate"][value.section] = false;
      prevState["section"][value.section] = false;
      value.fields
        .filter((item) => item.displayOnCsv)
        .map((item1) => {
          prevState["noncomponent"][value.section][item1.name] = false;
        });
      setData(prevState);
    } else if (level === "section") {
      prevState["section"][value.section] = event.target.checked;
      value.fields
        .filter((item) => item.displayOnCsv)
        .map((item1) => {
          prevState["noncomponent"][value.section][item1.name] =
            event.target.checked;
        });
      setData(prevState);
    } else if (level === "topLevel") {
      prevState["noncomponent"][value.headingName][value.field] =
        event.target.checked;

      if (
        !Object.values(prevState.noncomponent[value.headingName]).some(
          (value) => value === true
        )
      )
        prevState["indeterminate"][value.headingName] = false;
      else prevState["indeterminate"][value.headingName] = true;

      if (
        Object.values(prevState.noncomponent[value.headingName]).every(
          (value) => value === false
        )
      ) {
        prevState["indeterminate"][value.headingName] = false;
        prevState["section"][value.headingName] = false;
      }

      if (
        Object.values(prevState.noncomponent[value.headingName]).every(
          (value) => value === true
        )
      ) {
        prevState["indeterminate"][value.headingName] = false;
        prevState["section"][value.headingName] = true;
      }
      setData(prevState);
    } else if (
      level === "componentName" &&
      prevState["indeterminate"][value.component]
    ) {
      prevState["indeterminate"][value.component] = false;
      prevState["componentName"][value.component] = false;
      value.field
        .filter((item) => item.displayOnCsv)
        .map((item) => {
          prevState["component"][value.component][item.name] = false;
        });
      setData(prevState);
    } else if (level === "componentName") {
      prevState["componentName"][value.component] = event.target.checked;
      value.field
        .filter((item) => item.displayOnCsv)
        .map((item) => {
          prevState["component"][value.component][item.name] =
            event.target.checked;
        });
      setData(prevState);
    } else {
      prevState["component"][value.component][value.field] =
        event.target.checked;
      if (
        !Object.values(prevState.component[value.component]).some(
          (value) => value === true
        )
      )
        prevState["indeterminate"][value.headingName] = false;
      else prevState["indeterminate"][value.headingName] = true;
      if (
        Object.values(prevState.component[value.component]).every(
          (value) => value === false
        )
      ) {
        prevState["indeterminate"][value.headingName] = false;
        prevState["componentName"][value.headingName] = false;
      }

      if (
        Object.values(prevState.component[value.component]).every(
          (value) => value === true
        )
      ) {
        prevState["indeterminate"][value.headingName] = false;
        prevState["componentName"][value.headingName] = true;
      }
      setData(prevState);
    }
    let isComp = Object.values(prevState.component)
      .map((item) => Object.values(item))
      .flat()
      .every((value) => value === true);
    let isTop = Object.values(prevState.noncomponent)
      .map((item) => Object.values(item))
      .flat()
      .every((value) => value === true);

    if (isComp && isTop) setButtonName({ name: "Deselect All" });
  };

  const handleClose = () => {
    onClose();
  };

  const handleClick = (e, url, idx) => {
    window.open(url, "_blank");
  };

  const handleDelete = async (name, _id) => {
    setMessage("Hang On, Deleting Data...");
    let deleteObject = {
      fileName: name,
      id: _id,
      entity: "jobs",
    };
    awsDel
      .remove(deleteObject)
      .then((res) => {
        setMessage("Successful. Data Deleted.");
        getExports();
      })
      .catch((e) => {
        setMessage("Something Went Wrong.");
      });
  };

  const noncomponentFormat = async (data) => {
    let Obj = {};
    let noncomponent = Object.values(data.noncomponent);
    noncomponent.map((item) => {
      let keys = Object.keys(item);
      let values = Object.values(item);
      keys.map((item1, idx1) => {
        values.map((item2, idx2) => {
          if (idx1 === idx2) Obj[item1] = item2;
        });
      });
    });
    data["noncomponent"] = Obj;
    return data;
  };

  const handleExport = async () => {
    setMessage("Exporting Data...");
    let { exportFormat, exportName, emptyString, limit, skip } =
      inputRef.current;
    let copyData = { ...data, Name: exportName };
    let Query = {};
    Query["limit"] = limit ? limit : csvRunLimit ? csvRunLimit : 5000;
    Query["skip"] = skip ? skip : 0;
    if (filters) {
      Query = {
        ...Query,
        ...filters,
        ...(showSampleData && { sampleData: true }),
      };
    }
    if (props?.archiveMode) {
      Query = {
        ...Query,
        archiveMode: props?.archiveMode,
      };
    }
    if (props?.archiveMode) {
      Query = {
        ...Query,
        archiveMode: props?.archiveMode,
      };
    }
    if (props?.archiveMode) {
      Query = {
        ...Query,
        archiveMode: props?.archiveMode,
      };
    }
    let newDataFormat = await noncomponentFormat(copyData);
    let exportCsv = {
      jobType: "EXPORTS",
      jobPayload: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sys_agencyId: userInfo.sys_agencyId,
        sys_userName: userInfo.sys_entityAttributes.username,
        description: "Some report name",
        sys_customName: exportName,
        jobType: exportFormat,
        sys_entityName: "Job",
        date: Date(),
        query: Query,
        sys_roleId: "",
        sys_userId: userInfo._id,
        requiredFields: newDataFormat,
        scheduled: false,
        params: appObject,
        emptyString,
      },
    };

    csv
      .update(appObject, exportCsv)
      .then((result) => {
        constructInitialData();
        setButtonName({ name: "Select All" });
        setTimeout(() => {
          setSelectedTab("recentCsv");
        }, 3000);
        let timerId = setInterval(() => getExports(), 10000);
        setTimeout(() => {
          clearInterval(timerId);
        }, 240000);
        inputRef.current = {
          exportFormat: "CSV",
        };
      })
      .catch((error) => {
        setMessage("Something Went Wrong.");
      });
  };

  const checkIfFailed = (exportedDate) => {
    let currentDate = new Date().toISOString().split("T")[0];
    exportedDate = new Date(exportedDate).toISOString().split("T")[0];
    return currentDate > exportedDate ? true : false;
  };

  const handleSelectAll = () => {
    let finalObj = {
      component: {},
      noncomponent: {},
      section: {},
      componentName: {},
      indeterminate: {},
    };
    let { sys_components } = entityTemplate.sys_entityAttributes;
    if (secTabs && secTabs.length) {
      secTabs.map((item) => {
        finalObj["section"][item.name] = true;
        finalObj["indeterminate"][item.name] = false;
      });

      secTabs.map((item) => {
        let Obj = {};
        item.fields
          .filter((item1) => item1.displayOnCsv)
          .map((item3) => {
            Obj[item3.name] = true;
          });
        finalObj["noncomponent"][item.name] = Obj;
      });
    }
    if (sys_components && sys_components.length) {
      sys_components[0].componentList.map((item) => {
        finalObj["componentName"][item.name] = true;
        finalObj["indeterminate"][item.name] = false;
      });
      sys_components[0].componentList.map((item) => {
        finalObj["component"][item.name] = {};
        item.sys_entityAttributes
          .filter((e) => e.displayOnCsv)
          .map((e1) => {
            finalObj["component"][item.name][e1.name] = true;
          });
        finalObj["component"][item.name]["gUidField"] = true;
      });
    }
    setData(finalObj);
    setButtonName({ name: "Deselect All" });
  };

  const handleDeSelectAll = () => {
    let finalObj = {
      component: {},
      noncomponent: {},
      section: {},
      componentName: {},
      indeterminate: {},
    };
    let { sys_components } = entityTemplate.sys_entityAttributes;
    if (secTabs && secTabs.length) {
      secTabs.map((item) => {
        finalObj["section"][item.name] = false;
        finalObj["indeterminate"][item.name] = false;
      });

      secTabs.map((item) => {
        let Obj = {};
        item.fields
          .filter((item1) => item1.displayOnCsv)
          .map((item3) => {
            Obj[item3.name] = false;
          });
        finalObj["noncomponent"][item.name] = Obj;
      });
    }
    if (sys_components && sys_components.length) {
      sys_components[0].componentList.map((item) => {
        finalObj["componentName"][item.name] = false;
        finalObj["indeterminate"][item.name] = false;
      });
      sys_components[0].componentList.map((item) => {
        finalObj["component"][item.name] = {};
        item.sys_entityAttributes
          .filter((e) => e.displayOnCsv)
          .map((e1) => {
            finalObj["component"][item.name][e1.name] = false;
          });
        finalObj["component"][item.name]["gUidField"] = false;
      });
    }
    setData(finalObj);
    setButtonName({ name: "Select All" });
  };
  const isButtonEnabled = () => {
    let { exportName } = fileOptions;
    if (data) {
      let isComp = Object.values(data.component)
        .map((item) => Object.values(item))
        .flat()
        .some((value) => value === true);
      let isTop = Object.values(data.noncomponent)
        .map((item) => Object.values(item))
        .flat()
        .some((value) => value === true);

      return (isTop || isComp) && exportName ? true : false;
    } else return false;
  };

  const handleTabs = (val) => {
    if (val == "recentCsv") TABS[1].action();
    setSelectedTab(val);
  };

  const handleTopLevel = (secTabs) => {
    return (
      <DisplayGrid container>
        {secTabs.length > 0 &&
          secTabs.map((item, idx) => {
            return (
              <DisplayGrid container>
                {item.fields.length > 0 &&
                  item.fields
                    .map((e) => e.displayOnCsv)
                    .some((f) => f === true) && (
                    <DisplayGrid key={idx} item container>
                      <div>
                        <Checkbox
                          key={idx}
                          onChange={(e) =>
                            handleCheckBox(
                              e,
                              { section: item.name, fields: item.fields },
                              "section"
                            )
                          }
                          color="primary"
                          testid={"export-toplevel-" + item.name}
                          checked={
                            data
                              ? data["section"][item.name]
                                ? true
                                : false
                              : false
                          }
                          indeterminate={
                            data
                              ? data["indeterminate"][item.name]
                                ? true
                                : false
                              : false
                          }
                          classes={{
                            root: checkBoxClasses.root,
                            checked: checkBoxClasses.checked,
                            disabled: checkBoxClasses.disabled,
                          }}
                          size="small"
                        />
                        &nbsp;
                        <DisplayText
                          variant="subtitle1"
                          style={{ fontWeight: "500" }}
                        >
                          {item.title}
                        </DisplayText>
                      </div>
                      <DisplayGrid
                        style={{ marginBottom: "1rem" }}
                        item
                        container
                      >
                        {item.fields.length > 0 &&
                          item.fields
                            .filter((item) => item.displayOnCsv === true)
                            .map((item1, idx1) => {
                              return (
                                <DisplayGrid
                                  key={idx1}
                                  item
                                  xs={3}
                                  sm={3}
                                  md={4}
                                  lg={3}
                                  xl={3}
                                >
                                  <Checkbox
                                    key={idx1}
                                    testid={"export-toplevel-" + item1.name}
                                    onChange={(e) =>
                                      handleCheckBox(
                                        e,
                                        {
                                          field: item1.name,
                                          headingName: item.name,
                                        },
                                        "topLevel"
                                      )
                                    }
                                    color="primary"
                                    checked={
                                      data
                                        ? data["noncomponent"][item.name][
                                            item1.name
                                          ]
                                          ? true
                                          : false
                                        : false
                                    }
                                    classes={{
                                      root: checkBoxClasses.root,
                                      checked: checkBoxClasses.checked,
                                      disabled: checkBoxClasses.disabled,
                                    }}
                                    size="small"
                                  />
                                  &nbsp;
                                  <DisplayText style={{ fontSize: "13px" }}>
                                    {item1.title}
                                  </DisplayText>
                                </DisplayGrid>
                              );
                            })}
                      </DisplayGrid>
                    </DisplayGrid>
                  )}
              </DisplayGrid>
            );
          })}
      </DisplayGrid>
    );
  };

  const handleComponentLevel = (isComponent, componentFields) => {
    return (
      <div>
        {isComponent &&
          componentFields.length > 0 &&
          componentFields.map((item, idx) => {
            return (
              <>
                <div style={{ paddingTop: "5px", paddingBottom: "5px" }}>
                  {item.sys_entityAttributes.length > 0 && (
                    <div>
                      <Checkbox
                        key={idx}
                        onChange={(e) =>
                          handleCheckBox(
                            e,
                            {
                              component: item.name,
                              field: item.sys_entityAttributes,
                            },
                            "componentName"
                          )
                        }
                        color="primary"
                        testid={"export-component-" + item.name}
                        checked={
                          data
                            ? data["componentName"][item.name]
                              ? true
                              : false
                            : false
                        }
                        indeterminate={
                          data
                            ? data["indeterminate"][item.name]
                              ? true
                              : false
                            : false
                        }
                        classes={{
                          root: checkBoxClasses.root,
                          checked: checkBoxClasses.checked,
                          disabled: checkBoxClasses.disabled,
                        }}
                        size="small"
                      />
                      &nbsp;
                      <DisplayText
                        style={{ fontFamily: "inherit", fontWeight: 600 }}
                        variant="h2"
                      >
                        {item.componentTitle}
                      </DisplayText>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {item.sys_entityAttributes.map((item1, idx1) => {
                    return (
                      <DisplayGrid
                        item
                        key={idx1}
                        xs={3}
                        sm={3}
                        md={3}
                        lg={3}
                        xl={3}
                      >
                        <Checkbox
                          key={idx1}
                          testid={"export-component-" + item1.name}
                          onChange={(e) =>
                            handleCheckBox(
                              e,
                              {
                                component: item.name,
                                field: item1.name,
                                headingName: item.name,
                              },
                              "component"
                            )
                          }
                          color="primary"
                          checked={
                            data
                              ? data["component"][item.name][item1.name]
                                ? true
                                : false
                              : false
                          }
                          classes={{
                            root: checkBoxClasses.root,
                            checked: checkBoxClasses.checked,
                            disabled: checkBoxClasses.disabled,
                          }}
                          size="small"
                        />
                        &nbsp;
                        <DisplayText variant="h1">{item1.title}</DisplayText>
                      </DisplayGrid>
                    );
                  })}
                </div>
              </>
            );
          })}
      </div>
    );
  };

  const handleExportCsv = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "scroll",
          padding: "0rem 1.5rem",
          flexGrow: 1,
        }}
        className="hide_scroll"
      >
        {(secTabs && secTabs.length > 0) ||
        (isComponent && componentFields.length > 0) ? (
          <div>
            {secTabs && secTabs.length > 0 && (
              <div style={{ paddingTop: "5px" }}>
                <div>
                  {secTabs.length > 0 && isComponent && (
                    <DisplayText
                      style={{ fontFamily: "inherit", fontWeight: 600 }}
                      variant="h6"
                    >
                      {"TOP LEVEL"}
                    </DisplayText>
                  )}
                  <DisplayButton
                    testid={"export-selectall"}
                    style={{
                      float: "right",
                      marginRight: "0.75rem",
                      systemVariant: "secondary",
                    }}
                    onClick={
                      buttonName.name === "Select All"
                        ? handleSelectAll
                        : handleDeSelectAll
                    }
                    variant="outlined"
                  >
                    {buttonName.name}
                  </DisplayButton>
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", width: "100%" }}
                >
                  {handleTopLevel(secTabs)}
                </div>
              </div>
            )}
            {isComponent && (
              <div style={{ paddingTop: "0px" }}>
                <div>
                  {isComponent && (
                    <DisplayText
                      style={{ fontFamily: "inherit", fontWeight: 600 }}
                      variant="h6"
                    >
                      {"COMPONENT LEVEL"}
                    </DisplayText>
                  )}
                </div>
                <div>{handleComponentLevel(isComponent, componentFields)}</div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Banner msg="No Fields To Display"></Banner>
          </div>
        )}
      </div>
    );
  };

  const handleRecentCsv = (exports) => {
    return (
      <DisplayGrid container>
        {exports.length > 0 ? (
          exports.map((item, idx) => {
            return (
              <DisplayGrid item key={idx} xs={12} sm={6} md={4} lg={4} xl={4}>
                <DisplayCard
                  elevation={0}
                  square={false}
                  style={{
                    margin: "0.5rem",
                    backgroundColor: "fafafa",
                    border: "1px solid #c3c3c3",
                  }}
                >
                  <div
                    style={{
                      paddingTop: "1rem",
                      paddingBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      flexGrow: 1,
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        paddingLeft: "1rem",
                      }}
                    >
                      <span>
                        <InsertDriveFileOutlinedIcon fontSize={"large"} />
                      </span>
                      <span
                        style={{
                          paddingTop: "10px",
                          paddingLeft: "10px",
                          width: "100px",
                        }}
                      >
                        {item.name && item.name.length > 15 ? (
                          <ToolTipWrapper
                            title={
                              <DisplayText variant="caption">
                                {item.name}
                              </DisplayText>
                            }
                          >
                            <div
                              style={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                flexWrap: "nowrap",
                                whiteSpace: "noWrap",
                                lineHeight: 1,
                              }}
                            >
                              <DisplayText variant="body2">
                                {item.name}
                              </DisplayText>
                            </div>
                          </ToolTipWrapper>
                        ) : (
                          <div
                            style={{
                              overflow: "hidden",
                              flexWrap: "nowrap",
                              whiteSpace: "noWrap",
                              lineHeight: 1,
                            }}
                          >
                            <DisplayText variant="body2">
                              {item.name ? item.name : "No Name"}
                            </DisplayText>
                          </div>
                        )}
                      </span>
                    </div>
                    {item.url === undefined ? (
                      <div style={{ paddingRight: "15px" }}>
                        {checkIfFailed(item.date) ? (
                          <DisplayText variant="h2" style={{ color: "red" }}>
                            Failed!
                          </DisplayText>
                        ) : (
                          <DisplayText variant="h2">Processing...</DisplayText>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{ paddingRight: "15px", display: "inline-flex" }}
                      >
                        <ToolTipWrapper title="Download">
                          <div>
                            <DisplayIconButton
                              testid={"export-download"}
                              color={"primary"}
                              onClick={(e) => handleClick(idx, item.url)}
                            >
                              <CloudDownloadOutlinedIcon color={"primary"} />
                            </DisplayIconButton>
                          </div>
                        </ToolTipWrapper>
                        &nbsp;
                        <ToolTipWrapper title="Delete">
                          <div>
                            <DisplayIconButton
                              testid={"export-delete"}
                              color={"secondary"}
                              onClick={(e) =>
                                handleDelete(item.name, item._id, idx)
                              }
                            >
                              <Delete color={"secondary"} />
                            </DisplayIconButton>
                          </div>
                        </ToolTipWrapper>
                      </div>
                    )}
                  </div>
                </DisplayCard>
              </DisplayGrid>
            );
          })
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "50vh",
              width: "70vw",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BubbleLoader />
          </div>
        )}
      </DisplayGrid>
    );
  };

  const tabContentRender = (TABS) => {
    switch (TABS) {
      case "exportCsv": {
        return (
          <div
            style={{ height: "72vh", display: "flex", flexDirection: "column" }}
          >
            {handleExportCsv()}
            <div
              style={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                backgroundColor: "#fafafa",
                padding: "1rem 1.5rem",
              }}
            >
              <DisplayText
                style={{ fontFamily: "inherit", fontWeight: 500 }}
                variant="subtitle1"
              >
                Options
              </DisplayText>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DisplayText
                    style={{ fontFamily: "inherit", paddingRight: "0.5rem" }}
                  >
                    Replace empty values with :
                  </DisplayText>
                  <InputWrapper
                    testid={"export-replacewith"}
                    data={inputRef.current.emptyString}
                    type="text"
                    onChange={(value) => {
                      handleChange(value, "emptyString");
                      inputRef.current["emptyString"] = value;
                    }}
                    disabled={
                      secTabs &&
                      secTabs.length &&
                      (isComponent && componentFields.length) === 0
                        ? true
                        : false
                    }
                    placeholder={""}
                    iconButtonSize={"small"}
                    style={{ width: "100px" }}
                    variant="outlined"
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DisplaySelect
                    style={{ width: "100px" }}
                    testid={"export-type"}
                    value={inputRef.current.exportFormat}
                    labelKey="title"
                    valueKey="id"
                    showNone={false}
                    placeHolder={"Select format"}
                    filled={inputRef.current.exportFormat}
                    values={FORMATS}
                    onChange={(value) => {
                      handleChange(value, "exportFormat");
                      inputRef.current["exportFormat"] = value;
                    }}
                    variant="outlined"
                  />{" "}
                  &nbsp;&nbsp;
                  <InputWrapper
                    style={{ width: "300px" }}
                    testid={"test"}
                    data={inputRef.current.exportName}
                    type="text"
                    onChange={(value) => {
                      handleChange(value, "exportName");
                      inputRef.current["exportName"] = value;
                    }}
                    disabled={
                      secTabs &&
                      secTabs.length &&
                      (isComponent && componentFields.length) === 0
                        ? true
                        : false
                    }
                    inputProps={{ testid: "export-name" }}
                    placeholder={"Enter Export Name"}
                    iconButtonSize={"small"}
                    variant="outlined"
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <DisplayButton
                    style={{ backgroundColor: "red" }}
                    variant="contained"
                    testid={"export-cancel"}
                    onClick={handleClose}
                  >
                    Cancel
                  </DisplayButton>

                  <DisplayButton
                    variant="contained"
                    testid={"export"}
                    disabled={!isButtonEnabled() || totalCount === 0}
                    onClick={handleExport}
                  >
                    Export
                  </DisplayButton>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case "recentCsv": {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "72vh",
              overflow: "scroll",
              marginLeft: "10px",
              marginRight: "10px",
            }}
            className="hide_scroll"
          >
            <div style={{ display: "flex", flexWrap: "wrap", padding: "10px" }}>
              {handleRecentCsv(exports)}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <ContainerWrapper>
      <DisplayModal
        open={open}
        maxWidth={"lg"}
        fullWidth={true}
        TransitionComponent={Transition}
      >
        <>
          <div>
            <div className={classes.modal_header}>
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <DisplayText
                  testid={"export-title"}
                  style={{
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                  variant="h5"
                >
                  {" "}
                  Export
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
                      style={{ color: dark.bgColor, fontSize: "1rem" }}
                    />
                    <span style={{ fontSize: "12px", color: "#0277BD" }}>
                      Help
                    </span>
                  </div>
                )}
              </div>
              <DisplayIconButton testid={"export-close"} onClick={handleClose}>
                <HighlightOff color={"secondary"} />
              </DisplayIconButton>
            </div>
            <DisplayText
              variant="caption"
              style={{ padding: "0rem 0rem 0.5rem 1.5rem" }}
            >
              Click on the checkboxes to select data points and click "Export"
              Button
            </DisplayText>
          </div>
          <DisplayDivider />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0rem 1rem",
            }}
          >
            <DisplayTabs
              testid={TABS}
              tabs={TABS}
              titleKey={"label"}
              valueKey={"value"}
              onChange={handleTabs}
              defaultSelect={selectedTab}
              variant={"standard"}
            />
          </div>
          <div style={{ padding: "20px,20px,0px,20px" }}>
            {tabContentRender(selectedTab)}
          </div>
        </>
      </DisplayModal>
      {openHelp && (
        <VideoPlayer
          handleModalClose={() => setHelp(false)}
          screenName={"EXPORT_SCREEN"}
          helperData={helperData}
        />
      )}
      <DisplaySnackbar
        open={!!message}
        message={message}
        onClose={clearMessage}
      />
    </ContainerWrapper>
  );
};
