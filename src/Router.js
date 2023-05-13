import React, { Suspense, lazy } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { get } from 'lodash';
import { getMyOrganizationAction, getMyProfileAction } from './redux/action/profile';

const Dashboard = lazy(() => import('./views/pages/Dashboard'));
const SULogin = lazy(() => import('./views/pages/SULogin'));
const ForgotPassword = lazy(() => import('./views/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./views/pages/ResetPassword'));
const PhoneVerification = lazy(() => import('./views/pages/PhoneVerification'));
const PhoneRegister = lazy(() => import('./views/pages/PhoneRegister'));
const MobileLogin = lazy(() => import('./views/pages/MobileLogin'));
const MobilePhoneRegister = lazy(() => import('./views/pages/MobilePhoneRegister'));
const MobilePhoneVerification = lazy(() => import('./views/pages/MobilePhoneVerification'));
const SelectMode = lazy(() => import('./views/pages/SelectMode'));
const ConnectDevice = lazy(() => import('./views/pages/ConnectDevice'));
const ConnectDeviceSuccess = lazy(() => import('./views/pages/ConnectDeviceSuccess'));
const ForgotUsername = lazy(() => import('./views/pages/ForgotUsername'));
const PasswordExpired = lazy(() => import('./views/pages/PasswordExpired'));
const Profile = lazy(() => import('./views/pages/Profile'));
const SignInLayout = lazy(() => import('./views/layouts/SignInLayout'));
const MainLayout = lazy(() => import('./views/layouts/MainLayout'));
const MainLayoutV2 = lazy(() => import('./views/layouts/MainLayoutV2'));
const RequireAuth = lazy(() => import('./views/wrappers/RequireAuth'));
const RequireAdminRole = lazy(() => import('./views/wrappers/RequireAdminRole'));
const RequirePasswordValid = lazy(() => import('./views/wrappers/RequirePasswordValid'));
const DashboardV2Wrapper = lazy(() => import('./views/pages/DashboardV2Wrapper'));
const Invite = lazy(() => import('./views/pages/Invite'));
const ConnectMember = lazy(() => import('./views/pages/ConnectMember'));
const CreateAccount = lazy(() => import('./views/pages/CreateAccount'));
const LoginEntry = lazy(() => import('./views/pages/LoginEntry'));
const Analytics = lazy(() => import('./views/pages/Analytics'));
import Loader from './views/components/Loader';
import News from './views/pages/News/News';
import NewsDetail from './views/pages/News/NewsDetail';
import AuthorDetail from './views/pages/News/AuthorDetail';

