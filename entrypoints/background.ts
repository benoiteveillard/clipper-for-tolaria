import { captureTab, clearPendingClip } from '@/lib/clip';

type ActionApi = typeof browser.action;
type SidebarActionApi = { open(): Promise<void> };

const MENU_ID = 'clip-to-tolaria';

export default defineBackground(() => {
  // Firefox MV2 exposes browserAction + sidebarAction instead of action + sidePanel.
  const api = browser as unknown as { browserAction?: ActionApi; sidebarAction?: SidebarActionApi };
  const action = browser.action ?? api.browserAction!;

  function clip(tab: { id?: number; windowId?: number }) {
    // Opening the panel must happen synchronously, inside the user gesture (click, shortcut or menu).
    if (api.sidebarAction) void api.sidebarAction.open();
    else if (tab.windowId !== undefined) void browser.sidePanel.open({ windowId: tab.windowId });
    if (tab.id !== undefined && tab.windowId !== undefined) void captureTab({ id: tab.id, windowId: tab.windowId });
  }

  // The shortcut (_execute_action) fires this same listener.
  action.onClicked.addListener(clip);

  browser.windows.onRemoved.addListener((windowId) => void clearPendingClip(windowId));

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: MENU_ID,
      title: 'Clip to Tolaria',
      contexts: ['page', 'selection'],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === MENU_ID && tab) clip(tab);
  });
});
