import React from 'react';
import logo from "../../assets/images/logo_light.svg";
import FormConnectDeviceSuccess from "../partials/su-dashboard/FormConnectDeviceSuccess";
import {useTranslation} from "react-i18next";

const ConnectDeviceSuccess = () => {
  const {t} = useTranslation();
  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        <span className='form-header-text text-capitalize'>
          &#47;&#47;&nbsp;&nbsp;{t("connect device success")}
        </span>
      </div>

      <FormConnectDeviceSuccess/>
    </div>
  )
};

export default ConnectDeviceSuccess;
