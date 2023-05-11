import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import backIcon from '../../../assets/images/back.svg';
import { bindActionCreators } from 'redux';
import { getParamFromUrl } from '../../../utils';
import { setLoadingAction, showErrorNotificationAction } from '../../../redux/action/ui';
import CodeInput from '../../components/CodeInput';
import { loginWithCodeAction } from '../../../redux/action/auth';
import { requestSmsCode } from '../../../http';
import { get } from 'lodash';
import { useNavigate } from 'react-router-dom';

const FormPhoneVerification = (props) => {
  const { t, setRestBarClass, showErrorNotification, setLoading, login, smsAuthFailedCount } =
    props;
  const [code, setCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyPhoneNumber().then();
    setRestBarClass('progress-18');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (code?.length === 6) {
      login({
        phoneNumber,
        loginCode: code,
        fromRegister: true,
        navigate
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const getMyPhoneNumber = async () => {
    const phone = getParamFromUrl('phoneNumber');
    setPhoneNumber(phone);
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

  useEffect(() => {
    if (smsAuthFailedCount !== 0) {
      setCode('');
    }
  }, [smsAuthFailedCount]);

  return (
    <div className="form-group mt-57">
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate('/create-account/phone-register')}
        >
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange">{t('previous')}</span>
        </div>

        <div className="mt-25">
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
          <CodeInput
            value={code}
            onChange={(v) => {
              setCode(v);
            }}
          />
        </div>

        <div className="mt-40">
          <span className={'font-binary'}>{t('auth code not receive')}</span>
          &nbsp;
          <span className={'font-binary text-orange cursor-pointer'} onClick={resendCode}>
            {t('auth code resend')}
          </span>
        </div>
      </div>

      <div className="mt-80" />
    </div>
  );
};

const mapStateToProps = (state) => ({
  smsAuthFailedCount: get(state, 'auth.smsAuthFailedCount')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      showErrorNotification: showErrorNotificationAction,
      setLoading: setLoadingAction,
      login: loginWithCodeAction
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(FormPhoneVerification));
