import {HttpEvent, HttpResponse} from '@angular/common/http';
import {ChangeDetectorRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';

/**
 * Response for a single duplicate bug.
 */
interface DuplicateBugResponse {
  readonly matchScore: string;
  readonly bugTitle: string;
  readonly bugStatus: string;
  readonly bugPriority: string;
  readonly createdAt: string;
  readonly actionItems: string;
  readonly bugIssueId: string;
}

/**
 * Response for AI data analysis.
 */
export interface AiDataResponse {
  readonly summary: string;
  readonly duplicateBugs: readonly DuplicateBugResponse[];
}

/**
 * Response for title suggestion.
 */
interface SuggestTitleResponse {
  readonly success: boolean;
  readonly suggestedTitle: string;
}

/**
 * Service for bug analysis.
 */
export interface BugAnalyzeService {
  aiData(data: {
    readonly bugTitle: string;
    readonly bugDescription: string;
    readonly productArea: string;
  }): Observable<HttpEvent<AiDataResponse>>;
  suggestTitle(data: {
    readonly originalTitle: string;
    readonly bugDescription: string;
    readonly productArea: string;
  }): Observable<SuggestTitleResponse>;
}

/**
 * Duplicate bug interface.
 */
interface BugDuplicate {
  readonly bugTitle: string;
  readonly bugStatus: string;
  readonly matchScore: number;
  readonly bugPriority: string;
  readonly createdAt: string;
  readonly actionItems: string;
  readonly bugIssueId: string;
}

/**
 * Context for bug suggestion component.
 */
export interface BugSuggestionContext {
  progressValue: number;
  isLoading: boolean;
  progressInterval?: number;
  readonly cdr: ChangeDetectorRef;
  readonly bugTemplate: FormGroup;
  readonly bugAnalyzeService: BugAnalyzeService;
  workaroundRecommendation: string;
  summaryLines: readonly string[];
  duplicates: readonly BugDuplicate[];
  aiSummaryEnabled: boolean;
  isSuggestingTitle: boolean;
  readonly form: FormGroup;
}

/**
 * Performs AI analysis on the bug description to generate a summary and find
 * potential duplicates.
 */
export function goToSummary(ctx: BugSuggestionContext): void {
  ctx.progressValue = 0;
  ctx.isLoading = true;
  if (ctx.progressInterval) clearInterval(ctx.progressInterval);

  ctx.progressInterval = setInterval(() => {
    if (ctx.progressValue < 95) {
      ctx.progressValue += 5;
      ctx.cdr.detectChanges();
    } else {
      clearInterval(ctx.progressInterval);
    }
  }, 200);

  const data = {
    bugTitle: ctx.bugTemplate.value.bugReportedTitle,
    bugDescription: ctx.bugTemplate.value.templateDescription,
    productArea: 'Omnient',
  };

  ctx.bugAnalyzeService.aiData(data).subscribe({
    next: (event: HttpEvent<AiDataResponse>) => {
      if (!(event instanceof HttpResponse)) return;

      clearInterval(ctx.progressInterval);
      ctx.progressValue = 100;
      ctx.cdr.detectChanges();

      const response = event.body;
      setTimeout(() => {
        ctx.isLoading = false;

        if (response) {
          if (response.summary) {
            let summaryText = response.summary;
            const dupIdx = summaryText.indexOf('possible_duplicate_bugs {');
            if (dupIdx !== -1) {
              summaryText = summaryText.substring(0, dupIdx).trim();
            }

            const workaroundMatch = summaryText.match(
              /"Workaround\/Recommendation":\s*(.+)/s,
            );
            if (workaroundMatch) {
              ctx.workaroundRecommendation = workaroundMatch[1].trim();
              summaryText = summaryText.replace(workaroundMatch[0], '').trim();
            } else {
              ctx.workaroundRecommendation = '';
            }
            ctx.summaryLines = summaryText
              .replace('summary: ', '')
              .trim()
              .split('\n');
          } else {
            ctx.summaryLines = [];
            ctx.workaroundRecommendation = '';
          }

          if (response.duplicateBugs) {
            ctx.duplicates = response.duplicateBugs.map(
              (db: DuplicateBugResponse) => {
                const score = Number(db.matchScore);
                return {
                  bugTitle: db.bugTitle || '',
                  bugStatus: db.bugStatus || 'N/A',
                  matchScore: !isNaN(score) ? Number(score.toFixed(2)) : 0,
                  bugPriority: db.bugPriority || '',
                  createdAt: db.createdAt || '',
                  actionItems: db.actionItems || '',
                  bugIssueId: db.bugIssueId || '',
                };
              },
            );
          } else {
            ctx.duplicates = [];
          }
        } else {
          ctx.summaryLines = [];
          ctx.workaroundRecommendation = '';
          ctx.duplicates = [];
        }

        ctx.aiSummaryEnabled = true;
        ctx.cdr.detectChanges();
      }, 500);
    },
    error: (error: Error) => {
      clearInterval(ctx.progressInterval);
      ctx.isLoading = false;
      ctx.cdr.detectChanges();
      alert(`Error calling backend for AI analysis: ${error.message}`);
    },
  });
}

/**
 * Suggests a title for the bug based on its description via AI.
 */
export function suggestTitle(ctx: BugSuggestionContext): void {
  const currentTitle = ctx.bugTemplate.value.bugReportedTitle;
  if (!currentTitle || currentTitle.trim() === '') {
    alert('Please enter a title first before requesting AI suggestion.');
    return;
  }

  ctx.isSuggestingTitle = true;
  const data = {
    originalTitle: currentTitle,
    bugDescription: ctx.bugTemplate.value.templateDescription || '',
    productArea: ctx.form.value.productArea || '',
  };

  ctx.bugAnalyzeService.suggestTitle(data).subscribe({
    next: (response: SuggestTitleResponse) => {
      ctx.isSuggestingTitle = false;
      if (response?.success && response.suggestedTitle) {
        const userChoice = confirm(
          `AI Suggested Title:\n\n"${response.suggestedTitle}"\n\nClick OK to Apply this title, or Cancel to keep your original title.`,
        );
        if (userChoice) {
          ctx.bugTemplate.patchValue({
            'bugReportedTitle': response.suggestedTitle,
          });
          ctx.cdr.detectChanges();
        }
      } else {
        alert('Could not generate a suggested title. Please try again.');
      }
    },
    error: (error: Error) => {
      ctx.isSuggestingTitle = false;
      alert(`Failed to suggest title: ${error.message}`);
      ctx.cdr.detectChanges();
    },
  });
}
