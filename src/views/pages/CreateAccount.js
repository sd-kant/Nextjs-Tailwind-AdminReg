import React, {useEffect} from 'react';
import {connect} from "react-redux";
import FormPassword from "../partials/create-account/FormPassword";
import {Redirect, Route, Switch} from "react-router-dom";
import logo from "../../assets/images/logo_light.svg";
import {useTranslation} from "react-i18next";
import FormName from "../partials/create-account/FormName";
import FormGender from "../partials/create-account/FormGender";
import FormBirth from "../partials/create-account/FormBirth";
import FormHeight from "../partials/create-account/FormHeight";
import FormWeight from "../partials/create-account/FormWeight";
import FormCountry from "../partials/create-account/FormCountry";
import FormWorkLength from "../partials/create-account/FormWorkLength";
import FormStartWork from "../partials/create-account/FormStartWork";
import FormPhotoUpload from "../partials/create-account/FormPhotoUpload";
import FormInitial from "../partials/medical-prompt/FormInitial";
import FormComplete from "../partials/medical-prompt/FormComplete";
import {bindActionCreators} from "redux";
import {
  getMedicalQuestionsAction, getMedicalResponsesAction,
  getMyProfileAction,
  setMedicalQuestionsAction,
  updateMyProfileAction
} from "../../redux/action/profile";
import FormMedical from "../partials/medical-prompt/FormMedical";
import {setRestBarClassAction, showErrorNotificationAction} from "../../redux/action/ui";
import FormUnit from "../partials/create-account/FormUnit";
import FormResend from "../partials/create-account/FormResend";
import FormTimezone from "../partials/create-account/FormTimezone";
import FormPhoneRegister from "../partials/create-account/FormPhoneRegister";
import FormPhoneVerification from "../partials/create-account/FormPhoneVerification";
import {get} from "lodash";

const CreateAccount = (
  {
    ...props
  }) => {
  const {t} = useTranslation();
  const {token, getMyProfile, location, getMedicalQuestions, getMedicalResponses} = props;
  const pathname = location.pathname;
  const uris = pathname && pathname.split('/');
  const uri = uris && uris[uris.length - 1];
  const isMedical = (uri.indexOf('medical') !== -1);

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
        <span className='form-header-text'>
          //&nbsp;&nbsp;{isMedical ? t("medical questionnaire") : t("create account")}
        </span>
      </div>

      <Switch>
        {/* creating account */}
        {/*<Route
          exact
          path='/create-account/resend'
        >
          <FormResend
            {...props}
          />
        </Route>*/}

        <Route
          exact
          path='/create-account/password'
        >
          <FormPassword
            {...props}
          />
        </Route>
        {
          !!token &&
          <Route
            exact
            path='/create-account/name'
          >
            <FormName
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/phone-register'
          >
            <FormPhoneRegister
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/phone-verification'
          >
            <FormPhoneVerification
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/gender'
          >
            <FormGender
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/dob'
          >
            <FormBirth
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/unit'
          >
            <FormUnit
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/height'
          >
            <FormHeight
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/weight'
          >
            <FormWeight
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/country'
          >
            <FormCountry
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/timezone'
          >
            <FormTimezone
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/workLength'
          >
            <FormWorkLength
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/startWork'
          >
            <FormStartWork
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path='/create-account/photoUpload'
          >
            <FormPhotoUpload
              {...props}
            />
          </Route>
        }
        {
          !!token &&
          <Route
            exact
            path="/create-account/medical-initial"
          >
            <FormInitial
              {...props}
            />
          </Route>
        }
        {/* medical questions */}
        {
          !!token &&
          <Route
            exact
            path="/create-account/medical/:order"
            render={matchProps => (
              <FormMedical
                {...props}
                {...matchProps}
              />
            )}
          />
        }
        {
          !!token &&
          <Route
            exact
            path="/create-account/medical-complete"
          >
            <FormComplete
              {...props}
            />
          </Route>
        }

        <Redirect to='/create-account/password'/>
      </Switch>
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