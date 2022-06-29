import React from "react";
import closeIcon from "../../../assets/images/close.svg";
import style from "./LanguageModal.module.scss";
import clsx from "clsx";
import LanguagePicker from "../LanguagePicker";

const LanguageModal = (
  {
    show,
    header,
    subheader,
    onCancel,
  }) => {
  return (
    <div className={clsx(style.Overlay, show ? "d-block" : "d-none")}>
      <div className={clsx(style.Modal, `z-index-2 ${show ? "d-block" : "d-none"}`)}>
        <img src={closeIcon} className={clsx(style.CloseIcon)} alt="close icon" onClick={onCancel}/>
        <div className={clsx(style.ModalHeader, "text-center")}>
        <span className={"font-modal-header text-white"}>
          {header}
        </span>
        </div>

        <div className={clsx(style.ModalSubheader, "mt-10 text-center")}>
        <span className="font-binary text-white">
          {subheader}
        </span>
        </div>

        <div className={clsx(style.ModalBody, "mt-40")}>
          <div className="d-flex justify-center">
            <LanguagePicker/>
          </div>
        </div>

      </div>
    </div>
  )
}

export default LanguageModal;