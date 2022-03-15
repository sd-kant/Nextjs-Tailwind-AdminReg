import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormSelectMode from "../partials/su-dashboard/FormSelectMode";


const SelectMode = () => {
  const {t} = useTranslation();

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
      </div>

      <FormSelectMode/>
    </div>
  )
}

export default SelectMode;