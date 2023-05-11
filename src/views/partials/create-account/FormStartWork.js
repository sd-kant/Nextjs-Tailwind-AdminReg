import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import backIcon from '../../../assets/images/back.svg';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import {
  setLoadingAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from '../../../redux/action/ui';
import { format2Digits } from '../../../utils';
import useTimeOptions from '../../../hooks/useTimeOptions';
import { useNavigate } from 'react-router-dom';

export const formShape = (t) => ({
  hour: Yup.string()
    .required(t('start work invalid'))
    .test('is-valid', t('start work invalid'), function (value) {
      return parseInt(value) >= 0 && parseInt(value) <= 23;
    }),
  minute: Yup.string()
    .required(t('start work invalid'))
    .test('is-valid', t('start work invalid'), function (value) {
      return parseInt(value) >= 0 && parseInt(value) <= 59;
    }),
  startTimeOption: Yup.string()
});

const formSchema = (t) => {
  return Yup.object().shape(formShape(t));
};

export const options = [
  {
    value: 'AM',
    title: 'AM'
  },
  {
    value: 'PM',
    title: 'PM'
  }
];

const FormStartWork = (props) => {
  const { t, values, profile, setFieldValue, setRestBarClass, errors, touched } = props;
  const [hourOptions, minuteOptions] = useTimeOptions();
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass('progress-100');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      const workDayStart = profile.workDayStart;
      if (workDayStart) {
        const hour = workDayStart.split(':')?.[0];
        const minute = workDayStart.split(':')?.[1];
        if (parseInt(hour) === 0) {
          setFieldValue('hour', '12');
        } else if (parseInt(hour) > 12) {
          setFieldValue('hour', format2Digits(parseInt(hour) - 12));
        } else {
          setFieldValue('hour', format2Digits(parseInt(hour)));
        }
        if (parseInt(hour) >= 12) {
          setFieldValue('startTimeOption', 'PM');
        } else {
          setFieldValue('startTimeOption', 'AM');
        }
        setFieldValue('minute', minute);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return (
    <Form className="form-group mt-57">
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate('/create-account/workLength')}
        >
          <img src={backIcon} alt="back" />
          &nbsp;&nbsp;
          <span className="font-button-label text-orange">{t('previous')}</span>
        </div>

        <div className="mt-28 form-header-medium">
          <span className="font-header-medium d-block">{t('start work question')}</span>
        </div>

        <div className="mt-40 d-flex flex-column">
          <label className="font-input-label">{t('start work')}</label>

          <div className="d-flex mt-25">
            <div className="unit-picker">
              <select
                className="font-input-label text-white"
                value={values['hour']}
                onChange={(e) => {
                  setFieldValue('hour', e.target.value);
                }}
              >
                {hourOptions &&
                  hourOptions.map((hourOption) => (
                    <option value={hourOption} key={`hour-${hourOption}`}>
                      {hourOption}
                    </option>
                  ))}
              </select>
            </div>
            &nbsp;&nbsp;:&nbsp;&nbsp;
            <div className="unit-picker">
              <select
                className="font-input-label text-white"
                value={values['minute']}
                onChange={(e) => {
                  setFieldValue('minute', e.target.value);
                }}
              >
                {minuteOptions &&
                  minuteOptions.map((minuteOption) => (
                    <option value={minuteOption} key={`minute-${minuteOption}`}>
                      {minuteOption}
                    </option>
                  ))}
              </select>
            </div>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <div className="unit-picker">
              <select
                className="font-input-label text-white"
                value={values['startTimeOption']}
                onChange={(e) => {
                  setFieldValue('startTimeOption', e.target.value);
                }}
              >
                {options &&
                  options.map((option) => (
                    <option value={option.value} key={`option-${option.value}`}>
                      {option.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {(errors.hour && touched.hour) || (errors.minute && touched.minute) ? (
            <span className="font-helper-text text-error mt-10">{t('start work invalid')}</span>
          ) : null}
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

export const hourTo24Hour = ({ hour, startTimeOption }) => {
  let hour24;
  if (startTimeOption === 'AM') {
    hour24 = parseInt(hour) === 12 ? parseInt(hour) - 12 : parseInt(hour);
  } else {
    hour24 = parseInt(hour) === 12 ? parseInt(hour) : parseInt(hour) + 12;
  }

  return hour24;
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    startTimeOption: 'AM',
    hour: '09',
    minute: '00'
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: async (values, { props }) => {
    const { startTimeOption, hour, minute } = values;
    const hour24 = hourTo24Hour({ startTimeOption, hour });
    try {
      const { updateProfile, navigate } = props;
      updateProfile({
        body: {
          workDayStart: `${format2Digits(hour24)}:${minute}`
        },
        nextPath: '/create-account/medical-initial',
        navigate
      });
    } catch (e) {
      console.log('storing values error', e);
    }
  }
})(FormStartWork);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(EnhancedForm));
