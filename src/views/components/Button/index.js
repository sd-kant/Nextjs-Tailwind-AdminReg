import * as React from 'react';

import clsx from 'clsx';
import style from './Button.module.scss';

const Button = (
  {
    size = 'md',
    color = "white",
    bgColor = "orange",
    title = 'ok',
    rounded = false,
    onClick = () => {},
  }) => {

  const calcColor = () => {
    switch (color) {
      case 'white':
        return 'white';
      case 'green':
        return '#36F3BB';
      default:
        return 'white';
    }
  };

  const calcBgColor = () => {
    switch (bgColor) {
      case 'orange':
        return '#DE7D2C';
      case 'gray':
        return '#272727';
      case 'green':
        return '#2B5734';
      case "black":
        return '#212121';
      default:
        return '#DE7D2C';
    }
  };

  const calcSizeStyle = () => {
    switch (size) {
      case 'xs':
        return style.XS;
      case 'sm':
        return style.SM;
      case 'md':
        return style.MD;
      case 'lg':
        return style.LG;
      default:
        return style.MD;
    }
  };

  const calcTxtSizeStyle = () => {
    switch (size) {
      case 'sm':
        return 'font-button-label-sm';
      case 'md':
        return 'font-button-label';
      default:
        return 'font-button-label';
    }
  };

  return (
    <div
      className={clsx(style.Wrapper, calcSizeStyle(), rounded ? style.Rounded : null)}
      style={{color: calcColor(), backgroundColor: calcBgColor()}}
      onClick={onClick}
    >
      <span
        className={clsx(calcTxtSizeStyle())}
      >
        {title}
      </span>
    </div>
  )
}

export default Button;

