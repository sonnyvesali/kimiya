import { qrSvg } from "../form/qr-code";
export function createInviteDisplayWorkflow() {
  let message = $state("");
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      message = "Copied.";
    } catch {
      message =
        "Copy isn’t available here. Select and copy the invitation manually.";
    }
  }
  function qr(url: string) {
    try {
      return {
        source: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg(url))}`,
        error: null,
      };
    } catch (error) {
      return {
        source: null,
        error: error instanceof Error ? error.message : "QR code unavailable.",
      };
    }
  }
  return {
    copy,
    qr,
    get message() {
      return message;
    },
  };
}
