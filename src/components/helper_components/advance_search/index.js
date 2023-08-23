import React, { useState, useEffect } from "react";
import { IconButton, InputAdornment } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { isValid } from "date-fns";
import { object, dot } from "dot-object";
import { useForm, Controller } from "react-hook-form";
import {
  ThemeFactory,
  FiltersFactory,
  UserFactory,
  GlobalFactory,
} from "utils/services/factory_services";
import { basicEntityData } from "utils/services/helper_services/system_methods";
import {
  get,
  removeNullifyValues,
} from "utils/services/helper_services/object_methods";
import {
  DisplayButton,
  DisplayDatePicker,
  DisplayFormLabel,
  DisplayGrid,
  DisplayIconButton,
  DisplayInput,
  DisplayModal,
  DisplaySelect,
  DisplayText,
} from "../../display_components";
import { BubbleLoader } from "components/helper_components";
import { AgencyFilter } from "./agencyFilter";
import { EntityFilters } from "./entityFilters";
import { SortBy } from "./sort";
import { SystemIcons } from "utils/icons";

const useStyles = makeStyles({
  text: ({ colors }) => ({
    color: colors.dark.bgColor,
  }),
  label: {
    fontSize: "10.5px",
  },
  modal_header: ({ colors }) => ({
    padding: "5px 10px",
    display: "flex",
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: colors.dark.bgColor,
  }),
  modal_body: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    overflowY: "auto",
    overflow: "hidden",
    padding: "10px",
  },
});

