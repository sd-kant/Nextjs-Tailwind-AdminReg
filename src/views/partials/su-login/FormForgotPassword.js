import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { bindActionCreators } from 'redux';
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction
} from '../../../redux/action/ui';
import ConfirmModal from '../../components/ConfirmModal';
import { instance, lookupByUsername, requestResetPassword } from '../../../http';
import {
  checkUsernameValidation2,
  checkUsernameValidation1,
  getParamFromUrl
} from '../../../utils';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../../../config';
import PreviousButton from 'views/components/PreviousButton';

const formSchema = (t) => {
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

const FormForgotPassword = (props) => {
  const { values, errors, touched, t, setFieldValue, status, setStatus } = props;
  const navigate = useNavigate();

  const changeFormField = (e) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
  };

  const handlePrevious = () => {
    const from = getParamFromUrl('from');
    if (from === 'mobile') {
      navigate('/mobile-login');
    } else {
      navigate('/login');
    }
  };

  return (
    <Form className="form-group mt-57">
      <div>
        <div className="tw-flex">
          <PreviousButton onClick={handlePrevious}>{t('previous')}</PreviousButton>
        </div>

        <div className="grouped-form mt-25">
          <label className="font-binary d-block mt-8">{t('forgot password description')}</label>
        </div>

        <div className="d-flex mt-40 flex-column">
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
      </div>

      <div className="mt-80">
        <button
          className={`button ${
            values['username'] ? 'active cursor-pointer' : 'inactive cursor-default'
          }`}
          type={values['username'] ? 'submit' : 'button'}>
          <span className="font-button-label text-white">{t('send')}</span>
        </button>
      </div>
      {status?.visibleModal && (
        <ConfirmModal
          show={status?.visibleModal}
          header={t('forgot password confirm header' + (status?.pinBased ? ' pin' : ''))}
          subheader={t('forgot password confirm subheader')}
          onOk={(e) => {
            e.preventDefault();
            setStatus({ visibleModal: false });

            handlePrevious();
          }}
        />
      )}
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    username: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: async (values, { props, setStatus }) => {
    try {
      props.setLoading(true);
      instance.defaults.baseURL = apiBaseUrl;
      const lookupRes = await lookupByUsername(values?.username);
      const { baseUri } = lookupRes.data;
      if (baseUri) {
        instance.defaults.baseURL = lookupRes.data?.baseUri;
      }
      const res = await requestResetPassword(values?.username);
      if (res.data?.pinBased) {
        setStatus({ visibleModal: true, pinBased: true });
      }else{
        setStatus({ visibleModal: true });
      }
      
    } catch (e) {
      if (e.response?.data?.status?.toString() === '404') {
        // if user not found
        props.showErrorNotification(props.t('forgot password name not registered'));
      } else {
        props.showErrorNotification(e?.response.data?.message);
      }
    } finally {
      props.setLoading(false);
    }
  }
})(FormForgotPassword);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      setLoading: setLoadingAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(EnhancedForm));
