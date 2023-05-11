import * as React from 'react';
import { connect } from 'react-redux';

import clsx from 'clsx';
import style from './Toolbar.module.scss';
import { useTranslation, withTranslation } from 'react-i18next';
import { useAnalyticsContext } from '../../../providers/AnalyticsProvider';
import { useWidthContext } from '../../../providers/WidthProvider';
import Pagination from '../../components/Pagination';

const Toolbar = () => {
  const { data, page, setPage, sizePerPage, setSizePerPage, detailCbt, setDetailCbt } =
    useAnalyticsContext();
  const { t } = useTranslation();
  const { tableWidth } = useWidthContext();

  const handleClickEnd = React.useCallback(() => {
    setPage(Math.ceil(data?.length / sizePerPage));
  }, [setPage, sizePerPage, data]);

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
      <div className={clsx(style.Second)}>
        <div className={clsx(style.PaginationWrapper)}>
          {detailCbt && (
            <button className={clsx(style.BtnBack)} onClick={() => setDetailCbt(null)}>
              <span className={clsx(style.TxtEllipse1)}>{t('back')}</span>
            </button>
          )}
          <React.Fragment>
            {data?.length > 0 && (
              <Pagination
                page={page}
                size={sizePerPage}
                length={data?.length}
                onClickEnd={handleClickEnd}
                onClickNext={handleClickNext}
                onClickPrev={handleClickPrev}
                onClickStart={handleClickStart}
              />
            )}
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
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = () => ({});

export default connect(mapStateToProps, null)(withTranslation()(Toolbar));
