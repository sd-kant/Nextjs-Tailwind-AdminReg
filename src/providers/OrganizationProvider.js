import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { withTranslation } from 'react-i18next';
import { setLoadingAction, showErrorNotificationAction } from '../redux/action/ui';
import { getCompanyById, getUsersUnderOrganization } from '../http';
import countryRegions from 'country-region-data/data.json';
import { useParams } from 'react-router-dom';
import { INVALID_VALUES1 } from '../constant';

const OrganizationContext = React.createContext(null);

const OrganizationProvider = ({
  children,
  isAdmin,
  showErrorNotification,
  setLoading,
  profile
}) => {
  const [orgAdmins, setOrgAdmins] = React.useState([]);
  const [organization, setOrganization] = React.useState(null);
  const { organizationId } = useParams();
  React.useEffect(() => {
    if (!INVALID_VALUES1.includes(organizationId?.toString())) {
      fetchCompany(organizationId);
      if (isAdmin) {
        fetchOrgAdmins(organizationId);
      }
    } else if (!INVALID_VALUES1.includes(profile?.orgId?.toString())) {
      fetchCompany(profile?.orgId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, isAdmin, profile?.orgId]);

  const fetchCompany = (orgId) => {
    getCompanyById(orgId).then((response) => {
      setOrganization(response.data);
    });
  };

  const fetchOrgAdmins = (orgId) => {
    setLoading(true);
    if (isAdmin) {
      getUsersUnderOrganization({
        organizationId: orgId,
        userType: 'OrgAdmin'
      })
        .then((res) => {
          setOrgAdmins(res.data ?? []);
        })
        .catch((e) => {
          showErrorNotification(e.response?.data?.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const regions = React.useMemo(() => {
    let ret = [];
    if (organization) {
      const regionsForOrganization = countryRegions.find(
        (it) => it.countryName === organization.country
      )?.regions;
      if (isAdmin) {
        ret = regionsForOrganization;
      } else {
        ret = regionsForOrganization?.filter((it) =>
          organization.regions.some((ele) => ele === it.name)
        );
      }
    }
    return ret?.map((it) => ({
      label: it.name,
      value: it.shortCode
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, isAdmin]);

  const locations = React.useMemo(() => {
    return (
      organization?.locations?.map((it, index) => ({
        label: it,
        value: `${index}-${it}`
      })) ?? []
    );
  }, [organization]);

  const providerValue = {
    orgAdmins,
    organization,
    regions,
    locations
  };

  return (
    <OrganizationContext.Provider value={providerValue}>{children}</OrganizationContext.Provider>
  );
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
  isAdmin: get(state, 'auth.isAdmin'),
  profile: get(state, 'profile.profile')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction
    },
    dispatch
  );

export const WrappedOrganizationProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(OrganizationProvider));

export const useOrganizationContext = () => {
  const context = React.useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within OrganizationProvider');
  }
  return context;
};
