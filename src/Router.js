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

const Router = ({token, userType, email}) => {
  return (
    <BrowserRouter basename="/" history={history}>
      {
        token ? (
          <Switch>
            {
              ableToLogin(userType) &&
              <SignInRoute
                loggedIn={true}
                path="/invite"
                render={(props) => (
                  <Invite
                    {...props}
                    email={email}
                    userType={userType}
                  />
                )}
              />
            }

            {
              ableToLogin(userType) &&
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

            <Redirect to="/invite"/>
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

            <SignInRoute
              path="/phone-verification"
              render={(props) => (
                <PhoneVerification
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
  email: get(state, 'auth.email')
});

export default connect(mapStateToProps, null)(Router);