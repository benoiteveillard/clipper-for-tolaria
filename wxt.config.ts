import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: ({ browser, manifestVersion }) => ({
    name: 'Clipper for Tolaria',
    description: 'Clip web pages into your Tolaria vault Inbox.',
    permissions: ['activeTab', 'scripting', 'storage', 'contextMenus', ...(browser === 'firefox' ? [] : ['sidePanel'])],
    action: { default_title: 'Clip to Tolaria' },
    // Triggers the action's onClicked, so it clips exactly like clicking the icon.
    commands: {
      [manifestVersion === 3 ? '_execute_action' : '_execute_browser_action']: {
        suggested_key: { default: 'Alt+Shift+T' },
        description: 'Clip the current page (or selection) to Tolaria',
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
