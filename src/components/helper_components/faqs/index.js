import React, { useEffect, useState } from "react";
import { entity } from "utils/services/api_services/entity_service";
import { DisplayCarousel } from "components/display_components";
import { BubbleLoader } from "components/helper_components";

const Faqs = ({ feature, groupName, ...rest }) => {
  const [data, setData] = useState({});
  const [loader, setLoader] = useState(false);

  const getEntityData = async () => {
    var queryParam = {
      appname: "NJAdmin",
      modulename: "NJ-SysTools",
      entityname: "Helpers",
      "sys_templateGroupName.sys_groupName": groupName,
      isFeature: feature,
      skip: 0,
      limit: 1,
    };
    var getData = await entity.get(queryParam);
    if (getData.length) {
      var { carouselInfo, helperTitle, videoURL, instructions } =
        getData[0].sys_entityAttributes;
      if (getData) setLoader(false);
      setData({ carouselInfo, helperTitle, videoURL, instructions });
    }
  };

  useEffect(() => {
    setLoader(true);
    getEntityData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignSelf: "center",
      }}
    >
      {Object.keys(data).length > 0 && !loader ? (
        <DisplayCarousel props={data} {...rest} />
      ) : (
        <div style={{ display: "flex", flex: 1, height: "100%" }}>
          {" "}
          <BubbleLoader />
        </div>
      )}
    </div>
  );
};

export default Faqs;
