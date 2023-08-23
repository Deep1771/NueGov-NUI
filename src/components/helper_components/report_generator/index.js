import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller, FormProvider, useWatch } from "react-hook-form";
import {
  DisplayModal,
  DisplayButton,
  DisplayText,
  DisplayIconButton,
  DisplayRadiobox,
  DisplayRadioGroup,
  DisplayCheckbox,
  DisplayHelperText,
  DisplayBackdrop,
  DisplaySnackbar,
  DisplayDivider,
} from "components/display_components";
import {
  SystemDaterange,
  SystemList,
} from "nueassist/components/system_components";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  InputAdornment,
} from "@material-ui/core";
import { useDetailStyles } from "./styles";
import {
  UserFactory,
  GlobalFactory,
  ThemeFactory,
} from "utils/services/factory_services";
import { useStateValue } from "utils/store/contexts";
import { reportGenerator } from "utils/services/api_services/report_service";
import { SystemIcons } from "utils/icons";
import { get } from "utils/services/helper_services/object_methods";
import { entity } from "utils/services/api_services/entity_service";
import { v4 as uuidv4 } from "uuid";
import { isDefined } from "utils/services/helper_services/object_methods";
import { VideoPlayer } from "../video_player";
import { ToolTipWrapper } from "components/wrapper_components";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";

