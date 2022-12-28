import * as React from 'react';
import clsx from 'clsx';
import style from './Pagination.module.scss';
import goEndIcon from '../../../assets/images/go_end.svg';
import goEndDisabledIcon from '../../../assets/images/go_end_disabled.svg';
import goNextIcon from '../../../assets/images/go_next.svg';
import goNextDisabledIcon from '../../../assets/images/go_next_disabled.svg';

const Pagination = (
  {
    page = 3,
    size = 50,
    length = 500,
    onClickNext = () => {},
    onClickPrev = () => {},
    onClickEnd = () => {},
    onClickStart = () => {},
  }) => {
  const firstPage = page === 1;
  const lastPage = Math.ceil(length / size) === page;
  const start = ((page - 1) * size) + 1;
  const end = page * size > length ? length : page * size;

  return (
    <div className={clsx(style.Wrapper)}>
      {
        start > 0 ?
          <React.Fragment>
            <div className={clsx(style.Label)}><span className="font-binary text-white">{`${start} - ${end} of ${length}`}</span>
            </div>

            <div className={clsx(style.Icons)}>
              <img
                className={clsx(style.Icon, style.GoEndIcon, style.Reverse, firstPage ? style.Disabled : style.Active)}
                src={firstPage ? goEndDisabledIcon : goEndIcon} alt="go end icon"
                onClick={firstPage ? null : onClickStart}
              />
              <img
                className={clsx(style.Icon, style.GoNextIcon, style.Reverse, firstPage ? style.Disabled : style.Active)}
                src={firstPage ? goNextDisabledIcon : goNextIcon} alt="go next icon"
                onClick={firstPage ? null : onClickPrev}
              />
              <img
                className={clsx(style.Icon, style.GoNextIcon, lastPage ? style.Disabled : style.Active)}
                src={lastPage ? goNextDisabledIcon : goNextIcon} alt="go next icon"
                onClick={lastPage ? null : onClickNext}
              />
              <img
                className={clsx(style.Icon, style.GoEndIcon, lastPage ? style.Disabled : style.Active)}
                src={lastPage ? goEndDisabledIcon : goEndIcon} alt="go end icon"
                onClick={lastPage ? null : onClickEnd}
              />
            </div>
          </React.Fragment> : null
      }
    </div>
  )
};

export default Pagination;