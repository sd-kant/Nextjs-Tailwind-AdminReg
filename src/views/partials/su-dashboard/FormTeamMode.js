import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
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
import {get} from 'lodash';
import {useNavigate} from "react-router-dom";

const FormTeamMode = (props) => {
  const {t, setRestBarClass, organizationId, myOrganizationId, isAdmin} = props;
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass("progress-72 medical");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orgId = [undefined, "-1", null, ""].includes(organizationId?.toString()) ? myOrganizationId : organizationId;
  const handleCancel = () => {
    navigate("/select-mode");
  };

  return (
    <div className='form-group mt-57'>
      <div>
        {
          isAdmin &&
          <div
            className="d-flex align-center cursor-pointer"
            onClick={() => navigate('/invite/company')}
          >
            <img src={backIcon} alt="back"/>
            &nbsp;&nbsp;
            <span className='font-button-label text-orange'>
              {t("previous")}
            </span>
          </div>
        }

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
              navigate(`/invite/${orgId}/team-create`);
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
              navigate(`/invite/${organizationId}/team-modify`);
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
              navigate(`/invite/${organizationId}/search`);
            }}
          >
            <img src={searchIcon} alt="search icon"/>

            <span className='font-binary mt-8 capitalize'>
                {t("search")}
              </span>
          </div>
        </div>
      </div>

      <div className='mt-80'>
        {
          !isAdmin ?
            <button
              className={`button cursor-pointer cancel`}
              type={"button"}
              onClick={handleCancel}
            >
              <span className='font-button-label text-orange text-uppercase'>
                {t("cancel")}
              </span>
            </button> : null
        }
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  isAdmin: get(state, 'auth.isAdmin'),
  userType: get(state, 'auth.userType'),
  myOrganizationId: get(state, 'auth.organizationId'),
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