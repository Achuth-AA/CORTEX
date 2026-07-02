import {
  BugSuggestionComponentContext,
  CreateIssueResponse,
} from './bug_suggestion_types';
import {
  buildCreatePayload,
  resetAfterCreate,
  resetForNewBug,
} from './bug_suggestion_utils';

/**
 * Creates a bug issue from the current template.
 * @param ctx The component context.
 */
export function createBug(ctx: BugSuggestionComponentContext): void {
  if (!ctx.createData) {
    alert('No bug data available. Please generate a template first.');
    return;
  }
  if (!ctx.bugTemplate.value.bug_reported_title) {
    alert('Please enter a bug title.');
    return;
  }

  ctx.isCreating = true;
  ctx.bugAnalyzeService
    ?.createIssue?.(buildCreatePayload(ctx.createData, ctx.bugTemplate))
    .subscribe({
      next: (response: CreateIssueResponse | null) => {
        ctx.isCreating = false;
        if (response?.create_bug_response) {
          const idMatch = response.create_bug_response.match(
            /issue_created_id:\s*"?(\d+)"?/,
          );
          const issueId = idMatch ? idMatch[1] : 'Unknown';
          alert(
            `Bug created successfully!\n\nIssue ID: ${issueId}\n\nView at: http://b/${issueId}`,
          );
        } else {
          alert('Bug created successfully!');
        }
        resetAfterCreate(ctx);
        ctx.cdr.detectChanges();
      },
      error: (error: Error) => {
        ctx.isCreating = false;
        alert(`Failed to create bug: ${error.message}`);
        ctx.cdr.detectChanges();
      },
    });
}

/**
 * Creates a bug issue and resets the form to start creating another bug.
 * @param ctx The component context.
 */
export function createAndStartAnother(
  ctx: BugSuggestionComponentContext,
): void {
  if (!ctx.createData) {
    alert('No bug data available. Please generate a template first.');
    return;
  }
  if (!ctx.bugTemplate.value.bug_reported_title) {
    alert('Please enter a bug title.');
    return;
  }

  ctx.isCreating = true;
  ctx.bugAnalyzeService
    ?.createIssue?.(buildCreatePayload(ctx.createData, ctx.bugTemplate))
    .subscribe({
      next: (response: CreateIssueResponse | null) => {
        ctx.isCreating = false;
        if (response?.create_bug_response) {
          const idMatch = response.create_bug_response.match(
            /issue_created_id:\s*"?(\d+)"?/,
          );
          const issueId = idMatch ? idMatch[1] : 'Unknown';
          alert(
            `Bug created successfully!\n\nIssue ID: ${issueId}\n\nForm has been reset. You can create another bug.`,
          );
        } else {
          alert(
            'Bug created successfully!\n\nForm has been reset. You can create another bug.',
          );
        }
        resetForNewBug(ctx);
        ctx.cdr.detectChanges();
      },
      error: (error: Error) => {
        ctx.isCreating = false;
        alert(`Failed to create bug: ${error.message}`);
        ctx.cdr.detectChanges();
      },
    });
}

/**
 * Discards the current bug creation flow upon confirmation.
 * @param ctx The component context.
 */
export function discard(ctx: BugSuggestionComponentContext): void {
  const confirmDiscard = confirm(
    'Are you sure you want to discard this bug?\n\nAll entered data will be lost.',
  );
  if (confirmDiscard) resetAfterCreate(ctx);
}

/**
 * Sends processed bug data to the backend.
 * @param ctx The component context.
 * @param bugIssueId The target bug issue ID.
 */
export function processBug(
  ctx: BugSuggestionComponentContext,
  bugIssueId: string | undefined,
): void {
  bugIssueId = '465673126';
  const workaroundText = ctx.workaroundRecommendation
    ? `\n\nWorkaround/Recommendation: ${ctx.workaroundRecommendation}`
    : '';
  /* tslint:disable:enforce-name-casing */
  const processData = {
    bug_issue_id: '465673126',
    comment_text: `${ctx.summaryLines.join('\n')}${workaroundText}`,
    bug_title: 2,
  };
  /* tslint:enable:enforce-name-casing */

  ctx.bugAnalyzeService?.postProcesstoBug?.(processData).subscribe({
    next: () => {
      alert('Processed bug successfully!');
    },
    error: () => {
      alert('Failed to process bug');
    },
  });
}

/**
 * Updates an existing bug with the generated summary and workaround.
 * @param ctx The component context.
 * @param bugIssueId The target bug issue ID.
 */
export function updateBugWithSummary(
  ctx: BugSuggestionComponentContext,
  bugIssueId: string | undefined,
): void {
  bugIssueId = '465673160';
  if (!bugIssueId) {
    alert('Cannot update: Bug ID is missing');
    return;
  }

  const workaroundText = ctx.workaroundRecommendation
    ? `\n\nWorkaround/Recommendation: ${ctx.workaroundRecommendation}`
    : '';
  /* tslint:disable:enforce-name-casing */
  const commentData = {
    bug_issue_id: '465673160',
    comment_text: `${ctx.summaryLines.join('\n')}${workaroundText}`,
    bug_title: ctx.bugTemplate.value.bug_reported_title,
    bug_description: ctx.bugTemplate.value.templateDescription,
  };
  /* tslint:enable:enforce-name-casing */

  ctx.bugAnalyzeService?.postCommentToBug?.(commentData).subscribe({
    next: () => {
      alert('Summary posted to bug successfully!');
      const duplicateIndex = ctx.duplicates.findIndex(
        (d) => d.bugIssueId === bugIssueId,
      );
      if (duplicateIndex !== -1) {
        ctx.duplicates[duplicateIndex].actionItems =
          `Updated on ${new Date().toLocaleDateString()}`;
        ctx.cdr.detectChanges();
      }
    },
    error: () => {
      alert('Failed to post comment to bug');
    },
  });
}
