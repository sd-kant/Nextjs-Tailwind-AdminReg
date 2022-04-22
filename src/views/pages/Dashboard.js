import React from "react";
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import {bindActionCreators} from "redux";
import SuccessModal from "../components/SuccessModal";
import {get} from 'lodash';
import {setVisibleSuccessModalAction} from "../../redux/action/ui";
import {logout} from "../layouts/MainLayout";
import {useNavigate} from "react-router-dom";

const Dashboard = (props) => {
  const {visibleSuccessModal, setVisibleSuccessModal} = props;
  const navigate = useNavigate();

  return (
    <div>
      <SuccessModal
        show={visibleSuccessModal}
        onCancel={() => {
          setVisibleSuccessModal(false);
          navigate("/invite/company");
        }}
        onOk={() => {
          setVisibleSuccessModal(false);
          logout();
        }}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  visibleSuccessModal: get(state, 'ui.visibleSuccessModal'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setVisibleSuccessModal: setVisibleSuccessModalAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(Dashboard));