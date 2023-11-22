import * as React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import ReactToPrint from 'react-to-print';
import { useTranslation } from 'react-i18next';

import style from './FilterBoard.module.scss';
import { customStyles } from '../team/DashboardV2';
import ResponsiveSelect from '../../components/ResponsiveSelect';
import MultiSelectPopup from '../../components/MultiSelectPopup';
import { useBasicContext } from '../../../providers/BasicProvider';
import { useAnalyticsContext } from '../../../providers/AnalyticsProvider';
import CustomDatePicker from '../../components/CustomDatePicker';
import calendarIcon from '../../../assets/images/calendar.png';
import { get } from 'lodash';

import {
  METRIC_USER_TABLE_VALUES,
  METRIC_TEAM_TABLE_VALUES,
  METRIC_USER_CHART_VALUES,
  METRIC_TEAM_CHART_VALUES,
  KA_CATEGORY_SELECT_OPTIONS
} from '../../../constant';
import { checkMetric, getKeyApiCall } from '../../../utils/anlytics';
import moment from 'moment';
import Toggle from 'views/components/Toggle';

const CustomInput = React.forwardRef(({ value, onClick, readOnly }, ref) => {
  return (
    <div className={clsx(style.CustomInputWrapper)} onClick={onClick}>
      <input
        className={clsx(
          'input mt-10 font-heading-small text-white',
          readOnly ? style.ReadOnlyInputField : style.InputField
        )}
        type="text"
        ref={ref}
        placeholder={'mm/dd/yyyy'}
        value={value}
        readOnly
      />
      <img src={calendarIcon} className={clsx(style.CalendarIcon)} alt="calendar" />
    </div>
  );
});

CustomInput.displayName = 'CustomInput';

