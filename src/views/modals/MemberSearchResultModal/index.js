import React from 'react';
import Modal from 'react-modal';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import removeIcon from 'assets/images/remove.svg';
import { useDashboardContext } from 'providers/DashboardProvider';
import { searchMembers } from 'http';
import { useNotificationContext } from 'providers/NotificationProvider';

const MemberSearchResultModal = ({ t, isOpen = false, onClose }) => {
  const {
    keyword,
    organization,
    organizations,
    teams,
    setOrganization,
    setPickedTeams,
    pickedTeams
  } = useDashboardContext();
  const { addNotification } = useNotificationContext();
  const [searchResult, setSearchResult] = React.useState([]);
  const [isApiLoading, setIsApiLoading] = React.useState([]);
  const formattedSearchResult = React.useMemo(() => {
    return searchResult
      .filter((it) =>
        it.orgId == organization ? !pickedTeams?.includes(it.teamId.toString()) : true
      )
      .map((item) => {
        return {
          userId: item.userId,
          userName: `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim(),
          orgName: organizations?.find((it) => it.id == item.orgId)?.name,
          teamName: teams?.find((it) => it.id == item.teamId)?.name,
          orgId: item.orgId,
          teamId: item.teamId
        };
      });
  }, [searchResult, organizations, teams, pickedTeams, organization]);

  React.useEffect(() => {
    const handleGlobalSearch = () => {
      if (keyword) {
        searchMembers(keyword)
          .then((respond) => {
            if (respond.status === 200) {
              setSearchResult(respond?.data);
            }
            // "userId" : 806,
            // "orgId" : 1,
            // "teamId" : 4,
            // "email" : "berna@spark.dev",
            // "firstName" : "Bernardino",
            // "lastName" : "Guerrero",
            // "job" : "other",
            // "gmt" : "America/Mexico_City",
            // "locale" : "en",
            // "locked" : false,
            // "dateOfBirth" : "1980-08-03",
            // "heatSusceptibility" : "High",
            // "userTypes" : [ "Operator", "OrgAdmin" ]
          })
          .catch((error) => {
            console.log(error);
            addNotification(error?.response?.data?.message ?? error?.message);
          })
          .finally(() => {
            setIsApiLoading(false);
          });
      }
    };
    if (isOpen) {
      setIsApiLoading(true);
      handleGlobalSearch();
    }
  }, [keyword, addNotification, isOpen]);
  return (
    <Modal
      isOpen={isOpen}
      className={clsx('tw-relative', 'tw-bg-neutral-700', 'tw-p-2', 'sm:tw-p-4', 'tw-rounded-lg')}
      overlayClassName={clsx(
        'tw-flex',
        'tw-fixed',
        'tw-inset-0',
        'tw-z-50',
        'tw-justify-center',
        'tw-items-center',
        'tw-w-full',
        'tw-h-[calc(100%-1rem)]',
        'tw-max-h-full'
      )}
      appElement={document.getElementsByTagName('body')}>
      <div className={clsx('tw-flex', 'tw-flex-col', 'tw-p-6', 'tw-gap-2')}>
        <div
          className={clsx(
            'tw-absolute',
            'tw-top-3',
            'tw-right-3',
            'tw-inline',
            'tw-cursor-pointer'
          )}
          onClick={onClose}>
          <img src={removeIcon} alt="remove icon" />
        </div>
        <h2 className="tw-m-0">{t(`Search Keyword`) + ` "${keyword}"`}</h2>
        <table className="tw-table-auto tw-text-left tw-border-spacing-4 tw-bg-neutral-800 tw-rounded-md">
          <thead>
            <tr>
              <th>{t('user name')}</th>
              <th>{t('company name')}</th>
              <th>{t('team name')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {formattedSearchResult?.length > 0 ? (
              formattedSearchResult?.map((it, index) => {
                return (
                  <tr key={index}>
                    <td>{it.userName}</td>
                    <td>{it.orgName}</td>
                    <td>{it.teamName}</td>
                    <td>
                      <button
                        onClick={() => {
                          setOrganization(it.orgId);
                          setPickedTeams([it.teamId.toString()]);
                          onClose();
                        }}
                        className={clsx(
                          'tw-border-none',
                          'tw-rounded-lg',
                          'tw-outline-none',
                          'tw-z-1',
                          'tw-bg-amber-600',
                          'tw-cursor-pointer',
                          'tw-text-white',
                          'tw-uppercase',
                          'tw-px-2',
                          'tw-py-1',
                          'font-button-label-sm'
                        )}>
                        {t('go to')}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3">{isApiLoading ? t('loading') : t('no data to display')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default withTranslation()(MemberSearchResultModal);
