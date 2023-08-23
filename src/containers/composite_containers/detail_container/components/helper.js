import { get } from "loadsh";

import { entity } from "utils/services/api_services/entity_service";
import { reportGenerator } from "utils/services/api_services/report_service";

export const checkForReportAutoSave = async (props) => {
  let {
    metadata,
    formData,
    showSampleData,
    appname,
    modulename,
    entityname,
    id,
  } = props || {};
  let {
    sys_reports = [],
    sys_autoSaveReports = false,
    sys_templateName: metadataTemplateName,
  } = metadata?.sys_entityAttributes || {};
  let { sys_templateName } = formData || {};
  let reportData = [],
    isAutoSaveEnabled = false,
    matchedReportName = {};
  if (sys_autoSaveReports) {
    let reportIds = sys_reports?.map((eachReport) => eachReport?.sys_gUid);
    let reportParams = {
      appname: "Features",
      modulename: "Reports",
      entityname: "Reports",
      limit: 0,
      sys_gUid: reportIds?.toString(),
    };
    reportData = await entity.get(reportParams);
    if (reportData?.length > 0) {
      let autoSaveReports =
        reportData?.filter(
          ({
            sys_entityAttributes: { autoSaveConfig = [], mainReport = "" } = {},
          }) => autoSaveConfig?.length > 0 && mainReport === "True"
        ) || [];
      if (autoSaveReports?.length > 0) {
        autoSaveReports.map((eachR) => {
          let { autoSaveConfig = [], reportName = "" } =
            eachR?.sys_entityAttributes || {};
          autoSaveConfig.map((e) => {
            let value = get(formData, e?.path, "");
            if (e?.values?.includes(value)) {
              isAutoSaveEnabled = true;
              matchedReportName = reportName;
            }
          });
        });
      }
      if (isAutoSaveEnabled) {
        let params = { appname, modulename, entityname, id };
        let reportPayload = {
          jobType: "reports",
          jobPayload: {
            [matchedReportName]: {
              checked: true,
            },
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            businessType: "NUEGOV",
            dateRange: {},
            filters: {},
            level: "detail",
            type: null,
            password: "",
            relatedPath: null,
            showSampleData: showSampleData,
            currentDateTime: new Date(),
            autoSaveEnabled: true,
          },
        };
        if (metadataTemplateName !== sys_templateName) {
          params = {
            ...params,
            templateName: sys_templateName,
          };
        }
        reportGenerator
          .getReport(params, reportPayload)
          .then(async (res) => {
            if (res?.success && res?.data) {
              console.log("Auto save of report is successful");
            } else {
              let errResponse = await res.text();
              errResponse = errResponse
                ? JSON.parse(errResponse)?.errors
                : {
                    message: "Oops... Data not found",
                  };
              console.log("Auto save successful : ", errResponse?.message);
            }
          })
          .catch((e) => {
            console.log("Auto save failed : ", e);
          });
      }
    }
  }
};
