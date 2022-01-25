import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormSULogin from "../partials/su-login/FormSULogin";


const SULogin = (props) => {
  const {t} = useTranslation();

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        <span className='form-header-text text-capitalize'>
          //&nbsp;&nbsp;{t("admin sign in")}
        </span>
      </div>

      <FormSULogin/>
    </div>
  )
}

export default SULogin;