import React, {useEffect} from 'react';
import {
  getTokenFromUrl, getDeviceId
} from "../../../utils";
import {useNavigate} from "react-router-dom";
import {apiBaseUrl} from "../../../config";

const FormSSOAuth = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const tokenFromUrl = getTokenFromUrl();
    if (!tokenFromUrl) {
        navigate("/");
    } else {
      // sso flow
      const deviceId = `web:${getDeviceId()}`;
      window.location.href = `${apiBaseUrl}/master/token?token=${tokenFromUrl}&deviceId=${deviceId}&source=create-account`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div/>
  )
}

export default FormSSOAuth;