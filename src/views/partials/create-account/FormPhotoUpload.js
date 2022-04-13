import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
import backIcon from "../../../assets/images/back.svg";
import {
  getTokenFromUrl,
} from "../../../utils";
import {setLoadingAction, showErrorNotificationAction, showSuccessNotificationAction} from "../../../redux/action/ui";
import {useNavigate} from "react-router-dom";

const FormPhotoUpload = (props) => {
  const {t, setRestBarClass} = props;
  // eslint-disable-next-line no-unused-vars
  const [photo, setPhoto] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = getTokenFromUrl();
    if (!token) {
      // window.location.href = "/";
    } else {
      setToken(token);
    }
    setRestBarClass('progress-100');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
  }

  // eslint-disable-next-line no-unused-vars
  const selectPhoto = async (e) => {
    const originName = (e.target['files']?.[0]?.name);
    setPhoto(originName);
  }

  return (
    <div className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate('/create-account/startWork')}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
          {t("previous")}
        </span>
        </div>
      </div>

      <div className='mt-80'>
        <button
          className={`button active cursor-pointer`}
          type={"submit"}
          onClick={submit}
        >
          <span className='font-button-label text-white'>
            {t("continue")}
          </span>
        </button>
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(FormPhotoUpload));