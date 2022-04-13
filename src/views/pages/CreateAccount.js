import React, {useEffect} from 'react';
import {connect} from "react-redux";
import FormPassword from "../partials/create-account/FormPassword";
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormName from "../partials/create-account/FormName";
import FormGender from "../partials/create-account/FormGender";
import FormBirth from "../partials/create-account/FormBirth";
import FormHeight from "../partials/create-account/FormHeight";
import FormWeight from "../partials/create-account/FormWeight";
import FormWorkLength from "../partials/create-account/FormWorkLength";
import FormStartWork from "../partials/create-account/FormStartWork";
import FormPhotoUpload from "../partials/create-account/FormPhotoUpload";
import FormInitial from "../partials/medical-prompt/FormInitial";
import FormComplete from "../partials/medical-prompt/FormComplete";
import {bindActionCreators} from "redux";
import {
  getMedicalQuestionsAction, getMedicalResponsesAction,
  getMyProfileAction,
  updateMyProfileAction,
  setMedicalQuestionsAction,
} from "../../redux/action/profile";
import FormMedical from "../partials/medical-prompt/FormMedical";
import {setRestBarClassAction, showErrorNotificationAction} from "../../redux/action/ui";
import FormUnit from "../partials/create-account/FormUnit";
import FormTimezone from "../partials/create-account/FormTimezone";
import FormPhoneRegister from "../partials/create-account/FormPhoneRegister";
import FormPhoneVerification from "../partials/create-account/FormPhoneVerification";
import {get} from "lodash";
import {useNavigate} from "react-router-dom";
import ParamsWrapper from "../partials/su-dashboard/ParamsWrapper";

const CreateAccount = (
  {
    ...props
  }) => {
  const {t} = useTranslation();
  const {token, getMyProfile, getMedicalQuestions, getMedicalResponses} = props;
  const {pathname} = useLocation();
  const uris = pathname && pathname.split('/');
  const uri = uris && uris[uris.length - 1];
  const isMedical = (uri.indexOf('medical') !== -1);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      getMyProfile();
      getMedicalQuestions();
      getMedicalResponses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
        &nbsp;&nbsp;
        {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
        <span className='form-header-text'>
          //&nbsp;&nbsp;{isMedical ? t("medical questionnaire") : t("create account")}
        </span>
      </div>

      <Routes>
        <Route
          path='/password'
          element={
            <FormPassword
              navigate={navigate}
              {...props}
            />
          }
        />

        {
          !!token &&
          <Route
            path='/name'
            element={
              <FormName
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/phone-register'
            element={
              <FormPhoneRegister
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/phone-verification'
            element={
              <FormPhoneVerification
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/gender'
            element={
              <FormGender
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/dob'
            element={
              <FormBirth
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/unit'
            element={
              <FormUnit
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/height'
            element={
              <FormHeight
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/weight'
            element={
              <FormWeight
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/timezone'
            element={
              <FormTimezone
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/workLength'
            element={
              <FormWorkLength
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/startWork'
            element={
              <FormStartWork
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path='/photoUpload'
            element={
              <FormPhotoUpload
                navigate={navigate}
                {...props}
              />
            }
          />
        }
        {
          !!token &&
          <Route
            path="/medical-initial"
            element={
              <FormInitial
                {...props}
              />
            }
          />
        }
        {/* medical questions */}
        {
          !!token &&
          <Route
            path="/medical/:order"
            element={
              <ParamsWrapper>
                <FormMedical
                  {...props}
                />
              </ParamsWrapper>
            }
          />
        }
        {
          !!token &&
          <Route
            path="/medical-complete"
            element={
              <FormComplete
                {...props}
              />
            }
          />
        }

        <Route
          path="/*"
          element={
            <Navigate to='/password' replace/>
          }
        />
      </Routes>
    </div>
  )
}

const mapStateToProps = (state) => ({
  token: get(state, 'auth.registerToken'),
  profile: get(state, 'profile.profile'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setRestBarClass: setRestBarClassAction,
      setMedicalQuestions: setMedicalQuestionsAction,
      getMyProfile: getMyProfileAction,
      updateProfile: updateMyProfileAction,
      showErrorNotification: showErrorNotificationAction,
      getMedicalQuestions: getMedicalQuestionsAction,
      getMedicalResponses: getMedicalResponsesAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateAccount);