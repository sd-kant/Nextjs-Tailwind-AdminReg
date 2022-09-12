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

const QueryResult = (
  {
    metric,
  }) => {
  const {statsBy, setStatsBy, visibleExport, exportOptions, exportOption, setExportOption} = useAnalyticsContext();

  return (
    <div className={clsx(style.Wrapper)}>
      <div className={clsx(style.InnerWrapper)}>
        <div className={clsx(style.TableWrapper)}>
          <table className={clsx(style.Table)}>
            <ResultTableHeader metric={metric}/>
            <ResultTableBody metric={metric}/>
          </table>
        </div>
      </div>

      <div className={clsx(style.StatsSelectWrapper)}>
        <div>
          <Toggle
            on={statsBy === 'team'}
            titleOn={'User'}
            titleOff={'Team'}
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
              options={exportOptions}
              value={exportOption}
              maxMenuHeight={190}
              menuPortalTarget={document.body}
              menuPosition={'fixed'}
              styles={customStyles()}
              onChange={v => setExportOption(v)}
            />
            <img src={exportIcon} className={clsx(!Boolean(exportOption) ? style.Disabled : null)} alt="export icon"/>
          </div>
        }
        <div/>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric'),
});

export default connect(
  mapStateToProps,
  null
)(QueryResult);
