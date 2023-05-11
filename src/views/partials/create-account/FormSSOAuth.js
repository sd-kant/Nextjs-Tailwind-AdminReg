import React, { useEffect } from 'react';
import { getTokenFromUrl, getDeviceId, getParamFromUrl } from '../../../utils';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../../../config';
import { bindActionCreators } from 'redux';
import { setLoadingAction } from '../../../redux/action/ui';
import { connect } from 'react-redux';

const pwMinLength = getParamFromUrl('minPasswordLength') ?? 10;

const FormSSOAuth = ({ setLoading }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const tokenFromUrl = getTokenFromUrl();
    if (!tokenFromUrl) {
      navigate('/');
    } else {
      // sso flow
      const deviceId = `web:${getDeviceId()}`;
      // todo encodeURIComponent
      window.location.href = `${apiBaseUrl}/master/token?token=${tokenFromUrl}&deviceId=${deviceId}&source=create-account&minPasswordLength=${pwMinLength}`;
      setLoading(true);
    }

    return () => {
      setLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div />;
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction
    },
    dispatch
  );

export default connect(mapDispatchToProps)(FormSSOAuth);
