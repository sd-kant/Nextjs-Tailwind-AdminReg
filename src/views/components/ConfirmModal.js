import React from 'react';
import { useTranslation } from 'react-i18next';
import CheckCircle from '../../assets/images/check-circle.svg';
import style from './ConfirmModal.module.scss';
import clsx from 'clsx';

const Children = () => (
  <div className="d-flex justify-center">
    <img src={CheckCircle} alt="flower" width={105} height={105} />
  </div>
);

const ConfirmModal = ({
  show,
  onCancel,
  onOk,
  header,
  subheader,
  cancelText,
  okText,
  content = <Children />,
  data = []
}) => {
  const { t } = useTranslation();
  return (
    <div className={clsx(style.Overlay, show ? 'd-block' : 'd-none')}>
      <div className={clsx(style.Modal, `z-index-2 ${show ? 'd-block' : 'd-none'}`)}>
        <div className={clsx(style.ModalHeader, 'text-center')}>
          <span className={'font-modal-header text-white'}>{header}</span>
        </div>

        <div className={clsx(style.ModalSubheader, 'mt-10 text-center')}>
          <span className="font-binary text-white">{subheader}</span>
        </div>

        <div className={clsx(style.ModalBody, 'mt-25')}>{content}</div>

        {data.length > 0 ? (
          <div className="tw-flex tw-w-full tw-justify-center tw-text-2xl">
            <table className="tw-table-auto tw-font-medium tw-border-spacing-10">
              <tbody>
                {data[0]?.succeedRegisteredUsers?.length > 0 &&
                  data[0]?.succeedRegisteredUsers.map((item, index) => (
                    <tr key={index}>
                      <td className="tw-whitespace-nowrap">
                        {item.firstName} {item.lastName}
                      </td>
                      <td className="tw-whitespace-nowrap">
                        {item.email ?? item.phoneNumber ?? item.registrationCode}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="tw-mt-16"></div>
        )}

        <div className={clsx(style.ModalFooter)}>
          <div className="text-center">
            {onCancel && (
              <>
                <label
                  className="upload-photo-label font-button-label mt-25 cursor-pointer z-index-2"
                  style={{ margin: 0 }}
                  onClick={onCancel}>
                  <span style={{ textTransform: 'uppercase' }}>
                    {cancelText ? cancelText : t('create another team')}
                  </span>
                </label>
                <br />
              </>
            )}
            {onOk && (
              <button className={`button active ${onCancel ? 'mt-40' : ''}`} onClick={onOk}>
                <span className="font-button-label text-white text-uppercase">
                  {okText ? okText : t('done')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
