import React from 'react';
import { useTranslation } from 'react-i18next';

const HelpSection = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">{t('help_title')}</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('how_report_event')}</h3>
        <p className="text-gray-700">{t('help_report_event')}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('how_filter_events')}</h3>
        <p className="text-gray-700">{t('help_filter_events')}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('how_edit_delete')}</h3>
        <p className="text-gray-700">{t('help_edit_delete')}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('switch_language')}</h3>
        <p className="text-gray-700">{t('help_language')}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('error_messages')}</h3>
        <p className="text-gray-700">{t('help_errors')}</p>
      </div>
    </div>
  );
};

export default HelpSection;
