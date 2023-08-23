import React, { useState, useEffect } from "react";
import { AssessmentPanel } from "nueassist/containers/extension_containers/assessement_panel/index";

export const SystemAssessment = (props) => {
  const { callbackValue, data } = props;
  const [assessmentTree, setAssessmentTree] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const [open, setOpen] = useState(false);

  const setTree = (val) => {
    setAssessmentTree(val);
  };

  useEffect(() => {
    data?.length > 0 && setAssessmentTree(data);
  }, []);

  useEffect(() => {
    setInitialData(data);
  }, [data]);

  useEffect(() => {
    assessmentTree?.length > 0 &&
      callbackValue(assessmentTree ? assessmentTree : null, props);
  }, [assessmentTree]);

  return (
    <div style={{ display: "flex", flex: 1, height: "100%", width: "100%" }}>
      <AssessmentPanel
        handleAssessmentTree={setTree}
        initData={initialData}
        setOpen={setOpen}
      />
    </div>
  );
};
