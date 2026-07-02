import 'jasmine';

import {DestroyRef} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {
  createAdvanceForm,
  createBugTemplateForm,
  createMainForm,
  setupPortfolioConstructorSubscription,
} from './bug_suggestion_forms';
import {Portfolio, PortfolioSubscriptionContext} from './bug_suggestion_types';
import {updateProductAreaFilter} from './bug_suggestion_utils';

describe('bug_suggestion_forms', () => {
  let fb: FormBuilder;

  beforeEach(() => {
    fb = new FormBuilder();
  });

  describe('createMainForm', () => {
    it('creates a form group with expected controls', () => {
      const form = createMainForm(fb);
      expect(form.get('portfolio')).toBeTruthy();
      expect(form.get('product_area')).toBeTruthy();
      expect(form.get('hotlist_id')).toBeTruthy();
      expect(form.get('testing_type')).toBeTruthy();
      expect(form.get('testing_options')).toBeTruthy();
      expect(form.get('bugType')).toBeTruthy();
      expect(form.get('vertical')).toBeTruthy();
      expect(form.get('productAreaSearchTerm')).toBeTruthy();
      expect(form.get('selectedProductArea')).toBeTruthy();

      expect(form.get('portfolio')?.valid).toBeFalse();
      expect(form.get('product_area')?.disabled).toBeTrue();
    });
  });

  describe('createAdvanceForm', () => {
    it('creates advance form with expected controls', () => {
      const form = createAdvanceForm(fb);
      expect(form.get('advanceSeverity')).toBeTruthy();
      expect(form.get('foundIn')).toBeTruthy();
      expect(form.get('inProd')?.value).toBeFalse();
      expect(form.get('staffing')).toBeTruthy();
    });
  });

  describe('createBugTemplateForm', () => {
    it('creates bug template form with expected controls', () => {
      const form = createBugTemplateForm(fb);
      expect(form.get('bug_reported_component')?.valid).toBeFalse();
    });
  });

  describe('setupPortfolioConstructorSubscription', () => {
    let ctx: PortfolioSubscriptionContext;
    let mockDestroyRef: jasmine.SpyObj<DestroyRef>;

    beforeEach(() => {
      mockDestroyRef = jasmine.createSpyObj('DestroyRef', ['onDestroy']);
      mockDestroyRef.onDestroy.and.returnValue(() => {});

      ctx = {
        form: fb.group({
          portfolio: [''],
          product_area: [{value: '', disabled: true}],
          productAreaSearchTerm: [''],
        }),
        allSearchProductAreas: ['GWS', 'Discover', 'AMP'],
        allProductAreas: ['Wearables', 'Morris', 'NGA'],
        productAreas: [],
      };
      setupPortfolioConstructorSubscription(ctx, mockDestroyRef);
    });

    it('handles Search portfolio changes and enables product_area control', () => {
      ctx.form.get('portfolio')?.setValue(Portfolio.SEARCH);
      expect(ctx.productAreas).toEqual(['GWS', 'Discover', 'AMP']);
      expect(ctx.form.get('product_area')?.disabled).toBeFalse();
    });

    it('handles Assistant portfolio changes and enables product_area control', () => {
      ctx.form.get('portfolio')?.setValue(Portfolio.ASSISTANT);
      expect(ctx.productAreas).toEqual(['Wearables', 'Morris', 'NGA']);
      expect(ctx.form.get('product_area')?.disabled).toBeFalse();
    });

    it('clears productAreas for unknown portfolio', () => {
      ctx.form.get('portfolio')?.setValue('Unknown');
      expect(ctx.productAreas).toEqual([]);
    });

    it('resets product_area and productAreaSearchTerm on portfolio change', () => {
      ctx.form.get('product_area')?.setValue('GWS');
      ctx.form.get('productAreaSearchTerm')?.setValue('G');

      ctx.form.get('portfolio')?.setValue(Portfolio.SEARCH);

      expect(ctx.form.get('product_area')?.value).toEqual({value: ''});
      expect(ctx.form.get('productAreaSearchTerm')?.value).toBe('');
    });
  });

  describe('updateProductAreaFilter', () => {
    let ctx: PortfolioSubscriptionContext;

    beforeEach(() => {
      ctx = {
        form: fb.group({
          portfolio: [Portfolio.SEARCH],
          productAreaSearchTerm: [''],
        }),
        allSearchProductAreas: ['GWS', 'Search Verticals', 'Discover', 'AMP'],
        allProductAreas: ['Wearables', 'Assistant UO', 'NGA'],
        productAreas: [],
      };
    });

    it('sets ctx.productAreas to matching items (case-insensitive)', () => {
      ctx.form.get('productAreaSearchTerm')?.setValue('search');
      updateProductAreaFilter(ctx);
      expect(ctx.productAreas).toEqual(['Search Verticals']);
    });

    it('works with empty search term', () => {
      ctx.form.get('productAreaSearchTerm')?.setValue('');
      updateProductAreaFilter(ctx);
      expect(ctx.productAreas).toEqual([
        'GWS',
        'Search Verticals',
        'Discover',
        'AMP',
      ]);
    });

    it('switches source list based on portfolio', () => {
      ctx.form.get('portfolio')?.setValue(Portfolio.ASSISTANT);
      ctx.form.get('productAreaSearchTerm')?.setValue('a');
      updateProductAreaFilter(ctx);
      expect(ctx.productAreas).toEqual(['Wearables', 'Assistant UO', 'NGA']);
    });
  });
});
