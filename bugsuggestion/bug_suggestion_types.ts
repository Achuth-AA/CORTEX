import {ChangeDetectorRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';

/**
 * Configuration for filtering bug suggestions based on product area, testing type, bug type and vertical.
 */
export interface FilterConfig {
  readonly testingTypes: readonly string[];
  readonly testingOptions: readonly string[];
  readonly bugTypes: {readonly [testingType: string]: readonly string[]};
  readonly verticals: {
    readonly [testingType: string]: {
      readonly [bugType: string]: readonly string[];
    };
  };
}

/**
 * Portfolio options.
 */
export enum Portfolio {
  ASSISTANT = 'Assistant',
  SEARCH = 'Search',
}

/**
 * Context interface for portfolio subscription setup.
 */
export interface PortfolioSubscriptionContext {
  form: FormGroup;
  allSearchProductAreas: readonly string[];
  allProductAreas: readonly string[];
  productAreas: string[];
}

/**
 * Data structure for bug creation input.
 */
/* tslint:disable:enforce-name-casing */
export interface CreateBugData {
  bug_hotlist_id?: string | string[];
  bug_type?: string;
  bug_component_id?: string;
  format?: string;
  bug_in_prod?: boolean;
  [key: string]: unknown;
}

/**
 * Interface for bug template form group representation.
 */
export interface BugTemplateForm {
  value: {
    cc?: string;
    bug_reported_title?: string;
    templateDescription?: string;
    bug_priority?: string;
    bug_severity?: string;
    assignee?: string;
    [key: string]: unknown;
  };
  reset(): void;
  patchValue(value: Record<string, unknown>): void;
}

/**
 * Response structure from create issue API.
 */
export interface CreateIssueResponse {
  create_bug_response?: string;
}

/**
 * Response structure from bug analyze search API.
 */
export interface SearchApiResponse {
  raised_bug_template?: string;
}
/* tslint:enable:enforce-name-casing */

/**
 * Comprehensive context interface for bug suggestion component state.
 */
export interface BugSuggestionComponentContext {
  form: FormGroup;
  bugTemplate: FormGroup | BugTemplateForm;
  templateEnabled: boolean;
  aiSummaryEnabled: boolean;
  createData: CreateBugData | null;
  generateBugData: unknown | null;
  summaryLines: string[];
  workaroundRecommendation: string;
  duplicates: Array<{
    bugIssueId?: string;
    actionItems?: string;
    [key: string]: unknown;
  }>;
  isLoading: boolean;
  isCreating: boolean;
  isSuggestingTitle: boolean;
  isSearchButtonDisabled?: boolean;
  bugAnalyzeService?: {
    getSearchAPI(data: unknown): Observable<SearchApiResponse | null>;
    createIssue?(payload: unknown): Observable<CreateIssueResponse | null>;
    postProcesstoBug?(data: unknown): Observable<unknown>;
    postCommentToBug?(data: unknown): Observable<unknown>;
    [key: string]: unknown;
  };
  progressValue: number;
  progressInterval?: ReturnType<typeof setInterval> | number | null;
  cdr: ChangeDetectorRef | {detectChanges(): void; markForCheck(): void};
  productAreas: string[];
  filteredProductAreas: string[];
  testingTypes: string[];
  testingOptions: string[];
  bugTypes: string[];
  verticals: string[];
  select?: {value: string};
  allSearchProductAreas?: readonly string[];
  allProductAreas?: readonly string[];
  [key: string]: unknown;
}
