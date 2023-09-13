import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import style from './FormConnectDevice.module.scss';
import LKenzenDeviceImg from 'assets/images/kenzen-device-l.png';
import { isValidMacAddress } from 'utils';
import { linkKenzenDevice, verifyKenzenDevice } from 'http';
import { setLoadingAction, showErrorNotificationAction } from 'redux/action/ui';
import SearchDropdown from 'views/components/SearchDropdown';
import useClickOutSide from 'hooks/useClickOutSide';
import { useNavigate } from 'react-router-dom';
import QRcodeReader from '../../QRcodeReader';

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
  const [openQrCodeReader, setOpenQRcodeReader] = React.useState(false);
  const [scanedDeviceId, setScancedDeviceId] = React.useState();
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

  const handleItemClick = React.useCallback(
    (id) => {
      const scanDevice = devices?.find((it) => it.deviceId === id);
      if (scanDevice) {
        setFieldValue('isEditing', false);
        setFieldValue('deviceId', scanDevice.deviceId);
        setDevice(scanDevice);
      }
    },
    [devices, setFieldValue]
  );

  React.useEffect(() => {
    if (scanedDeviceId) handleItemClick(scanedDeviceId);
  }, [devices, scanedDeviceId, handleItemClick]);

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
                  onClick={() => {
                    setOpenQRcodeReader(!openQrCodeReader);
                  }}
                  className="tw-border-none tw-w-[50px] tw-h-[50px] tw-bg-transparent tw-text-white tw-cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <QRcodeReader
              open={openQrCodeReader}
              onClose={() => setOpenQRcodeReader(false)}
              onScan={(data) => {
                console.log('data', data);
                if (data) {
                  //const macAddrss = data.text.split('_')[0];
                  const serialNumber = data.text.split('_')[1];
                  const tDeviceId = serialNumber.replace(/\W/g, '')?.slice(-4);
                  setFieldValue('deviceId', serialNumber);
                  handleItemClick(tDeviceId);
                  setScancedDeviceId(tDeviceId);
                }
              }}
              handleError={(error) => {
                console.log('err', error);
                alert(error);
                setOpenQRcodeReader(false);
              }}
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
