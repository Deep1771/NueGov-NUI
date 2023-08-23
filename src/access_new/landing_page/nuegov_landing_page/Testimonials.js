import React from "react";
import "../nuegov_landing_page/Testimonials.css";
function Testimonials() {
  return (
    <div className="testimonial_main_container">
      <span className="testimonial_heading">
        Don't just take our word for it
      </span>
      <span className="testimonial_tagline">
        see what our customers have to say
      </span>
      <div className="tenstimonial_content_container">
        <div className="testimonial_content">
          <span className="testimonial_text">
            "NueGOV built the product specific to our workflows and our
            requirements. This partnership has been beneficial"
          </span>
          <div className="testimonial_author_container">
            {/* <div><img className='avatar' src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/kevin.jfif" alt="" /></div> */}
            <div className="testimonial_author_des_container">
              <span className="author_name">Kevin Rants</span>
              <br />
              <span className="des_name">
                Chief Administrative Officer, Colorado Department of Public
                Safety
              </span>
            </div>
          </div>
        </div>
        <div className="testimonial_content">
          <span className="testimonial_text">
            "There is an incredible amount of potential to use real-time work
            zone data like this to inform drivers throughout our region and help
            keep public works and construction staff safe"
          </span>
          <div className="testimonial_author_container">
            {/* <div><img className='avatar' src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/steve.webp" alt="" /></div> */}
            <div className="testimonial_author_des_container">
              <span className="author_name">Steve Deck</span>
              <br />
              <span className="des_name">
                Executive Director, Tri Country Regional Planning Commission
                (TCRPC) Pennsylvania
              </span>
            </div>
          </div>
        </div>
        <div className="testimonial_content">
          <span className="testimonial_text">
            “With NueGOV, We monitor all the equipment and all the assets. Then
            we also monitor the department as well as the individual officer or
            employee
          </span>
          <div className="testimonial_author_container">
            {/* <div><img className='avatar' src="https://static.vecteezy.com/system/resources/previews/019/896/008/original/male-user-avatar-icon-in-flat-design-style-person-signs-illustration-png.png" alt="" /></div> */}
            <div className="testimonial_author_des_container">
              <span className="author_name">Mike O Neill</span>
              <br />
              <span className="des_name">
                Director of logistic servicesColorado Department of Public
                Safety
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testimonials;
