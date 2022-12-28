import * as React from 'react';
import {withTranslation} from "react-i18next";

import clsx from 'clsx';
import style from './BatteryV2.module.scss';
import battery from '../../../assets/images/battery-white.svg';
import bolt  from '../../../assets/images/bolt-gray.svg';

const BatteryV2 = (
  {
    percent = Math.floor(Math.random() * 100),
    charging,
  }) =>{
  const colorStyle = React.useMemo(() => {
    if (percent > 67) {
      return style.White;
    } else if (percent > 33) {
      return style.White;
    } else if (percent > 20) {
      return style.Yellow;
    } else if (percent > 10) {
      return style.Red;
    } else {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent]);
  return (
    <div className={clsx(style.TopWrapper)}>
      <div className={clsx(style.Wrapper)}>
        <img src={battery} width={36} alt="battery"/>
        {
          charging &&
          <img className={clsx(style.Bolt)} src={bolt} width={15} alt="bolt"/>
        }
        {
          percent > 10 &&
          <div className={clsx(style.Piece, style.Piece1, colorStyle)}/>
        }
        {
          percent > 20 &&
          <div className={clsx(style.Piece, style.Piece2, colorStyle)}/>
        }
        {
          percent > 33 &&
          <div className={clsx(style.Piece, style.Piece3, colorStyle)}/>
        }
        {
          percent > 67 &&
          <div className={clsx(style.Piece, style.Piece4, colorStyle)}/>
        }
      </div>
    </div>
  )
};

export default withTranslation()(BatteryV2);
