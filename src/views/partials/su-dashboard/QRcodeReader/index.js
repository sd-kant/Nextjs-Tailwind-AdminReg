import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import QrReader from 'react-qr-scanner';

const QRcodeReacer = ({ open, onClose, onScan }) => {
  console.log('openQrCodeReader ==>', open);
  const handleError = (error) => {
    console.log(error);
  };

  return (
    <div
      className={clsx(
        `tw-w-full tw-h-[300px] md:tw-w-[300px] md:tw-h-[300px]`,
        open ? 'tw-block' : 'tw-hidden'
      )}>
      {open && (
        <QrReader
          facingMode="rear"
          delay={100}
          style={{
            height: '100%',
            width: '100%'
          }}
          onError={handleError}
          onScan={onScan}
        />
      )}
    </div>
  );
};

QRcodeReacer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onScan: PropTypes.func.isRequired
};

export default QRcodeReacer;
