import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import FormForgotUsername from "../partials/su-login/FormForgotUsername";
import {withTranslation} from "react-i18next";

const ForgotUsername = ({t}) => {
  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        <span className='form-header-text text-capitalize'>
          &#47;&#47;&nbsp;&nbsp;{t("forgot username")}
        </span>
      </div>

      <FormForgotUsername/>
    </div>
  )
};

export default withTranslation()(ForgotUsername);