import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { bindActionCreators } from 'redux';
import { setRestBarClassAction, showErrorNotificationAction } from '../../../redux/action/ui';
import {
  isAdmin,
  checkUsernameValidation1,
  checkUsernameValidation2,
  getDeviceId,
  getParamFromUrl,
  setStorageAfterLogin,
  setStorageAfterRegisterLogin
} from '../../../utils';
import { apiBaseUrl } from '../../../config';
import { Buffer } from 'buffer';
import {
  setLoggedInAction,
  setLoginSuccessAction,
  setPasswordExpiredAction,
  setRegisterLoginSuccessAction
} from '../../../redux/action/auth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { instance } from '../../../http';

export const formSchema = (t) => {
  return Yup.object().shape({
    username: Yup.string()
      .required(t('username required'))
      .min(6, t('username min error'))
      .max(1024, t('username max error'))
      .test('is-valid-2', t('username invalid 2'), function (value) {
        return checkUsernameValidation2(value);
      })
      .test('is-valid-1', t('username invalid 1'), function (value) {
        return checkUsernameValidation1(value);
      })
  });
};

const FormLoginEntry = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    setFieldValue,
    setRestBarClass,
    setLoginSuccess,
    setLoggedIn,
    setPasswordExpired,
    showErrorNotification,
    setRegisterLoginSuccess,
    mobile // true when rendering from /mobile-login
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setClassName();
    const error = getParamFromUrl('error');
    if (error) {
      const decoded = Buffer.from(error, 'base64').toString('utf-8');
      try {
        const { message } = JSON.parse(decoded);
        showErrorNotification(message);
      } catch (e) {
        console.error('sso error response decode error', e);
      }
    } else {
      const data = getParamFromUrl('data');
      if (data) {
        const decoded = Buffer.from(data, 'base64').toString('utf-8');
        try {
          const { accessToken, refreshToken, orgId, userType, baseUri } = JSON.parse(decoded);
          const source = getParamFromUrl('source');
          if (source === 'create-account') {
            // if from onboarding
            const token = getParamFromUrl('token');
            setRegisterLoginSuccess({ token: accessToken, userType, organizationId: orgId });
            setLoggedIn({ loggedIn: true });
            setStorageAfterRegisterLogin({
              token: accessToken,
              baseUrl: baseUri
            });
            // todo encodeURIComponent
            navigate(`/create-account/username?token=${token}`);
          } else if (source === 'mobile') {
            // deliver token to app
            const payload = {
              command: 'login',
              baseUri: baseUri,
              accessToken: accessToken,
              refreshToken: refreshToken
            };
            // eslint-disable-next-line no-prototype-builtins
            if (window.hasOwnProperty('kenzenAndroidClient')) {
              window.kenzenAndroidClient.postMessage(JSON.stringify(payload));
              // eslint-disable-next-line no-prototype-builtins
            } else if (window.hasOwnProperty('webkit')) {
              window.webkit.messageHandlers.kenzenIosClient.postMessage(payload);
            } else {
              console.log('Oh shit. What do I do with the token');
            }
          } else {
            // if from login
            setLoginSuccess({ token: accessToken, userType, organizationId: orgId });
            setPasswordExpired(false);
            setLoggedIn({ loggedIn: true });
            localStorage.setItem('kop-v2-logged-in', 'true');
            setStorageAfterLogin({
              token: accessToken,
              refreshToken,
              userType,
              orgId,
              baseUrl: baseUri
            });
            if (isAdmin(userType)) {
              navigate('/select-mode');
            } else {
              navigate('/profile');
            }
          }
          // set api base url
          instance.defaults.baseURL = baseUri;
        } catch (e) {
          console.error('sso success response decode error', e);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFormField = (e) => {
    const { value, name } = e.target;
    setFieldValue(name, value);

    setClassName();
  };

  const setClassName = () => {
    let sum = 0;
    sum += values['username'] ? 1 : 0;
    setRestBarClass(`progress-${sum * 100}`);
  };

  const source = getParamFromUrl('source');
  const fromMobile = mobile || source === 'mobile';

  return (
    <Form className="form-group mt-57">
      <div>
        <div className="d-flex flex-column">
          <label className="font-input-label">{t('username')}</label>

          <input
            className="input input-field mt-10 font-heading-small text-white"
            name="username"
            value={values['username']}
            type="text"
            onChange={changeFormField}
          />

          {errors.username && touched.username && (
            <span className="font-helper-text text-error mt-10">{errors.username}</span>
          )}
        </div>

        <div className="mt-40 d-block">
          <Link
            to={`/forgot-username?from=${fromMobile ? 'mobile' : 'web'}`}
            className="font-input-label text-orange no-underline"
          >
            {t('forgot your username')}
          </Link>
        </div>
      </div>

      <div className="mt-80">
        <div>
          <button
            className={`button ${
              values['username'] ? 'active cursor-pointer' : 'inactive cursor-default'
            }`}
            type={values['username'] ? 'submit' : 'button'}
          >
            <span className="font-button-label text-white text-uppercase">{t('next')}</span>
          </button>
        </div>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    username: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: (values, { props }) => {
    const { showErrorNotification, t, mobile } = props;
    const source = getParamFromUrl('source');
    const fromMobile = mobile || source === 'mobile';
    const { username } = values;
    if (username?.includes('@')) {
      showErrorNotification(t('use your username'));
      return;
    }
    // in case mobile login, get device id from param
    let deviceId = getParamFromUrl('deviceId');
    if ([null, undefined, 'null', 'undefined', ''].includes(deviceId)) {
      deviceId = `web:${getDeviceId()}`;
    }
    // todo encodeURIComponent
    window.location.href = `${apiBaseUrl}/master/login?username=${username}&deviceId=${deviceId}&source=${
      fromMobile ? 'mobile' : 'web'
    }`;
  }
})(FormLoginEntry);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      setLoginSuccess: setLoginSuccessAction,
      setRegisterLoginSuccess: setRegisterLoginSuccessAction,
      setLoggedIn: setLoggedInAction,
      setPasswordExpired: setPasswordExpiredAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(EnhancedForm));
