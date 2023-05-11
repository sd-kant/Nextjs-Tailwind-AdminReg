import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { bindActionCreators } from 'redux';
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction
} from '../../../redux/action/ui';
import { loginWithCodeAction, setTokenAction } from '../../../redux/action/auth';
import CodeInput from '../../components/CodeInput';
import { get } from 'lodash';
import { getMyProfileWithToken, requestSmsCode } from '../../../http';
import { getParamFromUrl } from '../../../utils';
import backIcon from '../../../assets/images/back.svg';
import { useNavigate } from 'react-router-dom';

const FormPhoneVerification = (props) => {
  const {
    token,
    t,
    setRestBarClass,
    showErrorNotification,
    setLoading,
    mode,
    login,
    setToken,
    smsAuthFailedCount
  } = props;
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setClassName();
    getMyPhoneNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (code?.length === 6) {
      login({
        phoneNumber,
        loginCode: code,
        navigate
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    if (smsAuthFailedCount !== 0) {
      setCode('');
    }
  }, [smsAuthFailedCount]);

  const getMyPhoneNumber = async () => {
    if (mode === '0') {
      const phone = getParamFromUrl('phoneNumber');
      setPhoneNumber(phone);
    } else {
      if (token) {
        setLoading(true);
        try {
          const response = await getMyProfileWithToken(token);
          const { phoneNumber } = response?.data;
          setPhoneNumber(phoneNumber);
          if (mode?.toString() === '1') {
            // request sms code
            await requestSmsCode(phoneNumber);
          }
        } catch (e) {
          showErrorNotification(e.response?.data?.message);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const setClassName = () => {
    setRestBarClass(`progress-50`);
  };

  const resendCode = async () => {
    if (phoneNumber) {
      try {
        setLoading(true);
        await requestSmsCode(phoneNumber);
        setCode('');
      } catch (e) {
        showErrorNotification(e.response?.data?.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="form-group mt-57">
      <div>
        <div
          className="d-inline-flex align-center cursor-pointer"
          onClick={() => {
            setToken(null);
            navigate('/login');
          }}
        >
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange text-uppercase">{t('back to login')}</span>
        </div>

        <div className="d-flex mt-15 flex-column">
          <label className="font-heading-small text-capitalize">{t('2fa auth code')}</label>
        </div>

        <div className="mt-15">
          <span className={'font-binary'}>{t('2fa auth code description')}</span>
        </div>

        <div className="mt-15">
          <span className={'font-binary'}>{t('auth code description')}</span>
          &nbsp;
          <span className={'font-binary text-orange'}>
            <Trans
              i18nKey={'auth code number'}
              values={{
                number: phoneNumber?.slice(-4)
              }}
            />
          </span>
        </div>

        <div className="mt-40 d-flex flex-column">
          {/*todo don't accept alphabets*/}
          <CodeInput
            value={code}
            onChange={(v) => {
              setCode(v);
            }}
          />
        </div>

        <div className="mt-40">
          <div>
            <span className={'font-binary'}>{t('auth code not receive')}</span>
            &nbsp;
            <span className={'font-binary text-orange cursor-pointer'} onClick={resendCode}>
              {t('auth code resend')}
            </span>
          </div>

          <div>
            <span className={'font-binary'}>{t('2fa auth code contact administrator')}</span>
          </div>
        </div>
      </div>

      <div className="mt-80"></div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  token: get(state, 'auth.token'),
  smsAuthFailedCount: get(state, 'auth.smsAuthFailedCount')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      login: loginWithCodeAction,
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      setToken: setTokenAction
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(FormPhoneVerification));
