// Replace this URL with your real Google Form URL before publishing.
const UNINSTALL_FEEDBACK_URL = 'https://forms.gle/REPLACE_WITH_YOUR_FORM_ID';

const configureUninstallSurvey = () => {
  chrome.runtime.setUninstallURL(UNINSTALL_FEEDBACK_URL, () => {
    if (chrome.runtime.lastError) {
      console.error(
        'Failed to set uninstall URL:',
        chrome.runtime.lastError.message
      );
    }
  });
};

chrome.runtime.onInstalled.addListener(configureUninstallSurvey);
chrome.runtime.onStartup.addListener(configureUninstallSurvey);
configureUninstallSurvey();
