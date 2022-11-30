import * as React from 'react';
import {connect} from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from 'chart.js';
import {Line} from 'react-chartjs-2';
import {
  METRIC_USER_CHART_VALUES,
  TYPES,
  INIT_USER_CHART_ALERT_DATA,
} from "../../../../constant";

import clsx from 'clsx';
import style from './Chart.module.scss';
import {
  useTranslation,
  withTranslation
} from "react-i18next";
import {useAnalyticsContext} from "../../../../providers/AnalyticsProvider";
import {customStyles} from "../../DashboardV2";
import ResponsiveSelect from "../../../components/ResponsiveSelect";
import {
  chartPlugins,
  getWeeksInMonth,
  randomHexColorCode
} from "../../../../utils/anlytics";
import MultiSelectPopup from "../../../components/MultiSelectPopup";
import spacetime from "spacetime";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
);

const ChartUserAlert = () => {
  const {
    selectedMetric,
    selectedTeams,
    selectedMembers,
    selectedUsers,
    setUsers,
    users,
    chartData,
    timeZone
  } = useAnalyticsContext();
  const {t} = useTranslation();

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
    return TYPES?.find(it => it.value?.toString() === type?.toString());
  }, [type, timeZone]);

  /**
   selected start date from date range options
   ex. {value: 2, label: 2022-11-23}
   */
  const selectedDate = React.useMemo(() => {
    return dates?.find(it => it.value?.toString() === date?.toString());
  }, [date, dates]);

  const usersLabel = React.useMemo(() => {
    if (selectedUsers?.length > 0) {
      if (selectedUsers?.length > 1 && (selectedMembers?.length === selectedUsers?.length)) {
        return t(`all users`);
      } else if (selectedUsers?.length > 1) {
        return t(`n users selected`, {n: selectedUsers.length});
      } else {
        return selectedMembers?.find(it => it.value?.toString() === selectedUsers?.[0]?.value?.toString())?.label;
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

  React.useEffect(() => {
    if (selectedDate) {
      let labels = [], tempData = [], datasets = [];
      let dateList = getWeeksInMonth(timeZone);

      let start = selectedDate.label;
      dateList = selectedType.value === 1 ? dateList.dates : dateList.weeks;

      let findIndex = dateList.findIndex(it => it.value === selectedDate.value);
      let end = findIndex === 0 ? spacetime(new Date(), timeZone.name) : dateList[findIndex - 1].label;

      let filterUsers = users?.filter(it => selectedMembers?.findIndex(a => a?.value?.toString() === it.toString()) > -1)?.sort((a, b) => a > b ? 1 : -1);

      chartData.filter(it => filterUsers.includes(it.userId))?.forEach(it => {
        if (spacetime(it.ts, timeZone.name).isAfter(start) && spacetime(it.ts, timeZone.name).isBefore(end)) {
          labels.push(spacetime(it.ts, timeZone.name).unixFmt('dd hh:mm:ss'));
        }
      });
      labels.reverse();

      filterUsers?.forEach(userId => {
        tempData = new Array(labels?.length || 0).fill('');
        let emptyFlag = false;
        chartData.filter(it => userId.toString() === it.userId.toString())?.forEach(it => {
          if (spacetime(it.ts, timeZone.name).isAfter(start) && spacetime(it.ts, timeZone.name).isBefore(end)) {
            let findIndex = labels?.findIndex(label => label === (spacetime(it.ts, timeZone.name).unixFmt('dd hh:mm:ss')));
            if (findIndex > -1) {
              tempData[findIndex] = selectedMetric.value === METRIC_USER_CHART_VALUES.CBT ? it?.heartCbtAvg : it?.heartRateAvg;
              emptyFlag = true;
            }
          }
        });

        if (emptyFlag) {
          let color = randomHexColorCode();
          datasets.push({
            label: `${selectedMetric?.value === METRIC_USER_CHART_VALUES.CBT ? `CBT: userId-${userId}` : `Hr: userId-${userId}`}`,
            data: tempData,
            borderWidth: 3,
            borderColor: color,
            backgroundColor: color
          });
        }
      });

      setData(labels?.length > 0 ? { labels, datasets } : INIT_USER_CHART_ALERT_DATA);
    }
  }, [chartData, selectedMetric, selectedType, selectedDate, users, selectedMembers, selectedTeams, timeZone]);

  return (
      <div className={clsx(style.chart_body)}>
        <div className={clsx(style.line_body)}>
          <h1 className={clsx(style.txt_center)}>
            {t(`${selectedMetric?.value === METRIC_USER_CHART_VALUES.CBT ? 'cbt' : 'hr'}`)}
          </h1>
          <div className={clsx(style.line_flex, `mb-15`)}>
            {
              selectedMembers?.length > 0 ?
                  <div className={"d-flex flex-row"}>
                    <span className='font-input-label d-flex align-center'>
                      {t(`users`)}
                    </span>
                    <div className={clsx(style.select_mw, `ml-15 font-heading-small text-black`)}>
                      <MultiSelectPopup
                          label={usersLabel}
                          options={selectedMembers}
                          value={selectedUsers}
                          onChange={v => {
                            setUsers(v?.map(it => it.value));
                          }}
                      />
                    </div>
                  </div> : <div/>
            }
            <div className='d-flex flex-row ml-15'>
              <span className='font-input-label d-flex align-center'>
                {t(`types`)}
              </span>

              <ResponsiveSelect
                  className={clsx(style.select_mw, `ml-15 font-heading-small text-black`)}
                  isClearable
                  options={TYPES}
                  value={selectedType}
                  styles={customStyles()}
                  placeholder={t(`select type`)}
                  onChange={v => setType(v?.value)}
              />
            </div>

            <div className='d-flex flex-row ml-15'>
              <span className='font-input-label d-flex align-center'>
                {t(`date range`)}
              </span>

              <ResponsiveSelect
                  className={clsx(style.select_mw, `ml-15 font-heading-small text-black`)}
                  isClearable
                  options={dates}
                  value={selectedDate}
                  styles={customStyles()}
                  placeholder={t(`select start date`)}
                  onChange={v => setDate(v?.value)}
              />
            </div>
          </div>

          <div className={clsx(style.flex_space)}>
            <Line
                options={{radius: 0}}
                data={data}
                plugins={chartPlugins(`line`, t(`no data to display`))}
            />
          </div>
        </div>
      </div>
  )
};

const mapStateToProps = () => ({});

export default connect(
    mapStateToProps,
    null
)(withTranslation()(ChartUserAlert));
