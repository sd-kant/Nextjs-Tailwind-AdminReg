import React from 'react';
import PropTypes from 'prop-types';

const Divider = ({ className }) => {
  return <div className={`tw-bg-white tw-h-[1px] tw-opacity-25 ${className}`} />;
};

Divider.propTypes = {
  className: PropTypes.string
};

export default Divider;
