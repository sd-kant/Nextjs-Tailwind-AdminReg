import React from 'react';

const BaseLayout = ({children}) => {
  return (
    <div className='tw-flex'>
      {children}
    </div>
  );
};

export default BaseLayout;
