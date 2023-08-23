import React from "react";
import { UserFactory, GlobalFactory } from "utils/services/factory_services";
import { format } from "date-fns";
import { isDefined, get } from "./object_methods";
import moment from "moment-timezone";
import { CurrencyTypes } from "./support/currencyTypes";

export const getAppIcon = (appname) =>
  `https://assetgov-icons.s3-us-west-2.amazonaws.com/reacticons/${appname.toLowerCase()}.svg`;
export const getEntityIcon = (entityname) =>
  `https://assetgov-icons.s3-us-west-2.amazonaws.com/reacticons/${entityname.toLowerCase()}.svg`;

export const getAvatarText = (words) => {
  let letters = words.match(/\b(\w)/g).map((el) => el.toUpperCase());
  return letters.join("");
};

export const systemTrigger = (type, data) => {
  switch (type) {
    case "DATETIME": {
      return new Date().toISOString();
    }
    case "RESET": {
      return null;
    }
    case "DEFAULT": {
      return data;
    }
  }
};

export const generateHash = (string) => {
  var hash = 0;
  if (string.length == 0) return hash;
  for (let i = 0; i < string.length; i++) {
    var charCode = string.charCodeAt(i);
    hash = (hash << 7) - hash + charCode;
    hash = hash & hash;
  }
  return hash;
};

export const seconds_to_days_hours_mins_secs = (seconds) => {
  let days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * (24 * 60 * 60);
  let hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * (60 * 60);
  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return (
    (0 < days ? days + "day, " : "") +
    (0 < hours ? hours + " hr " : "") +
    (0 < minutes ? minutes + " min " : "") +
    (0 < seconds ? seconds + " sec" : "")
  );
};

export const getTimeDifference = (start, end) => {
  return (
    Math.floor(new Date(end).getTime() / 1000) -
    Math.floor(new Date(start).getTime() / 1000)
  );
};

export const mergeApprovalSection = (baseTemplate, template) => {
  let entityType = get(baseTemplate, "sys_entityAttributes.sys_entityType");
  if (entityType && entityType === "Approval")
    return {
      ...template,
      sys_entityAttributes: {
        ...template.sys_entityAttributes,
        sys_topLevel: [
          ...template.sys_entityAttributes.sys_topLevel.filter(
            (ef) => !ef.approval
          ),
          ...(baseTemplate.sys_entityAttributes.sys_approvals
            ? baseTemplate.sys_entityAttributes.sys_approvals.map((ef) => {
                ef.skipReadMode = true;
                ef.approval = true;

                return ef;
              })
            : []),
        ],
      },
    };
  else return baseTemplate;
};

