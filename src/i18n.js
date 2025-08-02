import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "city_dashboard": "City Pulse Dashboard",
      "filter_location": "Filter by location...",
      "error_load": "Failed to load events.",
      "error_delete": "Failed to delete event.",
      "error_edit": "Failed to edit event.",
      "error_resolve": "Failed to resolve event.",
      "only_admin_resolve": "⚠️ Only admins can resolve events.",
      "no_events": "No events to display or filter applied.",
      "save": "Save",
      "cancel": "Cancel",
      "at": "at",
      "time": "Time",
      "resolved": "Resolved",
      "delete": "Delete",
      "resolve": "Resolve",
      "edit": "Edit",
      "num_events": "Number of Events",
      "chart_title": "Events by Location",
      "report_event": "Report an Event",
      "describe_event": "Describe the event",
      "submit": "Submit",
      "english": "English",
      "hindi": "हिंदी",

      // ✅ Help Section (English)
      "help_title": "Help",
      "how_report_event": "How to report an event?",
      "help_report_event": "Click the 'Report Event' button on the homepage and fill in the event details.",
      "how_filter_events": "How to filter events?",
      "help_filter_events": "Use the search box to filter events by location name.",
      "how_edit_delete": "How can admins edit or delete events?",
      "help_edit_delete": "Admins can see 'Edit', 'Delete', and 'Resolve' buttons next to each event.",
      "switch_language": "How to switch languages?",
      "help_language": "Use the 'English / हिन्दी' buttons at the top of the dashboard.",
      "error_messages": "What to do if you see an error?",
      "help_errors": "Most errors are due to internet issues. Try refreshing or logging in again."
    }
  },
  hi: {
    translation: {
      "city_dashboard": "सिटी पल्स डैशबोर्ड",
      "filter_location": "स्थान द्वारा फ़िल्टर करें...",
      "error_load": "ईवेंट लोड करने में विफल।",
      "error_delete": "ईवेंट हटाने में विफल।",
      "error_edit": "ईवेंट संपादित करने में विफल।",
      "error_resolve": "ईवेंट हल करने में विफल।",
      "only_admin_resolve": "⚠️ केवल व्यवस्थापक ईवेंट हल कर सकते हैं।",
      "no_events": "दिखाने के लिए कोई ईवेंट नहीं या फ़िल्टर लागू किया गया है।",
      "save": "सहेजें",
      "cancel": "रद्द करें",
      "at": "पर",
      "time": "समय",
      "resolved": "हल किया गया",
      "delete": "हटाएं",
      "resolve": "हल करें",
      "edit": "संपादित करें",
      "num_events": "ईवेंट की संख्या",
      "chart_title": "स्थान के अनुसार ईवेंट",
      "report_event": "एक घटना की रिपोर्ट करें",
      "describe_event": "घटना का वर्णन करें",
      "submit": "जमा करें",
      "english": "अंग्रेज़ी",
      "hindi": "हिंदी",

      // ✅ Help Section (Hindi)
      "help_title": "सहायता",
      "how_report_event": "घटना कैसे दर्ज करें?",
      "help_report_event": "होमपेज पर 'घटना दर्ज करें' बटन पर क्लिक करें और विवरण भरें।",
      "how_filter_events": "घटनाओं को कैसे फ़िल्टर करें?",
      "help_filter_events": "खोज बॉक्स का उपयोग करके स्थान नाम से फ़िल्टर करें।",
      "how_edit_delete": "एडमिन घटनाओं को कैसे संपादित या हटाते हैं?",
      "help_edit_delete": "एडमिन को प्रत्येक घटना के पास 'संपादित करें', 'हटाएं', और 'सुलझाएं' बटन दिखाई देते हैं।",
      "switch_language": "भाषा कैसे बदलें?",
      "help_language": "डैशबोर्ड के ऊपर दिए गए 'English / हिन्दी' बटन का उपयोग करें।",
      "error_messages": "यदि कोई त्रुटि दिखे तो क्या करें?",
      "help_errors": "अधिकांश त्रुटियाँ इंटरनेट कनेक्शन के कारण होती हैं। पेज को रीफ़्रेश या दोबारा लॉगिन करें।"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
