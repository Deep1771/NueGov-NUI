import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import {
  CSV,
  downloadTemplate,
} from "utils/services/api_services/import_service";
import { useStateValue } from "utils/store/contexts";
import { get } from "utils/services/helper_services/object_methods";
import {
  DisplayButton,
  DisplayCard,
  DisplayCheckbox,
  DisplayDialog,
  DisplayDivider,
  DisplayGrid,
  DisplayInput,
  DisplayText,
  DisplaySelect,
} from "components/display_components";
import { BubbleLoader } from "components/helper_components";
import { Maploader } from "../map_loader";
import { SystemIcons } from "utils/icons/index";

const useStyles = makeStyles({
  text: () => ({
    margin: "0px 0px 5px 0px",
  }),
  section: () => ({
    display: "flex",
    flex: 1,
    flexDirection: "column",
  }),
});

export const Shape = ({ selectedEntity, template, fileType }) => {
  let { appName, moduleName, name, friendlyName, groupName } = selectedEntity;
  let history = useHistory();
  //factory services
  const { isNJAdmin } = UserFactory();
  const { setBackDrop, closeBackDrop } = GlobalFactory();
  const [{ importState }, dispatch] = useStateValue();
  const { mappingFields, selectedShapeFile, importName } = importState;
  //styles
  const classes = useStyles();
  const { Info } = SystemIcons;
  //state variables
  const [error, setError] = useState(false);
  const [geojson, setGeoJson] = useState();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [topSectionFields, setTopSectionFields] = useState();
  const [validate, setValidate] = useState(true);
  const [importModal, setImportModal] = useState({ flag: false });

  //custom variables
  let PARAMS = {
    appname: appName,
    modulename: moduleName,
    entityname: groupName,
  };
  let topLevel = get(template, "sys_entityAttributes.sys_topLevel");
  let latlongfield = topLevel?.find((ef) => ef.type === "LATLONG");
  let designerfield = topLevel?.find((ef) => ef.type === "DESIGNER");
  let icon = latlongfield ? latlongfield?.icon?.url : null;

  //custom functions
  const handleImport = () => {
    setBackDrop("Your import is being processed...");
    let formData = new FormData();
    let payload = {
      format: fileType,
      entityName: groupName,
      appName,
      moduleName,
      mappingFields: mappingFields,
      level: "TOP",
      importTitle: importName,
      validate: validate,
    };

    formData.append("myfile", selectedShapeFile, selectedShapeFile.name);
    formData.append("importPayload", JSON.stringify(payload));
    return CSV.createData(PARAMS, formData)
      .then(async (res) => {
        closeBackDrop();
        setImportModal({ flag: true, id: res?.data?.insertedIds?.[0] });
      })
      .catch((err) => console.log("File not imported"));
  };

  const BUTTONS = [
    {
      label: "IMPORT",
      action: handleImport,
      disableCondition: !geojson,
      id: "import-shape-import",
    },
  ];
  const EXCLUDEFIELDS = [
    "AGENCYSHARING",
    "COLORPICKER",
    "DATARENDERER",
    "DATATABLE",
    "EMPTY",
    "DIRECTIVEPICKER",
    "DESIGNER",
    "DYNAMICLIST",
    "EVENTPICKER",
    "FORMULA",
    "HISTORY",
    "INLINEFILES",
    "LABEL",
    "LATLONG",
    "LIVESTREAM",
    "PERMISSION",
    "SECTION",
    "SUBSECTION",
    "TIMECLOCK",
    "TIMER",
  ];

  //custom functions

  const fileSelectionHandler = (event) => {
    setLoading(true);
    if (event.target.files[0]) {
      setError(false);
      dispatch({
        type: "SET_SHAPE_FILE",
        payload: event.target.files[0],
      });
    } else {
      dispatch({
        type: "RESET_SHAPE_FILE",
      });
      setLoading(false);
      setError(false);
    }
  };

  const filterTopFields = (prop) => {
    let removeFields =
      mappingFields.reduce((acc, ef) => {
        if (ef.fileKey !== prop[0]) {
          acc.push(...ef.systemKey);
        }
        return acc;
      }, []) || [];

    return topSectionFields.filter((ef) => {
      if (removeFields.includes(ef.name)) return false;
      else return true;
    });
  };

  const handleDownloadInstructions = async () => {
    let payload = {
      importFormat: fileType,
      entityName: name,
      appName,
      moduleName,
      groupName,
      templateName: name,
      [name]: true,
    };

    return await downloadTemplate
      .getTemplate({ ...PARAMS, payload: payload })
      .then((response) => {
        const downloadURL = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = downloadURL;
        link.setAttribute("download", `${friendlyName}_instructions.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const mappingHandler = (value, ep) => {
    let mappingObj = {
      fileKey: ep?.[0],
      systemKey: value,
    };
    dispatch({
      type: "SET_MAPPING_FIELDS",
      payload: { mappingObj },
    });
  };

  const onCancelModal = () => {
    setImportModal({ flag: false });
    dispatch({
      type: "CLEAR_IMPORT_STATE",
    });
  };

  //use effects
  useEffect(() => {
    if (selectedShapeFile) {
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(selectedShapeFile);
      fileReader.onload = () => {
        let buffer = fileReader.result;
        window
          .shp(buffer)
          .then(function (geojson) {
            if (geojson) {
              setGeoJson(geojson);
              setLoading(false);
              setError(false);
              let shpFields = Object.entries(
                geojson?.features?.[0]?.properties || {}
              );
              shpFields.sort((a, b) => (a > b ? 1 : -1));
              setProperties(shpFields);
            }
          })
          .catch((err) => {
            setLoading(false);
            setError(true);
          });
      };
    }
  }, [selectedShapeFile]);

  useEffect(() => {
    const getTemplate = async () => {
      let topFields = template?.sys_entityAttributes?.sys_topLevel?.filter(
        (ef) => !EXCLUDEFIELDS.includes(ef.type) && ef?.["canUpdate"]
      );
      if (topFields && topFields.length)
        topFields.sort((a, b) => (a.title > b.title ? 1 : -1));
      setTopSectionFields(topFields);
    };
    getTemplate();
  }, [template]);

  //render functions
  const renderFileSelector = () => (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <DisplayText
        className={classes.text}
        style={{ fontSize: 16, fontWeight: 500 }}
      >
        {" "}
        Upload your Shape File
      </DisplayText>
      <DisplayText className={classes.text} variant={"h2"}>
        {" "}
        Upload zip file which must contain .shp and .dbf files
      </DisplayText>
      <div style={{ display: "flex", alignItems: "center" }}>
        <DisplayInput
          disabled={true}
          placeholder={"Select zip file"}
          testId={"import-shapefile-select"}
          value={selectedShapeFile?.name || ""}
          variant={"outlined"}
          size="small"
          style={{ width: "250px", margin: "10px 30px 0px 0px" }}
        />
        <DisplayButton variant="contained" component="label">
          Select File
          <input
            type="file"
            accept={fileType}
            onChange={fileSelectionHandler}
            name={"friendlyName"}
            hidden
          />
        </DisplayButton>
      </div>
    </div>
  );

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
        {BUTTONS.map((eb) => (
          <div>
            <DisplayButton
              onClick={eb.action}
              size="large"
              testId={eb.id}
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
        )}
      </div>
    </div>
  );

  const renderMapper = () => {
    if (selectedShapeFile && error)
      return (
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          <DisplayText style={{ fontSize: 16, fontWeight: 500, color: "red" }}>
            {" "}
            Check your zip file. Either .shp or .dbf file is missing
          </DisplayText>
        </div>
      );
    else {
      if (selectedShapeFile && geojson && properties.length)
        return (
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <div style={{ display: "flex", flex: 2, flexDirection: "column" }}>
              <DisplayText
                className={classes.text}
                style={{ fontSize: 16, fontWeight: 500 }}
              >
                {" "}
                Map SHP Fields to System specifics{" "}
              </DisplayText>
              <DisplayText className={classes.text} variant={"h2"}>
                Select fields from your shp file to map against system fields,
                or to ignore during import
              </DisplayText>
            </div>
            <div
              style={{
                display: "flex",
                flex: 10,
                width: "600px",
                height: "100%",
              }}
            >
              <DisplayCard
                raised={false}
                style={{ display: "flex", flex: 1, flexDirection: "column" }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: 2,
                    backgroundColor: "#eeeeee",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                      padding: "0px 15px",
                    }}
                  >
                    <DisplayText style={{ fontSize: 14, fontWeight: 500 }}>
                      Shp property fields
                    </DisplayText>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                      padding: "0px 15px",
                    }}
                  >
                    <DisplayText style={{ fontSize: 14, fontWeight: 500 }}>
                      {friendlyName} fields
                    </DisplayText>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flex: 11,
                    height: "100%",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      flexGrow: 1,
                      contain: "strict",
                      overflow: "hidden",
                      overflowY: "auto",
                      height: "100%",
                    }}
                    class="hide_scroll"
                  >
                    {loading ? (
                      <BubbleLoader />
                    ) : (
                      properties.map((ep) => (
                        <>
                          <div
                            style={{
                              display: "flex",
                              width: "100%",
                              height: "40px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flex: 1,
                                height: "40px",
                                alignItems: "center",
                                padding: "0px 15px",
                              }}
                            >
                              <DisplayText
                                style={{ fontSize: 14, fontWeight: 500 }}
                              >
                                {ep?.[0]}
                              </DisplayText>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                height: "40px",
                                padding: "0px 15px",
                              }}
                            >
                              <DisplaySelect
                                labelKey="title"
                                testId={"import-shape-mapping-fieldtype"}
                                variant={"outlined"}
                                valueKey="name"
                                multiple={true}
                                displayChip={false}
                                values={filterTopFields(ep)}
                                onChange={(value) => mappingHandler(value, ep)}
                                value={
                                  mappingFields?.find(
                                    (ef) => ef.fileKey === ep?.[0]
                                  )?.systemKey || []
                                }
                                style={{
                                  width: "150px",
                                  height: "30px",
                                  fontSize: 12,
                                  fontWeight: 500,
                                }}
                                hideFooterChips={true}
                              />
                            </div>
                          </div>
                          <DisplayDivider />
                        </>
                      ))
                    )}
                  </div>
                </div>
              </DisplayCard>
            </div>
          </div>
        );
    }
  };

  return (
    <DisplayGrid className={classes.section} container>
      <DisplayGrid container style={{ display: "flex", flex: 11 }}>
        <DisplayGrid
          item
          xs={12}
          sm={12}
          md={12}
          lg={6}
          xl={6}
          style={{ display: "flex", flex: 1, flexDirection: "column" }}
        >
          <div>
            <span
              onClick={() => handleDownloadInstructions()}
              style={{
                color: "blue",
                textDecoration: "underline",
                textDecorationColor: "blue",
                cursor: "pointer",
                fontSize: 16,
              }}
              testId={"import-download-instructions-link"}
            >
              Click here{" "}
            </span>

            <DisplayText
              style={{ fontSize: 16, fontWeight: 400 }}
              variant={"h1"}
            >
              to download instructions
            </DisplayText>
          </div>
          <br />
          <div style={{ display: "flex", flex: 3, flexDirection: "column" }}>
            {renderFileSelector()}
          </div>
          <br />
          <div style={{ display: "flex", flex: 9, flexDirection: "column" }}>
            {renderMapper()}
          </div>
        </DisplayGrid>
        {selectedShapeFile && !error && (
          <DisplayGrid
            container
            item
            xs={12}
            sm={12}
            md={12}
            lg={6}
            xl={6}
            style={{ display: "flex", flex: 1, flexDirection: "column" }}
          >
            <br />
            <br />
            <DisplayText
              style={{ fontSize: 16, fontWeight: 500 }}
              className={classes.text}
              variant={"h2"}
            >
              Preview
            </DisplayText>
            <DisplayCard raised={false} style={{ display: "flex", flex: 1 }}>
              {!loading ? (
                <Maploader geojson={geojson} icon={icon} />
              ) : (
                <BubbleLoader />
              )}
            </DisplayCard>
          </DisplayGrid>
        )}
      </DisplayGrid>
      <DisplayGrid
        container
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          margin: "0px 15px 0px 0px",
        }}
      >
        {renderFooter()}
      </DisplayGrid>
      <DisplayDialog
        open={importModal.flag}
        title={"Your import is being processed..."}
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
      />
    </DisplayGrid>
  );
};
