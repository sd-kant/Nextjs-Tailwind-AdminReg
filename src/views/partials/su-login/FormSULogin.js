import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { bindActionCreators } from 'redux';
import { setRestBarClassAction, showErrorNotificationAction } from '../../../redux/action/ui';
import { loginAction, setBaseUriAction } from '../../../redux/action/auth';
import {
  checkPasswordValidation,
  checkUsernameValidation1,
  checkUsernameValidation2,
  getParamFromUrl
} from '../../../utils';
import { Link, useNavigate } from 'react-router-dom';
import backIcon from '../../../assets/images/back.svg';
import { instance } from '../../../http';
import PasswordInput from '../../components/PasswordInput';

export const formSchema = (t) => {
  const pwMinLength = getParamFromUrl('minPasswordLength') ?? 10;
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
      }),
    password: Yup.string()
      .required(t('your password required'))
      .min(pwMinLength, t('n password min error', { n: pwMinLength }))
      .max(1024, t('password max error'))
      .test('is-valid', t('password invalid'), function (value) {
        return checkPasswordValidation(value, pwMinLength);
      })
  });
};

const FormSULogin = (props) => {
  const { values, errors, touched, t, setFieldValue, setRestBarClass, setBaseUri } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setClassName();
    const source = getParamFromUrl('source');
    const username = getParamFromUrl('username');
    const deviceId = getParamFromUrl('deviceId');
    const pwMinLength = getParamFromUrl('minPasswordLength') ?? 10;
    if (username) setFieldValue('username', username);
    // todo encodeURIComponent
    if (source.startsWith('create-account')) {
      const token = getParamFromUrl('token');
      const baseUri = getParamFromUrl('baseUri');
      localStorage.setItem('kop-v2-base-url', baseUri);
      setBaseUri(baseUri);
      // set api base url
      instance.defaults.baseURL = baseUri;

      navigate(`/create-account/password-v2?token=${token}&minPasswordLength=${pwMinLength}`);
    } else if (source === 'mobile') {
      navigate(
        `/mobile-auth?username=${username}&deviceId=${deviceId}&minPasswordLength=${pwMinLength}`
      );
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
    sum += values['password'] ? 1 : 0;
    sum += values['username'] ? 1 : 0;
    setRestBarClass(`progress-${sum * 50}`);
  };

  const handlePrevious = () => {
    const source = getParamFromUrl('source');
    if (source === 'mobile') {
      navigate('/mobile-login');
    } else {
      navigate('/login');
    }
  };

  return (
    <Form className="form-group mt-57">
      <div>
        <div className="d-flex align-center cursor-pointer">
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange" onClick={handlePrevious}>
            {t('previous')}
          </span>
        </div>

        <div className="d-flex flex-column mt-25">
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

        <div className="mt-40 d-flex flex-column">
          <label className="font-input-label">{t('password')}</label>

          <PasswordInput name="password" value={values['password']} onChange={changeFormField} />

          {errors.password && touched.password && (
            <span className="font-helper-text text-error mt-10">{errors.password}</span>
          )}
        </div>

        <div className="mt-40 d-block">
          <Link
            to={'/forgot-password?from=web'}
            className="font-input-label text-orange no-underline">
            {t('forgot password')}
          </Link>
        </div>
      </div>

      <div className="mt-80">
        <div>
          <button
            className={`button ${
              values['username'] && values['password']
                ? 'active cursor-pointer'
                : 'inactive cursor-default'
            }`}
            type={values['username'] && values['password'] ? 'submit' : 'button'}>
            <span className="font-button-label text-white">{t('sign in')}</span>
          </button>
        </div>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    username: '',
    password: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: (values, { props }) => {
    const { loginAction, navigate } = props;
    if (values.username?.includes('@')) {
      props.showErrorNotification(props.t('use your username'));
      return;
    }
    loginAction({
      username: values.username,
      password: values.password,
      navigate
    });
  }
})(FormSULogin);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      loginAction: loginAction,
      showErrorNotification: showErrorNotificationAction,
      setBaseUri: setBaseUriAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(EnhancedForm));
