import * as React from 'react';
import { connect } from 'react-redux';

import clsx from 'clsx';
import style from './Header.module.scss';
import Button from '../../components/Button';
import { customStyles } from '../../pages/DashboardV2';
import { withTranslation } from 'react-i18next';
import { useStickyComponentsContext } from '../../../providers/StickyComponentsProvider';
import { useDashboardContext } from '../../../providers/DashboardProvider';
import ResponsiveSelect from '../../components/ResponsiveSelect';
import { useWidthContext } from '../../../providers/WidthProvider';
import MultiSelectPopup from '../../components/MultiSelectPopup';
import { get } from 'lodash';
import SearchInput from '../../components/SearchInput';
import Pagination from '../../components/Pagination';
import refreshIcon from '../../../assets/images/refresh.svg';

const Header = ({ t, myOrganization }) => {
  const {
    pickedTeams,
    setPickedTeams,
    organization,
    setOrganization,
    formattedTeams,
    formattedOrganizations,
    isAdmin,
    filteredMembers,
    formattedMembers,
    page,
    setPage,
    sizePerPage,
    setSizePerPage,
    keyword,
    setKeyword,
    setRefreshCount
  } = useDashboardContext();
  const { visible, setVisible } = useStickyComponentsContext();
  // eslint-disable-next-line no-unused-vars
  const [visibleWorkRestButton, setVisibleWorkRestButton] = React.useState(false);
  const [visibleStatisticsButton, setVisibleStatisticsButton] = React.useState(false);
  const { tableWidth } = useWidthContext();
  const [orgLabel, setOrgLabel] = React.useState(null);
  React.useEffect(() => {
    /*window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };*/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    setVisible({
      workRestBar: false,
      statistics: visibleStatisticsButton
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleStatisticsButton]);
  React.useEffect(() => {
    if (!isAdmin && myOrganization?.name) {
      setOrgLabel(myOrganization?.name);
    }
  }, [isAdmin, myOrganization?.name]);

  // eslint-disable-next-line no-unused-vars
  const handleScroll = () => {
    let scrollTop = window.pageYOffset;
    let valueForStatisticsVisible = 180;
    let valueForWorkRestVisible = 280;
    if (window.innerWidth < 1024) {
      valueForStatisticsVisible = 380;
      // eslint-disable-next-line no-unused-vars
      valueForWorkRestVisible = 700;
    }
    if (scrollTop > valueForStatisticsVisible) {
      setVisibleStatisticsButton(true);
    } else {
      setVisibleStatisticsButton(false);
      setVisible({
        ...visible,
        statistics: false
      });
    }
    // if (scrollTop > valueForWorkRestVisible) {
    //   setVisibleWorkRestButton(true);
    // } else {
    //   setVisibleWorkRestButton(false);
    //   setVisible({
    //     ...visible,
    //     workRestBar: false,
    //   });
    // }
  };

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
              value={formattedOrganizations?.find(
                (it) => it.value?.toString() === organization?.toString()
              )}
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
              value={formattedTeams?.filter((it) =>
                pickedTeams.some((ele) => ele.toString() === it.value?.toString())
              )}
              onChange={(v) => {
                setPickedTeams(v?.map((it) => it.value));
              }}
            />
          ) : null}
        </div>

        <div className={clsx(style.Additional)}>
          {visibleWorkRestButton && (
            <Button
              bgColor={visible.workRestBar ? 'orange' : 'gray'}
              color="white"
              size="sm"
              title={t('work rest bar')}
              onClick={() =>
                setVisible({
                  workRestBar: !visible.workRestBar,
                  statistics: !visible.workRestBar ? false : visible.statistics
                })
              }
            />
          )}
          {/*{
          visibleStatisticsButton && (
            <>
              <div className={clsx(style.Separator)}/>
              <Button
                bgColor={visible.statistics ? 'orange' : 'gray'}
                size="sm"
                title={t('team statistics')}
                onClick={() => setVisible({
                  workRestBar: !visible.statistics ? false : visible.workRestBar,
                  statistics: !visible.statistics,
                })}
              />
            </>
          )
        }*/}
        </div>
        {pickedTeams?.length > 0 && (
          <div className={clsx(style.ModifyButton)}>
            <Button
              size="sm"
              title={t('refresh')}
              onClick={() => setRefreshCount((prev) => prev + 1)}
            />
          </div>
        )}
      </div>
      {formattedMembers?.length > 0 ? (
        <div className={clsx(style.Second)}>
          <div className={clsx(style.SearchInputWrapper)}>
            <SearchInput
              keyword={keyword}
              visibleClearIcon={keyword?.trim() !== ''}
              onChange={(e) => setKeyword(e.target.value)}
              onClear={() => setKeyword('')}
            />

            <img
              src={refreshIcon}
              className={clsx(style.RefreshIcon)}
              alt="refresh"
              onClick={() => setRefreshCount((prev) => prev + 1)}
            />
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
                    onChange={handleChangePageSize}
                  >
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
      ) : null}
    </div>
  );
};

const mapStateToProps = (state) => ({
  myOrganization: get(state, 'profile.organization')
});

export default connect(mapStateToProps, null)(withTranslation()(Header));
