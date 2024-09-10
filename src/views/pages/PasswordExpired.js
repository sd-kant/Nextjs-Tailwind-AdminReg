import React from 'react';
import { connect } from 'react-redux';
import logo from '../../assets/images/logo_light.svg';
import FormPasswordExpired from '../partials/su-login/FormPasswordExpired';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { get } from 'lodash';

const PasswordExpired = ({ myOrganization }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="form-main">
      <div className="form-header">
        <img className="form-header-logo" src={logo} alt="kenzen logo" />
        &nbsp;&nbsp;
        <span className="form-header-text text-capitalize">
          &#47;&#47;&nbsp;&nbsp;{t('password expired')}
        </span>
      </div>

      <FormPasswordExpired
        pwMinLength={myOrganization?.settings?.passwordMinimumLength ?? 9}
        navigate={navigate}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  token: get(state, 'auth.token'),
  myOrganization: get(state, 'profile.organization')
});

export default connect(mapStateToProps, null)(PasswordExpired);