const FilterBoard = ({ isAdmin, myOrganization }) => {
  const { t } = useTranslation();
  const {
    formattedOrganizations: organizations,
    organization,
    setOrganization,
    formattedTeams: teams,
    setPickedTeams
  } = useBasicContext();
  const [submitTried, setSubmitTried] = React.useState(false);
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    metrics,
    metric,
    setMetric,
    // metricsV2,
    // metricV2,
    // setMetricV2,
    formattedMembers: members,
    setPickedMembers,
    processQuery,
    statsBy,
    selectedMetric,
    // selectedMetricV2,
    selectedTeams,
    selectedMembers,
    pickedMembers,
    selectedUsers,
    teamLabel,
    userLabel,
    chartRef,
    setLoading,
    isEnablePrint,
    organizationAnalytics,
    setStatsBy,
    setCategory,
    selectedCategory,
    statsRemoveFlag
  } = useAnalyticsContext();
  const selectedOrganization = React.useMemo(() => {
    return organizations?.find((it) => it.value?.toString() === organization?.toString());
  }, [organizations, organization]);

  const onBeforeGetContentResolve = React.useRef(null);

  const [preDateRange, setPreDateRange] = React.useState();

  const submitActivated = React.useMemo(() => {
    return (
      organization &&
      selectedTeams?.length > 0 &&
      (statsBy === 'team' ||
        (statsBy === 'user' &&
          (checkMetric(METRIC_USER_TABLE_VALUES, metric) ||
            (checkMetric(METRIC_USER_CHART_VALUES, metric) &&
              pickedMembers?.length > 0 &&
              selectedUsers?.length > 0))))
    );
  }, [organization, selectedTeams, statsBy, pickedMembers, selectedUsers, metric]);

  const submit = () => {
    if (!submitActivated && !errors.metric && !errors.dateRange) return;
    setSubmitTried(true);
    if (!Object.values(errors).some((it) => !!it)) {
      processQuery();
    }
  };

  const errors = React.useMemo(() => {
    const errors = {
      dateRange: null,
      metric: null
    };
    if (!startDate || !endDate || startDate > endDate) {
      errors.dateRange = t('date range invalid');
    }
    if (
      !metric ||
      (metric &&
        ((statsBy === 'user' &&
          !checkMetric(METRIC_USER_TABLE_VALUES, metric) &&
          !checkMetric(METRIC_USER_CHART_VALUES, metric)) ||
          (statsBy === 'team' &&
            !checkMetric(METRIC_TEAM_TABLE_VALUES, metric) &&
            !checkMetric(METRIC_TEAM_CHART_VALUES, metric))))
    ) {
      errors.metric = t('metric required');
    }
    return errors;
  }, [startDate, endDate, metric, statsBy, t]);

  const showChart = React.useCallback(() => {
    if (!selectedMetric) return false;
    else {
      return (
        [
          METRIC_USER_TABLE_VALUES.SWR_ACCLIM_SWEAT,
          METRIC_USER_TABLE_VALUES.SWR_ACCLIM_HEAT,
          METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE,
          METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE,
          METRIC_USER_TABLE_VALUES.ALERTS,
          METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK,
          METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK,
          METRIC_USER_CHART_VALUES.CBT,
          METRIC_USER_CHART_VALUES.HR
        ].includes(selectedMetric?.value) && isEnablePrint
      );
    }
  }, [selectedMetric, isEnablePrint]);

  const fileName = React.useMemo(() => {
    if (
      selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM_SWEAT ||
      selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM_HEAT ||
      selectedMetric?.value === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE ||
      selectedMetric?.value === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE
    )
      return 'Heat-Sweat-Chart';
    else if (
      selectedMetric?.value === METRIC_USER_TABLE_VALUES.ALERTS ||
      selectedMetric?.value === METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK
    )
      // 2, 31
      return 'Alert-Chart';
    else if (selectedMetric?.value === METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK)
      // 32
      return 'Max-Cbt-Chart';
    else if (selectedMetric?.value === METRIC_USER_CHART_VALUES.CBT)
      // 40
      return 'Cbt-Chart';
    else if (selectedMetric?.value === METRIC_USER_CHART_VALUES.HR)
      // 41
      return 'Hr-Chart';
  }, [selectedMetric]);

  const dateRangPresets = React.useMemo(
    () => [
      {
        label: 'Yesterday',
        value: {
          from: moment().subtract(1, 'day').startOf('day'),
          to: moment().subtract(1, 'day').endOf('day')
        }
      },
      {
        label: 'This Week',
        value: {
          from: moment().startOf('week'),
          to: moment()
        }
      },
      {
        label: 'Last Week',
        value: {
          from: moment().subtract(1, 'week').startOf('week'),
          to: moment().subtract(1, 'week').endOf('week')
        }
      },
      {
        label: 'This Month',
        value: {
          from: moment().startOf('month'),
          to: moment()
        }
      },
      {
        label: 'Last Month',
        value: {
          from: moment().subtract(1, 'month').startOf('month'),
          to: moment().subtract(1, 'month').endOf('month')
        }
      },
      {
        label: 'Past 60 Days',
        value: {
          from: moment().subtract(60, 'days'),
          to: moment()
        }
      },
      {
        label: 'This Quarter',
        value: {
          from: moment().startOf('quarter'),
          to: moment()
        }
      },
      {
        label: 'Last Quarter',
        value: {
          from: moment().subtract(1, 'quarter').startOf('quarter'),
          to: moment().subtract(1, 'quarter').endOf('quarter')
        }
      },
      {
        label: 'This year',
        value: {
          from: moment().startOf('year'),
          to: moment()
        }
      },
      {
        label: 'Last year',
        value: {
          from: moment().subtract(1, 'year').startOf('year'),
          to: moment().subtract(1, 'year').endOf('year')
        }
      },
      {
        label: 'Past 7 days',
        value: {
          from: moment().subtract(6, 'days').startOf('day'),
          to: moment()
        }
      }
    ],
    []
  );

  React.useEffect(() => {
    if (!selectedMetric) return;
    if (checkMetric(METRIC_USER_CHART_VALUES, selectedMetric?.value)) {
      // local time
      // setEndDate(new Date());
      // const start = new Date();
      // start.setMonth(start.getMonth() - 1);
      // setStartDate(start);
      setPreDateRange(dateRangPresets[5]);
    } else if (
      METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK === selectedMetric?.value ||
      METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK === selectedMetric?.value
    ) {
      // const week = getThisWeek();
      // setStartDate(week.startDate);
      // setEndDate(week.endDate);
      // setEndDate(moment().toDate());
      // setStartDate(moment().subtract(6, 'days').startOf('day').toDate());
      setPreDateRange(dateRangPresets[10]);
    }
  }, [selectedMetric, dateRangPresets, setStartDate, setEndDate, setPreDateRange]);

  /**
   * print chart
   * onAfterPrint called
   */
  const handleAfterPrint = React.useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  /**
   * onBeforePrint called
   */
  const handleBeforePrint = React.useCallback(() => {
    setLoading(true);
  }, [setLoading]);

  /**
   * onBeforeGetContent called
   */
  const handleOnBeforeGetContent = React.useCallback(() => {
    if (showChart()) setLoading(true);
    return new Promise((resolve) => {
      onBeforeGetContentResolve.current = resolve;

      setTimeout(() => {
        resolve();
        setLoading(false);
      }, 2000);
    });
  }, [setLoading, showChart]);

  const reactToPrintContent = React.useCallback(() => {
    return chartRef.current;
  }, [chartRef]);

  const reactToPrintTrigger = React.useCallback(() => {
    return (
      <button
        className={`${
          showChart() &&
          selectedMetric?.value &&
          Object.keys(organizationAnalytics).includes(getKeyApiCall(selectedMetric?.value).keys[0])
            ? 'active cursor-pointer'
            : 'inactive cursor-default'
        } button`}>
        <span className="font-button-label text-white text-uppercase">{t('print')}</span>
      </button>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetric, isEnablePrint, organizationAnalytics]);

  const startDateMax = new Date();
  const endDateMax = new Date();
  endDateMax.setDate(endDateMax.getDate() + 1);

  const datePickerReadOnly = React.useMemo(() => {
    return (
      (selectedMetric?.value && checkMetric(METRIC_USER_CHART_VALUES, selectedMetric?.value)) ||
      // METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK === selectedMetric?.value ||
      METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK === selectedMetric?.value
    );
  }, [selectedMetric]);

  React.useEffect(() => {
    if (preDateRange?.value) {
      setStartDate(preDateRange.value.from.toDate());
      setEndDate(preDateRange.value.to.toDate());
    }
  }, [preDateRange, setStartDate, setEndDate]);

  return (
    <div>
      <div
        className={clsx(
          style.FilterDiv,
          'tw-flex tw-flex-col sm:tw-flex-row tw-justify-start tw-gap-[12px]'
        )}>
        <div className="tw-flex tw-flex-col tw-min-w-[240px]">
          <div className="tw-flex tw-flex-col">
            <label className="font-input-label">{t('company name')}</label>
            {isAdmin ? (
              <ResponsiveSelect
                className="mt-10 font-heading-small text-black"
                isClearable
                options={organizations}
                value={selectedOrganization}
                styles={customStyles()}
                placeholder={t('select company')}
                onChange={(v) => setOrganization(v?.value)}
              />
            ) : (
              <div className={clsx(style.OrganizationLabel)}>
                <span className="font-heading-small">{myOrganization?.name}</span>
              </div>
            )}
          </div>
          <div
            className={clsx(
              'tw-flex tw-flex-col sm:tw-flex-row sm:tw-gap-4',
              teams?.length > 0 || members?.length > 0
                ? ''
                : 'tw-grow tw-border tw-border-gray-700 tw-border-dashed tw-mt-2'
            )}>
            {teams?.length > 0 ? (
              <div className={'tw-flex tw-flex-col tw-min-w-[240px]'}>
                <label className="font-input-label mb-10">{t('team')}</label>

                <MultiSelectPopup
                  label={teamLabel}
                  options={teams}
                  value={selectedTeams}
                  onChange={(v) => {
                    setPickedTeams(v?.map((it) => it.value));
                  }}
                />
              </div>
            ) : null}
            {selectedTeams?.length > 0 && members?.length > 0 ? (
              <div className={'tw-flex tw-flex-col tw-min-w-[240px]'}>
                <label className="font-input-label mb-10">{t('users')}</label>

                <MultiSelectPopup
                  label={userLabel}
                  options={members}
                  value={selectedMembers}
                  onChange={(v) => {
                    setPickedMembers(v?.map((it) => it.value));
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="tw-flex tw-flex-col tw-min-w-[240px]">
          <div className="tw-flex tw-gap-4">
            <div className="tw-flex tw-flex-col">
              <label className="font-input-label">{t('start date')}</label>
              <div className={clsx(style.FlexLeft)}>
                <CustomDatePicker
                  date={startDate}
                  setDate={(v) => {
                    setPreDateRange(null);
                    setStartDate(v);
                  }}
                  CustomInput={CustomInput}
                  maxDate={startDateMax}
                  selectedMetric={selectedMetric}
                  readOnly={datePickerReadOnly}
                />
              </div>
              {submitTried && errors?.dateRange && (
                <span className="font-helper-text text-error mt-10">{errors.dateRange}</span>
              )}
            </div>

            <div className="tw-flex tw-flex-col">
              <label className="font-input-label">{t('end date')}</label>
              <div className={clsx(style.FlexLeft)}>
                <CustomDatePicker
                  date={endDate}
                  setDate={(v) => {
                    setPreDateRange(null);
                    setEndDate(v);
                  }}
                  CustomInput={CustomInput}
                  maxDate={endDateMax}
                  selectedMetric={selectedMetric}
                  readOnly={datePickerReadOnly}
                />
              </div>
            </div>
          </div>
          <div className="tw-flex tw-flex-col">
            <label className="font-input-label">{t('date range')}</label>
            <ResponsiveSelect
              className="mt-10 font-heading-small text-black"
              isClearable
              options={dateRangPresets}
              value={preDateRange}
              styles={customStyles()}
              placeholder={t('Select predefined date range')}
              onChange={(v) => {
                setPreDateRange(v);
              }}
            />
          </div>
        </div>

        <div className="tw-flex tw-flex-col tw-min-w-[480px]">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4">
            <div className="tw-flex tw-flex-col tw-grow">
              <label className="font-input-label">{t('select category')}</label>
              <ResponsiveSelect
                className="mt-10 font-heading-small text-black"
                isClearable
                options={KA_CATEGORY_SELECT_OPTIONS}
                value={selectedCategory}
                styles={customStyles()}
                placeholder={t('select category')}
                onChange={(v) => {
                  setCategory(v?.value);
                }}
              />
            </div>
            <div className="tw-flex tw-flex-col tw-justify-end tw-items-center">
              <Toggle
                on={statsBy === 'team'}
                titleOn={t('user')}
                titleOff={t('team')}
                handleSwitch={(v) => {
                  setStatsBy(v ? 'team' : 'user');
                }}
                remove={statsRemoveFlag}
              />
            </div>
          </div>
          <div className="tw-flex tw-flex-col">
            <label className="font-input-label">{t('select metric')}</label>

            <ResponsiveSelect
              className="mt-10 font-heading-small text-black"
              isClearable
              options={metrics}
              value={selectedMetric}
              styles={customStyles()}
              placeholder={t('select metric')}
              onChange={(v) => setMetric(v?.value)}
            />

            {submitTried && errors?.metric && (
              <span className="font-helper-text text-error mt-10">{errors.metric}</span>
            )}
          </div>
        </div>
        <div className="tw-flex tw-flex-col tw-gap-[12px] sm:tw-flex-row tw-flex-wrap tw-justify-center tw-mt-[40px] sm:tw-ml-[20px]">
          <div className={clsx('tw-w-full sm:tw-w-auto tw-min-w-[145px]')}>
            <button
              className={`${
                submitActivated && !errors.metric && !errors.dateRange
                  ? 'active cursor-pointer'
                  : 'inactive cursor-default'
              } button`}
              onClick={submit}>
              <span className="font-button-label text-white text-uppercase">{t('process')}</span>
            </button>
          </div>
          <div className={clsx('tw-w-full sm:tw-w-auto sm:tw-min-w-[145px]')}>
            <ReactToPrint
              content={reactToPrintContent}
              documentTitle={fileName}
              onAfterPrint={handleAfterPrint}
              onBeforeGetContent={handleOnBeforeGetContent}
              onBeforePrint={handleBeforePrint}
              removeAfterPrint
              trigger={reactToPrintTrigger}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAdmin: get(state, 'auth.isAdmin'),
  myOrganization: get(state, 'profile.organization')
});

export default connect(mapStateToProps, null)(FilterBoard);
