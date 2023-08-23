import React, { useEffect, useState } from "react";
import { CircularProgress } from "@material-ui/core";
import { useHistory } from "react-router-dom";

//Services
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { rollback } from "utils/services/api_services/import_service";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { get } from "utils/services/helper_services/object_methods";
import { BubbleLoader } from "components/helper_components";
import { ToolTipWrapper } from "components/wrapper_components/tool_tip";
import {
  DisplayButton,
  DisplayCheckbox,
  DisplayDialog,
  DisplayDivider,
  DisplayGrid,
  DisplayIconButton,
  DisplayModal,
  DisplayText,
  DisplayChips,
  DisplayBadge,
  DisplayLink,
} from "components/display_components";
import { SystemIcons } from "utils/icons";

const appname = "NJAdmin";
const modulename = "NJ-SysTools";
const entityname = "Import";

const ADMIN_ENTITIES = [
  "Agency",
  "AgencySharing",
  "BusinessType",
  "CommunityAssessment",
  "Organization",
  "Role",
  "RolePreset",
  "SubAgencyPreset",
  "Title",
  "User",
  "UserGroup",
];

export const ImportSummary = (props) => {
  let { id } = props;
  const history = useHistory();
  let urlPath = window.location.href;
  //factory variables
  const { setSnackBar } = GlobalFactory();
  const { isNJAdmin, isSuperAdmin, getUserInfo } = UserFactory();

  //state variables
  const [data, setData] = useState({});
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [rolledback, setRolledback] = useState(false);
  const [rollbackModal, setRollbackModal] = useState({ flag: false });
  const [componentModal, setComponentModal] = useState(false);
  const [loader, setLoader] = useState(false);

  const componentsCount = get(
    data?.data,
    "sys_entityAttributes.componentsCount"
  );
  const { Refresh, GetApp } = SystemIcons;
  //custom variables
  let appName = get(data?.data, "sys_entityAttributes.appName"),
    moduleName = get(data?.data, "sys_entityAttributes.moduleName"),
    entityName = get(data?.data, "sys_entityAttributes.entityName");

  const rollbackenabled =
    isNJAdmin() ||
    isSuperAdmin ||
    getUserInfo()?.id === get(data?.data, "sys_entityAttributes.userInfo.id");

  const MODAL_BUTTONS = [
    {
      title: "Close",
      handler: () => {
        setComponentModal(false);
      },
      id: "Download-close",
    },
    {
      title: "Select",
      handler: () => {
        setRollbackModal({ flag: true, level: "COMPONENT" });
        setComponentModal(false);
      },
      disableCondition: selectedFiles.length === 0,
      id: "Download-download",
    },
  ];

  //custom functions
  const isAllChecked = () => {
    return files.every((ef) => selectedFiles.includes(ef.name));
  };

  const getData = async () => {
    let data = await entity.get({ appname, modulename, entityname, id });
    let metadata = await entityTemplate.get({
      appname,
      modulename,
      groupname: entityname,
    });
    setData({ data, metadata });
    let files = get(data, "sys_entityAttributes.files") || [];
    setFiles(files.filter((ef) => ef.level !== "TOP" && !ef.rollback));
  };
  const getDisplayText = (name, sys_topLevel, sys_entityAttributes) => {
    let fieldmeta = sys_topLevel.find((ef) => ef.name === name);
    let data = sys_entityAttributes[name];
    return fieldmeta ? textExtractor(data, fieldmeta) : "--";
  };

  const getDisplayTitle = (name, sys_topLevel) => {
    let fieldmeta = sys_topLevel.find((ef) => ef.name === name);
    return fieldmeta ? fieldmeta.title : "";
  };

  const getComponentsCount = (field) => {
    let totalCount = 0;
    let compCount = componentsCount?.map((ec) => {
      totalCount += ec?.[field];
    });
    return totalCount;
  };

  const handleCancelRollback = () => {
    setRollbackModal({ flag: false });
    setSelectedFiles([]);
  };

  const handleCheckboxClick = (e, name) => {
    let arr = [...selectedFiles];
    if (arr.includes(name)) {
      arr = arr.filter((ea) => ea !== name);
    } else arr.push(name);
    setSelectedFiles(arr);
  };

  const handleRollback = async () => {
    let params = {
      appname: appName,
      modulename: moduleName,
      entityname: entityName,
      id: get(data?.data, "sys_gUid"),
      rollbackFiles:
        rollbackModal?.level === "TOP" ? [entityName] : selectedFiles,
    };
    return await rollback
      .remove(params)
      .then((res) => {
        setSnackBar({
          message: "Data successfully rolled back",
          severity: "success",
        });
        if (rollbackModal?.level === "TOP") {
          setRolledback(true);
          // handleClose();
        }
      })
      .catch((err) =>
        setSnackBar({ message: "Error in rollback", severity: "error" })
      )
      .finally(() => setRollbackModal({ flag: false }));
  };

  //useEffect
  useEffect(() => {
    getData();
  }, [id]);

  //render methods
  const renderComponentModal = () => (
    <DisplayModal
      style={{ zIndex: 10000, overflow: "hidden" }}
      open={componentModal}
      maxWidth={"md"}
      fullWidth={true}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          height: "50vh",
          width: "60vw",
          padding: "10px",
          flexDirection: "column",
        }}
      >
        <DisplayGrid
          container
          style={{ display: "flex", flexShrink: 1, alignContent: "flex-start" }}
        >
          <div style={{ flex: 8 }}>
            <DisplayText
              style={{ fontSize: 18, fontWeight: 500, fontFamily: "inherit" }}
            >
              Select components to rollback
            </DisplayText>
          </div>
          <div style={{ flex: 4, display: "flex", justifyContent: "flex-end" }}>
            <DisplayCheckbox
              checked={isAllChecked()}
              key={20}
              label={"Select All"}
              testId={`import-selectall-checkbox`}
              onChange={(e) => {
                if (e) {
                  let arr = files.map((ef) => ef.name);
                  setSelectedFiles(arr);
                } else setSelectedFiles([]);
              }}
            />
          </div>
        </DisplayGrid>
        <br />
        <DisplayGrid
          container
          style={{ display: "flex", flex: 10, alignContent: "flex-start" }}
        >
          <DisplayGrid item xs={12}>
            <DisplayText variant="h5" style={{ fontSize: 16, fontWeight: 500 }}>
              {`${entityName} Components`}
            </DisplayText>
          </DisplayGrid>
          {files.map((ef, i) => (
            <DisplayGrid key={i} item xs={12} sm={6} md={4} lg={3} xl={3}>
              <DisplayCheckbox
                checked={selectedFiles.includes(ef.name)}
                key={i}
                label={ef.name}
                id={ef.name}
                testId={`import-rollback-${ef.name}-checkbox`}
                onChange={(e) => handleCheckboxClick(e, ef.name)}
              />
            </DisplayGrid>
          ))}
        </DisplayGrid>
        <div
          style={{
            position: "absolute",
            padding: "0px 10px 10px 0px",
            right: 0,
            bottom: 0,
          }}
        >
          {MODAL_BUTTONS.map(
            ({ handler, id, title, disableCondition = false }, i) => (
              <DisplayButton
                key={i}
                testid={`import-${id}`}
                onClick={handler}
                disabled={disableCondition}
              >
                {title}
              </DisplayButton>
            )
          )}
        </div>
      </div>
    </DisplayModal>
  );

  if (data.data && data.metadata) {
    let { sys_entityAttributes } = data.data;
    let { sys_topLevel } = data.metadata.sys_entityAttributes;
    let {
      files: allFiles,
      appName,
      moduleName,
      entityName,
      sys_friendlyName = "",
    } = sys_entityAttributes;

    let statusFields =
      sys_topLevel?.length > 0 &&
      sys_topLevel.find((eachField) => eachField.name === "status");
    let { values } = statusFields || {};
    let status =
      getDisplayText("status", sys_topLevel, sys_entityAttributes) ||
      "Un-Successful";
    let statusObject = values.find((eachStatus) => eachStatus.value === status);
    let getColor = () => {
      if (statusObject?.id?.toLowerCase() === "success")
        return { text: "#50C878" };
      else if (statusObject?.id?.toLowerCase() === "in progress")
        return { text: "#CD853F" };
      else return { text: "#CE2029" };
    };

    let handleRefresh = async () => {
      setLoader(true);
      await getData();
      setLoader(false);
    };
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: "0px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            flexDirection: "column",
          }}
        >
          <div
            container
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              width: "100%",
            }}
          >
            <div
              alignItems="center"
              // onClick={handleClose}
              style={{
                display: "flex",
                justifyContent: "end",
                width: "100%",
                padding: "4px 0px",
              }}
            >
              {/* <DisplayButton testId="go-back-button" systemVariant="primary">
                <ArrowBack
                  testId="go-back-button"
                  style={{ color: "primary" }}
                />
                &nbsp;
                <DisplayText
                  style={{
                    fontSize: "16px",
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                >
                  {" "}
                  Recent Imports
                </DisplayText>
              </DisplayButton> */}

              <DisplayButton
                style={{ fontSize: "14px" }}
                size="small"
                variant="contained"
                onClick={(e) => {
                  if (ADMIN_ENTITIES.includes(entityName)) {
                    history.push(
                      `/app/summary/${appName}/${moduleName}/${entityName}`
                    );
                    e.stopPropagation();
                  } else {
                    history.push(
                      `/app/summary/${appName}/${moduleName}/${entityName}`
                    );
                    e.stopPropagation();
                  }
                }}
              >
                {`${sys_friendlyName || entityName} Summary`}
              </DisplayButton>
            </div>
          </div>
          <DisplayDivider />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            height: "100%",
            width: "inherit",
          }}
        >
          <div
            style={{
              flexShrink: 1,
              display: "flex",
              alignItems: "center",
              width: "100%",
              flexDirection: "column",
            }}
          >
            <br />
            <div style={{ display: "flex", width: "100%", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "flex",
                  width: "inherit",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DisplayText style={{ opacity: "0.6" }}>Status :</DisplayText>
                  &nbsp;&nbsp;
                  <DisplayText variant="h6" style={{ color: getColor().text }}>
                    {status}
                  </DisplayText>
                  &nbsp;&nbsp;
                  <DisplayButton
                    variant="contained"
                    onClick={handleRefresh}
                    size="small"
                    startIcon={<Refresh />}
                    disabled={status?.toLowerCase() !== "in progress"}
                    style={{ borderRadius: "8px" }}
                  >
                    Refresh
                  </DisplayButton>
                </div>
                <div>
                  {/* <DisplayText style={{opacity:"0.6"}}>
                  BatchId : 
                </DisplayText>
                <DisplayText variant="subtitle1"> {get(data?.data, "sys_gUid") || ""}</DisplayText>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
                  <DisplayButton
                    size="small"
                    systemVariant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRollbackModal({ flag: true, level: "TOP" });
                    }}
                    disabled={
                      getDisplayText(
                        "totalInsertedDocuments",
                        sys_topLevel,
                        sys_entityAttributes
                      ) == 0 ||
                      rolledback ||
                      !rollbackenabled ||
                      getDisplayText(
                        "status",
                        sys_topLevel,
                        sys_entityAttributes
                      ) === "In Progress" ||
                      getDisplayText(
                        "status",
                        sys_topLevel,
                        sys_entityAttributes
                      ) === "Deleted"
                    }
                    variant={"contained"}
                  >
                    Revert
                  </DisplayButton>
                </div>
              </div>
              <br />
            </div>
            <br />
            <DisplayDivider />
            <br />
            {loader ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "inherit",
                  justifyContent: "center",
                  marginTop: "16vh",
                }}
              >
                <CircularProgress />
                <br />
                <DisplayText style={{ marginLeft: "15px" }}>
                  Loading...
                </DisplayText>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  flexWrap: "wrap",
                  gap: "35px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "300px",
                  }}
                >
                  <DisplayText style={{ opacity: "0.6" }}>
                    {getDisplayTitle("importTitle", sys_topLevel)}
                  </DisplayText>
                  <DisplayText variant="subtitle1">
                    {getDisplayText(
                      "importTitle",
                      sys_topLevel,
                      sys_entityAttributes
                    ) || ` --`}
                  </DisplayText>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "300px",
                  }}
                >
                  <DisplayText style={{ opacity: "0.6" }}>
                    {getDisplayTitle("entityName", sys_topLevel)}
                  </DisplayText>
                  <DisplayText variant="subtitle1">
                    {getDisplayText(
                      "entityName",
                      sys_topLevel,
                      sys_entityAttributes
                    )}
                  </DisplayText>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "300px",
                  }}
                >
                  <DisplayText style={{ opacity: "0.6" }}>
                    {getDisplayTitle("mode", sys_topLevel)}
                  </DisplayText>
                  <DisplayText
                    variant="subtitle1"
                    style={{ textTransform: "capitalize" }}
                  >
                    {getDisplayText("mode", sys_topLevel, sys_entityAttributes)}
                  </DisplayText>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "300px",
                  }}
                >
                  <DisplayText style={{ opacity: "0.6" }}>
                    {getDisplayTitle("uploadedTime", sys_topLevel)}
                  </DisplayText>
                  <DisplayText variant="subtitle1">
                    {getDisplayText(
                      "uploadedTime",
                      sys_topLevel,
                      sys_entityAttributes
                    )}
                  </DisplayText>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "300px",
                  }}
                >
                  <DisplayText style={{ opacity: "0.6" }}>
                    Imported By
                  </DisplayText>
                  <DisplayText variant="subtitle1">
                    {get(data?.data, "sys_entityAttributes.userInfo.firstName")}{" "}
                    {get(data?.data, "sys_entityAttributes.userInfo.lastName")}
                  </DisplayText>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "300px",
                  }}
                >
                  <DisplayText style={{ opacity: "0.6" }}>
                    {getDisplayTitle("files", sys_topLevel)}
                  </DisplayText>
                  {allFiles.map((ef) => (
                    <DisplayText variant="subtitle1">
                      {ef.originalFilename}&nbsp;&nbsp;&nbsp;
                    </DisplayText>
                  ))}
                </div>
                {get(sys_entityAttributes, "totalDocumentsProcessed") && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "300px",
                      }}
                    >
                      <DisplayText style={{ opacity: "0.6" }}>
                        {getDisplayTitle(
                          "totalDocumentsProcessed",
                          sys_topLevel
                        )}
                      </DisplayText>

                      <DisplayText variant="h4" style={{ color: "#2076d2" }}>
                        {getDisplayText(
                          "totalDocumentsProcessed",
                          sys_topLevel,
                          sys_entityAttributes
                        ) || 0}
                      </DisplayText>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "300px",
                      }}
                    >
                      <DisplayText style={{ opacity: "0.6" }}>
                        {getDisplayTitle(
                          "totalInsertedDocuments",
                          sys_topLevel
                        )}
                      </DisplayText>

                      <DisplayText variant="h4" style={{ color: "green" }}>
                        {getDisplayText(
                          "totalInsertedDocuments",
                          sys_topLevel,
                          sys_entityAttributes
                        ) || 0}
                      </DisplayText>
                      {getDisplayText(
                        "successfileLoc",
                        sys_topLevel,
                        sys_entityAttributes
                      ) && (
                        <DisplayButton
                          variant="outlined"
                          size="small"
                          href={sys_entityAttributes["successfileLoc"]}
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                          style={{
                            borderColor: "green",
                            color: "green",
                            width: "180px",
                            padding: "2px",
                          }}
                          startIcon={<GetApp size="small" />}
                          download
                        >
                          Success File
                        </DisplayButton>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "300px",
                      }}
                    >
                      <DisplayText style={{ opacity: "0.6" }}>
                        {getDisplayTitle("totalFailedDocuments", sys_topLevel)}
                      </DisplayText>
                      <DisplayText variant="h4" style={{ color: "red" }}>
                        {getDisplayText(
                          "totalFailedDocuments",
                          sys_topLevel,
                          sys_entityAttributes
                        ) || 0}
                      </DisplayText>
                      {getDisplayText(
                        "fileLoc",
                        sys_topLevel,
                        sys_entityAttributes
                      ) && (
                        <>
                          <DisplayButton
                            variant="outlined"
                            size="small"
                            href={getDisplayText(
                              "fileLoc",
                              sys_topLevel,
                              sys_entityAttributes
                            )}
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            style={{
                              borderColor: "red",
                              color: "red",
                              width: "180px",
                              padding: "2px",
                            }}
                            startIcon={<GetApp size="small" />}
                            download
                          >
                            Error File
                          </DisplayButton>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            <DisplayDialog
              open={rollbackModal.flag}
              title={"Are you sure you want to revert"}
              message={"This action cannot be undone"}
              confirmLabel={"Revert"}
              onConfirm={() => handleRollback()}
              onCancel={() => handleCancelRollback()}
              cancelLabel={"Close"}
              onClose={() => handleCancelRollback()}
              style={{ zIndex: 10010 }}
            />
          </div>
          <div
            style={{
              width: "100%",
              height: "20vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <br />
            <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              ></div>
            </div>
            {/* {componentsCount && (
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  <DisplayGrid container>
                    <DisplayGrid
                      item
                      xs={12}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <DisplayText
                        variant="h1"
                        style={{ padding: "2px", fontSize: "1rem" }}
                      >
                        Total components processed
                      </DisplayText>
                      <ToolTipWrapper
                        systemVariant="info"
                        placement="top-start"
                        title={
                          <div
                            style={{
                              display: "flex",
                              minWidth: "100px",
                              flexDirection: "column",
                            }}
                          >
                            {componentsCount?.map((ec) => (
                              <div style={{ display: "flex", flex: 1 }}>
                                <div style={{ display: "flex", flex: 1 }}>
                                  <DisplayText variant="caption">
                                    {ec?.["name"]}
                                  </DisplayText>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flex: 1,
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <DisplayText variant="caption">
                                    {ec?.["totalComponentsProcessed"]}
                                  </DisplayText>
                                </div>
                              </div>
                            ))}
                          </div>
                        }
                      >
                        <Info fontSize="small" />
                      </ToolTipWrapper>
                    </DisplayGrid>
                    <DisplayGrid item xs={12}>
                      <DisplayText
                        variant="h2"
                        style={{ padding: "2px", fontSize: "1.1rem" }}
                      >
                        {getComponentsCount("totalComponentsProcessed")}
                      </DisplayText>
                    </DisplayGrid>
                  </DisplayGrid>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  <DisplayGrid container>
                    <DisplayGrid
                      item
                      xs={12}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <DisplayText
                        variant="h1"
                        style={{ padding: "2px", fontSize: "1rem" }}
                      >
                        Total components inserted
                      </DisplayText>
                      <ToolTipWrapper
                        systemVariant="info"
                        placement="top-start"
                        title={
                          <div
                            style={{
                              display: "flex",
                              minWidth: "100px",
                              flexDirection: "column",
                            }}
                          >
                            {componentsCount?.map((ec) => (
                              <div style={{ display: "flex", flex: 1 }}>
                                <div style={{ display: "flex", flex: 1 }}>
                                  <DisplayText variant="caption">
                                    {ec?.["name"]}
                                  </DisplayText>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flex: 1,
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <DisplayText variant="caption">
                                    {ec?.["totalInsertedComponents"]}
                                  </DisplayText>
                                </div>
                              </div>
                            ))}
                          </div>
                        }
                      >
                        <Info fontSize="small" />
                      </ToolTipWrapper>
                    </DisplayGrid>
                    <DisplayGrid item xs={12}>
                      <DisplayText
                        variant="h2"
                        style={{ padding: "2px", fontSize: "1.1rem" }}
                      >
                        {getComponentsCount("totalInsertedComponents")}
                      </DisplayText>
                    </DisplayGrid>
                  </DisplayGrid>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  <DisplayButton
                    style={{ fontSize: "15px" }}
                    size="large"
                    systemVariant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setComponentModal(true);
                    }}
                    disabled={
                      getComponentsCount("totalInsertedComponents") == 0 ||
                      (!rollbackenabled &&
                        (getDisplayText(
                          "status",
                          sys_topLevel,
                          sys_entityAttributes
                        ) === "In Progress" ||
                          getDisplayText(
                            "status",
                            sys_topLevel,
                            sys_entityAttributes
                          ) === "Deleted"))
                    }
                    variant={"contained"}
                  >
                    Revert
                  </DisplayButton>
                </div>
              </div>
            )} */}
            <div style={{ display: "flex", flexDirection: "row" }}>
              {/* <div style={{display: "flex", flexDirection:"column", width: "300px"}}>
                  <DisplayText style={{opacity: "0.6"}}>{getDisplayTitle("componentsFailed", sys_topLevel)}</DisplayText>
                  <DisplayText variant="subtitle2">
                        {getDisplayText(
                          "componentsFailed",
                          sys_topLevel,
                          sys_entityAttributes
                        ) || 0}
                  </DisplayText>
                </div> */}
              <div style={{ width: "300px" }}></div>
            </div>
            <div
              style={{
                flexShrink: 1,
                display: "flex",
                alignItems: "flex-start",
                width: "100%",
                flexDirection: "column",
              }}
            ></div>
            <br />
            {componentModal && renderComponentModal()}
          </div>
        </div>
        {urlPath?.split("/")?.includes("recents") && (
          <div
            style={{
              display: "flex",
              alignSelf: "end",
              width: "100%",
              justifyContent: "end",
              margin: "12px 0px",
            }}
          >
            <DisplayButton
              variant="outlined"
              onClick={() => {
                history.push("/app/import/recents");
              }}
              style={{
                color: "red",
                borderColor: "red",
                borderRadius: "8px",
                height: "32px",
              }}
            >
              Close
            </DisplayButton>
            &nbsp;&nbsp;&nbsp;
            <DisplayButton
              variant="contained"
              style={{ height: "32px", borderRadius: "8px" }}
              onClick={() => {
                history.push("/app/import");
              }}
            >
              Go to Imports
            </DisplayButton>
          </div>
        )}
      </div>
    );
  } else return <BubbleLoader />;
};
