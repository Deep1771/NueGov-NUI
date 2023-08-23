// material-ui packages
import React, { useEffect, useMemo, useState, startTransition } from "react";
import {
  InputAdornment,
  List,
  ListItem,
  ListSubheader,
  makeStyles,
  Stepper,
  Step,
  StepLabel,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

//third-party packages
import { useHistory } from "react-router-dom";
import XLSX from "xlsx";

//nuegov services
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import {
  CSV,
  downloadTemplate,
} from "utils/services/api_services/import_service";
import {
  GlobalFactory,
  ThemeFactory,
  UserFactory,
} from "utils/services/factory_services";
import { isDefined } from "utils/services/helper_services/object_methods";
import { SystemIcons } from "utils/icons";

//global state
import { useStateValue } from "utils/store/contexts";

//display components
import {
  DisplayBackdrop,
  DisplayButton,
  DisplayCard,
  DisplayCheckbox,
  DisplayDialog,
  DisplayDivider,
  DisplayIcon,
  DisplayIconButton,
  DisplayInput,
  DisplayModal,
  DisplayRadioGroup,
  DisplayRadiobox,
  DisplaySelect,
  DisplayText,
} from "components/display_components";

//export feature
import { Export_Csv } from "containers/feature_containers";

//helper components
import {
  AttachCustomField,
  EntitySelector,
  Faqs,
  VideoPlayer,
} from "components/helper_components";

//global props
import { globalProps } from "../../../../../components/system_components/global-props";

//imports components
import { ImportSummary } from "../../components/recent_import/summary";
import { ToolTipWrapper } from "components/wrapper_components";

import { CSVFile, Shape } from "../index";
import { ImportsTable } from "./table";
import { localProps, modes, tableHeaders, agencyParams, steps } from "./helper";
import { Recents } from "../recent_import";

//material-ui styles
const listStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    position: "relative",
    overflow: "auto",
    borderRadius: "8px",
    padding: "0px",
    height: "58vh",
  },
  listSection: {},
  ul: {
    backgroundColor: "inherit",
    padding: 0,
    border: "1px solid lightgray",
  },
}));

const stepperStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const useQontoStepIconStyles = makeStyles(() => ({
  root: {
    "& .MuiStepIcon-active": { color: "white" },
    "& .MuiStepIcon-completed": { color: "white" },
    "& .Mui-disabled .MuiStepIcon-root": { color: "lightgrey" },
    "& .MuiStepIcon-text": { fill: "black" },
    "& .MuiStepLabel-label.MuiStepLabel-alternativeLabel": {
      color: "white",
    },
    "& .MuiStepLabel-label": {
      margin: "0px",
    },
  },
}));

const useStyles = makeStyles({
  modal_header: () => ({
    display: "flex",
    flexDirection: "column",
    padding: "8px 12px",
    flex: 1,
    background: "white",
  }),
  dropdowns: () => ({
    display: "flex",
    flexShrink: 2.5,
    alignItems: "center",
  }),
  section: () => ({
    display: "flex",
    flex: 8.5,
    flexDirection: "column",
    contain: "strict",
  }),
});

