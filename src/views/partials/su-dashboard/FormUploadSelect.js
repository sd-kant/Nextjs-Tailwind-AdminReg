import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
import backIcon from "../../../assets/images/back.svg";
import editIcon from "../../../assets/images/edit-fire.svg";
import uploadIcon from "../../../assets/images/upload-fire.svg";
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import {useNavigate} from "react-router-dom";

const FormUploadSelect = (props) => {
  const {
    t,
    setRestBarClass,
    id,
    organizationId
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass("progress-72 medical");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate(`/invite/${organizationId}/team-create`)}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
            {t("previous")}
          </span>
        </div>

        <div className='mt-28 form-header-medium'>
          <span className='font-header-medium d-block'>
            {t("add way header")}
          </span>
        </div>

        <div className="mt-40 d-flex">
          <div
            className={`tap cursor-pointer`}
            onClick={() => {
              navigate(`/invite/${organizationId}/edit/manual/${id}`);
            }}
          >
            <img src={editIcon} alt="male icon"/>

            <span className='font-binary mt-8'>
              {t("manual")}
            </span>
          </div>

          <div
              className={`ml-40 cursor-pointer tap`}
              onClick={() => navigate(`/invite/${organizationId}/upload/${id}`)}
            >
              <img src={uploadIcon} alt="female icon"/>

              <span className='font-binary mt-8 capitalize'>
                {t("upload")}
              </span>
            </div>
        </div>
      </div>

      <div className='mt-80 form-header-medium'>
        <span className='font-binary mt-8'>
        </span>
      </div>
    </div>
  )
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      setVisibleSuccessModal: setVisibleSuccessModalAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(FormUploadSelect));