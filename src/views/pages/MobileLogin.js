import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormMobileLogin from "../partials/su-login/FormMobileLogin";
import {useNavigate} from "react-router-dom";


const MobileLogin = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
        <span className='form-header-text text-capitalize'>
          //&nbsp;&nbsp;{t("sign in")}
        </span>
      </div>

      <FormMobileLogin
        navigate={navigate}
      />
    </div>
  )
};

export default MobileLogin;