import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import renderer from "react-test-renderer";
import { SystemUrl } from "../index";
import { data, fieldmeta } from "./utils_data";

afterEach(cleanup);

const defaultProps = {
  data,
  fieldmeta,
};

const setup = () => {
  const utils = render(<SystemUrl {...defaultProps} onChange={onChange} />);
  const tree = renderer.create(<SystemUrl {...defaultProps} />).toJSON();
  const input = utils.getByPlaceholderText("Enter url here");
  return {
    input,
    tree,
    ...utils,
  };
};

const onChange = jest.fn();

describe("SYSTEM URL", () => {
  const { input, tree } = setup();

  test("checking props", () => {
    expect(defaultProps.data).toBeTruthy();
    expect(defaultProps.fieldmeta).toBeTruthy();
  });

  test("check metadata title", () => {
    fireEvent.change(input, { target: { title: "url" } });
    expect(input.title).toMatch(defaultProps.fieldmeta.title);
  });

  test("checking validation", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "www.99sc.com" } });
    expect(input).toBeValid();
  });

  test("checking onchange property", () => {
    expect(input.value).toMatch("");
    fireEvent.change(input, { target: { value: "www.99sc.com" } });
    expect(input.value).toBe("www.99sc.com");
  });

  test("checking disable property", () => {
    expect(input).toBeDisabled();
  });

  test("checking required property", () => {
    expect(input).not.toBeRequired();
  });

  test("To match snapshot", () => {
    expect(tree).toMatchSnapshot();
  });
});
