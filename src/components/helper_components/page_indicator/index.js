import React from "react";
import { ThemeFactory } from "utils/services/factory_services";

const GetDots = React.memo(({ videoLinks, index, FiberManual }) => {
  const { getVariantObj } = ThemeFactory();
  const { dark } = getVariantObj("primary");
  return videoLinks?.map((doc, i) => {
    const isActive = index - 1 == i;
    return (
      <FiberManual
        style={{
          fontSize: "16px",
          color: isActive ? dark.bgColor : "#d3d3d3 ",
          opacity: isActive ? "" : "0.5",
        }}
      />
    );
  });
});

export default GetDots;