export const textExtractor = (
  data,
  fieldmeta = {},
  wholeData = {},
  displayFor = ""
) => {
  const empty = "";
  let concatedArray = [],
    concatArrayExist = fieldmeta.hasOwnProperty("concatArray"),
    concatArray = fieldmeta.concatArray;
  let timeZone, offset, timezoneValue;
  let isNueassist;
  try {
    const { getBusinessType = () => {} } = GlobalFactory() || {};
    const { getAgencyTimeZone = () => {} } = UserFactory() || {};
    timeZone = getAgencyTimeZone() || {};
    offset = timeZone.offset;
    timezoneValue = timeZone.value;
    isNueassist = getBusinessType() === "NUEASSIST";
  } catch {}

  if (concatArrayExist && concatArray.length) {
    concatArray.map((i) => {
      concatedArray.push(get(wholeData, i, ""));
    });
  }

  const getCurrencyData = (data, fieldmeta) => {
    let { showCurrencyCode = false } = fieldmeta || {};
    let { amount = "", currency = "", currencySymbol = "" } = data || {};
    if (amount && Object.keys(data).length > 0) {
      if (showCurrencyCode) return `${currency} ${amount}`;
      else return `${currencySymbol} ${amount}`;
    } else return empty;
  };

  switch (fieldmeta.type) {
    case "APPROVAL": {
      if (data && data.value) return data.value;
      else return empty;
    }
    case "CAMERASTREAM": {
      return data && data.length ? data.map((i) => i.url).join(" , ") : empty;
    }
    case "CHECKBOX": {
      return data ? data.join(", ") : empty;
    }
    case "COLORCODEDLIST": {
      return data;
    }
    case "CURRENCY": {
      let currencyData = getCurrencyData(data, fieldmeta);
      return currencyData ? currencyData : empty;
    }
    case "DATAPAIREDLIST": {
      if (data) {
        let { visibleInSingleColumn = false } = fieldmeta || {};
        if (!visibleInSingleColumn) {
          return data?.text || empty;
        } else {
          return data
            ? Object.values(data).length
              ? Object.values(data)
                  .map((i) => i.text)
                  .join(" / ")
              : "---"
            : empty;
        }
      } else return "";
    }
    case "DATATABLE": {
      if (data && data.headers)
        return Array.isArray(data.headers) ? data.headers.join(", ") : empty;
      else return empty;
    }
    case "DATE": {
      if (!["undefined", "null"].includes(data)) {
        if (data) {
          if (isNueassist) {
            fieldmeta.format = !fieldmeta?.time
              ? fieldmeta?.format?.toUpperCase()
              : fieldmeta?.format;
            const date = moment(data).tz(timezoneValue);
            const formattedDate = date.format(
              fieldmeta.format ? fieldmeta.format : "MM-DD-YYYY"
            );
            return formattedDate;
          } else {
            return format(
              new Date(data),
              fieldmeta.format ? fieldmeta.format : "MM-dd-yyyy"
            );
          }
        }
        return "--/--/----";
      } else return "--/--/----";
    }
    case "DATERANGE": {
      let { showEmpty = true } = fieldmeta;
      if (fieldmeta.showTimer) {
        if (data && data.startDate && data.endDate) {
          let timeDifference = getTimeDifference(data.startDate, data.endDate);
          if (timeDifference > 0)
            return seconds_to_days_hours_mins_secs(timeDifference);
          else return empty;
        } else return empty;
      } else {
        if (data) {
          let startDate;
          let endDate;
          if (isNueassist) {
            // fieldmeta.format = fieldmeta?.format?.toUpperCase()
            startDate = data.startDate
              ? moment(data.startDate)
                  .tz(timezoneValue)
                  .format(
                    fieldmeta.format
                      ? "MM/DD/yyyy HH:mm"
                      : fieldmeta.setTime
                      ? "MM/DD/yyyy HH:mm"
                      : "MM/DD/yyyy"
                  )
              : "--/--/---- --:--";
            endDate = data.endDate
              ? moment(data.endDate)
                  .tz(timezoneValue)
                  .format(
                    fieldmeta.format
                      ? "MM/DD/yyyy HH:mm"
                      : fieldmeta.setTime
                      ? "MM/DD/yyyy HH:mm"
                      : "MM/DD/yyyy"
                  )
              : "--/--/---- --:--";
          } else {
            startDate = data.startDate
              ? format(
                  new Date(data.startDate),
                  fieldmeta.format
                    ? fieldmeta.format
                    : fieldmeta.setTime
                    ? "MM/dd/yyyy HH:mm"
                    : "MM/dd/yyyy"
                )
              : "--/--/---- --:--";
            endDate = data.endDate
              ? format(
                  new Date(data.endDate),
                  fieldmeta.format
                    ? fieldmeta.format
                    : fieldmeta.setTime
                    ? "MM/dd/yyyy HH:mm"
                    : "MM/dd/yyyy"
                )
              : showEmpty
              ? "--/--/---- --:--"
              : empty;
          }
          return concatArrayExist ? (
            <>
              <h4>
                {startDate}
                {showEmpty ? "  -  " : empty} {endDate}
              </h4>
              {concatedArray.map((i) => (
                <> {i}</>
              ))}
            </>
          ) : (
            startDate + " - " + endDate
          );
        } else return "--/--/----";
      }
    }
    case "DATETIME": {
      if (data && isNueassist) {
        const date = moment(data).tz(timezoneValue);
        if (date) {
          fieldmeta.format = fieldmeta?.format?.toUpperCase();
          return date.format("MM-DD-YYYY HH:mm A");
        }
      }
      return data
        ? format(
            new Date(data),
            fieldmeta.format ? fieldmeta.format : "MM/dd/yyyy HH:mm"
          )
        : "--/--/---- --:--";
    }
    case "TIMECLOCK": {
      if (isNueassist) {
        return data ? moment(data).tz(timezoneValue).format("LT") : "";
      }
      return data
        ? format(
            new Date(data),
            fieldmeta.format ? fieldmeta.format : "hh:mm a"
          )
        : "--:-- --";
    }
    case "DECIMAL": {
      const numberOfDecimals = get(fieldmeta, "numberOfDecimals", 3);
      const appendDecimals = (data) =>
        Number.parseFloat(data).toFixed(numberOfDecimals);
      return isDefined(data) ? appendDecimals(data.toString()) : empty;
    }
    case "DIRECTIVEPICKER": {
      return data && Object.keys(data).length ? data.title : empty;
    }
    case "DOCUMENT": {
      return data && data.length
        ? data.map((i) => i.documentName).join(" , ")
        : empty;
    }
    case "DYNAMICLIST": {
      return data;
    }
    case "DYNAMICARRAY": {
      let { fieldInfo } = fieldmeta;
      let text = [];
      data &&
        data.length &&
        data.map((ed) => {
          text.push(textExtractor(ed, fieldInfo));
        });
      return text.join(", ");
    }
    case "EDITOR": {
      return data;
    }
    case "ENTITYDOCUMENT": {
      return empty;
    }
    case "FILEUPLOADER": {
      return empty;
    }
    case "ICON": {
      return empty;
    }
    case "LATLONG": {
      const path = get(fieldmeta, "path");
      if (data && path) {
        let val = get(data, path);
        return val ? val : empty;
      } else return empty;
    }

    case "LINEAR": {
      return empty;
    }
    case "LIST": {
      if (data && data.length > 0) {
        let result = [];
        if (fieldmeta?.multiSelect == true) {
          let { values } = fieldmeta;
          data.map((ed) => {
            let val = values?.find((ev) => ev.id === ed);
            if (val) result.push(val.value);
          });
          return result.join(", ");
        } else {
          let { values, summaryName = "" } = fieldmeta;
          if (summaryName === "timeSlots") data = "" + data?.length || 0;
          result = values?.find(
            (item) => item.id === data || item.value === data
          );
          return result?.value || empty;
        }
      } else return empty;
    }
    case "MASK": {
      if (data && data.length > 0) {
        let splitBy = fieldmeta.splitBy;
        let length = fieldmeta.length;
        let position = fieldmeta.position;
        let mask = fieldmeta.mask;
        let maskBy = fieldmeta.maskBy;
        let pattern = fieldmeta.pattern;

        let maskData = (val) => {
          let maskedData = "";
          if (val) {
            let splittedData = "";
            let numOfSplits = 0;
            val
              .replaceAll(splitBy, "")
              .split("")
              .map((each1, index1, array1) => {
                if (array1[index1 - 1] === splitBy) {
                  numOfSplits++;
                }
                if (
                  index1 + 1 <= length + numOfSplits &&
                  position === ("LEFT" || "left" || "Left") &&
                  each1 !== splitBy
                ) {
                  splittedData += "".concat("", mask ? maskBy : each1);
                } else if (
                  index1 + 1 >
                    val.replaceAll(splitBy, "").length -
                      (length + numOfSplits) &&
                  position === ("RIGHT" || "right" || "Right") &&
                  each1 !== splitBy
                ) {
                  splittedData += "".concat("", mask ? maskBy : each1);
                } else {
                  splittedData += "".concat("", each1);
                }
              });
            splittedData.split("").map((each2, index2) => {
              let sum2 = 1;
              pattern.map((e2, i2) => {
                sum2 = sum2 + e2;
                if (index2 + 1 === sum2 && each2 !== splitBy) {
                  maskedData += "".concat("", `${splitBy}`);
                }
              });
              maskedData += "".concat("", each2);
            });
            return maskedData;
          } else {
            return "";
          }
        };
        let maskedData = maskData(data);
        return maskedData;
      } else return empty;
    }
    case "NUMBER": {
      return isDefined(data) ? data.toString() : empty;
    }
    case "OBJECT": {
      let { field, fields } = fieldmeta;
      let meta = fields.find((ef) => ef.name == field);
      let text = get(data, field, {});
      return textExtractor(text, meta, empty);
    }
    case "PAIREDLIST": {
      if (data) {
        let { visibleInSingleColumn = false } = fieldmeta || {};
        if (!visibleInSingleColumn) {
          return data?.name || empty;
        } else {
          return data
            ? Object.values(data).length
              ? Object.values(data)
                  .map((i) => i.id)
                  .join(" | ")
              : "---"
            : empty;
        }
      } else return "";
    }
    case "PASSWORD": {
      return "******";
    }
    case "PERMISSION": {
      return empty;
    }
    case "PHONENUMBER": {
      if (data && Object.keys(data).length > 1 && data.uiDisplay)
        return data.uiDisplay;
      else return empty;
    }

    case "PROFILEPIC": {
      if (data && Object.keys(data).length >= 1) return data?.doc_url || "";
      else return empty;
    }

    case "TOGGLE":
    case "RADIO": {
      let { values } = fieldmeta;
      let result = values?.find((item) => item?.value == data);
      if (result) {
        if (result.cellTitle) return result.cellTitle;
        else return result.title ? result.title : empty;
      }
    }
    case "REFERENCE": {
      if (
        data &&
        Object.keys(data).length &&
        Array.isArray(fieldmeta.displayFields)
      ) {
        let keys = fieldmeta.displayFields.map((e) => {
          if (displayFor?.toLowerCase() == "headerpanel" && e.hideOnHeaderPanel)
            return "";
          if (e.name.split(".").length > 1) {
            if (
              fieldmeta.multiSelect ||
              e.type === "DATETIME" ||
              e.type === "DATE"
            )
              return {
                name: e.name.split(".")[e.name.split(".").length - 1],
                type: e?.type,
                friendlyName: e.friendlyName,
                delimiter: e?.delimiter,
              };
            else return e.name.split(".")[e.name.split(".").length - 1];
          } else {
            if (
              fieldmeta.multiSelect ||
              e.type == "DATETIME" ||
              e.type == "DATE"
            )
              return {
                name: e.name,
                type: e?.type,
                friendlyName: e.friendlyName,
                delimiter: e?.delimiter,
              };
            else return e.name;
          }
        });

        let values = Object.values(data).filter(Boolean);
        let refValues = keys.map((e) => data[e]).filter(Boolean);
        if (fieldmeta.multiSelect) {
          let str = "";
          if (Array.isArray(data))
            data.map((ev, di) => {
              let strArr = keys.map((ek) => ev[ek.name]).filter((estr) => estr);
              let fmeta = keys.find((ek) => ev[ek.name]);
              if (strArr.length) str += strArr.join(fmeta?.delimiter || ", ");
              if (di != data.length - 1)
                str += `${fieldmeta?.delimiter || ` | `}`;
            });
          return str;
        } else if (values.length && refValues.length)
          return keys
            .map((e) => {
              if (data[e] && typeof data[e] === "object") {
                //This is for phonenumber type only
                return data[e]["uiDisplay"];
              } else if (
                e?.name &&
                Object.keys(data).includes(e?.name) &&
                (e?.type == "DATETIME" || e?.type == "DATE")
              ) {
                return data[e?.name]
                  ? format(
                      new Date(data[e?.name]),
                      e.format
                        ? e.format
                        : e?.type == "DATE"
                        ? "MM/dd/yyyy"
                        : "MM/dd/yyyy HH:mm"
                    )
                  : "--/--/---- --:--";
              } else return data[e];
            })
            .filter((fv) => !["", undefined, null].includes(fv))
            .join(`${fieldmeta.seperator || ` | `}`);
        else return empty;
      } else return empty;
    }
    case "VIDEOSTREAM": {
      return data;
    }

    case "TIMERANGE": {
      if (data) {
        let startTime, endTime;
        if (isNueassist) {
          startTime = data.startTime
            ? moment(data.startTime)
                .tz(timezoneValue)
                .format(
                  fieldmeta.format
                    ? fieldmeta.format
                    : fieldmeta.setTime
                    ? "HH:mm:ss"
                    : "HH:mm:ss"
                )
            : "-- : -- : -- ";
          endTime = data.endTime
            ? moment(data.endTime)
                .tz(timezoneValue)
                .format(
                  fieldmeta.format
                    ? fieldmeta.format
                    : fieldmeta.setTime
                    ? "HH:mm:ss"
                    : "HH:mm:ss"
                )
            : "-- : -- : -- ";
        } else {
          startTime = data.startTime
            ? format(
                new Date(data.startTime),
                fieldmeta.format
                  ? fieldmeta.format
                  : fieldmeta.setTime
                  ? "HH:mm:ss"
                  : "HH:mm:ss"
              )
            : "-- : -- : -- ";
          endTime = data.endTime
            ? format(
                new Date(data.endTime),
                fieldmeta.format
                  ? fieldmeta.format
                  : fieldmeta.setTime
                  ? "HH:mm:ss"
                  : "HH:mm:ss"
              )
            : "-- : -- : -- ";
        }
        return `${startTime} - ${endTime}`;
      } else return "-- : -- : -- ";
    }
    case "PICTURETEXTBOX": {
      let val = "";
      if (data) {
        const { fields = [] } = fieldmeta;
        fields.forEach(
          (field) => (val += data[field.name] ? data[field.name] : "" + " ")
        );
      }
      return val ? val : "";
    }
    case "ORDER": {
      // let { fields, subname = fields[0].name } = fieldmeta;
      // fields = fields.filter((e) => e.visible);
      // let value;
      // if (fields && fields.length) {
      //   fields.map((e) => {
      //     if (data[e.name]) {
      //       value = value ? `${value} / ${data[e.name]}` : data[e.name];
      //     }
      //   });
      // }
      // return value;
    }
    case "TOGGLE": {
      let { values } = fieldmeta;
      let result = values?.find((item) => item?.value == data);
      if (result) {
        if (result.cellTitle) return result.cellTitle;
        else return result.title ? result.title : empty;
      }
    }
    default: {
      if (typeof data === "object") return;
      else {
        let value = data
          ? concatArrayExist && typeof data === "string"
            ? !checkForStringExists(data, concatedArray)
              ? data?.concat(" ") + concatedArray?.join(" ")
              : data
            : data
          : empty;
        return value;
      }
    }
  }
};

const checkForStringExists = (data, arr) => {
  let found = false;
  arr = arr?.map((i) => {
    if (data.includes(i)) found = true;
    return i;
  });
  return found;
};

export const basicEntityData = () => {
  const { getAgencyId, getId } = UserFactory();
  return {
    sys_agencyId: getAgencyId,
    sys_userId: getId,
    sys_entityAttributes: {},
  };
};

export const networkQuality = () => {
  var connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  var type = connection ? connection.effectiveType : "MEDIUM";
  let quality = {
    "slow-2g": "LOW",
    "2g": "LOW",
    "3g": "MEDIUM",
    "4g": "HIGH",
  };
  return quality[type];
  // let safariAgent = userAgentString.indexOf("Safari") > -1;
};

export const queryToUrl = (params) =>
  Object.keys(params || {})
    .map((key) => key + "=" + params[key])
    .join("&");

export const generateObjectID = (
  m = Math,
  d = Date,
  h = 16,
  s = (s) => m.floor(s).toString(h)
) => s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h));
