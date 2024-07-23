import * as React from 'react';
import { connect } from 'react-redux';

import clsx from 'clsx';
import style from './Header.module.scss';
import Button from '../../components/Button';
import { customStyles } from '../../pages/team/dashboard/DashboardV2';
import { withTranslation } from 'react-i18next';
import { useDashboardContext } from '../../../providers/DashboardProvider';
import ResponsiveSelect from '../../components/ResponsiveSelect';
import { useWidthContext } from '../../../providers/WidthProvider';
import MultiSelectPopup from '../../components/MultiSelectPopup';
import { get } from 'lodash';
import Pagination from '../../components/Pagination';
import refreshIcon from '../../../assets/images/refresh.svg';
import MemberSearchResultModal from 'views/modals/MemberSearchResultModal';
import { bindActionCreators } from 'redux';
import { setLoadingAction } from 'redux/action/ui';
import SearchInputV2 from 'views/components/SearchInputV2';

const TeamDashboardHeader = ({ t, myOrganization, setLoading }) => {
  const {
    pickedTeams,
    setPickedTeams,
    setOrganization,
    formattedTeams,
    selectedTeams,
    formattedOrganizations,
    selectedOrganization,
    isAdmin,
    filteredMembers,
    page,
    setPage,
    sizePerPage,
    setSizePerPage,
    keyword,
    setKeyword,
    setRefreshCount,
  } = useDashboardContext();

  const { tableWidth } = useWidthContext();
  const [orgLabel, setOrgLabel] = React.useState(null);
  const [isOpenGlobalSearchResult, setIsOpenGlobalSearchResult] = React.useState(false);

  React.useEffect(() => {
    if (!isAdmin && myOrganization?.name) {
      setOrgLabel(myOrganization?.name);
    }
  }, [isAdmin, myOrganization?.name]);

  const label = React.useMemo(() => {
    if (pickedTeams?.length > 0) {
      if (formattedTeams?.length > 1 && pickedTeams?.length === formattedTeams?.length) {
        return t('all teams');
      } else if (pickedTeams?.length > 1) {
        return t('n teams selected', { n: pickedTeams.length });
      } else {
        return formattedTeams?.find((it) => it.value?.toString() === pickedTeams?.[0]?.toString())
          ?.label;
      }
    } else {
      return t('select team');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedTeams, formattedTeams]);

  const handleClickEnd = React.useCallback(() => {
    setPage(Math.ceil(filteredMembers?.length / sizePerPage));
  }, [setPage, sizePerPage, filteredMembers]);

  const handleClickNext = React.useCallback(() => {
    setPage((prev) => prev + 1);
  }, [setPage]);

  const handleClickPrev = React.useCallback(() => {
    setPage((prev) => prev - 1);
  }, [setPage]);

  const handleClickStart = React.useCallback(() => {
    setPage(1);
  }, [setPage]);

  const handleChangePageSize = React.useCallback(
    (e) => {
      setPage(1);
      setSizePerPage(e.target.value);
    },
    [setSizePerPage, setPage]
  );

  return (
    <div className={clsx(style.Header)} style={{ width: `${tableWidth}px` }}>
      <div className={clsx(style.First)}>
        <div className={clsx(style.DropdownWrapper)}>
          {isAdmin ? (
            <ResponsiveSelect
              className="font-heading-small text-black"
              placeholder={t('select company')}
              styles={customStyles()}
              options={formattedOrganizations}
              maxMenuHeight={190}
              value={selectedOrganization}
              onChange={(v) => {
                setOrganization(v.value);
                setPickedTeams([]);
              }}
            />
          ) : (
            <div className={clsx(style.OrganizationLabel)}>
              <span className="font-heading-small">{orgLabel}</span>
            </div>
          )}
          {formattedTeams?.length > 0 ? (
            <MultiSelectPopup
              label={label}
              options={formattedTeams}
              value={selectedTeams}
              onChange={(v) => {
                setPickedTeams(v?.map((it) => it.value));
              }}
            />
          ) : null}
        </div>

        {/* <div className={clsx(style.Additional)}>
          
        </div> */}
        {pickedTeams?.length > 0 && (
          <div className={clsx(style.ModifyButton)}>
            <Button
              size="sm"
              title={t('refresh')}
              onClick={() => {setLoading(true); setRefreshCount((prev) => prev + 1);}}
            />
          </div>
        )}
      </div>

      <div className={clsx(style.Second, 'tw-gap-2')}>
        <div className={clsx(style.SearchInputWrapper)}>
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-4 tw-w-full">
            <div className="tw-flex tw-justify-between tw-items-center tw-w-[100%] tw-gap-2">
              <SearchInputV2
                placeholder={t('search a user or device placeholder')}
                keyword={keyword}
                visibleClearIcon={keyword !== ''}
                onChange={(e) => setKeyword(e.target?.value)}
                onClear={() => setKeyword('')}
              />
              <img
                src={refreshIcon}
                className={clsx(style.RefreshIcon)}
                alt="refresh"
                onClick={() => {setLoading(true);setRefreshCount((prev) => prev + 1)}}
              />
            </div>

            {isAdmin && (
              <div className="tw-flex tw-justify-start tw-items-center">
                <MemberSearchResultModal
                  isOpen={isOpenGlobalSearchResult}
                  onClose={() => {
                    setIsOpenGlobalSearchResult(false);
                  }}
                />
                <button
                  onClick={() => {
                    if (keyword) setIsOpenGlobalSearchResult(true);
                  }}
                  disabled={!keyword}
                  className={clsx(
                    'font-button-label-sm tw-py-2 tw-uppercase tw-outline-none tw-border-none tw-rounded-lg tw-px-4 tw-cursor-pointer',
                    keyword ? 'k-bg-orange tw-text-white' : 'tw-bg-neutral-800 tw-text-zinc-400'
                  )}>
                  {t('global search')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={clsx(style.PaginationWrapper)}>
          {filteredMembers?.length > 0 ? (
            <React.Fragment>
              <Pagination
                page={page}
                size={sizePerPage}
                length={filteredMembers?.length}
                onClickEnd={handleClickEnd}
                onClickNext={handleClickNext}
                onClickPrev={handleClickPrev}
                onClickStart={handleClickStart}
              />
              <div className={clsx(style.SelectorWrapper)}>
                <select
                  className={clsx(style.Selector, 'font-input-label text-white')}
                  value={sizePerPage}
                  onChange={handleChangePageSize}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </React.Fragment>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  myOrganization: get(state, 'profile.organization')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TeamDashboardHeader));
