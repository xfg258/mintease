/* tslint:disable */
/* eslint-disable */

export function cache_keystore(keystore_json: string): void;

export function clear_cached_keystore(): void;

export function create_keystore(param_json: string): string;

export function decrypt_message(param_json: string): string;

export function derive_accounts(param_json: string): string;

export function derive_message_key_pair(param_json: string): string;

export function encrypt_message(param_json: string): string;

export function export_mnemonic(param_json: string): string;

export function sign_message(param_json: string): string;

export function sign_message_event(param_json: string): string;

export function sign_psbt(param_json: string): string;

export function sign_psbts(param_json: string): string;

export function sign_tx(param_json: string): string;

export function sign_txs(param_json: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly cache_keystore: (a: number, b: number) => void;
    readonly clear_cached_keystore: () => void;
    readonly create_keystore: (a: number, b: number, c: number) => void;
    readonly decrypt_message: (a: number, b: number, c: number) => void;
    readonly derive_accounts: (a: number, b: number, c: number) => void;
    readonly derive_message_key_pair: (a: number, b: number, c: number) => void;
    readonly encrypt_message: (a: number, b: number, c: number) => void;
    readonly export_mnemonic: (a: number, b: number, c: number) => void;
    readonly sign_message: (a: number, b: number, c: number) => void;
    readonly sign_message_event: (a: number, b: number, c: number) => void;
    readonly sign_psbt: (a: number, b: number, c: number) => void;
    readonly sign_psbts: (a: number, b: number, c: number) => void;
    readonly sign_tx: (a: number, b: number, c: number) => void;
    readonly sign_txs: (a: number, b: number, c: number) => void;
    readonly rustsecp256k1_v0_6_1_context_create: (a: number) => number;
    readonly rustsecp256k1_v0_6_1_context_destroy: (a: number) => void;
    readonly rustsecp256k1_v0_6_1_default_error_callback_fn: (a: number, b: number) => void;
    readonly rustsecp256k1_v0_6_1_default_illegal_callback_fn: (a: number, b: number) => void;
    readonly __wbindgen_export: (a: number) => void;
    readonly __wbindgen_export2: (a: number, b: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_export4: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
