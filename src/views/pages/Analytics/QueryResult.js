import * as React from "react";
import {connect} from "react-redux";

import clsx from "clsx";
import style from "./QueryResult.module.scss";
import ResultTableHeader from "./ResultTableHeader";
import ResultTableBody from "./ResultTableBody";
import {get} from "lodash";
import Toggle from "../../components/Toggle";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import {customStyles} from "../DashboardV2";
import exportIcon from "../../../assets/images/export.svg";
import Toolbar from "./Toolbar";
import {useTranslation} from "react-i18next";
import ChartTeamDoughnut from "./Charts/ChartTeamDoughnut";
import ChartTeamVerticalBar from "./Charts/ChartTeamVerticalBar";
import ChartHighestCBT from "./Charts/ChartHighestCBT";
import ChartUserAlert from "./Charts/ChartUserAlert";
import {
  EXPORT_OPTIONS,
  METRIC_TEAM_CHART_VALUES,
  METRIC_TEAM_TABLE_VALUES,
  METRIC_USER_CHART_VALUES,
  METRIC_USER_TABLE_VALUES
} from "../../../constant";
import {
  checkMetric,
  getKeyApiCall
} from "../../../utils/anlytics";

const QueryResult = (
    {
      metric,
    }) => {
  const {
    statsBy,
    setStatsBy,
    visibleExport,
    exportOption,
    setExportOption,
    handleExport,
    selectedMetric,
    organizationAnalytics,
  } = useAnalyticsContext();
  const {t} = useTranslation();
  const ableToExport = visibleExport && Boolean(exportOption);

  const ChartComponent = React.useMemo(() => {
    if (
        selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM ||
        selectedMetric?.value === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE ||
        selectedMetric?.value === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE ||
        selectedMetric?.value === METRIC_TEAM_CHART_VALUES.HEAT_SUSCEPTIBILITY_SWEAT_RATE
    ) // 5, 23, 24, 30
      return <ChartTeamDoughnut/>;
    else if (
        selectedMetric?.value === METRIC_USER_TABLE_VALUES.ALERTS ||
        selectedMetric?.value === METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK
    ) // 2, 31
      return <ChartTeamVerticalBar/>;
    else if (
        selectedMetric?.value === METRIC_USER_TABLE_VALUES.MAX_HEART_CBT ||
        selectedMetric?.value === METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK
    ) // 3, 32
      return <ChartHighestCBT/>;
    else if (checkMetric(METRIC_USER_CHART_VALUES, selectedMetric?.value)) // 40, 41
      return <ChartUserAlert/>;
    else return <div />;
  }, [selectedMetric]);

  const checkTableChartTogether = () => {
    if (!selectedMetric) return false;
    else {
      return (
          [
            METRIC_USER_TABLE_VALUES.SWR_ACCLIM,
            METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE,
            METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE,
            METRIC_TEAM_CHART_VALUES.HEAT_SUSCEPTIBILITY_SWEAT_RATE,
            METRIC_USER_TABLE_VALUES.ALERTS,
            METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK,
            METRIC_USER_TABLE_VALUES.MAX_HEART_CBT,
            METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK,
          ].includes(selectedMetric?.value)
      )
    }
  };

  return (
      <div className={clsx(style.Wrapper)}>
        <div className={clsx(checkTableChartTogether() ? style.WrapperTableChart : style.WrapperTbl)}>
          {
            selectedMetric?.value && Object.keys(organizationAnalytics).includes(getKeyApiCall(selectedMetric?.value).keys[0]) && (
                <>
                  {
                    !checkMetric(METRIC_USER_CHART_VALUES, selectedMetric?.value) && (
                        <div className={clsx(checkTableChartTogether() ? style.InnerWrapper : style.CenterWrapper)}>
                          <Toolbar/>
                          <div className={clsx(style.TableWrapper)}>
                            <table className={clsx(style.Table)}>
                              <ResultTableHeader metric={metric}/>
                              <ResultTableBody metric={metric}/>
                            </table>
                          </div>
                        </div>
                    )
                  }
                  {ChartComponent}
                </>
            )
          }
        </div>

        <div className={clsx(style.StatsSelectWrapper)}>
          <div>
            <Toggle
                on={statsBy === 'team'}
                titleOn={t("user")}
                titleOff={t("team")}
                handleSwitch={v => {
                  setStatsBy(v ? 'team' : 'user');
                }}
            />
          </div>
          {
            visibleExport &&
            <div className={clsx(style.ExportWrapper)}>
              <ResponsiveSelect
                  className='font-heading-small text-black'
                  isClearable
                  options={EXPORT_OPTIONS}
                  value={exportOption}
                  maxMenuHeight={190}
                  menuPortalTarget={document.body}
                  menuPosition={'fixed'}
                  placeholder={t('export')}
                  styles={customStyles()}
                  onChange={v => setExportOption(v)}
              />
              <img
                  src={exportIcon}
                  className={clsx(!ableToExport ? style.Disabled : null)}
                  alt="export icon"
                  onClick={() => ableToExport ? handleExport() : null}
              />
            </div>
          }
          <div/>
        </div>
      </div>
  )
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric'),
});

export default connect(
    mapStateToProps,
    null
)(QueryResult);
