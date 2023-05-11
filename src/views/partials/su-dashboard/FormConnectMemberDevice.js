import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import style from './FormConnectMemberDevice.module.scss';
import LKenzenDeviceImg from '../../../assets/images/kenzen-device-l.png';
import { isValidMacAddress } from '../../../utils';
import { linkMemberKenzenDevice } from '../../../http';
import { setLoadingAction, showErrorNotificationAction } from '../../../redux/action/ui';

export const formSchema = (t) => {
  return Yup.object().shape({
    isEditing: Yup.bool(),
    deviceId: Yup.string()
      .required(t('device id required'))
      .test('is-valid', t('device id invalid'), function (value) {
        return isValidMacAddress(value);
      })
  });
};

const FromConnectMemberDevice = (props) => {
  const { values, errors, touched, setFieldValue, t } = props;

  const changeFormField = (e) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
  };

  const { isEditing } = values;

  return (
    <Form className={clsx(style.Wrapper, 'form')}>
      <div className={clsx('d-flex flex-column mt-25', style.FormRow)}>
        <label className="font-input-label" htmlFor="deviceId">
          {isEditing ? t('device id label') : t('device id')}
        </label>
        {isEditing ? (
          <input
            className="input input-field mt-10 font-heading-small text-white"
            name="deviceId"
            type="text"
            value={values['deviceId']}
            placeholder={t('device id placeholder')}
            onChange={changeFormField}
          />
        ) : (
          <p>{values['deviceId']}</p>
        )}

        {errors.deviceId && touched.deviceId && (
          <span className="font-helper-text text-error mt-10">{errors.deviceId}</span>
        )}
      </div>

      <div className={clsx(style.DeviceWrapper)}>
        <img className={clsx(style.DeviceImage)} src={LKenzenDeviceImg} alt="kenzen device" />
        <p className={clsx(style.DeviceIDExplanation)}>{t('device id explanation')}</p>
      </div>

      <div className="mt-80">
        <div>
          <button
            className={`button ${
              values['deviceId'] ? 'active cursor-pointer' : 'inactive cursor-default'
            }`}
            type={values['deviceId'] ? 'submit' : 'button'}>
            <span className="font-button-label text-white">
              {isEditing ? t('next') : t('connect')}
            </span>
          </button>
          {!isEditing && (
            <button
              className={clsx(style.CancelBtn, `button cursor-pointer cancel`)}
              type={'button'}
              onClick={() => setFieldValue('isEditing', true)}>
              <span className="font-button-label text-orange text-uppercase">{t('cancel')}</span>
            </button>
          )}
        </div>
      </div>
    </Form>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    isEditing: true,
    deviceId: ''
  }),
  validationSchema: (props) => formSchema(props.t),
  handleSubmit: async (values, { props, setFieldValue }) => {
    const { isEditing } = values;
    const { setLoading, showErrorNotification, navigate, teamId, userId } = props;
    if (isEditing) {
      setFieldValue('isEditing', false);
    } else {
      try {
        const { deviceId } = values;
        const tDeviceId = deviceId.trim();
        setLoading(true);
        await linkMemberKenzenDevice(teamId, userId, tDeviceId);
        navigate(`/connect/member/device/success?deviceId=${encodeURIComponent(tDeviceId)}`);
      } catch (e) {
        console.error('[link] [member] [device] [error]', e);
        showErrorNotification(e.response?.data?.message);
      } finally {
        setLoading(false);
      }
    }
  }
})(FromConnectMemberDevice);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(EnhancedForm));
