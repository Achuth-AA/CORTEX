import 'jasmine';

import {ChangeDetectorRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Subject, of, throwError} from 'rxjs';
import {search} from './bug_suggestion_search';
import {BugSuggestionComponentContext} from './bug_suggestion_types';

describe('bug_suggestion_search', () => {
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;
  let mockBugTemplate: jasmine.SpyObj<FormGroup>;
  let mockGetSearchAPI: jasmine.Spy;
  let alertSpy: jasmine.Spy;

  beforeEach(() => {
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    mockBugTemplate = jasmine.createSpyObj('FormGroup', ['patchValue']);
    mockGetSearchAPI = jasmine.createSpy('getSearchAPI');
    alertSpy = spyOn(window, 'alert');
  });

  function createMockContext(
    formValueOverrides: Record<string, unknown> = {},
  ): BugSuggestionComponentContext {
    return {
      form: {
        value: {
          'portfolio': 'Search',
          'product_area': 'Discover',
          'testing_type': 'Regression',
          'testing_options': 'en-US',
          'bugType': 'UI Bug',
          'vertical': 'Search Verticals',
          ...formValueOverrides,
        },
      } as unknown as FormGroup,
      isSearchButtonDisabled: false,
      templateEnabled: false,
      bugAnalyzeService: {
        getSearchAPI: mockGetSearchAPI,
      },
      generateBugData: null,
      bugTemplate: mockBugTemplate,
      cdr: mockCdr,
      createData: null,
    } as unknown as BugSuggestionComponentContext;
  }

  describe('search', () => {
    it('search_validFormData_callsGetSearchAPIAndSetsDisabledFlags', () => {
      const ctx = createMockContext();
      mockGetSearchAPI.and.returnValue(new Subject());

      search(ctx);

      expect(ctx.isSearchButtonDisabled).toBeTrue();
      expect(ctx.templateEnabled).toBeTrue();
      expect(mockGetSearchAPI).toHaveBeenCalledWith({
        'portfolio': 'Search',
        'product_area': 'Discover',
        'testing_type': 'Regression',
        'testing_options': 'en-US',
        'bug_types': 'UI Bug',
        'verticals': 'Search Verticals',
      });
    });

    it('search_successfulResponseWithRaisedBugTemplate_parsesTemplateAndPatchesForm', () => {
      const ctx = createMockContext();
      const template =
        'bug_title: "Search Results Missing"\n' +
        'bug_description: "First line\\nSecond line"\n' +
        'bug_priority: "P1"\n' +
        'bug_type: "bug"\n' +
        'bug_severity: "S1"\n' +
        'bug_component_description: "Search > Core"\n' +
        'bug_assignee: "tester@google.com"\n' +
        'bug_cc_list: "dev1@google.com, dev2@google.com"\n' +
        'collaborators: "collab@google.com"\n';
      mockGetSearchAPI.and.returnValue(of({raised_bug_template: template}));

      search(ctx);

      expect(ctx.isSearchButtonDisabled).toBeFalse();
      expect(ctx.generateBugData).toEqual({
        'bug_title': 'Search Results Missing',
        'bug_description': 'First line\\nSecond line',
        'bug_priority': 'P1',
        'bug_type': 'bug',
        'bug_severity': 'S1',
        'bug_component_description': 'Search > Core',
        'bug_assignee': 'tester@google.com',
        'bug_cc_list': 'dev1@google.com, dev2@google.com',
        'collaborators': 'collab@google.com',
      });
      expect(mockBugTemplate.patchValue).toHaveBeenCalledWith({
        'bug_reported_component': 'Search > Core',
        'bug_reported_title': 'Search Results Missing',
        'templateDescription': 'First line\nSecond line',
        'bug_priority': 'P1',
        'bug_status': 'Bug',
        'bug_severity': 'S1',
        'assignee': 'tester@google.com',
        'cc': 'dev1@google.com, dev2@google.com',
        'collaborators': 'collab@google.com',
      });
      expect(mockCdr.detectChanges).toHaveBeenCalled();
    });

    it('search_successfulResponseWithoutRaisedBugTemplate_returnsEarly', () => {
      const ctx = createMockContext();
      mockGetSearchAPI.and.returnValue(of({raised_bug_template: ''}));

      search(ctx);

      expect(ctx.isSearchButtonDisabled).toBeFalse();
      expect(mockBugTemplate.patchValue).not.toHaveBeenCalled();
      expect(ctx.createData).toBeNull();
    });

    it('search_nullResponse_returnsEarly', () => {
      const ctx = createMockContext();
      mockGetSearchAPI.and.returnValue(of(null));

      search(ctx);

      expect(ctx.isSearchButtonDisabled).toBeFalse();
      expect(mockBugTemplate.patchValue).not.toHaveBeenCalled();
    });

    it('search_exploratoryDiscoverSearch_defaultsToDiscoverComponent', () => {
      const ctx = createMockContext({
        'portfolio': 'Search',
        'product_area': 'Discover',
        'testing_type': 'Exploratory',
      });
      const template = 'bug_title: "Title"';
      mockGetSearchAPI.and.returnValue(of({raised_bug_template: template}));

      search(ctx);

      expect(mockBugTemplate.patchValue).toHaveBeenCalledWith(
        jasmine.objectContaining({
          'bug_reported_component':
            'Search > Search Experience > xGA > iGA > Home Page > Discover',
        }),
      );
    });

    it('search_nonExploratorySearch_defaultsToOmnientComponent', () => {
      const ctx = createMockContext({
        'portfolio': 'Search',
        'product_area': 'Discover',
        'testing_type': 'Regression',
      });
      const template = 'bug_title: "Title"';
      mockGetSearchAPI.and.returnValue(of({raised_bug_template: template}));

      search(ctx);

      expect(mockBugTemplate.patchValue).toHaveBeenCalledWith(
        jasmine.objectContaining({
          'bug_reported_component': 'Search > Search Experience > Omnient',
        }),
      );
    });

    it('search_missingAssignee_defaultsToChanduPavan', () => {
      const ctx = createMockContext();
      const template = 'bug_title: "Title"';
      mockGetSearchAPI.and.returnValue(of({raised_bug_template: template}));

      search(ctx);

      expect(mockBugTemplate.patchValue).toHaveBeenCalledWith(
        jasmine.objectContaining({
          assignee: 'chandupavan@google.com',
        }),
      );
      expect(ctx.createData?.['bug_assignee']).toBe('chandupavan@google.com');
    });

    it('search_assigneeKeyVariant_usesAssigneeIfBugAssigneeMissing', () => {
      const ctx = createMockContext();
      const template = 'assignee: "alternate@google.com"';
      mockGetSearchAPI.and.returnValue(of({raised_bug_template: template}));

      search(ctx);

      expect(mockBugTemplate.patchValue).toHaveBeenCalledWith(
        jasmine.objectContaining({
          assignee: 'alternate@google.com',
        }),
      );
    });

    it('search_createsDataWithCcStringAndHotlistArrayCorrectly', () => {
      const ctx = createMockContext();
      const template =
        'bug_title: "T"\n' +
        'bug_description: "D"\n' +
        'bug_type: "BUG"\n' +
        'bug_component_id: "123"\n' +
        'bug_hotlist_id: "456"\n' +
        'bug_priority: "P2"\n' +
        'bug_severity: "S2"\n' +
        'bug_in_prod: "true"\n' +
        'bug_cc_list: " person1@google.com , person2@google.com "\n';
      mockGetSearchAPI.and.returnValue(of({raised_bug_template: template}));

      search(ctx);

      expect(ctx.createData).toEqual({
        'bug_title': 'T',
        'bug_description': 'D',
        'bug_type': 'BUG',
        'bug_component_id': '123',
        'bug_hotlist_id': ['456'],
        'bug_priority': 'P2',
        'bug_severity': 'S2',
        'format': 'MARKDOWN',
        'bug_in_prod': true,
        'bug_status': 'ASSIGNED',
        'bug_assignee': 'chandupavan@google.com',
        'bug_template_id': '0',
        'bug_cc_list': ['person1@google.com', 'person2@google.com'],
      });
    });

    it('search_createsDataWithEmptyHotlistAndCcCorrectly', () => {
      const ctx = createMockContext();
      const template = 'bug_title: "Title"\n';
      mockGetSearchAPI.and.returnValue(of({raised_bug_template: template}));

      search(ctx);

      expect(ctx.createData).toEqual(
        jasmine.objectContaining({
          'bug_hotlist_id': [],
          'bug_cc_list': [],
        }),
      );
    });

    it('search_backendError_alertsUserAndEnablesButton', () => {
      const ctx = createMockContext();
      mockGetSearchAPI.and.returnValue(
        throwError(() => new Error('Server unavailable')),
      );

      search(ctx);

      expect(ctx.isSearchButtonDisabled).toBeFalse();
      expect(alertSpy).toHaveBeenCalledWith(
        'Error calling backend for bug template generation: Server unavailable',
      );
    });
  });
});
