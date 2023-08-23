import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";

export const DisplayTextEditor = (props) => {
  let { disable, value, onChange, testid, placeholder, style, ...rest } = props;

  const handleChange = (event, editor) => {
    const data = editor.getData();
    onChange(data);
  };

  const onReady = (editor) => {
    if (editor) {
      editor.ui
        .getEditableElement()
        .parentElement.insertBefore(
          editor.ui.view.toolbar.element,
          editor.ui.getEditableElement()
        );
      editor.editing.view.change((writer) => {
        writer.setStyle(
          "height",
          style?.height || "450px",
          editor.editing.view.document.getRoot()
        );
        writer.setStyle(
          "font-family",
          "inherit",
          editor.editing.view.document.getRoot()
        );
      });
      editor.setData(value);
    }
  };

  const editorConfiguration = {
    placeholder: placeholder,
    removePlugins: ["ImageUpload", "MediaEmbed"],
  };

  return (
    <div
      testid={testid}
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <CKEditor
        editor={DecoupledEditor}
        data={value}
        disabled={disable}
        onChange={handleChange}
        config={editorConfiguration}
        onReady={onReady}
      ></CKEditor>
    </div>
  );
};
