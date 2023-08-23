import React, { useEffect, useState } from "react";
import { Typography } from "@material-ui/core";
import { slug } from "utils/services/api_services/slug_service";
import { makeStyles } from "@material-ui/core/styles";
import { URLRenderer } from "components/extension_components";
import { Banner } from "components/helper_components";

const useStyles = makeStyles(() => ({
  main: {
    display: "flex",
    height: "100%",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    padding: "1rem",
  },
  text: {
    fontSize: "1.8rem",
    padding: "1rem",
  },
  urlDiv1: {
    display: "flex",
    flexDirection: "column",
    overflowY: "scroll",
    width: "100%",
    alignItems: "center",
  },
  urlDiv2: {
    width: "70%",
  },
  footer: {
    position: "fixed",
    left: 0,
    bottom: 0,
    width: "100%",
    textAlign: "center",
    paddingBottom: "10px",
  },
}));

const Waze = () => {
  const [dataArray, setDataArray] = useState([]);
  const classes = useStyles();
  const params = {
    slug: "/api/list-public-api",
    entityname: ["RoadEvent"],
  };

  const getDataFromSlug = async () => {
    try {
      let data = await slug.get({ ...params });
      setDataArray(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getDataFromSlug();
  }, []);

  return (
    <div className={classes.main}>
      <Typography className={classes.text}>Waze Data Exchange Feeds</Typography>
      <div className={classes.urlDiv1}>
        {dataArray?.data?.map((res) => {
          if (res) {
            res = {
              ...res,
              url: `${process.env.REACT_APP_BASE_URL}${res.url}`,
            };
            return (
              <div className={classes.urlDiv2}>
                <URLRenderer dataObj={res} />
              </div>
            );
          }
        })}
      </div>
      <br />
      <div className={classes.footer}>
        <div>
          Please let us know if you have any issues/questions at
          <a href="mailto:wazefeed@navjoyinc.com" target="_self">
            {" "}
            wazefeed@navjoyinc.com
          </a>
        </div>
        <div>
          Reference :{" "}
          <a
            href="https://developers.google.com/waze/data-feed/overview"
            target="_blank"
          >
            Waze
          </a>
        </div>
      </div>
      {dataArray?.success == false && (
        <Banner
          src="https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/nodatafound.png"
          iconSize="400px"
          fontSize="22px"
        />
      )}
    </div>
  );
};
export default Waze;
