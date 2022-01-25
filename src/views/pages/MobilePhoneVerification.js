import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormMobilePhoneVerification from "../partials/su-login/FormMobilePhoneVerification";


const MobilePhoneVerification = (props) => {
  const {t} = useTranslation();
  const mode = props.match.params.mode;

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        <span className='form-header-text text-capitalize'>
          //&nbsp;&nbsp;{t("sign in")}
        </span>
      </div>

      <FormMobilePhoneVerification
        mode={mode}
      />
    </div>
  )
}

export default MobilePhoneVerification;