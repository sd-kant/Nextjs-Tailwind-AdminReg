import React, { useEffect, useState } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadBulkUserList } from 'http/organization';
import PreviousButton from 'views/components/PreviousButton';
import UploadDropZoneInput from 'views/components/UploadDropZoneInput';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from 'redux/action/ui';

const FormConnectMemberUpload = ({ t, setRestBarClass, setLoading }) => {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const [fileUploadResult, setFileUploadResult] = useState([]);

  useEffect(() => {
    setRestBarClass('progress-72 medical');
  }, [setRestBarClass]);

  const handleFileChange = (file) => {
    setLoading(true);
    uploadBulkUserList(organizationId, file)
      .then((res) => {
        setFileUploadResult(res.data);
      })
      .catch((e) => {
        console.log('error:', e);
        showErrorNotificationAction(t('msg csv content error'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fileUploadResultRender = fileUploadResult.map((item, index) => (
    <tr key={index}>
      <td>{item?.email}</td>
      <td>{item?.phone}</td>
      <td>{item?.deviceId}</td>
      <td>{item?.result}</td>
    </tr>
  ));

  return (
    <div className="tw-flex tw-mt-[57px] tw-flex-col tw-items-start">
      <PreviousButton onClick={() => navigate(`/connect/member/${organizationId}/method`)}>
        {t('previous')}
      </PreviousButton>
      <div className="tw-mt-[28px] form-header-medium">
        <span className="font-header-medium tw-block">{t('upload description')}</span>
      </div>
      <div className="tw-mt-[40px] tw-flex tw-gap-[40px] tw-w-[500px]">
        <UploadDropZoneInput handleFileChange={handleFileChange}>
          {t('upload hub members')}
        </UploadDropZoneInput>
      </div>
      <div className="tw-mt-[10px]">
        <span className="font-binary">
          <Trans
            i18nKey="upload guide"
            components={{
              a: (
                <a
                  className="tw-text-orange-400 tw-underline-offset-0 tw-cursor-pointer"
                  href="https://kenzen0.sharepoint.com/:x:/s/Marketing/EWMoBTc5y85Bp_nkLy7CM54BpfGha7tGsbFox_axLVmQpA"
                  target="_blank"
                  rel="noreferrer"
                />
              )
            }}
          />
        </span>
      </div>

      {fileUploadResult?.length > 0 && (
        <div className="tw-flex tw-overflow-auto tw-max-h-[400px] text-left">
          <table className="tw-table-auto tw-mt-[40px] tw-border-separate tw-border-spacing-4">
            <thead className="tw-text-orange-400">
              <tr>
                <th>{t('email')}</th>
                <th>{t('phone number')}</th>
                <th>{t('device id')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>{fileUploadResultRender}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(withTranslation()(FormConnectMemberUpload));
