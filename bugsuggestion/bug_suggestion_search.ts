import {take} from 'rxjs/operators';
import {
  BugSuggestionComponentContext,
  SearchApiResponse,
} from './bug_suggestion_types';
import {toTitleCase} from './bug_suggestion_utils';

const DEFAULT_DISCOVER_COMPONENT =
  'Search > Search Experience > xGA > iGA > Home Page > Discover';
const DEFAULT_OMNIENT_COMPONENT = 'Search > Search Experience > Omnient';
const DEFAULT_ASSIGNEE_EMAIL = 'chandupavan@google.com';

/**
 * Searches and generates a bug template from the backend based on form selections.
 * @param ctx Component context containing form state and backend service references.
 */
export function search(ctx: BugSuggestionComponentContext): void {
  const data: Record<string, unknown> = {
    'portfolio': ctx.form.value.portfolio,
    'product_area': ctx.form.value.product_area,
    'testing_type': ctx.form.value.testing_type,
    'testing_options': ctx.form.value.testing_options,
    'bug_types': ctx.form.value.bugType,
    'verticals': ctx.form.value.vertical,
  };

  ctx.isSearchButtonDisabled = true;
  ctx.templateEnabled = true;

  ctx.bugAnalyzeService
    ?.getSearchAPI(data)
    ?.pipe(take(1))
    ?.subscribe({
      next: (response: SearchApiResponse | null) => {
        ctx.isSearchButtonDisabled = false;
        if (!response?.raised_bug_template) return;

        const template: string = response.raised_bug_template;
        // Matches key-value pairs (key: value), capturing multi-line values enclosed
        // in quotes or braces up to the next key-value pair on a new line or EOF.
        const keyValuePattern =
          /^([\w_]+):\s*(["{]?(?:.|\n)*?(?=(?:\n\w+:)|$))/gm;
        const bugData: Record<string, string | string[]> = {};
        let match;
        while ((match = keyValuePattern.exec(template)) !== null) {
          const key = match[1];
          bugData[key] = match[2].trim().replace(/^"|"$/g, '');
        }
        ctx.generateBugData = bugData;

        let bugReportedComponent = '';
        if (bugData['bug_component_description']) {
          bugReportedComponent = bugData['bug_component_description'] as string;
        } else if (
          ctx.form.value.portfolio === 'Search' &&
          ctx.form.value.product_area === 'Discover' &&
          ctx.form.value.testing_type === 'Exploratory'
        ) {
          bugReportedComponent = DEFAULT_DISCOVER_COMPONENT;
        } else {
          bugReportedComponent = DEFAULT_OMNIENT_COMPONENT;
        }

        const assignee =
          (bugData['bug_assignee'] as string) ||
          (bugData['assignee'] as string) ||
          DEFAULT_ASSIGNEE_EMAIL;

        ctx.bugTemplate.patchValue({
          'bug_reported_component': bugReportedComponent,
          'bug_reported_title': bugData['bug_title'] || '',
          'templateDescription':
            (bugData['bug_description'] as string)
              ?.replace(/\\n/g, '\n')
              .replace(/\n/g, '\n')
              .replace(/\\"/g, '"') || '',
          'bug_priority': bugData['bug_priority'] || '',
          'bug_status': toTitleCase((bugData['bug_type'] as string) || ''),
          'bug_severity': bugData['bug_severity'] || '',
          'assignee': assignee,
          'cc': bugData['bug_cc_list'] || '',
          'collaborators': bugData['collaborators'] || '',
        });
        ctx.cdr.detectChanges();

        ctx.createData = {
          'bug_title': bugData['bug_title'],
          'bug_description': bugData['bug_description'],
          'bug_type': bugData['bug_type'] as string,
          'bug_component_id': bugData['bug_component_id'] as string,
          'bug_hotlist_id': Array.isArray(bugData['bug_hotlist_id'])
            ? (bugData['bug_hotlist_id'] as string[])
            : bugData['bug_hotlist_id']
              ? [bugData['bug_hotlist_id'] as string]
              : [],
          'bug_priority': bugData['bug_priority'],
          'bug_severity': bugData['bug_severity'],
          'format': (bugData['format'] as string) || 'MARKDOWN',
          'bug_in_prod': bugData['bug_in_prod'] === 'true',
          'bug_status': 'ASSIGNED',
          'bug_assignee': assignee,
          'bug_template_id': '0',
          'bug_cc_list': Array.isArray(bugData['bug_cc_list'])
            ? (bugData['bug_cc_list'] as string[])
            : bugData['bug_cc_list']
              ? (bugData['bug_cc_list'] as string)
                  .split(',')
                  .map((s: string) => s.trim())
              : [],
        };
      },
      error: (error: Error) => {
        ctx.isSearchButtonDisabled = false;
        alert(
          `Error calling backend for bug template generation: ${error.message}`,
        );
      },
    });
}
