import React, { useState, useEffect } from "react";
import {
  DisplayTable,
  DisplayProgress,
  DisplayModal,
} from "components/display_components";
import { ContainerWrapper } from "components/wrapper_components/container";
import {
  entityCount,
  childEntity,
} from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { DetailContainer } from "containers/composite_containers/detail_container";
import { ErrorFallback } from "components/helper_components";

const Audits = (props) => {
  const { metadata, id, appname, modulename, entityname } = props;
  const params = {
    appname: appname,
    modulename: modulename,
    entityname: entityname,
    childentity: "Audits",
    id,
  };

  const childParams = {
    appname: "NueGov",
    modulename: "Admin",
    entityname: "Audits",
  };

  const filterPath = "entity.id";

  const ITEMS_PER_PAGE = 100;

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState();
  const [totalCount, setCount] = useState(0);
  const [showDetail, setDetail] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [options, setOptions] = useState({ limit: ITEMS_PER_PAGE, skip: 0 });
  const [page, setPage] = useState(0);
  const [progress, setProgress] = useState(false);
  const [error, setError] = useState({ status: false, msg: "no_result" });

  const getColumns = (parentMeta) => {
    try {
      let toplevel = [
        ...parentMeta.sys_entityAttributes.sys_topLevel.filter((e) => e.audit),
        ...metadata.sys_entityAttributes.sys_topLevel,
      ].filter((obj) => obj.audit || obj.audit !== false);
      let headers = toplevel.map((head) => {
        return {
          id: head.name,
          numeric: head.type == "NUMBER" ? true : false,
          disablePadding: false,
          label: head.title,
          fieldMeta: head,
        };
      });
      return headers;
    } catch (e) {
      console.log({ e });
    }
  };

  const getRows = (data) => {
    if (data.length) {
      return data.map((val) => {
        return {
          id: val._id,
          data: val.sys_entityAttributes,
          opData: val.opData,
        };
      });
    } else {
      setError({ status: true, msg: "no_result" });
      return [];
    }
  };

  const handlePageChange = async (event, value) => {
    setProgress(true);
    setError(false);
    let skip = ITEMS_PER_PAGE * (value - 1);
    try {
      let result = await childEntity.get({
        ...params,
        ...options,
        limit: ITEMS_PER_PAGE,
        skip: skip,
      });
      setRows(getRows(result));
      setPage(value);
      setOptions({ ...options, skip: skip });
      setProgress(false);
    } catch (e) {
      setProgress(false);
      setError({ status: true, msg: "something_went_wrong" });
    }
  };

  const handleSort = async (sortby, orderby) => {
    setProgress(true);
    setError(false);
    try {
      let opt = { ...options, sortby, orderby };
      setOptions(opt);
      let result = await childEntity.get({ ...params, ...opt });
      setRows(getRows(result));
      setProgress(false);
    } catch (e) {
      setError({ status: true, msg: "something_went_wrong" });
      setProgress(false);
    }
  };

  const init = async () => {
    setLoading(true);
    setError(false);
    try {
      let [meta, childData, count] = await Promise.all([
        entityTemplate.get({
          appname: "NueGov",
          modulename: "Admin",
          groupname: "Audits",
        }),
        childEntity.get({
          ...params,
          limit: options["limit"],
          skip: options["skip"],
        }),
        entityCount.get({
          ...childParams,
          [filterPath]: id,
          limit: 0,
          skip: 0,
        }),
      ]);
      setColumns(getColumns(meta));
      setRows(getRows(childData));
      setCount(count.data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError({ status: true, msg: "something_went_wrong" });
    }
  };

  const onClickRow = (id) => {
    setDetail(true);
    setSelectedId(id);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <ContainerWrapper>
      <div style={{ display: "flex", flex: 1, flexGrow: 1, contain: "strict" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DisplayProgress />
          </div>
        ) : rows.length ? (
          <DisplayTable
            values={{
              title: "Audits",
              columns,
              rows,
              params,
              totalCount,
              page,
              rowsPerPage: options["limit"],
            }}
            methods={{ onClickRow, handlePageChange, handleSort }}
            options={{
              hidePaddingSwitch: true,
              hideEmptyRows: true,
              hideCheckBox: true,
              disableSort: false,
              progress,
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ErrorFallback slug={error["msg"]} />
          </div>
        )}
      </div>
      <DisplayModal open={showDetail} fullWidth={true} maxWidth="xl">
        <div
          style={{ height: "85vh", width: "100%", display: "flex", flex: 1 }}
        >
          <ContainerWrapper>
            <div style={{ height: "98%", width: "98%", padding: "1%" }}>
              <DetailContainer
                appname={childParams["appname"]}
                modulename={childParams["modulename"]}
                groupname={childParams["entityname"]}
                mode="read"
                options={{
                  hideTitleBar: true,
                  hideNavButtons: true,
                }}
                id={selectedId}
                responseCallback={(e) => setDetail(false)}
                onClose={(e) => setDetail(false)}
              />
            </div>
          </ContainerWrapper>
        </div>
      </DisplayModal>
    </ContainerWrapper>
  );
};

export default Audits;
