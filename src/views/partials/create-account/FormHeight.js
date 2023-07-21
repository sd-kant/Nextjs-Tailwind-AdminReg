import React, { useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import backIcon from '../../../assets/images/back.svg';
import { Form, withFormik } from 'formik';
import * as Yup from 'yup';
import { FT_OPTIONS, IN_OPTIONS, IMPERIAL, METRIC, M_OPTIONS, CM_OPTIONS } from '../../../constant';
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
  m: Yup.string().test('is-valid', t('m invalid'), function (value) {
    if (this.parent.heightUnit === '2') {
      return parseInt(value) < 4;
    }
    return true;
  }),
  cm: Yup.string().test('is-valid', t('cm invalid'), function (value) {
    if (this.parent.heightUnit === '2') {
      return parseInt(value) < 100;
    }
    return true;
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
        setFieldValue('m', m);
        setFieldValue('cm', cm);
        setFieldValue('heightUnit', measure === IMPERIAL ? '1' : '2');
        setFieldValue('feet', feet);
        setFieldValue('inch', inch);
      } else {
        navigate('/create-account/unit');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const onChangeFeetInch = (_feet, _inch) => {
    setFieldValue('feet', _feet);
    setFieldValue('inch', _inch);
    const { m, cm } = convertImperialToMetric(`${_feet}ft${_inch}in`);
    setFieldValue('m', m);
    setFieldValue('cm', cm);
  };

  const onChangeMeter = (_m, _cm) => {
    setFieldValue('m', _m);
    setFieldValue('cm', _cm);
    const { feet, inch } = convertCmToImperial(parseInt(_m) * 100 + parseInt(_cm));
    setFieldValue('feet', feet);
    setFieldValue('inch', inch);
  };

  const isImperial = values['heightUnit'] === '1';

  const handleHeightChange = (value1, value2) => {
    if (isImperial) {
      onChangeFeetInch(value1, value2);
    } else {
      onChangeMeter(value1, value2);
    }
  };

  return (
    <Form className="form-group mt-57">
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate('/create-account/unit')}>
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
          <div className="d-flex mt-25">
            <div className="unit-picker">
              <select
                className="font-input-label text-white"
                value={isImperial ? values['feet'] : values['m']}
                onChange={(e) =>
                  handleHeightChange(e.target.value, isImperial ? values['inch'] : values['cm'])
                }>
                {(isImperial ? FT_OPTIONS : M_OPTIONS).map((it) => (
                  <option value={it} key={`first-${it}`}>
                    {it}
                  </option>
                ))}
              </select>
            </div>
            &nbsp;&nbsp;
            <label>{isImperial ? t('feet') : 'm'}</label>
            &nbsp;&nbsp;
            <div className="unit-picker">
              <select
                className="font-input-label text-white"
                value={isImperial ? values['inch'] : values['cm']}
                onChange={(e) =>
                  handleHeightChange(isImperial ? values['feet'] : values['m'], e.target.value)
                }>
                {(isImperial ? IN_OPTIONS : CM_OPTIONS).map((it) => (
                  <option value={it} key={`second-${it}`}>
                    {it}
                  </option>
                ))}
              </select>
            </div>
            &nbsp;&nbsp;
            <label>{isImperial ? t('inch') : 'cm'}</label>
          </div>

          {((errors.m && touched.m) || (errors.cm && touched.cm)) && (
            <span className="font-helper-text text-error mt-10">{t('height invalid')}</span>
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
    // height: '',
    feet: '1',
    inch: '0',
    m: '',
    cm: ''
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
        m: values.m,
        cm: values.cm,
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
