import React from "react";
import "../nuegov_landing_page/community.css";

const Community = () => {
  return (
    <div className="community_main_container">
      <div className="community_header_container">
        <span className="community_header">Community Involvement</span>
        <span className="community_desc">
          We have donated to the charities below on behalf of agencies
          nationwide. These include: Behind the Badge Foundation, Stand 1st,
          Colorado Fallen Hero, Terre Haute Police Department Memorial Fund,
          Colorado Deputy Sheriff's Association, Glen Rock PBA Local 110.
        </span>
      </div>
      <div className="community_image_contaier">
        <img
          className="community_image"
          src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/coloradofallen.jpg"
          alt="Colorado_fallen_hero_foundation"
        />
        <img
          className="community_image"
          src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/behindthebadge.png"
          alt="Behind_the_badge_foundation"
        />
        <img
          className="community_image"
          src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/glenrock.jpg"
          alt="Glen_rock_PBA_local_110"
        />
        <img
          className="community_image"
          src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/standfirst.png"
          alt="Stand_First_Foundation"
        />
        <img
          className="community_image"
          src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Coloradodeputy.jpg"
          alt="Colorado_Deputy_Sheriff's_Association"
        />
      </div>
    </div>
  );
};

export default Community;
