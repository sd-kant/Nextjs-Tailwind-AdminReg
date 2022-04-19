import React, {useState, useEffect, useRef} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation, Trans} from "react-i18next";
import backIcon from "../../../assets/images/back.svg";
import uploadIcon from "../../../assets/images/upload-fire.svg";
import readXlsxFile from 'read-excel-file'
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction, showSuccessNotificationAction
} from "../../../redux/action/ui";
import clsx from "clsx";
import style from "./FormUpload.module.scss";
import {useNavigate} from "react-router-dom";

const FormUpload = (props) => {
  const {t, setRestBarClass, showErrorNotification, id, organizationId} = props;
  const [hover, setHover] = useState(false);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass("progress-72 medical");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (csvLoaded) {
      navigate(`/invite/${organizationId}/edit/upload/${id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvLoaded]);

  const DropZone = () => {
    return (
      <div
        className={clsx(style.DropZoneArea, hover ? style.Hover : "")}
        onClick={fileInputClicked}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img src={uploadIcon} alt="upload icon"/>

        <span className={clsx(style.DropZoneLabel)}>
                {t("upload csv")}
              </span>
      </div>
    );
  };

  const filesSelected = () => {
    const selectedFile = fileInputRef.current?.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        readXlsxFile(selectedFile).then((rows) => {
          if (!(rows?.length > 1)) {
            showErrorNotification(t("msg csv content empty"));
            console.log("file content empty");
          }

          rows.splice(0, 1);
          const xlsxData = rows.map(it => ({
            firstName: it[0],
            lastName: it[1],
            email: it[2],
            countryCode: it[3],
            phoneNumber: it[4],
            jobRole: it[5],
            permissionLevel: it[6],
          }));
          localStorage.setItem("kop-csv-data", JSON.stringify(xlsxData));
          setCsvLoaded(true);
        });
      } else {
        showErrorNotification(t("msg csv content error"));
        console.log("file content error");
      }
    }
  }

  const fileInputClicked = () => {
    fileInputRef.current.click();
  }

  const validateFile = (file) => {
    const validTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
    return validTypes.indexOf(file.type) !== -1
  }

  return (
    <div className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigate(`/invite/${organizationId}/select/${id}`)}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
              {t("previous")}
            </span>
        </div>

        <div className='mt-28 form-header-medium'>
            <span className='font-header-medium d-block'>
              {t("upload description")}
            </span>
        </div>

        <div className="mt-40 d-flex">
          <div className={clsx(style.DropZone)}>
            <DropZone/>
            <input
              ref={fileInputRef}
              className={clsx(style.FileInput)}
              type="file"
              accept=".xls,.xlsx"
              onChange={filesSelected}
            />
          </div>
        </div>

        <div className="mt-10">
          <span className="font-binary">
            <Trans
              i18nKey='upload guide'
              components={{
                a: <a
                  className="text-orange no-underline cursor-pointer"
                  href="https://kenzen0.sharepoint.com/:x:/s/Marketing/EWMoBTc5y85Bp_nkLy7CM54BpfGha7tGsbFox_axLVmQpA"
                  target="_blank"
                  rel="noreferrer"
                />
              }}
            />
          </span>
        </div>
      </div>

      <div className='mt-80 form-header-medium'>
        <span className='font-binary mt-8'>
        </span>
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      setVisibleSuccessModal: setVisibleSuccessModalAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(FormUpload));