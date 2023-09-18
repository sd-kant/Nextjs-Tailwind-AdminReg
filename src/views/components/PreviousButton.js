import React from 'react';
import backIcon from 'assets/images/back.svg';

const PreviousButton = ({ onClick, children }) => {
  return (
    <div
      className="tw-flex tw-gap-[5px] tw-justify-center tw-items-center tw-text-center tw-cursor-pointer"
      onClick={onClick}>
      <img src={backIcon} alt="back" />
      <span className="font-button-label tw-text-orange-400">{children}</span>
    </div>
  );
};

export default PreviousButton;
