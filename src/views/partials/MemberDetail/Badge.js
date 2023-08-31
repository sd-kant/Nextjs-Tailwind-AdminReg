import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({ status }) => {
  let className = 'tw-bg-app-status-off';
  if (status == 'risk') {
    className = 'tw-bg-app-status-at-risk';
  } else if (status == 'safe') {
    className = 'tw-bg-app-status-safe';
  } else if (status == 'sleep') {
    className = 'tw-bg-app-status-sleep';
  }
  return <div className={`tw-rounded-full tw-h-[10px] tw-w-[10px] ${className}`}></div>;
};

Badge.propTypes = {
  status: PropTypes.oneOf(['risk', 'safe', 'sleep', 'off']).isRequired
};

export default Badge;
