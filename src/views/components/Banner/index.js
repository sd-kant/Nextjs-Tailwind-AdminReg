import * as React from 'react';

const Banner = ({ label }) => {
  return (
    <div className="tw-bg-orange-500 text-white text-center tw-text-base tw-font-medium">
      {label}
    </div>
  );
};

export default Banner;
