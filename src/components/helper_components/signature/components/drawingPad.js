import React, { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { DisplayButton } from "components/display_components";

const DrawingPad = (prop) => {
  const { onChange } = prop;
  const digital_draw = useRef(null);
  const [url, setUrl] = useState("");
  const [signaturePad, setSignaturePad] = useState();
  let color = "rgb(255, 255, 255)";

  useEffect(() => {
    const canvas = digital_draw.current;
    let signaturePad = new SignaturePad(canvas, {
      backgroundColor: color,
      onEnd: () => {
        let data = signaturePad.toDataURL();
        if (!signaturePad.isEmpty()) setUrl(data);
      },
    });
    setSignaturePad(signaturePad);
  }, []);

  useEffect(() => {
    onChange && onChange(url);
  }, [url]);

  const onClear = () => {
    setUrl(signaturePad.clear());
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        position: "relative",
      }}
    >
      <canvas ref={digital_draw} width="400" height="200" />
      <div style={{ position: "absolute", left: 0, bottom: 0 }}>
        <DisplayButton disabled={url ? false : true} onClick={onClear}>
          Clear
        </DisplayButton>
      </div>
    </div>
  );
};
export default DrawingPad;
