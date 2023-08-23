import React, { useState, useEffect } from "react";
import CardActions from "@material-ui/core/CardActions";
import Divider from "@material-ui/core/Divider";
import Pagination from "@material-ui/lab/Pagination";
import {
  DisplayGrid,
  DisplayCard,
  DisplayButton,
  DisplayText,
} from "components//display_components";
import { getEntityData, getEntityTemplate, getEntityCount } from "./services";
import { TextExtract } from "./textExtractor";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";

export const SystemRelationGrid = (props) => {
  let [metadata, setMetadata] = useState({});
  let [entityData, setEntityData] = useState([]);
  let [docCount, setDocCount] = useState(0);
  let [totalCount, setTotalCount] = useState();

  let params = {
    appname: "Quarter Master Gov",
    modulename: "Trooper",
    entityname: "Trooper",
  };
  let cardTitle;

  useEffect(() => {
    initState();
  }, []);

  let computeCount = (count) => {
    if (count % 8 !== 0) {
      count = Math.floor(count.data / 8) + 1;
      setDocCount(count);
    }
  };

  let __handleChange = async (e, value) => {
    let skip = 8 * (value - 1);
    let result = await getEntityData({ ...params, ...{ limit: 8, skip } });
    setEntityData(result);
  };

  let initState = async () => {
    let template = await getEntityTemplate({
      ...params,
      ...{ groupname: "Trooper" },
    });
    let entityResult = await getEntityData({
      ...params,
      ...{ limit: 8, skip: 0 },
    });
    let count = await getEntityCount(params);
    setMetadata(template);
    setEntityData(entityResult);
    setTotalCount(count.data);
    computeCount(count);
  };
  return (
    <DisplayGrid container direction="row">
      <DisplayGrid item xs={12}>
        <DisplayGrid container justify="flex-end" style={{ height: "10vh" }}>
          <DisplayGrid item>
            <DisplayButton label="SEARCH" color="primary" />
          </DisplayGrid>
          <DisplayGrid item>
            <DisplayButton label="SORT BY" color="primary" />
          </DisplayGrid>
          <DisplayGrid item>
            <DisplayButton label="ASSIGN" color="primary" />
          </DisplayGrid>
          <DisplayGrid item>
            <DisplayButton label="NEW TRAINING" color="primary" />
          </DisplayGrid>
        </DisplayGrid>
      </DisplayGrid>
      <DisplayGrid container spacing={3}>
        {entityData.length > 0 &&
          entityData.map((item, idx) => {
            return (
              <DisplayGrid
                item
                xs={6}
                sm={6}
                md={4}
                lg={3}
                xl={3}
                key={idx.toString()}
              >
                <DisplayCard>
                  <DisplayGrid container>
                    <DisplayGrid
                      item
                      style={{
                        paddingLeft: "15px",
                        paddingBottom: "15px",
                        paddingTop: "10px",
                      }}
                    >
                      <DisplayText variant="subtitle1">
                        <b>
                          {metadata.sys_entityAttributes.app_cardContent.titleField
                            .map((e) => e.name)
                            .join(",")}
                        </b>
                      </DisplayText>
                    </DisplayGrid>
                  </DisplayGrid>
                  {metadata.sys_entityAttributes.app_cardContent.descriptionField.map(
                    (item2, idx2) => {
                      if (item2.visible) {
                        return (
                          <DisplayGrid
                            container
                            key={idx2.toString()}
                            style={{
                              paddingLeft: "15px",
                              paddingTop: "10px",
                              overflow: "hidden",
                            }}
                          >
                            <DisplayGrid item xs={6} style={{ height: "20px" }}>
                              <DisplayText variant="body2">
                                {item2.name}
                              </DisplayText>
                            </DisplayGrid>
                            <DisplayGrid
                              item
                              xs={6}
                              style={{ width: "15px", height: "20px" }}
                            >
                              <DisplayText variant="body2">
                                <b>
                                  {TextExtract({
                                    data: item,
                                    metadata,
                                    definition: item2,
                                  })}
                                </b>
                              </DisplayText>
                            </DisplayGrid>
                          </DisplayGrid>
                        );
                      }
                    }
                  )}
                  <Divider />
                  <DisplayGrid container justify="flex-end">
                    <DisplayGrid item>
                      <CardActions>
                        <DisplayButton label="EDIT" color="primary" />
                      </CardActions>
                    </DisplayGrid>
                    <DisplayGrid item>
                      <CardActions>
                        <DisplayButton label="VIEW" color="primary" />
                      </CardActions>
                    </DisplayGrid>
                  </DisplayGrid>
                </DisplayCard>
              </DisplayGrid>
            );
          })}
      </DisplayGrid>
      {entityData.length > 0 && (
        <DisplayGrid item xs={12}>
          <DisplayGrid container justify="flex-end">
            <DisplayGrid item style={{ paddingTop: "20px" }}>
              <Pagination count={docCount} onChange={__handleChange} />
            </DisplayGrid>
            <DisplayGrid item style={{ paddingTop: "26px" }}>
              <DisplayText variant="body2">{`${docCount} of ${totalCount}`}</DisplayText>
            </DisplayGrid>
          </DisplayGrid>
        </DisplayGrid>
      )}
    </DisplayGrid>
  );
};

export default GridWrapper(SystemRelationGrid);
