import 'jasmine';

import {FormGroup} from '@angular/forms';
import {of, throwError} from 'rxjs';
import {
  createAndStartAnother,
  createBug,
  discard,
  processBug,
  updateBugWithSummary,
} from './bug_suggestion_create';
import {
  BugSuggestionComponentContext,
  CreateBugData,
  CreateIssueResponse,
} from './bug_suggestion_types';

describe('bug_suggestion_create', () => {
  let mockCtx: BugSuggestionComponentContext;

  beforeEach(() => {
    mockCtx = {
      form: {} as unknown as FormGroup,
      bugTemplate: {
        value: {
          bug_reported_title: 'Test Bug Title',
          templateDescription: 'Test Description',
        },
        reset: jasmine.createSpy('reset'),
        patchValue: jasmine.createSpy('patchValue'),
      },
      templateEnabled: true,
      aiSummaryEnabled: true,
      /* tslint:disable:enforce-name-casing */
      createData: {
        bug_title: 'Test Bug Title',
        bug_description: 'Test Description',
      } as unknown as CreateBugData,
      /* tslint:enable:enforce-name-casing */
      generateBugData: null,
      summaryLines: ['Line 1', 'Line 2'],
      workaroundRecommendation: 'Use fallback',
      duplicates: [{bugIssueId: '465673160', actionItems: 'Old action'}],
      isLoading: false,
      isCreating: false,
      isSuggestingTitle: false,
      bugAnalyzeService: {
        getSearchAPI: jasmine
          .createSpy('getSearchAPI')
          .and.returnValue(of(null)),
        createIssue: jasmine.createSpy('createIssue').and.returnValue(
          of({
            create_bug_response: 'issue_created_id: "123456"',
          } as CreateIssueResponse),
        ),
        postProcesstoBug: jasmine
          .createSpy('postProcesstoBug')
          .and.returnValue(of({})),
        postCommentToBug: jasmine
          .createSpy('postCommentToBug')
          .and.returnValue(of({})),
      },
      progressValue: 0,
      cdr: {
        detectChanges: jasmine.createSpy('detectChanges'),
        markForCheck: jasmine.createSpy('markForCheck'),
      },
      productAreas: [],
      filteredProductAreas: [],
      testingTypes: [],
      testingOptions: [],
      bugTypes: [],
      verticals: [],
    };
  });

  describe('createBug', () => {
    it('missingCreateData_alertsUserAndReturns', () => {
      spyOn(window, 'alert');
      mockCtx.createData = null;

      createBug(mockCtx);

      expect(window.alert).toHaveBeenCalledWith(
        'No bug data available. Please generate a template first.',
      );
      expect(mockCtx.isCreating).toBeFalse();
    });

    it('missingBugTitle_alertsUserAndReturns', () => {
      spyOn(window, 'alert');
      mockCtx.bugTemplate.value.bug_reported_title = '';

      createBug(mockCtx);

      expect(window.alert).toHaveBeenCalledWith('Please enter a bug title.');
      expect(mockCtx.isCreating).toBeFalse();
    });

    it('validInput_createsIssueAndAlertsWithIssueId', () => {
      spyOn(window, 'alert');

      createBug(mockCtx);

      expect(mockCtx.bugAnalyzeService?.createIssue).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(
        'Bug created successfully!\n\nIssue ID: 123456\n\nView at: http://b/123456',
      );
      expect(mockCtx.isCreating).toBeFalse();
      expect(mockCtx.cdr.detectChanges).toHaveBeenCalled();
    });

    it('createIssueFails_alertsErrorMessage', () => {
      spyOn(window, 'alert');
      (mockCtx.bugAnalyzeService?.createIssue as jasmine.Spy).and.returnValue(
        throwError(() => new Error('Network failure')),
      );

      createBug(mockCtx);

      expect(window.alert).toHaveBeenCalledWith(
        'Failed to create bug: Network failure',
      );
      expect(mockCtx.isCreating).toBeFalse();
      expect(mockCtx.cdr.detectChanges).toHaveBeenCalled();
    });

    it('validInputNoIssueId_createsIssueAndAlertsWithoutIssueId', () => {
      spyOn(window, 'alert');
      (mockCtx.bugAnalyzeService?.createIssue as jasmine.Spy).and.returnValue(
        of({create_bug_response: ''} as CreateIssueResponse),
      );

      createBug(mockCtx);

      expect(mockCtx.bugAnalyzeService?.createIssue).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Bug created successfully!');
      expect(mockCtx.isCreating).toBeFalse();
      expect(mockCtx.cdr.detectChanges).toHaveBeenCalled();
    });
  });

  describe('createAndStartAnother', () => {
    it('missingCreateData_alertsUserAndReturns', () => {
      spyOn(window, 'alert');
      mockCtx.createData = null;

      createAndStartAnother(mockCtx);

      expect(window.alert).toHaveBeenCalledWith(
        'No bug data available. Please generate a template first.',
      );
      expect(mockCtx.isCreating).toBeFalse();
    });

    it('missingBugTitle_alertsUserAndReturns', () => {
      spyOn(window, 'alert');
      mockCtx.bugTemplate.value.bug_reported_title = '';

      createAndStartAnother(mockCtx);

      expect(window.alert).toHaveBeenCalledWith('Please enter a bug title.');
      expect(mockCtx.isCreating).toBeFalse();
    });

    it('validInput_createsIssueAndResetsForNewBug', () => {
      spyOn(window, 'alert');

      createAndStartAnother(mockCtx);

      expect(mockCtx.bugAnalyzeService?.createIssue).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(
        'Bug created successfully!\n\nIssue ID: 123456\n\nForm has been reset. You can create another bug.',
      );
      expect(mockCtx.isCreating).toBeFalse();
      expect(mockCtx.cdr.detectChanges).toHaveBeenCalled();
    });

    it('validInputNoIssueId_createsIssueAndAlertsWithoutIssueId', () => {
      spyOn(window, 'alert');
      (mockCtx.bugAnalyzeService?.createIssue as jasmine.Spy).and.returnValue(
        of({create_bug_response: ''} as CreateIssueResponse),
      );

      createAndStartAnother(mockCtx);

      expect(mockCtx.bugAnalyzeService?.createIssue).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(
        'Bug created successfully!\n\nForm has been reset. You can create another bug.',
      );
      expect(mockCtx.isCreating).toBeFalse();
      expect(mockCtx.cdr.detectChanges).toHaveBeenCalled();
    });

    it('createIssueFails_alertsErrorMessage', () => {
      spyOn(window, 'alert');
      (mockCtx.bugAnalyzeService?.createIssue as jasmine.Spy).and.returnValue(
        throwError(() => new Error('Network failure')),
      );

      createAndStartAnother(mockCtx);

      expect(window.alert).toHaveBeenCalledWith(
        'Failed to create bug: Network failure',
      );
      expect(mockCtx.isCreating).toBeFalse();
      expect(mockCtx.cdr.detectChanges).toHaveBeenCalled();
    });
  });

  describe('discard', () => {
    it('userConfirms_resetsAfterCreate', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      discard(mockCtx);

      expect(window.confirm).toHaveBeenCalled();
    });

    it('userCancels_doesNotReset', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      discard(mockCtx);

      expect(window.confirm).toHaveBeenCalled();
    });
  });

  describe('processBug', () => {
    it('postsProcessedBugData_alertsSuccess', () => {
      spyOn(window, 'alert');

      processBug(mockCtx, '465673126');

      expect(mockCtx.bugAnalyzeService?.postProcesstoBug).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Processed bug successfully!');
    });

    it('postProcessFails_alertsFailure', () => {
      spyOn(window, 'alert');
      (
        mockCtx.bugAnalyzeService?.postProcesstoBug as jasmine.Spy
      ).and.returnValue(throwError(() => new Error('Error')));

      processBug(mockCtx, '465673126');

      expect(window.alert).toHaveBeenCalledWith('Failed to process bug');
    });
  });

  describe('updateBugWithSummary', () => {
    it('validBugId_postsCommentAndUpdateDuplicates', () => {
      spyOn(window, 'alert');

      updateBugWithSummary(mockCtx, '465673160');

      expect(mockCtx.bugAnalyzeService?.postCommentToBug).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(
        'Summary posted to bug successfully!',
      );
      expect(mockCtx.duplicates[0].actionItems).toContain('Updated on');
    });

    it('postCommentFails_alertsFailure', () => {
      spyOn(window, 'alert');
      (
        mockCtx.bugAnalyzeService?.postCommentToBug as jasmine.Spy
      ).and.returnValue(throwError(() => new Error('Error')));

      updateBugWithSummary(mockCtx, '465673160');

      expect(window.alert).toHaveBeenCalledWith(
        'Failed to post comment to bug',
      );
    });
  });
});
