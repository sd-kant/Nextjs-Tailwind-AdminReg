import React from 'react';
import logo from '../../assets/images/logo_light.svg';
import { Trans, useTranslation } from 'react-i18next';
import FormLoginEntry from '../partials/su-login/FormLoginEntry';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import style from './LoginEntry.module.scss';
import { isProductionMode } from '../../App';

const LoginEntry = ({ mobile }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      {!isProductionMode && (
        <div className={clsx(style.Banner)}>
          <div className={clsx(style.Wrapper)}>
            <p className={clsx(style.Header, 'font-heading-small')}>{t('attention customers')}</p>
            <p className={clsx(style.Description, 'font-heading-small')}>
              <Trans
                i18nKey={'attention guide'}
                components={{
                  a1: <a href="https://portal.kenzen.com" />
                }}
                values={{
                  link: 'https://portal.kenzen.com'
                }}
              />
            </p>
          </div>
        </div>
      )}
      <div className="form-main">
        <div className="form-header">
          <img className="form-header-logo" src={logo} alt="kenzen logo" />
          &nbsp;&nbsp;
          <span className="form-header-text text-capitalize">
            &#47;&#47;&nbsp;&nbsp;{t('sign in')}
          </span>
        </div>

        <FormLoginEntry mobile={mobile} navigate={navigate} />
      </div>
    </>
  );
};

export default LoginEntry;
