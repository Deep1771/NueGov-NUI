import React from "react";
import renderer from "react-test-renderer";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { SystemTextarea } from "../index";
import { data, fieldmeta } from "./utils_data";

afterEach(cleanup);

const defaultProps = {
  data,
  fieldmeta,
};

const setup = () => {
  const utils = render(
    <SystemTextarea {...defaultProps} onChange={onChange} />
  );
  const tree = renderer.create(<SystemTextarea {...defaultProps} />).toJSON();
  const input = utils.getByPlaceholderText("type here");
  return {
    input,
    tree,
    ...utils,
  };
};

const onChange = jest.fn();

describe("SYSTEM TEXTAREA TESTS", () => {
  const { input, tree } = setup();

  test("check SystemTextarea validation", () => {
    fireEvent.change(input, { target: { value: "12" } });
    expect(input.value).toMatch(defaultProps.fieldmeta.validationRegEx);
  });

  test("check metadata title", () => {
    fireEvent.change(input, { target: { title: "Textarea" } });
    expect(input.title).toMatch(defaultProps.fieldmeta.title);
  });

  test("check proptype & range of rows", () => {
    fireEvent.change(input, { target: { rows: 10 } });
    expect(input.rows).toBeTruthy();
  });

  test("check proptype & range of column", () => {
    fireEvent.change(input, { target: { cols: 25 } });
    expect(input.cols).toBeTruthy();
  });

  test("Check SystemTextbox be required field or not ", () => {
    expect(input).toBeRequired();
  });

  test("It should allow the data to be deleted", () => {
    fireEvent.change(input, { target: { value: "12345" } });
    expect(input.value).toBe("12345");
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
  });

  test("It should not allow data to be inputted/diabled", () => {
    expect(input).toBeDisabled();
  });

  test("To match snapshot", () => {
    expect(tree).toMatchSnapshot();
  });
});
