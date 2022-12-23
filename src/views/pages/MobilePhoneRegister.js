import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormMobilePhoneRegister from "../partials/su-login/FormMobilePhoneRegister";
import {useNavigate} from "react-router-dom";

const MobilePhoneRegister = () => {
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

      <FormMobilePhoneRegister
        navigate={navigate}
      />
    </div>
  )
}

export default MobilePhoneRegister;