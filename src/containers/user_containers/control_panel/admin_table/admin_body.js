import React, { useEffect, useContext, useState } from "react";
import ReactDataGrid from "react-data-grid";
import { useHistory } from "react-router-dom";
import {
  DisplayIconButton,
  DisplayText,
  DisplayDialog,
  DisplayFormLabel,
  DisplayChips,
  DisplayAvatar,
  DisplayModal,
  DisplayCheckbox,
} from "components/display_components";
import { HotButton, Banner } from "components/helper_components/";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { DEFAULT_COLUMN_PROPERTIES } from "./components/grid/constant";
import { SummaryGridContext } from ".";
import { get, sortBy } from "lodash";
import { SystemIcons } from "utils/icons";
import CellBuilder from "./components/grid/grid_cell_builder";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { useStateValue } from "utils/store/contexts";
import GridServices from "./utils/services";
import "./utils/style.css";
import { entity } from "utils/services/api_services/entity_service";
import { ControlPaneContext } from "../index";
import {
  ContextMenuWrapper,
  ContainerWrapper,
} from "components/wrapper_components";
import { DetailContainer } from "containers/composite_containers/detail_container";
import { ContextSummary } from "containers/composite_containers/summary_container/components/context_summary";
import { switchUser } from "../../../user_containers/profile_page/loginas/switchUser";
import ResetPwd from "containers/user_containers/profile_page/reset_pwd/index";

