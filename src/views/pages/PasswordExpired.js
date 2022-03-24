import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import FormPasswordExpired from "../partials/su-login/FormPasswordExpired";
import {useTranslation} from "react-i18next";

const PasswordExpired = () => {
  const {t} = useTranslation();

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        <span className='form-header-text text-capitalize'>
          &#47;&#47;&nbsp;&nbsp;{t("password expired")}
        </span>
      </div>

      <FormPasswordExpired/>
    </div>
  )
}

export default PasswordExpired;
