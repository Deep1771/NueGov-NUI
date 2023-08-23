import React, { useState, useCallback, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { SystemIcons } from "utils/icons/";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import {
  DisplayProgress,
  DisplayText,
  DisplayIconButton,
  DisplayIcon,
} from "components/display_components/";
import { SystemLabel } from "../index";
import Paper from "@material-ui/core/Paper";
import { textExtractor } from "utils/services/helper_services/system_methods";

export const SystemHistory = (props) => {
  const { stateParams, fieldmeta } = props;
  const { id } = stateParams;
  const { appName, entityName, moduleName, title } = fieldmeta;
  const [metadata, setMetaData] = useState(null);
  const [open, setOpen] = useState(false);
  const [entityData, setEntityData] = useState(null);

  const { ArrowDropDown } = SystemIcons;

  //Declarative
  const getHeaders = (md) =>
    md?.sys_entityAttributes?.sys_topLevel.filter(
      (i) => i.type !== "SECTION" && !i.hide
    );

  const getHistory = async () => {
    let meta = await entityTemplate.get({
      appname: appName,
      modulename: moduleName,
      groupname: entityName,
    });
    // console.log(41, id)
    let data = id
      ? await entity.get({
          appname: appName,
          modulename: moduleName,
          entityname: entityName,
          formId: id,
          limit: 100,
          skip: 0,
        })
      : [];
    // console.log(50, data)
    setMetaData(meta);
    setEntityData(data);
  };

  useEffect(() => {
    getHistory();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0px 10px",
      }}
    >
      <div
        className="system-label"
        style={{ marginBottom: "10px", alignSelf: "flex-start" }}
      >
        <DisplayText
          style={{
            color: "#5F6368",
            fontWeight: "400",
            fontSize: "12px",
          }}
        >
          {title}
        </DisplayText>
      </div>
      {metadata && Object.keys(metadata).length && entityData ? (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                {getHeaders(metadata).map(({ title, name }) => (
                  <TableCell key={name}>{title}</TableCell>
                ))}
                <DisplayIconButton onClick={() => setOpen(!open)}>
                  <ArrowDropDown style={{ color: "black" }} />
                </DisplayIconButton>
              </TableRow>
            </TableHead>
            {open && (
              <TableBody>
                {entityData.length ? (
                  entityData.map(({ _id, sys_entityAttributes }) => (
                    <TableRow key={_id}>
                      {getHeaders(metadata).map((fieldmeta) => (
                        <TableCell key={fieldmeta.name}>
                          {textExtractor(
                            sys_entityAttributes[fieldmeta.name],
                            fieldmeta
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>
                      <DisplayText>No History Found</DisplayText>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      ) : (
        <DisplayProgress />
      )}
    </div>
  );
};
