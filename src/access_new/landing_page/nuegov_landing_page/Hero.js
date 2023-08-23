import React from "react";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { Button, List, ListItem } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import "../nuegov_landing_page/Hero.css";
import { styled } from "@material-ui/styles";
import ScheduleDemo from "access_new/components/scheduledemo";
import AdjustIcon from "@material-ui/icons/Adjust";

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#5577ff",
  borderRadius: "50px",
  color: "#ffffff",
  boxShadow: "#5577ff 0 10px 20px -10px",
  width: "200px",
  padding: "0.5rem 1rem 0.5rem 1rem",
  "&:hover": {
    backgroundColor: "#ff8a65",
  },
}));

let contentList = [
  {
    item: "Track any asset, data or equipment assigned to users or departments",
  },
  {
    item: "Easily import data and be operational immediately",
  },
  {
    item: "Configure to your agency workflows and business processes",
  },
  {
    item: "Real-time dashboards and 360 degree visibility",
  },
  {
    item: "Seamless collaboration with other departments & agencies",
  },
];

function Hero() {
  const history = useHistory();
  return (
    <div>
      <div>
        <div className="hero_container">
          <div className="header_container">
            <span className="content_heading">Do more with Less :</span>
            <br />
            <span className="content_tagline">
              Platform built for government agencies by government professionals
            </span>
          </div>
          <div className="content_container">
            <div className="left_container">
              <ul
                style={{ padding: "0", listStyleType: "none" }}
                aria-label="list"
              >
                <List role="list">
                  {contentList.map((contentList) => {
                    const list = (
                      <ListItem role="listitem">
                        <span>
                          <CheckCircleIcon
                            aria-label="check_mark"
                            style={{
                              verticalAlign: "middle",
                              paddingRight: "0.5rem",
                              color: "#66BB6A",
                              fontSize: "2rem",
                            }}
                          />
                        </span>
                        {contentList.item}
                      </ListItem>
                    );
                    return list;
                  })}
                </List>
              </ul>
              <span className="tagline">
                Reduce manual repetitive work, duplication and increase
                automation & accountability
              </span>
              {/* <ScheduleDemo /> */}
            </div>
            <div className="right_container">
              {/* <img
                className="bg_image"
                src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/strike.svg"
                alt="background"
              /> */}
              <img
                className="brand_image"
                src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/laptop.svg "
                alt="laptop"
              />
            </div>
          </div>
        </div>
        <div className="client_container">
          <span className="client_header">Our Clients</span>
          <div className="client_logo_container">
            <img
              className="client_logo"
              src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Clientlogo/rogersclogo.png"
              alt="rogerscounty_logo"
            ></img>
            <img
              className="client_logo"
              src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Clientlogo/sitelogo.png"
              alt="colorado_deparment_of_Transportation"
            ></img>
            <img
              className="client_logo"
              src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Clientlogo/gwvlogo.png"
              alt="greenwood_village"
            ></img>
            <img
              className="client_logo"
              src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Clientlogo/cdps.svg"
              alt="colorado_department_of_public_safety"
            ></img>
            <img
              className="client_logo"
              src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Clientlogo/tcrpc.png"
              alt="Try_county_regional_planning_commission"
            ></img>
            <img
              className="client_logo"
              src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Clientlogo/sterling.png"
              alt="sterling"
            ></img>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
