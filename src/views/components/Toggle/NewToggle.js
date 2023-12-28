import * as React from 'react';
import clsx from 'clsx';
import style from './Toggle.module.scss';

const ToggleButton = ({ selected, title, handleClick }) => {
  return (
    <div
      className={clsx(
        'flex-inline-block',
        'tw-text-white',
        'tw-rounded-full',
        'tw-p-2',
        'tw-cursor-pointer',
        selected ? 'tw-bg-orange-500' : style.InActive
      )}
      onClick={handleClick}>
      <span className={clsx(style.TxtEllipse1, 'font-button-label')}>{title}</span>
    </div>
  );
};

const Toggle = ({
  on = false,
  handleSwitch = () => {},
  titleOn = 'Imperial',
  titleOff = 'Metric',
  remove = false
}) => {
  return (
    <div className={clsx('tw-flex tw-flex-row tw-gap-2 tw-bg-zinc-800 tw-rounded-full tw-p-1')}>
      {remove && on && (
        <ToggleButton selected={on} title={titleOff} handleClick={() => handleSwitch(!on)} />
      )}
      {remove && !on && (
        <ToggleButton selected={!on} title={titleOn} handleClick={() => handleSwitch(!on)} />
      )}
      {!remove && (
        <>
          <ToggleButton selected={!on} title={titleOn} handleClick={() => handleSwitch(!on)} />
          <ToggleButton selected={on} title={titleOff} handleClick={() => handleSwitch(!on)} />
        </>
      )}
    </div>
  );
};

export default Toggle;
