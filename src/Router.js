import React from 'react';
import {connect} from "react-redux";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import SULogin from "./views/pages/SULogin";
import Dashboard from "./views/pages/Dashboard";
import {get} from "lodash";
import ForgotPassword from "./views/pages/ForgotPassword";
import ResetPassword from "./views/pages/ResetPassword";
import PhoneVerification from "./views/pages/PhoneVerification";
import PhoneRegister from "./views/pages/PhoneRegister";
import MobileLogin from "./views/pages/MobileLogin";
import MobilePhoneRegister from "./views/pages/MobilePhoneRegister";
import MobilePhoneVerification from "./views/pages/MobilePhoneVerification";
import {bindActionCreators} from "redux";
import SelectMode from "./views/pages/SelectMode";
import ForgotUsername from "./views/pages/ForgotUsername";
import PasswordExpired from "./views/pages/PasswordExpired";
import {getMyProfileAction} from "./redux/action/profile";
import Profile from "./views/pages/Profile";
import SignInLayout from "./views/layouts/SignInLayout";
import MainLayout from "./views/layouts/MainLayout";
import MainLayoutV2 from "./views/layouts/MainLayoutV2";
import RequireAuth from "./views/wrappers/RequereAuth";
import RequireAdminRole from "./views/wrappers/RequireAdminRole";
import RequirePasswordValid from "./views/wrappers/RequirePasswordValid";
import DashboardV2Wrapper from "./views/pages/DashboardV2Wrapper";
import Invite from "./views/pages/Invite";
import CreateAccount from "./views/pages/CreateAccount";

const Router = (
  {
    token,
    loggedIn,
    getMyProfile,
  }) => {
  React.useEffect(() => {
    if (token && loggedIn) {
      getMyProfile();
    }
  }, [token, loggedIn, getMyProfile]);

  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route
          path="/password-expired"
          element={
            <RequireAuth>
              <SignInLayout>
                <PasswordExpired/>
              </SignInLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth requireLoggedIn={true}>
              <RequirePasswordValid>
                <SignInLayout
                  loggedIn={true}
                >
                  <Profile/>
                </SignInLayout>
              </RequirePasswordValid>
            </RequireAuth>
          }
        />

        <Route
          path="/select-mode"
          element={
            <RequireAuth requireLoggedIn={true}>
              <RequirePasswordValid>
                <RequireAdminRole>
                  <SignInLayout
                    isEntry={true}
                    loggedIn={true}
                  >
                    <SelectMode/>
                  </SignInLayout>
                </RequireAdminRole>
              </RequirePasswordValid>
            </RequireAuth>
          }
        />

        <Route
          path="/invite/*"
          element={
            <RequireAuth requireLoggedIn={true}>
              <RequirePasswordValid>
                <RequireAdminRole>
                  <SignInLayout
                    loggedIn={true}
                  >
                    <Invite/>
                  </SignInLayout>
                </RequireAdminRole>
              </RequirePasswordValid>
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth requireLoggedIn={true}>
              <RequirePasswordValid>
                <RequireAdminRole>
                  <MainLayout>
                    <Dashboard/>
                  </MainLayout>
                </RequireAdminRole>
              </RequirePasswordValid>
            </RequireAuth>
          }
        />

        <Route
          path="/phone-verification/:mode"
          element={
            <SignInLayout>
              <PhoneVerification/>
            </SignInLayout>
          }
        />

        <Route
          path="/phone-register"
          element={
            <SignInLayout>
              <PhoneRegister/>
            </SignInLayout>
          }
        />

        <Route
          path="/dashboard/multi"
          element={
            <RequireAuth requireLoggedIn={true}>
              <RequirePasswordValid>
                <RequireAdminRole>
                  <MainLayoutV2>
                    <DashboardV2Wrapper/>
                  </MainLayoutV2>
                </RequireAdminRole>
              </RequirePasswordValid>
            </RequireAuth>
          }
        />

        <Route
          path="/mobile-login"
          element={
            <SignInLayout>
              <MobileLogin/>
            </SignInLayout>
          }
        />

        <Route
          path="/mobile-phone-register"
          element={
            <SignInLayout>
              <MobilePhoneRegister/>
            </SignInLayout>
          }
        />

        <Route
          path="/mobile-phone-verification/:mode"
          element={
            <SignInLayout>
              <MobilePhoneVerification/>
            </SignInLayout>
          }
        />

        <Route
          path="/create-account/*"
          element={
            <SignInLayout>
              <CreateAccount/>
            </SignInLayout>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <SignInLayout>
              <ForgotPassword/>
            </SignInLayout>
          }
        />

        <Route
          path="/forgot-username"
          element={
            <SignInLayout>
              <ForgotUsername/>
            </SignInLayout>
          }
        />

        <Route
          path="/reset-password"
          element={
            <SignInLayout>
              <ResetPassword/>
            </SignInLayout>
          }
        />

        <Route
          path="/login"
          element=
            {
              <SignInLayout>
                <SULogin/>
              </SignInLayout>
            }
        />

        <Route
          path="*"
          element={<Navigate to="/select-mode" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

const mapStateToProps = (state) => ({
  token: get(state, 'auth.token'),
  loggedIn: get(state, 'auth.loggedIn'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getMyProfile: getMyProfileAction,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Router);
