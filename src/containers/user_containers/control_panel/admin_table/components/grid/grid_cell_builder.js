import React from "react";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { SystemIcons } from "utils/icons";
import { DisplayIcon } from "components/display_components";
import GridServices from "../../utils/services";

const CellBuilder = () => {
  const { getRoute } = GridServices();

  const GridCellBuilder = (data, fieldmeta, wholeData = {}) => {
    const { DateRange } = SystemIcons;
    const isImage = (val) => new RegExp("image/*").test(val);
    let { values } = fieldmeta;
    const showIcon = () => {
      return values?.find((i) => i.value == data)?.icon;
    };
    if (data !== undefined)
      switch (fieldmeta.type) {
        case "REFERENCE": {
          let arr = fieldmeta.multiSelect
            ? textExtractor([data], fieldmeta).split("|")
            : textExtractor(data, fieldmeta).split("|");
          let { isClickable = true } = fieldmeta;
          return (
            <div
              style={{
                display: "flex",
                gap: 20,
                cursor: isClickable && "pointer",
              }}
            >
              {arr?.map((i, index) => {
                return (
                  <>
                    {Object.values(i).length > 0 && (
                      <div
                        key={index}
                        onClick={() => {
                          isClickable &&
                            getRoute(
                              fieldmeta.moduleName,
                              fieldmeta.entityName,
                              fieldmeta.multiSelect ? data[index].id : data?.id,
                              fieldmeta.appName,
                              "read",
                              fieldmeta?.filters
                            );
                        }}
                        style={{
                          display: "flex",
                          cursor: isClickable && "pointer",
                          // borderLeft: "6px solid black",
                          // backgroundColor: "whitesmoke",
                          padding: "2%",
                          color: isClickable && "#308cf7",
                        }}
                      >
                        {i}
                      </div>
                    )}
                  </>
                );
              })}
            </div>
          );
        }
        case "NUMBER": {
          return <div onClick={() => {}}>{textExtractor(data, fieldmeta)}</div>;
        }
        case "DOCUMENT": {
          if (data !== undefined && data?.length) {
            return (
              <div
                onClick={() => {}}
                style={{ display: "flex", gap: 30, overflow: "visible" }}
              >
                {data.map((i) => {
                  if (isImage(i.contentType)) {
                    return (
                      <div
                        className="img-hover-zoom"
                        style={{
                          display: "flex",
                          marginLeft: "40px",
                          height: "50px",
                          width: "60px",
                        }}
                      >
                        <img maxheight="40" maxwidth="40" src={i.doc_url} />
                      </div>
                    );
                  }
                })}
              </div>
            );
          } else return textExtractor(data, fieldmeta);
        }
        case "EMAIL": {
          return (
            <div
              style={{
                display: "flex",
                cursor: "pointer",
                gap: 4,
                textDecoration: "underline #308cf7",
              }}
            >
              {textExtractor(data, fieldmeta)}
            </div>
          );
        }

        case "DATE": {
          return (
            <div
              style={{
                display: "flex",
                cursor: "pointer",
                gap: 5,
                alignItems: "center",
              }}
            >
              <DisplayIcon name={DateRange} />
              {textExtractor(data, fieldmeta)}
            </div>
          );
        }

        case "TOGGLE":
        case "RADIO": {
          return (
            <div style={{ display: "flex", gap: 6 }}>
              {textExtractor(data, fieldmeta)} <br />
              {showIcon() && (
                <div
                  style={{
                    borderRadius: "50%",
                    height: "30px",
                    width: "30px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img maxheight="40" maxwidth="40" src={showIcon()} />
                </div>
              )}
            </div>
          );
        }

        case "LIST": {
          let textColor = fieldmeta?.values.find((e) => e.id === data)?.color;
          return (
            <div
              style={{
                color: textColor ? textColor : "#000000",
                display: "flex",
                gap: 16,
              }}
            >
              {showIcon() && (
                <div
                  style={{
                    borderRadius: "50%",
                    width: "1px",
                    display: "flex",
                    alignSelf: "center",
                  }}
                >
                  <img height={15} width={15} src={showIcon()} />
                </div>
              )}
              <div style={{ display: "flex", alignSelf: "center" }}>
                {textExtractor(data, fieldmeta)}
              </div>
            </div>
          );
        }

        case "PROFILEPIC": {
          return (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src={textExtractor(data, fieldmeta)}
                alt="Profile_picture"
                style={{ borderRadius: "50%", width: "30px", height: "30px" }}
              />
            </div>
          );
        }

        default: {
          if (data) return textExtractor(data, fieldmeta);
        }
      }
    else return;
  };

  return { GridCellBuilder };
};

export default CellBuilder;
