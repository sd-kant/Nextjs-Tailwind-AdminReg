import React from 'react';

const Radio = (props) => {
  return (
    <div className="mt-25">
      <label className="radio-container font-binary">
        {props.title}
        <input
          type="radio"
          name="radio"
          checked={props.answer === props.value}
          value={props.value}
          onChange={() => props.onChange(props.value)}
        />
        <span className="checkmark"/>
      </label>
    </div>
  )
}

const RadioGroup = (props) => {
  const options = props.options;
  return (
    <div>
      {
        options && options.map((option, index) => (
          <Radio
            key={`radio-${index}`}
            value={option.value}
            title={option.title}
            onChange={props.onChange}
            answer={props.answer}
          />
        ))
      }
    </div>
  )
}

export default RadioGroup;