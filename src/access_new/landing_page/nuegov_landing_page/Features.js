import React from "react";
import "../nuegov_landing_page/Features.css";
import Box from "@material-ui/core/Box";

let Feature = [
  {
    title: "Simple & Easy to Use",
    background: "#2193b0",
    shadow: "rgba(33, 147, 176, 0.5) 0px 6px 12px -2px;",
    description:
      "Become an expert user quickly with our intuitive design and experience",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/easy.svg",
    alt: "Ease of Use",
  },

  {
    title: "Cost Effective & Quick to Implement",
    background: "#2196F3",
    shadow: "rgba(33, 150, 243, 0.5) 0px 6px 12px -2px;",
    description: "Be operational in minutes without having to break the budget",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/cost.svg",
    alt: "Cost Effective Solutions",
  },

  {
    title: "Scalable",
    background: "#1CD8D2",
    shadow: "rgba(28, 216, 210, 0.5) 0px 6px 12px -2px;",
    description:
      "Add modules you need now and seamlessly expand to other modules as your needs change",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/scale.svg",
    alt: "Scalable Solutions",
  },

  {
    title: "Self-Service",
    background: "#00b09b",
    shadow: "rgba(101, 78, 163, 0.5) 0px 6px 12px -2px;",
    description:
      "Make changes using powerful tools and features immediately without any hassle",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/selfservice.svg",
    alt: "Self Service",
  },

  {
    title: "Automation",
    background: "#007991",
    shadow: "rgba(0, 121, 145, 0.5) 0px 6px 12px -2px;",
    description:
      "Take advantage of built in automation for notifications, approvals & reporting",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/automation.svg",
    alt: "Automate Business Process",
  },

  {
    title: "Business Workflows",
    background: "#ADD100",
    shadow: "rgba(173, 209, 0, 1) 0px 6px 12px -2px;",
    description:
      "Use workflows that are configured to your agency needs and processes",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/workflow.svg",
    alt: "Easy to use Business Workflows",
  },

  {
    title: "Audit History",
    background: "#DD5E89",
    shadow: "rgba(221, 94, 137, 0.5) 0px 6px 12px -2px;",
    description: "Track down any information or changes across the agency",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/audit.svg",
    alt: "Keep Track of audits",
  },

  {
    title: "Geofenced Notifications",
    background: "#1FA2FF",
    shadow: "rgba(31, 162, 255, 0.5) 0px 6px 12px -2px;",
    description:
      "Receive notifications based on the location and reduce unnecessary chatter",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/geolocation.svg",
    alt: "Get geo fenced Notifications",
  },

  {
    title: "Interactive Dashboards",
    background: "#757F9A",
    shadow: "rgba(117, 127, 154, 0.5) 0px 6px 12px -2px;",
    description: "Be able to drill down to data quickly in one click",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/dashboard.svg",
    alt: "Interactive dashboard with meaningful datasets",
  },

  {
    title: "Organizational Insights",
    background: "#F09819",
    shadow: "rgba(240, 152, 25, 0.5) 0px 6px 12px -2px;",
    description: "Understand the usage patterns to gain valuable intelligence",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/insights.svg",
    alt: "Get all the insights of organization",
  },

  {
    title: "Reports",
    background: "#3CA55C",
    shadow: "rgba(60, 165, 92, 0.5) 0px 6px 12px -2px;",
    description: "Use automated reports or on demand reports any time",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/report.svg",
    alt: "Generate custom reports",
  },

  {
    title: "User and Role based access",
    background: "#2193b0",
    shadow: "rgba(33, 147, 176, 0.5) 0px 6px 12px -2px;",
    description:
      "Eliminate clutter and have access to the information you need",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/role.svg",
    alt: "Permission Based access across the organization",
  },

  {
    title: "API Integrations",
    background: "#ff7e5f ",
    shadow: "rgba(255, 126, 95, 0.5) 0px 6px 12px -2px;",
    description:
      "Remove duplication & increase connectivity to other data sources and systems",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/api.svg",
    alt: "Different API Integrations",
  },

  {
    title: "Documents & Pictures",
    background: "#457fca",
    shadow: "rgba(69, 127, 202, 0.5) 0px 6px 12px -2px;",
    description: "Attach important information and find them quickly",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/documents.svg",
    alt: "Manage each Assets document & picture",
  },

  {
    title: "Google Integration",
    background: "#c2e59c",
    shadow: "rgba(194, 229, 156, 0.5) 0px 6px 12px -2px;",
    description:
      "Have the same map features you are used to but with your information",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/integration.svg",
    alt: "Google map integrated",
  },

  {
    title: "Partner Access",
    background: "#B993D6",
    shadow: "rgba(185, 147, 214, 0.5) 0px 6px 12px -2px;",
    description:
      "Give access to your contractors, consultants and vendors to improve efficiency",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/sharing.svg",
    alt: "Give access to your partner to improve efficiency",
  },

  {
    title: "Agency to Agency sharing",
    background: "#799F0C",
    shadow: "rgba(121, 159, 12, 0.5) 0px 6px 12px -2px;",
    description: "Share information across departments and agency boundaries.",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/agencytoagency.svg",
    alt: "Share your data with other agency",
  },

  {
    title: "Statewide, regional Licensing Model",
    background: "#396afc",
    shadow: "rgba(57, 106, 252, 0.5) 0px 6px 12px -2px;",
    description: "Share solution with the agencies your agents works with",
    image:
      "https://assetgov-icons.s3.us-west-2.amazonaws.com/Landingpage/Feature_icon/licensingmodel.svg",
    alt: "Different types of Licensing Model",
  },
];

const Features = () => {
  return (
    <div className="feature_main_container">
      <span className="feature_header">
        Experience and explore benefits of using NueGOV solution
      </span>
      <Box className="feature_cards_container">
        {Feature.map((Feature) => {
          const card = (
            <Box>
              <Box style={{ borderRadius: "1rem" }} className="feature_card">
                <Box
                  sx={{
                    background: `${Feature.background}`,
                    boxShadow: `${Feature.shadow}`,
                  }}
                  className="feature_icon_container"
                >
                  <img
                    className="feature_icon"
                    src={Feature.image}
                    alt={Feature.alt}
                  />
                </Box>
                <Box
                  sx={{ background: `${Feature.background}` }}
                  className="custom_divider"
                ></Box>
                <Box className="feature_text_container">
                  <span className="feature_name">{Feature.title}</span>
                  <span className="feature_description">
                    {Feature.description}
                  </span>
                </Box>
              </Box>
            </Box>
          );
          return card;
        })}
      </Box>
    </div>
  );
};

export default Features;
