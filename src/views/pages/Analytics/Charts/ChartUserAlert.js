import * as React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { Line } from 'react-chartjs-2';
import spacetime from 'spacetime';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  Tooltip,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-spacetime';
import { METRIC_USER_CHART_VALUES, TYPES, INIT_USER_CHART_ALERT_DATA } from '../../../../constant';

import clsx from 'clsx';
import style from './Chart.module.scss';
import { useTranslation, withTranslation } from 'react-i18next';
import { useAnalyticsContext } from '../../../../providers/AnalyticsProvider';
import { customStyles } from '../../DashboardV2';
import ResponsiveSelect from '../../../components/ResponsiveSelect';
import {
  chartPlugins,
  checkEmptyData,
  getWeeksInMonth,
  getRandomLightColor
} from '../../../../utils/anlytics';
import MultiSelectPopup from '../../../components/MultiSelectPopup';
import { useUtilsContext } from '../../../../providers/UtilsProvider';
import { formatHeartRate } from '../../../../utils/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  TimeScale,
  Legend
);

const ChartUserAlert = ({ metric: unit }) => {
  const {
    members,
    selectedMetric,
    selectedTeams,
    selectedMembers,
    selectedUsers,
    setUsers,
    users,
    chartData,
    timeZone,
    chartRef,
    setIsEnablePrint
  } = useAnalyticsContext();
  const { t } = useTranslation();
  const { formatHeartCbt } = useUtilsContext();
  const [type, setType] = React.useState(1); // 1 | 2 // 1: day, 2: week

  /**
   List of dates split into week and month ranges ->
   ex. [
     {value: 0, label: 2022-11-20},
     {value: 1, label: 2022-11-13},
     {value: 2, label: 2022-11-6},
     {value: 3, label: 2022-10-30},
     {value: 4, label: 2022-10-24},
   ]
   */
  const [dates, setDates] = React.useState(null);

  /**
   value of selected item from Date Range options [{value: 0, label: 2022-11-24}, {value: 2, label: 2022-11-23}, ]
   */
  const [date, setDate] = React.useState(null);

  /**
   * @type {{label: string, value: number} | {label: string, value: number}}
   */
  const selectedType = React.useMemo(() => {
    let dateList = getWeeksInMonth(timeZone);
    dateList = type === 1 ? dateList.dates : type === 2 ? dateList.weeks : [];
    setDates(dateList);
    setDate(dateList?.length > 0 ? dateList[0].value : null);
    return TYPES?.find((it) => it.value?.toString() === type?.toString());
  }, [type, timeZone]);

  /**
   selected start date from date range options
   ex. {value: 2, label: 2022-11-23}
   */
  const selectedDate = React.useMemo(() => {
    return dates?.find((it) => it.value?.toString() === date?.toString());
  }, [date, dates]);

  const usersLabel = React.useMemo(() => {
    if (selectedUsers?.length > 0) {
      if (selectedUsers?.length > 1) {
        return selectedMembers?.length === selectedUsers?.length
          ? t(`all users`)
          : t(`n users selected`, { n: selectedUsers.length });
      } else {
        return selectedMembers?.find(
          (it) => it.value?.toString() === selectedUsers?.[0]?.value?.toString()
        )?.label;
      }
    } else {
      return t(`select user`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMembers, selectedUsers]);

  /**
   labels: [
    '21 12:33:46', '21 09:01:43', '21 09:04:44', ... , '24 04:51:32', '24 05:11:33'
   ],
   datasets -> data: [ 0, 36.8, 36.5, ... , 38.5, 37.7 ]
   */
  const [data, setData] = React.useState(INIT_USER_CHART_ALERT_DATA);
  const isCbt = React.useMemo(() => {
    return selectedMetric?.value === METRIC_USER_CHART_VALUES.CBT;
  }, [selectedMetric]);

  const xLabel = 'Time of Day';

  React.useEffect(() => {
    const teamTz = timeZone?.name ?? 'UTC';

    if (selectedDate) {
      let datasets = [];
      const filteredUsers = users
        ?.filter(
          (it) => selectedMembers?.findIndex((a) => a?.value?.toString() === it.toString()) > -1
        )
        ?.sort((a, b) => (a > b ? 1 : -1));

      filteredUsers?.forEach((userId) => {
        const memberFull = members?.find((a) => a?.userId?.toString() === userId?.toString());
        const memberTz = memberFull?.gmt ?? teamTz;
        let temp = [];
        let startTimeForUser = spacetime(selectedDate.label, memberTz);
        startTimeForUser = startTimeForUser.time('9:00am');
        let endTimeForUser = spacetime(selectedDate.label, memberTz);
        endTimeForUser = endTimeForUser.time('11:59pm');
        const userChartData =
          chartData
            ?.find((it) => userId.toString() === it.userId.toString())
            ?.data?.filter((a) => {
              const st = spacetime(a.utcTs).goto(memberTz);
              return st.isAfter(startTimeForUser) && st.isBefore(endTimeForUser);
            }) ?? [];

        userChartData?.forEach((u) => {
          const stStr = spacetime(u.utcTs).goto(memberTz).unixFmt('yyyy.MM.dd HH:mm');
          if (temp.findIndex((a) => a.time === stStr) === -1) {
            temp.push({
              time: stStr,
              value: isCbt
                ? u.cbt
                  ? formatHeartCbt(u.cbt)
                  : ''
                : u.hr
                ? formatHeartRate(u.hr)
                : ''
            });
          }
        });
        temp = temp.map((a) => ({
          x: new Date(a.time),
          y: a.value
        }));

        let color = getRandomLightColor();
        const label = selectedMembers?.find((it) => it.value === userId)?.label;
        if (temp?.length > 0) {
          datasets.push({
            label: `${memberTz} : ${label}`,
            data: temp,
            borderWidth: 1,
            borderColor: color,
            backgroundColor: color
          });
        }
      });

      setData(datasets ? { datasets } : INIT_USER_CHART_ALERT_DATA);
    }
  }, [
    chartData,
    selectedMetric,
    selectedType,
    selectedDate,
    users,
    selectedMembers,
    selectedTeams,
    timeZone,
    formatHeartCbt,
    isCbt,
    members
  ]);

  React.useEffect(() => {
    setIsEnablePrint(!checkEmptyData(data?.datasets, 1));
  }, [data, setIsEnablePrint]);

  const chartTitle = React.useMemo(() => {
    return isCbt ? 'Core Body Temperature' : 'Heart Rate';
  }, [isCbt]);

  const yAxisLabel = React.useMemo(() => {
    return isCbt ? `Core Body Temperature ${unit ? '˚C' : '˚F'}` : 'Heart Rate (BPM)';
  }, [isCbt, unit]);

  const yAxisMin = React.useMemo(() => {
    return isCbt ? (unit ? 36.4 : 97.5) : 40;
  }, [unit, isCbt]);

  const yAxisMax = React.useMemo(() => {
    return isCbt ? (unit ? 39.4 : 103.0) : 200;
  }, [isCbt, unit]);

  const yAxisStepSize = React.useMemo(() => {
    return isCbt ? (unit ? 0.25 : 0.5) : 15;
  }, [isCbt, unit]);

  return (
    <div ref={chartRef} className={clsx(style.ChartBody)}>
      <div className={clsx(style.LineBody)}>
        <h1 className={clsx(style.TxtCenter)}>{chartTitle}</h1>
        <div className={clsx(style.LineFlex, `mb-15`)}>
          {selectedMembers?.length > 0 ? (
            <div className={'d-flex flex-row'}>
              <span className="font-input-label d-flex align-center">{t(`users`)}</span>
              <div className={clsx(style.SelectMw, `ml-15 font-heading-small text-black`)}>
                <MultiSelectPopup
                  label={usersLabel}
                  options={selectedMembers}
                  value={selectedUsers}
                  onChange={(v) => {
                    setUsers(v?.map((it) => it.value));
                  }}
                />
              </div>
            </div>
          ) : (
            <div />
          )}
          <div className="d-flex flex-row ml-15">
            <span className="font-input-label d-flex align-center">{t(`types`)}</span>

            <ResponsiveSelect
              className={clsx(style.SelectMw, `ml-15 font-heading-small text-black`)}
              isClearable
              options={TYPES}
              value={selectedType}
              styles={customStyles()}
              placeholder={t(`select type`)}
              onChange={(v) => setType(v?.value)}
            />
          </div>

          <div className="d-flex flex-row ml-15">
            <span className="font-input-label d-flex align-center">{t(`date range`)}</span>

            <ResponsiveSelect
              className={clsx(style.SelectMw, `ml-15 font-heading-small text-black`)}
              isClearable
              options={dates}
              value={selectedDate}
              styles={customStyles()}
              placeholder={t(`select start date`)}
              onChange={(v) => setDate(v?.value)}
            />
          </div>
        </div>

        <div className={clsx(style.FlexSpace)}>
          <Line
            options={{
              pointRadius: 1,
              scales: {
                x: {
                  type: 'time',
                  title: {
                    display: true,
                    text: xLabel
                  },
                  min: `${selectedDate?.label}T09:00`,
                  max: `${selectedDate?.label}T23:59`,
                  suggestedMin: `${selectedDate?.label}T09:00`,
                  suggestedMax: `${selectedDate?.label}T23:59`,
                  autoSkip: false,
                  time: {
                    unit: 'minute',
                    stepSize: 15,
                    displayFormats: {
                      minute: 'HH:mm'
                    }
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: yAxisLabel
                  },
                  min: yAxisMin,
                  max: yAxisMax,
                  ticks: {
                    stepSize: yAxisStepSize
                  }
                }
              }
            }}
            data={data}
            plugins={chartPlugins(`line`, t(`no data to display`))}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric')
});

export default connect(mapStateToProps, null)(withTranslation()(ChartUserAlert));
