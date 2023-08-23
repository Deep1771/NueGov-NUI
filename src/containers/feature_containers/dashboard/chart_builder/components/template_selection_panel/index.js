import React, { useEffect, useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { MenuItem, TextField } from "@material-ui/core";
import { get } from "dot-prop";
import { useStateValue } from "utils/store/contexts";
import { UserFactory } from "utils/services/factory_services";
import CustomTreeView from "./components/custom_tree_view";
import { DisplayGrid, DisplayText } from "components/display_components";
import { PaperWrapper } from "components/wrapper_components";

let TemplateSelectionPanel = (props) => {
  const [{ dashboardState }, dispatch] = useStateValue();
  const { sys_entityAttributes } = dashboardState;

  const { getAppStructure } = UserFactory();
  const apps = getAppStructure;

  const CssTextField = withStyles({
    root: {
      "& label.Mui-focused": {
        color: "#666666",
        fontFamily: "Roboto",
        fontSize: 14,
      },
      "& .MuiInput-underline:after": {
        borderBottomColor: "green",
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "black",
        },
        "&:hover fieldset": {
          borderColor: "blue",
        },
        "&.Mui-focused fieldset": {
          borderColor: "blue",
        },
      },
      width: "95%",
    },
  })(TextField);

  const useStyles = makeStyles((theme) => ({
    root: {
      marginTop: 5,
      height: "100%",
      padding: "10px 10px 5px 10px",
      backgroundColor: "#ffffff",
      overflow: "auto",
      display: "flex",
      flex: 1,
      flexDirection: "column",
      // justifyContent: 'center',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: "95%",
    },
    typography: {
      color: "#212121",
      fontSize: 20,
      fontFamily: "Open Sans",
    },
  }));
  const classes = useStyles();

  const [entities, setEntities] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedApp, setSelectedApp] = useState(undefined);
  const [selectedEntity, setSelectedEntity] = useState(undefined);
  const [selectedModule, setSelectedModule] = useState(undefined);
  const [showFields, setShowFields] = useState(false);

  //local variables
  const excludedModules = [
    "Feature",
    "NJ-System",
    "Insights",
    "Document",
    "Report",
    "Marketing",
  ];

  //custom methods
  const handleAppChange = (val) => {
    if (selectedApp !== val) {
      setSelectedApp(val);
      setSelectedModule(undefined);
      setSelectedEntity(undefined);
      let appModules = apps
        .find((app) => app.name === val)
        .modules.filter((m) => !excludedModules.includes(m));
      setModules(appModules);
      dispatch({
        type: "SET_QUERY_OBJECT",
        payload: {
          appName: val,
        },
      });
    }
  };

  const handleEntityChange = (val) => {
    setSelectedEntity(val);
    dispatch({
      type: "SET_QUERY_OBJECT",
      payload: {
        appName: selectedApp,
        moduleName: selectedModule,
        entityName: val,
      },
    });
  };

  const handleModuleChange = (val) => {
    if (selectedModule !== val) {
      let moduleSelected = modules.find((m) => m.name === val);
      setSelectedModule(moduleSelected.name);
      setEntities(moduleSelected.entities);
      setSelectedEntity(undefined);
      dispatch({
        type: "SET_QUERY_OBJECT",
        payload: {
          appName: selectedApp,
          moduleName: val,
        },
      });
    }
  };

  const dataInit = () => {
    const selectedAppName = get(sys_entityAttributes, "query.appName");
    const selectedModuleName = get(sys_entityAttributes, "query.moduleName");
    const selectedEntityName = get(sys_entityAttributes, "query.entityName");
    if (selectedAppName && selectedModuleName && selectedEntityName) {
      setSelectedApp(selectedAppName);
      let appModules = apps
        .find((app) => app.name === selectedAppName)
        .modules.filter((m) => !excludedModules.includes(m));
      setModules(appModules);
      setSelectedModule(selectedModuleName);
      let moduleSelected = appModules.find(
        (m) => m.name === selectedModuleName
      );
      setEntities(moduleSelected.entities);
      setSelectedEntity(selectedEntityName);
    }
  };

  //useEffects
  useEffect(() => {
    dataInit();
  }, []);

  useEffect(() => {
    if (Object.keys(sys_entityAttributes.query).length === 0) {
      setSelectedApp(undefined);
      setSelectedModule(undefined);
      setSelectedEntity(undefined);
    } else dataInit();
  }, [sys_entityAttributes]);

  useEffect(() => {
    if (selectedApp && selectedModule && selectedEntity) setShowFields(true);
    else setShowFields(false);
  }, [selectedApp, selectedModule, selectedEntity]);

  return (
    <div className={classes.root} style={{ display: "flex", flex: 1 }}>
      <div style={{ flexShrink: 6, display: "flex" }}>
        <PaperWrapper
          elevation={2}
          style={{ disply: "flex", flex: 1, height: "100%" }}
        >
          <DisplayGrid
            container
            xs
            item
            style={{ disply: "flex", flex: 1, height: "100%" }}
          >
            <DisplayText
              className={classes.typography}
              variant="h6"
              component="h6"
              style={{ padding: "10px" }}
            >
              Select Data Source
            </DisplayText>
            <div
              style={{
                width: "100%",
                overflow: "auto",
                flexDirection: "column",
              }}
            >
              <form>
                <CssTextField
                  id="outlined-select-currency"
                  select
                  label="Select App"
                  className={classes.textField}
                  value={selectedApp}
                  InputProps={{
                    style: {
                      fontFamily: "Roboto",
                      fontSize: 16,
                      color: "#212121",
                      borderColor: "#fff",
                    },
                  }}
                  onChange={(e) => {
                    handleAppChange(e.target.value);
                  }}
                  SelectProps={{
                    MenuProps: {
                      className: classes.menu,
                    },
                    InputProps: {
                      className: classes.typography,
                    },
                  }}
                  margin="normal"
                  variant="outlined"
                >
                  {apps.map((option) => (
                    <MenuItem key={option.name} value={option.name}>
                      {option.friendlyName}
                    </MenuItem>
                  ))}
                </CssTextField>
                <CssTextField
                  disabled={!selectedApp}
                  id="outlined-select-currency"
                  select
                  label="Select Module"
                  className={classes.textField}
                  value={selectedModule}
                  InputProps={{
                    style: {
                      fontFamily: "Roboto",
                      fontSize: 16,
                      color: "#212121",
                      borderColor: "#fff",
                    },
                  }}
                  onChange={(e) => {
                    handleModuleChange(e.target.value);
                  }}
                  SelectProps={{
                    MenuProps: {
                      className: classes.menu,
                    },
                    InputProps: {
                      className: classes.typography,
                    },
                  }}
                  margin="normal"
                  variant="outlined"
                >
                  {modules.map((option) => (
                    <MenuItem key={option.name} value={option.name}>
                      {option.friendlyName}
                    </MenuItem>
                  ))}
                </CssTextField>
                <CssTextField
                  disabled={!selectedModule}
                  id="outlined-select-currency"
                  select
                  label="Select Entity"
                  className={classes.textField}
                  value={selectedEntity}
                  InputProps={{
                    style: {
                      color: "black",
                      borderColor: "#fff",
                    },
                  }}
                  onChange={(e) => {
                    handleEntityChange(e.target.value);
                  }}
                  SelectProps={{
                    MenuProps: {
                      className: classes.menu,
                    },
                    InputProps: {
                      className: classes.typography,
                    },
                  }}
                  margin="normal"
                  variant="outlined"
                >
                  {entities.map((option) => (
                    <MenuItem key={option.groupName} value={option.groupName}>
                      {option.friendlyName}
                    </MenuItem>
                  ))}
                </CssTextField>
              </form>
            </div>
          </DisplayGrid>
        </PaperWrapper>
      </div>
      <div
        elevation={2}
        style={{ flex: 4, display: "flex", padding: "15px 0px 2px 0px" }}
      >
        {showFields && (
          <PaperWrapper>
            <CustomTreeView
              appName={selectedApp}
              moduleName={selectedModule}
              entityName={selectedEntity}
            />
          </PaperWrapper>
        )}
      </div>
    </div>
  );
};
export default TemplateSelectionPanel;
