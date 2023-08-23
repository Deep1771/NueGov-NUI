import { UserFactory } from "utils/services/factory_services";

const getDefaultValues = () => {
  return {
    title: "",
    entityInfo: null,
    record_actions: {
      inserted: false,
      updated: false,
      deleted: false,
    },
    subject: "",
    body: "",
    stampagency: null,
    notify: true,
    sandbox: false,
    // },
  };
};

export const getTriggerShell = (params) => {
  const { getAgencyId, getRefObj, isNJAdmin } = UserFactory();
  const { detailMode, properties, data, mode } = params;
  const sys_templateName = "Trigger";
  const createdBy = getRefObj();
  const sys_userId = createdBy.id;

  switch (mode) {
    case "EDIT": {
      let stampAgency = data?.sys_entityAttributes?.stampagency || {};
      return {
        ...data,
        sys_entityAttributes: {
          ...data.sys_entityAttributes,
          stampagency: Object.keys(stampAgency).length ? stampAgency : null,
        },
      };
    }

    case "NEW": {
      let basicObj = {
        sys_agencyId: isNJAdmin() ? "No Agency" : getAgencyId,
        sys_templateName,
        sys_userId,
      };
      const defValues = getDefaultValues();
      if (detailMode) {
        const {
          id,
          sys_gUid,
          sys_agencyId,
          metadata,
          appname: appName,
          modulename: moduleName,
          groupname: groupName,
        } = properties;
        return {
          ...basicObj,
          sys_agencyId,
          sys_entityAttributes: {
            ...defValues,
            doc_id: id,
            doc_gUid: sys_gUid,
            createdBy,
            entityInfo: {
              appName,
              moduleName,
              groupName,
              friendlyName: metadata?.sys_entityAttributes?.sys_friendlyName,
              name: metadata?.sys_entityAttributes?.sys_templateName,
              unique_key: `${appName}-${moduleName}-${groupName}`,
            },
          },
        };
      } else {
        return {
          ...basicObj,
          sys_entityAttributes: {
            ...defValues,
            createdBy,
          },
        };
      }
    }
    default:
      return {};
  }
};

export const getContextFields = (fields) => {
  let CONTEXT_RECIPIENTS = [
    {
      name: "record_users",
      title: "Select User",
      options: [],
    },
    {
      name: "record_contacts",
      title: "Select Contacts",
      options: [],
    },
    {
      name: "record_mails",
      title: "Select mail",
      options: [],
    },
    {
      name: "record_roles",
      title: "Select Roles",
      options: [],
    },
    {
      name: "record_usergroups",
      title: "Select User group",
      options: [],
    },
    {
      name: "record_contactroles",
      title: "Select Contact Role",
      options: [],
    },
    {
      name: "record_boundary",
      title: "Select Boundary",
      options: [],
    },
  ];

  fields.forEach((field) => {
    switch (field.type) {
      case "REFERENCE": {
      }

      case "EMAIL": {
      }

      default: {
      }
    }
  });
};
