import React, { useMemo, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import backIcon from '../../../assets/images/back.svg';
import Select from 'react-select';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { AVAILABLE_COUNTRIES } from '../../../constant';
import { useNavigate } from 'react-router-dom';

export const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#DE7D2C' : 'white',
    zIndex: 1
  }),
  control: (styles) => ({
    ...styles,
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    zIndex: 1
  }),
  menu: (styles) => ({ ...styles, zIndex: 2 }),
  input: (styles) => ({ ...styles, zIndex: 1 }),
  singleValue: (provided) => ({ ...provided, zIndex: 1 })
};

const formSchema = (t) => {
  return Yup.object().shape({
    country: Yup.object().required(t('country required'))
  });
};

const FormCountry = (props) => {
  const { t, values, setFieldValue, setRestBarClass, profile } = props;
  const options = useMemo(() => AVAILABLE_COUNTRIES, []);
  const navigate = useNavigate();
  useEffect(() => {
    setRestBarClass('progress-72');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile?.['countryOfResidence']) {
        const country = AVAILABLE_COUNTRIES.find((it) => it.label === profile.countryOfResidence);
        country && setFieldValue('country', country);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const navigateTo = (path) => {
    navigate(path);
  };

  const changeHandler = (value) => {
    setFieldValue('country', value);
  };

  return (
    <Form className="form-group mt-57">
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigateTo('/create-account/weight')}>
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange">{t('previous')}</span>
        </div>

        <div className="mt-28 form-form-header-medium">
          <span className="font-header-medium d-block">{t('country question')}</span>
        </div>

        <div className="mt-40 d-flex flex-column">
          <label className="font-input-label">{t('country')}</label>

          <Select
            className="mt-10 font-heading-small text-black input-field"
            options={options}
            value={values['country']}
            styles={customStyles}
            onChange={changeHandler}
            placeholder={t('select')}
          />
        </div>
      </div>

      <div className="mt-80">
        <button
          className={`button ${
            values['country'] ? 'active cursor-pointer' : 'inactive cursor-default'
          }`}
          type={values['country'] ? 'submit' : 'button'}>
          <span className="font-button-label text-white">{t('next')}</span>
        </button>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    country: null
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: (values, { props }) => {
    try {
      const { updateProfile, navigate } = props;
      updateProfile({
        body: {
          countryOfResidence: values.country?.label
        },
        nextPath: '/create-account/timezone',
        navigate
      });
    } catch (e) {
      console.log('storing values error', e);
    }
  }
})(FormCountry);

export default withTranslation()(EnhancedForm);
