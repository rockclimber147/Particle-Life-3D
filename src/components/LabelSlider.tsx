import { useState } from "react"

export type NumericLabelSliderProps = {
    title: string
    initialValue: number
    min: number
    max: number
    step: number
    onChange: (newVal: number) => void
    decimals?: number
}

export default function NumericLabelSlider (props: NumericLabelSliderProps) {
    let [uiValue, setUIValue] = useState<number>(props.initialValue)

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setUIValue(val)
        props.onChange(val)
    }
    return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>{props.title}: {props.decimals == null ? uiValue : uiValue.toFixed(props.decimals)}</label>
          <input 
            type="range" min={props.min} max={props.max} step={props.step} 
            value={uiValue} onChange={onChange} 
          />
    </div>
    )
}