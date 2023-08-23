import React, { useState, useEffect } from "react";
import { DisplayButton } from "components/display_components";
const TextPad = (prop) => {
  const { onChange } = prop;
  const [digitalValue, setDigitalValue] = useState("");
  const [data, setData] = useState();
  // let font = ['monospace' ]

  function updateCanvas(text) {
    setDigitalValue(text);
    var c = document.getElementById("digital-pad");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 400, 200);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 400, 200);
    var gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, "black");
    ctx.fillStyle = gradient;
    var fontface = "cursive";
    ctx.font = "30px cursive";
    ctx.textAlign = "center";
    var fontsize = 50;
    do {
      fontsize--;
      ctx.font = fontsize + "px " + fontface;
    } while (ctx.measureText(text).width > c.width);
    ctx.fillText(text, 150, 100);
    let url = ctx.canvas.toDataURL();
    if (text) setData(url);
    else setData(null);
  }

  useEffect(() => {
    onChange && onChange(data);
  }, [data]);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        justifyContent: "center",
        width: 400,
        height: 200,
        flexDirection: "column",
        position: "relative",
      }}
    >
      <input
        value={digitalValue}
        onChange={(v) => {
          updateCanvas(v.target.value);
        }}
        placeholder="Type Here"
        type="text"
        style={{
          fontSize: "32px",
          fontFamily: "cursive",
          display: "block",
          border: "none",
          outline: "none",
          textAlign: "center",
        }}
      />
      <div style={{ position: "absolute", left: 0, bottom: 0 }}>
        <DisplayButton
          disabled={digitalValue ? false : true}
          onClick={() => {
            setDigitalValue("");
            setData(null);
          }}
        >
          Clear
        </DisplayButton>
      </div>
      <canvas
        id="digital-pad"
        style={{
          border: "1px gray solid",
          alignSelf: "center",
          display: "none",
        }}
      ></canvas>
    </div>
  );
};
export default TextPad;
