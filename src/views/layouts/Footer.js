import React from 'react';
import pjson from '../../../package.json';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <div className={`footer`}>
      <span className="font-input-label">
        v{pjson.version} ©{year} All rights reserved Kenzen, Inc.
      </span>
    </div>
  );
};

export default Footer;
