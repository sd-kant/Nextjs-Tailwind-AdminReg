import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import style from './MemberTable.module.scss';
import { useDashboardContext } from '../../../providers/DashboardProvider';
import TableRow from './TableRow';
import TableHeader from './TableHeader';
import MemberDetailModal from '../../modals/MemberDetailModal';
import { UserSubscriptionProvider } from '../../../providers/UserSubscriptionProvider';
import { get } from 'lodash';

const MemberTable = ({ t, forceWidthUpdate, isLoading }) => {
  const {
    paginatedMembers: members,
    member,
    visibleMemberModal,
    setVisibleMemberModal
  } = useDashboardContext();

  const storedVisibleColumns = localStorage.getItem('visibleColumns');
  const parsedVisibleColumns = storedVisibleColumns ? JSON.parse(storedVisibleColumns) : null;
  const validVisibleColumns = parsedVisibleColumns ?? [
    'name',
    'connection',
    'heatRisk',
    'alerts',
    'lastDataSync'
  ];
  const [visibleColumns, setVisibleColumns] = React.useState(validVisibleColumns);
  React.useEffect(() => {
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  const columnsMap = {
    connection: t('connection'),
    heatRisk: t('heat risk'),
    alerts: t('alerts'),
    lastDataSync: t('last data sync'),
    heatSusceptibility: t('heat susceptibility')
  };

  React.useEffect(() => {
    forceWidthUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(members.length)]);

  return (
    <>
      {members?.length > 0 && !isLoading ? (
        <table className={clsx(style.Table)}>
          <TableHeader
            columnsMap={columnsMap}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            forceWidthUpdate={forceWidthUpdate}
          />

          <tbody>
            {members?.map((member, key) => (
              <TableRow
                member={member}
                key={`member-${key}-${member.userId}`}
                visibleColumns={visibleColumns}
                columnsMap={columnsMap}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className={clsx(style.NoMatches, 'font-heading-small text-capitalize mt-25')}>
          {isLoading ? <span>{t('loading')}</span> : <span>{t('no matches found')}</span>}
        </div>
      )}

      {visibleMemberModal && (
        <UserSubscriptionProvider>
          <MemberDetailModal
            data={member}
            open={visibleMemberModal}
            closeModal={() => setVisibleMemberModal(false)}
          />
        </UserSubscriptionProvider>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  isLoading: get(state, 'ui.loading')
});

export default connect(mapStateToProps, null)(withTranslation()(React.memo(MemberTable)));
