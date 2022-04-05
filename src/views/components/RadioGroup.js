import React from 'react';

const Radio = (props) => {
  const {title, answer, value, disabled, onChange} = props;
  const checked = answer === value;
  return (
    <div className="mt-25">
      <label className={`radio-container font-binary ${disabled ? 'text-gray cursor-default' : 'text-white'}`}>
        {title}
        <input
          type="radio"
          name="radio"
          checked={checked}
          value={value}
          onChange={() => disabled ? {} : onChange(value)}
        />
        <span className={`checkmark ${!checked && disabled ? 'disabled' : ''}`}/>
      </label>
    </div>
  )
}

const RadioGroup = (props) => {
  const {options, disabled, onChange, answer} = props;
  return (
    <div>
      {
        options && options.map((option, index) => (
          <Radio
            key={`radio-${index}`}
            disabled={disabled}
            value={option.value}
            title={option.title}
            onChange={onChange}
            answer={answer}
          />
        ))
      }
    </div>
  )
}

export default RadioGroup;