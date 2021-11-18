import React from 'react';
import {connect} from "react-redux";
import stripes from "../../assets/images/stripes.svg";
import padTopStripes from "../../assets/images/pad-top-stripes.svg"
import padBottomStripes from "../../assets/images/pad-bottom-stripes.svg";
import mediumPadStripes from "../../assets/images/pad-stripes.svg";
import smallStripes from "../../assets/images/small-stripes.svg";
import {get} from "lodash";
import Footer from "./Footer";
import LanguagePicker from "../components/LanguagePicker";
import LogoutButton from "../components/LogoutButton";
import ReInviteButton from "../components/ReInviteButton";
import clsx from "clsx";
import style from "./SignInLayout.module.scss";

const SignInLayout = (props) => {
  const {loggedIn} = props;
  return (
    <div className='wrapper'>
      <LanguagePicker/>
      {loggedIn && <LogoutButton/>}
      {
        loggedIn &&
        <div className={clsx(style.ReInviteWrapper)}>
          <ReInviteButton/>
        </div>
      }

      <div className='content-wrapper'>
        <div className="desktop-stripes">
          <img src={stripes} alt="stripes"/>
        </div>

        <div className="pad-stripes">
          <img src={padTopStripes} alt="pad-top-stripes"/>
          <img src={padBottomStripes} alt="pad-bottom-stripes"/>
        </div>

        <div className="medium-pad-stripes">
          <img src={mediumPadStripes} alt="pad-stripes"/>
        </div>

        <div className="phone-stripes">
          <img src={smallStripes} alt="small-stripes"/>
        </div>

        <div className='rest-bar'>
          <div className={`progress ${props.restBarClass}`}>

          </div>
        </div>
        {
          props.children
        }
      </div>

      <Footer
        loggedIn={loggedIn}
      />
    </div>
  )
}

const mapStateToProps = (state) => ({
  restBarClass: get(state, "ui.restBarClass"),
});

export default connect(
  mapStateToProps,
  null
)(SignInLayout);