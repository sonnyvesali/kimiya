<script lang="ts">
  import { Calendar, Popover } from "bits-ui";
  import { getLocalTimeZone } from "@internationalized/date";
  import Icon from "$lib/components/icons/Icon.svelte";
  import { cn } from "$lib/component-attributes";
  import type { InviteExpiryWorkflow } from "../workflows/invite-expiry-workflow.svelte";
  let { workflow }: { workflow: InviteExpiryWorkflow } = $props();
  const buttonClass =
    "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted";
</script>

<Popover.Root open={workflow.pickerOpen} onOpenChange={workflow.setPickerOpen}>
  <Popover.Trigger
    type="button"
    class="button-secondary w-full justify-between sm:w-auto"
  >
    <span class="inline-flex items-center gap-2"
      ><Icon name="calendar-blank" />{workflow.selectedDate
        ? new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(workflow.selectedDate.toDate(getLocalTimeZone()))
        : "Choose a date"}</span
    ><Icon name="caret-down" />
  </Popover.Trigger>
  <Popover.Portal
    ><Popover.Content
      side="bottom"
      align="start"
      sideOffset={8}
      collisionPadding={16}
      class={cn(
        "z-50 w-72 max-w-[calc(100vw-2rem)] rounded-lg border bg-popover p-4",
        "text-popover-foreground shadow-xl outline-none",
      )}
    >
      <Calendar.Root
        type="single"
        value={workflow.selectedDate}
        onValueChange={workflow.chooseDate}
        minValue={workflow.minimumDate}
        preventDeselect
        initialFocus
        weekdayFormat="short"
        fixedWeeks
        calendarLabel="Invitation expiration date"
      >
        {#snippet children({ months, weekdays })}
          <Calendar.Header class="mb-3 flex items-center justify-between"
            ><Calendar.PrevButton
              class={buttonClass}
              aria-label="Previous month"
              ><Icon name="caret-left" /></Calendar.PrevButton
            ><Calendar.Heading
              class="text-sm font-medium"
            /><Calendar.NextButton class={buttonClass} aria-label="Next month"
              ><Icon name="caret-right" /></Calendar.NextButton
            ></Calendar.Header
          >
          {#each months as month (month.value.toString())}<Calendar.Grid
              class="w-full border-collapse"
              ><Calendar.GridHead
                ><Calendar.GridRow
                  >{#each weekdays as weekday}<Calendar.HeadCell
                      class="h-8 text-center text-xs text-muted-foreground"
                      >{weekday}</Calendar.HeadCell
                    >{/each}</Calendar.GridRow
                ></Calendar.GridHead
              ><Calendar.GridBody
                >{#each month.weeks as week}<Calendar.GridRow
                    >{#each week as date}<Calendar.Cell
                        {date}
                        month={month.value}
                        class="p-0 text-center"
                      >
                        {#snippet children({ selected, disabled })}<Calendar.Day
                            class={cn(
                              "mx-auto flex size-8 items-center justify-center rounded-md text-sm outline-none",
                              "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40",
                              date.month !== month.value.month &&
                                !selected &&
                                "text-muted-foreground opacity-50",
                              selected &&
                                "bg-primary text-primary-foreground hover:bg-primary",
                              disabled && "pointer-events-none opacity-30",
                            )}
                          />{/snippet}
                      </Calendar.Cell>{/each}</Calendar.GridRow
                  >{/each}</Calendar.GridBody
              ></Calendar.Grid
            >{/each}
        {/snippet}
      </Calendar.Root>
      <p class="mt-3 border-t pt-3 text-xs text-muted-foreground">
        Expires at the end of the day unless you set a time.
      </p>
    </Popover.Content></Popover.Portal
  >
</Popover.Root>
