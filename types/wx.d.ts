interface WxEvent {
  currentTarget: { dataset: Record<string, string | number> };
  detail: Record<string, unknown>;
}

interface WxApi {
  navigateTo(options: { url: string; success?: () => void; fail?: () => void }): void;
  navigateBack(options?: { delta?: number }): void;
  showToast(options: { title: string; icon?: 'success' | 'loading' | 'none'; duration?: number }): void;
  showModal(options: { title: string; content: string; showCancel?: boolean; success?: (res: { confirm: boolean }) => void }): void;
  getStorageSync(key: string): unknown;
  setStorageSync(key: string, data: unknown): void;
  removeStorageSync(key: string): void;
  [key: string]: unknown;
}

declare const wx: WxApi;