const Router = ({ token, loggedIn, getMyProfile, getMyOrganization }) => {
  React.useEffect(() => {
    if (token && loggedIn) {
      getMyProfile();
      getMyOrganization();
    }
  }, [token, loggedIn, getMyProfile, getMyOrganization]);

  return (
    <BrowserRouter basename="/">
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route
            path="/password-expired"
            element={
              <RequireAuth>
                <SignInLayout>
                  <PasswordExpired />
                </SignInLayout>
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth requireLoggedIn={true}>
                <RequirePasswordValid>
                  <SignInLayout loggedIn={true}>
                    <Profile />
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
                  <SignInLayout isEntry={true} loggedIn={true}>
                    <SelectMode />
                  </SignInLayout>
                </RequirePasswordValid>
              </RequireAuth>
            }
          />

          <Route
            path="/connect/device"
            element={
              <RequireAuth requireLoggedIn={true}>
                <RequirePasswordValid>
                  <SignInLayout loggedIn={true}>
                    <ConnectDevice />
                  </SignInLayout>
                </RequirePasswordValid>
              </RequireAuth>
            }
          />

          <Route
            path="/connect/device/success"
            element={
              <RequireAuth requireLoggedIn={true}>
                <RequirePasswordValid>
                  <SignInLayout loggedIn={true}>
                    <ConnectDeviceSuccess />
                  </SignInLayout>
                </RequirePasswordValid>
              </RequireAuth>
            }
          />

          <Route
            path="/connect/member/*"
            element={
              <RequireAuth requireLoggedIn={true}>
                <RequirePasswordValid>
                  <RequireAdminRole>
                    <SignInLayout loggedIn={true}>
                      <ConnectMember />
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
                    <SignInLayout loggedIn={true}>
                      <Invite />
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
                      <Dashboard />
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
                <PhoneVerification />
              </SignInLayout>
            }
          />

          <Route
            path="/phone-register"
            element={
              <SignInLayout>
                <PhoneRegister />
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
                      <DashboardV2Wrapper />
                    </MainLayoutV2>
                  </RequireAdminRole>
                </RequirePasswordValid>
              </RequireAuth>
            }
          />

          <Route
            path="/analytics"
            element={
              <RequireAuth requireLoggedIn={true}>
                <RequirePasswordValid>
                  <RequireAdminRole>
                    <MainLayoutV2>
                      <Analytics />
                    </MainLayoutV2>
                  </RequireAdminRole>
                </RequirePasswordValid>
              </RequireAuth>
            }
          />

          <Route
            path="/news"
            element={
              <RequireAuth requireLoggedIn={true}>
                <RequirePasswordValid>
                  <MainLayoutV2>
                    <News />
                  </MainLayoutV2>
                </RequirePasswordValid>
              </RequireAuth>
            }
          />

          <Route
            path="/news/detail"
            element={
              <RequireAuth requireLoggedIn={true}>
                <RequirePasswordValid>
                  <MainLayoutV2>
                    <NewsDetail />
                  </MainLayoutV2>
                </RequirePasswordValid>
              </RequireAuth>
            }
          />

          <Route
            path="/news/author"
            element={
              <RequireAuth requireLoggedIn={true}>
                <RequirePasswordValid>
                  <MainLayoutV2>
                    <AuthorDetail />
                  </MainLayoutV2>
                </RequirePasswordValid>
              </RequireAuth>
            }
          />

          <Route
            path="/mobile-login"
            element={
              <SignInLayout>
                <LoginEntry mobile={true} />
              </SignInLayout>
            }
          />

          <Route
            path="/mobile-auth"
            element={
              <SignInLayout>
                <MobileLogin />
              </SignInLayout>
            }
          />

          <Route
            path="/mobile-phone-register"
            element={
              <SignInLayout>
                <MobilePhoneRegister />
              </SignInLayout>
            }
          />

          <Route
            path="/mobile-phone-verification/:mode"
            element={
              <SignInLayout>
                <MobilePhoneVerification />
              </SignInLayout>
            }
          />

          <Route
            path="/create-account/*"
            element={
              <SignInLayout>
                <CreateAccount />
              </SignInLayout>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <SignInLayout>
                <ForgotPassword />
              </SignInLayout>
            }
          />

          <Route
            path="/forgot-username"
            element={
              <SignInLayout>
                <ForgotUsername />
              </SignInLayout>
            }
          />

          <Route
            path="/reset-password"
            element={
              <SignInLayout>
                <ResetPassword />
              </SignInLayout>
            }
          />

          <Route
            path="/login"
            element={
              <SignInLayout>
                <LoginEntry />
              </SignInLayout>
            }
          />

          <Route
            path="/sso"
            element={
              <SignInLayout>
                <LoginEntry />
              </SignInLayout>
            }
          />

          <Route
            path="/auth"
            element={
              <SignInLayout>
                <SULogin />
              </SignInLayout>
            }
          />

          <Route path="*" element={<Navigate to="/select-mode" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const mapStateToProps = (state) => ({
  token: get(state, 'auth.token'),
  loggedIn: get(state, 'auth.loggedIn')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getMyProfile: getMyProfileAction,
      getMyOrganization: getMyOrganizationAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Router);
