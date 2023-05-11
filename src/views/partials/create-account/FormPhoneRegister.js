import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import backIcon from '../../../assets/images/back.svg';
import { bindActionCreators } from 'redux';
import { checkPhoneNumberValidation } from '../../../utils';
import { showErrorNotificationAction } from '../../../redux/action/ui';
import CustomPhoneInput from '../../components/PhoneInput';
import style from './FormPhoneRegister.module.scss';
import clsx from 'clsx';
import { get } from 'lodash';
import { useNavigate } from 'react-router-dom';

const formSchema = (t) => {
  return Yup.object().shape({
    phoneNumber: Yup.object()
      .required(t('phone number required'))
      .test('is-valid', t('phone number invalid'), function (obj) {
        return checkPhoneNumberValidation(obj.value, obj.countryCode);
      })
  });
};

const FormPhoneRegister = (props) => {
  const { values, errors, touched, t, setFieldValue, setRestBarClass } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass('progress-18');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form className="form-group mt-57">
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => {
            navigate(-1);
          }}
        >
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange">{t('previous')}</span>
        </div>

        <div className="mt-28 form-header-medium">
          <span className="font-header-medium d-block">{t('2fa')}</span>
        </div>

        <div className="mt-10 form-header-medium">
          <span className="font-binary d-block">{t('2fa description')}</span>
        </div>

        <div className={clsx(style.PhoneNumberWrapper, 'mt-40 d-flex flex-column')}>
          <label className="font-input-label">{t('phone number')}</label>

          <CustomPhoneInput
            containerClass={clsx(style.PhoneNumberContainer)}
            inputClass={clsx(style.PhoneNumberInput)}
            dropdownClass={clsx(style.PhoneNumberDropdown)}
            value={values.phoneNumber?.value}
            onChange={(value, countryCode) => setFieldValue('phoneNumber', { value, countryCode })}
          />
          {touched?.phoneNumber && errors?.phoneNumber && (
            <span className="font-helper-text text-error mt-10">{errors.phoneNumber}</span>
          )}
        </div>
      </div>

      <div className="mt-80">
        <button
          className={`button ${
            values['phoneNumber']?.value ? 'active cursor-pointer' : 'inactive cursor-default'
          }`}
          type={values['phoneNumber']?.value ? 'submit' : 'button'}
        >
          <span className="font-button-label text-white">{t('next')}</span>
        </button>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    phoneNumber: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: (values, { props }) => {
    try {
      const { navigate, updateProfile } = props;
      const phoneNumber = `+${values['phoneNumber']?.value}`;
      updateProfile({
        body: {
          phoneNumber
        },
        navigate,
        nextPath: `/create-account/phone-verification?phoneNumber=${encodeURIComponent(
          phoneNumber
        )}`
      });
    } catch (e) {
      console.log('storing values error', e);
    }
  }
})(FormPhoneRegister);

const mapStateToProps = (state) => ({
  token: get(state, 'auth.registerToken')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      showErrorNotification: showErrorNotificationAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EnhancedForm));
