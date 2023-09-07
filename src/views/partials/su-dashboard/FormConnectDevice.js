import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import style from './FormConnectDevice.module.scss';
import LKenzenDeviceImg from '../../../assets/images/kenzen-device-l.png';
import { isValidMacAddress } from '../../../utils';
import { linkKenzenDevice, verifyKenzenDevice } from '../../../http';
import { setLoadingAction, showErrorNotificationAction } from '../../../redux/action/ui';
import SearchDropdown from '../../components/SearchDropdown';
import useClickOutSide from '../../../hooks/useClickOutSide';
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

const FormConnectDevice = (props) => {
  const { values, errors, touched, setFieldValue, t } = props;
  const [devices, setDevices] = React.useState([]);
  const [device, setDevice] = React.useState(null);
  const [searching, setSearching] = React.useState(null);
  const navigate = useNavigate();

  const changeFormField = (e) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
  };

  const [visible, setVisible] = React.useState(false);
  const dropdownRef = React.useRef(null);
  useClickOutSide(dropdownRef, () => setVisible(false));

  const visibleDropdown = React.useMemo(() => {
    return visible && devices?.length > 0;
  }, [visible, devices?.length]);

  const handleItemClick = (id) => {
    const device = devices?.find((it) => it.deviceId === id);
    if (device) {
      setFieldValue('isEditing', false);
      setFieldValue('deviceId', device.deviceId);
      setDevice(device);
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
            <div className={clsx('tw-flex tw-flex-col md:tw-flex-row lg:tw-flex-row tw-gap-2')}>
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
              <div className="tw-flex tw-items-end tw-justify-center tw-w-full">
                <button
                  type="button"
                  className="tw-w-[50px] tw-h-[50px] tw-bg-transparent tw-text-white tw-">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3">
                    <path
                      fillRule="evenodd"
                      d="M3.75 2A1.75 1.75 0 002 3.75v3.5C2 8.216 2.784 9 3.75 9h3.5A1.75 1.75 0 009 7.25v-3.5A1.75 1.75 0 007.25 2h-3.5zM3.5 3.75a.25.25 0 01.25-.25h3.5a.25.25 0 01.25.25v3.5a.25.25 0 01-.25.25h-3.5a.25.25 0 01-.25-.25v-3.5zM3.75 11A1.75 1.75 0 002 12.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 009 16.25v-3.5A1.75 1.75 0 007.25 11h-3.5zm-.25 1.75a.25.25 0 01.25-.25h3.5a.25.25 0 01.25.25v3.5a.25.25 0 01-.25.25h-3.5a.25.25 0 01-.25-.25v-3.5zm7.5-9c0-.966.784-1.75 1.75-1.75h3.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0116.25 9h-3.5A1.75 1.75 0 0111 7.25v-3.5zm1.75-.25a.25.25 0 00-.25.25v3.5c0 .138.112.25.25.25h3.5a.25.25 0 00.25-.25v-3.5a.25.25 0 00-.25-.25h-3.5zm-7.26 1a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V5.5a1 1 0 00-1-1h-.01zm9 0a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V5.5a1 1 0 00-1-1h-.01zm-9 9a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1v-.01a1 1 0 00-1-1h-.01zm9 0a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1v-.01a1 1 0 00-1-1h-.01zm-3.5-1.5a1 1 0 011-1H12a1 1 0 011 1v.01a1 1 0 01-1 1h-.01a1 1 0 01-1-1V12zm6-1a1 1 0 00-1 1v.01a1 1 0 001 1H17a1 1 0 001-1V12a1 1 0 00-1-1h-.01zm-1 6a1 1 0 011-1H17a1 1 0 011 1v.01a1 1 0 01-1 1h-.01a1 1 0 01-1-1V17zm-4-1a1 1 0 00-1 1v.01a1 1 0 001 1H12a1 1 0 001-1V17a1 1 0 00-1-1h-.01z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
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
        {!isEditing && (
          <div>
            <span className="font-input-label">{t('connect device confirm')}</span>
          </div>
        )}
        <div className="mt-40">
          {!isEditing && (
            <button
              className={`button ${
                values['deviceId'] ? 'active cursor-pointer' : 'inactive cursor-default'
              }`}
              type={values['deviceId'] ? 'submit' : 'button'}>
              <span className="font-button-label text-white">{t('connect')}</span>
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
    const { setLoading, showErrorNotification, navigate } = props;
    if (!isEditing) {
      try {
        const { deviceId } = values;
        const tDeviceId = deviceId.trim();
        setLoading(true);
        await linkKenzenDevice(tDeviceId);
        navigate(`/connect/device/success?deviceId=${encodeURIComponent(tDeviceId)}`);
      } catch (e) {
        console.error('[link] [device] [error]', e);
        showErrorNotification(e.response?.data?.message);
      } finally {
        setLoading(false);
      }
    }
  }
})(FormConnectDevice);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(EnhancedForm));
