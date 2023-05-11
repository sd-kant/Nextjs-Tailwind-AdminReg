import React from 'react';

import yesIcon from '../../../assets/images/yes.svg';
import yesGrayIcon from '../../../assets/images/yes-gray.svg';
import noIcon from '../../../assets/images/no.svg';
import noGrayIcon from '../../../assets/images/no-gray.svg';

const TrueFalse = ({ answer, options, onChange, disabled = false }) => {
  return (
    <React.Fragment>
      {options &&
        options.map((option, index) => {
          const active = option.value?.toString() === answer?.toString();
          const icon =
            active || !disabled
              ? option.icons?.active ?? (index === 0 ? yesIcon : noIcon)
              : option.icons?.inactive ?? (index === 0 ? yesGrayIcon : noGrayIcon);

          return (
            <div
              className={`tap ${active ? 'active' : ''} ${active && !disabled ? 'border' : ''} ${
                disabled ? 'disabled' : 'cursor-pointer'
              } ${index !== 0 ? 'ml-40' : ''}`}
              onClick={() => {
                if (!disabled) onChange(option.value);
              }}
              key={`option-${index}`}
            >
              <img src={icon} alt={`${option.title.toLowerCase()} icon`} />

              <span className={`font-binary mt-8 text-white`}>{option.title}</span>
            </div>
          );
        })}
    </React.Fragment>
  );
};

export default TrueFalse;
