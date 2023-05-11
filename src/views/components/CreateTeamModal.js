import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CreateTeamModal = (props) => {
  const show = props.show;
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  const isValid = () => {
    return name && notes;
  };

  return (
    <div className={`modal ${show ? 'd-block' : 'd-none'}`} style={{ padding: '65px' }}>
      <div className="close-icon" />

      <div className="modal-header">
        <span className="font-modal-header text-white">{t('create team')}</span>
      </div>

      <div className="modal-subheader mt-10">
        <span className="font-binary text-white">{t('create team description')}</span>
      </div>

      <div className="modal-body mt-40">
        <div className="input-group">
          <label className="font-input-label">{t('team name')}</label>

          <input
            className="input modal-input mt-10 font-heading-small text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="input-group mt-50">
          <label className="font-input-label">{t('additional notes')}</label>

          <textarea
            className="input modal-input pt-22 mt-10 font-heading-small text-white"
            style={{ height: '105px' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="modal-footer mt-119 d-flex justify-end">
        <button
          className={`button ${isValid() ? 'active cursor-pointer' : 'inactive cursor-default'}`}
          onClick={isValid() ? props.onOk : null}
        >
          <span className="font-button-label text-white">{t('next')}</span>
        </button>
      </div>
    </div>
  );
};

export default CreateTeamModal;
