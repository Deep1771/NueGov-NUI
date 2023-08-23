import React, { useEffect, useState, useRef } from "react";
import {
  DisplayButton,
  DisplayCheckbox,
  DisplayEditor,
  DisplayText,
} from "components/display_components";
import { BubbleLoader } from "components/helper_components";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { entity } from "utils/services/api_services/entity_service";
import { slug } from "utils/services/api_services/slug_service";
import { get } from "utils/services/helper_services/object_methods";
import { AgencyFilter } from "components/helper_components/advance_search/agencyFilter";

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const JsonTool = (props) => {
  let { metadata, id, type, ...restParams } = props;
  let { appname, modulename, groupname } = restParams;
  let jsontype = type || "jsonTool";
  let tool = metadata.sys_entityAttributes[jsontype];
  let { dataSource, sourceInfo, label, dataFiltering } = tool;

  const [agencyFilter, setAgencyFilter] = useState([]);
  const [data, setData] = useState();
  const [filterData, setFilter] = useState();
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const { setSnackBar } = GlobalFactory();
  const { getAgencyId, getUserInfo, isNJAdmin, isSharedAgency, isSubAgency } =
    UserFactory();
  const { id: USER_ID } = getUserInfo();
  const editorRef = useRef(null);
  let TIMEOUT = null;

  const toggleCheckBox = () => setFilter(!filterData);

  const copyFeed = () => {
    if (editorRef.current) {
      let { editor } = editorRef.current;
      editor.selectAll();
      editor.focus();
      document.execCommand("copy");
      setSnackBar({ message: "Copied to clipboard", severity: "info" });
      editor.clearSelection();
    }
  };

  const getURL = () => {
    window.open(url, "_blank");
  };

  const copyURL = () => {
    var r = document.createRange();
    r.selectNode(document.getElementById("api-url"));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    setSnackBar({ message: "Copied to clipboard", severity: "info" });
  };

  const queryToUrl = (params) =>
    Object.keys(params || {})
      .map((key) => key + "=" + params[key])
      .join("&");

  const getEntityData = async () => {
    let {
      appName,
      moduleName,
      entityName,
      limit = 1000,
      skip = 0,
    } = sourceInfo;

    //set url
    let url = `${BASE_URL}/napi/api/${appName}/${moduleName}/${entityName}?limit=${limit}&skip=${skip}`;
    setUrl(url);

    //set data
    try {
      let data = await entity.get({
        appname: appName,
        modulename: moduleName,
        entityname: entityName,
        skip,
        limit,
      });
      return data;
    } catch (e) {
      return {};
    }
  };

  const getFromCustomAPI = async () => {
    let { url } = sourceInfo;
    setUrl(url);
    try {
      let response = await fetch(url);
      let data = await response.json();
      return data;
    } catch (e) {
      return {};
    }
  };

  const getDataFromSlug = async () => {
    let { slug: SLUG } = sourceInfo;
    let connector = "?";
    // setUrl(url);
    let params = { slug: SLUG };
    let queryParams = {};
    if (!isNJAdmin()) queryParams.agencyid = getAgencyId;
    if (filterData && id) queryParams.id = id;
    if (agencyFilter.length) queryParams.agencyFilter = agencyFilter;
    //set url
    if (SLUG.includes("?")) connector = "&";
    if (!Object.keys(queryParams).length) connector = "";

    let url = `${BASE_URL}${SLUG}${connector}appname=${appname}&modulename=${modulename}&groupname=${groupname}&userid=${USER_ID}&${queryToUrl(
      queryParams
    )}`;
    setUrl(url);

    //get data
    try {
      let data = await slug.get({
        ...params,
        ...queryParams,
        userid: USER_ID,
        ...restParams,
      });
      return data || {};
    } catch (e) {
      return {};
    }
  };

  const handleAgencySelect = (text, agencies) => {
    setAgencyFilter(agencies);
  };

  const init = async () => {
    let { dataPath } = sourceInfo;
    let data;
    if (dataSource === "ENTITY") {
      data = await getEntityData();
    } else if (dataSource === "CUSTOM") {
      data = await getFromCustomAPI();
    } else if (dataSource === "SLUG") {
      data = await getDataFromSlug();
    }

    if (dataPath) {
      data = get(data, dataPath, {});
    }

    setData(data);
  };

  useEffect(() => {
    if (filterData !== null) {
      setData();
      init();
    }
  }, [filterData]);

  useEffect(() => {
    if (mounted) {
      clearTimeout(TIMEOUT);
      setData();
      TIMEOUT = setTimeout(() => {
        init();
      }, 1500);
    }
  }, [agencyFilter]);

  useEffect(() => {
    setData();
    init();
    setMounted(true);
  }, [jsontype]);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
      }}
    >
      <br />
      <div
        style={{
          display: "flex",
          width: "99%",
          height: "50px",
          flexDirection: "row",
          alignItems: "center",
          border: "1px solid #c2c4c5",
        }}
      >
        <div style={{ display: "flex", flexShrink: 1, margin: "10px" }}>
          <DisplayButton
            variant="contained"
            systemVariant="primary"
            onClick={getURL}
          >
            GET
          </DisplayButton>
        </div>
        <div style={{ display: "flex", flexGrow: 1, margin: "10px" }}>
          <DisplayText
            id="api-url"
            variant="body1"
            style={{ wordBreak: "break-all" }}
          >
            {url}
          </DisplayText>
        </div>
        <div
          style={{
            display: "flex",
            flexShrink: 1,
            margin: "10px",
            alignItems: "center",
            justifyContent: "flex-end",
            width: "250px",
          }}
        >
          <DisplayText variant="body1">{label}</DisplayText>{" "}
          &nbsp;&nbsp;&nbsp;&nbsp;
          <DisplayButton variant="outlined" onClick={copyURL}>
            Copy
          </DisplayButton>
        </div>
      </div>
      <br />
      <div
        style={{
          display: "flex",
          width: "99%",
          height: "99%",
          position: "relative",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: dataFiltering && id ? "flex" : "none",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "0px 0px 15px 0px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "300px",
              visibility:
                isSharedAgency() || isSubAgency() ? "visible" : "hidden",
            }}
          >
            <AgencyFilter
              testid="asf-agencies"
              setValue={handleAgencySelect}
              selectedAgencies={[]}
              value={agencyFilter}
              filled={agencyFilter}
            />
          </div>
          <div style={{ display: "flex", width: "auto" }}>
            <DisplayCheckbox
              label={"Filter current data"}
              onChange={toggleCheckBox}
              checked={!!filterData}
              disabled={!data}
            />
            <DisplayButton
              disabled={!data}
              variant="outlined"
              onClick={copyFeed}
            >
              Copy
            </DisplayButton>
          </div>
        </div>
        <DisplayEditor
          value={JSON.stringify(data, null, 4)}
          mode="json"
          onChange={() => {}}
          wrapEnabled={true}
          id="feed-editor"
          ref={editorRef}
          disable={true}
          errors={[]}
        />

        {!data && (
          <div style={{ height: "100%", width: "100%", position: "absolute" }}>
            <BubbleLoader />
          </div>
        )}
      </div>
    </div>
  );
};
