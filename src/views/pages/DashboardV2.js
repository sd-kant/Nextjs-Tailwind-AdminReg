import * as React from 'react';
import {withTranslation} from "react-i18next";

import clsx from 'clsx';
import style from './DashboardV2.module.scss';
// import Statistics from "../partials/Statistics";
// import RestBar from "../partials/RestBar";
import MemberTable from "../partials/MemberTable";
import Header from "../partials/Header";
import {MembersProviderV2} from "../../providers/MembersProviderV2";
import MemberOperation from "../partials/MemberOperation";
import StickyComponents from "../partials/StickyComponents";
import useElementSize from "../../hooks/useElementSize";
import {useWidthContext} from "../../providers/WidthProvider";

export const customStyles = (disabled = false) => ({
  menu: (provided) => {
    return {
      ...provided,
      zIndex: 6,
    }
  },
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#DE7D2C' : (state.isFocused ? '#5BAEB6': (state.data.color ?? 'white')),
    zIndex: 6,
    color: 'black',
    fontSize: '21px',
    lineHeight: '24.13px',
  }),
  control: styles => ({
    ...styles,
    border: disabled ? '1px solid #272727' : 'none',
    outline: 'none',
    boxShadow: 'none',
    height: 45,
    backgroundColor: disabled ? '#2f2f2f' : '#272727',
    zIndex: 5,
  }),
  input: styles => ({
    ...styles,
    color: 'white',
    zIndex: 5,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
    zIndex: 5,
  })
});

const DashboardV2 = () => {
  const [setRef, { width }, forceUpdate] = useElementSize();
  const {setTableWidth} = useWidthContext();
  React.useEffect(() => {
    return () => {
      localStorage.setItem('kop-params', location.search);
    };
  }, []);
  React.useEffect(() => {
    setTableWidth(width);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  return (
    <div className={clsx(style.Wrapper)}>
      <Header/>

      <div className={clsx(style.Content)}>
        {/*<div className={clsx(style.InformationalBoard)}>
          <Statistics/>
        </div>*/}

        {/*<div className={clsx(style.RestBar)}>
          <RestBar/>
        </div>*/}

        <div
          className={clsx(style.Table)}
          ref={setRef}
        >
          <MembersProviderV2>
            <>
              <MemberTable
                forceWidthUpdate={forceUpdate}
              />
              <MemberOperation/>
            </>
          </MembersProviderV2>
        </div>
      </div>

      <StickyComponents/>

      <div className={clsx(style.StripeWrapper)} style={{width: `calc(100% - ${width + 40}px)`}}/>
    </div>
  );
};

export default withTranslation()(DashboardV2);
