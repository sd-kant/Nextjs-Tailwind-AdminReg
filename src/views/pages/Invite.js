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
import FormCompanyModify from "../partials/su-dashboard/FormCompanyModify";

const Invite = (
  {
    userType,
  }) => {
  const isSuperAdmin = userType?.includes(USER_TYPE_ADMIN);
  const isOrgAdmin = userType?.includes(USER_TYPE_ORG_ADMIN);
  // fixme orgAdmin will be redirected to organization modify page
  let redirectPath = (isSuperAdmin || isOrgAdmin) ? "/invite/company" : "/invite/team-modify";

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
            path='/invite/representative'
          >
            <FormRepresentative/>
          </Route>
        }
        {
          (isSuperAdmin || isOrgAdmin) &&
          <Route
            exact
            path='/invite/team-create'
          >
            <FormTeam/>
          </Route>
        }
        {
          (isSuperAdmin || isOrgAdmin) &&
          <Route
            exact
            path='/invite/company/:id'
            render={matchProps => (
              <FormCompanyModify
                {...matchProps}
              />
            )}
          />
        }

        <Route
          exact
          path='/invite/team-modify'
          render={matchProps => (
            <FormTeamModify
              {...matchProps}
            />
          )}
        />

        <Route
          exact
          path='/invite/select'
        >
          <FormUploadSelect/>
        </Route>

        <Route
          exact
          path='/invite/upload'
        >
          <FormUpload/>
        </Route>

        {
          (isSuperAdmin || isOrgAdmin) &&
          <Route
            exact
            path='/invite/team-mode'
          >
            <FormTeamMode/>
          </Route>
        }

        <Route
          exact
          path='/invite/edit/upload'
        >
          <FormInvite/>
        </Route>

        <Route
          exact
          path='/invite/edit/manual'
        >
          <FormInvite/>
        </Route>

        <Route
          exact
          path='/invite/edit/modify/:id'
          render={matchProps => (
            <FormInviteModify
              {...matchProps}
            />
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