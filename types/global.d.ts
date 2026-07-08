/// <reference path="./wx.d.ts" />

declare namespace WechatMiniprogram {
  interface AppOption {
    globalData?: Record<string, unknown>;
    onLaunch?: (options: Record<string, unknown>) => void;
    onShow?: (options: Record<string, unknown>) => void;
    onHide?: () => void;
    onError?: (msg: string) => void;
    [key: string]: unknown;
  }

  interface PageOption {
    data?: Record<string, unknown>;
    onLoad?: (options: Record<string, string>) => void;
    onReady?: () => void;
    onShow?: () => void;
    onHide?: () => void;
    onUnload?: () => void;
    onPullDownRefresh?: () => void;
    onReachBottom?: () => void;
    onShareAppMessage?: () => { title?: string; path?: string };
    [key: string]: unknown;
  }

  interface PageInstance {
    data: Record<string, unknown>;
    setData: (data: Record<string, unknown>) => void;
  }
}

declare function App(options: WechatMiniprogram.AppOption): void;
declare function Page(options: WechatMiniprogram.PageOption): void;
declare function getApp(): WechatMiniprogram.AppOption;
