import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import QrReader from 'react-qr-scanner';

const QRcodeReacer = ({ open, onScan, handleError }) => {
  const defaultHandleError = (error) => {
    alert(error);
  };

  return (
    <div
      className={clsx(
        `tw-w-full tw-h-[300px] md:tw-w-[300px] md:tw-h-[300px]`,
        open ? 'tw-block' : 'tw-hidden'
      )}>
      {open && (
        <QrReader
          delay={100}
          facingmode="rear"
          style={{
            height: '100%',
            width: '100%'
          }}
          onError={handleError ?? defaultHandleError}
          onScan={onScan}
        />
      )}
    </div>
  );
};

QRcodeReacer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onScan: PropTypes.func.isRequired,
  handleError: PropTypes.func
};

export default QRcodeReacer;
