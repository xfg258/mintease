import { useCallback, useEffect, useState } from "react";
import { ToastProvider, useToast } from "./components/ui/Toast";
import { WalletSetup } from "./components/WalletSetup";
import { OnboardingTour } from "./components/OnboardingTour";
import { TransferWizard } from "./components/TransferWizard";
import { AddressBookPanel } from "./components/AddressBookPanel";
import { QrPanel } from "./components/QrPanel";
import { SafetyModal } from "./components/SafetyModal";
import {
  DEFAULT_NETWORK,
  NETWORK_LIST,
  getNetwork,
  type NetworkConfig,
  type NetworkId,
} from "./lib/networks";
import {
  clearStoredKeystore,
  disconnectWallet,
  loadStoredKeystore,
  loadStoredNetwork,
  saveStoredNetwork,
  unlockKeystore,
  type WalletSession,
} from "./lib/tokenCore";
import { loadAddressBook, type AddressEntry } from "./lib/addressBook";
import { isOnboardingDone } from "./lib/onboarding";
import { fetchBalance, formatNativeAmount } from "./lib/rpc";
import { copyText, shortAddress } from "./lib/utils";

type Tab = "assets" | "transfer" | "book" | "settings";
type View = "setup" | "unlock" | "wallet";

function AppInner() {
  const { toast } = useToast();
  const [view, setView] = useState<View>("setup");
  const [session, setSession] = useState<WalletSession | null>(null);
  const [networkId, setNetworkId] = useState<NetworkId>(() => {
    const stored = loadStoredNetwork();
    if (stored && NETWORK_LIST.some((n) => n.id === stored)) {
      return stored as NetworkId;
    }
    return DEFAULT_NETWORK;
  });
  const network = getNetwork(networkId);
  const [tab, setTab] = useState<Tab>("assets");
  const [balance, setBalance] = useState<bigint>(0n);
  const [password, setPassword] = useState("");
  const [showTour, setShowTour] = useState(!isOnboardingDone());
  const [showTransfer, setShowTransfer] = useState(false);
  const [addressBook, setAddressBook] = useState<AddressEntry[]>(loadAddressBook);
  const [qr, setQr] = useState<{ title: string; value: string; subtitle?: string } | null>(
    null
  );
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const t = localStorage.getItem("mintease-theme");
    return t === "dark" ? "dark" : "light";
  });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [busy, setBusy] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!session) return;
    try {
      const wei = await fetchBalance(network, session.address);
      setBalance(wei);
    } catch {
      toast("余额刷新失败", "error");
    }
  }, [session, network, toast]);

  useEffect(() => {
    const ks = loadStoredKeystore();
    if (ks) setView("unlock");
  }, []);

  useEffect(() => {
    if (session) void refreshBalance();
  }, [session, network, refreshBalance]);

  function switchNetwork(id: NetworkId) {
    setNetworkId(id);
    saveStoredNetwork(id);
    toast(`已切换至 ${getNetwork(id).label}`, "success");
  }

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mintease-theme", next);
  }

  async function handleUnlock() {
    const ks = loadStoredKeystore();
    if (!ks) return;
    setBusy(true);
    try {
      const s = await unlockKeystore(ks, password, network, false);
      setSession(s);
      setView("wallet");
      setPassword("");
      if (!isOnboardingDone()) setShowTour(true);
    } catch (e) {
      toast(e instanceof Error ? e.message : "解锁失败", "error");
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    disconnectWallet();
    clearStoredKeystore();
    setSession(null);
    setView("setup");
    setConfirmLogout(false);
    toast("已退出钱包", "info");
  }

  if (view === "setup") {
    return (
      <main className="app-shell">
        <WalletSetup
          network={network}
          onReady={(s) => {
            setSession(s);
            setView("wallet");
            if (!isOnboardingDone()) setShowTour(true);
          }}
        />
        <div className="unlock-panel me-card" style={{ marginTop: 0 }}>
          <label className="me-label">默认网络</label>
          <select
            className="network-select me-btn--block"
            value={networkId}
            onChange={(e) => switchNetwork(e.target.value as NetworkId)}
          >
            {NETWORK_LIST.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        {showTour && <OnboardingTour onDone={() => setShowTour(false)} />}
      </main>
    );
  }

  if (view === "unlock") {
    return (
      <main className="app-shell">
        <section className="unlock-panel me-card me-card--elevated">
          <div className="app-brand" style={{ marginBottom: 20 }}>
            <div className="app-brand__logo">M</div>
            <div>
              <h1>MintEase</h1>
              <p>欢迎回来</p>
            </div>
          </div>
          <div className="me-field">
            <label className="me-label">钱包密码</label>
            <input
              className="me-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleUnlock()}
            />
          </div>
          <button
            type="button"
            className="me-btn me-btn--primary me-btn--block"
            disabled={busy || !password}
            onClick={() => void handleUnlock()}
          >
            {busy ? "解锁中…" : "解锁钱包"}
          </button>
          <button
            type="button"
            className="me-btn me-btn--ghost me-btn--block"
            style={{ marginTop: 12 }}
            onClick={() => {
              clearStoredKeystore();
              setView("setup");
            }}
          >
            导入其他钱包
          </button>
        </section>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <div className="app-brand__logo">M</div>
          <div>
            <h1>MintEase</h1>
            <p>自托管 · TokenCore</p>
          </div>
        </div>
        <div className="app-header__actions">
          <select
            className="network-select"
            value={networkId}
            onChange={(e) => switchNetwork(e.target.value as NetworkId)}
            aria-label="切换网络"
          >
            {NETWORK_LIST.map((n) => (
              <option key={n.id} value={n.id}>
                {n.shortLabel}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="切换主题"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {!showTransfer && (
        <nav className="app-nav" aria-label="主导航">
          {(
            [
              ["assets", "资产"],
              ["transfer", "转账"],
              ["book", "地址簿"],
              ["settings", "设置"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "is-active" : ""}
              onClick={() => {
                setTab(id);
                if (id === "transfer") setShowTransfer(true);
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {showTransfer ? (
        <TransferWizard
          session={session}
          network={network}
          balance={balance}
          addressBook={addressBook}
          onDone={() => {
            setShowTransfer(false);
            setTab("assets");
            void refreshBalance();
          }}
          onClose={() => {
            setShowTransfer(false);
            setTab("assets");
          }}
        />
      ) : (
        <div className="app-grid app-grid--main">
          <div>
            {tab === "assets" && (
              <>
                <div className="safety-banner">
                  大额转账前请核对地址与网络。助记词仅保存在本设备，请勿截图或分享给他人。
                </div>
                <section className="asset-hero">
                  <div className="asset-hero__label">总资产（{network.label}）</div>
                  <div className="asset-hero__balance">
                    {formatNativeAmount(balance)} {network.nativeSymbol}
                  </div>
                  <div className="asset-hero__addr">{session.address}</div>
                  <div className="asset-actions">
                    <button
                      type="button"
                      className="me-btn me-btn--secondary"
                      onClick={() => void refreshBalance()}
                    >
                      刷新
                    </button>
                    <button
                      type="button"
                      className="me-btn me-btn--primary"
                      onClick={() => setShowTransfer(true)}
                    >
                      转账
                    </button>
                    <button
                      type="button"
                      className="me-btn me-btn--ghost"
                      onClick={() =>
                        setQr({
                          title: "收款二维码",
                          value: session.address,
                          subtitle: "扫码向此地址转账",
                        })
                      }
                    >
                      收款码
                    </button>
                    <button
                      type="button"
                      className="me-btn me-btn--ghost"
                      onClick={() => {
                        void copyText(session.address).then(() =>
                          toast("地址已复制", "success")
                        );
                      }}
                    >
                      复制地址
                    </button>
                  </div>
                </section>

                <section className="me-card panel-section">
                  <h3>多链资产一览</h3>
                  <ul className="chain-list">
                    {NETWORK_LIST.map((n: NetworkConfig) => (
                      <li key={n.id}>
                        <div className="chain-list__left">
                          <span
                            className="chain-list__dot"
                            style={{ background: n.color }}
                          />
                          <span>{n.label}</span>
                        </div>
                        <span>
                          {n.id === networkId
                            ? `${formatNativeAmount(balance)} ${n.nativeSymbol}`
                            : "切换查看"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {tab === "book" && (
              <section className="me-card">
                <AddressBookPanel
                  entries={addressBook}
                  onChange={setAddressBook}
                  onPick={(addr) => {
                    void copyText(addr);
                    toast("已复制地址，可在转账页粘贴", "success");
                    setShowTransfer(true);
                  }}
                />
              </section>
            )}

            {tab === "settings" && (
              <section className="me-card panel-section">
                <h3>设置</h3>
                <p className="me-hint">账户：{shortAddress(session.address)}</p>
                <button
                  type="button"
                  className="me-btn me-btn--ghost me-btn--block"
                  style={{ marginTop: 12 }}
                  onClick={() => setShowTour(true)}
                >
                  重新查看新手引导
                </button>
                <button
                  type="button"
                  className="me-btn me-btn--danger me-btn--block"
                  style={{ marginTop: 12 }}
                  onClick={() => setConfirmLogout(true)}
                >
                  退出钱包
                </button>
                <p className="me-hint" style={{ marginTop: 20 }}>
                  基于{" "}
                  <a
                    href="https://github.com/consenlabs/token-core-monorepo"
                    target="_blank"
                    rel="noreferrer"
                  >
                    TokenCore
                  </a>
                  ，UI 参考{" "}
                  <a
                    href="https://github.com/consenlabs/token-ui"
                    target="_blank"
                    rel="noreferrer"
                  >
                    token-ui
                  </a>
                  设计规范。
                </p>
              </section>
            )}
          </div>

          <aside className="me-card panel-section">
            <h3>快捷指引</h3>
            <ol style={{ paddingLeft: 18, margin: 0, fontSize: 14, lineHeight: 1.7 }}>
              <li>顶部切换目标网络</li>
              <li>转账分三步：地址 → 金额 → 签名</li>
              <li>地址簿保存常用收款人</li>
              <li>扫码分享收款地址</li>
            </ol>
          </aside>
        </div>
      )}

      <nav className="app-bottom-nav" aria-label="底部导航">
        <div className="app-bottom-nav__inner">
          {(
            [
              ["assets", "资产"],
              ["transfer", "转账"],
              ["book", "地址簿"],
              ["settings", "设置"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id && !showTransfer ? "is-active" : ""}
              onClick={() => {
                setTab(id);
                if (id === "transfer") setShowTransfer(true);
                else setShowTransfer(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {showTour && <OnboardingTour onDone={() => setShowTour(false)} />}
      {qr && (
        <QrPanel
          title={qr.title}
          value={qr.value}
          subtitle={qr.subtitle}
          onClose={() => setQr(null)}
        />
      )}
      {confirmLogout && (
        <SafetyModal
          title="退出钱包"
          message="将清除本机 Keystore 缓存，请确保已备份助记词。确定退出？"
          danger
          confirmLabel="退出"
          onConfirm={handleLogout}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </main>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
