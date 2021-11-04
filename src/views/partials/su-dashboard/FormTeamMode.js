import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import plusIcon from "../../../assets/images/plus-circle-fire.svg";
import editIcon from "../../../assets/images/edit.svg";
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";

const FormTeamMode = (props) => {
  const {t, setRestBarClass} = props;

  useEffect(() => {
    setRestBarClass("progress-72 medical");
  }, []);

  const navigateTo = (path) => {
    history.push(path);
  }

  return (
    <div className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigateTo('/invite/company')}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
              {t("previous")}
            </span>
        </div>

        <div className='mt-28 form-header-medium'>
            <span className='font-header-medium d-block'>
              {t("create or modify team")}
            </span>
        </div>

        <div className='mt-8'>
            <span className='font-binary'>
              {t("select option")}
            </span>
        </div>

        <div className="mt-40 d-flex">
          <div
            className={`tap cursor-pointer`}
            onClick={() => {
              history.push("/invite/team-create");
            }}
          >
            <img src={plusIcon} alt="male icon"/>

            <span className='font-binary mt-8'>
                {t("create")}
              </span>
          </div>

          <div
            className={`ml-40 cursor-pointer tap`}
            onClick={() => {
              history.push("/invite/team-modify");
            }}
          >
            <img src={editIcon} alt="female icon"/>

            <span className='font-binary mt-8 capitalize'>
                {t("modify")}
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
}

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
)(withTranslation()(FormTeamMode));