import React, { useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import uploadIcon from 'assets/images/upload-fire.svg';
import { showErrorNotificationAction } from 'redux/action/ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import clsx from 'clsx';

const DropZone = ({ t, children, showErrorNotification, handleFileChange }) => {
  const fileInputRef = useRef(null);
  const [hover, setHover] = useState(false);

  const fileInputClicked = () => {
    fileInputRef.current.click();
  };

  const validateFile = (file) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return validTypes.indexOf(file.type) !== -1;
  };

  const filesSelected = () => {
    const selectedFile = fileInputRef.current?.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        handleFileChange(selectedFile);
      } else {
        showErrorNotification(t('msg csv content error'));
        console.log('file content error');
      }
    }
  };

  const DropZone = () => {
    return (
      <div
        className={clsx(
          hover ? 'tw-bg-gray-400' : 'tw-bg-zinc-800',
          'tw-flex tw-justify-center tw-cursor-pointer tw-py-[40px] tw-px-[25px] tw-rounded-xl tw-w-full'
        )}
        onClick={fileInputClicked}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        <img src={uploadIcon} alt="upload icon" />

        <span className="tw-ml-[10px]">{children}</span>
      </div>
    );
  };
  return (
    <div className="tw-flex tw-w-full">
      <DropZone />
      <input
        ref={fileInputRef}
        className="tw-hidden"
        type="file"
        accept=".xls,.xlsx"
        onChange={filesSelected}
      />
    </div>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      showErrorNotification: showErrorNotificationAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(DropZone));
