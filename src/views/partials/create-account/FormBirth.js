import React, { useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import backIcon from '../../../assets/images/back.svg';
import { Form, withFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

export const formShape = (t) => ({
  dob: Yup.string()
    .required(t('dob required'))
    .test('is-valid', t('dob invalid'), function (value) {
      if (!value) {
        return false;
      }
      const arr = value?.split('-');
      if (arr?.length !== 3) {
        return false;
      }

      const selectedYear = parseInt(arr[0]);
      const selectedMonth = parseInt(arr[1]);
      const selectedDay = parseInt(arr[2]);
      if (selectedYear < 1900) {
        return false;
      }
      return new Date(selectedYear, selectedMonth - 1, selectedDay) < new Date();
    })
    .test('is-18', t('dob less 18'), function (value) {
      if (!value) {
        return false;
      }
      const arr = value?.split('-');
      if (arr?.length !== 3) {
        return false;
      }

      const selectedYear = parseInt(arr[0]);
      const selectedMonth = parseInt(arr[1]);
      const selectedDay = parseInt(arr[2]);
      const age = getAge(new Date(selectedYear, selectedMonth - 1, selectedDay));
      return age >= 18;
    })
});

const formSchema = (t) => {
  return Yup.object().shape(formShape(t));
};

const getAge = (dateString) => {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const FormBirth = (props) => {
  const { t, values, setFieldValue, setRestBarClass, errors, touched, profile } = props;
  const navigate = useNavigate();
  useEffect(() => {
    setRestBarClass('progress-36');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (profile) {
      const dateOfBirth = profile.dateOfBirth;
      setFieldValue('dob', dateOfBirth ?? '');
    }
  }, [profile, setFieldValue]);
  const navigateTo = (path) => {
    navigate(path);
  };
  const changeFormField = (e) => {
    const { value, name } = e.target;

    setFieldValue(name, value);
  };

  return (
    <Form className="form-group mt-57">
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigateTo('/create-account/gender')}
        >
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange">{t('previous')}</span>
        </div>

        <div className="mt-28 form-header-medium">
          <span className="font-header-medium d-block">{t('dob question')}</span>
        </div>

        <div className="mt-40 d-flex flex-column">
          <label className="font-input-label">{t('dob')}</label>

          <input
            className="input input-field mt-10 font-heading-small text-white"
            name="dob"
            type="date"
            value={values['dob']}
            onChange={changeFormField}
          />

          {errors.dob && touched.dob && (
            <span className="font-helper-text text-error mt-10">{errors.dob}</span>
          )}
        </div>
      </div>

      <div className="mt-80">
        <button
          className={`button ${
            values['dob'] ? 'active cursor-pointer' : 'inactive cursor-default'
          }`}
          type={values['dob'] ? 'submit' : 'button'}
        >
          <span className="font-button-label text-white">{t('next')}</span>
        </button>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    dob: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: (values, { props }) => {
    try {
      const { updateProfile, navigate } = props;
      updateProfile({
        body: {
          dateOfBirth: values.dob
        },
        nextPath: '/create-account/unit',
        navigate
      });
    } catch (e) {
      console.log('storing values error', e);
    }
  }
})(FormBirth);

export default withTranslation()(EnhancedForm);
