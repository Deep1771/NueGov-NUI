import React, { useState, useEffect } from "react";
import { style } from "./style";
import { useStateValue } from "utils/store/contexts";
import ActionCard from "./components/actionCard";
import {
  DisplayModal,
  DisplayText,
  DisplayButton,
  DisplayGrid,
  DisplayProgress,
} from "components/display_components";
import { entityTemplate } from "utils/services/api_services/template_service";
import { entity } from "utils/services/api_services/entity_service";
import { syncGetEvents } from "utils/services/api_services/sync_services";
import { DetailPage } from "containers/composite_containers/detail_container/components/detail_page";
import {
  DisplaySnackbar,
  DisplaySearchBar,
  DisplayPagination,
} from "components/display_components";
import { Toolbar } from "@material-ui/core";
import PostAddIcon from "@material-ui/icons/PostAdd";
import { makeStyles } from "@material-ui/core/styles";
import { SystemIcons } from "utils/icons";
import { ContainerWrapper } from "components/wrapper_components";
import { Banner } from "components/helper_components";
const ActionItems = (props) => {
  const { refData, securityParams, callbackClose } = props;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("read");
  const [isLoading, setLoading] = useState(false);
  const [template, setTemplate] = useState(false);
  const [data, setData] = useState({});
  const [actionItems, setActionItems] = useState([]);
  const [actionCount, setActionCount] = useState();
  const [search, setSearchString] = useState("");
  const [options, setOptions] = useState({ limit: 10, skip: 0 });
  const [currentPage, setCurrent] = useState(1);
  const { Close } = SystemIcons;
  const [{ userState }] = useStateValue();
  const getUserCreds = (userInfo) => {
    try {
      let { userData } = userInfo;
      let roleIds = [];
      if (userData.sys_entityAttributes.roleName) {
        roleIds.push(userData.sys_entityAttributes.roleName.sys_gUid);
      }
      return { ids: roleIds.flat(), sys_gUid: userData.sys_gUid };
    } catch (e) {}
  };
  const useStyles = makeStyles((theme) => ({
    margin: {
      marginRight: theme.spacing(3),
      minWidth: theme.spacing(3),
    },
  }));
  const classes = useStyles();
  let getAllData = (userInfo) => {
    setLoading(true);
    let params = {
      appname: "Features",
      modulename: "Calendar",
      entityname: "ActionItem",
      ids: JSON.stringify(userInfo.ids),
      isNotification: false,
      invitationModal: false,
      // ...options
    };
    if (refData) {
      params["isRelated"] = true;
      params["refId"] = JSON.stringify([refData.id]);
    }

    //for action data
    let dataparams = { ...params, ...options };
    syncGetEvents.query(dataparams).then((r) => {
      setActionItems(r);
      setLoading(false);
    });

    // for action count
    let { limit, skip, ...rest } = options;
    let countParam = { ...params, getActionCount: true, ...rest };
    syncGetEvents.query(countParam).then((r) => {
      setActionCount(r.totalCount);
    });
  };
  useEffect(() => {
    entityTemplate
      .get({
        appname: "Features",
        modulename: "Calendar",
        groupname: "ActionItem",
      })
      .then((r) => {
        setTemplate(r);
      });
    getAllData(getUserCreds(userState));
  }, []);
  useEffect(() => {
    getAllData(getUserCreds(userState));
  }, [options]);
  let closeModal = () => {
    setOpen(false);
  };
  let showDetails = async (actionItemId) => {
    let data = await entity.get({
      appname: "Features",
      modulename: "Calendar",
      entityname: "ActionItem",
      id: actionItemId,
    });
    setData(data);
    setMode("read");
    setOpen(true);
  };
  const handleSearch = () => {
    setOptions({ ...options, searchString: search });
  };
  const clearSearch = () => {
    setOptions({ ...options, searchString: "" });
  };
  const handlePageChange = (event, value) => {
    let skip = options["limit"] * (value - 1);
    try {
      setCurrent(value);
      setOptions({ ...options, skip: skip });
    } catch (e) {
      console.log("Error reported in handle page change relation", e);
    }
  };
  return (
    <ContainerWrapper>
      <div style={style.main}>
        <DisplaySnackbar
          open={isLoading}
          autoHideDuration={15000}
          message={"Sync in progress"}
          onClose={() => {
            setLoading(!isLoading);
          }}
        />
        <div
          style={{
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          <Toolbar variant="dense">
            <div style={{ width: 220 }}>
              <DisplaySearchBar
                data={search}
                onClick={handleSearch}
                onChange={(val) => setSearchString(val)}
                onClear={clearSearch}
              />
            </div>
            <DisplayButton
              onClick={() => {
                setMode("new");
                setOpen(true);
                setData({
                  ...data,
                  sys_entityAttributes: {
                    ...securityParams,
                    attachedEntity: [refData],
                  },
                });
              }}
              startIcon={<PostAddIcon />}
              size="small"
              variant="text"
              display="inline"
            >
              <DisplayText>New</DisplayText>
            </DisplayButton>
            {callbackClose && (
              <DisplayButton
                onClick={() => {
                  callbackClose(false);
                }}
                startIcon={<Close />}
                variant="text"
                className={classes.margin}
                display="inline"
              >
                <DisplayText>Close</DisplayText>
              </DisplayButton>
            )}
          </Toolbar>
        </div>
        <div
          style={{
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            overflow: "hidden",
            padding: 10,
            maxHeight: "80vh",
            backgroundColor: "#ffffff",
          }}
        >
          {template && !isLoading ? (
            <div
              style={{
                display: "flex",
                flex: 1,
                flexGrow: 1,
                flexWrap: "wrap",
                overflow: "scroll",
                margin: 5,
              }}
            >
              {actionItems.length ? (
                actionItems.map((card, index) => {
                  return (
                    <ActionCard
                      key={index}
                      data={card}
                      cardMeta={template.sys_entityAttributes.app_cardContent}
                      cardWidth={275}
                      userData={userState.userData}
                      showDetail={showDetails}
                    />
                  );
                })
              ) : (
                <Banner
                  msg=""
                  src="https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/noresults.png"
                  iconSize="30%"
                  fontSize="20px"
                ></Banner>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DisplayProgress />
            </div>
          )}
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            <DisplayPagination
              totalCount={actionCount ? actionCount : 0}
              itemsPerPage={options["limit"]}
              onChange={handlePageChange}
              currentPage={currentPage}
            />
          </div>
          {template && (
            <DisplayModal
              open={open}
              maxWidth="md"
              children={
                <div
                  style={{
                    flexDirection: "column",
                    height: "85vh",
                    width: "800px",
                    display: "flex",
                    flex: 1,
                    alignSelf: "center",
                    backgroundColor: "#fafafa",
                    padding: "10px",
                  }}
                >
                  <DetailPage
                    data={data}
                    metadata={template}
                    appname="Features"
                    modulename="Calendar"
                    groupname="ActionItem"
                    mode={mode}
                    id={data._id}
                    saveCallback={() => {
                      closeModal();
                      getAllData(getUserCreds(userState));
                    }}
                    onClose={() => {
                      closeModal();
                      if (callbackClose) callbackClose(false);
                    }}
                    options={{
                      hideFooter: false,
                      hideNavbar: false,
                      hideTitlebar: false,
                      hideFeatureButtons: true,
                    }}
                    showToolbar="true"
                  />
                </div>
              }
            />
          )}
        </div>
      </div>
    </ContainerWrapper>
  );
};
export default ActionItems;
