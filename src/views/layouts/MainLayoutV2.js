import * as React from 'react';
import logo from '../../assets/images/logo_light.svg';
// import SearchInput from "../components/SearchInput";
import 'reactjs-popup/dist/index.css';
import Settings from "../components/Settings";
import closeIcon from '../../assets/images/close-white.svg';
import menuIcon from '../../assets/images/menu.svg';

import clsx from 'clsx';
import style from './MainLayoutV2.module.scss';
import {useWidthContext} from "../../providers/WidthProvider";
import LanguagePickerV2 from "../components/LanguagePickerV2";

const MenuContent = () => {
  return (
    <>
      {/*<SearchInput/>*/}
      <LanguagePickerV2/>
      <Settings mode="dashboard"/>
    </>
  )
};

const MainLayoutV2 = (
  {
    children,
  }) => {
  const [menuOpened, setMenuOpened] = React.useState(false);
  const {tableWidth} = useWidthContext();

  return (
    <div className={clsx(style.Wrapper, 'content')}>
      <div className={clsx(style.Navbar)}>
        <div className={clsx(style.NavbarMain)} style={{width: `${tableWidth}px`}}>
          <img src={logo} alt="logo"/>

          <div className={clsx(style.RightArea)}>
            <img
              className={clsx(style.MenuIcon)}
              src={menuOpened ? closeIcon : menuIcon} alt="close icon"
              onClick={() => setMenuOpened(prevState => !prevState)}
            />
            <div className={clsx(style.RightAreaContent)}>
              <MenuContent/>
            </div>
          </div>
        </div>

        {
          menuOpened &&
          <div className={clsx(style.MenuDropdown)}>
            <div className={clsx(style.MenuContent)}>
              <MenuContent/>
            </div>
          </div>
        }
      </div>

      <div className={clsx(style.Content, 'content--inner')}>
        {children}
      </div>
    </div>
  )
};

export default MainLayoutV2;