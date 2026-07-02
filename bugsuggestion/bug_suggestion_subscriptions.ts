import {DestroyRef} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable} from 'rxjs';
import {FilterConfig} from './bug_suggestion_types';

/** Context interface for component setting up form subscriptions. */
export interface BugSuggestionSubscriptionContext {
  form: {
    get(controlName: string): {
      valueChanges: Observable<string | null | undefined>;
      reset(): void;
      enable(): void;
      disable(): void;
      value?: string | null;
    } | null;
  };
  filterConfig: {[productArea: string]: FilterConfig};
  testingTypes: readonly string[];
  testingOptions: readonly string[];
  bugTypes: readonly string[];
  verticals: readonly string[];
}

/**
 * Mirrors all valueChanges subscriptions from the original ngOnInit.
 *
 * @param ctx The context containing the form and filter configurations.
 * @param destroyRef The DestroyRef hook for automatic observable unsubscribing.
 */
export function setupNgOnInitSubscriptions(
  ctx: BugSuggestionSubscriptionContext,
  destroyRef: DestroyRef,
): void {
  const portfolioControl = ctx.form.get('portfolio');
  const productAreaControl = ctx.form.get('product_area');
  const testingTypeControl = ctx.form.get('testing_type');
  const testingOptionsControl = ctx.form.get('testing_options');
  const bugTypeControl = ctx.form.get('bugType');
  const verticalControl = ctx.form.get('vertical');

  portfolioControl?.valueChanges
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe((value: string | null | undefined) => {
      testingTypeControl?.reset();
      testingOptionsControl?.reset();
      bugTypeControl?.reset();
      verticalControl?.reset();

      ctx.testingTypes = [];
      ctx.testingOptions = [];
      ctx.bugTypes = [];
      ctx.verticals = [];

      if (value === 'Search') {
        productAreaControl?.enable();
        testingTypeControl?.disable();
        testingOptionsControl?.disable();
        bugTypeControl?.disable();
        verticalControl?.disable();
      } else {
        productAreaControl?.disable();
        testingTypeControl?.disable();
        testingOptionsControl?.disable();
        bugTypeControl?.disable();
        verticalControl?.disable();
      }
    });

  productAreaControl?.valueChanges
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe((productArea: string | null | undefined) => {
      testingTypeControl?.reset();
      testingOptionsControl?.reset();
      bugTypeControl?.reset();
      verticalControl?.reset();

      ctx.testingOptions = [];
      ctx.bugTypes = [];
      ctx.verticals = [];

      if (productArea && ctx.filterConfig[productArea]) {
        const config = ctx.filterConfig[productArea];
        ctx.testingTypes = config.testingTypes;
        testingTypeControl?.enable();

        if (config.testingOptions && config.testingOptions.length > 0) {
          ctx.testingOptions = config.testingOptions;
          testingOptionsControl?.enable();
        } else {
          testingOptionsControl?.disable();
        }
        bugTypeControl?.disable();
        verticalControl?.disable();
      } else {
        ctx.testingTypes = [];
        testingTypeControl?.disable();
        testingOptionsControl?.disable();
        bugTypeControl?.disable();
        verticalControl?.disable();
      }
    });

  testingTypeControl?.valueChanges
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe((testingType: string | null | undefined) => {
      const productArea = productAreaControl?.value;
      bugTypeControl?.reset();
      verticalControl?.reset();
      ctx.bugTypes = [];
      ctx.verticals = [];

      if (productArea && testingType && ctx.filterConfig[productArea]) {
        const config = ctx.filterConfig[productArea];
        if (config.bugTypes[testingType]) {
          ctx.bugTypes = config.bugTypes[testingType];
          bugTypeControl?.enable();
        } else {
          bugTypeControl?.disable();
        }
        verticalControl?.disable();
      } else {
        bugTypeControl?.disable();
        verticalControl?.disable();
      }
    });

  bugTypeControl?.valueChanges
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe((bugType: string | null | undefined) => {
      const productArea = productAreaControl?.value;
      const testingType = testingTypeControl?.value;
      verticalControl?.reset();
      ctx.verticals = [];

      if (
        productArea &&
        testingType &&
        bugType &&
        ctx.filterConfig[productArea]
      ) {
        const config = ctx.filterConfig[productArea];
        if (
          config.verticals[testingType] &&
          config.verticals[testingType][bugType]
        ) {
          const verticalOptions = config.verticals[testingType][bugType];
          if (verticalOptions.length > 0) {
            ctx.verticals = verticalOptions;
            verticalControl?.enable();
          } else {
            verticalControl?.disable();
          }
        } else {
          verticalControl?.disable();
        }
      } else {
        verticalControl?.disable();
      }
    });
}
