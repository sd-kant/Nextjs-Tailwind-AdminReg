import * as React from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
  getTeamAlerts,
  getTeamDevices,
  getTeamStats, inviteTeamMemberV2,
  queryAllOrganizations,
  queryTeamMembers,
  queryTeams,
  subscribeDataEvents, unlockUser
} from "../http";
import axios from "axios";
import {
  getLatestDateBeforeNow as getLatestDate,
  getParamFromUrl,
  numMinutesBetweenWithNow as numMinutesBetween,
  updateUrlParam,
} from "../utils";
import {withTranslation} from "react-i18next";
import {get} from "lodash";
import {
  ALERT_STAGE_ID_LIST,
  USER_TYPE_ADMIN,
  USER_TYPE_OPERATOR,
  USER_TYPE_ORG_ADMIN,
  USER_TYPE_TEAM_ADMIN
} from "../constant";
import useForceUpdate from "../hooks/useForceUpdate";
import {useNotificationContext} from "./NotificationProvider";
import {formatLastSync, sortMembers} from "../utils/dashboard";
import {setLoadingAction} from "../redux/action/ui";
import {useUtilsContext} from "./UtilsProvider";

const BasicContext = React.createContext(null);

const BasicProviderDraft = (
  {
    children,
    setLoading,
    userType,
    t,
  }) => {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [organizations, setOrganizations] = React.useState([]);
  const [organization, setOrganization] = React.useState(null);
  const [teams, setTeams] = React.useState([]);
  const [pickedTeams, setPickedTeams] = React.useState([]);

  React.useEffect(() => {
    queryTeams()
      .then(res => {
        const allTeams = res.data;
        allTeams.sort((a, b) => {
          return a.name?.toLowerCase() > b.name?.toLowerCase() ? 1 : -1;
        });
        setTeams(allTeams);
      })
      .catch(e => {
        console.error("getting teams error", e);
        // todo show error
      });
  }, []);

  React.useEffect(() => {
    setIsAdmin(userType?.some(it => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it)));
  }, [userType]);

  React.useEffect(() => {
    if (isAdmin) {
      queryAllOrganizations()
        .then(res => {
          const allOrganizations = res.data;
          allOrganizations.sort((a, b) => {
            return a.name?.toLowerCase() > b.name?.toLowerCase() ? 1 : -1;
          });
          setOrganizations(allOrganizations);
        })
        .catch(e => {
          console.error("getting companies error", e);
          // todo show error
        });
    }
  }, [isAdmin]);

  const hideCbtHR = React.useMemo(() => {
    const item = organizations?.find(it => it.id?.toString() === organization?.toString());
    return item?.settings?.hideCbtHR;
  }, [organization, organizations]);

  const formattedTeams = React.useMemo(() => {
    const ret = [];
    teams?.forEach(team => {
      if (isAdmin) {
        if (organization) {
          if (team?.orgId?.toString() === organization?.toString()) {
            ret.push({
              value: team.id,
              label: team.name,
            });
          }
        }
      } else {
        ret.push({
          value: team.id,
          label: team.name,
        });
      }
    });

    return ret;
  }, [organization, teams, isAdmin]);

  const formattedOrganizations = React.useMemo(() => {
    return organizations?.map(organization => (
      {
        value: organization.id,
        label: organization.name,
        country: organization.country,
      }
    ));
  }, [organizations]);

  const providerValue = {
    pickedTeams,
    setPickedTeams,
    organization,
    setOrganization,
    formattedTeams,
    formattedOrganizations,
    isAdmin,
    hideCbtHR,
  };

  return (
    <BasicContext.Provider value={providerValue}>
      {children}
    </BasicContext.Provider>
  );
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
    },
    dispatch
  );

export const BasicProvider = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(BasicProviderDraft));

export const useBasicContext = () => {
  const context = React.useContext(BasicContext);
  if (!context) {
    throw new Error("useBasicContext must be used within BasicProvider");
  }
  return context;
};
