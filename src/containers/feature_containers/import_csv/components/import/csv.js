import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import XLSX from "xlsx";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { useStateValue } from "utils/store/contexts";
import {
  downloadTemplate,
  CSV,
} from "utils/services/api_services/import_service";
import {
  DisplayButton,
  DisplayCheckbox,
  DisplayDialog,
  DisplayGrid,
  DisplayInput,
  DisplayModal,
  DisplaySelect,
  DisplayText,
} from "components/display_components";

const useStyles = makeStyles({
  text: () => ({
    margin: "0px 0px 10px 0px",
  }),
  section: () => ({
    display: "flex",
    flex: 1,
    flexDirection: "column",
    contain: "strict",
  }),
});

export const DownloadTemplate = ({
  componentArray,
  name,
  friendlyName,
  handleDownload,
  handleClose,
  openModal,
}) => {
  const { setSnackBar } = GlobalFactory();
  const { isNJAdmin, getAgencyId, getAgencyName, getSubAgencies } =
    UserFactory();
  const { parent, sibling, child } = getSubAgencies || {};

  //states
  const [compCheckbox, setCompCheckbox] = useState({});
  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const [topCheckbox, setTopCheckbox] = useState({});

  const MODAL_BUTTONS = [
    {
      title: "Close",
      handler: handleClose,
      id: "Download-close",
      disableCondition: false,
    },
    {
      title: "Download",
      handler: () => {
        let payload = {
          ...(topCheckbox?.TOP && { TOP: true }),
          ...(Object.keys(compCheckbox).length > 0 && {
            COMPONENT: true,
          }),
          sys_agencyIds: selectedAgencies,
        };
        handleDownload(payload);
        setSnackBar({
          message: "Your templates will be downloaded shortly",
          severity: "info",
        });
      },
      disableCondition: isDisable(),
      id: "Download-download",
    },
  ];

  //local variables
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

    allAgencies = [{ agency: "All", id: "All" }, ...dependentAgencies];
  }

  //custom methods
  const isAllChecked = () => {
    if (componentArray?.length > 0)
      return !!topCheckbox?.TOP && compCheckbox?.COMPONENT;
    else return !!topCheckbox?.TOP;
  };

  function isDisable() {
    if (!isNJAdmin() && selectedAgencies?.length === 0) {
      return true;
    } else {
      if (
        topCheckbox?.hasOwnProperty("TOP") ||
        compCheckbox?.hasOwnProperty("COMPONENT")
      )
        return false;
      else return true;
    }
  }
  const onChange = (value) => {
    if (value.includes("All")) {
      if (selectedAgencies.length === dependentAgencies?.length)
        setSelectedAgencies([]);
      else {
        let selectedValues = dependentAgencies?.map((ea) => ea.id);
        setSelectedAgencies(selectedValues);
      }
    } else setSelectedAgencies(value);
  };

  const renderDownloadTemplate = () => (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <div style={{ flexShrink: 1 }}>
        <DisplayText variant="h5" style={{ fontSize: 16, fontWeight: 500 }}>
          {`${friendlyName} Components`}
        </DisplayText>
      </div>
      <DisplayCheckbox
        checked={!!compCheckbox?.COMPONENT}
        key={0}
        label={"Components"}
        testId={`import-component-checkbox`}
        onChange={(checked) => {
          checked ? setCompCheckbox({ COMPONENT: true }) : setCompCheckbox({});
        }}
      />
    </div>
  );

  //render
  return (
    <DisplayModal
      style={{ zIndex: 10000, overflow: "hidden" }}
      open={openModal}
      maxWidth={"lg"}
      fullWidth={true}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          height: "50vh",
          padding: "15px",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", flexShrink: 1 }}>
          <div style={{ display: "flex", flex: 8, alignItems: "center" }}>
            <DisplayText
              style={{ fontSize: 18, fontWeight: 500, fontFamily: "inherit" }}
            >
              Select and download your desired templates
            </DisplayText>
          </div>
          <div
            style={{
              flex: 4,
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <div style={{ width: "200px" }}>
              {!isNJAdmin() && (
                <DisplaySelect
                  title={"Select Agency"}
                  labelKey={"agency"}
                  displayChip={false}
                  selectView={true}
                  valueKey={"id"}
                  values={allAgencies}
                  onChange={(value) => onChange(value)}
                  value={selectedAgencies}
                  filled={selectedAgencies}
                  multiple={true}
                  MenuProps={{ style: { zIndex: 10001, height: "300px" } }}
                  variant="standard"
                  hideFooterChips={true}
                />
              )}
            </div>
            <div>
              <DisplayCheckbox
                checked={isAllChecked()}
                key={20}
                label={"Select All"}
                testId={`import-selectall-checkbox`}
                onChange={(e) => {
                  if (e) {
                    setTopCheckbox({ TOP: true });
                    if (componentArray?.length > 0)
                      setCompCheckbox({ COMPONENT: true });
                  } else {
                    setTopCheckbox({});
                    if (componentArray?.length > 0) setCompCheckbox({});
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <DisplayCheckbox
            checked={!!topCheckbox?.TOP}
            key={0}
            label={friendlyName}
            testId={"import-top-checkbox"}
            onChange={(checked) =>
              checked ? setTopCheckbox({ TOP: true }) : setTopCheckbox({})
            }
          />
        </div>
        {componentArray && componentArray.length > 0 && (
          <div
            style={{ display: "flex", flex: 10, alignContent: "flex-start" }}
          >
            {renderDownloadTemplate()}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            padding: "0px 10px 10px 0px",
            right: 0,
            bottom: 0,
          }}
        >
          {MODAL_BUTTONS.map(({ handler, id, title, disableCondition }, i) => (
            <DisplayButton
              key={i}
              testId={`import-${id}`}
              onClick={handler}
              disabled={disableCondition}
            >
              {title}
            </DisplayButton>
          ))}
        </div>
      </div>
    </DisplayModal>
  );
};

export const CSVFile = ({
  selectedEntity,
  fileType,
  template,
  mappingField,
  openDownloadModal,
  setOpenModal,
  setImportModal,
  importModal,
}) => {
  let { appName, moduleName, name, friendlyName, groupName } =
    selectedEntity || {};
  let history = useHistory();
  //factory services
  const [{ importState }, dispatch] = useStateValue();
  const { selectedFiles, importName } = importState;
  const { isNJAdmin } = UserFactory();
  const { closeBackDrop, setBackDrop, setSnackBar } = GlobalFactory();
  //styles
  const classes = useStyles();
  //state variables
  const [componentArray, setComponentArray] = useState();
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [primaryKey, setPrimaryKey] = useState();
  const [validate, setValidate] = useState(true);
  // const [importModal, setImportModal] = useState({ flag: false });
  const [topCheckbox, setTopCheckbox] = useState({});

  //custom variables
  let PARAMS = {
    appname: appName,
    modulename: moduleName,
    entityname: groupName,
  };

  const isComponentExists = componentArray && componentArray.length > 0;
  //custom functions
  // const handleImport = () => {
  //   setBackDrop("Your import is being processed...");
  //   let formData = new FormData();
  //   let fileDetails = selectedFiles.reduce(
  //     (acc, { file, ...rest }) => {
  //       formData.append("myfile", file, file.name);
  //       if (rest.level === "TOP") acc["topLevel"] = rest;
  //       else acc.componentLevel = [...acc.componentLevel, rest];
  //       return acc;
  //     },
  //     { componentLevel: [] }
  //   );

  //   let mapperPayLoad = {
  //     isMapperEnabled: true,
  //     mapper: mappingField,
  //   };

  //   let payload = {
  //     format: fileType,
  //     entityName: groupName,
  //     appName,
  //     moduleName,
  //     mappingObject: mapperPayLoad,
  //     ...(primaryKey !== undefined && { primaryKey: primaryKey }),
  //     ...fileDetails,
  //     validate: validate,
  //     importTitle: importName,
  //   };

  //   formData.append("importPayload", JSON.stringify(payload));
  //   console.log('outside')
  //   return CSV.createData(PARAMS, formData)
  //     .then(async (res) => {
  //       console.log('result in then')
  //       closeBackDrop();
  //       setImportModal({ flag: true, id: res?.data?.insertedIds?.[0] });
  //     })
  //     .catch((err) => console.log("File not imported"));
  // };

  // const BUTTONS = [
  //   {
  //     label: "IMPORT",
  //     action: handleImport,
  //     disableCondition: selectedFiles.length == 0,
  //   },
  // ];

  //custom functions

  const fileSelectionHandler = (event) => {
    if (event.target.name === groupName) {
      let file = event.target.files[0];
      processFile(file);
    }

    dispatch({
      type: event.target.files[0] ? "SET_FILE_ARRAY" : "RESET_FILE_ARRAY",
      payload: { event, groupName },
    });
  };

  const handleClose = () => setOpenModal(false);

  const handleDownload = async (selectedCheckbox) => {
    let payload = {
      ...selectedCheckbox,
      importFormat: fileType,
      entityName: name,
      appName,
      moduleName,
      groupName,
      templateName: name,
    };

    return await downloadTemplate
      .getTemplate({ ...PARAMS, payload: payload })
      .then((response) => {
        const downloadUrl = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute(
          "download",
          `${friendlyName}_${new Date().toDateString()}.zip`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        setSnackBar({
          message: "Your templates have been downloaded",
          severity: "success",
        });
        setOpenModal(false);
      })
      .catch((error) => {
        console.log(error);
        setOpenModal(false);
      });
  };

  const processExcel = (result) => {
    let workbook = XLSX.read(result, { type: "binary" });
    let firstSheet = workbook.SheetNames[0];
    let data = toJSON(workbook);
    return data;
  };

  const processFile = (file) => {
    if (file) {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        let contents = processExcel(e.target.result);
        let headers = contents?.Sheet1?.[0];
        let headerArray =
          headers
            ?.map((eh) => ({ label: eh, value: eh }))
            ?.sort((a, b) => (a.label > b.label ? 1 : -1)) || [];
        setCsvHeaders(headerArray);
      };
      fileReader.readAsBinaryString(file);
    } else console.log("failed to process csv/xlsx file");
  };

  const onCancelModal = () => {
    setImportModal({ flag: false });
    dispatch({
      type: "CLEAR_IMPORT_STATE",
    });
  };

  const toJSON = (workbook) => {
    let result = {};
    workbook.SheetNames.forEach((sheetName) => {
      let convertedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });
      if (convertedData.length) result["Sheet1"] = convertedData;
    });
    return result;
  };

  //use effect
  useEffect(() => {
    const getTemplate = async () => {
      let componentArr =
        template?.sys_entityAttributes?.sys_components?.[0]?.componentList?.map(
          (ec) => {
            return {
              componentName: ec?.name || "",
              componentTitle: ec?.componentTitle || "",
              level: "COMPONENT",
            };
          }
        ) || [];
      if (!componentArray?.length) setTopCheckbox({ [name]: true });
      setComponentArray(componentArr);
    };
    getTemplate();
  }, [template]);

  //render methods
  const renderFileSelect = () => {
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <DisplayGrid
          container
          style={{ display: "flex", flexShrink: 3, flexDirection: "row" }}
        >
          <DisplayGrid
            item
            container
            xs={12}
            sm={6}
            md={4}
            lg={4}
            xl={3}
            style={{ display: "flex", flexDirection: "column", flex: 1 }}
          >
            <div style={{ flexShrink: 2 }}>
              <DisplayText variant={"h2"} gutterBottom={true}>
                {" "}
                Upload {friendlyName} parent data csv/xlsx here{" "}
              </DisplayText>
            </div>
            <div
              style={{
                display: "flex",
                flex: 10,
                alignItems: "center",
                margin: "10px 0px 0px 0px",
              }}
            >
              <DisplayInput
                disabled={true}
                placeholder={"Select parent data file"}
                testId={"import-toplevel-select"}
                value={
                  selectedFiles?.find((ef) => ef.componentName === groupName)
                    ?.file?.name || ""
                }
                variant={"outlined"}
                size="small"
                style={{ width: "250px", margin: "0px 30px 0px 0px" }}
              />
              <DisplayButton
                variant="contained"
                component="label"
                testId={"import-toplevel-fileselect-button"}
              >
                Select File
                <input
                  type="file"
                  accept={fileType}
                  onChange={fileSelectionHandler}
                  name={groupName}
                  hidden
                />
              </DisplayButton>
            </div>
          </DisplayGrid>
          {selectedFiles?.find((ef) => ef.componentName === groupName) &&
            componentArray?.length > 0 && (
              <DisplayGrid
                item
                container
                xs={12}
                sm={6}
                md={4}
                lg={4}
                xl={3}
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <div style={{ flexShrink: 2 }}>
                  <DisplayText variant={"h2"} gutterBottom={true}>
                    {" "}
                    Select Primary key from dropdown{" "}
                  </DisplayText>
                </div>
                <div
                  style={{
                    display: "flex",
                    flex: 10,
                    alignItems: "center",
                    margin: "10px 0px 0px 0px",
                  }}
                >
                  <DisplaySelect
                    labelKey="label"
                    testId={"import-select-primarykey"}
                    variant={"outlined"}
                    valueKey="value"
                    required={true}
                    inputProps={{
                      size: "small",
                    }}
                    values={csvHeaders}
                    onChange={(value) => setPrimaryKey(value)}
                    value={primaryKey}
                    style={{
                      width: "350px",
                      margin: "10px 0px",
                      height: "40px",
                    }}
                  />
                </div>
              </DisplayGrid>
            )}
        </DisplayGrid>

        {componentArray && componentArray.length > 0 && (
          <DisplayGrid
            container
            style={{
              display: "flex",
              flex: 9,
              flexDirection: "column",
              margin: "10px 0px 0px 0px",
            }}
          >
            <div>
              <DisplayText> Upload component level csv/xlsx here </DisplayText>
            </div>
            <DisplayGrid container>
              {componentArray.map((ec, i) => (
                <DisplayGrid item container xs={12} sm={6} md={4} lg={4} xl={3}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: "10px 0px 0px 0px",
                    }}
                  >
                    <DisplayInput
                      disabled={true}
                      placeholder={`Select ${ec.componentTitle} file`}
                      testId={`import-${ec.componentName}-fileselect-button`}
                      value={
                        selectedFiles?.find(
                          (ef) => ef.componentName === ec.componentName
                        )?.file?.name || ""
                      }
                      variant={"outlined"}
                      size="small"
                      style={{ width: "250px", margin: "0px 30px 0px 0px" }}
                    />
                    <DisplayButton
                      variant="contained"
                      component="label"
                      testId={`import-${ec.componentName}-fileselect-button`}
                    >
                      Select File
                      <input
                        type="file"
                        accept={fileType}
                        onChange={fileSelectionHandler}
                        name={ec.componentName}
                        hidden
                      />
                    </DisplayButton>
                  </div>
                </DisplayGrid>
              ))}
            </DisplayGrid>
          </DisplayGrid>
        )}
      </div>
    );
  };

  const renderFooter = () => (
    <div style={{ display: "flex", flex: 1 }}>
      <div style={{ display: "flex", flex: 1 }}>
        <DisplayInput
          label={"Enter import title"}
          placeholder={"Enter import title"}
          testId={"import-title"}
          value={importName || ""}
          onChange={(val) =>
            dispatch({
              type: "SET_IMPORT_NAME",
              payload: val,
            })
          }
          size="small"
          style={{ width: "250px", margin: "0px 30px 0px 0px" }}
          variant="standard"
        />
      </div>
      <div
        style={{ display: "flex", flexShrink: 1, flexDirection: "row-reverse" }}
      >
        {/* {BUTTONS.map((eb) => (
          <div>
            <DisplayButton
              onClick={eb.action}
              size="large"
              testId={`import-${eb.label}-button`}
              disabled={eb.disableCondition}
            >
              {eb.label}
            </DisplayButton>
          </div>
        ))}
        {isNJAdmin() && (
          <div>
            <DisplayCheckbox
              checked={validate}
              key={0}
              label={"Validate"}
              testId={"import-validate-checkbox"}
              onChange={(value) => setValidate(value)}
            />
          </div>
        )} */}
      </div>
    </div>
  );
  return (
    <div className={classes.section}>
      <div
        style={{
          display: "flex",
          flex: 10,
          overflowY: "auto",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          <div>
            <span
              onClick={() => {
                setOpenModal(true);
              }}
              style={{
                color: "blue",
                textDecoration: "underline",
                textDecorationColor: "blue",
                cursor: "pointer",
                fontSize: 16,
              }}
              testId={"import-download-template-link"}
            >
              Click here{" "}
            </span>

            <DisplayText
              style={{ fontSize: 16, fontWeight: 400 }}
              variant={"h1"}
            >
              to download template
            </DisplayText>
            <br />
            <br />
          </div>
          <div style={{ display: "flex", flexShrink: 1 }}>
            <DisplayText
              className={classes.text}
              variant="h5"
              style={{ fontSize: 16, fontWeight: 500 }}
            >
              {" "}
              Upload your Spreadsheet / CSV
            </DisplayText>
          </div>
          <div style={{ display: "flex", flex: 10 }}>{renderFileSelect()}</div>
          {csvHeaders.map((item) => {
            return <DisplayText>{item.label}</DisplayText>;
          })}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexShrink: 2,
          alignItems: "center",
          flexDirection: "row-reverse",
        }}
      >
        {renderFooter()}
      </div>
      {openDownloadModal && (
        <DownloadTemplate
          componentArray={componentArray}
          name={name}
          friendlyName={friendlyName}
          handleDownload={handleDownload}
          handleClose={handleClose}
          openModal={openDownloadModal}
        />
      )}
      {/* <DisplayDialog
        open={importModal?.flag}
        title={"Your import is being processed"}
        confirmLabel={"View Status"}
        onConfirm={() => {
          dispatch({
            type: "CLEAR_IMPORT_STATE",
          });
          history.push(`/app/import/recents/${importModal.id}`);
        }}
        onCancel={onCancelModal}
        cancelLabel={"Close"}
        onClose={onCancelModal}
        style={{ zIndex: 10010 }}
      /> */}
    </div>
  );
};
