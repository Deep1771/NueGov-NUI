import React from "react";
import { Component } from "react";
import Features from "../nuegov_landing_page/Features";
import Hero from "../nuegov_landing_page/Hero";
import Solutions from "../nuegov_landing_page/Solutions";
import Testimonials from "../nuegov_landing_page/Testimonials";
import Footer from "access_new/components/Footer";
import Community from "./community";

export default class Home extends Component {
  render() {
    return (
      <div>
        <Hero />
        <Solutions />
        <Testimonials />
        <Features />
        <Community />
        <Footer />
      </div>
    );
  }
}
