import React, { useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import backIcon from '../../../assets/images/back.svg';
import { Form, withFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

export const formShape = (t) => ({
  workLength: Yup.string()
    .required(t('work length required'))
    .test('is-valid', t('work length invalid'), function (value) {
      return parseInt(value) > 0 && parseInt(value) <= 24;
    })
});

const formSchema = (t) => {
  return Yup.object().shape(formShape(t));
};

const FormWorkLength = (props) => {
  const { t, values, errors, touched, setFieldValue, setRestBarClass, profile } = props;
  const navigate = useNavigate();
  useEffect(() => {
    setRestBarClass('progress-90');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      setFieldValue('workLength', profile.workDayLength);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return (
    <Form className="form-group mt-57">
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate('/create-account/timezone')}
        >
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange">{t('previous')}</span>
        </div>

        <div className="mt-28 form-header-medium">
          <span className="font-header-medium d-block">{t('work length question')}</span>
        </div>

        <div className="mt-40 d-flex flex-column">
          <label className="font-input-label">{t('work length')}</label>

          <input
            className="input input-field mt-10 font-heading-small text-white"
            type="number"
            value={values['workLength']}
            onChange={(e) => setFieldValue('workLength', e.target.value)}
          />

          {errors.workLength && touched.workLength && (
            <span className="font-helper-text text-error mt-10">{errors.workLength}</span>
          )}
        </div>
      </div>

      <div className="mt-80">
        <button
          className={`button ${
            values['workLength'] ? 'active cursor-pointer' : 'inactive cursor-default'
          }`}
          type={values['workLength'] ? 'submit' : 'button'}
        >
          <span className="font-button-label text-white">{t('next')}</span>
        </button>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    workLength: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: (values, { props }) => {
    try {
      const { updateProfile, navigate } = props;
      updateProfile({
        body: {
          workDayLength: values.workLength
        },
        nextPath: '/create-account/startWork',
        navigate
      });
    } catch (e) {
      console.log('storing values error', e);
    }
  }
})(FormWorkLength);

export default withTranslation()(EnhancedForm);
