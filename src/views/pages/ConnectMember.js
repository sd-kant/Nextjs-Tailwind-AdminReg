import React, { lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import logo from 'assets/images/logo_light.svg';
import { USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN } from 'constant';
import { get } from 'lodash';
import Loader from 'views/components/Loader';
import FormConnectMemberUpload from 'views/partials/su-dashboard/connect-device/FormConnectMemberDevice/FormConnectMemberUpload';

const WrappedMembersProvider = lazy(() =>
  import('../../providers/MembersProvider').then((module) => ({
    default: module.WrappedMembersProvider
  }))
);
const ParamsWrapper = lazy(() => import('../partials/su-dashboard/ParamsWrapper'));
const FormConnectMemberMethod = lazy(() =>
  import(
    'views/partials/su-dashboard/connect-device/FormConnectMemberDevice/FormConnectMemberMethod'
  )
);
const FormConnectMemberSearch = lazy(() =>
  import('../partials/su-dashboard/connect-device/FormConnectMemberDevice/FormConnectMemberSearch')
);
const FormConnectMemberDevice = lazy(() =>
  import('../partials/su-dashboard/connect-device/FormConnectMemberDevice/FormConnectMemberDevice')
);
const FormConnectDeviceSuccess = lazy(() =>
  import('../partials/su-dashboard/connect-device/FormConnectDevice/FormConnectDeviceSuccess')
);
const FormCompanySelect = lazy(() =>
  import('../partials/su-dashboard/connect-device/FormConnectMemberDevice/FormCompanySelect')
);

const ConnectMember = ({ userType }) => {
  const isSuperAdmin = userType?.includes(USER_TYPE_ADMIN);
  const isOrgAdmin = userType?.includes(USER_TYPE_ORG_ADMIN);
  let redirectPath =
    isSuperAdmin || isOrgAdmin ? '/connect/member/company' : '/connect/member/-1/search';
  const navigate = useNavigate();
  const params = useParams();

  return (
    <div className="form-main">
      <div className="form-header">
        <img className="form-header-logo" src={logo} alt="kenzen logo" />
      </div>

      <Suspense fallback={<Loader />}>
        <Routes>
          {(isSuperAdmin || isOrgAdmin) && (
            <Route
              path="/company"
              element={
                <FormCompanySelect
                  isSuperAdmin={isSuperAdmin}
                  isOrgAdmin={isOrgAdmin}
                  navigate={navigate}
                />
              }
            />
          )}

          <Route path="/:organizationId/method" element={<FormConnectMemberMethod />} />

          <Route path="/:organizationId/upload" element={<FormConnectMemberUpload />} />

          <Route
            path="/:organizationId/search"
            element={
              <WrappedMembersProvider>
                <ParamsWrapper>
                  <FormConnectMemberSearch />
                </ParamsWrapper>
              </WrappedMembersProvider>
            }
          />

          <Route
            path="/:organizationId/device/:teamId/:userId"
            element={
              <WrappedMembersProvider>
                <ParamsWrapper>
                  <FormConnectMemberDevice navigate={navigate} {...params} />
                </ParamsWrapper>
              </WrappedMembersProvider>
            }
          />

          <Route
            path="/device/success"
            element={
              <WrappedMembersProvider>
                <ParamsWrapper>
                  <FormConnectDeviceSuccess navigate={navigate} individual={false} />
                </ParamsWrapper>
              </WrappedMembersProvider>
            }
          />

          <Route path="/*" element={<Navigate to={redirectPath} replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType')
});

export default connect(mapStateToProps, null)(ConnectMember);
