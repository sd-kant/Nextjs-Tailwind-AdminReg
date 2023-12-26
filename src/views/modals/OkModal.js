import React from 'react';
import Modal from 'react-modal';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';

const OkModal = ({ t, isOpen = false, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      className={clsx('tw-relative', 'tw-bg-neutral-700', 'tw-p-2', 'sm:tw-p-4', 'tw-rounded-lg')}
      overlayClassName={clsx(
        'tw-flex',
        'tw-fixed',
        'tw-inset-0',
        'tw-z-50',
        'tw-justify-center',
        'tw-items-center',
        'tw-w-full',
        'tw-h-[calc(100%-1rem)]',
        'tw-max-h-full'
      )}
      appElement={document.getElementsByTagName('body')}>
      <div
        className={clsx(
          'tw-flex',
          'tw-flex-col',
          'tw-p-6',
          'tw-gap-2',
          'tw-justify-center',
          'tw-items-center'
        )}>
        <p className="font-header-medium">{t('copy token success')}</p>
        <button
          className={clsx(
            'tw-relative',
            'tw-border-none',
            'tw-rounded-lg',
            'tw-outline-none',
            'tw-z-1',
            'tw-w-32',
            'tw-py-4',
            'tw-bg-amber-600',
            'tw-cursor-pointer'
          )}
          onClick={() => {
            onClose();
          }}
          type={'button'}>
          <span className="font-button-label text-white text-uppercase">{t('ok')}</span>
        </button>
      </div>
    </Modal>
  );
};

export default withTranslation()(OkModal);
