import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import style from './FormConnectMemberDevice.module.scss';
import LKenzenDeviceImg from 'assets/images/kenzen-device-l.png';
import { getParamFromUrl, isValidMacAddress } from 'utils';
import { linkMemberKenzenDevice, verifyKenzenDevice } from 'http';
import { setLoadingAction, showErrorNotificationAction } from 'redux/action/ui';
import SearchDropdown from 'views/components/SearchDropdown';
import useClickOutSide from 'hooks/useClickOutSide';
import { useNavigate } from 'react-router-dom';

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

const FormConnectMemberDevice = (props) => {
  const { values, errors, touched, setFieldValue, t } = props;
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState(null);
  const [searching, setSearching] = React.useState(false);
  const navigate = useNavigate();
  const changeFormField = (e) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
  };

  const [visible, setVisible] = React.useState(false);
  const [isLoadingAPI, setIsLoadingAPI] = React.useState(false);
  const dropdownRef = React.useRef(null);
  useClickOutSide(dropdownRef, () => setVisible(false));

  const visibleDropdown = React.useMemo(() => {
    return visible && devices?.length > 0;
  }, [visible, devices?.length]);

  const handleItemClick = (id) => {
    const scandevice = devices?.find((it) => it.deviceId === id);
    if (scandevice) {
      setFieldValue('isEditing', false);
      setFieldValue('deviceId', scandevice.deviceId);
      setDevice(scandevice);
    }
  };

  const { isEditing, deviceId } = values;

  const tDeviceId = React.useMemo(() => {
    if (deviceId) {
      const tDeviceId = deviceId.replace(/\W/g, '')?.slice(-4);
      if (tDeviceId?.length === 4) {
        return tDeviceId;
      }
      return '';
    }

    return '';
  }, [deviceId]);

  React.useEffect(() => {
    let mounted = true;
    if (tDeviceId) {
      if (mounted) {
        setSearching(true);
      }
      setIsLoadingAPI(true);
      verifyKenzenDevice(tDeviceId)
        .then((res) => {
          if (mounted) {
            const deviceList = res.data;
            setDevices([...deviceList]);
          }
        })
        .catch((e) => {
          console.error('device verify error', e);
          setDevices([]);
        })
        .finally(() => {
          if (mounted) {
            setSearching(false);
          }
          setIsLoadingAPI(false);
        });
    } else {
      if (mounted) {
        setDevices([]);
      }
    }

    return () => {
      mounted = false;
    };
  }, [tDeviceId]);

  const noMatch = React.useMemo(() => {
    return !searching && devices?.length === 0 && tDeviceId;
  }, [devices, searching, tDeviceId]);

  const dropdownItems = React.useMemo(() => {
    return (
      devices?.map((device) => ({
        value: device.deviceId,
        title: device.deviceId,
        subtitle: device.serialNumber
      })) ?? []
    );
  }, [devices]);

  const handleCancel = () => {
    if (isEditing) {
      navigate(-1);
    } else {
      setFieldValue('isEditing', true);
    }
  };

  return (
    <Form className={clsx(style.Wrapper, 'form')}>
      <div className={clsx('d-flex flex-column mt-25', style.FormRow)}>
        {isEditing ? (
          <>
            <label className="font-input-label" htmlFor="deviceId">
              {t('device id label')}
            </label>
            <SearchDropdown
              ref={dropdownRef}
              renderInput={() => (
                <input
                  className="input input-field mt-10 font-heading-small text-white"
                  name="deviceId"
                  type="text"
                  value={values['deviceId']}
                  placeholder={t('device id placeholder')}
                  onChange={changeFormField}
                  onClick={() => setVisible(true)}
                />
              )}
              items={dropdownItems}
              visibleDropdown={visibleDropdown}
              onItemClick={handleItemClick}
              noMatch={noMatch}
              noMatchText={t('no device match')}
            />
          </>
        ) : (
          <>
            <label className="font-input-label">{t('mac address found')}</label>
            <p className="ml-15">{device['deviceId']}</p>
            <label className="font-input-label">{t('device id sn')}</label>
            <p className="ml-15">{device['serialNumber']}</p>
          </>
        )}

        {errors.deviceId && touched.deviceId && (
          <span className="font-helper-text text-error mt-10">{errors.deviceId}</span>
        )}
      </div>

      {isEditing && (
        <div className={clsx(style.DeviceWrapper)}>
          <img className={clsx(style.DeviceImage)} src={LKenzenDeviceImg} alt="kenzen device" />
          <p className={clsx(style.DeviceIDExplanation)}>{t('device id explanation')}</p>
        </div>
      )}

      <div className="mt-50">
        {!isEditing ? (
          <div>
            <span className="font-input-label text-orange">
              {t('connect device member confirm')}
            </span>
          </div>
        ) : (
          <div>
            <span className="font-input-label text-orange">
              {t('create device and pair it with memeber')}
            </span>
          </div>
        )}
        <div className="mt-40">
          {!isEditing ? (
            <button
              className={`button ${
                values['deviceId'] && !isLoadingAPI
                  ? 'active cursor-pointer'
                  : 'inactive cursor-default'
              }`}
              type={values['deviceId'] ? 'submit' : 'button'}>
              <span className="font-button-label text-white">{t('connect')}</span>
            </button>
          ) : (
            <button
              className={`button ${
                noMatch && !isLoadingAPI ? 'active cursor-pointer' : 'inactive cursor-default'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setDevice({ deviceId: values['deviceId'], serialNumber: 'New Device' });
                setFieldValue('isEditing', false);
              }}
              type={'button'}>
              <span className="font-button-label text-white">{t('Yes')}</span>
            </button>
          )}
          <button
            className={clsx(
              style.CancelBtn,
              isEditing ? style.Alone : null,
              `button cursor-pointer cancel`
            )}
            type={'button'}
            onClick={handleCancel}>
            <span className="font-button-label text-orange text-uppercase">{t('cancel')}</span>
          </button>
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
  handleSubmit: async (values, { props }) => {
    const { isEditing } = values;

    const { setLoading, showErrorNotification, navigate, teamId, userId } = props;
    if (!isEditing) {
      try {
        const { deviceId } = values;
        const tDeviceId = deviceId.trim();
        setLoading(true);
        await linkMemberKenzenDevice(teamId, userId, tDeviceId);
        navigate(
          `/connect/member/device/success?deviceId=${encodeURIComponent(
            tDeviceId
          )}&name=${encodeURIComponent(getParamFromUrl('name'))}`
        );
      } catch (e) {
        console.error('[link] [member] [device] [error]', e);
        showErrorNotification(e.response?.data?.message);
      } finally {
        setLoading(false);
      }
    }
  }
})(FormConnectMemberDevice);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(EnhancedForm));
