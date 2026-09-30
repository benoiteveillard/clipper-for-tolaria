import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: ({ browser, manifestVersion }) => ({
    name: 'Clipper for Tolaria',
    default_locale: 'en',
    description: '__MSG_extDescription__',
    // chrome.sidePanel needs Chrome 114.
    ...(browser === 'firefox' ? {} : { minimum_chrome_version: '114' }),
    permissions: ['activeTab', 'scripting', 'storage', 'contextMenus', ...(browser === 'firefox' ? [] : ['sidePanel'])],
    action: { default_title: '__MSG_actionTitle__' },
    // Triggers the action's onClicked, so it clips exactly like clicking the icon.
    commands: {
      [manifestVersion === 3 ? '_execute_action' : '_execute_browser_action']: {
        suggested_key: { default: 'Alt+Shift+T' },
        description: '__MSG_commandDescription__',
      },
    },
  }),
  hooks: {
    // The spike page is a dev-only diagnostic; keep it out of shipped builds.
    'entrypoints:resolved': (wxt, entrypoints) => {
      if (wxt.config.mode !== 'production') return;
      const spike = entrypoints.findIndex((entrypoint) => entrypoint.name === 'spike');
      if (spike !== -1) entrypoints.splice(spike, 1);
    },
  },
});
