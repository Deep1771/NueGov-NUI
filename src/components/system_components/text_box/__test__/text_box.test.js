import React from "react";
import {
  render,
  fireEvent,
  cleanup,
  getByPlaceholderText,
} from "@testing-library/react";
import renderer from "react-test-renderer";
import { SystemTextbox } from "../index";
import { data, fieldmeta } from "./utils_data";

afterEach(cleanup);

const onChange = jest.fn();

const defaultProps = {
  data,
  fieldmeta,
  onChange,
};

const setup = () => {
  const utils = render(<SystemTextbox {...defaultProps} />);
  const input = utils.getByPlaceholderText("select textbox");
  const tree = renderer.create(<SystemTextbox {...defaultProps} />).toJSON();

  return {
    input,
    tree,
    ...utils,
  };
};

describe("SystemTextbox Test", () => {
  const { input, tree } = setup();
  test("should contain metadata and data", () => {
    expect(defaultProps.fieldmeta).toBeTruthy();
    expect(defaultProps.data).toBeTruthy();
  });

  test("Check SystemTextbox be required field or not ", () => {
    expect(input).toBeRequired();
  });

  test("check SystemTextbox be disabled or not ", () => {
    expect(input).not.toBeDisabled();
  });

  test("check SystemTextbox email validation", () => {
    fireEvent.change(input, { target: { value: "acewvr@gmail.com" } });
    expect(input.value).toMatch(defaultProps.fieldmeta.validationRegEx);
  });

  test("SystemTextbox changes the text", () => {
    expect(input.value).toMatch("");
    fireEvent.change(input, { target: { value: "enter value" } });
    expect(input.value).toBe("enter value");
  });

  test("snapshot component", () => {
    expect(tree).toMatchSnapshot();
  });
});
