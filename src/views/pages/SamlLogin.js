import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormSamlLogin from "../partials/su-login/FormSamlLogin";
import {useNavigate} from "react-router-dom";


const SamlLogin = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        <span className='form-header-text text-capitalize'>
          &#47;&#47;&nbsp;&nbsp;{t("sso saml sign in")}
        </span>
      </div>

      <FormSamlLogin
        navigate={navigate}
      />
    </div>
  )
}

export default SamlLogin;