import React from 'react';

const BigButton = ({ onClick, children, icon = null }) => {
  return (
    <div className={`tap tw-cursor-pointer tw-text-center`} onClick={onClick}>
      {icon && <img src={icon} alt="male icon" />}

      <span className="font-binary tw-mt-[8px]">{children}</span>
    </div>
  );
};

export default BigButton;
