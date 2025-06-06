import React, { Fragment, useEffect, useRef, useState } from 'react';
import style from './OtpInput.module.css';
import clsx from 'clsx';
let currentOTPIndex = 0;
const OtpInput = ({ length = 6, onOTPChange }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const [activeOTPIndex, setActiveOTPIndex] = useState(0);
  const inputRef = useRef(null);
  const handleOnChange = (e) => {
    const { value } = e.target;
    const newOTP = [...otp];
    newOTP[currentOTPIndex] = value.substring(value.length - 1);
    if (!value) setActiveOTPIndex(currentOTPIndex - 1);
    else setActiveOTPIndex(currentOTPIndex + 1);
    setOtp(newOTP);
    onOTPChange(newOTP.join(''));
  };

  const handleOnPaste = (e) => {
    e.preventDefault();
    let paste = (e.clipboardData || window.clipboardData).getData('text')?.trim();
    if (/^\d+$/.test(paste) & (paste.length === 6)) {
      setOtp(paste.split(''));
      onOTPChange(paste);
    }
  };

  const handleOnKeyDown = ({ key }, index) => {
    currentOTPIndex = index;
    if (key === 'Backspace') setActiveOTPIndex(currentOTPIndex - 1);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOTPIndex]);

  return (
    <div className="tw-flex tw-gap-[5px]">
      {otp.map((_, index) => {
        return (
          <Fragment key={index}>
            <input
              ref={index === activeOTPIndex ? inputRef : null}
              name={`otpNum${index}`}
              type="number"
              className={clsx(
                style.SpinButton,
                'tw-rounded-lg',
                'tw-bg-zinc-800',
                'tw-z-10',
                'tw-text-white',
                'tw-border-none',
                'tw-outline-none',
                'md:tw-text-6xl',
                'tw-text-lg',
                'md:tw-w-16',
                'sm:tw-w-12',
                'tw-w-8',
                'tw-transition',
                'tw-text-center'
              )}
              onChange={handleOnChange}
              onPaste={handleOnPaste}
              onKeyDown={(e) => handleOnKeyDown(e, index)}
              value={otp[index]}
            />
          </Fragment>
        );
      })}
    </div>
  );
};

export default OtpInput;
