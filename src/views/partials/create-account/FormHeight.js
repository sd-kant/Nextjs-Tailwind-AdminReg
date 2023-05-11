import React, { useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import InputMask from 'react-input-mask';
import backIcon from '../../../assets/images/back.svg';
import { Form, withFormik } from 'formik';
import * as Yup from 'yup';
import { FT_OPTIONS, IN_OPTIONS, IMPERIAL, METRIC } from '../../../constant';
import {
  convertCmToImperial,
  convertCmToMetric,
  convertImperialToMetric,
  getHeightAsMetric
} from '../../../utils';
import { useNavigate } from 'react-router-dom';

export const formShape = (t) => ({
  heightUnit: Yup.string(),
  feet: Yup.string().test('is-valid', t('feet invalid'), function (value) {
    if (this.parent.heightUnit !== '2') {
      return parseInt(value) < 8;
    }
    return true;
  }),
  inch: Yup.string().test('is-valid', t('inch invalid'), function (value) {
    if (this.parent.heightUnit !== '2') {
      return parseInt(value) < 12;
    }
    return true;
  }),
  height: Yup.string().test('is-valid', t('height invalid'), function (value) {
    const strArr = value && value.split('cm');
    const cmArr = strArr && strArr[0] && strArr[0].split('m');
    const m = (cmArr && cmArr[0]) || '0';
    const cm = (cmArr && cmArr[1]) || '00';

    if (cm && cm.includes('_')) {
      return false;
    }
    if (parseInt(m) > 2) {
      return false;
    }

    if (parseInt(m) === 0 && parseInt(cm) < 50) {
      return false;
    }

    return !(parseInt(m) === 2 && parseInt(cm) >= 30);
  })
});

const formSchema = (t) => {
  return Yup.object().shape(formShape(t));
};

const FormHeight = (props) => {
  const { t, values, setFieldValue, setRestBarClass, errors, touched, profile } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass('progress-54');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      const { measure, height } = profile;

      if ([IMPERIAL, METRIC].includes(measure)) {
        const { m, cm } = convertCmToMetric(height);
        const { feet, inch } = convertCmToImperial(height);

        setFieldValue('height', `${m}m${cm}cm`);
        setFieldValue('heightUnit', measure === IMPERIAL ? '1' : '2');
        setFieldValue('feet', feet);
        setFieldValue('inch', inch);
      } else {
        navigate('/create-account/unit');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const onChangeHeight = (value) => {
    setFieldValue('height', value);
  };

  const onChangeFeetInch = (_feet, _inch) => {
    setFieldValue('feet', _feet);
    setFieldValue('inch', _inch);
    const { m, cm } = convertImperialToMetric(`${_feet}ft${_inch}in`);
    setFieldValue('height', `${m}m${cm}cm`);
  };

  return (
    <Form className="form-group mt-57">
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate('/create-account/unit')}
        >
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange">{t('previous')}</span>
        </div>

        <div className="mt-28 form-header-medium">
          <span className="font-header-medium d-block">{t('height question')}</span>
        </div>

        <div className="mt-40 d-flex flex-column">
          <div className="d-flex align-center">
            <label className="font-input-label">{t('height')}</label>
          </div>

          {values['heightUnit'] === '1' ? (
            <div className="d-flex mt-25">
              <div className="unit-picker">
                <select
                  className="font-input-label text-white"
                  value={values['feet']}
                  onChange={(e) => onChangeFeetInch(e.target.value, values['inch'])}
                >
                  {FT_OPTIONS.map((ftOption) => (
                    <option value={ftOption} key={`ft-${ftOption}`}>
                      {ftOption}
                    </option>
                  ))}
                </select>
              </div>
              &nbsp;&nbsp;
              <label>{t('feet')}</label>
              &nbsp;&nbsp;
              <div className="unit-picker">
                <select
                  className="font-input-label text-white"
                  value={values['inch']}
                  onChange={(e) => onChangeFeetInch(values['feet'], e.target.value)}
                >
                  {IN_OPTIONS.map((inOption) => (
                    <option value={inOption} key={`ft-${inOption}`}>
                      {inOption}
                    </option>
                  ))}
                </select>
              </div>
              &nbsp;&nbsp;
              <label>{t('inch')}</label>
            </div>
          ) : (
            <InputMask
              className="d-block input input-field mt-10 font-heading-small text-white"
              placeholder={`_m__cm`}
              mask={`9m99cm`}
              value={values['height']}
              onChange={(e) => onChangeHeight(e.target.value)}
            />
          )}

          {errors.height && touched.height && (
            <span className="font-helper-text text-error mt-10">{errors.height}</span>
          )}

          {((errors.feet && touched.feet) || (errors.inch && touched.inch)) && (
            <span className="font-helper-text text-error mt-10">{t('height invalid')}</span>
          )}
        </div>
      </div>

      <div className="mt-80">
        <button className={`button active cursor-pointer`} type={'submit'}>
          <span className="font-button-label text-white">{t('next')}</span>
        </button>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    heightUnit: '1',
    height: '',
    feet: '1',
    inch: '0'
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: (values, { props }) => {
    try {
      const { updateProfile, navigate, profile } = props;
      let payload = {
        measure: profile?.measure
      };
      const height = getHeightAsMetric({
        measure: profile?.measure,
        height: values.height,
        feet: values.feet,
        inch: values.inch
      });
      updateProfile({
        body: { ...payload, height },
        nextPath: '/create-account/weight',
        navigate
      });
    } catch (e) {
      console.log('storing values error', e);
    }
  }
})(FormHeight);

export default withTranslation()(EnhancedForm);
