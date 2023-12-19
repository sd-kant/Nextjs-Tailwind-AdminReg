import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Form, withFormik } from 'formik';
import removeIcon from 'assets/images/remove.svg';
import { isValidMacAddress } from 'utils';
import { queryCreateHubProfile } from 'http/organization';
import { bindActionCreators } from 'redux';
import { showErrorNotificationAction, showSuccessNotificationAction } from 'redux/action/ui';

const formSchema = (t) => {
  return Yup.object().shape({
    macAddress: Yup.string()
      .required(t('device id required'))
      .test('is-valid', t('device id invalid'), function (value) {
        return isValidMacAddress(value);
      })
  });
};

const BThubGenTokenModal = ({
  t,
  isOpen = false,
  onClose,
  setFieldValue,
  values,
  resetForm,
  errors,
  touched,
  isSubmitting
}) => {
  const { macAddress } = values;
  useEffect(() => {
    if (isOpen) {
      resetForm({
        values: {
          macAddress: ''
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      className={clsx('tw-relative', 'tw-bg-neutral-700', 'tw-p-2', 'sm:tw-p-6', 'tw-rounded-lg')}
      overlayClassName={clsx(
        // 'tw-hidden',
        // 'tw-overflow-y-auto',
        // 'tw-overflow-x-hidden',
        'tw-flex',
        'tw-fixed',
        'tw-inset-0',
        'tw-z-50',
        // 'tw-top-0',
        // 'tw-left-0',
        'tw-justify-center',
        'tw-items-center',
        'tw-w-full',
        'tw-h-[calc(100%-1rem)]',
        'tw-max-h-full'
      )}
      appElement={document.getElementsByTagName('body')}>
      <Form>
        <div
          className={clsx(
            'tw-absolute',
            'tw-top-3',
            'tw-right-3',
            'tw-inline',
            'tw-cursor-pointer'
          )}
          onClick={onClose}>
          <img src={removeIcon} alt="remove icon" />
        </div>
        <div className={clsx('tw-flex', 'tw-flex-col', 'tw-p-4', 'sm:tw-p-8', 'tw-gap-4')}>
          <div>
            <span className={'font-header-medium text-white'}>{t('enter bluetooth hub id')}</span>
            <br />
          </div>
          <div className="tw-flex tw-flex-col tw-gap-1">
            <input
              className={clsx(
                'tw-rounded-lg',
                'tw-bg-neutral-800',
                'tw-border-none',
                'tw-outline-none',
                'tw-z-1',
                'tw-px-8',
                'tw-py-1',
                'tw-text-xl',
                'tw-text-white'
              )}
              name="macAddress"
              value={macAddress}
              onChange={(e) => setFieldValue('macAddress', e.target.value)}
              type="text"
              placeholder="XX:XX:XX:XX:XX:XX"
            />
            {touched?.macAddress && (
              <span className="font-helper-text tw-text-red-500">{errors.macAddress}</span>
            )}
          </div>
          <div className={clsx('tw-flex', 'tw-justify-end')}>
            <button
              className={clsx(
                'tw-relative',
                'tw-border-none',
                'tw-rounded-lg',
                'tw-outline-none',
                'tw-z-1',
                'tw-w-32',
                'tw-py-4',
                isSubmitting ? 'tw-bg-neutral-800' : 'tw-bg-amber-600',
                'tw-cursor-pointer'
              )}
              disabled={isSubmitting}
              type={'submit'}>
              <span className="font-button-label text-white text-uppercase">{t('save')}</span>
            </button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({ macAddress: '' }),
  validationSchema: (props) => formSchema(props.t),
  enableReinitialize: true,
  handleSubmit: async (values, { props, setSubmitting }) => {
    setSubmitting(true);
    await queryCreateHubProfile(props.orgId, values.macAddress)
      .then((respond) => {
        if (respond.status === 200) {
          props.addOn({
            macAddress: values['macAddress'],
            refreshToken: respond.data
          });
          props.onClose();
        }
      })
      .catch((error) => {
        console.error(error);
        props.showErrorNotification(error?.response?.data?.message ?? error?.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  }
})(BThubGenTokenModal);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction
    },
    dispatch
  );

export default withTranslation()(connect(null, mapDispatchToProps)(EnhancedForm));
