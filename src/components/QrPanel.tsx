import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { copyText } from "../lib/utils";
import { useToast } from "./ui/Toast";
import "./ui/ui.css";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  onClose: () => void;
}

export function QrPanel({ title, value, subtitle, onClose }: Props) {
  const { toast } = useToast();
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    void QRCode.toDataURL(value, { margin: 2, width: 220 }).then(setDataUrl);
  }, [value]);

  return (
    <div className="me-modal-backdrop" onClick={onClose}>
      <div
        className="me-modal qr-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
        {dataUrl && <img src={dataUrl} alt="二维码" className="qr-modal__img" />}
        <p className="qr-modal__addr">{value}</p>
        <div className="me-modal-actions">
          <button
            type="button"
            className="me-btn me-btn--secondary"
            onClick={() => {
              void copyText(value).then(() => toast("已复制", "success"));
            }}
          >
            复制
          </button>
          <button type="button" className="me-btn me-btn--primary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
