import React, {lazy, Suspense} from "react";
import {connect} from "react-redux";
import {
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
const WrappedMembersProvider = lazy(() => import("../../providers/MembersProvider").then(module => ({default: module.WrappedMembersProvider})));
const ParamsWrapper = lazy(() => import("../partials/su-dashboard/ParamsWrapper"));
const FormConnectMemberSearch = lazy(() => import("../partials/su-dashboard/FormConnectMemberSearch"));
const FormCompanySelect = lazy(() => import("../partials/su-dashboard/FormCompanySelect"));

const Invite = (
  {
    userType,
  }) => {
  const isSuperAdmin = userType?.includes(USER_TYPE_ADMIN);
  const isOrgAdmin = userType?.includes(USER_TYPE_ORG_ADMIN);
  // fixme orgAdmin will be redirected to organization modify page
  // let redirectPath = (isSuperAdmin || isOrgAdmin) ? "/connect/member/company" : "/invite/-1/team-mode";
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
                <FormCompanySelect
                  isSuperAdmin={isSuperAdmin}
                  isOrgAdmin={isOrgAdmin}
                  navigate={navigate}
                />
              }
            />
          }

          <Route
            path='/:organizationId/search'
            element={
              <WrappedMembersProvider>
                <ParamsWrapper>
                  <FormConnectMemberSearch/>
                </ParamsWrapper>
              </WrappedMembersProvider>
            }
          />

          {/*<Route
            path='/*'
            element={<Navigate to={redirectPath} replace/>}
          />*/}
        </Routes>

      </Suspense>
    </div>
  )
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
});

export default connect(mapStateToProps, null)(Invite);
