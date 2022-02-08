import * as React from 'react';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {get} from "lodash";
import {withTranslation} from "react-i18next";
import {setLoadingAction, showErrorNotificationAction} from "../redux/action/ui";
import {getUsersUnderOrganization} from "../http";

const OrganizationContext = React.createContext(null);

const OrganizationProvider = (
  {
    t,
    children,
    organizationId,
    showErrorNotification,
    setLoading,
  }) => {
  const [orgAdmins, setOrgAdmins] = React.useState([]);
  React.useEffect(() => {
    if (organizationId) {
      fetchOrgAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const fetchOrgAdmins = () => {
    setLoading(true);
    getUsersUnderOrganization({
      organizationId,
      userType: 'OrgAdmin',
    })
      .then(res => {
        setOrgAdmins(res.data ?? []);
      })
      .catch(e => {
        showErrorNotification(e.response?.data?.message || t("msg something went wrong"));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const providerValue = {
    orgAdmins,
  };

  return (
    <OrganizationContext.Provider value={providerValue}>
      {children}
    </OrganizationContext.Provider>
  );
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
    },
    dispatch
  );

export const WrappedOrganizationProvider = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(OrganizationProvider));

export const useOrganizationContext = () => {
  const context = React.useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganizationContext must be used within OrganizationProvider");
  }
  return context;
};