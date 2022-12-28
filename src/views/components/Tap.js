import React from "react";

const Tap = (props) => {
  const options = props.options;
  const activeOption = props.activeOption;

  return (
    <div className='custom-radio d-flex align-center justify-center'>
      {
        options && options.map((option, index) => (
          <div
            className={`custom-radio-option d-flex align-center justify-center cursor-pointer ${activeOption === option.value ? 'active' : ''}`}
            key={`custom-radio-option-${index}`}
            onClick={() => props.setActiveOption(option.value)}
          >
            <span className='font-button-label'>
              {option.title}
            </span>
          </div>
        ))
      }
    </div>
  )
};

export default Tap;