import React, {useEffect} from 'react';
import {
  getTokenFromUrl,
  getDeviceId
} from "../../../utils";
import {useNavigate} from "react-router-dom";
import {apiBaseUrl} from "../../../config";
import {bindActionCreators} from "redux";
import {setLoadingAction} from "../../../redux/action/ui";
import {connect} from "react-redux";

const FormSSOAuth = (
  {
    setLoading,
  }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const tokenFromUrl = getTokenFromUrl();
    if (!tokenFromUrl) {
      navigate("/");
    } else {
      // sso flow
      const deviceId = `web:${getDeviceId()}`;
      window.location.href = `${apiBaseUrl}/master/token?token=${tokenFromUrl}&deviceId=${deviceId}&source=create-account`;
      setLoading(true);
    }

    return () => {
      setLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div/>
  )
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
    },
    dispatch
  );

export default connect(
  mapDispatchToProps,
)(FormSSOAuth);
