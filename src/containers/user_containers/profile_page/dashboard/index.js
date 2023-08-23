import React, { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import { entity } from "utils/services/api_services/entity_service";
import { BubbleLoader } from "components/helper_components";
import { ChartIterator } from "containers/feature_containers/dashboard_new/chart_components/chart_iterator";
import { PaperWrapper } from "components/wrapper_components";

const UserDashboard = (props) => {
  const { entityData, userInfo } = props;
  const [layout, setLayout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState([]);
  const [windowWidth, setWindowWidth] = useState((window.innerWidth * 11) / 14);

  window.addEventListener("resize", () => {
    setWindowWidth((window.innerWidth * 11) / 14);
  });

  let Query = {
    appname: "Features",
    modulename: "Insights",
    entityname: "ChartTemplate",
  };

  useEffect(() => {
    if (layout && layout.length) {
      entity
        .get({ ...Query, sys_ids: JSON.stringify(layout.map((i) => i.i)) })
        .then((res) => {
          if (res) {
            let result = res.map((res) => {
              return {
                ...res,
                sys_components:
                  res.sys_components &&
                  res.sys_components.map((item) => {
                    return {
                      ...item,
                      sys_entityAttributes: {
                        ...item.sys_entityAttributes,
                        payload: {
                          ...item.sys_entityAttributes.payload,
                          filters:
                            item.sys_entityAttributes.payload &&
                            item.sys_entityAttributes.payload.filters &&
                            item.sys_entityAttributes.payload.filters.map(
                              (filter) => {
                                if (filter) {
                                  if (filter.name == "createdByUser") {
                                    return {
                                      ...filter,
                                      values: {
                                        equals: userInfo.username,
                                      },
                                    };
                                  } else {
                                    return { ...filter };
                                  }
                                } else {
                                  return [];
                                }
                              }
                            ),
                        },
                      },
                    };
                  }),
              };
            });
            setLoading(false);
            setTemplate(result);
          }
        });
    }
  }, [layout]);

  useEffect(() => {
    if (entityData) {
      let layoutObj = entityData.sys_entityAttributes.layout;
      setLayout(layoutObj);
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ display: "flex", flex: 1 }}>
      {loading ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BubbleLoader />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            overflow: "auto",
            margin: "0.3rem",
          }}
          className="hide_scroll"
        >
          <GridLayout
            style={{ height: "100%" }}
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={30}
            autoSize={true}
            width={windowWidth}
            isDraggable={false}
            isResizable={false}
            padding={[10, 10]}
          >
            {layout &&
              layout.map((item) => {
                let data =
                  template && template.find((temp) => temp._id == item.i);
                return (
                  <div key={item.i} style={{ width: "100%", height: "100%" }}>
                    <PaperWrapper
                      style={{ width: "100%", height: "100%" }}
                      elevation={2}
                    >
                      {data && (
                        <ChartIterator
                          template={data}
                          layout={{ showlegend: false }}
                          config={{ staticPlot: true }}
                          plotId={`selector-${data._id}`}
                        />
                      )}
                    </PaperWrapper>
                  </div>
                );
              })}
          </GridLayout>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
