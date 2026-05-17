import { useState } from "react";
import type { AddressEntry } from "../lib/addressBook";
import { addAddressEntry, removeAddressEntry } from "../lib/addressBook";
import { isEthAddress, shortAddress } from "../lib/utils";
import { useToast } from "./ui/Toast";
import "./ui/ui.css";

interface Props {
  entries: AddressEntry[];
  onChange: (entries: AddressEntry[]) => void;
  onPick?: (address: string) => void;
}

export function AddressBookPanel({ entries, onChange, onPick }: Props) {
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");

  function handleAdd() {
    if (!label.trim()) {
      toast("请填写备注名", "error");
      return;
    }
    if (!isEthAddress(address)) {
      toast("地址格式不正确", "error");
      return;
    }
    onChange(addAddressEntry({ label: label.trim(), address: address.trim() }));
    setLabel("");
    setAddress("");
    toast("已保存到地址簿", "success");
  }

  return (
    <section className="address-book">
      <h3>地址簿</h3>
      <div className="me-field">
        <label className="me-label">备注</label>
        <input
          className="me-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="例如：交易所充值"
        />
      </div>
      <div className="me-field">
        <label className="me-label">地址</label>
        <input
          className="me-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x…"
        />
      </div>
      <button type="button" className="me-btn me-btn--secondary me-btn--block" onClick={handleAdd}>
        添加地址
      </button>

      <ul className="address-book__list">
        {entries.length === 0 && <li className="address-book__empty">暂无常用地址</li>}
        {entries.map((e) => (
          <li key={e.id} className="address-book__item me-card">
            <div>
              <strong>{e.label}</strong>
              <span>{shortAddress(e.address, 8, 6)}</span>
            </div>
            <div className="address-book__actions">
              {onPick && (
                <button type="button" className="me-btn me-btn--ghost me-btn--sm" onClick={() => onPick(e.address)}>
                  选用
                </button>
              )}
              <button
                type="button"
                className="me-btn me-btn--ghost me-btn--sm"
                onClick={() => onChange(removeAddressEntry(e.id))}
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
