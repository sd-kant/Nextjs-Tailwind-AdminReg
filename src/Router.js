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
import CreateAccount from "./views/pages/CreateAccount";
import {bindActionCreators} from "redux";
import {setLoadingAction} from "./redux/action/ui";
import {StickyComponentsProvider} from "./providers/StickyComponentsProvider";
import {DashboardProvider} from "./providers/DashboardProvider";
import MainRouteV2 from "./views/routes/MainRouteV2";
import DashboardV2 from "./views/pages/DashboardV2";
import SelectMode from "./views/pages/SelectMode";
import ForgotUsername from "./views/pages/ForgotUsername";
import PasswordExpired from "./views/pages/PasswordExpired";

const Router = (
  {
    token,
    userType,
    loggedIn,
    passwordExpired,
    metric,
    setLoading,
  }) => {
  const redirectPath = loggedIn ? (ableToLogin(userType) ? "/select-mode" : "/create-account") : "/login";

  return (
    <BrowserRouter basename="/" history={history}>
      {
        token ? (
          passwordExpired ? (
            <Switch>
              <SignInRoute
                loggedIn={false}
                path="/password-expired"
                render={(props) => (
                  <PasswordExpired
                    {...props}
                  />
                )}
              />
              <Redirect to="/password-expired"/>
            </Switch>
          ) : (
            <Switch>
              {/* registration side */}
              <SignInRoute
                path="/create-account"
                loggedIn={loggedIn}
                render={(props) => (
                  <CreateAccount
                    {...props}
                  />
                )}
              />
              {/* admin side*/}
              {
                ableToLogin(userType) &&
                loggedIn &&
                <SignInRoute
                  loggedIn={true}
                  isEntry={true}
                  path="/select-mode"
                  render={(props) => (
                    <SelectMode
                      {...props}
                    />
                  )}
                />
              }
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
              {
                loggedIn &&
                <MainRouteV2
                  exact
                  path="/dashboard/multi"
                  render={(props) => (
                    <StickyComponentsProvider>
                      <DashboardProvider
                        setLoading={setLoading}
                        metric={metric}
                      >
                        <DashboardV2
                          multi={true}
                          {...props}
                        />
                      </DashboardProvider>
                    </StickyComponentsProvider>
                  )}
                />
              }
              <Redirect to={redirectPath}/>
            </Switch>
          )
        ) : (
          <Switch>
            {/* registration side */}
            <SignInRoute
              path="/create-account"
              render={(props) => (
                <CreateAccount
                  {...props}
                />
              )}
            />

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
              path="/forgot-username"
              render={(props) => (
                <ForgotUsername
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
  metric: get(state, 'ui.metric'),
  passwordExpired: get(state, 'auth.passwordExpired'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Router);