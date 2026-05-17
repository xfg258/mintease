import { useEffect, useState } from "react";
import type { NetworkConfig } from "../lib/networks";
import type { WalletSession } from "../lib/tokenCore";
import { signAndBroadcastTransfer } from "../lib/tokenCore";
import type { AddressEntry } from "../lib/addressBook";
import {
  estimateGas,
  explorerTxUrl,
  fetchGasPrice,
  formatNativeAmount,
} from "../lib/rpc";
import { estimateFeeWei, formatGasGwei, isEthAddress } from "../lib/utils";
import { useToast } from "./ui/Toast";
import { SafetyModal } from "./SafetyModal";
import "./ui/ui.css";

interface Props {
  session: WalletSession;
  network: NetworkConfig;
  balance: bigint;
  addressBook: AddressEntry[];
  onDone: () => void;
  onClose: () => void;
}

const STEPS = ["填写收款地址", "确认金额与 Gas", "签名并发送"];

export function TransferWizard({
  session,
  network,
  balance,
  addressBook,
  onDone,
  onClose,
}: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [gasLimit, setGasLimit] = useState("21000");
  const [busy, setBusy] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [selfSendWarn, setSelfSendWarn] = useState(false);

  useEffect(() => {
    void fetchGasPrice(network).then(setGasPrice).catch(() => setGasPrice("0"));
  }, [network]);

  useEffect(() => {
    if (!isEthAddress(to) || !amount) return;
    void estimateGas(network, session.address, to, "0x", "0")
      .then(setGasLimit)
      .catch(() => setGasLimit("21000"));
  }, [to, amount, network, session.address]);

  const feeWei = gasPrice ? estimateFeeWei(gasLimit, gasPrice) : 0n;
  const maxBtn = () => {
    const reserve = feeWei + 10n ** 15n;
    if (balance <= reserve) {
      setAmount("0");
      return;
    }
    setAmount(formatNativeAmount(balance - reserve));
  };

  function validateStep0(): boolean {
    if (!isEthAddress(to)) {
      toast("请输入有效的 0x 地址", "error");
      return false;
    }
    if (to.toLowerCase() === session.address.toLowerCase()) {
      setSelfSendWarn(true);
      return false;
    }
    return true;
  }

  function validateStep1(): boolean {
    const n = Number(amount);
    if (!amount || Number.isNaN(n) || n <= 0) {
      toast("请输入有效转账金额", "error");
      return false;
    }
    return true;
  }

  async function handleSend() {
    setBusy(true);
    try {
      const { txHash } = await signAndBroadcastTransfer(
        session,
        password,
        network,
        to,
        amount
      );
      toast("交易已广播", "success");
      const url = explorerTxUrl(network, txHash);
      if (navigator.share) {
        try {
          await navigator.share({
            title: "MintEase 转账",
            text: `已向 ${to} 发送 ${amount} ${network.nativeSymbol}`,
            url,
          });
        } catch {
          /* user cancelled */
        }
      }
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "发送失败", "error");
    } finally {
      setBusy(false);
      setConfirmSend(false);
    }
  }

  return (
    <section className="transfer-wizard me-card me-card--elevated">
      <header className="transfer-wizard__head">
        <button type="button" className="me-btn me-btn--ghost me-btn--sm" onClick={onClose}>
          返回
        </button>
        <h2>转账</h2>
        <span className="me-badge">{STEPS[step]}</span>
      </header>

      <ol className="transfer-steps">
        {STEPS.map((label, i) => (
          <li key={label} className={i <= step ? "is-done" : ""}>
            <span>{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <>
          <div className="me-field">
            <label className="me-label">收款地址</label>
            <input
              className="me-input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x…"
            />
            {to && !isEthAddress(to) && <p className="me-error">地址格式无效</p>}
          </div>
          {addressBook.length > 0 && (
            <div className="quick-addresses">
              <span className="me-label">常用地址</span>
              <div className="quick-addresses__chips">
                {addressBook.slice(0, 5).map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className="me-btn me-btn--ghost me-btn--sm"
                    onClick={() => setTo(e.address)}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            className="me-btn me-btn--primary me-btn--block"
            onClick={() => validateStep0() && setStep(1)}
          >
            下一步
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="me-field">
            <label className="me-label">
              金额（{network.nativeSymbol}）
            </label>
            <input
              className="me-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              inputMode="decimal"
            />
            <button type="button" className="me-btn me-btn--ghost me-btn--sm" onClick={maxBtn}>
              最大（预留 Gas）
            </button>
          </div>
          <div className="gas-card me-card">
            <p>
              <span>Gas 价格</span>
              <strong>{gasPrice ? `${formatGasGwei(gasPrice)} Gwei` : "—"}</strong>
            </p>
            <p>
              <span>预估手续费</span>
              <strong>
                {gasPrice
                  ? `${formatNativeAmount(feeWei)} ${network.nativeSymbol}`
                  : "—"}
              </strong>
            </p>
          </div>
          <div className="transfer-wizard__nav">
            <button type="button" className="me-btn me-btn--ghost" onClick={() => setStep(0)}>
              上一步
            </button>
            <button
              type="button"
              className="me-btn me-btn--primary"
              onClick={() => validateStep1() && setStep(2)}
            >
              下一步
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="confirm-card me-card">
            <p>
              <span>收款</span>
              <code>{to}</code>
            </p>
            <p>
              <span>金额</span>
              <strong>
                {amount} {network.nativeSymbol}
              </strong>
            </p>
            <p>
              <span>网络</span>
              <strong>{network.label}</strong>
            </p>
          </div>
          <div className="me-field">
            <label className="me-label">钱包密码</label>
            <input
              className="me-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="transfer-wizard__nav">
            <button type="button" className="me-btn me-btn--ghost" onClick={() => setStep(1)}>
              上一步
            </button>
            <button
              type="button"
              className="me-btn me-btn--primary"
              disabled={busy || !password}
              onClick={() => setConfirmSend(true)}
            >
              {busy ? "签名中…" : "确认发送"}
            </button>
          </div>
        </>
      )}

      {selfSendWarn && (
        <SafetyModal
          title="无法向自己转账"
          message="收款地址与当前钱包相同，请更换地址。"
          confirmLabel="知道了"
          onConfirm={() => setSelfSendWarn(false)}
          onCancel={() => setSelfSendWarn(false)}
        />
      )}

      {confirmSend && (
        <SafetyModal
          title="最后确认"
          message={`将向 ${to.slice(0, 10)}… 发送 ${amount} ${network.nativeSymbol}，链上交易不可撤销。`}
          danger
          confirmLabel="发送"
          onConfirm={() => void handleSend()}
          onCancel={() => setConfirmSend(false)}
        />
      )}
    </section>
  );
}