export const Import = () => {
  const [{ importState, configState }, dispatch] = useStateValue();
  const { systemTypes } = configState;
  const {
    appName,
    entityName,
    friendlyName,
    fileType,
    importMode,
    importName,
    moduleName,
    selectedEntityTemplate,
    selectedFiles,
    templateObj,
    unique_key,
  } = importState;

  //factory methods
  const { getVariantForComponent, getVariantObj } = ThemeFactory();
  const { getContextualHelperData, setSnackBar } = GlobalFactory();
  const {
    getAllEntities,
    getAgencyName,
    getAgencyId,
    getAgencyDetails,
    isNJAdmin,
    getSubAgencies,
    isSuperAdmin,
  } = UserFactory();

  //styles classes
  const listClasses = listStyles();
  const classes = useStyles(getVariantForComponent("", "primary"));
  const stepperClass = stepperStyle();
  const stepperIconClass = useQontoStepIconStyles();

  //local states
  const [activeStep, setActiveStep] = useState(0);
  const [customFieldFlag, setCustomFieldFlag] = useState(false);
  const [modal, openModal] = useState(false);
  const [openHelp, setHelp] = useState(false);
  const [entityData, setEntityData] = useState(false);
  const [excelValues, setExcelValues] = useState([]);
  const [isDisabled, setDisabled] = useState(false);
  const [referenceFields, setReferenceFields] = useState([]);
  const [matchByUniqueKey, setMatchByUniqueKey] = useState("");
  const [uniqueFields, setUniqueFields] = useState([]);
  const [usernameMatch, setUsernameMatch] = useState("");
  const [enableUsername, setEnableUsername] = useState({
    source: "",
    enable: false,
  });
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [mappingField, setMappingField] = useState([]);
  const [options, setOptions] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]);
  const [importModal, setImportModal] = useState({ flag: false });
  const [openBackdrop, setOpenBackDrop] = useState({
    open: false,
    message: "",
  });
  const [sourceFieldMap, setSourceFieldMap] = useState("");
  const [selectedAgency, setAgency] = useState({});
  const [openExportModal, setOpenExportModal] = useState(false);

  //sytem_icons
  const {
    Close,
    CloudDownload,
    Help,
    HelpOutline,
    HighlightOffTwoTone,
    CheckCircle,
    CancelSharp,
  } = SystemIcons;

  //local variables
  const history = useHistory();
  const { dark } = getVariantObj("primary");
  const FILTER_ARRAY = [
    { path: "access.write" },
    { path: "featureAccess.ImportCSV" },
  ];
  const helperData = getContextualHelperData("IMPORT_SCREEN");
  const { parent, sibling, child } = getSubAgencies || {};
  const {
    sys_entityAttributes: { showHelper = false },
    _id,
  } = getAgencyDetails || {
    sys_entityAttributes: {
      showHelper: false,
    },
  };

  //clear states
  let clearStates = () => {
    dispatch({
      type: "CLEAR_IMPORT_STATE",
    });
    setUniqueFields([]);
    setMatchByUniqueKey("");
  };

  //extracting entities from permission tree(njAdmin)
  let getAppStructure = () => {
    let nuegovEntities =
      selectedAgency?.sys_entityAttributes?.agencyPermission?.apps.find(
        (eachApp) => eachApp?.name?.toUpperCase() === "NUEGOV"
      );
    return [nuegovEntities];
  };
  const TEMPLATES = useMemo(
    () => getAllEntities(FILTER_ARRAY || [], isNJAdmin(), getAppStructure()),
    [unique_key]
  );
  let selectedEntity =
    TEMPLATES.length && TEMPLATES?.find((et) => et.unique_key === unique_key);
  let PARAMS = {
    appname: appName,
    modulename: moduleName,
    entityname: selectedEntity?.groupName,
  };

  const handleBack = () =>
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  const closeModal = () => openModal(false);

  //subagencies
  let allAgencies = [];
  let dependentAgencies = [];
  let subAgencies = [
    ...(parent ? parent : []),
    ...(sibling ? sibling : []),
    ...(child ? child : []),
  ];

  subAgencies = subAgencies
    .map((ea) => {
      return {
        agency: ea.sys_entityAttributes.Name,
        id: ea._id,
      };
    })
    .sort((a, b) => (a.agency > b.agency ? 1 : b.agency > a.agency ? -1 : 0));

  if (!isNJAdmin()) {
    let agencyInfo = {
      agency: getAgencyName(),
      id: getAgencyId,
    };
    dependentAgencies = [agencyInfo, ...subAgencies];
    allAgencies = [...dependentAgencies];
  }

  //excluding the fields mentioned in system-types
  let targetFields = [];
  let excludedSystemTypes = systemTypes?.find(
    (eachExcluded) =>
      eachExcluded?.sys_entityAttributes?.feature?.toUpperCase() === "IMPORTS"
  );
  let { directiveTypes: importFeatureSystemTypes, fields: fieldsExcluding } =
    excludedSystemTypes?.sys_entityAttributes || [];

  //constructing targetfields based on the top-level field types
  let {
    sys_topLevel: templateFields = [],
    sys_helperText = "",
    entityLevelImportsAlert = false,
  } = templateObj?.sys_entityAttributes || {};
  let topLevelMeta =
    templateFields.length > 0 &&
    templateFields.map((eachField) => {
      let isTypeExcluded = importFeatureSystemTypes.some(
        (eachExculdedField) => eachExculdedField.name === eachField.type
      );
      let isFieldExcluded =
        fieldsExcluding?.length > 0 &&
        fieldsExcluding?.some(
          (eachExcludingField) =>
            eachExcludingField.fieldName === eachField.name
        );
      if (!isTypeExcluded && !isFieldExcluded && !eachField?.hideOnDetail) {
        if (
          eachField.type === "PAIREDLIST" ||
          eachField.type === "DATAPAIREDLIST"
        ) {
          targetFields.push(
            {
              label: `${eachField.labels.title}`,
              value: `${eachField.name}.${eachField.labels.name}`,
              type: eachField.type,
              required: eachField.required,
              formatList: eachField?.formatList,
              parentFieldName: eachField.name,
              displayField: `${eachField.labels.name}`,
              importsAlert: eachField?.importsAlert,
            },
            {
              label: `${eachField.labels.child.title}`,
              value: `${eachField.name}.${eachField.labels.child.name}`,
              type: eachField.type,
              required: eachField.required,
              formatList: eachField?.formatList,
              parentFieldName: eachField.name,
              displayField: `${eachField.labels.child.name}`,
              importsAlert: eachField?.importsAlert,
            },
            {
              label: `${eachField.labels.title} - ${eachField.labels.child.title}`,
              value: `${eachField.name}`,
              type: eachField.type,
              required: eachField.required,
              formatList: eachField?.formatList,
              parentFieldName: eachField.name,
              displayField: `${eachField.labels.name},${eachField.labels.child.name}`,
              importsAlert: eachField?.importsAlert,
            }
          );
        } else {
          targetFields.push({
            label: eachField?.customField
              ? `${eachField.title} (Custom)`
              : eachField.type === "REFERENCE"
              ? `${eachField.title} (Lookup)`
              : `${eachField.title}`,
            value: eachField.name,
            type: eachField.type,
            required: eachField.required,
            formatList: eachField?.formatList,
            parentFieldName: eachField.name,
            importsAlert: eachField?.importsAlert,
            displayField: eachField.name,
            entityName: eachField?.entityName || "",
          });
        }
      }
    });

  //Set Agency
  const handleSelectChange = (value) => {
    setAgency((prevValue) => {
      return {
        ...prevValue,
        ...value,
      };
    });
    setOptions([]);
  };

  //Agency predicion functions(only nj-admin)
  let handlePredictions = async (event) => {
    let val = event?.target?.value || "";
    startTransition(async () => {
      let predictedData = await entity.get({
        ...agencyParams,
        globalsearch: val,
        skip: 0,
        limit: 100,
      });
      setOptions(predictedData);
    });
  };

  let handleTemplateDownload = async () => {
    let payload = {
      importFormat: fileType,
      entityName,
      appName,
      moduleName,
      groupName: selectedEntity?.groupName,
      templateName: entityName,
      TOP: true,
      sys_agencyIds: isNJAdmin() ? selectedAgency?._id : [_id],
    };
    await downloadTemplate
      .getTemplate({ ...PARAMS, payload: payload })
      .then((response) => {
        const downloadUrl = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute(
          "download",
          `${selectedEntity?.friendlyName}_${new Date().toDateString()}.zip`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        setSnackBar({
          message: "Your template is downloaded",
          severity: "success",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  let getEntitySelector = async (value) => {
    let { appName, moduleName, groupName, name, unique_key, friendlyName } =
      value || {};
    setMatchByUniqueKey("");
    setUniqueFields([]);
    setMappingField([]);
    setSourceFieldMap("");
    dispatch({
      type: "SET_IMPORT_ENTITY",
      payload: {
        appName,
        moduleName,
        unique_key,
        entityName: groupName,
        selectedEntityTemplate: name,
        friendlyName,
      },
    });
  };

  let closeExportModal = () => {
    setOpenExportModal(false);
  };

  let renderUploadStage = () => {
    let fileName =
      selectedFiles?.find(
        (ef) => ef.componentName === selectedEntity?.groupName
      )?.file?.name || "";

    return (
      <>
        <div
          style={{ display: "flex", flexDirection: "column", width: "45vw" }}
        >
          <DisplayText variant="subtitle2">Select Import Mode</DisplayText>
          <DisplayRadioGroup
            style={{
              width: "100%",
              columnGap: "3vw",
              padding: "0px 12px",
              border: "1px dashed #c3c3c3",
              borderRadius: "8px",
            }}
            row
            value={importMode}
            onChange={(val) => {
              dispatch({
                type: "CLEAR_IMPORT_STATE",
              });
              setMappingField([]);
              setMatchByUniqueKey("");
              setSourceFieldMap("");
              dispatch({
                type: "SET_IMPORT_MODE",
                payload: val.target.value,
              });
            }}
          >
            {modes?.map((eachMode) => {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "45%",
                    columnGap: "2%",
                  }}
                >
                  <DisplayRadiobox
                    label={eachMode.label}
                    value={eachMode.value}
                    disabled={false}
                  />
                  <DisplayText
                    style={{
                      fontSize: "12px",
                      opacity: "0.8",
                      padding: "0px 0px 4px 0px",
                    }}
                  >
                    {eachMode.description}
                  </DisplayText>
                  {/* <DisplayText variant="subtitle2">HelperText</DisplayText> */}
                </div>
              );
            })}
          </DisplayRadioGroup>
        </div>
        <br />
        {isNJAdmin() && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <DisplayText className={classes.text}>Select Agency</DisplayText>
            <Autocomplete
              options={options}
              disabled={false}
              // value={agency?.sys_entityAttributes?.Name}
              loading={!options.length ? true : false}
              getOptionLabel={(option) => {
                return option?.sys_entityAttributes?.Name || "";
              }}
              loadingText="Loading..."
              onChange={(e, value) => handleSelectChange(value)}
              onInputChange={(event) => handlePredictions(event)}
              getOptionSelected={(option, val) => {
                return option?._id === selectedAgency?._id;
              }}
              onlyValue={true}
              renderInput={(params) => (
                <TextField
                  {...globalProps}
                  {...params}
                  size="small"
                  style={{ width: "45vw" }}
                  hiddenLabel={true}
                  onClick={handlePredictions}
                  InputProps={{
                    ...params.InputProps,
                    ...globalProps.InputProps,
                    style: {
                      ...globalProps.InputProps.style,
                      padding: "0px 10px",
                      fontSize: "14px",
                      fontFamily: "Roboto",
                    },
                  }}
                  fullWidth
                  helperText={
                    <DisplayText style={{ fontSize: "12px" }}>
                      Select Agency to which you want to import from dropdown.
                    </DisplayText>
                  }
                />
              )}
            />
            <br />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DisplayText className={classes.text}>Target Entity</DisplayText>
          <EntitySelector
            filterArray={FILTER_ARRAY}
            onChange={(value) => getEntitySelector(value)}
            disabled={
              (isNJAdmin() ? !selectedAgency?._id : false) || !importMode
            }
            agencyAppStructure={getAppStructure()}
            fromImports={isNJAdmin()}
            value={{ unique_key: unique_key || "", friendlyName }}
            style={{ width: "45vw" }}
            helperText={
              <div style={{ display: "flex", flexDirection: "column" }}>
                <DisplayText style={{ fontSize: "12px" }}>
                  Select Entity to which you want to import from dropdown
                </DisplayText>
                {sys_helperText ? (
                  <DisplayText style={{ fontSize: "12px", color: "red" }}>
                    Note<b> : </b>
                    {sys_helperText}
                  </DisplayText>
                ) : (
                  <></>
                )}
              </div>
            }
            InputProps={{
              ...globalProps.InputProps,
              style: {
                ...globalProps.InputProps.style,
                padding: "0px 10px",
              },
            }}
            {...globalProps}
          />
        </div>
        <br />
        <div
          style={{ display: "flex", flexDirection: "column", width: "45vw" }}
        >
          <span>
            <DisplayText className={classes.text}>File Type</DisplayText>
          </span>
          <span style={{ display: "flex", flexDirection: "row" }}>
            <DisplaySelect
              hiddenLabel
              labelKey="label"
              testId={"import-select-filetype"}
              filled={fileType}
              variant={"filled"}
              valueKey="value"
              values={
                isMapEntity()
                  ? FILE_TYPES
                  : FILE_TYPES.filter((et) => et.value !== ".zip")
              }
              onChange={(value) => {
                dispatch({
                  type: "SET_FILE_TYPE",
                  payload: value,
                });
              }}
              showNone={false}
              value={fileType || ""}
              disabled={!unique_key}
              helperText={
                <DisplayText style={{ fontSize: "12px" }}>
                  Select type of file you want to import from dropdown.
                </DisplayText>
              }
              {...globalProps}
              {...localProps}
              InputProps={{
                endAdornment: (
                  <>
                    {fileType && (
                      <InputAdornment
                        position="end"
                        style={{
                          position: "absolute",
                          cursor: "pointer",
                          right: "36px",
                        }}
                      >
                        <Close
                          onClick={() => {
                            dispatch({
                              type: "SET_FILE_TYPE",
                              payload: "",
                            });
                          }}
                          fontSize="small"
                        />
                      </InputAdornment>
                    )}
                  </>
                ),
                ...globalProps.InputProps,
                style: {
                  ...globalProps.InputProps.style,
                  padding: "0px 10px",
                },
              }}
              {...globalProps}
            />
            <DisplayButton
              onClick={handleTemplateDownload}
              disabled={!entityName || !fileType}
              style={{
                width: "220px",
                height: "min-content",
              }}
              variant="contained"
            >
              Download Template
            </DisplayButton>
          </span>
        </div>
        <br />
        <div
          style={{ display: "flex", flexDirection: "column", width: "45vw" }}
        >
          <span>
            <DisplayText className={classes.text}> Select File</DisplayText>
          </span>
          <span style={{ display: "flex", flexDirection: "row" }}>
            <DisplayInput
              disabled={true}
              testId={"import-toplevel-select"}
              value={fileName}
              variant={"outlined"}
              size="small"
              placeholder="Select File"
              helperText={
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <DisplayText style={{ fontSize: "12px" }}>
                    Select file you want to import.
                  </DisplayText>
                  {isDisabled ? (
                    <DisplayText style={{ fontSize: "12px", color: "red" }}>
                      {`The specified file contains no data to Import, please fill the data.`}
                    </DisplayText>
                  ) : (
                    <></>
                  )}
                </div>
              }
              {...globalProps}
            />
            <DisplayButton
              variant="contained"
              component="label"
              disabled={!fileType}
              testId={"import-toplevel-fileselect-button"}
              style={{ height: "36px" }}
            >
              Select File
              <input
                type="file"
                onClick={(event) => (event.target.value = null)}
                accept={fileType}
                onChange={fileSelectionHandler}
                name={selectedEntity?.groupName}
                hidden
              />
            </DisplayButton>
          </span>
        </div>
        <br />
        <div
          style={{ display: "flex", flexDirection: "column", width: "45vw" }}
        >
          <DisplayText className={classes.text}>Title</DisplayText>
          <DisplayInput
            testId={"import-title"}
            disabled={!selectedFiles?.length}
            value={importName}
            onChange={(val) =>
              dispatch({
                type: "SET_IMPORT_NAME",
                payload: val,
              })
            }
            onClear={() => {
              dispatch({
                type: "SET_IMPORT_NAME",
                payload: "",
              });
            }}
            variant={"outlined"}
            size="small"
            placeholder="Import Title"
            helperText={
              <DisplayText style={{ fontSize: "12px" }}>
                Title will be auto selected.
              </DisplayText>
            }
            {...globalProps}
          />
        </div>
        <br />
        {importMode === "update" && (
          <div
            style={{ display: "flex", flexDirection: "column", width: "45vw" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ width: "48%" }}>
                <span>
                  <DisplayText className={classes.text}>
                    Match By Using
                  </DisplayText>
                </span>
                <span style={{ display: "flex", flexDirection: "row" }}>
                  <DisplaySelect
                    hiddenLabel
                    labelKey="label"
                    testId={"import-select-matchBy"}
                    filled={""}
                    variant={"filled"}
                    valueKey="value"
                    values={[
                      ...uniqueFields,
                      { label: "GUID", value: "sys_gUid" },
                    ]}
                    onChange={(value) => {
                      setMatchByUniqueKey(value);
                    }}
                    showNone={false}
                    value={matchByUniqueKey || ""}
                    disabled={!unique_key || !selectedFiles?.length}
                    helperText={
                      <DisplayText style={{ fontSize: "12px" }}>
                        select unique key / field to match data
                      </DisplayText>
                    }
                    {...localProps}
                    {...globalProps}
                    InputProps={{
                      endAdornment: (
                        <>
                          {matchByUniqueKey && (
                            <InputAdornment
                              position="end"
                              style={{
                                position: "absolute",
                                cursor: "pointer",
                                right: "36px",
                              }}
                            >
                              <Close
                                onClick={() => {
                                  setMatchByUniqueKey("");
                                  setMappingField([]);
                                  setSourceFieldMap("");
                                }}
                                fontSize="small"
                              />
                            </InputAdornment>
                          )}
                        </>
                      ),
                      ...globalProps.InputProps,
                      style: {
                        ...globalProps.InputProps.style,
                        padding: "0px 10px",
                      },
                    }}
                  />
                </span>
              </span>
              <span style={{ width: "48%" }}>
                <span>
                  <DisplayText className={classes.text}>
                    Select source field to match
                  </DisplayText>
                </span>
                <span style={{ display: "flex", flexDirection: "row" }}>
                  <DisplaySelect
                    hiddenLabel
                    enableSearch={true}
                    labelKey="label"
                    testId={"import-select-sourceMatchBy"}
                    filled={""}
                    variant={"filled"}
                    valueKey="value"
                    values={[...csvHeaders]}
                    onChange={(value) => {
                      setMappingField([
                        {
                          hideOnMapper: true,
                          source: { fieldName: value },
                          target: {
                            fieldName: matchByUniqueKey,
                            matchBy: matchByUniqueKey,
                            parentName: matchByUniqueKey,
                          },
                        },
                      ]);
                      setSourceFieldMap(value);
                    }}
                    showNone={false}
                    value={sourceFieldMap || ""}
                    disabled={!unique_key || !matchByUniqueKey}
                    helperText={
                      <DisplayText style={{ fontSize: "12px" }}>
                        select unique field from your source file (.excel,.csv)
                        to match data. (i.e. : employee id, email, phone number,
                        username etc.)
                      </DisplayText>
                    }
                    {...localProps}
                    {...globalProps}
                    InputProps={{
                      endAdornment: (
                        <>
                          {sourceFieldMap && (
                            <InputAdornment
                              position="end"
                              style={{
                                position: "absolute",
                                cursor: "pointer",
                                right: "36px",
                              }}
                            >
                              <Close
                                onClick={() => setSourceFieldMap("")}
                                fontSize="small"
                              />
                            </InputAdornment>
                          )}
                        </>
                      ),
                      ...globalProps.InputProps,
                      style: {
                        ...globalProps.InputProps.style,
                        padding: "0px 10px",
                      },
                    }}
                  />
                </span>
              </span>
            </div>
            <br />
            <span>
              <DisplayButton
                disabled={!unique_key}
                startIcon={<CloudDownload />}
                variant="contained"
                onClick={() => {
                  setOpenExportModal(true);
                }}
                style={{
                  width: "100%",
                  height: "min-content",
                }}
              >
                {`Export ${
                  selectedEntity?.friendlyName
                    ? selectedEntity?.friendlyName
                    : ""
                } Data`}
              </DisplayButton>
            </span>
            <DisplayText
              style={{ fontSize: "12px", opacity: "0.4", paddingLeft: "14px" }}
            >
              Retrieve Entity data to be updated along with matching update
              fields.
            </DisplayText>
            <DisplayText
              style={{
                fontSize: "12px",
                opacity: "0.7",
                padding: "4px 14px 0px 14px",
                color: "red",
              }}
            >
              <b>Note : </b>
              If you are unable to identify unique fields to update, export data
              and use the GUID field to identify matches. GUID is the Global
              unique identifier generated by NueGov.
            </DisplayText>
            {openExportModal && unique_key && (
              <Export_Csv
                entityTemplate={templateObj}
                open={openExportModal}
                onClose={closeExportModal}
                totalCount={20}
                appObject={{ ...PARAMS }}
                // filters={restParams}
              />
            )}
          </div>
        )}
      </>
    );
  };

  let renderMapStage = () => {
    let tableProps = {
      helperData,
      mappingField,
      setMappingField,
      sourceFields: csvHeaders,
      tableHeaders,
      targetFields,
      entityData,
      excelValues,
      entityLevelImportsAlert,
      referenceFields,
      templateObj,
      usernameMatch,
      setUsernameMatch,
      importMode,
      selectedEntity,
      setEnableUsername,
      enableUsername,
    };
    return (
      <>
        <ImportsTable {...tableProps} />
        <br />
      </>
    );
  };

  let renderStatusStage = () => {
    return <> {importModal?.id && <ImportSummary id={importModal.id} />} </>;
  };

  let getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return renderUploadStage();
      case 1:
        return renderMapStage();
      case 2:
        return renderStatusStage();
      default:
        return "Unknown stepIndex";
    }
  };
  const FILE_TYPES = [
    {
      label: "CSV (.csv)",
      value: ".csv",
    },
    {
      label: "Spreadsheet(.xlsx)",
      value: ".xlsx",
    },
    // {
    //   label: "Shape files(.shp)",
    //   value: ".zip",
    //   render: (
    //     <Shape
    //       selectedEntity={TEMPLATES.find((et) => et.unique_key === unique_key)}
    //       template={templateObj}
    //       fileType={fileType}
    //     />
    //   ),
    // },
  ];

  //custom methods
  const isMapEntity = () => {
    let { sys_summaryGeoMap = false } = templateObj?.sys_entityAttributes || {};
    return sys_summaryGeoMap;
  };

  //render methods
  const renderHeader = () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className={classes.modal_header}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignItems: "baseline",
              flexDirection: "column",
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <DisplayText
                style={{
                  fontFamily: "inherit",
                  fontSize: 20,
                  fontWeight: 500,
                  alignSelf: "center",
                }}
              >
                Import Data
              </DisplayText>
              &nbsp;&nbsp;&nbsp;
              {(isNJAdmin() ||
                (helperData && checkForVideoLinks() && showHelper)) && (
                <ToolTipWrapper title="Help" placement="bottom-start">
                  <div
                    style={{
                      display: "flex",
                      height: "24px",
                      width: "fit-content",
                      border: "1px solid #81D4FA",
                      borderRadius: "50px",
                      gap: "4px",
                      padding: "0px 4px",
                      alignItems: "center",
                      backgroundColor: "#E1F5FE",
                      cursor: "pointer",
                    }}
                    onClick={() => setHelp(true)}
                  >
                    <HelpOutline
                      style={{ color: dark.bgColor, fontSize: "1rem" }}
                    />
                    <span style={{ fontSize: "12px", color: "#0277BD" }}>
                      Help
                    </span>
                  </div>
                </ToolTipWrapper>
              )}
            </span>
            <DisplayText style={{ fontSize: "12px", opacity: "0.6" }}>
              Bulk Data Import
            </DisplayText>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "start",
            }}
          >
            <DisplayButton
              size="medium"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                history.push("/app/import/recents");
              }}
              testId={"import-view-history"}
            >
              View Import History
            </DisplayButton>
            {/* <DisplayButton  
            testId={"import-clear"}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({
                type: "CLEAR_IMPORT_STATE",
              });
            }}
            disabled={!unique_key}
          >
            Clear
          </DisplayButton> */}
          </div>
        </div>
      </div>
      <DisplayDivider
        style={{ background: "lightgray", marginBottom: "12px" }}
      />
    </div>
  );

  let getRecents = useMemo(() => {
    let propsObject = {
      importMode,
      selectedEntity,
    };
    return <Recents {...propsObject} />;
  }, [importMode, JSON.stringify(selectedEntity)]);

  let getListItems = (isRequiredFieldExist = false) => {
    return (
      <>
        <ListSubheader
          style={{
            backgroundColor: isRequiredFieldExist ? "red" : "green",
          }}
        >
          <DisplayText style={{ color: "white" }}>Required Fields</DisplayText>
        </ListSubheader>
        <div>
          {requiredFields.length > 0 ? (
            requiredFields.map((item) => (
              <ListItem
                key={`{value}`}
                style={{ borderBottom: "1px solid lightgray" }}
              >
                <DisplayText>
                  <DisplayCheckbox
                    disabled
                    icon={<CancelSharp style={{ color: item.color }} />}
                    checkedIcon={<CheckCircle style={{ color: item.color }} />}
                    checked={item.color === "green"}
                    style={{ opacity: 1 }}
                  />{" "}
                  {item.label}
                </DisplayText>
              </ListItem>
            ))
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
              }}
            >
              <DisplayText>No Required Fields</DisplayText>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderBody = () => {
    let isRequiredFieldExist =
      (requiredFields.length > 0 &&
        requiredFields.some((eachField) => eachField?.color == "red")) ||
      false;
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "74vh",
            width: "75vw",
            margin: "0px 12px",
          }}
        >
          <div className={stepperClass.root}>
            <DisplayCard
              style={{
                margin: "auto",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                background: "#4c91db",
              }}
            >
              <Stepper
                className={stepperIconClass.root}
                activeStep={activeStep}
                alternativeLabel
                style={{
                  background: "transparent",
                  width: "100%",
                  margin: "auto",
                  height: "fit-content",
                  padding: "8px",
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {/* {activeStep == 0 && (
                <span
                  style={{ padding: "0px 0px 4px 0px", alignSelf: "center" }}
                >
                  <DisplayText style={{ fontSize: "12px", color: "white" }}>
                    Fill out the necessary details to import your data into the
                    system.
                  </DisplayText>
                </span>
              )} */}
              {activeStep == 1 &&
                (importMode == "update" ? (
                  <></>
                ) : (
                  <span
                    style={{ padding: "0px 0px 2px 0px", alignSelf: "center" }}
                  >
                    <DisplayText style={{ fontSize: "12px", color: "white" }}>
                      <b>Note : </b>Each column header below should be mapped to
                      a field in target field. Some of these have already been
                      mapped based on their names.
                    </DisplayText>
                  </span>
                ))}
            </DisplayCard>
          </div>
          {activeStep == 1 && importMode == "update" && (
            <div
              style={{
                display: "flex",
                flexDirection: "center",
                width: "73vw",
                color: "red",
                margin: "4px",
                justifyContent: "center",
              }}
            >
              <DisplayText>
                {" "}
                <b>Note : </b>All NueGOV fields will be in the "unmapped" state.
                Only map the fields you want to update.
              </DisplayText>
            </div>
          )}
          <DisplayCard
            style={{
              padding: "16px 16px 0px 16px",
              flexDirection: "column",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                alignItems: "center",
                overflow: "auto",
                height: "100%",
              }}
            >
              {getStepContent(activeStep)}
            </div>
          </DisplayCard>
        </div>
        <div style={{ width: "25vw", marginRight: "12px" }}>
          <DisplayCard
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "12px",
              height: "100%",
              background: "whitesmoke",
            }}
          >
            {activeStep === 0 && importMode !== "update" && (
              <>
                <img
                  src="https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/dataimport.svg"
                  alt=""
                  style={{ alignSelf: "center" }}
                />
                <DisplayText
                  style={{ color: "#4c91db", alignSelf: "center" }}
                  variant="h6"
                >
                  Before you import your data...
                </DisplayText>
                <br />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "45vh",
                    overflow: "auto",
                  }}
                >
                  {helperData?.step0?.length > 0 &&
                    helperData?.step0.map((eachContext) => {
                      return (
                        <>
                          <>
                            <DisplayText
                              variant="subtitle2"
                              style={{ alignSelf: "baseline" }}
                            >
                              {eachContext.title} :{" "}
                            </DisplayText>
                            <DisplayText
                              style={{ fontSize: "13px", opacity: "0.6" }}
                            >
                              {eachContext.value}
                            </DisplayText>
                          </>
                          <DisplayDivider />
                          <br />
                        </>
                      );
                    })}
                </div>
              </>
            )}
            {activeStep === 0 && importMode === "update" && getRecents}
            {activeStep == 1 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <List className={listClasses.root}>
                  <li className={listClasses.listSection}>
                    <ul className={listClasses.ul}>
                      {getListItems(isRequiredFieldExist)}
                    </ul>
                  </li>
                </List>
              </div>
            )}
            {activeStep == 2 && (
              <>
                {helperData?.step2?.length > 0 &&
                  helperData?.step2.map((eachContext) => {
                    return (
                      <>
                        <>
                          <DisplayText
                            variant="subtitle2"
                            style={{ alignSelf: "baseline" }}
                          >
                            {eachContext.title} :{" "}
                          </DisplayText>
                          <DisplayText
                            style={{ fontSize: "13px", opacity: "0.6" }}
                          >
                            {eachContext.value}.
                          </DisplayText>
                        </>
                        <DisplayDivider />
                        <br />
                      </>
                    );
                  })}
              </>
            )}
            {(isNJAdmin() || isSuperAdmin) && activeStep === 1 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "auto",
                  padding: "12px 10px",
                  borderTop: "0.5px solid darkgray",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <spam style={{ fontSize: "14px", fontWeight: "500" }}>
                  Unable to find the fields you need ?
                </spam>
                <spam
                  style={{
                    color: dark?.bgColor,
                    fontSize: "12px",

                    paddingTop: "5px",
                  }}
                >
                  <spam
                    style={{ cursor: "pointer" }}
                    onClick={() => setCustomFieldFlag(true)}
                  >
                    Click here to create your custom fields.
                  </spam>
                </spam>
                {customFieldFlag && (
                  <AttachCustomField
                    agencyInfo={isNJAdmin() ? selectedAgency : getAgencyDetails}
                    metadata={templateObj}
                    customFieldFlag={customFieldFlag}
                    onClose={() => setCustomFieldFlag(false)}
                    entityInfo={selectedEntity}
                  />
                )}
              </div>
            )}
          </DisplayCard>
        </div>
      </div>
    );
  };

  let renderFooter = () => {
    let handleContinue = () => {
      handleNext();
    };

    let handleGoBack = () => {
      handleBack();
    };

    const handleImport = () => {
      setOpenBackDrop({
        open: true,
        message: "Your import is being processed...",
      });
      let formData = new FormData();
      let fileDetails = selectedFiles.reduce(
        (acc, { file, ...rest }) => {
          formData.append("myfile", file, file.name);
          if (rest.level === "TOP") acc["topLevel"] = rest;
          else acc.componentLevel = [...acc.componentLevel, rest];
          return acc;
        },
        { componentLevel: [] }
      );

      let finalPayload = [];
      if (
        importMode === "insert" &&
        usernameMatch?.toLowerCase() !== "autogenerate"
      ) {
        let findEmailType = mappingField?.find((eachMap) => {
          return eachMap.target.type === "EMAIL";
        });
        finalPayload = [
          ...mappingField,
          {
            source: { fieldName: findEmailType?.source?.fieldName },
            target: {
              fieldName: "username",
              matchBy: "username",
              parentName: "username",
            },
          },
        ];
      } else {
        finalPayload = [...mappingField];
      }

      let payload = {
        format: fileType?.split(".")[1]?.toUpperCase(),
        entityName: selectedEntity?.groupName,
        appName,
        moduleName,
        mode: importMode,
        matchByUniqueKey,
        isMapperEnabled: true,
        autogenerateUsername:
          usernameMatch?.toLowerCase() === "autogenerate" ? true : false,
        mappingPayload: {
          mapper: finalPayload,
        },
        agencyId: isNJAdmin() ? selectedAgency?._id : _id,
        // ...(primaryKey !== undefined && { primaryKey: primaryKey }),
        ...fileDetails,
        // validate: validate,
        importTitle: importName,
      };
      console.log(JSON.stringify(payload, null, 3));
      formData.append("importPayload", JSON.stringify(payload));
      for (var pair of formData.entries()) {
        console.log(pair[0] + " - " + pair[1]);
      }
      console.log("1537");
      return CSV.createData(PARAMS, formData)
        .then(async (res) => {
          console.log("1540");
          setImportModal({ flag: true, id: res?.data?.insertedIds?.[0] });
          setOpenBackDrop({ open: false, message: "" });
        })
        .catch((err) => {
          console.log("File not imported", err);
          setOpenBackDrop({ open: false, message: "" });
        });
    };

    let handleClose = () => {
      // history.goBack();
      history.push("/app/summary");
    };

    let handleStep3Close = () => {
      setActiveStep(0);
      clearStates();
      dispatch({
        type: "SET_IMPORT_MODE",
        payload: "",
      });
    };

    let findDisabledCondition = () => {
      let unfilledRequiredFields = requiredFields.some(
        (eachRequired) => eachRequired.color === "red"
      );
      return (
        unfilledRequiredFields ||
        (importMode === "update"
          ? mappingField.length <= 1
          : !mappingField.length ||
            (selectedEntity?.groupName?.toLowerCase() === "user" &&
              !usernameMatch &&
              !enableUsername?.enable))
      );
    };
    let FOOTER_BUTTONS = [
      {
        title: activeStep === 0 ? "Close" : "Back",
        action: activeStep === 0 ? handleClose : handleGoBack,
        variant: "outlined",
        disabled: false,
        style: {
          color: "red",
          borderColor: "red",
          borderRadius: "8px",
          height: "32px",
          display: activeStep === 2 ? "none" : "",
        },
      },
      {
        title: activeStep === 0 ? "Next" : "Import",
        action: activeStep === 0 ? handleContinue : handleImport,
        variant: "contained",
        disabled:
          activeStep === 0
            ? !selectedEntityTemplate ||
              !csvHeaders?.length ||
              !selectedFiles.length ||
              (importMode === "update"
                ? !mappingField.length || !sourceFieldMap || !matchByUniqueKey
                : "") ||
              isDisabled
            : findDisabledCondition(),
        style: {
          borderRadius: "8px",
          height: "32px",
          display: activeStep === 2 ? "none" : "",
        },
      },
      {
        title: "Close",
        action: handleStep3Close,
        variant: "outlined",
        style: {
          borderRadius: "8px",
          color: "red",
          height: "32px",
          borderColor: "red",
          display: activeStep !== 2 ? "none" : "",
        },
      },
    ];

    return (
      <div style={{ position: "fixed", width: "100%", bottom: "0px" }}>
        <DisplayDivider style={{ background: "lightgray" }} />
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "end",
            background: "white",
            padding: "12px 0px",
          }}
        >
          {activeStep != 3 &&
            FOOTER_BUTTONS.map((eachButton) => {
              return (
                <>
                  <DisplayButton
                    style={eachButton?.style}
                    variant={eachButton.variant}
                    onClick={eachButton.action}
                    disabled={eachButton?.disabled}
                  >
                    {eachButton.title}
                  </DisplayButton>
                  &nbsp;&nbsp;&nbsp;
                </>
              );
            })}
        </div>
      </div>
    );
  };

  //converting spreadsheet data to json format
  const toJSON = (workbook) => {
    let result = {};
    let arrOfObj = {};

    workbook.SheetNames.forEach((sheetName) => {
      let convertedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });
      if (convertedData.length) result["Sheet1"] = convertedData;
      if (entityLevelImportsAlert) {
        let jsonArrObj = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (Object.keys(jsonArrObj).length) arrOfObj["Sheet1"] = jsonArrObj;
      }
    });
    entityLevelImportsAlert && setExcelValues(arrOfObj?.Sheet1);
    return result;
  };

  //extracting sheetdata
  const processExcel = (result) => {
    let workbook = XLSX.read(result, { type: "binary" });
    let firstSheet = workbook.SheetNames[0];
    let data = toJSON(workbook);
    return data;
  };

  //stepper next button function
  const handleNext = (id) => {
    let arr = [...mappingField];
    if (activeStep === 0 && importMode !== "update") {
      let headers = csvHeaders.forEach((eachSrc) => {
        return targetFields.forEach((eachTarget) => {
          if (
            eachTarget.label.toUpperCase() === eachSrc.label.toUpperCase() &&
            eachTarget?.type !== "REFERENCE"
          ) {
            if (eachTarget?.value?.toUpperCase() === "USERNAME") {
              setEnableUsername({
                source: eachSrc?.label,
                enable: true,
              });
            }
            arr.push({
              source: { fieldName: eachSrc.value },
              target: {
                fieldName: eachTarget?.value,
                type: eachTarget?.type,
                parentName: eachTarget?.parentFieldName,
                matchBy: eachTarget?.displayField || eachTarget?.value,
              },
              matched: true,
            });
          }
        });
      });
      // setMappingField([...mappingField, {source : {fieldName : srcVal}, target : {fieldName : destVal, type}}])
    }
    setMappingField(arr);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  //converting to Array of objects
  let convertToArray = (h) => h?.map((eh) => ({ label: eh, value: eh }));
  // ?.sort((a, b) => (a.label > b.label ? 1 : -1)) || [];

  //setting source headers
  const processFile = (file) => {
    if (file) {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        let contents = processExcel(e.target.result);
        let filterData = contents?.Sheet1?.filter((e) => e.length > 0) || [];
        let headers = filterData[0];
        if (filterData.length <= 1 || filterData[1].length <= 0) {
          setDisabled(true);
        } else {
          setDisabled(false);
        }
        let headerArray = convertToArray(headers);
        setCsvHeaders(headerArray);
      };
      fileReader.readAsBinaryString(file);
    } else console.log("failed to process csv/xlsx file");
  };

  //setfile and filename and process selected file
  const fileSelectionHandler = (event) => {
    if (event.target.name === selectedEntity.groupName) {
      let file = event.target.files[0];
      processFile(file);
    }
    dispatch({
      type: event.target.files[0] ? "SET_FILE_ARRAY" : "RESET_FILE_ARRAY",
      payload: { event, groupName: selectedEntity.groupName },
    });
    let fileName = event?.target?.files[0]?.name.split(".")[0];
    dispatch({
      type: "SET_IMPORT_NAME",
      payload: fileName,
    });
  };

  //helper video player modal
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
          <Faqs feature="Yes" groupName="Import" />
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

  //check for video links availability
  const checkForVideoLinks = () => {
    let videoLinks = helperData.videoLinks.filter((e) =>
      isDefined(e.link)
    ).length;
    return videoLinks > 0;
  };

  //use effects
  useEffect(() => {
    (async () => {
      let params = {
        appname: selectedEntity?.appName,
        modulename: selectedEntity?.moduleName,
        entityname: "Role",
        skip: 0,
        limit: 200,
      };
      if (entityLevelImportsAlert) {
        let entityDataResult = await entity.get({ ...params });
        setEntityData(entityDataResult);
      }
    })();

    if (templateObj && Object.keys(templateObj).length > 0) {
      let { sys_topLevel = [] } = templateObj?.sys_entityAttributes || {};
      let uniqueArray = [];
      let filterReferenceFields = sys_topLevel.filter((eachItem) => {
        if (importMode === "update") {
          let { title, name } = eachItem || {};
          if (eachItem?.unique)
            return uniqueArray?.push({ label: title, value: name });
        }
        return eachItem.type === "REFERENCE";
      });
      setUniqueFields(uniqueArray);
      setReferenceFields(filterReferenceFields);
    }
  }, [templateObj]);

  useEffect(() => {
    const getTemplate = async () => {
      if (unique_key) {
        let template = await entityTemplate.get({
          appname: appName,
          modulename: moduleName,
          groupname: entityName,
        });
        dispatch({
          type: "SET_TEMPLATE_OBJECT",
          payload: template,
        });
      }
    };
    getTemplate();
  }, [unique_key]);

  useEffect(() => {
    let arr = [];
    let fields = targetFields
      .filter((eachItem) => eachItem?.value?.toLowerCase() !== "username")
      .map((eachTarget) => {
        if (
          eachTarget.color !== "green" &&
          eachTarget?.displayNone !== "none" &&
          eachTarget.required
        ) {
          eachTarget.color = "red";
          arr.push(eachTarget);
        } else if (eachTarget.required) {
          eachTarget.color = "green";
          arr.push(eachTarget);
        }
      });
    if (importMode === "update") {
      setRequiredFields([]);
    } else {
      setRequiredFields(arr);
    }
  }, [JSON.stringify(mappingField), JSON.stringify(templateObj)]);

  useEffect(() => {
    return () => {
      clearStates();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {renderHeader()}
      {renderBody()}
      <br />
      {renderFooter()}
      <DisplayBackdrop
        open={openBackdrop.open}
        message={openBackdrop.message}
      />
      {openHelp && (
        <VideoPlayer
          handleModalClose={() => setHelp(false)}
          screenName={"IMPORT_SCREEN"}
          helperData={helperData}
        />
      )}
      {renderHelperModal()}
      <DisplayDialog
        open={importModal?.flag}
        title={"Your import is being processed"}
        confirmLabel={"View Status"}
        onConfirm={() => {
          clearStates();
          setImportModal({ flag: false, id: importModal.id });
          handleNext();
        }}
        onCancel={false}
        style={{ zIndex: 10010 }}
      />
    </div>
  );
};
