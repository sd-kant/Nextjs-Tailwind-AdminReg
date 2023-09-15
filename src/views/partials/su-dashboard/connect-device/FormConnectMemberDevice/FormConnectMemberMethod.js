import { withTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import PreviousButton from 'views/components/PreviousButton';
import { useNavigate, useParams } from 'react-router-dom';
import BigButton from 'views/components/BigButton';
import editIcon from 'assets/images/edit.svg';
import uploadIcon from 'assets/images/upload-fire.svg';
import { setRestBarClassAction } from 'redux/action/ui';
import { bindActionCreators } from 'redux';

const FormConnectMemberMethod = ({ t, isAdmin, setRestBarClass }) => {
  const navigate = useNavigate();
  useEffect(() => {
    setRestBarClass('progress-36 medical');
  }, [setRestBarClass]);

  const { organizationId } = useParams();
  return (
    <div className="tw-flex tw-mt-[57px] tw-flex-col tw-items-start">
      {isAdmin && (
        <PreviousButton onClick={() => navigate('/connect/member/company')}>
          {t('previous')}
        </PreviousButton>
      )}
      <div className="tw-mt-[28px] form-header-medium">
        <span className="font-header-medium tw-block">{t('how to add new hub team member')}</span>
      </div>
      <div className="tw-mt-[40px] tw-flex tw-gap-[40px]">
        <BigButton
          onClick={() => navigate(`/connect/member/${organizationId}/search`)}
          icon={editIcon}>
          {t('Manual Search')}
        </BigButton>
        <BigButton
          onClick={() => navigate(`/connect/member/${organizationId}/upload`)}
          icon={uploadIcon}>
          {t('Upload')}
        </BigButton>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAdmin: get(state, 'auth.isAdmin')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(FormConnectMemberMethod));
