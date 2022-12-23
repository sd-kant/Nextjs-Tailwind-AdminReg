import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormPhoneVerification from "../partials/su-login/FormPhoneVerification";
import {useParams} from "react-router-dom";

const PhoneVerification = () => {
  const {t} = useTranslation();
  const {mode} = useParams();

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

      <FormPhoneVerification
        mode={mode}
      />
    </div>
  )
}

export default PhoneVerification;