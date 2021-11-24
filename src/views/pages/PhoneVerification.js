import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormPhoneVerification from "../partials/su-login/FormPhoneVerification";


const PhoneVerification = (props) => {
  const {t} = useTranslation();
  const mode = props.match.params.mode;

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        <span className='form-header-text text-capitalize'>
          //&nbsp;&nbsp;{t("admin sign in")}
        </span>
      </div>

      <FormPhoneVerification
        mode={mode}
      />
    </div>
  )
}

export default PhoneVerification;