import React from 'react';
import {connect} from "react-redux";
import {Router as BrowserRouter, Redirect, Switch} from "react-router-dom";
import history from "./history";
import SignInRoute from "./views/routes/SignInRoute";
import SULogin from "./views/pages/SULogin";
import MainRoute from "./views/routes/MainRoute";
import Dashboard from "./views/pages/Dashboard";
import Invite from "./views/pages/Invite";
import {get} from "lodash";
import ForgotPassword from "./views/pages/ForgotPassword";
import ResetPassword from "./views/pages/ResetPassword";
import {ableToLogin} from "./utils";
import PhoneVerification from "./views/pages/PhoneVerification";
import PhoneRegister from "./views/pages/PhoneRegister";
import MobileLogin from "./views/pages/MobileLogin";
import MobilePhoneRegister from "./views/pages/MobilePhoneRegister";
import MobilePhoneVerification from "./views/pages/MobilePhoneVerification";

const Router = ({token, userType, loggedIn}) => {
  return (
    <BrowserRouter basename="/" history={history}>
      {
        token ? (
          <Switch>
            {
              ableToLogin(userType) &&
              loggedIn &&
              <SignInRoute
                loggedIn={true}
                path="/invite"
                render={(props) => (
                  <Invite
                    {...props}
                    userType={userType}
                  />
                )}
              />
            }

            {
              ableToLogin(userType) &&
              loggedIn &&
              <MainRoute
                exact
                path="/dashboard"
                render={(props) => (
                  <Dashboard
                    {...props}
                  />
                )}
              />
            }

            {
              ableToLogin(userType) &&
              !loggedIn &&
              <SignInRoute
                path="/phone-verification/:mode"
                render={(props) => (
                  <PhoneVerification
                    {...props}
                  />
                )}
              />
            }

            {
              ableToLogin(userType) &&
              !loggedIn &&
              <SignInRoute
                path="/phone-register"
                render={(props) => (
                  <PhoneRegister
                    {...props}
                  />
                )}
              />
            }

            <Redirect to={loggedIn ? "/invite" : "/"}/>
          </Switch>
        ) : (
          <Switch>
            <SignInRoute
              path="/login"
              render={(props) => (
                <SULogin
                  {...props}
                />
              )}
            />

            <SignInRoute
              path="/mobile-login"
              render={(props) => (
                <MobileLogin
                  {...props}
                />
              )}
            />

            <SignInRoute
              path="/mobile-phone-register"
              render={(props) => (
                <MobilePhoneRegister
                  {...props}
                />
              )}
            />

            <SignInRoute
              path="/mobile-phone-verification/:mode"
              render={(props) => (
                <MobilePhoneVerification
                  {...props}
                />
              )}
            />

            <SignInRoute
              path="/forgot-password"
              render={(props) => (
                <ForgotPassword
                  {...props}
                />
              )}
            />

            <SignInRoute
              path="/reset-password"
              render={(props) => (
                <ResetPassword
                  {...props}
                />
              )}
            />

            <Redirect to='/login'/>
          </Switch>
        )
      }
    </BrowserRouter>
  )
}

const mapStateToProps = (state) => ({
  token: get(state, 'auth.token'),
  userType: get(state, 'auth.userType'),
  loggedIn: get(state, 'auth.loggedIn'),
});

export default connect(mapStateToProps, null)(Router);