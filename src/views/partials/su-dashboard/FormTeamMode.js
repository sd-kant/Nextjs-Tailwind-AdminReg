import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import plusIcon from "../../../assets/images/plus-circle-fire.svg";
import editIcon from "../../../assets/images/edit.svg";
import searchIcon from "../../../assets/images/search-orange.svg";
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import {USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN} from "../../../constant";
import {get} from 'lodash';

const FormTeamMode = (props) => {
  const {t, setRestBarClass, userType} = props;

  useEffect(() => {
    setRestBarClass("progress-72 medical");
  }, []);

  const navigateTo = (path) => {
    history.push(path);
  }
  const isAdmin = userType?.includes(USER_TYPE_ADMIN) || userType?.includes(USER_TYPE_ORG_ADMIN);

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
          {
            isAdmin &&
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
          }

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

          <div
            className={`ml-40 tap cursor-pointer`}
            onClick={() => {
              history.push("/invite/search");
            }}
          >
            <img src={searchIcon} alt="search icon"/>

            <span className='font-binary mt-8 capitalize'>
                {t("search")}
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

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
});

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
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(FormTeamMode));