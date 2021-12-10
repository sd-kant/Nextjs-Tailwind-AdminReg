import React from 'react';
import {CURRENT_VERSION} from "../../constant";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <div className={`footer`}>
      <span className='font-input-label'>
        v{CURRENT_VERSION} ©{year} All rights reserved Kenzen, Inc.
      </span>
    </div>
  );
}

export default Footer;