export const AdvanceSearch = (props) => {
  const DEFAULT_FORM_STRUCTURE = {
    agencies: [],
    sortby: {},
    fieldFilters: {},
  };
  const {
    closeRenderAdvanceSearch,
    onAdSearchOpen,
    searchLabel,
    showModal,
    template,
    ...rest
  } = props;
  const {
    searchmode,
    propdata,
    entityName,
    activeFilter,
    hideSaveFeature,
    resetActiveFilter,
  } = rest;
  const { sys_agencyId, sortby, orderby, ...restParams } = propdata;

  const [defaultObject, setDefaultObject] = useState({});
  const [initialVal, setInitialVal] = useState(DEFAULT_FORM_STRUCTURE);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("new");
  const [open, setOpen] = useState(showModal);
  const [secObj, setSecObj] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [listVal, setlistVal] = useState("EQ");

  const shellObj = basicEntityData();

  const { control, handleSubmit, setValue, getValues, reset } = useForm({
    shouldUnregister: false,
    defaultValues: initialVal,
  });
  const { createFilter, updateFilter } = FiltersFactory();
  const { setSnackBar } = GlobalFactory();
  const { getVariantForComponent } = ThemeFactory();
  const { isNJAdmin } = UserFactory();

  const { HighlightOff } = SystemIcons;

  const classes = useStyles(getVariantForComponent("", "primary"));
  const { sys_filterFields, sys_topLevel } = get(
    template,
    "sys_entityAttributes"
  );
  const handleValChange = (val) => {
    setlistVal(val);
  };
  const isValidDate = (d) => {
    return d instanceof Date && !isNaN(d);
  };
  const checkDateformat = (n, v) => {
    if (/[|]/.test(v)) {
      setValue(n, v.split("|")[0]);
      setlistVal(v.split("|")[1]);
    }
  };

  let checkDisabled =
    defaultObject?.sys_entityAttributes?.default === "Yes" || filterName === ""
      ? true
      : false;
  let batchId = false;
  useEffect(() => {
    if (template) {
      setTabs([]);
      const filter =
        sys_filterFields &&
        sys_filterFields
          .map((i) => {
            if (i.path && i.path.slice(i.path.indexOf(".") + 1).includes("."))
              return i.path.slice(i.path.indexOf(".") + 1);
          })
          .filter((h) => h != undefined);

      setTabs(filter);
      setSecObj([]);

      const sec = sys_topLevel.reduce((sections, directive) => {
        if (directive.type == "SECTION" && directive.marker == "start")
          sections.push({
            ...directive,
            fields: [],
          });

        sys_filterFields &&
          sys_filterFields.map((i) => {
            if (i.name == "sys_batchId") batchId = true;

            if (
              i.path &&
              directive.type != "SECTION" &&
              directive.type != "SUBSECTION" &&
              !directive.hideOnDetail &&
              directive.type !== "DESIGNER" &&
              directive.type !== "LATLONG" &&
              directive.name == i.path.split(".")[1]
            ) {
              let name = sections[sections.length - 1].fields
                .map((i) => i.name)
                .toString();
              if (name.substring(name.lastIndexOf(",") + 1) !== directive.name)
                sections[sections.length - 1].fields.push(directive);
            }
          });
        return sections;
      }, []);

      //BATCH ID
      if (batchId)
        sec.push({
          name: "batchID",
          title: "Import Batch",
          type: "section",
          marker: "start",
          fields: [
            {
              name: "sys_batchId",
              type: "TEXTBOX",
              title: "Batch Id",
            },
          ],
        });
      setSecObj(sec);
    }
  }, [template]);

  useEffect(() => {
    if (Object.keys(activeFilter).length && activeFilter._id) {
      setDefaultObject(activeFilter);
      setFilterName(activeFilter.sys_entityAttributes?.filterName);
      setMode("edit");
    } else {
      setDefaultObject(shellObj);
      setFilterName("");
      setMode("new");
    }
    constructInitialValue(propdata);
  }, []);

  useEffect(() => {
    reset(initialVal);
  }, [initialVal]);

  const constructInitialValue = ({
    sys_agencyId,
    sortby,
    orderby,
    ...rest
  }) => {
    let convertedFilters = object(rest);
    let tempSort =
      sortby && orderby ? object({ [sortby]: parseInt(orderby) }) : {};

    let initialValue = {
      fieldFilters: { ...convertedFilters },
    };
    initialValue.agencies = sys_agencyId ? JSON.parse(sys_agencyId) : [];
    initialValue.sortby = tempSort;

    setLoading(false);
    setInitialVal(initialValue);
  };

  const handleClose = () => {
    setOpen(false);
    closeRenderAdvanceSearch();
  };

  const clearHandler = () => {
    setLoading(true);
    reset(DEFAULT_FORM_STRUCTURE);
    setFilterName("");
    setInitialVal(DEFAULT_FORM_STRUCTURE);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const handleFilterCard = (filterObj) => {
    setLoading(true);
    reset({
      ...DEFAULT_FORM_STRUCTURE,
      ...filterObj.sys_entityAttributes.filters,
    });
    setDefaultObject(filterObj);
    setFilterName(filterObj?.sys_entityAttributes?.filterName);
    setMode("edit");
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const handleKeyDown = (event) => {
    let values = getValues();
    if (event.keyCode === 13) handleSearch(values, defaultObject);
  };

  const handleSave = async (data) => {
    let filtered_data = removeNullifyValues(data);
    let payload = mode === "new" ? { ...shellObj } : { ...defaultObject };
    payload["sys_entityAttributes"]["filterName"] = filterName;
    payload["sys_entityAttributes"]["filters"] = filtered_data;
    payload["sys_entityAttributes"]["entityName"] =
      template.sys_entityAttributes.sys_templateGroupName;

    if (mode === "new") {
      createNewHandler();
      await createFilter(entityName, payload, false);
    } else {
      updateFilter(entityName, payload, false).then((res) => {
        if (res.id === defaultObject._id) {
          setMode("edit");
          reset({
            ...DEFAULT_FORM_STRUCTURE,
            ...payload.sys_entityAttributes.filters,
          });
          setDefaultObject(payload);
          setFilterName(payload.sys_entityAttributes.filterName);
          setSnackBar({ message: "Filter updated", style: { zIndex: 10010 } });
        }
      });
    }
  };

  const handleSearch = (data, selectedFilter) => {
    setOpen(false);
    closeRenderAdvanceSearch();
    let filtered_data = removeNullifyValues(data);
    let sys_agencyId = data?.agencies ? JSON.stringify(data.agencies) : false;
    let filters =
      filtered_data && filtered_data.fieldFilters
        ? dot(filtered_data.fieldFilters)
        : {};
    let sortby =
      filtered_data && filtered_data.sortby ? dot(filtered_data.sortby) : false;

    let searchObj = {
      sys_agencyId,
      filters,
      sortby,
    };
    setTimeout(() => {
      onAdSearchOpen(searchObj, selectedFilter, true);
    }, 300);
  };

  const onClear = (name) => {
    setValue(name, "");
  };

  const createNewHandler = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
    reset(DEFAULT_FORM_STRUCTURE);
    setDefaultObject({ ...shellObj, sys_entityAttributes: { filterName: "" } });
    setFilterName("");
    setMode("new");
    setInitialVal(DEFAULT_FORM_STRUCTURE);
  };

  const renderHeader = () => {
    return (
      <div className={classes.modal_header}>
        <DisplayText
          testid={"advHeader"}
          variant="h5"
          style={{ flex: 8, fontFamily: "inherit", color: "white" }}
        >
          Advanced Search
        </DisplayText>
        <div style={{ flex: 1, display: "flex", flexDirection: "row-reverse" }}>
          <DisplayIconButton
            testid="asf-modelClose"
            onClick={handleClose}
            size={"small"}
          >
            <HighlightOff style={{ color: "primary" }} />
          </DisplayIconButton>
        </div>
      </div>
    );
  };

  const renderFields = () => {
    return loading ? (
      <BubbleLoader />
    ) : (
      <form
        control={control}
        style={{ display: "flex", flex: 1, flexDirection: "column" }}
      >
        <div
          style={{
            display: "flex",
            flex: 10.5,
            padding: "5px",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              padding: "0px 10px",
              alignItems: "center",
              backgroundColor: "#f2f2f2",
            }}
          >
            <div style={{ flex: 4, width: "200px" }}>
              {!isNJAdmin() && (
                <Controller
                  control={control}
                  name={"agencies"}
                  render={({ field: { value, ref, ...rest } }) => (
                    <AgencyFilter
                      testid="asf-agencies"
                      setValue={setValue}
                      selectedAgencies={[]}
                      value={value}
                      filled={value}
                      forwardRef={ref}
                      {...rest}
                    />
                  )}
                />
              )}
            </div>
            <div style={{ flex: 5 }}></div>
            <div style={{ flex: 3 }}>
              {!hideSaveFeature && (
                <Controller
                  control={control}
                  name="sortby"
                  render={({ field: { value, ...rest } }) => (
                    <SortBy
                      setValue={setValue}
                      value={value}
                      defaultValue="Hai"
                      app_cardContent={
                        template.sys_entityAttributes.app_cardContent
                      }
                      sys_topLevel={sys_topLevel}
                    />
                  )}
                />
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flex: 11,
              overflowY: "auto",
              backgroundColor: "#f2f2f2",
              margin: "5px 0px 0px 0px",
            }}
          >
            {renderSectionFields()}
          </div>
        </div>
        <div style={{ display: "flex", flex: 1.5, padding: "0px 5px 5px 5px" }}>
          <div style={{ display: "flex", flex: 1, backgroundColor: "#f2f2f2" }}>
            {/* {!hideSaveFeature && (
              <div
                style={{
                  display: "flex",
                  flex: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "0px 10px",
                }}
              >
                <DisplayInput
                  inputProps={{ testid: "asf-filterName" }}
                  label={"Save as"}
                  placeholder={"Enter filter name"}
                  required={true}
                  disabled={
                    defaultObject?.sys_entityAttributes?.default === "Yes" ||
                    false
                  }
                  value={filterName || ""}
                  onChange={(val) => setFilterName(val)}
                  variant="standard"
                />
              </div>
            )} */}
            <div
              style={{
                display: "flex",
                flex: 8,
                flexDirection: "row-reverse",
                alignItems: "center",
              }}
            >
              <DisplayButton
                testid="asf-applySearch"
                onClick={handleSubmit((data) => {
                  let dateFields = sys_filterFields.filter(
                    (i) => i.type === "DATE" && !i.detailedView
                  );
                  if (dateFields) {
                    dateFields.map((fieldName) => {
                      if (
                        isValidDate(new Date(data.fieldFilters[fieldName.name]))
                      ) {
                        let finalVal =
                          data.fieldFilters[fieldName.name] + "|" + listVal;
                        data.fieldFilters[fieldName.name] = finalVal;
                      }
                    });
                  }

                  handleSearch(data, defaultObject);
                })}
              >
                {searchLabel ? searchLabel : "Apply & Search"}{" "}
              </DisplayButton>
              {/* {!hideSaveFeature && (
                <DisplayButton
                  testid={"asf-" + mode + "-filter"}
                  onClick={handleSubmit((data) => handleSave(data))}
                  disabled={checkDisabled}
                >
                  {mode === "new" ? "Save" : "Update"} Filter
                </DisplayButton>
              )} */}
              <DisplayButton testid="asf-clear" onClick={() => clearHandler()}>
                {" "}
                Clear{" "}
              </DisplayButton>
            </div>
          </div>
        </div>
      </form>
    );
  };

  const renderBody = () => {
    return (
      <div style={{ display: "flex", flex: 1 }}>
        {/* {!hideSaveFeature && (
          <div style={{ display: "flex", flex: 3 }}>
            <EntityFilters
              entityName={entityName}
              cardHandler={(data) => handleFilterCard(data)}
              handleSearch={(data, selectedFilter) =>
                handleSearch(data, selectedFilter)
              }
              createNewHandler={() => createNewHandler()}
              activeFilter={activeFilter}
              resetActiveFilter={resetActiveFilter}
            />
          </div>
        )} */}
        <div style={{ display: "flex", flex: 9 }}>{renderFields()}</div>
      </div>
    );
  };

  const renderSectionFields = () => {
    if (secObj.map((i) => i.fields.length > 0).find((i) => i == true))
      return (
        <div className={classes.modal_body}>
          {secObj.map((i) => {
            if (i.fields.length > 0) {
              return (
                <>
                  <div style={{ marginBottom: "0.5%" }}>
                    <DisplayText className={classes.text}>
                      {" "}
                      {i.title}{" "}
                    </DisplayText>
                  </div>
                  <DisplayGrid
                    container
                    spacing={2}
                    style={{ margin: "0 0.5% 0.5% 0.1%" }}
                  >
                    {i.fields.map((j) => {
                      switch (j.type) {
                        case "DATE":
                        case "DATETIME":
                          let listViewfilter = sys_filterFields.find(
                            (i) => i.name === j.name && i.detailedView
                          );
                          if (listViewfilter) {
                            let years = [];
                            if (j.years?.length == 2) {
                              let max = j.years[1];
                              let min = j.years[0];

                              for (let y = max; y >= min; y--) {
                                years.push({ id: y, value: y });
                              }
                            }
                            return (
                              <DisplayGrid
                                item
                                xs={12}
                                xl={3}
                                md={4}
                                sm={6}
                                lg={4}
                              >
                                <Controller
                                  control={control}
                                  name={`fieldFilters.${j.name}`}
                                  render={({
                                    field: { onChange, value, ...rest },
                                  }) => (
                                    <>
                                      <AdvancedDateFilter
                                        years={years}
                                        value={value}
                                        classes={classes}
                                        rest={rest}
                                        j={j}
                                        setValue={setValue}
                                      />
                                    </>
                                  )}
                                />
                              </DisplayGrid>
                            );
                          } else
                            return (
                              <DisplayGrid
                                item
                                xs={12}
                                xl={3}
                                md={4}
                                sm={6}
                                lg={4}
                              >
                                <Controller
                                  control={control}
                                  name={`fieldFilters.${j.name}`}
                                  render={({
                                    field: { onChange, value, ...rest },
                                  }) => (
                                    <>
                                      {checkDateformat(
                                        `fieldFilters.${j.name}`,
                                        value
                                      )}
                                      <DisplayFormLabel
                                        filled={value ? true : false}
                                        classes={{ root: classes.label }}
                                      >
                                        {j.title}
                                      </DisplayFormLabel>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "row",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            width: "30%",
                                          }}
                                        >
                                          <DisplaySelect
                                            selectView={true}
                                            labelKey={"id"}
                                            valueKey={"value"}
                                            values={[
                                              { id: "LT", value: "LT" },
                                              { id: "GT", value: "GT" },
                                              { id: "EQ", value: "EQ" },
                                            ]}
                                            showNone={false}
                                            defaultValue={"EQ"}
                                            MenuProps={{
                                              style: { zIndex: 10001 },
                                            }}
                                            variant="standard"
                                            value={listVal}
                                            onChange={handleValChange}
                                            disableUnderline
                                            {...rest}
                                          />
                                        </div>
                                        {/* <div
                                            style={{
                                              display: "flex",
                                            }}
                                          > */}
                                        <DisplayDatePicker
                                          testid={`asf - ${j.name}`}
                                          InputAdornmentProps={{
                                            position: "start",
                                          }}
                                          style={{ width: "100%" }}
                                          format={
                                            j.format && j.format.split(" ")[0]
                                          }
                                          value={value ? value : null}
                                          inputProps={{ disabled: true }}
                                          onChange={(value) => {
                                            try {
                                              isValid(value)
                                                ? setValue(
                                                    `fieldFilters.${j.name}`,
                                                    new Date(
                                                      value
                                                    ).toISOString()
                                                  )
                                                : setValue(
                                                    `fieldFilters.${j.name}`,
                                                    value
                                                  );
                                            } catch (e) {
                                              setValue(
                                                `fieldFilters.${j.name}`,
                                                value
                                              );
                                            }
                                          }}
                                          DialogProps={{
                                            style: { zIndex: 10001 },
                                          }}
                                          InputProps={{
                                            endAdornment: (
                                              <InputAdornment position="end">
                                                <IconButton
                                                  disabled={
                                                    !`fieldFilters.${j.name}`
                                                  }
                                                >
                                                  <SystemIcons.Close
                                                    onClick={() =>
                                                      setValue(
                                                        `fieldFilters.${j.name}`,
                                                        ""
                                                      )
                                                    }
                                                  />
                                                </IconButton>
                                              </InputAdornment>
                                            ),
                                          }}
                                          inputVariant="standard"
                                        />
                                        {/* </div> */}
                                        {/* </div> */}
                                      </div>
                                    </>
                                  )}
                                />
                              </DisplayGrid>
                            );

                        case "DESIGNER":
                          return null;

                        case "LATLONG":
                          return j.fields.map((k) =>
                            tabs.map((m) => {
                              if (
                                m.split(".")[0] == j.name &&
                                m.split(".")[1] == k.name
                              )
                                return (
                                  <DisplayGrid
                                    item
                                    xs={12}
                                    xl={3}
                                    md={4}
                                    sm={6}
                                    lg={4}
                                  >
                                    <Controller
                                      control={control}
                                      name={`fieldFilters.${j.name}.${k.name}`}
                                      render={({ field: { ref, ...rest } }) => (
                                        <>
                                          <DisplayFormLabel
                                            filled={rest.value ? true : false}
                                            classes={{ root: classes.label }}
                                          >
                                            {k.title}
                                          </DisplayFormLabel>
                                          <DisplayInput
                                            inputProps={{
                                              testid: `asf - ${j.name}.${k.name}`,
                                            }}
                                            placeholder={""}
                                            inputRef={ref}
                                            onKeyDown={(event) =>
                                              handleKeyDown(event)
                                            }
                                            onClear={() =>
                                              onClear(
                                                `fieldFilters.${j.name}.${k.name}`
                                              )
                                            }
                                            variant="standard"
                                            {...rest}
                                          />
                                        </>
                                      )}
                                    />
                                  </DisplayGrid>
                                );
                            })
                          );

                        case "RADIO":
                          return (
                            <DisplayGrid
                              item
                              xs={12}
                              xl={3}
                              md={4}
                              sm={6}
                              lg={4}
                            >
                              <Controller
                                control={control}
                                testid={`asf - ${j.title}`}
                                name={`fieldFilters.${j.name}`}
                                render={({
                                  field: { value, onChange, ...rest },
                                }) => (
                                  <>
                                    <DisplayFormLabel
                                      filled={rest.value ? true : false}
                                      classes={{ root: classes.label }}
                                    >
                                      {j.title}
                                    </DisplayFormLabel>
                                    <DisplaySelect
                                      selectView={true}
                                      testid={`asf - ${j.name}`}
                                      labelKey={"title"}
                                      valueKey={"value"}
                                      values={j.values}
                                      MenuProps={{ style: { zIndex: 10001 } }}
                                      variant="standard"
                                      value={value ? value : false}
                                      onChange={(val) => {
                                        setValue(`fieldFilters.${j.name}`, val);
                                      }}
                                      {...rest}
                                    />
                                  </>
                                )}
                              />
                            </DisplayGrid>
                          );

                        case "REFERENCE":
                          return j.displayFields.map((l) =>
                            tabs.map((m) => {
                              if (m.split(".")[0] == j.name) {
                                let refName = l.name.split(".")[1]
                                  ? l.name.split(".")[1]
                                  : l.name;
                                if (m.split(".")[1] == refName) {
                                  return (
                                    <DisplayGrid
                                      item
                                      xs={12}
                                      xl={3}
                                      md={4}
                                      sm={6}
                                      lg={4}
                                    >
                                      <Controller
                                        control={control}
                                        name={`fieldFilters.${j.name}.${
                                          m.split(".")[1]
                                        }`}
                                        render={({
                                          field: { ref, ...rest },
                                        }) => (
                                          <>
                                            <DisplayFormLabel
                                              filled={rest.value ? true : false}
                                              classes={{ root: classes.label }}
                                            >
                                              {l.friendlyName}
                                            </DisplayFormLabel>
                                            <DisplayInput
                                              inputProps={{
                                                testid: `asf - ${j.name}.${
                                                  m.split(".")[1]
                                                }`,
                                              }}
                                              placeholder={""}
                                              inputRef={ref}
                                              onKeyDown={(event) =>
                                                handleKeyDown(event)
                                              }
                                              onClear={() =>
                                                onClear(
                                                  `fieldFilters.${j.name}.${
                                                    m.split(".")[1]
                                                  }`
                                                )
                                              }
                                              variant="standard"
                                              {...rest}
                                            />
                                          </>
                                        )}
                                      />
                                    </DisplayGrid>
                                  );
                                }
                              }
                            })
                          );

                        default:
                          let type =
                            j.type == "NUMBER" ||
                            j.type == "DECIMAL" ||
                            j.type == "CURRENCY"
                              ? "number"
                              : "string";
                          return (
                            <DisplayGrid
                              item
                              xs={12}
                              xl={3}
                              md={4}
                              sm={6}
                              lg={4}
                            >
                              <Controller
                                control={control}
                                name={`fieldFilters.${j.name}`}
                                render={({ field: { ref, ...rest } }) => {
                                  return (
                                    <>
                                      <DisplayFormLabel
                                        filled={rest.value ? true : false}
                                        classes={{ root: classes.label }}
                                      >
                                        {j.title}
                                      </DisplayFormLabel>
                                      <DisplayInput
                                        inputProps={{
                                          testid: `asf - ${j.name}`,
                                        }}
                                        type={type}
                                        inputRef={ref}
                                        onKeyDown={(event) =>
                                          handleKeyDown(event)
                                        }
                                        placeholder={""}
                                        onClear={() =>
                                          onClear(`fieldFilters.${j.name}`)
                                        }
                                        variant="standard"
                                        {...rest}
                                      />
                                    </>
                                  );
                                }}
                              />
                            </DisplayGrid>
                          );
                      }
                    })}
                  </DisplayGrid>
                  <br />
                </>
              );
            }
          })}
        </div>
      );
    else
      return (
        <div
          style={{
            display: "flex",
            flex: 3,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DisplayText
            variant="h4"
            className={classes.text}
            style={{ fontFamily: "inherit" }}
          >
            {" "}
            Filters Not Configured{" "}
          </DisplayText>
        </div>
      );
  };

  return (
    <DisplayModal
      style={{ zIndex: 10000, overflow: "hidden" }}
      open={open}
      onClose={handleClose}
      maxWidth={"md"}
      fullWidth={true}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "600px",
        }}
      >
        <div style={{ display: "flex", flex: 1 }}>{renderHeader()}</div>
        <div style={{ display: "flex", flex: 11, contain: "strict" }}>
          {renderBody()}
        </div>
      </div>
    </DisplayModal>
  );
};

