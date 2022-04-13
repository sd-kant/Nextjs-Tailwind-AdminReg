import React from "react";
import {connect} from "react-redux";
import {Navigate, Route, Routes, useNavigate} from "react-router-dom";
import logo from "../../assets/images/logo_light.svg";
import FormCompany from "../partials/su-dashboard/FormCompany";
import FormRepresentative from "../partials/su-dashboard/FormRepresentative";
import FormTeam from "../partials/su-dashboard/FormTeamCreate";
import FormUploadSelect from "../partials/su-dashboard/FormUploadSelect";
import {USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN} from "../../constant";
import FormInvite from "../partials/su-dashboard/FormInvite";
import FormTeamMode from "../partials/su-dashboard/FormTeamMode";
import FormUpload from "../partials/su-dashboard/FormUpload";
import FormTeamModify from "../partials/su-dashboard/FormTeamModify";
import FormInviteModify from "../partials/su-dashboard/FormInviteModify";
import {WrappedMembersProvider} from "../../providers/MembersProvider";
import {WrappedOrganizationProvider} from "../../providers/OrganizationProvider";
import {get} from "lodash";
import ParamsWrapper from "../partials/su-dashboard/ParamsWrapper";
import FormSearch from "../partials/su-dashboard/FormSearch";

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
    </div>
  )
}

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
});

export default connect(mapStateToProps, null)(Invite);
