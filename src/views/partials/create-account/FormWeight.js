import React, { useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import backIcon from '../../../assets/images/back.svg';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { IMPERIAL, METRIC } from '../../../constant';
import { convertKilosToLbs, convertLbsToKilos } from '../../../utils';
import { useNavigate } from 'react-router-dom';

export const formShape = (t) => ({
  weightUnit: Yup.string(),
  weight: Yup.string()
    .required(t('weight required'))
    .test('is-valid', t('weight invalid'), function (value) {
      return value && parseInt(value) > 0 && parseInt(value) < 400;
    })
});

const formSchema = (t) => {
  return Yup.object().shape(formShape(t));
};

const FormWeight = (props) => {
  const { t, values, setFieldValue, setRestBarClass, errors, touched, profile } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass('progress-63');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      const { measure, weight } = profile;
      if (measure === IMPERIAL) {
        setFieldValue('weight', convertKilosToLbs(weight));
        setFieldValue('weightUnit', '1');
      } else if (measure === METRIC) {
        setFieldValue('weight', weight);
        setFieldValue('weightUnit', '2');
      } else {
        navigate('/create-account/unit');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const onChange = (value) => {
    setFieldValue('weight', value);
  };

  return (
    <Form className="form-group mt-57">
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate('/create-account/height')}>
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange">{t('previous')}</span>
        </div>

        <div className="mt-28 form-header-medium">
          <span className="font-header-medium d-block">{t('weight question')}</span>
        </div>

        <div className="mt-40 d-flex flex-column">
          <div className="d-flex align-center">
            <label className="font-input-label">
              {t('weight')} {values.weightUnit === '1' ? '(lbs)' : '(kg)'}
            </label>
          </div>

          <input
            className="input input-field mt-10 font-heading-small text-white"
            type="number"
            value={values['weight']}
            step={1}
            onChange={(e) => onChange(e.target.value)}
          />

          {errors.weight && touched.weight && (
            <span className="font-helper-text text-error mt-10">{errors.weight}</span>
          )}
        </div>
      </div>

      <div className="mt-80">
        <button
          className={`button ${
            values['weight'] ? 'active cursor-pointer' : 'inactive cursor-default'
          }`}
          type={values['weight'] ? 'submit' : 'button'}>
          <span className="font-button-label text-white">{t('next')}</span>
        </button>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    weightUnit: '1',
    weight: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: (values, { props }) => {
    try {
      const { updateProfile, navigate, profile } = props;
      const measure = profile?.measure;
      let weight = values.weight;
      if (measure === IMPERIAL) {
        weight = convertLbsToKilos(values['weight']);
      }
      updateProfile({
        body: {
          weight: weight
        },
        nextPath: '/create-account/timezone',
        navigate
      });
    } catch (e) {
      console.log('storing values error', e);
    }
  }
})(FormWeight);

export default withTranslation()(EnhancedForm);
