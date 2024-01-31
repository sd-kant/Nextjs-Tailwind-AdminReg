import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import {
  checkUsernameValidation2,
  checkUsernameValidation1,
  checkPasswordValidation,
  getTokenFromUrl,
  getParamFromUrl,
  checkIfEmail
} from '../../../utils';
import { resetPasswordV2 } from '../../../http';
import {
  setLoadingAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from '../../../redux/action/ui';
import { loginAction } from '../../../redux/action/auth';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/PasswordInput';

const pwMinLength = getParamFromUrl('minPasswordLength') ?? 10;
const formSchema = (t) => {
  return Yup.object().shape({
    token: Yup.string(),
    username: Yup.string()
      .required(t('username required'))
      .min(6, t('username min error'))
      .max(1024, t('username max error'))
      .test('is-valid-3', t('username invalid 3'), function (value) {
        return !checkIfEmail(value);
      })
      .test('is-valid-2', t('username invalid 2'), function (value) {
        return checkUsernameValidation2(value);
      })
      .test('is-valid-1', t('username invalid 1'), function (value) {
        return checkUsernameValidation1(value);
      }),
    password: Yup.string()
      .required(t('password invalid 2'))
      .min(pwMinLength, t('password invalid 2', { n: pwMinLength }))
      .max(1024, t('password invalid 2'))
      .test('is-valid', t('password invalid 2'), function (value) {
        return checkPasswordValidation(value, pwMinLength);
      }),
    confirmPassword: Yup.string()
      .required(t('confirm password required'))
      .test('is-equal', t('confirm password invalid'), function (value) {
        return this.parent.password === value;
      })
  });
};

const formSchemaLogin = (t) => {
  return Yup.object().shape({
    username: Yup.string()
      .required(t('username required'))
      .min(6, t('username min error'))
      .max(1024, t('username max error'))
      .test('is-valid-3', t('username invalid 3'), function (value) {
        return !checkIfEmail(value);
      })
      .test('is-valid-2', t('username invalid 2'), function (value) {
        return checkUsernameValidation2(value);
      })
      .test('is-valid-1', t('username invalid 1'), function (value) {
        return checkUsernameValidation1(value);
      }),
    password: Yup.string()
      .required(t('password invalid 2'))
      .min(pwMinLength, t('password invalid 2', { n: pwMinLength }))
      .max(1024, t('password invalid 2'))
      .test('is-valid', t('password invalid 2'), function (value) {
        return checkPasswordValidation(value, pwMinLength);
      })
  });
};

const FormPassword = (props) => {
  const { setFieldValue, values, errors, touched, setRestBarClass, t, token } = props;
  const [isLogin, setIsLogin] = React.useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const tokenFromUrl = getTokenFromUrl();
    if (!tokenFromUrl) {
      if (token) {
        const username = localStorage.getItem('kop-v2-register-username');
        if (username) {
          setIsLogin(true);
          setFieldValue('username', username);
        } else {
          navigate('/create-account/name');
        }
      } else {
        navigate('/');
      }
    } else {
      setFieldValue('token', tokenFromUrl);
    }

    setRestBarClass('progress-0');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFormField = (e) => {
    const { value, name } = e.target;

    setFieldValue(name, value);
  };

  return (
    <Form className="form-group mt-57">
      <div>
        <div className="mt-10 d-flex flex-column">
          <label className="font-input-label">{t('Username')}</label>

          <input
            className="input input-field mt-10 font-heading-small text-white"
            name="username"
            value={values['username']}
            type="text"
            onChange={changeFormField}
          />
          <span className="font-helper-text mt-10 text-white">{t('username length')}</span>
          {errors.username && touched.username && (
            <span className="font-helper-text text-error mt-10">{errors.username}</span>
          )}
        </div>

        <div className="mt-40 d-flex flex-column">
          <label className="font-input-label">
            {isLogin ? t('password') : t('create password')}
          </label>

          <PasswordInput name="password" value={values['password']} onChange={changeFormField} />

          {errors.password && touched.password && (
            <span className="font-helper-text text-error mt-10">{errors.password}</span>
          )}
        </div>
        {!isLogin && (
          <div className="mt-40 d-flex flex-column">
            <label className="font-input-label">{t('confirm password')}</label>

            <PasswordInput
              name="confirmPassword"
              value={values['confirmPassword']}
              onChange={changeFormField}
            />

            {errors.confirmPassword && touched.confirmPassword && (
              <span className="font-helper-text text-error mt-10">{errors.confirmPassword}</span>
            )}
          </div>
        )}

        <div className="mt-40">
          <span className="font-helper-text">{t('n password rule', { n: pwMinLength })}</span>
        </div>
      </div>

      <div className="mt-80">
        <button
          className={`button ${
            values['password'] && (isLogin || values['confirmPassword'])
              ? 'active cursor-pointer'
              : 'inactive cursor-default'
          }`}
          type={values['password'] && (isLogin || values['confirmPassword']) ? 'submit' : 'button'}>
          <span className="font-button-label text-white">{t('next')}</span>
        </button>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    token: '',
    username: '',
    password: '',
    confirmPassword: ''
  }),
  validationSchema: (props) => {
    const username = localStorage.getItem('kop-v2-register-username');
    if (username) {
      return formSchemaLogin(props.t);
    } else {
      return formSchema(props.t);
    }
  },
  handleSubmit: async (values, { props }) => {
    const username = localStorage.getItem('kop-v2-register-username');
    const { setLoading, showSuccessNotification, login, t, showErrorNotification, navigate } =
      props;
    if (!username) {
      try {
        setLoading(true);
        login({
          username: values['username'],
          password: values['password'],
          fromRegister: true,
          navigate: navigate
        });
      } catch (e) {
        if (e?.response?.data?.status?.toString() === '404') {
          showErrorNotification(t('msg token expired'));
        } else {
          showErrorNotification(e.response?.data.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      const data = {
        token: values['token'],
        password: values['password'],
        username: values['username']
      };
      try {
        setLoading(true);
        await resetPasswordV2(data);
        showSuccessNotification(t('msg account registered'));
        login({
          username: values['username'],
          password: values['password'],
          fromRegister: true,
          navigate: navigate
        });
      } catch (e) {
        if (e?.response?.data?.status?.toString() === '404') {
          showErrorNotification(t('msg token expired'));
        } else {
          showErrorNotification(e.response?.data.message);
        }
      } finally {
        //setLoading(false);
      }
    }
  }
})(FormPassword);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      login: loginAction,
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(EnhancedForm));
