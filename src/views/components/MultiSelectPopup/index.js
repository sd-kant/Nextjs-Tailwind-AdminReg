import React from 'react';
import { useTranslation } from 'react-i18next';
import style from './MultiSelectPopup.module.scss';
import clsx from 'clsx';
import Modal from 'react-modal';
import Checkbox from '../Checkbox';
import Button from '../Button';
import { isEqual } from 'lodash';
import closeIcon from '../../../assets/images/close.svg';
import SearchInput from '../SearchInput';

const MultiSelectPopup = ({ label, options, value, onChange }) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [checkedItems, setCheckedItems] = React.useState(value);
  const [keyword, setKeyword] = React.useState('');

  React.useEffect(() => {
    setCheckedItems(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const handleChange = (id, checked) => {
    if (checkedItems?.some((it) => it.value?.toString() === id?.toString())) {
      if (!checked) {
        setCheckedItems(checkedItems?.filter((it) => it.value?.toString() !== id?.toString()));
      }
    } else {
      if (checked) {
        setCheckedItems([
          ...(checkedItems ?? []),
          options?.find((it) => it.value?.toString() === id?.toString())
        ]);
      }
    }
  };

  const matches = React.useMemo(() => {
    return options?.filter((option) => option.label.toLowerCase().includes(keyword.toLowerCase()));
  }, [options, keyword]);

  return (
    <>
      <div
        className={clsx(
          style.Control,
          value?.length === 0 ? style.No : style.Yes,
          'font-heading-small'
        )}
        onClick={() => setOpen(true)}>
        <span>{label}</span>
        {options?.length > 0 ? (
          <div className={clsx(style.Indicator)}>
            <div className={clsx(style.Line)} />
            <div style={{ height: '20px' }}>
              <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path
                  d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
                  fill="#cccccc"
                />
              </svg>
            </div>
          </div>
        ) : null}
      </div>
      <Modal
        isOpen={open}
        className={clsx(style.Modal)}
        overlayClassName={clsx(style.ModalOverlay)}
        onRequestClose={() => setOpen(false)}
        appElement={document.getElementsByTagName('body')}>
        <div className={clsx(style.Wrapper)}>
          <img
            className={clsx(style.CloseIcon)}
            src={closeIcon}
            alt="close icon"
            onClick={() => setOpen(false)}
          />
          <div className={clsx(style.Body)}>
            <div className={clsx(style.SearchInputWrapper)}>
              <SearchInput
                keyword={keyword}
                visibleClearIcon={keyword?.trim() !== ''}
                onChange={(e) => setKeyword(e.target.value)}
                onClear={() => setKeyword('')}
                placeholder={'please input a keyword'}
              />
            </div>

            {options?.length > 0 && !keyword && (
              <div>
                <Checkbox
                  label={t('select all')}
                  checked={isEqual(options?.sort(), checkedItems?.sort())}
                  setChecked={(v) => {
                    if (v) {
                      setCheckedItems(options);
                    } else {
                      setCheckedItems([]);
                    }
                  }}
                />
              </div>
            )}
            {matches?.map((match, index) => (
              <div key={`multi-selector-option-${index}`}>
                <Checkbox
                  checked={checkedItems?.some(
                    (it) => it.value?.toString() === match.value?.toString()
                  )}
                  label={match.label}
                  setChecked={(v) => handleChange(match.value, v)}
                />
              </div>
            ))}
            {matches?.length === 0 && (
              <div className="font-heading-small text-capitalize">
                <span>{t('no matches found')}</span>
              </div>
            )}
          </div>
          {options?.length > 0 && (
            <div className={clsx(style.Footer)}>
              <Button
                title={t('ok')}
                size={'sm'}
                onClick={() => {
                  setOpen(false);
                  onChange(checkedItems);
                }}
              />

              <Button
                title={t('cancel')}
                bgColor={'transparent'}
                size={'sm'}
                onClick={() => setOpen(false)}
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default MultiSelectPopup;
