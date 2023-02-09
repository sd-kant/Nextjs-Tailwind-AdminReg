import * as React from 'react';
import clsx from 'clsx';
import style from './Toggle.module.scss';

const ToggleButton = (
  {
    selected,
    title,
    handleClick,
  }) => {
  return (
    <div
      className={clsx(style.ToggleButtonWrapper, selected ? style.Active : style.InActive)}
      onClick={handleClick}
    >
      <span className={clsx(style.TxtEllipse1, "font-button-label")}>
        {title}
      </span>
    </div>
  )
};

const Toggle = (
  {
    on = false,
    handleSwitch = () => {},
    titleOn = 'Imperial',
    titleOff = 'Metric'
  }) => {
  return (
    <div className={clsx(style.Wrapper)}>
      <ToggleButton
        selected={!on}
        title={titleOn}
        handleClick={() => handleSwitch(!on)}
      />

      <ToggleButton
        selected={on}
        title={titleOff}
        handleClick={() => handleSwitch(!on)}
      />
    </div>
  )
};

export default Toggle;