import * as React from 'react';
import {withTranslation} from "react-i18next";

import clsx from 'clsx';
import style from './Input.module.scss';

const Input = (
  {
    prefix,
    width = 40,
    value,
    handleChange = () => {},
  }) => {
  return (
    <div className={clsx(style.Wrapper)}>
      {
        !!prefix &&
        <div className={clsx(style.Prefix)}>
          {prefix}
        </div>
      }
      <input
        className={clsx(style.Input)}
        style={{width: `${width}px`}}
        value={value}
        onChange={e => handleChange(e.target.value)}
      />
    </div>
  )
};

export default withTranslation()(Input);
