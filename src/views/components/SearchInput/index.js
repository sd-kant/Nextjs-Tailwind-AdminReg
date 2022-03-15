import * as React from 'react';
import {withTranslation} from "react-i18next";
import clsx from 'clsx';
import style from './SearchInput.module.scss';
import searchIcon from '../../../assets/images/search.svg';

const SearchInput = (
  {
    t,
    keyword,
    onChange,
  }) => {
  return (
    <div className={clsx(style.Wrapper)}>
      <img className={clsx(style.SearchIcon)} src={searchIcon} alt="search icon"/>
      <input
        className={clsx(style.Input)}
        placeholder={t("search input placeholder")}
        value={keyword}
        onChange={onChange}
      />
    </div>
  )
}

export default withTranslation()(SearchInput);