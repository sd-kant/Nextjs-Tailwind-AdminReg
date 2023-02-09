import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import FormForgotPassword from "../partials/su-login/FormForgotPassword";


const ForgotPassword = () => {
  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        <span className='form-header-text text-capitalize'>
          {/*//&nbsp;&nbsp;{t("admin sign in")}*/}
        </span>
      </div>

      <FormForgotPassword/>
    </div>
  )
};

export default ForgotPassword;