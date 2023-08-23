import React, { useEffect, useRef, useState } from "react";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { PresetFactory, UserFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import { mergeApprovalSection } from "utils/services/helper_services/system_methods";
import { ContainerWrapper } from "components/wrapper_components/container";
import { ErrorFallback } from "components/helper_components/error_handling/error_fallback";
import { DisplayProgress, DisplayText } from "components/display_components";

export const DetailWrapper = (props) => {
  const { Component, Skeleton, ...rest } = props;
  const {
    appname,
    entityname: groupname,
    id,
    mode,
    modulename,
    path,
    summaryMode,
    PAGELAYOUT,
    isAutoPopulate,
    populatedData,
    clicked = "prescribedMedication",
  } = rest;
  //Factory Services
  const { getByAgencyId, getByGroupName, getRoleBasedTemplate } =
    PresetFactory();
  const {
    checkDataAccess,
    checkWriteAccess,
    isNJAdmin,
    isRoleBasedLayout,
    getId,
  } = UserFactory();
  const prevId = useRef(id);
  //Local State
  const [detailData, setDetailData] = useState();
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  //Custom Functions
  const auditsTemplate = async (template, entityData) => {
    let {
      appName: appname,
      moduleName: modulename,
      groupName: groupname,
    } = entityData.sys_entityAttributes;
    let auditMeta = await entityTemplate.get({
      appname,
      modulename,
      groupname,
    });
    !auditMeta.error &&
      template.sys_entityAttributes.sys_topLevel.push(
        ...auditMeta.sys_entityAttributes.sys_topLevel
      );
  };

  const getPopulateValues = (childMeta, path, data) => {
    if (populatedData) return populatedData;
    else {
      if (Object.keys(childMeta).length) {
        let parentField = childMeta.sys_entityAttributes.sys_topLevel.find(
          (e) => e.name === path.split(".")[1]
        );
        let referenceObj = {};
        if (Object.keys(parentField).length) {
          let { sys_entityAttributes } = data;

          if (Object.keys(parentField).length)
            parentField.displayFields.map((e) => {
              referenceObj[e.name] = sys_entityAttributes[e.name];
            });
          data["sys_entityAttributes"][path.split(".")[1]] = {
            ...referenceObj,
            id: data._id,
            sys_gUid: data.sys_gUid,
          };
          return data;
        }
      } else return {};
    }
  };

  const initContainer = () => {
    if (appname && modulename && groupname && mode) {
      setLoading(true);
      setError(false);
      setDenied(false);
      let fetchData = async () => {
        let data = {},
          metadata = null,
          entityType;
        let baseTemplate = getByGroupName(groupname);

        if (summaryMode) {
          data = id
            ? await entity.get({
                appname,
                modulename,
                entityname: groupname,
                id,
              })
            : await new Promise((res) =>
                setTimeout(() => {
                  return res({});
                }, 1000)
              );

          if (["new", "clone"].includes(mode)) {
            metadata = getByGroupName(groupname);
          } else if (
            isRoleBasedLayout(appname, modulename, groupname) &&
            !isNJAdmin()
          ) {
            if (data && data.sys_userId) {
              if (getId == data.sys_userId)
                metadata = getByGroupName(groupname);
              else
                metadata = await entityTemplate.get({
                  appname,
                  modulename,
                  groupname,
                  sys_userId: data.sys_userId,
                });
            } else {
              metadata = getRoleBasedTemplate(groupname, data.sys_templateName);
            }
          } else if (data.sys_agencyId)
            metadata = getByAgencyId(groupname, data.sys_agencyId);

          let metaParams = {
            appname,
            modulename,
            groupname,
          };
          if (PAGELAYOUT)
            metaParams = {
              ...metaParams,
              templatename: PAGELAYOUT,
            };

          if (!metadata) metadata = await entityTemplate.get({ ...metaParams });

          //Approvals
          entityType = get(metadata, "sys_entityAttributes.sys_entityType");
          if (entityType && entityType === "Approval")
            metadata = mergeApprovalSection(baseTemplate, metadata);
        } else {
          let metaParams = {
            appname,
            modulename,
            groupname,
          };
          if (PAGELAYOUT)
            metaParams = {
              ...metaParams,
              templatename: PAGELAYOUT,
            };
          if (groupname === "Medication") {
            if (mode != "new") {
              data = await entity.get({
                appname,
                modulename,
                entityname: groupname,
                id,
              });
              if (
                data?.sys_entityAttributes?.medicationType
                  ?.replace(/\s/g, "")
                  .toUpperCase() === "OTCMEDICATION"
              )
                metaParams = { ...metaParams, templatename: "OTCMedication" };
            } else {
              if (clicked == "OTCMedication")
                metaParams = { ...metaParams, templatename: "OTCMedication" };
            }
            metadata = await entityTemplate.get({ ...metaParams });
          } else {
            [metadata, data] = await Promise.all([
              entityTemplate.get({ ...metaParams }),
              id
                ? entity.get({ appname, modulename, entityname: groupname, id })
                : {},
            ]);
          }
          if (populatedData) data = populatedData;
        }

        groupname === "Audits" &&
          data &&
          (await auditsTemplate(metadata, data));

        if (isAutoPopulate && mode === "new") {
          data = getPopulateValues(metadata, path, props.parentInfo);
        }
        setDetailData({ metadata, data });
        validate(data, metadata);
        setLoading(false);
      };
      fetchData();
    }
  };

  const handleLoadingSkeleton = (value, dataFetch) => {
    setLoading(value);
    if (dataFetch) {
      initContainer();
      props.setReload && props.setReload(true);
    }
  };

  const validate = (data, metadata) => {
    if (data && mode) {
      if (!["edit", "read", "clone", "new"].includes(mode)) setError(true);
      else if (!isNJAdmin() && ["edit", "new"].includes(mode)) {
        if (id && data && typeof data !== "string") {
          if (
            checkDataAccess({
              appname,
              modulename,
              entityname: groupname,
              permissionType: "write",
              data,
              metadata: getByGroupName(groupname)
                ? getByGroupName(groupname)
                : metadata,
            })
          )
            setLoading(false);
          else setDenied(true);
        } else if (!id && mode === "new") {
          if (
            checkWriteAccess({
              appname,
              modulename,
              entityname: groupname,
            })
          )
            setLoading(false);
          else setDenied(true);
        } else setError(true);
      } else setLoading(false);
    }
  };

  //useEffects
  useEffect(() => {
    initContainer();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      mounted &&
      !(id && ["read", "edit"].includes(mode) && id == prevId.current)
    )
      initContainer();
    if (!id || (id && prevId.current !== id)) prevId.current = id;
  }, [appname, modulename, groupname, mode, id]);

  //Render
  if (error || denied) {
    return (
      <div style={{ display: "flex", flex: 1, contain: "strict" }}>
        <ErrorFallback
          slug={denied ? "permission_denied" : "something_went_wrong"}
        />
      </div>
    );
  } else if (loading) {
    return Skeleton ? (
      <Skeleton />
    ) : (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <DisplayProgress />
        <br />
        <DisplayText style={{ color: "#666666" }}>Loading...</DisplayText>
      </div>
    );
  } else {
    return (
      <ContainerWrapper style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <Component
          {...detailData}
          {...rest}
          setDetailData={setDetailData}
          handleLoadingSkeleton={handleLoadingSkeleton}
          baseTemplate={getByGroupName(groupname)}
        />
      </ContainerWrapper>
    );
  }
};
