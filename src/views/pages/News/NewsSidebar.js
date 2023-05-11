import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import style from './NewsSidebar.module.scss';

import { getParamFromUrl } from '../../../utils';
import { useNewsContext } from '../../../providers/NewsProvider';
import { useTranslation } from 'react-i18next';

const NewsSidebar = () => {
  const { data, keyword, setKeyword, categoryId, setCategoryId } = useNewsContext();
  const { t } = useTranslation();

  const [keywordTmp, setKeywordTmp] = React.useState(keyword ?? '');
  const id = getParamFromUrl('id');

  const onSelectCategory = (val) => {
    setCategoryId(val);
  };

  return (
    <div className={clsx(style.SidebarBody)}>
      <div className={clsx(style.SearchBody)}>
        <input
          className={clsx(style.SearchInputWrapper)}
          value={keywordTmp ?? ''}
          onChange={(e) => setKeywordTmp(e.target.value)}
          onKeyUp={(e) => (e.keyCode === 13 ? setKeyword(keywordTmp ?? '') : null)}
        />
        <div
          className={clsx(style.SearchBtn, 'capitalize')}
          onClick={() => setKeyword(keywordTmp ?? '')}
        >
          {t('search')}
        </div>
      </div>

      <div className={clsx(style.RecentTxt)}>{t('recent')}</div>
      <div className={clsx(style.RecentLinkBody)}>
        {data?.posts?.map((item, key) => {
          if (key > 4) return null;

          return (
            <div key={key} className={clsx(style.BlogLink)}>
              <Link
                to={`/news/detail?id=${item?.id}`}
                className={id && Number(id) === item?.id ? clsx(style.Active) : ''}
              >
                {item?.title ?? ''}
              </Link>
            </div>
          );
        })}
      </div>

      <div className={clsx(style.RecentTxt, style.SubjectTxt)}>{t('subject')}</div>

      <select value={categoryId} onChange={(e) => onSelectCategory(e.target.value || '')}>
        <option value="" disabled>
          {t('select category')}
        </option>
        {data?.categories?.map((item, key) => {
          return (
            <option key={key} value={item?.id}>
              {item?.name ?? ''}
            </option>
          );
        })}
      </select>
    </div>
  );
};
export default NewsSidebar;
