import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { checkPasswordValidation, getParamFromUrl, getTokenFromUrl } from '../../../utils';
import { instance, lookupByToken, resetPasswordV2 } from '../../../http';
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from '../../../redux/action/ui';
import ConfirmModal from '../../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../../../config';
import PasswordInput from '../../components/PasswordInput';

const pwMinLength = getParamFromUrl('minPasswordLength') ?? 10;

const formSchema = (t) => {
  return Yup.object().shape({
    token: Yup.string(),
    password: Yup.string()
      .required(t('your password required'))
      .min(pwMinLength, t('n password rule', { n: pwMinLength }))
      .max(1024, t('password max error'))
      .test('is-valid', t('n password rule', { n: pwMinLength }), function (value) {
        return checkPasswordValidation(value, pwMinLength);
      }),
    confirmPassword: Yup.string()
      .required(t('confirm password required'))
      .test('is-equal', t('confirm password invalid'), function (value) {
        return this.parent.password === value;
      })
  });
};

const FormResetPassword = (props) => {
  const { setFieldValue, values, errors, touched, setRestBarClass, status, setStatus, t } = props;
  const navigate = useNavigate();

  useEffect(() => {
    const token = getTokenFromUrl();
    if (!token) {
      window.location.href = '/';
    } else {
      setFieldValue('token', token);
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
        <div className="d-flex flex-column">
          <label className="font-input-label">{t('new password')}</label>

          <PasswordInput
            name="password"
            autoFocus={true}
            value={values['password']}
            onChange={changeFormField}
          />

          {errors.password && touched.password && (
            <span className="font-helper-text text-error mt-10">{errors.password}</span>
          )}
        </div>

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

        <div className="mt-40">
          <span className="font-helper-text">{t('n password rule', { n: pwMinLength })}</span>
        </div>
      </div>

      <div className="mt-80">
        <button
          className={`button ${
            values['password'] && values['confirmPassword']
              ? 'active cursor-pointer'
              : 'inactive cursor-default'
          }`}
          type={values['password'] && values['confirmPassword'] ? 'submit' : 'button'}>
          <span className="font-button-label text-white">{t('reset')}</span>
        </button>
      </div>
      {status?.visibleModal && (
        <ConfirmModal
          show={status?.visibleModal}
          header={t('reset password confirm header')}
          subheader={t('reset password confirm subheader')}
          onOk={(e) => {
            e.preventDefault();
            setStatus({ visibleModal: false });
            navigate('/login');
          }}
        />
      )}
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    token: '',
    password: '',
    confirmPassword: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: async (values, { props, setStatus }) => {
    const data = {
      token: values['token'],
      password: values['password']
    };

    try {
      props.setLoading(true);
      instance.defaults.baseURL = apiBaseUrl;
      const lookupRes = await lookupByToken(values?.token);
      const { baseUri } = lookupRes.data;
      if (baseUri) {
        instance.defaults.baseURL = lookupRes.data?.baseUri;
      }
      await resetPasswordV2(data);
      setStatus({ visibleModal: true });
    } catch (e) {
      if (e?.response?.data?.status?.toString() === '404') {
        props.showErrorNotification(props.t('msg token expired'));
      } else {
        props.showErrorNotification(e.response?.data.message);
      }
    } finally {
      props.setLoading(false);
    }
  }
})(FormResetPassword);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
      setRestBarClass: setRestBarClassAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(EnhancedForm));
