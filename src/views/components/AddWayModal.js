import React from "react";
import {useTranslation} from "react-i18next";
import editIcon from "../../assets/images/edit-fire.svg";
import uploadIcon from "../../assets/images/upload-fire.svg";

const AddWayModal = (props) => {
  const show = props.show;
  const {t} = useTranslation();

  return (
    <div className={`modal ${show ? "d-block" : "d-none"}`} style={{padding: "65px"}}>
      <div className="close-icon close-icon-sm" />

      <div className="modal-header">
        <span className="add-way-modal-header text-white">
          {t("add way header")}
        </span>
      </div>

      <div className="modal-subheader mt-10">
        <span className="font-binary text-white">
          {t("add way description")}
        </span>
      </div>

      <div className="modal-body mt-60">
        <div className="d-flex justify-center tap-area">
          <div
            className={`tap cursor-pointer`}
            style={{background: "#212121"}}
            onClick={props.onOk}
          >
            <img src={editIcon} alt="edit icon"/>

            <span className='font-binary mt-8'>
            {t("manual")}
          </span>
          </div>

          <div
            className={`ml-40 cursor-pointer tap`}
            style={{background: "#212121"}}
          >
            <img src={uploadIcon} alt="upload icon"/>

            <span className='font-binary mt-8 capitalize'>
              {t("upload")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
};

export default AddWayModal;