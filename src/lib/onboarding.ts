export const ONBOARDING_KEY = "mintease-onboarding-done";

export interface TourStep {
  id: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "欢迎使用 MintEase",
    body: "这是一款基于 TokenCore 的极简自托管钱包。助记词与私钥仅在本地处理，不会上传服务器。",
  },
  {
    id: "network",
    title: "一键切换网络",
    body: "顶部可快速切换 Ethereum、BSC、Base 等主流网络，资产与地址会自动适配当前链。",
  },
  {
    id: "transfer",
    title: "三步完成转账",
    body: "填写收款地址 → 确认金额与 Gas → 输入密码签名。系统会拦截常见误操作并提示风险。",
  },
  {
    id: "security",
    title: "安全提示",
    body: "请勿截图助记词、勿向陌生人透露密码。大额转账前请再次核对地址与网络。",
  },
];

export function isOnboardingDone(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "1";
}

export function markOnboardingDone(): void {
  localStorage.setItem(ONBOARDING_KEY, "1");
}
