import * as React from 'react';
import { connect } from 'react-redux';

import clsx from 'clsx';
import style from './QueryResult.module.scss';
import ResultTableHeader from './ResultTableHeader';
import ResultTableBody from './ResultTableBody';
import { get } from 'lodash';
// import Toggle from '../../components/Toggle';
import { useAnalyticsContext } from '../../../providers/AnalyticsProvider';
import ResponsiveSelect from '../../components/ResponsiveSelect';
import { customStyles } from '../team/dashboard/DashboardV2';
import exportIcon from '../../../assets/images/export.svg';
import Toolbar from './Toolbar';
import { useTranslation } from 'react-i18next';
import ChartTeamDoughnut from './Charts/ChartTeamDoughnut';
import ChartTeamVerticalBar from './Charts/ChartTeamVerticalBar';
import ChartHighestCBT from './Charts/ChartHighestCBT';
import ChartUserAlert from './Charts/ChartUserAlert';
import {
  EXPORT_OPTIONS,
  METRIC_TEAM_CHART_VALUES,
  METRIC_TEAM_TABLE_VALUES,
  METRIC_USER_CHART_VALUES,
  METRIC_USER_TABLE_VALUES
} from '../../../constant';
import { checkMetric, getKeyApiCall } from '../../../utils/anlytics';
import ChartCBTZones from './Charts/ChartCBTZones';
import ChartMaximumCBT from './Charts/ChartMaximumCBT';

const QueryResult = ({ metric }) => {
  const {
    // statsBy,
    // setStatsBy,
    visibleExport,
    exportOption,
    setExportOption,
    handleExport,
    selectedMetric,
    organizationAnalytics
  } = useAnalyticsContext();
  const { t } = useTranslation();
  const ableToExport = visibleExport > 0 && Boolean(exportOption);

  const ChartComponent = React.useMemo(() => {
    if (
      selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM_SWEAT ||
      selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM_HEAT ||
      selectedMetric?.value === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE ||
      selectedMetric?.value === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE
    )
      return <ChartTeamDoughnut />;
    else if (
      selectedMetric?.value === METRIC_USER_TABLE_VALUES.ALERTS ||
      selectedMetric?.value === METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK
    )
      // 2, 31
      return <ChartTeamVerticalBar />;
    else if (selectedMetric?.value === METRIC_TEAM_TABLE_VALUES.USERS_IN_VARIOUS_CBT_ZONES)
      return <ChartCBTZones />;
    else if (selectedMetric?.value === METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK)
      // 32
      return <ChartHighestCBT />;
    else if (checkMetric(METRIC_USER_CHART_VALUES, selectedMetric?.value))
      // 40, 41
      return <ChartUserAlert />;
    else if (METRIC_TEAM_CHART_VALUES.DAY_MAXIMUM_CBT === selectedMetric?.value) {
      return <ChartMaximumCBT />;
    } else return <div />;
  }, [selectedMetric]);

  const checkTableChartTogether = () => {
    if (!selectedMetric) return false;
    else {
      return [
        METRIC_USER_TABLE_VALUES.SWR_ACCLIM_SWEAT,
        METRIC_USER_TABLE_VALUES.SWR_ACCLIM_HEAT,
        METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE,
        METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE,
        METRIC_USER_TABLE_VALUES.ALERTS,
        METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK,
        METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK,
        METRIC_TEAM_TABLE_VALUES.USERS_IN_VARIOUS_CBT_ZONES
      ].includes(selectedMetric?.value);
    }
  };

  return (
    <div className={clsx(style.Wrapper)}>
      <div className={clsx(checkTableChartTogether() ? style.WrapperTableChart : style.WrapperTbl)}>
        {selectedMetric?.value &&
          Object.keys(organizationAnalytics).includes(
            getKeyApiCall(selectedMetric?.value).keys[0]
          ) && (
            <>
              {![
                METRIC_USER_CHART_VALUES.CBT,
                METRIC_USER_CHART_VALUES.HR,
                METRIC_TEAM_CHART_VALUES.DAY_MAXIMUM_CBT
              ].includes(selectedMetric?.value) && (
                <div
                  className={clsx(
                    checkTableChartTogether() ? style.InnerWrapper : style.CenterWrapper
                  )}>
                  <Toolbar />
                  <div className={clsx(style.TableWrapper)}>
                    <table className={clsx(style.Table)}>
                      <ResultTableHeader metric={metric} />
                      <ResultTableBody metric={metric} />
                    </table>
                  </div>
                </div>
              )}
              {ChartComponent}
            </>
          )}
      </div>

      <div className={clsx(style.StatsSelectWrapper)}>
        {visibleExport > 0 && (
          <div className={clsx(style.ExportWrapper)}>
            <ResponsiveSelect
              className="font-heading-small text-black"
              isClearable
              options={EXPORT_OPTIONS}
              value={exportOption}
              maxMenuHeight={190}
              menuPortalTarget={document.body}
              menuPosition={'fixed'}
              placeholder={t('export')}
              styles={customStyles()}
              onChange={(v) => setExportOption(v)}
            />
            <img
              src={exportIcon}
              className={clsx(!ableToExport ? style.Disabled : null)}
              alt="export icon"
              onClick={() => (ableToExport ? handleExport() : null)}
            />
          </div>
        )}
        <div />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.measure')
});

export default connect(mapStateToProps, null)(QueryResult);
