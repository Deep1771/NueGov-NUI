import React, { useEffect, useState } from "react";
import { useStateValue } from "utils/store/contexts";
import { Fade } from "@material-ui/core";
import { FiltersFactory, GlobalFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import {
  DisplayCard,
  DisplayDialog,
  DisplayGrid,
  DisplayIconButton,
  DisplayText,
  DisplayButton,
} from "components/display_components";
import { Banner, BubbleLoader } from "components/helper_components";
import { SystemIcons } from "utils/icons";

export const EntityFilters = (props) => {
  const {
    entityName,
    cardHandler,
    handleSearch,
    createNewHandler,
    activeFilter,
    resetActiveFilter,
  } = props;
  const [{ filtersState }, dispatch] = useStateValue();
  const { userDefault, entityFilters } = filtersState;
  const {
    deleteFilter,
    fetchPredefinedFilters,
    makeDefaultFilter,
    removeDefaultFilter,
  } = FiltersFactory();
  const { getAllData } = GlobalFactory();

  const [dialog, setDialog] = useState({ dialog: false });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(
    Object.keys(activeFilter).length ? activeFilter._id : null
  );

  const { CheckCircleOutline, DeleteTwoTone, RadioOutlined } = SystemIcons;

  let defaultObj = userDefault.find((ef) => {
    let sys_groupName = get(
      ef,
      "sys_entityAttributes.entityName.sys_groupName"
    );
    return sys_groupName === entityName;
  });

  let getDefaultFilterID = defaultObj ? defaultObj._id : undefined;

  const init = async () => {
    const filtersSet = new Set();
    let userFilters = await getAllData({
      entityname: "EntityFilter",
      "entityName.sys_groupName": entityName,
    });
    let predefinedFilters = fetchPredefinedFilters(entityName);

    let allData = [...userFilters, ...predefinedFilters].filter(
      (eachFilter) => {
        const duplicate = filtersSet.has(eachFilter._id);
        filtersSet.add(eachFilter._id);
        return !duplicate;
      }
    );
    dispatch({ type: "SET_ENTITY_FILTERS", payload: allData });
    setLoading(false);
  };

  const defaultHandler = (e, eachFilter, isDefault) => {
    e.stopPropagation();
    isDefault
      ? removeDefaultFilter(entityName, eachFilter._id)
      : makeDefaultFilter(entityName, eachFilter);
  };

  const onCardClick = (isActive, eachFilter) => {
    isActive ? setSelected(null) : setSelected(eachFilter._id);
    isActive ? createNewHandler() : cardHandler(eachFilter);
  };

  const onCreateClick = () => {
    setSelected(null);
    createNewHandler();
  };

  const deleteHandler = (filterId, isActive) => {
    deleteFilter(filterId, entityName);
    setDialog({ dialog: false });
    if (isActive) createNewHandler();
    if (filterId === activeFilter._id) {
      resetActiveFilter();
    }
  };

  const openSaveDialog = (filterId, isActive) => {
    let saveModal = {
      dialog: true,
      title: "Sure to delete ?",
      msg: "Saved filter will be deleted, it cannot be undone",
      confirmLabel: "YES",
      onConfirm: () => deleteHandler(filterId, isActive),
    };
    setDialog(saveModal);
  };

  const onDeleteClick = (e, filterId, isActive) => {
    e.stopPropagation();
    openSaveDialog(filterId, isActive);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (activeFilter && Object.keys(activeFilter).length)
      setSelected(activeFilter._id);
  }, [activeFilter]);

  const renderEntityFilters = () => (
    <Fade in={entityFilters.length} timeout={1500}>
      <div
        style={{
          display: "flex",
          flex: 1,
          contain: "strict",
          overflowY: "auto",
          padding: "5px",
        }}
      >
        <DisplayGrid
          container
          spacing={1}
          style={{ alignContent: "flex-start" }}
        >
          {entityFilters.map((eachFilter, i) => {
            const {
              filters,
              filterName,
              default: agencyDefault,
            } = eachFilter.sys_entityAttributes;
            const isDefault = getDefaultFilterID === eachFilter._id;
            const isActive = selected === eachFilter._id;
            const isAgencyFilter = agencyDefault === "Yes" ? true : false;
            return (
              <DisplayGrid
                item
                xs={12}
                key={i}
                style={{ height: "100px", display: "flex" }}
              >
                <DisplayCard
                  testid={`asf-filters-${filterName}`}
                  onClick={() => onCardClick(isActive, eachFilter)}
                  systemVariant={isActive ? "primary" : "default"}
                  raised
                  style={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", flex: 1 }}>
                    <div
                      style={{
                        flex: 8,
                        padding: "10px 0px 0px 10px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        contain: "strict",
                      }}
                    >
                      <DisplayText
                        style={{ fontWeight: "400", fontSize: "14px" }}
                      >
                        {" "}
                        {filterName}{" "}
                      </DisplayText>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flex: 2,
                        justifyContent: "flex-end",
                      }}
                    >
                      <DisplayIconButton
                        testid="asf-filterDefault"
                        onClick={(e) =>
                          defaultHandler(e, eachFilter, isDefault)
                        }
                        systemVariant={isActive ? "default" : "primary"}
                      >
                        {isDefault ? (
                          <CheckCircleOutline
                            testid="asf-checkeDefault"
                            style={{ fontSize: "16px" }}
                          />
                        ) : (
                          <RadioOutlined style={{ fontSize: "16px" }} />
                        )}
                      </DisplayIconButton>
                    </div>
                  </div>

                  <div style={{ display: "flex", flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        flex: 2,
                        flexDirection: "row",
                        justifyContent: "flex-start",
                      }}
                    >
                      <DisplayButton
                        testid="asf-filterAppy&Search"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSearch(filters, eachFilter);
                        }}
                        systemVariant={isActive ? "default" : "primary"}
                        style={{ fontSize: "16px" }}
                      >
                        <DisplayText style={{ fontSize: "14px" }}>
                          Apply & Search{" "}
                        </DisplayText>
                      </DisplayButton>
                    </div>
                    {!isAgencyFilter && !isDefault && (
                      <div
                        style={{
                          display: "flex",
                          flex: 1,
                          flexDirection: "row-reverse",
                          justifyContent: "flex-start",
                        }}
                      >
                        <DisplayIconButton
                          testid="asf-filterDelete"
                          onClick={(e) =>
                            onDeleteClick(e, eachFilter._id, isActive)
                          }
                          systemVariant={isActive ? "default" : "primary"}
                        >
                          <DeleteTwoTone style={{ fontSize: "16px" }} />
                        </DisplayIconButton>
                      </div>
                    )}
                  </div>
                </DisplayCard>
                <DisplayDialog
                  testid={`asf-${filterName}`}
                  open={dialog.dialog}
                  title={dialog.title}
                  message={dialog.msg}
                  confirmLabel={dialog.confirmLabel}
                  onConfirm={dialog.onConfirm}
                  onCancel={() => {
                    setDialog({ dialog: false });
                  }}
                  style={{ zIndex: 10010 }}
                />
              </DisplayGrid>
            );
          })}
        </DisplayGrid>
      </div>
    </Fade>
  );

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 11 }}>
        {loading ? (
          <BubbleLoader />
        ) : (
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            {entityFilters.length ? (
              renderEntityFilters()
            ) : (
              <Banner
                src="https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/nodatafound.png"
                iconSize="150px"
              />
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flex: 1, padding: "5px 0px" }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "flex-end",
            backgroundColor: "#f2f2f2",
          }}
        >
          <DisplayButton
            testid="asf-createFilter"
            onClick={() => onCreateClick()}
          >
            {" "}
            Create New{" "}
          </DisplayButton>
        </div>
      </div>
    </div>
  );
};
