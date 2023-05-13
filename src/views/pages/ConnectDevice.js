import React from 'react';
import logo from '../../assets/images/logo_light.svg';
import FormConnectDevice from '../partials/su-dashboard/FormConnectDevice';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ConnectDevice = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="form-main">
      <div className="form-header">
        <img className="form-header-logo" src={logo} alt="kenzen logo" />
        &nbsp;&nbsp;
        <span className="form-header-text text-capitalize">
          &#47;&#47;&nbsp;&nbsp;{t('connect device')}
        </span>
      </div>

      <FormConnectDevice navigate={navigate} />
    </div>
  );
};

export default ConnectDevice;