export const Grid = ({
  editActionCallBack,
  renderThroughProps,
  writeAction = true,
  height = "72vh",
  appname,
  modulename,
  entityname,
}) => {
  let history = useHistory();
  const [{ userState }] = useStateValue();
  const { setSnackBar } = GlobalFactory();
  const { loginButton } = useContext(ControlPaneContext);
  const [modal, setModal] = useState(false);
  const [resetPwd, setResetPwd] = useState(false);
  const [id, setId] = useState("");
  const [openContext, setOpenContext] = useState(false);
  const [detailprops, setDetailpageProps] = useState({});
  const [contextOptions, setContextOptions] = useState({});
  const { Visibility, Edit, Delete, AddOutline, RemoveOutline, Launch, Lock } =
    SystemIcons;
  const [gridProps, dispatch] = useContext(SummaryGridContext);
  console.log(gridProps);
  const { metadata, data, columns, rows, params, selectedRows, checkData } =
    gridProps;
  // const rowsSelected = selectedRows?.[entityname] || [];
  const { GridCellBuilder } = CellBuilder();
  const [dialogProps, setDialogProps] = useState({ open: false });
  // const [selectedRows, setSelectedRows] = useState([]);
  const { gridActionButton = null, sys_hotButtons = false } =
    metadata?.sys_entityAttributes;
  let { visible_summary = true } =
    metadata?.sys_entityAttributes?.sys_hotButtons || true;
  const {
    checkDeleteAccess,
    checkReadAccess,
    checkWriteAccess,
    checkDataAccess,
    isSuperAdmin,
    isNJAdmin,
    checkSubAgencyLevel,
    getAgencyLogo,
    getAgencyName,
  } = UserFactory();
  const { getRoute, onDelete } = GridServices();

  const { userData } = userState;

  const filterFields = (metadata) => {
    let columns = get(
      metadata,
      "sys_entityAttributes.sys_topLevel",
      []
    )?.filter((fm) => fm.type !== "SECTION" && fm.visible);
    columns = columns.reduce((acc, curr) => {
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
        let checkForDuplicate = acc.find((e) => e.name === curr.name);
        if (!checkForDuplicate) acc.push(curr);
      }
      return acc;
    }, []);
    return {
      columns: sortBy(columns, "order"),
      length: columns.length,
    };
  };
  const handleAddFieldValue = (fieldValue, fieldMeta, formdata) => {
    let { multiSelect, static_filters, dynamicFilters } = fieldMeta;
    if (multiSelect) {
      setContextOptions({
        ...fieldMeta,
        select: "multiple",
        formdata: formdata,
        filters: handleFilters(fieldMeta, static_filters),
      });
      setOpenContext(true);
    } else {
      setContextOptions({
        ...fieldMeta,
        formdata: formdata,
        filters: handleFilters(fieldMeta, static_filters),
      });
      setOpenContext(true);
    }
  };

  const handleRemoveFieldValue = async (fieldValue, fieldMeta, formdata) => {
    let { name, multiSelect } = fieldMeta;
    let { _id, sys_gUid } = formdata;
    if (multiSelect) {
      fieldValue = fieldValue.slice(1);
      formdata["sys_entityAttributes"][name] = fieldValue;
    } else {
      delete formdata["sys_entityAttributes"][name];
    }
    //updating the document
    await entity
      .update({ appname, modulename, entityname, id: _id }, formdata)
      .then((res) => {
        dispatch({
          type: "ADD_ROWS_COLUMNS",
          payload: {
            columns: getGridHeaders(metadata),
            rows: getGridRows(data, metadata),
          },
        });
      })
      .catch((err) => {
        console.log("the error accuerd while updating in summary grid", err);
      });
  };

  const handleDetailPageModal = (fieldMetadata, fieldValue) => {
    let { appName, moduleName, entityName } = fieldMetadata;
    let obj = {
      appname: appName,
      modulename: moduleName,
      groupname: entityName,
      mode: "read",
      options: {
        hideTitleBar: true,
      },
      id: fieldValue.id,
    };
    setDetailpageProps(obj);
    setModal(true);
  };

  const getReferenceBuilder = (fieldValue, fieldMeta, formdata) => {
    let arr = textExtractor(fieldValue, fieldMeta)
      .split("|")
      .filter((fl) => !["", null, undefined].includes(fl));
    let { isClickable = true } = fieldMeta;
    return (
      <div
        style={{
          display: "flex",
          gap: 5,
          cursor: isClickable && "pointer",
        }}
      >
        {/* ADD and Remove button before the field */}
        {arr?.length
          ? fieldMeta?.canUpdate && (
              <DisplayIconButton
                // systemVariant="success"
                size="small"
                systemVariant="secondary"
                onClick={() =>
                  setDialogProps({
                    testid: "summaryDelete",
                    open: true,
                    title: "Are you sure you want to unassign?",
                    message: "You cannot undo this action",
                    cancelLabel: "Cancel",
                    confirmLabel: "Yes, Unassign",
                    onCancel: () => {
                      setDialogProps({ open: false });
                    },
                    onConfirm: () => {
                      handleRemoveFieldValue(fieldValue, fieldMeta, formdata);
                      setDialogProps({ open: false });
                      setSnackBar({
                        message: "Successfully Unassigned",
                        severity: "success",
                      });
                    },
                  })
                }
              >
                <RemoveOutline style={{ fontSize: "20px" }} />
              </DisplayIconButton>
            )
          : fieldMeta?.canUpdate && (
              <DisplayIconButton
                size="small"
                // systemVariant="secondary"
                systemVariant="success"
                onClick={() =>
                  handleAddFieldValue(fieldValue, fieldMeta, formdata)
                }
              >
                <AddOutline style={{ fontSize: "20px" }} />
              </DisplayIconButton>
            )}
        {/* //to print the field values */}
        {arr?.map((i, index) => {
          return (
            <>
              {Object.values(i).length > 0 && (
                <div
                  key={index}
                  onClick={() => {
                    if (isClickable) {
                      if (Array.isArray(fieldValue) && fieldMeta?.multiSelect) {
                        handleDetailPageModal(
                          fieldMeta,
                          fieldValue[index],
                          formdata
                        );
                      } else {
                        handleDetailPageModal(fieldMeta, fieldValue, formdata);
                      }
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: isClickable && "pointer",
                    // borderLeft: "6px solid black",
                    // backgroundColor: "whitesmoke",
                    // padding: "2%",
                    color: isClickable && "#308cf7",
                  }}
                >
                  {i}
                </div>
              )}
            </>
          );
        })}
      </div>
    );
  };

  const getReferenceSimplified = (displayFields, result = []) => {
    let fields = displayFields.map((f, idx) => {
      let fieldName =
        f.name.split(".").length > 1
          ? f.name.split(".")[f.name.split(".").length - 1]
          : f.name;
      return fieldName;
    });
    if (result.length) {
      result = result.map((item) => {
        let displayKeys = {};
        let fields = displayFields?.map((item1) => {
          if (
            [
              "DATE",
              "DATETIME",
              "DATERANGE",
              "PAIREDLIST",
              "CHECKBOX",
              "LIST",
              "CURRENCY",
              "PHONENUMBER",
            ].includes(item1.type)
          )
            displayKeys[item1.name] = textExtractor(
              item["sys_entityAttributes"][item1.name],
              item1
            );
          else if (item1.type === "AUTOFILL") {
            let displayName =
              item1.name.split(".")[item1.name.split(".").length - 1];
            displayKeys[displayName] = item["sys_entityAttributes"][
              "geoJSONLatLong"
            ]
              ? item["sys_entityAttributes"]["geoJSONLatLong"][displayName]
              : "";
          } else {
            if (item1.name.split(".").length > 1) {
              let fieldName = item1.name.split(".")[0];
              let displayName =
                item1.name.split(".")[item1.name.split(".").length - 1];
              displayKeys[displayName] = item["sys_entityAttributes"][fieldName]
                ? item["sys_entityAttributes"][fieldName][displayName]
                : "";
            } else
              displayKeys[item1.name] =
                item["sys_entityAttributes"][item1.name];
          }
        });
        return {
          id: item._id,
          sys_gUid: item.sys_gUid,
          ...displayKeys,
        };
      });
      if (displayFields.length === 1) {
        let refField;
        if (displayFields[0].name.includes("."))
          refField =
            displayFields[0].name.split(".")[
              displayFields[0].name.split(".").length - 1
            ];
        else refField = displayFields[0].name;
        result = result.filter(
          (value) =>
            value[refField] !== "" &&
            value[refField] !== null &&
            value[refField] !== undefined
        );
        return result;
      } else {
        return result;
      }
    }
  };
  const handleContextCancel = async (selectedVal) => {
    setOpenContext(false);
    let { entityTemplate } = selectedVal;
    let { formdata, name, multiSelect, displayFields } = contextOptions;
    let { _id } = formdata;
    let simplifiedData = getReferenceSimplified(
      displayFields,
      selectedVal?.data
    );
    if (simplifiedData?.length) {
      if (multiSelect) {
        formdata["sys_entityAttributes"][name] = simplifiedData;
      } else {
        formdata["sys_entityAttributes"][name] = simplifiedData[0];
      }
      //updating the document
      await entity
        .update({ appname, modulename, entityname, id: _id }, formdata)
        .then((res) => {
          dispatch({
            type: "ADD_ROWS_COLUMNS",
            payload: {
              columns: getGridHeaders(metadata),
              rows: getGridRows(data, metadata),
            },
          });
          setOpenContext(false);
        })
        .catch((err) => {
          console.log("the error accuerd while updating in summary grid", err);
          setOpenContext(false);
        });
    } else {
      setOpenContext(false);
    }
  };

  const checkEachRowDataAccess = (rowdata, metadata, permissionType) => {
    return checkDataAccess({
      appname,
      modulename,
      entityname,
      permissionType: permissionType,
      data: rowdata,
      metadata: metadata,
    });
  };

  const handleResetPassword = async (formdata) => {
    let { _id } = formdata;
    let data = JSON.parse(JSON.stringify(formdata));
    data.sys_entityAttributes.forceReset = true;
    await entity
      .update({ appname, modulename, entityname, id: _id }, data)
      .then((res) => {
        setSnackBar({
          message: `Email has been sent to the user to reset password`,
          severity: "success",
        });
      })
      .catch((err) => {
        console.log("the error accuerd while resetting password", err);
      });
  };

  const getGridHeaders = (metadata) => {
    let write, read, deleteR, contactmail;
    let actionColumn = {};

    write = checkWriteAccess(params);
    read = checkReadAccess(params);
    deleteR = checkDeleteAccess(params);
    let checkbox = {
      key: "checkbox",
      name: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flexStart",
            margin: "0 0 1.2rem .5rem",
          }}
        >
          <DisplayCheckbox
            checked={handleAllChecked(selectedRows)}
            disabled={false}
            onChange={(val) => {
              handleSelectAll(val, data);
              // handleSelectAll(
              //   val,
              //   data
              //     .filter((item) =>
              //       checkEachRowDataAccess(item, metadata, "write")
              //     )
              //     .map((el) => {
              //       return {
              //         _id: el._id,
              //         sys_gUid: el.sys_gUid,
              //         entityname: entityname,
              //       };
              //     })
              // );
            }}
          />
        </div>
      ),
      width: 50,
      frozen: true,
      formatter: ({ value, row }) => {
        let rowdata = data
          .filter((i) => i._id === row._id)
          ?.map((el) => {
            return {
              sys_gUid: el.sys_gUid,
              _id: el._id,
              sys_agencyId: el.sys_agencyId,
            };
          })[0];

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flexStart",
              margin: "0 0 .8rem .5rem",
            }}
          >
            <DisplayCheckbox
              // disabled={!write && checkEachRowDataAccess(rowdata, metadata, "write")}
              checked={handleSingleChecked(rowdata)}
              onChange={(val) => {
                handleSingleSelect(val, rowdata);
              }}
            />
          </div>
        );
      },
    };
    if (writeAction)
      actionColumn = {
        key: "_id",
        name: (
          <div style={{ marginLeft: "8px", fontSize: "14px" }}>Action </div>
        ),
        width:
          read && deleteR
            ? (Number(read || false) +
                Number(deleteR || false) +
                Number(sys_hotButtons && visible_summary ? true : false)) *
              100
            : (Number(read || false) +
                Number(sys_hotButtons && visible_summary ? true : false)) *
              170,
        selectBy: false,
        formatter: ({ value, row }) => {
          let rowdata = data.find((i) => i._id === value);
          let subAgencyInfo;
          let subAgencyActive =
            entityname == "Agency" &&
            get(
              rowdata,
              "sys_entityAttributes.agencyPermission.preset.subAgencyActive"
            );
          if (subAgencyActive) {
            subAgencyInfo = (() => {
              //IIFE
              if (isNJAdmin) {
                let isChild =
                  rowdata.sys_entityAttributes.parentAgency &&
                  Object.keys(rowdata.sys_entityAttributes.parentAgency).length
                    ? true
                    : false;
                let chipInfo = {
                  title: isChild ? "Child Agency" : "Parent Agency",
                  color: isChild ? "primary" : "success",
                };
                return chipInfo;
              } else {
                let subProp = checkSubAgencyLevel(rowdata.sys_agencyId);
                let chipInfo = {
                  title: subProp ? subProp.title : "Parent Agency",
                  color: subProp ? subProp.color : "primary",
                };
                return chipInfo;
              }
            })();
          }
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flexStart",
              }}
            >
              {write && checkEachRowDataAccess(rowdata, metadata, "write") ? (
                <DisplayFormLabel
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#212121",
                  }}
                  toolTipMsg={"Edit"}
                >
                  <DisplayIconButton
                    onClick={() => {
                      renderThroughProps
                        ? editActionCallBack(rowdata, "edit")
                        : getRoute(modulename, entityname, rowdata);
                    }}
                    systemVariant="primary"
                    size="small"
                  >
                    <Edit />
                  </DisplayIconButton>
                </DisplayFormLabel>
              ) : (
                <DisplayFormLabel
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#212121",
                  }}
                  toolTipMsg={"View"}
                >
                  <DisplayIconButton
                    onClick={() => {
                      renderThroughProps
                        ? editActionCallBack(rowdata, "read")
                        : getRoute(modulename, entityname, rowdata);
                    }}
                    systemVariant="primary"
                    size="small"
                  >
                    {read && <Visibility />}
                  </DisplayIconButton>
                </DisplayFormLabel>
              )}
              &nbsp;
              {loginButton && (
                <DisplayFormLabel
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#212121",
                  }}
                  toolTipMsg={"Login As"}
                >
                  <DisplayIconButton
                    systemVariant={"primary"}
                    size="small"
                    onClick={() =>
                      setDialogProps({
                        testid: "loginAs",
                        open: true,
                        title: `Login as - ${get(
                          rowdata,
                          "sys_entityAttributes.username"
                        )} ?`,
                        message:
                          "You can switch back later using exit icon in navigation bar",
                        cancelLabel: "Cancel",
                        confirmLabel: "Yes, Login",
                        onCancel: () => {
                          setDialogProps({ open: false });
                        },
                        onConfirm: () => {
                          setDialogProps({ open: false });
                          switchUser(history, rowdata, userData);
                        },
                      })
                    }
                  >
                    <Launch />
                  </DisplayIconButton>
                </DisplayFormLabel>
              )}
              &nbsp;
              {entityname === "User" && (isNJAdmin() || isSuperAdmin) && (
                <DisplayFormLabel
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#212121",
                  }}
                  toolTipMsg={"Reset Password"}
                >
                  <DisplayIconButton
                    systemVariant={"primary"}
                    size="small"
                    onClick={() => {
                      if (!isNJAdmin())
                        setDialogProps({
                          testid: "forceReset",
                          open: true,
                          title: `Reset Password`,
                          message: `Email will be sent to ${
                            rowdata.sys_entityAttributes.email
                              ? rowdata.sys_entityAttributes.email
                              : "User"
                          } to reset password`,
                          cancelLabel: "Cancel",
                          confirmLabel: "Yes, Reset",
                          onCancel: () => {
                            setDialogProps({ open: false });
                          },
                          onConfirm: () => {
                            setDialogProps({ open: false });
                            handleResetPassword(rowdata);
                          },
                        });
                      else {
                        setId(rowdata._id);
                        setResetPwd(true);
                      }
                    }}
                  >
                    <Lock />
                  </DisplayIconButton>
                </DisplayFormLabel>
              )}
              &nbsp;
              {deleteR && checkEachRowDataAccess(rowdata, metadata, "delete") && (
                <DisplayFormLabel
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "#212121",
                  }}
                  toolTipMsg={"Delete"}
                >
                  <DisplayIconButton
                    onClick={() => {
                      setDialogProps({
                        testid: "summaryDelete",
                        open: true,
                        title: "Are you sure you want to delete?",
                        message: "You cannot undo this action",
                        cancelLabel: "Cancel",
                        confirmLabel: "Yes, Delete",
                        onCancel: () => {
                          setDialogProps({ open: false });
                        },
                        onConfirm: () => {
                          onDelete(value);
                          setDialogProps({ open: false });
                          setSnackBar({
                            message: "Data has been successfully deleted",
                            severity: "success",
                          });
                        },
                      });
                    }}
                    systemVariant="primary"
                    size="small"
                  >
                    <Delete />
                  </DisplayIconButton>
                </DisplayFormLabel>
              )}
              &nbsp;
              {subAgencyActive && (
                <DisplayChips
                  variant="outlined"
                  size="small"
                  label={subAgencyInfo.title}
                  systemVariant={subAgencyInfo.color}
                />
              )}
              &nbsp;
              {sys_hotButtons && visible_summary && (
                <HotButton
                  entityDoc={rowdata}
                  entityTemplate={metadata}
                  handleLoading={(v, f) => {
                    return null;
                  }}
                  displayTitle={false}
                  appname={appname}
                  modulename={modulename}
                  entityname={entityname}
                  buttonStyle={{ minWidth: "120px", maxWidth: "120px" }}
                />
              )}
            </div>
          );
        },
        frozen: true,
      };
    let { columns, length } = filterFields(metadata);
    columns = metadata?.sys_entityAttributes?.displayAgencyLogoOnSummary
      ? [{ title: "Agency Logo", name: "agencyLogo" }, ...columns]
      : [...columns];
    let actualColumns = columns.map((e) => ({
      key: e?.name,
      name: <div style={{ fontSize: "14px" }}>{e?.title}</div>,
      formatter: ({ value }) => <div style={{ fontSize: "14px" }}>{value}</div>,
      width: length + gridActionButton?.length > 8 && 150,
      ...DEFAULT_COLUMN_PROPERTIES,
    }));
    return actualColumns.length
      ? read || deleteR || sys_hotButtons
        ? Object.keys(actionColumn).length
          ? [{ ...checkbox }, actionColumn, ...actualColumns]
          : [...actualColumns]
        : actualColumns
      : [];
  };

  const handleFilters = (fieldmeta, static_filters) => {
    let obj = {};
    if (static_filters && static_filters.length) {
      static_filters.map((f) => (obj[f.name] = f.value));
    }
    // if (
    //   typeof fieldmeta.dynamicFilters !== "undefined" &&
    //   fieldmeta.dynamicFilters.length > 0
    // ) {
    //   let { dynamicFilters } = fieldmeta;
    //   let { filterKey, filterPath, njFilterKey, njFilterPath, isArray } =
    //     dynamicFilters[0];
    //   let key = false ? njFilterKey : filterKey;
    //   let value =false ? njFilterPath : filterPath;
    //   if (key && value) {
    //     let pathValue = value.split(".").reduce((obj, path) => {
    //       return (obj || {})[path];
    //     }, {});
    //     if (isArray) obj[key] = JSON.stringify([pathValue]);
    //     else obj[key] = pathValue;
    //     if (obj[key] === undefined) {
    //       obj[key] = [];
    //       return obj;
    //     } else {
    //       return obj;
    //     }
    //   }
    // }
    return obj;
  };

  const getLogoForAgency = (agencyLogo, agencyName) => {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DisplayAvatar
            src={agencyLogo}
            alt={agencyName}
            style={{ width: "30px", height: "30px" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DisplayText style={{ fontSize: 10 }}>{agencyName}</DisplayText>
        </div>
      </div>
    );
  };

  const handleAllChecked = (sData) => {
    let dataExist = sData?.length === data?.length;
    return dataExist;
  };

  const handleSingleSelect = (val, rData) => {
    if (val) {
      dispatch({
        type: "SELECTED_DATA",
        payload: {
          selectedRows: [...selectedRows, rData],
        },
      });
    } else {
      let filterData = selectedRows.filter(
        (fl) => fl.sys_gUid !== rData.sys_gUid
      );
      // setSelectedData(filterData);
      dispatch({
        type: "SELECTED_DATA",
        payload: {
          selectedRows: [...filterData],
        },
      });
      // handleIdsFor360([...filterData]);
    }
  };

  const handleSelectAll = (val, rData) => {
    if (val) {
      dispatch({
        type: "SELECTED_DATA",
        payload: {
          selectedRows: [...rData],
        },
      });
    } else {
      dispatch({
        type: "SELECTED_DATA",
        payload: {
          selectedRows: [],
        },
      });
    }
  };

  const handleSingleChecked = (val) => {
    let checkDataExist = selectedRows?.some(
      (el) => el.sys_gUid === val.sys_gUid
    );
    return checkDataExist;
  };

  const getGridRows = (data, meta) => {
    if (data && meta) {
      return data?.reduce((accumulator, eachData) => {
        let {
          _id,
          sys_entityAttributes: fData,
          sys_agencyId = "No Agency",
        } = eachData;
        const agencyLogo = getAgencyLogo(sys_agencyId);
        const agencyName = getAgencyName(sys_agencyId);
        let obj = { _id };
        filterFields(meta).columns.forEach((element) => {
          // obj[element.name] =
          //   GridCellBuilder(fData[element.name], element) || "-----";
          if (element.type === "REFERENCE") {
            // if (false) {
            obj[element.name] = getReferenceBuilder(
              fData[element.name],
              element,
              eachData
            );
          } else {
            obj[element.name] =
              GridCellBuilder(fData[element.name], element) || "-----";
          }
        });
        obj["agencyLogo"] = getLogoForAgency(agencyLogo, agencyName);
        accumulator.push(obj);
        return accumulator;
      }, []);
    } else return [];
  };

  const emptyRowsView = () => {
    const message = "No Data To Show";
    return (
      <div
        style={{
          textAlign: "center",
          backgroundColor: "#ddd",
          padding: "16%",
        }}
      >
        <h3>{message}</h3>
      </div>
    );
  };

  const referenceModal = () => {
    return (
      <DisplayModal open={modal} fullWidth={true} maxWidth="xl">
        <div
          style={{
            height: "85vh",
            width: "100%",
            display: "flex",
            flex: 1,
          }}
        >
          <ContainerWrapper>
            <div style={{ height: "98%", width: "98%", padding: "1%" }}>
              <DetailContainer
                {...detailprops}
                onClose={(e) => setModal(false)}
                detailMode="REFERENCE"
              />
            </div>
          </ContainerWrapper>
        </div>
      </DisplayModal>
    );
  };

  useEffect(() => {
    dispatch({
      type: "SELECTED_DATA",
      payload: {
        selectedRows: [],
      },
    });
  }, [entityname]);

  useEffect(() => {
    dispatch({
      type: "ADD_ROWS_COLUMNS",
      payload: {
        columns: getGridHeaders(metadata),
        rows: getGridRows(data, metadata),
      },
    });
  }, [data, JSON.stringify(selectedRows)]);

  return (
    <div style={{ width: "100%" }}>
      {columns?.length > 0 && (
        <div
          key={Math.random()}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <>
            <ReactDataGrid
              emptyRowsView={emptyRowsView}
              columns={columns}
              rowsCount={rows?.length}
              enableCellSelect={true}
              rowHeight={60}
              rowGetter={(i) => rows[i]}
              minHeight={height}
            />
            <DisplayDialog {...dialogProps} />
            <ContextMenuWrapper
              options={{
                hideTitlebar: true,
              }}
              title={
                <div style={{ margin: "1%", color: "#3f51b5" }}>
                  {`vks detail`}{" "}
                </div>
              }
              visible={openContext ? openContext : false}
              width="30%"
            >
              {openContext && (
                <ContextSummary
                  appName={contextOptions?.appName}
                  moduleName={contextOptions?.moduleName}
                  entityName={contextOptions?.entityName}
                  summaryMode="context_summary"
                  handleCancel={handleContextCancel}
                  options={contextOptions}
                  filters={contextOptions?.filters}
                  // permissionCheck={handlePermission}
                  // filters={handleFilters()}
                />
              )}
            </ContextMenuWrapper>
            {modal && referenceModal()}
            {resetPwd && (
              <ResetPwd
                resetPassword={resetPwd}
                onClose={() => setResetPwd(!resetPwd)}
                screen="admin_panel"
                id={id}
              />
            )}
          </>
        </div>
      )}
    </div>
  );
};
