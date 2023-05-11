import React, { useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import backIcon from '../../../assets/images/back.svg';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import Select from 'react-select';
import { customStyles } from './FormCountry';
import useTimezone from '../../../hooks/useTimezone';
import { useNavigate } from 'react-router-dom';

export const formShape = (t) => ({
  timezone: Yup.object()
    .shape({
      value: Yup.string().required(t('timezone required'))
    })
    .required(t('timezone required'))
});

const formSchema = (t) => {
  return Yup.object().shape(formShape(t));
};

const FormTimezone = (props) => {
  const [timezones] = useTimezone();
  const { t, values, setFieldValue, setRestBarClass, profile } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass('progress-81');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      const option = timezones?.find((it) => it.value === profile.gmt);
      setFieldValue('timezone', option);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, timezones]);

  const changeHandler = (value) => {
    setFieldValue('timezone', value);
  };

  return (
    <Form className="form-group mt-57">
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate('/create-account/weight')}
        >
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange">{t('previous')}</span>
        </div>

        <div className="mt-28 form-form-header-medium">
          <span className="font-header-medium d-block">{t('timezone question')}</span>
        </div>

        <div className="mt-40 d-flex flex-column">
          <label className="font-input-label">{t('timezone')}</label>

          <Select
            className="mt-10 font-heading-small text-black input-field"
            options={timezones}
            value={values['timezone']}
            styles={customStyles}
            onChange={changeHandler}
            placeholder={t('select')}
          />
        </div>
      </div>

      <div className="mt-80">
        <button
          className={`button ${
            values['timezone'] ? 'active cursor-pointer' : 'inactive cursor-default'
          }`}
          type={values['timezone'] ? 'submit' : 'button'}
        >
          <span className="font-button-label text-white">{t('next')}</span>
        </button>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    timezone: null
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: (values, { props }) => {
    try {
      const { updateProfile, navigate } = props;
      updateProfile({
        body: {
          gmt: values.timezone?.value
        },
        nextPath: '/create-account/workLength',
        navigate
      });
    } catch (e) {
      console.log('storing values error', e);
    }
  }
})(FormTimezone);

export default withTranslation()(EnhancedForm);
