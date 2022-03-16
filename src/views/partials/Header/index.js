import * as React from 'react';
import {connect} from "react-redux";

import clsx from 'clsx';
import style from './Header.module.scss';
import Button from "../../components/Button";
import {customStyles} from "../../pages/DashboardV2";
import {withTranslation} from "react-i18next";
import {useStickyComponentsContext} from "../../../providers/StickyComponentsProvider";
import {useDashboardContext} from "../../../providers/DashboardProvider";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import {useWidthContext} from "../../../providers/WidthProvider";
import MultiSelectPopup from "../../components/MultiSelectPopup";
import {get} from "lodash";
import {getCompanyById} from "../../../http";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";

const Header = (
  {
    t,
    myOrgId,
  }) => {
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
    keyword,
    setKeyword,
  } = useDashboardContext();
  const {visible, setVisible} = useStickyComponentsContext();
  // eslint-disable-next-line no-unused-vars
  const [visibleWorkRestButton, setVisibleWorkRestButton] = React.useState(false);
  const [visibleStatisticsButton, setVisibleStatisticsButton] = React.useState(false);
  const {tableWidth} = useWidthContext();
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
      statistics: visibleStatisticsButton,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleStatisticsButton]);
  React.useEffect(() => {
    if (!isAdmin && myOrgId) {
      getCompanyById(myOrgId)
        .then(res => {
          setOrgLabel(res.data?.name);
        });
    }
  }, [isAdmin, myOrgId]);

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
        statistics: false,
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
      if (formattedTeams?.length > 1 && (pickedTeams?.length === formattedTeams?.length)) {
        return t("all teams");
      } else if (pickedTeams?.length > 1) {
        return t("n teams selected", {n: pickedTeams.length});
      } else {
        return formattedTeams?.find(it => it.value?.toString() === pickedTeams?.[0]?.toString())?.label;
      }
    } else {
      return t("select");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedTeams, formattedTeams]);

  return (
    <div className={clsx(style.Header)} style={{width: `${tableWidth}px`}}>
      <div className={clsx(style.First)}>
        <div className={clsx(style.DropdownWrapper)}>
          {
            isAdmin ?
              <ResponsiveSelect
                className='font-heading-small text-black'
                placeholder={t("select")}
                styles={customStyles()}
                options={formattedOrganizations}
                maxMenuHeight={190}
                value={formattedOrganizations?.find(it => it.value?.toString() === organization?.toString())}
                onChange={v => {
                  setOrganization(v.value);
                  setPickedTeams([]);
                }}
              /> :
              <div className={clsx(style.OrganizationLabel)}>
              <span
                className='font-heading-small'
              >{orgLabel}</span>
              </div>
          }
          {
            formattedTeams?.length > 0 ? (
              <MultiSelectPopup
                label={label}
                options={formattedTeams}
                value={formattedTeams?.filter(it => pickedTeams.some(ele => ele.toString() === it.value?.toString()))}
                onChange={v => {
                  setPickedTeams(v?.map(it => it.value));
                }}
              />
            ) : null
          }
        </div>

        <div className={clsx(style.Additional)}>
          {
            visibleWorkRestButton &&
            <Button
              bgColor={visible.workRestBar ? 'orange' : 'gray'}
              color="white"
              size="sm"
              title={t('work rest bar')}
              onClick={() => setVisible({
                workRestBar: !visible.workRestBar,
                statistics: !visible.workRestBar ? false : visible.statistics,
              })}
            />
          }
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

        <div className={clsx(style.ModifyButton)}>
          <Button
            size='sm'
            title={t('modify')}
          />
        </div>
      </div>
      {
        formattedMembers?.length > 0 ?
          <div className={clsx(style.Second)}>
            <div className={clsx(style.SearchInputWrapper)}>
              <SearchInput
                keyword={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>

            <div className={clsx(style.PaginationWrapper)}>
              {
                filteredMembers?.length > 0 ?
                  <Pagination
                    page={page}
                    size={sizePerPage}
                    length={filteredMembers?.length}
                    onClickEnd={() => {
                      setPage(Math.ceil(filteredMembers?.length / sizePerPage));
                    }}
                    onClickNext={() => {
                      setPage(prev => prev + 1);
                    }}
                    onClickPrev={() => {
                      setPage(prev => prev - 1);
                    }}
                    onClickStart={() => {
                      setPage(1);
                    }}
                  /> : null
              }
            </div>
          </div> : null
      }
    </div>
  )
}

const mapStateToProps = (state) => ({
  myOrgId: get(state, "auth.organizationId"),
});

export default connect(
  mapStateToProps,
  null
)(withTranslation()(Header));