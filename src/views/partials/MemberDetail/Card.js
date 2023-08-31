import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, className }) => {
  return (
    <div
      className={`tw-shadow-[0_15px_25px_0px_rgba(0,0,0,0.15)] tw-p-4 tw-bg-app-bg tw-rounded-[24px] ${className}`}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.array,
  className: PropTypes.string
};

export default Card;
