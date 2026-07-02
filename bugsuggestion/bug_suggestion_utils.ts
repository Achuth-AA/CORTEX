import {
  BugSuggestionComponentContext,
  BugTemplateForm,
  CreateBugData,
  Portfolio,
  PortfolioSubscriptionContext,
} from './bug_suggestion_types';

/**
 * Updates the filtered product area list based on the search term.
 * @param ctx The context containing form and product area state.
 */
export function updateProductAreaFilter(
  ctx: PortfolioSubscriptionContext | BugSuggestionComponentContext,
): void {
  const searchTerm = (
    ctx.form.get('productAreaSearchTerm')?.value || ''
  ).toLowerCase();
  const portfolio = ctx.form.get('portfolio')?.value;
  const allAreas =
    portfolio === Portfolio.SEARCH
      ? ctx.allSearchProductAreas || []
      : portfolio === Portfolio.ASSISTANT
        ? ctx.allProductAreas || []
        : [];
  ctx.productAreas = allAreas.filter((pa: string) =>
    pa.toLowerCase().includes(searchTerm),
  );
}

// ==================== PURE HELPERS ====================

/**
 * Converts a given string to Title Case.
 * @param str The string to convert.
 * @return The title-cased string.
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Calculates the relative time string (e.g., '5 minutes ago') from a date/time string.
 * @param dateTimeStr The ISO date/time string.
 * @return A human-readable relative time string.
 */
export function getRelativeTime(dateTimeStr: string): string {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr;

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const units = [
    {label: 'year', seconds: 31536000},
    {label: 'month', seconds: 2592000},
    {label: 'week', seconds: 604800},
    {label: 'day', seconds: 86400},
    {label: 'hour', seconds: 3600},
    {label: 'minute', seconds: 60},
    {label: 'second', seconds: 1},
  ];

  for (const unit of units) {
    const interval = Math.floor(diffInSeconds / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.label}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

/**
 * Builds the payload object required for creating a new bug.
 * @param createData The bug creation metadata.
 * @param bugTemplate The bug template form instance containing user input.
 * @return The constructed bug creation payload.
 */
export function buildCreatePayload(
  createData: CreateBugData,
  bugTemplate: BugTemplateForm,
): Record<string, unknown> {
  const ccArray: string[] = bugTemplate.value.cc
    ? bugTemplate.value.cc
        .split(',')
        .map((cc: string) => cc.trim())
        .filter((cc: string) => cc.length > 0)
    : [];

  const hotlistArray: string[] = createData.bug_hotlist_id
    ? Array.isArray(createData.bug_hotlist_id)
      ? createData.bug_hotlist_id
      : [createData.bug_hotlist_id]
    : [];

  return {
    'bug_title': bugTemplate.value.bug_reported_title,
    'bug_description': bugTemplate.value.templateDescription,
    'bug_type': createData.bug_type || 'BUG',
    'bug_component_id': createData.bug_component_id,
    'bug_hotlist_id': hotlistArray,
    'bug_priority': bugTemplate.value.bug_priority,
    'bug_severity': bugTemplate.value.bug_severity || 'S2',
    'format': createData.format || 'MARKDOWN',
    'bug_in_prod': createData.bug_in_prod || false,
    'bug_status': 'ASSIGNED',
    'bug_assignee': bugTemplate.value.assignee,
    'bug_template_id': '0',
    'bug_cc_list': ccArray,
  };
}

// ==================== RESET HELPERS ====================

/**
 * Resets the component state and form values after a bug is successfully created.
 * @param ctx The bug suggestion component context.
 */
export function resetAfterCreate(ctx: BugSuggestionComponentContext): void {
  ctx.bugTemplate.reset();
  ctx.templateEnabled = false;
  ctx.aiSummaryEnabled = false;
  ctx.createData = null;
  ctx.generateBugData = null;
  ctx.summaryLines = [];
  ctx.workaroundRecommendation = '';
  ctx.duplicates = [];
  ctx.isLoading = false;
  ctx.isCreating = false;
  ctx.isSuggestingTitle = false;
  ctx.progressValue = 0;
  if (ctx.progressInterval) clearInterval(ctx.progressInterval as number);
  ctx.cdr.detectChanges();
}

/**
 * Resets the component state and form values for initiating a new bug filing.
 * @param ctx The bug suggestion component context.
 */
export function resetForNewBug(ctx: BugSuggestionComponentContext): void {
  ctx.bugTemplate.reset();
  ctx.bugTemplate.patchValue({'assignee': 'chandupavan@google.com'});
  ctx.aiSummaryEnabled = false;
  ctx.templateEnabled = false;
  ctx.summaryLines = [];
  ctx.workaroundRecommendation = '';
  ctx.duplicates = [];
  ctx.createData = null;
  ctx.generateBugData = null;
  ctx.isLoading = false;
  ctx.isCreating = false;
  ctx.isSuggestingTitle = false;
  ctx.progressValue = 0;
  if (ctx.progressInterval) clearInterval(ctx.progressInterval as number);
  ctx.cdr.detectChanges();
}

/**
 * Fully resets the entire main form, bug template form, and component state.
 * @param ctx The bug suggestion component context.
 */
export function reset(ctx: BugSuggestionComponentContext): void {
  ctx.form.reset();
  ctx.bugTemplate.reset();
  ctx.templateEnabled = false;
  ctx.aiSummaryEnabled = false;
  ctx.productAreas = [];
  ctx.filteredProductAreas = [];
  ctx.testingTypes = [];
  ctx.testingOptions = [];
  ctx.bugTypes = [];
  ctx.verticals = [];
  ctx.createData = null;
  ctx.generateBugData = null;
  ctx.isCreating = false;
  ctx.isSuggestingTitle = false;
  ctx.summaryLines = [];
  ctx.workaroundRecommendation = '';
  ctx.duplicates = [];

  ctx.form.controls['product_area'].disable();
  ctx.form.controls['testing_type'].disable();
  ctx.form.controls['testing_options'].disable();
  ctx.form.controls['bugType'].disable();
  ctx.form.controls['vertical'].disable();

  if (ctx.select) ctx.select.value = '';
  ctx.cdr.markForCheck();
}
