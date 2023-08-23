import React from "react";
import { Button, List, ListItem } from "@material-ui/core";
import "../nuegov_landing_page/Solutions.css";
import AdjustIcon from "@material-ui/icons/Adjust";
import { useLocation } from "react-router-dom";
import { styled } from "@material-ui/styles";

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#5577ff",
  borderRadius: "50px",
  color: "#ffffff",
  boxShadow: "#5577ff 0 10px 20px -10px",
  width: "fit-content",
  padding: "0.5rem 1rem 0.5rem 1rem",
  "&:hover": {
    backgroundColor: "#ff8a65",
  },
}));

let transportationlist = [
  {
    item: "Asset Management",
  },
  {
    item: "Digital Asset Data Collection",
  },
  {
    item: "Workzone Information Management",
  },
  {
    item: "Speed Reduction Request Management",
  },
  {
    item: "Situational Awareness",
  },
];
let pslist = [
  {
    item: "Fleet",
  },
  {
    item: "Material",
  },
  {
    item: "Weapons",
  },
  {
    item: "Facilities",
  },
  {
    item: "Training",
  },
];

const Solutions = () => {
  const location = useLocation();
  return (
    <div className="solution_main_container">
      <div className="solution_header_container">
        <span className="solution_header">Solutions we offer</span>
      </div>
      <div className="ps_container">
        <div className="image_container">
          <img
            className="ps_image"
            src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/psbrandimage.svg"
            alt="Public_safety"
          />
        </div>
        <div className="ps_content_container">
          <span className="ps_content_heading">Public Safety</span>
          <span className="ps_tagline">
            Built for Police, Fire and Emergency Management professionals to
            increase accountability, reduce risk and eliminate budget surprises.
            <br /> Management Modules include:
          </span>
          <List role="list">
            {pslist.map((pslist) => {
              const list = (
                <ListItem role="listitem">
                  <span>
                    <AdjustIcon
                      style={{
                        verticalAlign: "middle",
                        paddingRight: "0.5rem",
                        color: "green",
                        fontSize: "1.5rem",
                      }}
                    />
                  </span>
                  {pslist.item}
                </ListItem>
              );
              return list;
            })}
          </List>
        </div>
      </div>
      <div className="ts_container">
        <div className="image_container">
          <img
            className="ps_image"
            src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/laptop.svg"
            alt="Transportation_banner"
          />
        </div>
        <div className="ps_content_container">
          <span className="ps_content_heading">Transportation</span>
          <span className="ps_tagline">
            Built for transportation professionals to increase efficiency,
            reduce duplication and eliminate surprises.
            <br /> Modules include:
          </span>
          <List role="list">
            {transportationlist.map((transportationlist) => {
              const list = (
                <ListItem role="listitem">
                  <span>
                    <AdjustIcon
                      aria-label="Bullet_icon"
                      style={{
                        verticalAlign: "middle",
                        paddingRight: "0.5rem",
                        color: "green",
                        fontSize: "1.5rem",
                      }}
                    />
                  </span>
                  {transportationlist.item}
                </ListItem>
              );
              return list;
            })}
          </List>
        </div>
      </div>
    </div>
  );
};

export default Solutions;
