import React, {lazy, Suspense} from "react";
import {connect} from "react-redux";
import {
  Navigate,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import logo from "../../assets/images/logo_light.svg";
import {
  USER_TYPE_ADMIN,
  USER_TYPE_ORG_ADMIN
} from "../../constant";
import {get} from "lodash";
import Loader from "../components/Loader";

const FormCompany = lazy(() => import("../partials/su-dashboard/FormCompany"));
const FormRepresentative = lazy(() => import("../partials/su-dashboard/FormRepresentative"));
const FormTeam = lazy(() => import("../partials/su-dashboard/FormTeamCreate"));
const FormUploadSelect = lazy(() => import("../partials/su-dashboard/FormUploadSelect"));
const FormInvite = lazy(() => import("../partials/su-dashboard/FormInvite"));
const FormTeamMode = lazy(() => import("../partials/su-dashboard/FormTeamMode"));
const FormUpload = lazy(() => import("../partials/su-dashboard/FormUpload"));
const FormTeamModify = lazy(() => import("../partials/su-dashboard/FormTeamModify"));
const FormInviteModify = lazy(() => import("../partials/su-dashboard/FormInviteModify"));
const WrappedMembersProvider = lazy(() => import("../../providers/MembersProvider").then(module => ({default: module.WrappedMembersProvider})));
const WrappedOrganizationProvider = lazy(() => import("../../providers/OrganizationProvider").then(module => ({default: module.WrappedOrganizationProvider})));
const ParamsWrapper = lazy(() => import("../partials/su-dashboard/ParamsWrapper"));
const FormSearch = lazy(() => import("../partials/su-dashboard/FormSearch"));

const Invite = (
  {
    userType,
  }) => {
  const isSuperAdmin = userType?.includes(USER_TYPE_ADMIN);
  const isOrgAdmin = userType?.includes(USER_TYPE_ORG_ADMIN);
  // fixme orgAdmin will be redirected to organization modify page
  let redirectPath = (isSuperAdmin || isOrgAdmin) ? "/invite/company" : "/invite/-1/team-mode";
  const navigate = useNavigate();

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
      </div>

      <Suspense fallback={<Loader/>}>
        <Routes>
          {
            (isSuperAdmin || isOrgAdmin) &&
            <Route
              path='/company'
              element={
                <FormCompany
                  isSuperAdmin={isSuperAdmin}
                  isOrgAdmin={isOrgAdmin}
                  navigate={navigate}
                />
              }
            />
          }
          {
            (isSuperAdmin || isOrgAdmin) &&
            <Route
              path='/:organizationId/representative'
              element={
                <WrappedOrganizationProvider>
                  <ParamsWrapper>
                    <FormRepresentative
                      navigate={navigate}
                    />
                  </ParamsWrapper>
                </WrappedOrganizationProvider>
              }
            />
          }
          <Route
            path='/:organizationId/team-create'
            element={
              <ParamsWrapper>
                <FormTeam
                  navigate={navigate}
                />
              </ParamsWrapper>
            }
          />

          <Route
            path='/:organizationId/team-modify'
            element={
              <WrappedOrganizationProvider>
                <ParamsWrapper>
                  <FormTeamModify
                    navigate={navigate}
                  />
                </ParamsWrapper>
              </WrappedOrganizationProvider>
            }
          />

          <Route
            path='/:organizationId/select/:id'
            element={
              <ParamsWrapper>
                <FormUploadSelect/>
              </ParamsWrapper>
            }
          />

          <Route
            path='/:organizationId/upload/:id'
            element={
              <ParamsWrapper>
                <FormUpload/>
              </ParamsWrapper>
            }
          />

          <Route
            path='/:organizationId/team-mode'
            element={
              <ParamsWrapper>
                <FormTeamMode/>
              </ParamsWrapper>
            }
          />

          <Route
            path='/:organizationId/edit/upload/:id'
            element={
              <ParamsWrapper>
                <FormInvite
                  navigate={navigate}
                />
              </ParamsWrapper>
            }
          />

          <Route
            path='/:organizationId/edit/manual/:id'
            element={
              <ParamsWrapper>
                <FormInvite
                  navigate={navigate}
                />
              </ParamsWrapper>
            }
          />

          <Route
            path='/:organizationId/edit/modify/:id'
            element={
              <WrappedMembersProvider
              >
                <ParamsWrapper>
                  <FormInviteModify/>
                </ParamsWrapper>
              </WrappedMembersProvider>
            }
          />

          <Route
            path='/:organizationId/search'
            element={
              <WrappedMembersProvider>
                <ParamsWrapper>
                  <FormSearch/>
                </ParamsWrapper>
              </WrappedMembersProvider>
            }
          />

          <Route
            path='/*'
            element={<Navigate to={redirectPath} replace/>}
          />
        </Routes>

      </Suspense>
    </div>
  )
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
});

export default connect(mapStateToProps, null)(Invite);
