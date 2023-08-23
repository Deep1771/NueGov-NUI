import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { GlobalFactory } from "utils/services/factory_services";

const KEY_BACKSPACE = "Backspace";
const KEY_F2 = "F2";
const KEY_ENTER = "Enter";
const KEY_TAB = "Tab";
const KEY_ARROW_LEFT = "ArrowLeft";
const KEY_ARROW_RIGHT = "ArrowRight";

export default memo(
  forwardRef((props, ref) => {
    const { setSnackBar } = GlobalFactory();

    const createInitialState = () => {
      let startValue;
      let highlightAllOnFocus = true;
      const eventKey = props.eventKey;

      if (eventKey === KEY_BACKSPACE) {
        // if backspace or delete pressed, we clear the cell
        startValue = "";
      } else if (eventKey && eventKey.length === 1) {
        // if a letter was pressed, we start with the letter
        startValue = eventKey;
        highlightAllOnFocus = false;
      } else {
        // otherwise we start with the current value
        startValue = props.value;
        if (eventKey === KEY_F2) {
          highlightAllOnFocus = false;
        }
      }

      return {
        value: startValue,
        highlightAllOnFocus,
      };
    };

    const initialState = createInitialState();
    const [value, setValue] = useState(initialState.value);
    const [highlightAllOnFocus, setHighlightAllOnFocus] = useState(
      initialState.highlightAllOnFocus
    );
    const refInput = useRef(null);

    // focus on the input
    useEffect(() => {
      // get ref from React component
      const eInput = refInput.current;
      eInput.focus();
      if (highlightAllOnFocus) {
        eInput.select();

        setHighlightAllOnFocus(false);
      } else {
        // when we started editing, we want the caret at the end, not the start.
        // this comes into play in two scenarios:
        //   a) when user hits F2
        //   b) when user hits a printable character
        const length = eInput.value ? eInput.value.length : 0;
        if (length > 0) {
          eInput.setSelectionRange(length, length);
        }
      }
    }, []);

    /* Utility Methods */
    const isCharacter = props.eventKey && props.eventKey.length === 1;
    const cancelBeforeStart =
      isCharacter && "1234567890".indexOf(props.eventKey) < 0;

    const isLeftOrRight = (event) => {
      return [KEY_ARROW_LEFT, KEY_ARROW_RIGHT].indexOf(event.key) > -1;
    };

    const isCharNumeric = (charStr) => {
      return !!/\d/.test(charStr);
    };

    const isNumericKey = (event) => {
      const charStr = event.key;
      return isCharNumeric(charStr);
    };

    const isBackspace = (event) => {
      return event.key === KEY_BACKSPACE;
    };

    const finishedEditingPressed = (event) => {
      const key = event.key;
      return key === KEY_ENTER || key === KEY_TAB;
    };

    const onKeyDown = (event) => {
      if (isLeftOrRight(event) || isBackspace(event)) {
        event.stopPropagation();
        return;
      }

      if (!finishedEditingPressed(event) && !isNumericKey(event)) {
        if (event.preventDefault) event.preventDefault();
      }

      if (finishedEditingPressed(event)) {
        props.stopEditing();
      }
    };

    /* Component Editor Lifecycle methods */
    useImperativeHandle(ref, () => {
      return {
        // the final value to send to the grid, on completion of editing
        getValue() {
          return value === "" || value == null ? null : parseInt(value);
        },

        // Gets called once before editing starts, to give editor a chance to
        // cancel the editing before it even starts.
        isCancelBeforeStart() {
          return cancelBeforeStart;
        },

        // Gets called once when editing is finished (eg if Enter is pressed).
        // If you return true, then the result of the edit will be ignored.
        isCancelAfterEnd() {
          // will reject the number if it greater than 1,000,000
          // not very practical, but demonstrates the method.
          const finalValue = this.getValue();
          let remainQant = props?.data?.currentQuantity;
          if (remainQant < finalValue) {
            // //slashing the rows
            let rowNode1 = props.api.getRowNode(props.rowIndex);
            let column1 = props.colDef.field;

            // console.log("rowNode1 -> ", rowNode1, column1);
            props.api.flashCells({ rowNodes: [rowNode1], columns: [column1] });
            setSnackBar({
              message: `The required number should be less than current value`,
              severity: "error",
              autoHideDuration: 3000,
            });
            return finalValue;
          } else {
            let rowNode = props.api.getRowNode(props.rowIndex);
            rowNode.setDataValue(props.colDef.field, finalValue);

            //updating the linevalue when added qreq
            let unitCost = props?.data?.purchasePricePerUnit;
            let lineValue = unitCost * finalValue;
            rowNode.setDataValue("lineValue", lineValue);
          }
        },
      };
    });

    return (
      <input
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          outline: "solid white",
        }}
        ref={refInput}
        value={value}
        onChange={(event) => {
          // console.log("the event is on change number -> ", event);
          setValue(event.target.value);
          let rowNode = props.api.getRowNode(props.rowIndex);
          rowNode.setDataValue(props.colDef.field, event.target.value);
        }}
        onKeyDown={(event) => onKeyDown(event)}
      />
    );
  })
);
