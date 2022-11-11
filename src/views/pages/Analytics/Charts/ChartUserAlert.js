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
  COLOR_BLUE,
  COLORS,
  METRIC_CHART_USER_VALUES,
  TYPES
} from "../../../../constant";

import clsx from 'clsx';
import style from './Chart.module.scss';
import {useTranslation, withTranslation} from "react-i18next";
import {useAnalyticsContext} from "../../../../providers/AnalyticsProvider";
import {customStyles} from "../../DashboardV2";
import ResponsiveSelect from "../../../components/ResponsiveSelect";
import {chartPlugins, getWeeksInMonth} from "../../../../utils/anlytics";

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
    selectedMembers,
    selectedUser,
    setUser,
    chartData,
  } = useAnalyticsContext();
  const {t} = useTranslation();

  const [type, setType] = React.useState(1);
  const [dates, setDates] = React.useState(null);
  const [date, setDate] = React.useState(null);
  const selectedType = React.useMemo(() => {
    let dateList = getWeeksInMonth();
    dateList = type === 1 ? dateList.dates : type === 2 ? dateList.weeks : [];
    setDates(dateList);
    setDate(dateList?.length > 0 ? dateList[0].value : null);
    return TYPES?.find(it => it.value?.toString() === type?.toString());
  }, [type]);
  const selectedDate = React.useMemo(() => {
    return dates?.find(it => it.value?.toString() === date?.toString());
  }, [date, dates]);

  const [data, setData] = React.useState({
    labels: [],
    datasets: [
      {
        label: `${selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? 'CBT' : 'Hr'}`,
        data: [],
        borderWidth: 4,
        borderColor: selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? COLORS[2] : COLOR_BLUE,
        backgroundColor: selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? COLORS[2] : COLOR_BLUE,
      },
    ],
  });

  React.useEffect(() => {
    if (selectedDate) {
      let labels = [], tempData = [];
      let start = new Date(selectedDate.label);
      start.setHours(new Date().getHours(), new Date().getMinutes());
      let end = new Date(start), endDayOfWeek = new Date(start);
      end.setDate(new Date(end).getDate() + 1);
      endDayOfWeek.setDate(new Date(endDayOfWeek).getDate() + 7);

      chartData?.forEach(it => {
        if (
            (selectedType.value === 1 && new Date(it.ts).getTime() >= new Date(start).getTime() && new Date(it.ts).getTime() < new Date(end).getTime()) ||
            (selectedType.value === 2 && new Date(it.ts).getTime() >= new Date(start).getTime() && new Date(it.ts).getTime() < new Date(endDayOfWeek).getTime())
        ) {
          labels.push(new Date(it.ts).toLocaleDateString('en-us', {
            day: "numeric",
            hour: "numeric",
            hour12: false,
            minute: "2-digit",
            second: "2-digit"
          }));
          tempData.push(selectedMetric.value === METRIC_CHART_USER_VALUES[0] ? it?.heartCbtAvg : it?.heartRateAvg);
        }
      });
      labels.reverse();
      tempData.reverse();

      setData({
        labels,
        datasets: [
          {
            label: `${selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? 'CBT' : 'Hr'}`,
            data: tempData,
            borderWidth: 4,
            borderColor: selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? COLORS[2] : COLOR_BLUE,
            backgroundColor: selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? COLORS[2] : COLOR_BLUE,
          },
        ],
      })
    }
  }, [chartData, selectedMetric, selectedType, selectedDate]);

  return (
      <div className={clsx(style.chart_body)}>
        <div className={clsx(style.line_body)}>
          <h1 className={clsx(style.txt_center)}>{t(`${selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? 'cbt' : 'hr'}`)}</h1>
          <div className={clsx(style.line_flex, 'mb-15')}>
            {
              selectedMembers?.length > 0 ?
                  <div className={"d-flex flex-row"}>
                    <span className='font-input-label d-flex align-center'>
                      {t("users")}
                    </span>

                    <ResponsiveSelect
                        className={clsx(style.select_mw, 'ml-15 font-heading-small text-black')}
                        isClearable
                        options={selectedMembers}
                        value={selectedUser}
                        styles={customStyles()}
                        placeholder={t("select user")}
                        onChange={v => setUser(v?.value)}
                    />
                  </div> : <div/>
            }
            <div className='d-flex flex-row ml-15'>
              <span className='font-input-label d-flex align-center'>
                {t("types")}
              </span>

              <ResponsiveSelect
                  className={clsx(style.select_mw, 'ml-15 font-heading-small text-black')}
                  isClearable
                  options={TYPES}
                  value={selectedType}
                  styles={customStyles()}
                  placeholder={t("select type")}
                  onChange={v => setType(v?.value)}
              />
            </div>

            <div className='d-flex flex-row ml-15'>
              <span className='font-input-label d-flex align-center'>
                {t('date range')}
              </span>

              <ResponsiveSelect
                  className={clsx(style.select_mw, 'ml-15 font-heading-small text-black')}
                  isClearable
                  options={dates}
                  value={selectedDate}
                  styles={customStyles()}
                  placeholder={t("select start date")}
                  onChange={v => setDate(v?.value)}
              />
            </div>
          </div>

          <div className={clsx(style.flex_space)}>
            <Line options={{radius: 0}} data={data} plugins={chartPlugins('line', t('no data to display'))}/>
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
