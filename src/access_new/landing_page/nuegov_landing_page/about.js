import React from "react";
import "../nuegov_landing_page/about.css";
import Navbar from "access_new/components/Navbar";

const About = () => {
  return (
    <div>
      <Navbar />
      <div className="aboutus_main_container">
        <h1 className="page_title">About NueGOV</h1>
        <div className="vision_container">
          <div className="vision_image_container">
            <img
              className="vision_image"
              src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/ourmission.png"
              alt="our mission"
            />
          </div>
          <div className="vision_matter_container">
            <div>
              <span className="content_title">Our Vision</span>
              <article>
                We are NueGOV, trusted partners of government agencies in
                solving real problems and building more efficiencies.
              </article>
            </div>
            <div>
              <span className="content_title">Our Mission</span>
              <article>
                {" "}
                We build simple, easy-to-use and cost-effective products that
                solve real problems and create a big positive change for
                government agencies
              </article>
            </div>
          </div>
        </div>
        <div className="vision_container">
          <div className="vision_image_container">
            <img
              className="vision_image"
              src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/ourstory.svg"
              alt="our story"
            />
          </div>
          <div className="story_matter_container">
            <span className="content_title">Our Story</span>
            <article>
              {" "}
              Navjoy Inc (parent company of NueGOV)  is headquartered in
              Centennial Colorado and was founded in 2003. We have built a
              successful consulting practice in Colorado, working with
              government agencies and this allowed us to experience  firsthand
              the big gaps within the public sector industry. Government
              agencies have seen a tremendous influx of new technologies in
              certain areas.  However, there still remains big gaps when it
              comes to tracking assets, training, collaboration, internal
              business processes and seeing everything in one place. There are
              data silos, numerous tools and systems with no data learning
              algorithms and predictive capabilities. It’s the same players and
              there is lack of innovation compared to other industries. This is
              why we developed NueGOV to help government professionals focus
              their efforts on things that matter most.  If you believe that
              technology is a tool that can improve efficiency & accountability,
              our NueGOV software is the right solution.
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
