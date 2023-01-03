import * as React from 'react';
import {withTranslation} from "react-i18next";

import clsx from 'clsx';
import style from './Battery.module.scss';
import battery from '../../../assets/images/battery.svg';
import bolt  from '../../../assets/images/bolt-1.svg';

const Battery = (
  {
    percent = Math.floor(Math.random() * 100),
    customStyle,
    centered = false,
    charging,
  }) =>{

  const percentStyle = percent > 66 ? style.High : percent > 30 ? style.Normal : style.Low;

  return (
    <div className={clsx(style.Wrapper)} style={{...customStyle}}>
      <img src={battery} width={36} alt="battery"/>
      {
        charging &&
        <img className={clsx(style.Bolt)} src={bolt} width={15} alt="bolt"/>
      }

      <div className={clsx(centered ? style.CenteredLevel: style.Level, percentStyle)} style={{width: `${28 * percent / 100}px`}} />
    </div>
  )
};

export default withTranslation()(Battery);
