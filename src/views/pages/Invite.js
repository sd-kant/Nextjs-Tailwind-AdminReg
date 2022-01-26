import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import logo from "../../assets/images/logo_light.svg";
import FormCompany from "../partials/su-dashboard/FormCompany";
import FormRepresentative from "../partials/su-dashboard/FormRepresentative";
import FormTeam from "../partials/su-dashboard/FormTeamCreate";
import FormUploadSelect from "../partials/su-dashboard/FormUploadSelect";
import {USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN} from "../../constant";
import FormInvite from "../partials/su-dashboard/FormInvite";
import FormTeamMode from "../partials/su-dashboard/FormTeamMode";
import FormUpload from "../partials/su-dashboard/FormUpload";
import FormReInvite from "../partials/su-dashboard/FormReInvite";
import FormTeamModify from "../partials/su-dashboard/FormTeamModify";
import FormInviteModify from "../partials/su-dashboard/FormInviteModify";
import FormSearch from "../partials/su-dashboard/FormSearch";
import {WrappedMembersProvider} from "../../providers/MembersProvider";

const Invite = (
  {
    userType,
  }) => {
  const isSuperAdmin = userType?.includes(USER_TYPE_ADMIN);
  const isOrgAdmin = userType?.includes(USER_TYPE_ORG_ADMIN);
  // fixme orgAdmin will be redirected to organization modify page
  let redirectPath = (isSuperAdmin || isOrgAdmin) ? "/invite/company" : "/invite/-1/team-mode";

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
      </div>

      <Switch>
        {
          (isSuperAdmin || isOrgAdmin) &&
          <Route
            exact
            path='/invite/company'
          >
            <FormCompany
              isSuperAdmin={isSuperAdmin}
              isOrgAdmin={isOrgAdmin}
            />
          </Route>
        }
        {
          isSuperAdmin &&
          <Route
            exact
            path='/invite/:organizationId/representative'
            render={matchProps => (
              <FormRepresentative
                {...matchProps}
              />
            )}
          />
        }
        <Route
          exact
          path='/invite/:organizationId/team-create'
          render={matchProps => (
            <FormTeam
              {...matchProps}
            />
          )}
        />

        <Route
          exact
          path='/invite/:organizationId/team-modify'
          render={matchProps => (
            <FormTeamModify
              {...matchProps}
            />
          )}
        />

        <Route
          exact
          path='/invite/:organizationId/select/:id'
          render={matchProps => (
            <FormUploadSelect
              {...matchProps}
            />
          )}
        />

        <Route
          exact
          path='/invite/:organizationId/upload/:id'
          render={matchProps => (
            <FormUpload
              {...matchProps}
            />
          )}
        />

        <Route
          exact
          path='/invite/:organizationId/team-mode'
          render={matchProps => (
            <FormTeamMode
              {...matchProps}
            />
          )}
        />

        <Route
          exact
          path='/invite/:organizationId/edit/upload/:id'
          render={matchProps => (
            <FormInvite
              {...matchProps}
            />
          )}
        />

        <Route
          exact
          path='/invite/:organizationId/edit/manual/:id'
          render={matchProps => (
            <FormInvite
              {...matchProps}
            />
          )}
        />

        <Route
          exact
          path='/invite/:organizationId/edit/modify/:id'
          render={matchProps => (
            <WrappedMembersProvider
              organizationId={matchProps.match.params.organizationId}
            >
              <FormInviteModify
                {...matchProps}
              />
            </WrappedMembersProvider>
          )}
        />

        <Route
          exact
          path='/invite/:organizationId/search'
          render={matchProps => (
            <WrappedMembersProvider
              organizationId={matchProps.match.params.organizationId}
            >
              <FormSearch
                {...matchProps}
              />
            </WrappedMembersProvider>
          )}
        />

        <Route
          exact
          path='/invite/re-invite'
        >
          <FormReInvite/>
        </Route>

        <Redirect to={redirectPath}/>
      </Switch>
    </div>
  )
}

export default Invite;