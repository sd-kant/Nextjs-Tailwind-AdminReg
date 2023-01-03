import React, {useEffect, Suspense, lazy} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {get} from "lodash";
import {useNavigate} from "react-router-dom";
import {
  getMedicalQuestionsAction,
  getMedicalResponsesAction,
  getMyProfileAction,
  updateMyProfileAction,
  setMedicalQuestionsAction,
} from "../../redux/action/profile";
import {
  setRestBarClassAction,
  showErrorNotificationAction
} from "../../redux/action/ui";
import logo from "../../assets/images/logo_light.svg";

const FormPassword = lazy(() => import("../partials/create-account/FormPassword"));
const FormName = lazy(() => import("../partials/create-account/FormName"));
const FormGender = lazy(() => import("../partials/create-account/FormGender"));
const FormBirth = lazy(() => import("../partials/create-account/FormBirth"));
const FormHeight = lazy(() => import("../partials/create-account/FormHeight"));
const FormWeight = lazy(() => import("../partials/create-account/FormWeight"));
const FormWorkLength = lazy(() => import("../partials/create-account/FormWorkLength"));
const FormStartWork = lazy(() => import("../partials/create-account/FormStartWork"));
const FormPhotoUpload = lazy(() => import("../partials/create-account/FormPhotoUpload"));
const FormInitial = lazy(() => import("../partials/medical-prompt/FormInitial"));
const FormComplete = lazy(() => import("../partials/medical-prompt/FormComplete"));
const FormMedical = lazy(() => import("../partials/medical-prompt/FormMedical"));
const FormUnit = lazy(() => import("../partials/create-account/FormUnit"));
const FormTimezone = lazy(() => import("../partials/create-account/FormTimezone"));
const FormPhoneRegister = lazy(() => import("../partials/create-account/FormPhoneRegister"));
const FormPhoneVerification = lazy(() => import("../partials/create-account/FormPhoneVerification"));
const ParamsWrapper = lazy(() => import("../partials/su-dashboard/ParamsWrapper"));
const FormSSOAuth = lazy(() => import("../partials/create-account/FormSSOAuth"));
const FormUsername = lazy(() => import("../partials/create-account/FormUsername"));
import Loader from "../components/Loader";

const CreateAccount = (
  {
    ...props
  }) => {
  const {t} = useTranslation();
  const {
    token,
    getMyProfile,
    getMedicalQuestions,
    getMedicalResponses
  } = props;
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

      <Suspense fallback={<Loader/>}>
        <Routes>
          <Route
            path='/password'
            element={
              <FormSSOAuth
                navigate={navigate}
                {...props}
              />
            }
          />

          <Route
            path='/username'
            element={
              <FormUsername
                navigate={navigate}
                {...props}
              />
            }
          />

          <Route
            path='/password-v2'
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
      </Suspense>
    </div>
  )
};

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
