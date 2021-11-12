import React from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import logo from "../../assets/images/logo_light.svg";
import FormCompany from "../partials/su-dashboard/FormCompany";
import FormRepresentative from "../partials/su-dashboard/FormRepresentative";
import FormTeam from "../partials/su-dashboard/FormTeamCreate";
import FormUploadSelect from "../partials/su-dashboard/FormUploadSelect";
import {SUPER_ADMIN_EMAIL, USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN} from "../../constant";
import FormInvite from "../partials/su-dashboard/FormInvite";
import FormTeamMode from "../partials/su-dashboard/FormTeamMode";
import FormUpload from "../partials/su-dashboard/FormUpload";
import FormReInvite from "../partials/su-dashboard/FormReInvite";
import FormTeamModify from "../partials/su-dashboard/FormTeamModify";
import FormInviteModify from "../partials/su-dashboard/FormInviteModify";

export const checkIfSuperAdmin = (email) => {
  return ((email && email.toLowerCase()) === SUPER_ADMIN_EMAIL.toLowerCase());
}

const Invite = (
  {
    email,
    userType,
  }) => {
  const isSuperAdmin = userType?.includes(USER_TYPE_ADMIN);
  const isOrgAdmin = userType?.includes(USER_TYPE_ORG_ADMIN);
  let redirectPath = isSuperAdmin ? "/invite/company" : (isOrgAdmin ? "/invite/team-mode" : "/invite/team-modify");

  return (
    <div className='form-main'>
      <div className='form-header'>
        <img className='form-header-logo' src={logo} alt='kenzen logo'/>
      </div>

      <Switch>
        {
          isSuperAdmin &&
          <Route
            exact
            path='/invite/company'
          >
            <FormCompany/>
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
            <FormTeam
              email={email}
            />
          </Route>
        }

        <Route
          exact
          path='/invite/team-modify'
        >
          <FormTeamModify/>
        </Route>

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
              email={email}
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