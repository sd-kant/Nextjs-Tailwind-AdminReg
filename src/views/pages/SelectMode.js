import React from 'react';
import logo from '../../assets/images/logo_light.svg';
import FormSelectMode from '../partials/su-dashboard/FormSelectMode';

const SelectMode = () => {
  return (
    <div className="form-main">
      <div className="form-header">
        <img className="form-header-logo" src={logo} alt="kenzen logo" />
      </div>
      <FormSelectMode />
    </div>
  );
};

export default SelectMode;
