import 'jasmine';

import {HttpResponse} from '@angular/common/http';
import {ChangeDetectorRef, DestroyRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Observable, Subject, of, throwError} from 'rxjs';

import {
  AiDataResponse,
  BugAnalyzeService,
  BugSuggestionContext,
  goToSummary,
  suggestTitle,
} from './bug_suggestion_ai';
import {
  BugSuggestionSubscriptionContext,
  setupNgOnInitSubscriptions,
} from './bug_suggestion_subscriptions';

describe('bug_suggestion_ai', () => {
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;
  let mockBugTemplate: jasmine.SpyObj<FormGroup>;
  let mockForm: jasmine.SpyObj<FormGroup>;
  let mockBugAnalyzeService: jasmine.SpyObj<BugAnalyzeService>;
  let ctx: BugSuggestionContext;
  let confirmSpy: jasmine.Spy;
  let alertSpy: jasmine.Spy;

  beforeEach(() => {
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    mockBugTemplate = jasmine.createSpyObj('FormGroup', ['patchValue']);
    mockForm = jasmine.createSpyObj('FormGroup', ['patchValue']);

    // Stub the FormGroups' value attributes using getters.
    Object.defineProperty(mockBugTemplate, 'value', {
      get: () => ({
        bugReportedTitle: 'Test Bug',
        templateDescription: 'Expected Description',
      }),
      configurable: true,
    });
    Object.defineProperty(mockForm, 'value', {
      get: () => ({
        productArea: 'Search',
      }),
      configurable: true,
    });

    mockBugAnalyzeService = jasmine.createSpyObj<BugAnalyzeService>(
      'BugAnalyzeService',
      ['aiData', 'suggestTitle'],
    );

    ctx = {
      progressValue: 0,
      isLoading: false,
      cdr: mockCdr,
      bugTemplate: mockBugTemplate,
      bugAnalyzeService: mockBugAnalyzeService,
      workaroundRecommendation: '',
      summaryLines: [],
      duplicates: [],
      aiSummaryEnabled: false,
      isSuggestingTitle: false,
      form: mockForm,
    };

    confirmSpy = spyOn(window, 'confirm');
    alertSpy = spyOn(window, 'alert');
  });

  afterEach(() => {
    if (ctx.progressInterval) {
      clearInterval(ctx.progressInterval);
    }
  });

  describe('goToSummary', () => {
    it('sets loading and progress, and calls bugAnalyzeService', () => {
      mockBugAnalyzeService.aiData.and.returnValue(
        of(
          new HttpResponse({
            body: {
              summary: 'summary: Hello\n"Workaround/Recommendation": Do this',
              duplicateBugs: [],
            },
          }),
        ),
      );

      goToSummary(ctx);

      expect(ctx.isLoading).toBeTrue();
      expect(mockBugAnalyzeService.aiData).toHaveBeenCalledWith({
        bugTitle: 'Test Bug',
        bugDescription: 'Expected Description',
        productArea: 'Omnient',
      });
    });

    it('processes response on success', (done) => {
      const responseEvent = new HttpResponse({
        body: {
          summary:
            'summary: Hello\n"Workaround/Recommendation": Do this\npossible_duplicate_bugs {',
          duplicateBugs: [
            {
              matchScore: '0.865',
              bugTitle: 'Duplicate Bug Title',
              bugStatus: 'New',
              bugPriority: 'P1',
              createdAt: '2026-06-01',
              actionItems: 'None',
              bugIssueId: '12345',
            },
          ],
        },
      });
      mockBugAnalyzeService.aiData.and.returnValue(of(responseEvent));

      goToSummary(ctx);

      setTimeout(() => {
        expect(ctx.isLoading).toBeFalse();
        expect(ctx.progressValue).toBe(100);
        expect(ctx.summaryLines).toEqual(['Hello']);
        expect(ctx.workaroundRecommendation).toBe('Do this');
        expect(ctx.duplicates.length).toBe(1);
        expect(ctx.duplicates[0].matchScore).toBe(0.86);
        expect(ctx.duplicates[0].bugTitle).toBe('Duplicate Bug Title');
        expect(ctx.aiSummaryEnabled).toBeTrue();
        done();
      }, 600);
    });

    it('handles service errors appropriately', () => {
      mockBugAnalyzeService.aiData.and.returnValue(
        throwError(() => new Error('Service Failure')),
      );

      goToSummary(ctx);

      expect(ctx.isLoading).toBeFalse();
      expect(alertSpy).toHaveBeenCalledWith(
        'Error calling backend for AI analysis: Service Failure',
      );
    });

    it('increments progress value using the interval timer', () => {
      jasmine.clock().install();
      mockBugAnalyzeService.aiData.and.returnValue(new Observable());

      goToSummary(ctx);

      expect(ctx.progressValue).toBe(0);

      jasmine.clock().tick(200);
      expect(ctx.progressValue).toBe(5);

      jasmine.clock().tick(400);
      expect(ctx.progressValue).toBe(15);

      jasmine.clock().tick(4000);
      expect(ctx.progressValue).toBe(95);

      jasmine.clock().uninstall();
    });

    it('handles response without summary or duplicate bugs', (done) => {
      const responseEvent = new HttpResponse<AiDataResponse>({
        body: {
          summary: '',
          duplicateBugs: undefined,
        } as unknown as AiDataResponse,
      });
      mockBugAnalyzeService.aiData.and.returnValue(of(responseEvent));

      goToSummary(ctx);

      setTimeout(() => {
        expect(ctx.summaryLines).toEqual([]);
        expect(ctx.workaroundRecommendation).toBe('');
        expect(ctx.duplicates).toEqual([]);
        done();
      }, 600);
    });
    it('handles null response body', (done) => {
      const responseEvent = new HttpResponse<AiDataResponse>({
        body: null as unknown as AiDataResponse,
      });
      mockBugAnalyzeService.aiData.and.returnValue(of(responseEvent));

      goToSummary(ctx);

      setTimeout(() => {
        expect(ctx.summaryLines).toEqual([]);
        expect(ctx.workaroundRecommendation).toBe('');
        expect(ctx.duplicates).toEqual([]);
        done();
      }, 600);
    });
  });

  describe('suggestTitle', () => {
    it('alerts if title is missing', () => {
      const emptyTemplate = jasmine.createSpyObj('FormGroup', ['patchValue']);
      Object.defineProperty(emptyTemplate, 'value', {
        get: () => ({bugReportedTitle: ''}),
        configurable: true,
      });
      const emptyCtx = {
        ...ctx,
        bugTemplate: emptyTemplate,
      };

      suggestTitle(emptyCtx);

      expect(alertSpy).toHaveBeenCalledWith(
        'Please enter a title first before requesting AI suggestion.',
      );
      expect(mockBugAnalyzeService.suggestTitle).not.toHaveBeenCalled();
    });

    it('calls suggestTitle service and updates the title if confirmed', () => {
      mockBugAnalyzeService.suggestTitle.and.returnValue(
        of({
          success: true,
          suggestedTitle: 'New AI Suggested Title',
        }),
      );
      confirmSpy.and.returnValue(true);

      suggestTitle(ctx);

      expect(ctx.isSuggestingTitle).toBeFalse();
      expect(mockBugAnalyzeService.suggestTitle).toHaveBeenCalledWith({
        originalTitle: 'Test Bug',
        bugDescription: 'Expected Description',
        productArea: 'Search',
      });
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockBugTemplate.patchValue).toHaveBeenCalledWith({
        'bugReportedTitle': 'New AI Suggested Title',
      });
    });

    it('does not update title if confirmation is cancelled', () => {
      mockBugAnalyzeService.suggestTitle.and.returnValue(
        of({
          success: true,
          suggestedTitle: 'New AI Suggested Title',
        }),
      );
      confirmSpy.and.returnValue(false);

      suggestTitle(ctx);

      expect(mockBugTemplate.patchValue).not.toHaveBeenCalled();
    });

    it('alerts on service error', () => {
      mockBugAnalyzeService.suggestTitle.and.returnValue(
        throwError(() => new Error('Network error')),
      );

      suggestTitle(ctx);

      expect(ctx.isSuggestingTitle).toBeFalse();
      expect(alertSpy).toHaveBeenCalledWith(
        'Failed to suggest title: Network error',
      );
    });

    it('alerts if suggestTitle response success is false', () => {
      mockBugAnalyzeService.suggestTitle.and.returnValue(
        of({
          success: false,
          suggestedTitle: '',
        }),
      );

      suggestTitle(ctx);

      expect(ctx.isSuggestingTitle).toBeFalse();
      expect(alertSpy).toHaveBeenCalledWith(
        'Could not generate a suggested title. Please try again.',
      );
    });
  });

  describe('setupNgOnInitSubscriptions', () => {
    let mockDestroyRef: jasmine.SpyObj<DestroyRef>;
    interface MockControl {
      valueChanges: Subject<string | null | undefined>;
      reset: jasmine.Spy;
      enable: jasmine.Spy;
      disable: jasmine.Spy;
      value?: string | null;
    }

    let destroyCallbacks: Array<() => void> = [];
    let controls: Record<string, MockControl>;
    let mockCtx: BugSuggestionSubscriptionContext;

    beforeEach(() => {
      destroyCallbacks = [];
      mockDestroyRef = jasmine.createSpyObj<DestroyRef>('DestroyRef', [
        'onDestroy',
      ]);
      mockDestroyRef.onDestroy.and.callFake((callback: () => void) => {
        destroyCallbacks.push(callback);
        return () => {};
      });

      controls = {
        'portfolio': {
          valueChanges: new Subject<string | null | undefined>(),
          reset: jasmine.createSpy('reset'),
          enable: jasmine.createSpy('enable'),
          disable: jasmine.createSpy('disable'),
          value: undefined,
        },
        'product_area': {
          valueChanges: new Subject<string | null | undefined>(),
          reset: jasmine.createSpy('reset'),
          enable: jasmine.createSpy('enable'),
          disable: jasmine.createSpy('disable'),
          value: undefined,
        },
        'testing_type': {
          valueChanges: new Subject<string | null | undefined>(),
          reset: jasmine.createSpy('reset'),
          enable: jasmine.createSpy('enable'),
          disable: jasmine.createSpy('disable'),
          value: undefined,
        },
        'testing_options': {
          valueChanges: new Subject<string | null | undefined>(),
          reset: jasmine.createSpy('reset'),
          enable: jasmine.createSpy('enable'),
          disable: jasmine.createSpy('disable'),
          value: undefined,
        },
        'bugType': {
          valueChanges: new Subject<string | null | undefined>(),
          reset: jasmine.createSpy('reset'),
          enable: jasmine.createSpy('enable'),
          disable: jasmine.createSpy('disable'),
          value: undefined,
        },
        'vertical': {
          valueChanges: new Subject<string | null | undefined>(),
          reset: jasmine.createSpy('reset'),
          enable: jasmine.createSpy('enable'),
          disable: jasmine.createSpy('disable'),
          value: undefined,
        },
      };

      mockCtx = {
        form: {
          get: (name: string) => controls[name] || null,
        },
        filterConfig: {
          'GWS': {
            testingTypes: ['Regression'],
            testingOptions: ['en-US'],
            bugTypes: {
              'Regression': ['Push Blocker'],
            },
            verticals: {
              'Regression': {
                'Push Blocker': ['REG Push Blocker'],
              },
            },
          },
        },
        testingTypes: [],
        testingOptions: [],
        bugTypes: [],
        verticals: [],
      };

      setupNgOnInitSubscriptions(mockCtx, mockDestroyRef);
    });

    it('handles portfolio valueChanges correctly for Search', () => {
      controls['portfolio'].valueChanges.next('Search');

      expect(controls['testing_type'].reset).toHaveBeenCalled();
      expect(controls['testing_options'].reset).toHaveBeenCalled();
      expect(controls['bugType'].reset).toHaveBeenCalled();
      expect(controls['vertical'].reset).toHaveBeenCalled();

      expect(mockCtx.testingTypes).toEqual([]);
      expect(mockCtx.testingOptions).toEqual([]);
      expect(mockCtx.bugTypes).toEqual([]);
      expect(mockCtx.verticals).toEqual([]);

      expect(controls['product_area'].enable).toHaveBeenCalled();
      expect(controls['testing_type'].disable).toHaveBeenCalled();
      expect(controls['testing_options'].disable).toHaveBeenCalled();
      expect(controls['bugType'].disable).toHaveBeenCalled();
      expect(controls['vertical'].disable).toHaveBeenCalled();
    });

    it('handles portfolio valueChanges correctly for other values', () => {
      controls['portfolio'].valueChanges.next('Other');

      expect(controls['product_area'].disable).toHaveBeenCalled();
      expect(controls['testing_type'].disable).toHaveBeenCalled();
      expect(controls['testing_options'].disable).toHaveBeenCalled();
      expect(controls['bugType'].disable).toHaveBeenCalled();
      expect(controls['vertical'].disable).toHaveBeenCalled();
    });

    it('handles product_area valueChanges correctly with valid config', () => {
      controls['product_area'].valueChanges.next('GWS');

      expect(mockCtx.testingTypes).toEqual(['Regression']);
      expect(controls['testing_type'].enable).toHaveBeenCalled();
      expect(mockCtx.testingOptions).toEqual(['en-US']);
      expect(controls['testing_options'].enable).toHaveBeenCalled();
      expect(controls['bugType'].disable).toHaveBeenCalled();
      expect(controls['vertical'].disable).toHaveBeenCalled();
    });

    it('handles product_area valueChanges correctly when config is not matching', () => {
      controls['product_area'].valueChanges.next('Unknown');

      expect(mockCtx.testingTypes).toEqual([]);
      expect(controls['testing_type'].disable).toHaveBeenCalled();
      expect(controls['testing_options'].disable).toHaveBeenCalled();
      expect(controls['bugType'].disable).toHaveBeenCalled();
      expect(controls['vertical'].disable).toHaveBeenCalled();
    });

    it('handles testing_type valueChanges correctly with valid config', () => {
      controls['product_area'].value = 'GWS';
      controls['testing_type'].valueChanges.next('Regression');

      expect(mockCtx.bugTypes).toEqual(['Push Blocker']);
      expect(controls['bugType'].enable).toHaveBeenCalled();
      expect(controls['vertical'].disable).toHaveBeenCalled();
    });

    it('handles bugType valueChanges correctly with valid config', () => {
      controls['product_area'].value = 'GWS';
      controls['testing_type'].value = 'Regression';
      controls['bugType'].valueChanges.next('Push Blocker');

      expect(mockCtx.verticals).toEqual(['REG Push Blocker']);
      expect(controls['vertical'].enable).toHaveBeenCalled();
    });

    it('clears and stops reacting to emissions after destroyRef completes', () => {
      expect(destroyCallbacks.length).toBe(4);
      for (const cb of destroyCallbacks) {
        cb();
      }

      // Emit on portfolio after destroy: no resets should be triggered.
      controls['portfolio'].reset.calls.reset();
      controls['portfolio'].valueChanges.next('Search');
      expect(controls['testing_type'].reset).not.toHaveBeenCalled();
    });
  });
});
