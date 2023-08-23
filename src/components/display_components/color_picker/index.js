import React from "react";
import {
  AlphaPicker,
  BlockPicker,
  ChromePicker,
  CirclePicker,
  CompactPicker,
  GithubPicker,
  HuePicker,
  MaterialPicker,
  PhotoshopPicker,
  SketchPicker,
  SliderPicker,
  SwatchesPicker,
  TwitterPicker,
} from "react-color";

const PICKERS = {
  ALPHA: AlphaPicker,
  BLOCK: BlockPicker,
  CHROME: ChromePicker,
  CIRCLE: CirclePicker,
  COMPACT: CompactPicker,
  GITHUB: GithubPicker,
  HUE: HuePicker,
  MATERIAL: MaterialPicker,
  PHOTOSHOP: PhotoshopPicker,
  SKETCH: SketchPicker,
  SLIDER: SliderPicker,
  SWATCHES: SwatchesPicker,
  TWITTER: TwitterPicker,
};

export const DisplayColorPicker = (props) => {
  const { mode, ...rest } = props;
  const PickerComponent = PICKERS[mode];

  return <PickerComponent {...rest} />;
};

DisplayColorPicker.defaultProps = {
  mode: "CHROME",
  width: "100%",
};
