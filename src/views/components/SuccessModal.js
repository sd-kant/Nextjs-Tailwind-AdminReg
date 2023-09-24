import React from 'react';
import { useTranslation } from 'react-i18next';
// import CheckCircle from '../../assets/images/check-circle.svg';
import clsx from 'clsx';
import style from './SuccessModal.module.scss';

const SuccessModal = (props) => {
  const show = props.show;
  const { t } = useTranslation();
  return (
    <div className={clsx(style.Overlay, show ? 'd-block' : 'd-none')}>
      <div
        className={`modal z-index-2 ${show ? 'd-block' : 'd-none'}`}
        style={{ padding: '65px 65px 25px 65px' }}>
        <div className="modal-header text-center">
          <span className="font-modal-header text-white">{t('team create success')}</span>
        </div>

        <div className="modal-subheader mt-10 text-center">
          <span className="font-binary text-white">{t('team create success description')}</span>
        </div>
        <div className="modal-subheader mt-10 text-center">
          <span className="tw-text-lg text-white tw-font-medium">{t('admin provide pin')}</span>
        </div>

        {/* <div className="modal-body mt-60">
          <div className="d-flex justify-center">
            <img src={CheckCircle} alt="flower" width={105} height={105} />
          </div>
        </div> */}

        {props.data?.length > 0 && (
          <div className="tw-flex tw-w-full tw-justify-center tw-text-4xl tw-mt-6">
            <table className="tw-table-auto tw-font-medium">
              <tbody>
                {props.data?.map((item, index) => (
                  <tr
                    key={index}
                    className="tw-flex tw-justify-between tw-gap-4 tw-whitespace-nowrap">
                    <td>
                      {item.firstName} {item.lastName}
                    </td>
                    <td>{item.email ?? item.phoneNumber ?? item.registrationCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-footer tw-mt-16">
          <div className="text-center">
            <label
              className="upload-photo-label font-button-label mt-25 cursor-pointer z-index-2"
              style={{ margin: 0 }}
              onClick={props.onCancel}>
              <span style={{ textTransform: 'uppercase' }}>{t('create modify team')}</span>
            </label>
            <br />
            <button className={`button active mt-40`} onClick={props.onOk}>
              <span className="font-button-label text-white text-uppercase">{t('log out')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
