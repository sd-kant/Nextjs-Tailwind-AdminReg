import * as React from 'react';
import logo from '../../assets/images/logo_light.svg';
import 'reactjs-popup/dist/index.css';
import Settings from "../components/Settings";

import clsx from 'clsx';
import style from './MainLayoutV2.module.scss';
import {useWidthContext} from "../../providers/WidthProvider";
import {useLocation} from "react-router-dom";

const MenuContent = () => {
  const location = useLocation();
  const mode = React.useMemo(() => {
    if (location.pathname.includes("analytics")) {
      return "analytics";
    } else if (location.pathname.includes("dashboard")) {
      return "dashboard";
    } else {
      return "admin";
    }
  }, [location.pathname]);
  return (
      <Settings mode={mode}/>
  )
};

const MainLayoutV2 = (
  {
    children,
  }) => {
  const {tableWidth} = useWidthContext();

  return (
    <div className={clsx(style.Wrapper, 'content')}>
      <div className={clsx(style.Navbar)}>
        <div className={clsx(style.NavbarMain)} style={{width: `${tableWidth}px`}}>
          <img src={logo} alt="logo"/>

          <div className={clsx(style.RightArea)}>
            <div className={clsx(style.RightAreaContent)}>
              <MenuContent/>
            </div>
          </div>
        </div>
      </div>

      <div className={clsx(style.Content, 'content--inner')}>
        {children}
      </div>
    </div>
  )
};

export default MainLayoutV2;