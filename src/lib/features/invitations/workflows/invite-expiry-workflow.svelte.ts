import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import type { ExpiryPreset, InviteExpirySource } from "../types/expiry";
import {
  expiryIso,
  presetDeadline,
  customDeadline,
  expiryError,
  expirySummary,
} from "../form/expiry";
export function createInviteExpiryWorkflow(
  initialInvite: () => InviteExpirySource | null = () => null,
) {
  let baseline = $state(expiryIso(initialInvite()?.expiresAt || null));
  let preset = $state<ExpiryPreset>(baseline ? "custom" : "never");
  let fixedDeadline = $state("");
  let touched = $state(false);
  let selectedDate = $state<DateValue>();
  let time = $state("23:59");
  let timeEnabled = $state(false);
  let advancedOpen = $state(false);
  let pickerOpen = $state(false);
  let now = $state(new Date());
  let minimumDate = $state(today(getLocalTimeZone()));
  const draft = $derived(
    preset === "never"
      ? { iso: "", error: null }
      : preset === "custom"
        ? customDeadline(
            selectedDate?.toString() || "",
            timeEnabled ? time : null,
          )
        : { iso: fixedDeadline, error: null },
  );
  const serialized = $derived(touched ? draft.iso : baseline);
  const validation = $derived(
    (touched ? draft.error : null) || expiryError(serialized, now),
  );
  const dirty = $derived(serialized !== baseline);
  function refreshClock() {
    now = new Date();
    minimumDate = today(getLocalTimeZone());
  }
  function resetForInvite(invite: InviteExpirySource | null) {
    refreshClock();
    baseline = expiryIso(invite?.expiresAt || null);
    fixedDeadline = "";
    touched = false;
    preset = baseline ? "custom" : "never";
    pickerOpen = false;
    if (baseline) {
      const date = new Date(baseline);
      selectedDate = new CalendarDate(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
      );
      time =
        String(date.getHours()).padStart(2, "0") +
        ":" +
        String(date.getMinutes()).padStart(2, "0");
      timeEnabled = !(
        date.getHours() === 23 &&
        date.getMinutes() === 59 &&
        date.getSeconds() === 59 &&
        date.getMilliseconds() === 999
      );
    } else {
      selectedDate = undefined;
      time = "23:59";
      timeEnabled = false;
    }
  }
  function selectPreset(value: ExpiryPreset) {
    refreshClock();
    preset = value;
    touched = true;
    fixedDeadline = presetDeadline(value, now);
    pickerOpen = value === "custom" && !selectedDate;
  }
  function chooseDate(value: DateValue | undefined) {
    if (!value) return;
    refreshClock();
    selectedDate = new CalendarDate(value.year, value.month, value.day);
    preset = "custom";
    touched = true;
    pickerOpen = false;
  }
  function setTime(value: string) {
    refreshClock();
    time = value;
    touched = true;
  }
  function toggleTime() {
    refreshClock();
    timeEnabled = !timeEnabled;
    touched = true;
  }
  function setAdvancedOpen(value: boolean) {
    advancedOpen = value;
    if (!value) pickerOpen = false;
  }
  function setPickerOpen(value: boolean) {
    refreshClock();
    pickerOpen = value;
  }
  return {
    resetForInvite,
    selectPreset,
    chooseDate,
    setTime,
    toggleTime,
    setAdvancedOpen,
    setPickerOpen,
    get preset() {
      return preset;
    },
    get selectedDate() {
      return selectedDate;
    },
    get time() {
      return time;
    },
    get timeEnabled() {
      return timeEnabled;
    },
    get advancedOpen() {
      return advancedOpen;
    },
    get pickerOpen() {
      return pickerOpen;
    },
    get minimumDate() {
      return minimumDate;
    },
    get serialized() {
      return serialized;
    },
    get error() {
      return validation;
    },
    get dirty() {
      return dirty;
    },
    get summary() {
      return expirySummary(serialized);
    },
    get valid() {
      return !validation;
    },
  };
}
export type InviteExpiryWorkflow = ReturnType<
  typeof createInviteExpiryWorkflow
>;
