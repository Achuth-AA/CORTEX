import {FormBuilder} from '@angular/forms';
import 'jasmine';
import {
  BugSuggestionComponentContext,
  BugTemplateForm,
  CreateBugData,
  Portfolio,
} from './bug_suggestion_types';
import {
  buildCreatePayload,
  getRelativeTime,
  reset,
  resetAfterCreate,
  resetForNewBug,
  toTitleCase,
  updateProductAreaFilter,
} from './bug_suggestion_utils';

describe('bug_suggestion_utils', () => {
  let fb: FormBuilder;

  beforeEach(() => {
    fb = new FormBuilder();
  });

  describe('toTitleCase', () => {
    it('converts string to title case', () => {
      expect(toTitleCase('hello')).toBe('Hello');
      expect(toTitleCase('WORLD')).toBe('World');
      expect(toTitleCase('tESTing')).toBe('Testing');
      expect(toTitleCase('')).toBe('');
    });
  });

  describe('getRelativeTime', () => {
    it('returns empty string if no input', () => {
      expect(getRelativeTime('')).toBe('');
    });

    it('returns input if invalid date', () => {
      expect(getRelativeTime('invalid-date')).toBe('invalid-date');
    });

    it('calculates relative time correctly', () => {
      const now = new Date();
      const tenSecondsAgo = new Date(now.getTime() - 10 * 1000).toISOString();
      const fiveMinutesAgo = new Date(
        now.getTime() - 5 * 60 * 1000,
      ).toISOString();
      const twoHoursAgo = new Date(
        now.getTime() - 2 * 3600 * 1000,
      ).toISOString();

      expect(getRelativeTime(tenSecondsAgo)).toBe('10 seconds ago');
      expect(getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
      expect(getRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });

    it('returns just now for current time', () => {
      const now = new Date().toISOString();
      expect(getRelativeTime(now)).toBe('just now');
    });
  });

  describe('updateProductAreaFilter', () => {
    it('filters product areas based on search term for Search portfolio', () => {
      const ctx = {
        form: fb.group({
          portfolio: [Portfolio.SEARCH],
          productAreaSearchTerm: ['search'],
        }),
        allSearchProductAreas: ['GWS', 'Search Verticals', 'Discover', 'AMP'],
        allProductAreas: ['Wearables', 'Assistant UO', 'NGA'],
        productAreas: [] as string[],
      } as unknown as BugSuggestionComponentContext;

      updateProductAreaFilter(ctx);
      expect(ctx.productAreas).toEqual(['Search Verticals']);
    });

    it('resets product areas when search term is empty', () => {
      const ctx = {
        form: fb.group({
          portfolio: [Portfolio.SEARCH],
          productAreaSearchTerm: [''],
        }),
        allSearchProductAreas: ['GWS', 'Search Verticals', 'Discover', 'AMP'],
        allProductAreas: ['Wearables', 'Assistant UO', 'NGA'],
        productAreas: [] as string[],
      } as unknown as BugSuggestionComponentContext;

      updateProductAreaFilter(ctx);
      expect(ctx.productAreas).toEqual([
        'GWS',
        'Search Verticals',
        'Discover',
        'AMP',
      ]);
    });
  });

  describe('buildCreatePayload', () => {
    it('builds payload with provided data', () => {
      const createData = {
        'bug_type': 'VULNERABILITY',
        'bug_component_id': '12345',
        'bug_hotlist_id': ['54321'],
        'format': 'HTML',
        'bug_in_prod': true,
      } as unknown as CreateBugData;

      const bugTemplate = {
        value: {
          'bug_reported_title': 'Test Bug',
          'templateDescription': 'Test Description',
          'bug_priority': 'P1',
          'bug_severity': 'S1',
          'assignee': 'test@google.com',
          'cc': 'cc1@google.com, cc2@google.com',
        },
      } as unknown as BugTemplateForm;

      const payload = buildCreatePayload(createData, bugTemplate);

      expect(payload).toEqual({
        'bug_title': 'Test Bug',
        'bug_description': 'Test Description',
        'bug_type': 'VULNERABILITY',
        'bug_component_id': '12345',
        'bug_hotlist_id': ['54321'],
        'bug_priority': 'P1',
        'bug_severity': 'S1',
        'format': 'HTML',
        'bug_in_prod': true,
        'bug_status': 'ASSIGNED',
        'bug_assignee': 'test@google.com',
        'bug_template_id': '0',
        'bug_cc_list': ['cc1@google.com', 'cc2@google.com'],
      });
    });

    it('builds payload with default values', () => {
      const createData = {
        'bug_component_id': '12345',
      } as unknown as CreateBugData;

      const bugTemplate = {
        value: {
          'bug_reported_title': 'Test Bug',
          'templateDescription': 'Test Description',
          'bug_priority': 'P2',
          'assignee': 'test@google.com',
        },
      } as unknown as BugTemplateForm;

      const payload = buildCreatePayload(createData, bugTemplate);

      expect(payload).toEqual({
        'bug_title': 'Test Bug',
        'bug_description': 'Test Description',
        'bug_type': 'BUG',
        'bug_component_id': '12345',
        'bug_hotlist_id': [],
        'bug_priority': 'P2',
        'bug_severity': 'S2',
        'format': 'MARKDOWN',
        'bug_in_prod': false,
        'bug_status': 'ASSIGNED',
        'bug_assignee': 'test@google.com',
        'bug_template_id': '0',
        'bug_cc_list': [],
      });
    });
  });

  describe('resetAfterCreate', () => {
    it('resets context properties correctly', () => {
      const ctx = {
        bugTemplate: {reset: jasmine.createSpy('reset')},
        templateEnabled: true,
        aiSummaryEnabled: true,
        createData: {},
        generateBugData: {},
        summaryLines: ['line1'],
        workaroundRecommendation: 'workaround',
        duplicates: [1, 2],
        isLoading: true,
        isCreating: true,
        isSuggestingTitle: true,
        progressValue: 50,
        progressInterval: setInterval(() => {}, 10000),
        cdr: {detectChanges: jasmine.createSpy('detectChanges')},
      } as unknown as BugSuggestionComponentContext;

      resetAfterCreate(ctx);

      expect(ctx.bugTemplate.reset as jasmine.Spy).toHaveBeenCalled();
      expect(ctx.templateEnabled).toBeFalse();
      expect(ctx.aiSummaryEnabled).toBeFalse();
      expect(ctx.createData).toBeNull();
      expect(ctx.generateBugData).toBeNull();
      expect(ctx.summaryLines).toEqual([]);
      expect(ctx.workaroundRecommendation).toBe('');
      expect(ctx.duplicates).toEqual([]);
      expect(ctx.isLoading).toBeFalse();
      expect(ctx.isCreating).toBeFalse();
      expect(ctx.isSuggestingTitle).toBeFalse();
      expect(ctx.progressValue).toBe(0);
      expect(ctx.cdr.detectChanges as jasmine.Spy).toHaveBeenCalled();
    });
  });

  describe('resetForNewBug', () => {
    it('resets context properties for new bug correctly', () => {
      const ctx = {
        bugTemplate: {
          reset: jasmine.createSpy('reset'),
          patchValue: jasmine.createSpy('patchValue'),
        },
        aiSummaryEnabled: true,
        templateEnabled: true,
        summaryLines: ['line1'],
        workaroundRecommendation: 'workaround',
        duplicates: [1, 2],
        createData: {},
        generateBugData: {},
        isLoading: true,
        isCreating: true,
        isSuggestingTitle: true,
        progressValue: 50,
        progressInterval: setInterval(() => {}, 10000),
        cdr: {detectChanges: jasmine.createSpy('detectChanges')},
      } as unknown as BugSuggestionComponentContext;

      resetForNewBug(ctx);

      expect(ctx.bugTemplate.reset as jasmine.Spy).toHaveBeenCalled();
      expect(ctx.bugTemplate.patchValue as jasmine.Spy).toHaveBeenCalledWith({
        'assignee': 'chandupavan@google.com',
      });
      expect(ctx.aiSummaryEnabled).toBeFalse();
      expect(ctx.templateEnabled).toBeFalse();
      expect(ctx.summaryLines).toEqual([]);
      expect(ctx.workaroundRecommendation).toBe('');
      expect(ctx.duplicates).toEqual([]);
      expect(ctx.createData).toBeNull();
      expect(ctx.generateBugData).toBeNull();
      expect(ctx.isLoading).toBeFalse();
      expect(ctx.isCreating).toBeFalse();
      expect(ctx.isSuggestingTitle).toBeFalse();
      expect(ctx.progressValue).toBe(0);
      expect(ctx.cdr.detectChanges as jasmine.Spy).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('resets entire form and context correctly', () => {
      const mockControl = {disable: jasmine.createSpy('disable')};
      const ctx = {
        form: {
          reset: jasmine.createSpy('reset'),
          controls: {
            'product_area': mockControl,
            'testing_type': mockControl,
            'testing_options': mockControl,
            'bugType': mockControl,
            'vertical': mockControl,
          },
        },
        bugTemplate: {reset: jasmine.createSpy('reset')},
        templateEnabled: true,
        aiSummaryEnabled: true,
        productAreas: ['area1'],
        filteredProductAreas: ['area1'],
        testingTypes: ['type1'],
        testingOptions: ['opt1'],
        bugTypes: ['btype1'],
        verticals: ['vert1'],
        createData: {},
        generateBugData: {},
        isCreating: true,
        isSuggestingTitle: true,
        summaryLines: ['line1'],
        workaroundRecommendation: 'workaround',
        duplicates: [1, 2],
        select: {value: 'selected'},
        cdr: {markForCheck: jasmine.createSpy('markForCheck')},
      } as unknown as BugSuggestionComponentContext;

      reset(ctx);

      expect(ctx.form.reset as jasmine.Spy).toHaveBeenCalled();
      expect(ctx.bugTemplate.reset as jasmine.Spy).toHaveBeenCalled();
      expect(ctx.templateEnabled).toBeFalse();
      expect(ctx.aiSummaryEnabled).toBeFalse();
      expect(ctx.productAreas).toEqual([]);
      expect(ctx.filteredProductAreas).toEqual([]);
      expect(ctx.testingTypes).toEqual([]);
      expect(ctx.testingOptions).toEqual([]);
      expect(ctx.bugTypes).toEqual([]);
      expect(ctx.verticals).toEqual([]);
      expect(ctx.createData).toBeNull();
      expect(ctx.generateBugData).toBeNull();
      expect(ctx.isCreating).toBeFalse();
      expect(ctx.isSuggestingTitle).toBeFalse();
      expect(ctx.summaryLines).toEqual([]);
      expect(ctx.workaroundRecommendation).toBe('');
      expect(ctx.duplicates).toEqual([]);
      expect(mockControl.disable).toHaveBeenCalledTimes(5);
      expect(ctx.select!.value).toBe('');
      expect(
        (ctx.cdr as unknown as {markForCheck: jasmine.Spy}).markForCheck,
      ).toHaveBeenCalled();
    });
  });
});
