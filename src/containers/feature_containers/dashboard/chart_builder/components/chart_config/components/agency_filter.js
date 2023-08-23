import React, { useEffect, useState } from "react";
import sortBy from "lodash/sortBy";
import { User } from "utils/services/factory_services/user_service";
import { makeStyles } from "@material-ui/core/styles";
import {
  DisplayButton,
  DisplayCheckbox,
  DisplayChips,
  DisplayFormGroup,
  DisplayGrid,
  DisplayModal,
  DisplayText,
} from "components/display_components";

const useStyles = makeStyles(() => ({
  card: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f5f5f5",
  },
  heading: {
    fontFamily: "Roboto",
    fontSize: "16px",
    color: "#666666",
  },
}));

const AgencyFilter = (props) => {
  let { attributes, storevalue } = props;
  const {
    getAgencyName,
    getAgencyId,
    getSharedAgencies,
    getSubAgencies,
    isNJAdmin,
  } = User();
  const { parent, child, sibling } = getSubAgencies || {};
  //state
  const [mounted, setMounted] = useState(false);
  const [showList, setShowList] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  //local Vars
  const classes = useStyles();
  let subAgencies = [
    ...(parent ? parent : []),
    ...(child ? child : []),
    ...(sibling ? sibling : []),
  ];
  let sharedAgencies = getSharedAgencies ? getSharedAgencies : [];
  let allAgencies = [];

  if (!isNJAdmin()) {
    let agencyInfo = {
      _id: getAgencyId,
      sys_entityAttributes: { Name: getAgencyName() },
    };
    allAgencies = [
      agencyInfo,
      ...subAgencies,
      ...(getSharedAgencies ? getSharedAgencies : []),
    ];
  }

  //Decl
  const checkSelected = (val) =>
    selectedItems && selectedItems.some((a) => a == val);
  const findValueIndex = (val) => selectedItems.findIndex((a) => a == val);
  const arrange = (o) => o.sys_entityAttributes.Name;

  //sorting
  subAgencies = sortBy(subAgencies, [arrange]);
  sharedAgencies = sortBy(sharedAgencies, [arrange]);

  //Custom functions
  const handleDelete = (agencyId) => {
    let items = storevalue.filter((id) => id != agencyId);
    props.handleInputChanges({
      value: items.length ? items : null,
      attributes,
    });
  };

  const handleChange = (flag, val) => {
    let arr = [];
    if (!flag) {
      arr = [...(selectedItems ? selectedItems : [])];
      arr.splice(findValueIndex(val), 1);
    } else {
      if (!selectedItems || !selectedItems.length) arr = [getAgencyId];
      arr = [...arr, ...(selectedItems ? selectedItems : []), val];
    }
    setSelectedItems([...arr]);
  };

  const init = () => {
    if (!isNJAdmin()) {
      storevalue = storevalue
        ? storevalue.filter((sa) => allAgencies.some((ea) => ea._id == sa))
        : [];
      setSelectedItems([...storevalue]);
    }
  };

  const openModal = () => {
    setSelectedItems(storevalue ? storevalue : []);
    setShowList(true);
  };

  useEffect(() => {
    mounted && init();
  }, [storevalue]);

  useEffect(() => {
    init();
    setMounted(true);
  }, []);

  if (isNJAdmin()) return null;
  else
    return (
      <>
        <div className={classes.card}>
          <DisplayFormGroup row>
            {storevalue &&
              storevalue.map((agency, i) => (
                <div style={{ margin: "1px" }}>
                  <DisplayChips
                    clickable={false}
                    systemVariant="primary"
                    onDelete={() => {
                      handleDelete(agency);
                    }}
                    label={
                      allAgencies.find((ea) => ea._id === agency)
                        .sys_entityAttributes.Name
                    }
                  ></DisplayChips>
                </div>
              ))}
          </DisplayFormGroup>
        </div>
        <DisplayButton
          variant="outlined"
          style={{
            alignSelf: "flex-end",
            margin: "15px 0px 5px 0px",
            width: "100%",
          }}
          color="primary"
          onClick={openModal}
        >
          + {attributes.title}
        </DisplayButton>
        <div className={classes.card}>
          <DisplayModal
            open={showList}
            onClose={() => setShowList(false)}
            maxWidth="md"
          >
            <div
              className={classes.card}
              style={{ height: "600px", width: "900px" }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  padding: "15px 20px",
                  overflowY: "auto",
                }}
              >
                <DisplayGrid container>
                  <DisplayCheckbox
                    disabled={!selectedItems || !selectedItems.length}
                    checked={
                      !selectedItems ||
                      !selectedItems.length ||
                      checkSelected(getAgencyId)
                    }
                    key={getAgencyId}
                    label={"Your Agency ( default )"}
                    onChange={(value) => {
                      handleChange(value, getAgencyId);
                    }}
                  />
                </DisplayGrid>
                {sharedAgencies.length > 0 && (
                  <>
                    <DisplayGrid container>
                      <DisplayText>Shared Agencies</DisplayText>
                    </DisplayGrid>
                    <DisplayGrid container>
                      {sharedAgencies.map((agency, i) => (
                        <DisplayGrid item xs={6}>
                          <DisplayCheckbox
                            checked={checkSelected(agency._id)}
                            key={agency._id}
                            label={agency.sys_entityAttributes.Name}
                            onChange={(value) => {
                              handleChange(value, agency._id);
                            }}
                          />
                        </DisplayGrid>
                      ))}
                    </DisplayGrid>
                  </>
                )}
                {subAgencies.length > 0 && (
                  <DisplayGrid container>
                    <DisplayGrid container>
                      <DisplayText>Sub Agencies</DisplayText>
                    </DisplayGrid>
                    {subAgencies.map((agency, i) => (
                      <DisplayGrid item xs={6}>
                        <DisplayCheckbox
                          checked={checkSelected(agency._id)}
                          key={agency._id}
                          label={agency.sys_entityAttributes.Name}
                          onChange={(value) => {
                            handleChange(value, agency._id);
                          }}
                        />
                      </DisplayGrid>
                    ))}
                  </DisplayGrid>
                )}
              </div>
              <div style={{ display: "flex", flexShrink: 1 }}>
                <DisplayGrid
                  container
                  justify="flex-end"
                  style={{ padding: "15px" }}
                >
                  <DisplayButton
                    onClick={() => setShowList(false)}
                    size="medium"
                  >
                    Close
                  </DisplayButton>
                  <DisplayButton
                    onClick={() => {
                      setShowList(false);
                      props.handleInputChanges({
                        value: selectedItems.length ? selectedItems : null,
                        attributes,
                      });
                    }}
                    size="medium"
                  >
                    Apply
                  </DisplayButton>
                </DisplayGrid>
              </div>
            </div>
          </DisplayModal>
        </div>
      </>
    );
};

export default AgencyFilter;
