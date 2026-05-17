import { useState } from "react";
import type { NetworkConfig } from "../lib/networks";
import {
  createPasswordWallet,
  generateMnemonicPhrase,
  importFromPrivateKey,
  importKeystoreJson,
} from "../lib/tokenCore";
import type { WalletSession } from "../lib/tokenCore";
import { useToast } from "./ui/Toast";
import "./ui/ui.css";

type ImportTab = "create" | "mnemonic" | "privateKey" | "json";

interface Props {
  network: NetworkConfig;
  onReady: (session: WalletSession) => void;
}

export function WalletSetup({ network, onReady }: Props) {
  const { toast } = useToast();
  const [tab, setTab] = useState<ImportTab>("create");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerateMnemonic() {
    try {
      setBusy(true);
      const phrase = await generateMnemonicPhrase();
      setMnemonic(phrase);
      setTab("mnemonic");
      toast("已生成新助记词，请妥善抄写", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "生成失败", "error");
    } finally {
      setBusy(false);
    }
  }

  function validatePassword(): boolean {
    if (password.length < 8) {
      setError("密码至少 8 位");
      return false;
    }
    if (password !== confirm) {
      setError("两次密码不一致");
      return false;
    }
    setError("");
    return true;
  }

  async function submit() {
    if (!validatePassword()) return;
    setBusy(true);
    setError("");
    try {
      let session: WalletSession;
      if (tab === "create") {
        session = await createPasswordWallet(password, network);
      } else if (tab === "mnemonic") {
        if (!mnemonic.trim()) throw new Error("请输入助记词");
        session = await createPasswordWallet(password, network, mnemonic);
      } else if (tab === "privateKey") {
        session = await importFromPrivateKey(privateKey, password, network);
      } else {
        const text = jsonText.trim();
        if (!text) throw new Error("请粘贴或上传 Keystore JSON");
        session = await importKeystoreJson(text, password, network);
      }
      toast("钱包已就绪", "success");
      onReady(session);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "导入失败";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusy(false);
    }
  }

  function onJsonFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setJsonText(String(reader.result ?? ""));
      toast("已读取 JSON 文件", "success");
    };
    reader.readAsText(file);
  }

  const tabs: { id: ImportTab; label: string }[] = [
    { id: "create", label: "新建" },
    { id: "mnemonic", label: "助记词" },
    { id: "privateKey", label: "私钥" },
    { id: "json", label: "JSON" },
  ];

  return (
    <section className="setup-panel me-card me-card--elevated">
      <header className="setup-hero">
        <div className="setup-hero__badge">TokenCore 本地签名</div>
        <h1>零门槛创建钱包</h1>
        <p>助记词、私钥、Keystore JSON 均在浏览器内完成，不上传服务器。</p>
      </header>

      <div className="setup-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`setup-tabs__item${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "create" && (
        <p className="setup-tip">
          点击开始将自动生成加密 Keystore。请设置强密码并备份助记词（可在钱包内导出）。
        </p>
      )}

      {tab === "mnemonic" && (
        <div className="me-field">
          <label className="me-label" htmlFor="mnemonic">
            助记词（12 / 24 词）
          </label>
          <textarea
            id="mnemonic"
            className="me-textarea"
            placeholder="按顺序输入助记词，空格分隔"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            className="me-btn me-btn--ghost me-btn--sm"
            onClick={() => void handleGenerateMnemonic()}
            disabled={busy}
          >
            生成新助记词
          </button>
        </div>
      )}

      {tab === "privateKey" && (
        <div className="me-field">
          <label className="me-label" htmlFor="pk">
            私钥（十六进制）
          </label>
          <input
            id="pk"
            className="me-input"
            type="password"
            placeholder="64 位 hex，可带 0x 前缀"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            autoComplete="off"
          />
          <p className="me-hint">将加密为 Keystore 后由 TokenCore 本地签名，私钥不会离开本机。</p>
        </div>
      )}

      {tab === "json" && (
        <>
          <div className="me-field">
            <label className="me-label" htmlFor="json">
              Keystore JSON
            </label>
            <textarea
              id="json"
              className="me-textarea"
              placeholder='粘贴 {"crypto":...} 内容'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
          </div>
          <div className="me-field">
            <label className="me-label">或上传文件</label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => onJsonFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </>
      )}

      <div className="me-field">
        <label className="me-label" htmlFor="pass">
          钱包密码
        </label>
        <input
          id="pass"
          className="me-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <div className="me-field">
        <label className="me-label" htmlFor="pass2">
          确认密码
        </label>
        <input
          id="pass2"
          className="me-input"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      {error && <p className="me-error">{error}</p>}

      <button
        type="button"
        className="me-btn me-btn--primary me-btn--block"
        disabled={busy}
        onClick={() => void submit()}
      >
        {busy ? "处理中…" : tab === "create" ? "一键创建钱包" : "导入并解锁"}
      </button>
    </section>
  );
}