const ReportGenerator = (props) => {
  let {
    appname,
    modulename,
    entityname,
    metadata,
    data,
    modalFlag,
    onClose,
    container = { level: "detail", type: undefined },
    filter,
    searchValues,
    selectedDate,
    archiveMode,
    selectedRows,
    filterDateRange,
  } = props;

  let { level, type } = container;

  let defaultValues = {
    password: "",
    confirmPassword: "",
    valid: false,
    main_report: "",
    reportData: [],
    selected: "",
    selectAll: false,
    passwordFlag: false,
    selectedFilter: {},
  };

  const {
    control,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues, mode: "all", reValidateMode: "onBlur" });

  const methods = useForm({
    mode: "onBlur",
    defaultValues: {},
    reValidateMode: "onBlur",
    resolver: undefined,
    context: undefined,
    criteriaMode: "firstError",
    shouldFocusError: true,
    shouldUnregister: false,
    shouldUseNativeValidation: false,
    delayError: undefined,
  });

  const { getBusinessType, getContextualHelperData } = GlobalFactory();

  const {
    getEntityFeatureAccess,
    getAgencyDetails,
    isNJAdmin,
    getRoleBasedReports,
    isSuperAdmin,
  } = UserFactory();
  const { showHelper = false, showSampleData = false } =
    getAgencyDetails?.sys_entityAttributes || {};
  const classes = useDetailStyles();
  const { getVariantObj } = ThemeFactory();

  const {
    CloseOutlined,
    ExpandMore,
    ExpandLess,
    Info,
    VisibilityOff,
    Visibility,
    Help,
  } = SystemIcons;

  const { dark } = getVariantObj("primary");
  const message =
    "Click on desired radiobox and click on 'View' or 'Download' button to generate report.";

  const reportData = useWatch({
    control: methods.control,
    name: "reportData",
  });

  const [checked, setChecked] = useState(false);
  const [reportObj, setReportObj] = useState({});
  const [passwordFlag, setPasswordFlag] = useState(false);
  const [selected, setSelected] = useState("");
  const [expand, setExpand] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openBackdrop, setOpenBackDrop] = useState({
    open: false,
    message: "",
  });
  const [openHelp, setHelp] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const Icon1 = showPassword ? Visibility : VisibilityOff;
  const Icon2 = showConfirmPassword ? Visibility : VisibilityOff;
  const businessType = getBusinessType();
  const helperData = getContextualHelperData("REPORTS_SCREEN");
  const groupName =
    get(metadata, "sys_entityAttributes.sys_templateGroupName.sys_groupName") ||
    "";

  const sub_reports =
    metadata?.sys_entityAttributes?.sys_entityRelationships?.filter(
      (e) =>
        e?.reports?.display === true &&
        getEntityFeatureAccess(
          e?.appName,
          e?.moduleName,
          e?.entityName,
          "Reports"
        )
    ) || [];

  let templateName =
    level === "summary"
      ? get(filter, "PAGELAYOUT") === undefined
        ? groupName
        : get(filter, "PAGELAYOUT")
      : get(data, "sys_templateName") ||
        get(metadata, "sys_entityAttributes.sys_templateName");

  if (filter?.medicationType) {
    templateName =
      filter?.medicationType === "OTC Medication"
        ? "OTCMedication"
        : templateName;
  }

  const searchValueObj =
    typeof searchValues === "object"
      ? searchValues
      : searchValues?.length
      ? { globalSearch: searchValues }
      : null;

  const friendlyName = get(
    metadata,
    "sys_entityAttributes.sys_friendlyName",
    "selected"
  );

  const id = get(data, "_id");

  let reportConfig = [];

  if (isSuperAdmin) {
    reportConfig =
      metadata?.sys_entityAttributes?.sys_reports
        ?.map(
          (report) => report?.isRoleBasedReport !== "True" && report?.sys_gUid
        )
        .filter((e) => e) || [];
    let superAdminReports =
      metadata?.sys_entityAttributes?.sys_reports
        ?.map(
          (report) =>
            report?.isSuperAdminBasedReport === "True" &&
            report?.isRoleBasedReport === "True" &&
            report?.sys_gUid
        )
        .filter((e) => e) || [];

    reportConfig = [...reportConfig, ...superAdminReports];
  } else {
    reportConfig = metadata?.sys_entityAttributes?.sys_reports
      ?.map(
        (report) => report?.isRoleBasedReport !== "True" && report?.sys_gUid
      )
      .filter((e) => e);
  }

  let roleBasedReports = getRoleBasedReports(groupName);

  if (roleBasedReports?.length) {
    let roleReports = roleBasedReports?.map((each) => each?.sys_gUid);
    reportConfig = [...reportConfig, ...roleReports];
  }

  let handleSnackBarClose = () => {
    setOpenSnackBar({
      open: false,
      message: "",
      severity: "",
    });
  };

  const constructReportData = (reportsData) => {
    if (reportsData?.length) {
      let structuredData = reportsData
        ?.map(({ sys_entityAttributes, sys_gUid }) => {
          let {
            caption,
            summaryCaption,
            reportName,
            mainReport,
            summaryReport,
            filterConfig,
            autoSaveConfig = [],
            disabledCaption,
          } = sys_entityAttributes;
          let structuredObj = {
            caption,
            summaryCaption,
            reportName,
            mainReport,
            summaryReport,
            filterConfig,
            sys_gUid,
            disabled: false,
            disabledCaption,
          };
          if (autoSaveConfig?.length > 0) {
            autoSaveConfig.map((e) => {
              let value = get(data, e?.path, "");
              if (e?.values?.includes(value))
                structuredObj = { ...structuredObj, disabled: true };
            });
          }
          if (level === "summary")
            return summaryReport === "True" && structuredObj;
          else return summaryReport !== "True" && structuredObj;
        })
        ?.filter((e) => e);

      if (structuredData?.length) {
        structuredData = structuredData?.sort(
          (leftItem, rightItem) =>
            reportConfig?.indexOf(leftItem?.sys_gUid) -
            reportConfig?.indexOf(rightItem?.sys_gUid)
        );

        methods.setValue("reportData", structuredData);

        setInitialReportData(structuredData);
      } else
        methods.setValue("reportData", [
          { message: "Configuration is missing" },
        ]);
    } else
      methods.setValue("reportData", [{ message: "Configuration is missing" }]);
  };

  const setInitialReportData = (rData) => {
    let initialReportdata = rData?.find((e) => !e?.disabled);
    setExpand(true);
    if (initialReportdata) {
      level === "detail" &&
        setValue(
          "main_report",
          rData?.find((e) => e.mainReport?.toUpperCase() === "TRUE")
        );
      setReportObj({
        [initialReportdata?.reportName]: { checked: true },
        index: 0,
      });
      initialReportdata?.filterConfig &&
        constructFilterValue(initialReportdata?.filterConfig, "initial");
      setChecked(true);
      setSelected(initialReportdata?.reportName);
    }
  };

  const getReportData = async () => {
    if (reportConfig === undefined) {
      constructReportData([]);
      return;
    }
    let queryParam = {
      appname: "Features",
      modulename: "Reports",
      entityname: "Reports",
      limit: 0,
      sys_gUid: reportConfig?.toString(),
    };
    constructReportData(await entity.get(queryParam));
  };

  const handleSelectAll = (val, index) => {
    let main_report = getValues("main_report");
    let mainObj = {
      index: index,
      [main_report?.reportName]: { checked: true },
    };

    setSelectAll(!selectAll);
    setSelected(main_report?.reportName);

    if (val) {
      let subObj = sub_reports?.reduce((curValue, nextValue) => {
        return { ...curValue, [nextValue?.reports?.title]: { checked: val } };
      }, {});
      mainObj = { ...mainObj, ...subObj };
      setReportObj(mainObj);
      setChecked(true);
    } else {
      setReportObj(mainObj);
      methods.setValue("filters", setFilterValue(null));
    }
  };

  const handleChange = (props) => {
    let { value, rName, type, index, filterConfig } = props;
    let flag = type === "radiobox" ? true : value;
    let localObj = reportObj;

    if (type === "accordion") {
      flag = true;
      setSelected(rName);
      setExpand((prev) => !prev);
    } else setSelectAll(false);

    if (index !== reportObj?.index) {
      setExpand(true);
      setSelectAll(false);
      localObj = {};
    }

    localObj = { ...localObj, [rName]: { checked: flag }, index: index };
    setReportObj(localObj);

    let fl = Object.values(localObj).find((e) => e?.checked === true);
    if (fl && fl?.checked === true) {
      setChecked(true);
    } else {
      setChecked(false);
      setPasswordFlag(false);
    }
    if (filterConfig?.length) constructFilterValue(filterConfig, "actual");
    else methods.setValue("selectedFilter", {});
  };

  const handleEnablePassword = () => {
    if (passwordFlag) {
      setValue("password", "");
      setValue("confirmPassword", "");
      clearErrors(["password", "confirmPassword"]);
    } else {
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
    setPasswordFlag(!passwordFlag);
  };

  const checkForButtonEnable = () => {
    if (checked) {
      if (passwordFlag) {
        let returnFlag = false;

        let pwdValue = getValues("password");
        let confirmPwdValue = getValues("confirmPassword");

        if (pwdValue.length <= 0 && confirmPwdValue <= 0) returnFlag = true;
        else if (pwdValue !== confirmPwdValue) returnFlag = true;

        if (errors?.password) returnFlag = true;
        else if (errors?.confirmPassword) returnFlag = true;

        return returnFlag;
      } else return false;
    } else return true;
  };

  const isDate = function (date) {
    return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
  };

  const handleIcon = (type) => {
    if (type === "password") setShowPassword(!showPassword);
    else setShowConfirmPassword(!showConfirmPassword);
  };

  const setFilterValue = (val) => {
    let filterValue = methods.getValues("filters") || {};
    filterValue &&
      Object.entries(filterValue).map((entry) => {
        if (typeof entry[1] === "object") {
          let subObj = entry[1];
          entry[1] &&
            Object.entries(entry[1]).forEach(
              (e) => (subObj = { ...subObj, [e[0]]: val })
            );
          filterValue = { ...filterValue, [entry[0]]: subObj };
        } else filterValue = { ...filterValue, [entry[0]]: val };
      });
    return filterValue;
  };

  const constructFilterValue = (filterConfig, type) => {
    let filterObj = methods.getValues("filters") || {};
    let selectedFilter = methods.getValues("selectedFilter") || {};
    let obj = {};
    if (filterConfig) {
      if (type === "actual") {
        filterConfig = filterConfig?.map((e) => {
          if (filterObj[e?.name])
            obj = { ...obj, [e?.name]: e?.defaultValue || filterObj[e?.name] };
          else obj = { ...obj, [e?.name]: e?.defaultValue };
        });
        methods.setValue("selectedFilter", obj);
      } else {
        filterConfig = filterConfig?.map((each) => {
          let fieldName = each?.name;

          let defaultValue = selectedDate
            ? selectedDate
            : each?.defaultValue === undefined
            ? null
            : each?.defaultValue;

          if (each?.type === "DATERANGE" && type === "initial") {
            let [startDate, endDate] =
              filterDateRange?.length > 0 ? filterDateRange : [];
            let dateValue;
            if (typeof defaultValue === "string") {
              dateValue =
                defaultValue === "current"
                  ? new Date().toISOString()
                  : isDate(defaultValue)
                  ? new Date(defaultValue).toISOString()
                  : null;
            } else if (typeof defaultValue === "boolean") {
              dateValue = defaultValue ? new Date().toISOString() : null;
            } else dateValue = null;

            defaultValue = {
              startDate: startDate ? startDate : dateValue,
              endDate: endDate ? endDate : dateValue,
            };
            each.defaultValue = defaultValue;
          }
          obj = { ...obj, [fieldName]: defaultValue };
          return each;
        });
        type === "initial" && methods.setValue("selectedFilter", obj);
        methods.setValue("filters", { ...filterObj, ...obj });
      }
    } else {
      obj = selectedFilter;
      filterObj &&
        Object.entries(filterObj).map((each) => {
          if (selectedFilter.hasOwnProperty(each[0])) {
            obj = {
              ...obj,
              [each[0]]:
                typeof each[1] === "object"
                  ? each[1] || selectedFilter[each[0]]
                  : selectedFilter[each[0]] || each[1],
            };
            if (each[0] === "month") {
              obj = {
                ...obj,
                [each[0]]: each[1],
              };
            }
          }
        });
      return obj;
    }
  };

  const checkForFilterEnable = (filterConfig) => {
    if (filterConfig) {
      filterConfig = filterConfig?.filter((e) =>
        typeof e?.displayOnUI === "boolean" ? e?.displayOnUI : true
      );
      return filterConfig?.length ? true : false;
    } else return false;
  };

  const renderReportSection = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DisplayRadioGroup
          value={selected}
          // onChange={(event, value) => {
          //   let id = event?.target?.id;
          //   handleChange({
          //     rName: value,
          //     type: "radiobox",
          //     index: parseInt(id),
          //   });
          //   setSelected(value);
          // }}
        >
          {reportData?.map((rConfig, index) => {
            let enableSubreports =
              sub_reports?.length &&
              rConfig?.mainReport?.toUpperCase() === "TRUE"
                ? true
                : false;
            let enableFilter = checkForFilterEnable(rConfig?.filterConfig);
            let isMarSheet = type === "marsheet" ? true : false;
            return (
              <Accordion
                elevation={0}
                expanded={
                  expand &&
                  !isMarSheet &&
                  reportObj?.index === index &&
                  (enableSubreports || enableFilter)
                }
                disabled={rConfig?.disabled}
                onChange={() =>
                  handleChange({
                    rName: rConfig?.reportName,
                    type: "accordion",
                    index: index,
                    filterConfig: rConfig?.filterConfig,
                  })
                }
                style={{
                  margin: "8px 0px",
                  width: "100%",
                  border: "1px solid #ebebeb",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    (enableSubreports || enableFilter) && !isMarSheet ? (
                      <ExpandMore style={{ color: dark.bgColor }} />
                    ) : (
                      <></>
                    )
                  }
                >
                  <DisplayRadiobox
                    label={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {rConfig?.reportName}
                        </Typography>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                          }}
                        >
                          <DisplayText variant="caption">
                            {level === "summary"
                              ? rConfig?.summaryCaption
                                ? `${rConfig?.summaryCaption}`
                                : `use this to get summarized report of the ${friendlyName}`
                              : rConfig?.disabled
                              ? rConfig?.disabledCaption
                              : rConfig?.caption
                              ? `${rConfig?.caption}`
                              : rConfig?.mainReport?.toUpperCase() === "TRUE"
                              ? `use this to get detailed report of the ${friendlyName}`
                              : ""}
                          </DisplayText>
                        </div>
                      </div>
                    }
                    value={rConfig?.reportName}
                    id={index}
                  />
                </AccordionSummary>
                <AccordionDetails>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    {enableSubreports && renderCheckBoxSection(index)}
                    {!isMarSheet &&
                      (enableFilter
                        ? renderFilterSection(rConfig?.filterConfig)
                        : rConfig?.filterConfig?.length &&
                          constructFilterValue(
                            rConfig?.filterConfig,
                            "onChange"
                          ))}
                  </div>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </DisplayRadioGroup>
      </div>
    );
  };

  const renderCheckBoxSection = (index) => {
    return (
      <>
        {sub_reports?.length > 1 && (
          <div
            style={{
              display: "flex",
              flexDirection: "row-reverse",
            }}
          >
            <DisplayCheckbox
              label={
                <Typography variant="subtitle2" style={{ color: "#1976d2" }}>
                  Select All
                </Typography>
              }
              onChange={(value) => handleSelectAll(value, index)}
              checked={selectAll}
            />
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {sub_reports?.map((subReport) => {
            let isSubChecked = reportObj?.[subReport?.reports?.title]?.checked
              ? true
              : false;
            return (
              <div style={{ width: "50%" }}>
                <DisplayCheckbox
                  checked={isSubChecked}
                  label={
                    <Typography variant="body2">
                      {subReport?.reports?.title}
                    </Typography>
                  }
                  onChange={(value) =>
                    handleChange({
                      value: value,
                      rName: subReport?.reports?.title,
                      type: "checkbox",
                      index: index,
                    })
                  }
                />
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderErrorMessage = (message) => {
    return (
      <div className="system-helpertext" style={{ paddingLeft: "2px" }}>
        <DisplayHelperText icon={Info}>{message}</DisplayHelperText>
      </div>
    );
  };

  const handleClear = (clearType) => {
    if (clearType === "all") {
      setSelected("");
      setReportObj({});
      setSelectAll(false);
      setChecked(false);
      methods.setValue("filters", setFilterValue(null));
    }
    setPasswordFlag(false);
    setValue("password", "");
    setValue("confirmPassword", "");
    setShowPassword(false);
    setShowConfirmPassword(false);
    clearErrors(["password", "confirmPassword"]);
  };

  const renderFilterSection = (filterProps) => {
    return filterProps?.map((filterConfig) => {
      let type = filterConfig?.type;
      switch (type?.toUpperCase()) {
        case "DATERANGE": {
          return renderDateRangeSection(filterConfig);
          break;
        }
        case "MONTH": {
          return renderMonthPickerSection(filterConfig);
          break;
        }
        default: {
          return null;
        }
      }
    });
  };

  const renderMonthPickerSection = (props) => {
    let { description, defaultValue, name, ...rest } = props;
    let defaultMonth =
      defaultValue === "current" ? new Date().getMonth() + 1 : defaultValue;

    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 11 }}>
          <div style={{ display: "flex", flex: 6 }}>
            <FormProvider {...methods}>
              <SystemList
                fieldPath={"filters"}
                stateParams={{ mode: "edit" }}
                showNone={false}
                name={name}
                defaultValue={defaultMonth}
                canUpdate={true}
                {...rest}
              />
            </FormProvider>
          </div>
          <div style={{ display: "flex", flex: 5 }}></div>
        </div>
        <div style={{ display: "flex", flex: 1 }}>{description}</div>
      </div>
    );
  };

  const renderDateRangeSection = (dateRangeProps) => {
    let {
      name,
      type,
      description,
      defaultValue,
      maxDate,
      setTime = false,
      showTimer = false,
      ...rest
    } = dateRangeProps;

    let maximumDate = maxDate === "current" ? new Date() : maxDate;
    let defaultDate = defaultValue;

    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 11 }}>
          <div style={{ display: "flex", flex: 9 }}>
            <FormProvider {...methods}>
              <SystemDaterange
                fieldPath={"filters"}
                stateParams={{ mode: "edit" }}
                showTimer={showTimer}
                name={name}
                startAndEndDate={filterDateRange}
                defaultValue={defaultDate}
                maxDate={maximumDate}
                setTime={setTime}
                canUpdate={true}
                isReportDateRange={true}
                {...rest}
              />
            </FormProvider>
          </div>
          <div style={{ display: "flex", flex: 1 }}></div>
        </div>
        <div style={{ display: "flex", flex: 1 }}>{description}</div>
      </div>
    );
  };

  const renderPasswordSection = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DisplayCheckbox
          label={
            <Typography
              variant="subtitle"
              style={{ color: passwordFlag ? "black" : "#696969" }}
            >
              Enable password protection
            </Typography>
          }
          disabled={!checked}
          onChange={(value) => handleEnablePassword()}
          checked={passwordFlag}
        />
        {passwordFlag && (
          <form onAbort={checkForButtonEnable()}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Controller
                  render={({ field }) => (
                    <TextField
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      label="Password"
                      {...field}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment
                            position="end"
                            disablePointerEvents={false}
                          >
                            <DisplayIconButton
                              datasize={"medium"}
                              systemVariant="primary"
                              color={"primary"}
                              onClick={() => handleIcon("password")}
                            >
                              {" "}
                              <Icon1 />{" "}
                            </DisplayIconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  name="password"
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: "Field is required",
                    },
                    pattern: {
                      value: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]))/,
                      message: "Enter strong password ( eg - Aa@1 )",
                    },
                    laterCheck: () => {},
                  }}
                />
                {errors?.password &&
                  renderErrorMessage(errors?.password?.message)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Controller
                  render={({ field }) => (
                    <TextField
                      disabled={
                        getValues("password")
                          ? errors?.password
                            ? true
                            : false
                          : true
                      }
                      variant="outlined"
                      label="Confirm Password"
                      {...field}
                      size="small"
                      type={showConfirmPassword ? "text" : "password"}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment
                            position="end"
                            disablePointerEvents={false}
                          >
                            <DisplayIconButton
                              disabled={
                                getValues("password")
                                  ? errors?.password
                                    ? true
                                    : false
                                  : true
                              }
                              datasize={"medium"}
                              systemVariant="primary"
                              color={"primary"}
                              onClick={() => handleIcon("confirm")}
                            >
                              {" "}
                              <Icon2 />{" "}
                            </DisplayIconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  name="confirmPassword"
                  control={control}
                  rules={{
                    validate: {
                      dataEnterd: () =>
                        (getValues("confirmPassword") && true) ||
                        "Enter the password",
                      positive: () =>
                        getValues("password") ===
                          getValues("confirmPassword") ||
                        "Password are not matching",
                    },
                  }}
                />
                {errors?.confirmPassword &&
                  renderErrorMessage(errors?.confirmPassword?.message)}
              </div>
            </div>
          </form>
        )}
      </div>
    );
  };

  const handleReportGeneration = async (buttonType) => {
    if (buttonType === "download") {
      setOpenSnackBar({
        open: true,
        message: "Report is being generated; please wait",
      });
    } else {
      setOpenBackDrop({ open: true, message: "Processing..." });
    }

    let filterValueObj = constructFilterValue();

    let params = { appname, modulename, entityname };

    if (templateName !== entityname)
      params = { ...params, templateName: templateName };

    if (level !== "summary") params = { ...params, id };
    else params = { ...params, ...filter };

    if (archiveMode) {
      params = { ...params, archiveMode };
    }

    let jobPayLoad = {
      jobType: "reports",
      jobPayload: {
        ...reportObj,
        businessType: businessType,
        subId: data?.subId,
        currentDateTime: new Date(),
        dateRange: methods.getValues("filters"),
        filters:
          selectedRows?.length > 0
            ? {
                ...searchValueObj,
                ...filterValueObj,
                sys_gUid: selectedRows?.map((el) => el.sys_gUid),
              }
            : { ...searchValueObj, ...filterValueObj },
        level: level,
        taskDate: selectedDate,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        type: type ? type : null,
        password: getValues("password"),
        relatedPath: filter
          ? Object.keys(filter)
              ?.find((e) => e)
              ?.toString()
          : null,
        showSampleData: showSampleData,
      },
    };

    if (["GlobalMedication", "GlobalOrder"].includes(templateName)) {
      jobPayLoad = {
        ...jobPayLoad,
        jobPayload: {
          ...jobPayLoad?.jobPayload,
          relatedPath: "residentInfo.id",
        },
      };
    }

    let response = await reportGenerator
      .getReport({ ...params }, jobPayLoad)
      .then(async (res) => {
        if (res?.success && res?.data) {
          const bytes = new Uint8Array(res?.data?.data);
          const file = new Blob([bytes], { type: "application/pdf" });
          const fileURL = URL.createObjectURL(file);
          if (buttonType === "download") {
            const anchor = document.createElement("a");
            anchor.href = fileURL;
            anchor.download = uuidv4();
            document.body.append(anchor);
            anchor.click();
            anchor.remove();
            window.addEventListener(
              "focus",
              () => {
                URL.revokeObjectURL(anchor.href);
              },
              {
                once: true,
              }
            );
          } else {
            window.open(fileURL);
            setOpenBackDrop({
              open: false,
              message: "",
            });
          }
        } else {
          let errResponse = await res.text();
          errResponse = errResponse
            ? JSON.parse(errResponse)?.errors
            : {
                message: "Oops... Data not found",
              };

          setOpenSnackBar({
            open: true,
            message: errResponse.message,
            severity: "error",
          });
          setOpenBackDrop({
            open: false,
            message: "",
          });
        }
      })
      .catch((e) => {
        setOpenSnackBar({
          open: true,
          message: "Oops... Something went wrong",
          severity: "error",
        });
        setOpenBackDrop({
          open: false,
          message: "",
        });
      });
  };

  const checkForVideoLinks = () => {
    let videoLinks = helperData?.videoLinks.filter((e) =>
      isDefined(e.link)
    ).length;
    return videoLinks > 0;
  };

  useEffect(() => {
    handleClear("all");
    getReportData();
  }, [JSON.stringify(reportConfig)]);

  return (
    <>
      <DisplayModal open={modalFlag} fullWidth={true} maxWidth={"sm"}>
        <div className={classes.modal_container}>
          <div
            className={classes.modal_header}
            // style={{ backgroundColor: dark.bgColor }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <DisplayText variant="h6">
                  {level === "summary" ? "Report" : "Reports"}
                </DisplayText>
                {(isNJAdmin() ||
                  (helperData && checkForVideoLinks() && showHelper)) && (
                  <div
                    style={{
                      display: "flex",
                      height: "24px",
                      width: "56px",
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
              <Typography variant="caption">{message}</Typography>
            </div>
            <div>
              <DisplayIconButton
                systemVariant="secondary"
                onClick={onClose}
                testid="report-close"
              >
                <CloseOutlined />
              </DisplayIconButton>
            </div>
          </div>
          <DisplayDivider />
          <div className={classes.modal_body}>
            <div>
              {/* <Typography variant="caption">{message}</Typography> */}
              {/* <br /> <br /> */}
              {level === "summary" ? (
                <>
                  {isDefined(filter) &&
                    ["page", "sortby", "orderby"].forEach(
                      (e) => delete filter[e]
                    )}
                  {searchValueObj ||
                  (isDefined(filter) && Object.keys(filter)?.length !== 0) ? (
                    "Filters applied"
                  ) : (
                    <Typography variant="caption">
                      "No filters applied"
                    </Typography>
                  )}
                  &nbsp;<sup>*</sup>
                </>
              ) : (
                <></>
              )}
            </div>
            {reportData?.length ? (
              reportData[0]?.message ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#b8b4ab",
                    padding: "20px",
                  }}
                >
                  {reportData[0]?.message}
                </div>
              ) : (
                renderReportSection()
              )
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#b8b4ab",
                  padding: "20px",
                }}
              >
                Loading...
              </div>
            )}
          </div>
          {/* <hr /> */}
          {/* <DisplayDivider /> */}
          <div className={classes.modal_footer}>
            <div style={{ display: "flex", flex: 2.5, alignItems: "center" }}>
              {renderPasswordSection()}
            </div>
            <div
              style={{
                display: "flex",
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              {/* <DisplayButton
                disabled={checkForButtonEnable()}
                variant="outlined"
                size="small"
                onClick={() => {
                  handleClear("all");
                }}
                systemVariant={false ? "default" : "primary"}
              >
                Clear
              </DisplayButton> */}
              <DisplayButton
                disabled={checkForButtonEnable()}
                variant="outlined"
                size="small"
                onClick={() => {
                  handleReportGeneration();
                  handleClear("");
                  onClose();
                }}
                systemVariant={false ? "default" : "primary"}
              >
                View
              </DisplayButton>
              <DisplayButton
                disabled={checkForButtonEnable()}
                variant="contained"
                size="small"
                onClick={() => {
                  handleReportGeneration("download");
                  handleClear("");
                  onClose();
                }}
                systemVariant={false ? "default" : "primary"}
              >
                Download
              </DisplayButton>
            </div>
          </div>
        </div>
      </DisplayModal>

      {openHelp && (
        <VideoPlayer
          handleModalClose={() => setHelp(false)}
          screenName={"REPORTS_SCREEN"}
          helperData={helperData}
        />
      )}

      <DisplayBackdrop
        open={openBackdrop.open}
        message={openBackdrop.message}
      />
      <DisplaySnackbar
        open={openSnackBar.open}
        message={openSnackBar.message}
        severity={openSnackBar.severity}
        autoHideDuration={2000}
        onClose={handleSnackBarClose}
      />
    </>
  );
};

export default ReportGenerator;
