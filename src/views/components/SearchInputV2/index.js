import * as React from 'react';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import style from './SearchInput.module.scss';
import searchIcon from '../../../assets/images/search.svg';
import clearIcon from '../../../assets/images/close-white.svg';

const SearchInputV2 = ({ t, keyword, visibleClearIcon, onChange, onClear, placeholder }) => {
  return (
    <div className={clsx(style.Wrapper)}>
      <img className={clsx(style.SearchIcon)} src={searchIcon} alt="search icon" />
      <input
        className={clsx(style.Input)}
        placeholder={t(placeholder || 'search input placeholder')}
        value={keyword}
        onChange={onChange}
      />
      {visibleClearIcon && (
        <img className={clsx(style.ClearIcon)} src={clearIcon} alt="clear icon" onClick={onClear} />
      )}
    </div>
  );
};

export default withTranslation()(SearchInputV2);
