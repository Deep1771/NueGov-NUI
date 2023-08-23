import React, { useEffect, useRef, useState } from "react";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { PresetFactory, UserFactory } from "utils/services/factory_services";
import { get } from "utils/services/helper_services/object_methods";
import { mergeApprovalSection } from "utils/services/helper_services/system_methods";
import { DetailContainerSkeleton } from "components/skeleton_components/detail_page/detail_container";
import { DetailPage } from "./components/detail_page";
import { ContainerWrapper } from "components/wrapper_components/container";
import { ErrorFallback } from "components/helper_components/error_handling/error_fallback";
import { TemplateSelector } from "./components/template_selector";
import _ from "lodash";

export const DetailContainer = (props) => {
  const {
    appname,
    groupname,
    id,
    mode,
    modulename,
    summaryMode,
    relationMode,
    onClose,
  } = props;
  //Factory Services
  const { getByAgencyId, getByGroupName, getRoleBasedTemplate } =
    PresetFactory();
  const { checkDataAccess, isNJAdmin, isRoleBasedLayout, getId, getUserInfo } =
    UserFactory();
  const { firstName, lastName, roleName, username } = getUserInfo();
  const prevId = useRef(id);
  //Local State
  const [detailData, setDetailData] = useState();
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [modalLoader, setModalLoader] = useState(false);
  const [inAppMode, setInAppMode] = useState(mode);

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
    const hasAuditMetaTopLevel =
      auditMeta?.sys_entityAttributes?.sys_topLevel?.length > 0;
    const hasTemplatePreviousTopLevel =
      template.sys_entityAttributes?.previous_topLevel?.length > 0;

    if (hasAuditMetaTopLevel && hasTemplatePreviousTopLevel) {
      template.sys_entityAttributes.sys_topLevel =
        template.sys_entityAttributes.sys_topLevel.filter((itemA) => {
          return !template.sys_entityAttributes?.previous_topLevel.some(
            (itemB) => itemA.name === itemB.name
          );
        });
      template.sys_entityAttributes.previous_topLevel = [];
    }

    const hasSysEntityAttributesTopLevel =
      auditMeta?.sys_entityAttributes?.sys_topLevel;

    if (!auditMeta.error && hasSysEntityAttributesTopLevel) {
      template.sys_entityAttributes.sys_topLevel.push(
        ...auditMeta.sys_entityAttributes.sys_topLevel
      );
    }

    const hasTemplatePreviousTopLevelProp =
      template?.sys_entityAttributes?.previous_topLevel;

    if (!hasTemplatePreviousTopLevelProp) {
      template.sys_entityAttributes.previous_topLevel = [];
    }

    if (hasSysEntityAttributesTopLevel) {
      template.sys_entityAttributes.previous_topLevel.push(
        ...auditMeta.sys_entityAttributes.sys_topLevel
      );
    }
  };

  const handleSingleUserEdit = (data) => {
    if (data instanceof Object) {
      let updateDoc = JSON.parse(JSON.stringify(data));
      if (!data?.sys_entityAttributes.hasOwnProperty("isOpen")) {
        updateDoc["sys_entityAttributes"]["isOpen"] = true;
        updateDoc["sys_entityAttributes"]["currentFormEditor"] = {
          userFriendlyName: `${firstName} ${lastName}`,
          username,
          roleName,
        };
        sessionStorage.setItem("isFormInEditing", "true");
        sessionStorage.setItem(
          "editedEntityInfo",
          JSON.stringify({
            appname,
            modulename,
            entityname: groupname,
            id: updateDoc._id,
            data: updateDoc,
          })
        );
        entity.update(
          { appname, modulename, entityname: groupname, id: data._id },
          updateDoc
        );
      }
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
              if (getId !== data.sys_userId) {
                metadata = getByGroupName(groupname);
              } else {
                metadata = await entityTemplate.get({
                  appname,
                  modulename,
                  groupname,
                  sys_userId: data.sys_userId,
                });
              }
            } else {
              metadata = getRoleBasedTemplate(groupname, data.sys_templateName);
            }
          } else if (data.sys_agencyId) {
            metadata = getByAgencyId(groupname, data.sys_agencyId);
          }

          if (data?.sys_templateName && data?.sys_templateName !== groupname) {
            ["Agency", "User"]?.includes(groupname) &&
              (metadata = await entityTemplate.get({
                appname,
                modulename,
                groupname: groupname,
                templatename: data.sys_templateName,
              }));
          }

          // if (
          //   isNJAdmin() &&
          //   !["NEW", "CLONE", "READ"].includes(mode.toUpperCase())
          // )
          //   handleSingleUserEdit(data);
          if (!metadata || _.isEmpty(metadata))
            metadata = await entityTemplate.get({
              appname,
              modulename,
              groupname,
            });

          //Approvals
          entityType = get(metadata, "sys_entityAttributes.sys_entityType");
          if (entityType && entityType === "Approval")
            if (baseTemplate) {
              metadata = mergeApprovalSection(baseTemplate, metadata);
            }
        } else {
          [metadata, data] = await Promise.all([
            entityTemplate.get({ appname, modulename, groupname }),
            id
              ? entity.get({ appname, modulename, entityname: groupname, id })
              : {},
          ]);
          if (data?.sys_templateName && data?.sys_templateName !== groupname) {
            ["Agency", "User"]?.includes(groupname) &&
              (metadata = await entityTemplate.get({
                appname,
                modulename,
                groupname: groupname,
                templatename: data.sys_templateName,
              }));
          }
        }

        groupname === "Audits" &&
          data &&
          (await auditsTemplate(metadata, data));
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
      else if (!isNJAdmin() && ["edit"].includes(mode)) {
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
          else if (
            metadata.sys_entityAttributes.sys_entityType.toUpperCase() ==
            "APPROVAL"
          ) {
            if (
              !checkDataAccess({
                appname,
                modulename,
                entityname: groupname,
                permissionType: "write",
                data,
                metadata: getByGroupName(groupname)
                  ? getByGroupName(groupname)
                  : metadata,
              })
            ) {
              setInAppMode("read");
              setLoading(false);
            } else setDenied(true);
          } else setDenied(true);
        } else setError(true);
      } else setLoading(false);
    }
  };

  //useEffects
  useEffect(() => {
    initContainer();
    setMounted(true);
    if (["Agency", "User", "Role"].includes(groupname) && mode === "new")
      setModalLoader(true);
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
  } else
    return modalLoader && detailData?.metadata ? (
      <TemplateSelector
        selectorMode={relationMode}
        onSelectorClose={() => onClose()}
        data={props.data}
        appName={appname}
        moduleName={modulename}
        groupName={groupname}
        baseTemplate={detailData?.metadata}
        metadata={detailData?.metadata}
        onTemplateChange={(newMetaData, businessTypeInfo, defaultData) => {
          let data = {
            ...detailData,
            metadata: newMetaData,
            data: defaultData,
          };
          setDetailData(data);
          setModalLoader(false);
        }}
      />
    ) : loading ? (
      <DetailContainerSkeleton />
    ) : (
      <ContainerWrapper style={{ flex: 1 }}>
        <DetailPage
          {...detailData}
          // {...{
          //   ...props,
          //   mode: isNJAdmin() && summaryMode
          //     ? ["true", true].includes(
          //       sessionStorage.getItem("isFormInEditing")
          //     )
          //       ? mode
          //       : ["NEW", "CLONE"].includes(mode.toUpperCase())
          //         ? mode
          //         : "read"
          //     :
          //     mode,
          // }}
          {...{
            ...props,
            mode:
              detailData?.metadata?.sys_entityAttributes.sys_entityType ==
              "Approval"
                ? inAppMode
                : mode,
          }}
          handleLoadingSkeleton={handleLoadingSkeleton}
          baseTemplate={getByGroupName(groupname)}
        />
      </ContainerWrapper>
    );
};
