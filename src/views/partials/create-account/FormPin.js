import React, { useEffect } from 'react';
import { Form, withFormik } from 'formik';
import { withTranslation } from 'react-i18next';
import OtpInput from 'views/components/OtpInput';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Yup from 'yup';

const FormPin = ({ setRestBarClass, t, values, setFieldValue, errors }) => {
  useEffect(() => {
    setRestBarClass('progress-0');
  }, [setRestBarClass]);

  const isValid = !errors.otpCode && values['otpCode'].length === 6;

  return (
    <Form className="tw-mt-14 xl:tw-w-3/5 md:tw-w-4/5 tw-w-full tw-flex tw-flex-col md:tw-items-start tw-items-center">
      <div className="tw-mt-6 md:tw-text-start tw-text-center">
        <span className="font-heading-small">{t('required pin')}</span>
      </div>
      <div className="tw-mt-4">
        <OtpInput
          length={6}
          onOTPChange={(value) => {
            setFieldValue('otpCode', value);
          }}
        />
      </div>
      <div className="tw-mt-10 md:tw-text-start tw-text-center">
        <span className="font-heading-small">{t('not receive pin')}</span>
      </div>
      <div className="tw-mt-40">
        <button
          className={`button ${isValid ? 'active cursor-pointer' : 'inactive cursor-default'}`}
          type={isValid ? 'submit' : 'button'}>
          <span className="font-button-label text-white">{t('next')}</span>
        </button>
      </div>
    </Form>
  );
};

export const formShape = (t) => ({
  otpCode: Yup.string()
    .test('is-valid', t('otp code invalid'), function (value) {
      return /^[0-9]{6}$/.test(value);
    })
    .required(t('OTP code required'))
});

const formSchema = (t) => {
  return Yup.object().shape(formShape(t));
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    otpCode: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: (values, { props }) => {
    props.navigate(`/create-account/password?token=${values.otpCode}&source=create-account-pin`);
    //window.location.href = `/create-account/password?token=${values.otpCode}&source=create-account-pin`;
  }
})(FormPin);

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EnhancedForm));