export default AdvanceSearch;

export const AdvancedDateFilter = ({
  value,
  classes,
  rest,
  j,
  setValue,
  years,
}) => {
  const [monthVal, setMonthVal] = useState(0);
  const [yearVal, setYearVal] = useState(0);
  const [dayVal, setDayVal] = useState(0);
  let dayMasterData = [];
  for (let i = 1; i < 32; i++) {
    dayMasterData.push({ id: i < 10 ? "0" + i : i, value: i });
  }
  useEffect(() => {
    if (
      value &&
      value != "0,0,0" &&
      monthVal == 0 &&
      yearVal == 0 &&
      dayVal == 0
    ) {
      let getSplitValue = value.split(",");
      if (getSplitValue.length == 3) {
        setMonthVal(getSplitValue[0]);
        setDayVal(getSplitValue[1]);
        setYearVal(getSplitValue[2]);
        setValue(`fieldFilters.${j.name}`, `${monthVal},${dayVal},${yearVal}`);
      }
    }
  }, [value]);
  const getDays = (year = new Date().getUTCFullYear(), month) => {
    return new Date(year, month, 0).getDate();
  };
  if (monthVal) {
    let noOfDays = getDays(yearVal, monthVal) + 1;
    dayMasterData = dayMasterData.filter((day) => day.id < noOfDays);
  }
  return (
    <>
      <DisplayFormLabel
        filled={value ? true : false}
        classes={{ root: classes.label }}
      >
        {j.title}
      </DisplayFormLabel>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: "1 1 0%",
          }}
        >
          <DisplaySelect
            // label={"Year"}
            selectView={true}
            labelKey={"id"}
            valueKey={"value"}
            values={
              j.years
                ? years
                : [
                    {
                      id: "2019",
                      value: "2019",
                    },
                    {
                      id: "2020",
                      value: "2020",
                    },
                    {
                      id: "2021",
                      value: "2021",
                    },
                  ]
            }
            showNone={false}
            MenuProps={{
              style: { zIndex: 10001 },
            }}
            variant="standard"
            value={yearVal}
            onChange={(value) => setYearVal(value)}
            {...rest}
          />
        </div>

        {/* &nbsp;&nbsp; */}
        <div
          style={{
            display: "flex",
            flex: "1",
          }}
        >
          <DisplaySelect
            // label={"Month"}
            selectView={true}
            labelKey={"id"}
            valueKey={"value"}
            values={[
              { id: "Jan", value: "01" },
              { id: "Feb", value: "02" },
              { id: "Mar", value: "03" },
              { id: "Apr", value: "04" },
              { id: "May", value: "05" },
              { id: "June", value: "06" },
              { id: "July", value: "07" },
              { id: "Aug", value: "08" },
              { id: "Sept", value: "09" },
              { id: "Oct", value: "10" },
              { id: "Nov", value: "11" },
              { id: "Dec", value: "12" },
            ]}
            showNone={false}
            MenuProps={{
              style: { zIndex: 10001, height: "400px" },
            }}
            value={monthVal}
            variant="standard"
            onChange={(value) => setMonthVal(value)}
            {...rest}
          />
        </div>
        <div
          style={{
            display: "flex",
            flex: "1",
          }}
        >
          <DisplaySelect
            // label={"Day"}
            selectView={true}
            labelKey={"value"}
            valueKey={"id"}
            values={dayMasterData}
            showNone={false}
            MenuProps={{
              style: { zIndex: 10001, height: "400px" },
            }}
            value={dayVal}
            variant="standard"
            onChange={(value) => setDayVal(value)}
            {...rest}
          />

          {setValue(
            `fieldFilters.${j.name}`,
            monthVal || dayVal || yearVal
              ? `${monthVal},${dayVal},${yearVal}`
              : ""
          )}
        </div>
      </div>
    </>
  );
};
