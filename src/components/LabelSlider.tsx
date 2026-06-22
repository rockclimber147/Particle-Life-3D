import { useState } from "react";

export type NumericLabelSliderProps = {
  title: string;
  initialValue: number;
  min: number;
  max: number;
  step: number;
  onChange: (newVal: number) => void;
  decimals?: number;
};

function stepDecimals(step: number): number {
  const stepStr = step.toString();
  const dot = stepStr.indexOf(".");
  return dot === -1 ? 0 : stepStr.length - dot - 1;
}

function formatDisplayValue(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

export default function NumericLabelSlider(props: NumericLabelSliderProps) {
  const displayDecimals = props.decimals ?? stepDecimals(props.step);
  let [uiValue, setUIValue] = useState<number>(props.initialValue);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setUIValue(val);
    props.onChange(val);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label>
        {props.title}: {formatDisplayValue(uiValue, displayDecimals)}
      </label>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={uiValue}
        onChange={onChange}
      />
    </div>
  );
}
