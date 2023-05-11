import * as React from 'react';
import clsx from 'clsx';
import style from './ButtonGroup.module.scss';
import Button from '../Button';

const ButtonGroup = ({
  size,
  colorOn = 'white',
  bgColorOn = 'orange',
  colorOff = 'white',
  bgColorOff = 'gray',
  disabled = false,
  rounded,
  options = [],
  value,
  id,
  setValue
}) => {
  return (
    <div className={clsx(style.Wrapper)}>
      {options?.map((option, index) => {
        return (
          <Button
            key={`${id}-${index}`}
            size={size}
            color={option.value === value ? colorOn : colorOff}
            bgColor={option.value === value && !disabled ? bgColorOn : bgColorOff}
            borderColor={option.value === value ? bgColorOn : bgColorOff}
            title={option.title}
            rounded={rounded}
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                setValue(option.value);
              }
            }}
          />
        );
      })}
    </div>
  );
};

export default ButtonGroup;
