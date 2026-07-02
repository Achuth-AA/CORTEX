import {DestroyRef} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Portfolio, PortfolioSubscriptionContext} from './bug_suggestion_types';
import {updateProductAreaFilter} from './bug_suggestion_utils';

/**
 * Creates the main form group for bug suggestions.
 */
export function createMainForm(fb: FormBuilder): FormGroup {
  return fb.group({
    portfolio: ['', Validators.required],
    product_area: [{value: '', disabled: true}, Validators.required],
    hotlist_id: [{value: '', disabled: true}],
    testing_type: [{value: '', disabled: true}, Validators.required],
    testing_options: [{value: '', disabled: true}],
    bugType: [{value: '', disabled: true}, Validators.required],
    vertical: [{value: '', disabled: true}],
    productAreaSearchTerm: [''],
    selectedProductArea: new FormControl(''),
  });
}

/**
 * Creates the advanced form group containing triage and assignment details.
 */
export function createAdvanceForm(fb: FormBuilder): FormGroup {
  return fb.group({
    advanceSeverity: [''],
    foundIn: [''],
    inProd: [false],
    staffing: [''],
    reporter: [''],
    verifier: [''],
    targetedTo: [''],
    blockingBy: [''],
    blocking: [''],
    parents: [''],
    children: [''],
  });
}

/**
 * Creates the bug template form group for component and reporting details.
 */
export function createBugTemplateForm(fb: FormBuilder): FormGroup {
  return fb.group({
    bug_reported_component: ['', Validators.required],
    bug_reported_title: [''],
    bug_reported_discussion: ['', Validators.required],
    bug_priority: ['', Validators.required],
    bug_status: ['', Validators.required],
    assignee: [''],
    collaborators: [''],
    cc: [''],
    bug_severity: [''],
    templateDescription: [''],
    foundIn: [''],
  });
}

/**
 * Sets up subscription on the portfolio form control to update product areas.
 */
export function setupPortfolioConstructorSubscription(
  ctx: PortfolioSubscriptionContext,
  destroyRef: DestroyRef,
): void {
  ctx.form
    .get('portfolio')
    ?.valueChanges.pipe(takeUntilDestroyed(destroyRef))
    .subscribe((portfolio: Portfolio) => {
      const productAreaControl = ctx.form.get('product_area');
      const productAreaSearchControl = ctx.form.get('productAreaSearchTerm');

      productAreaControl?.reset({value: ''});
      productAreaSearchControl?.reset('');

      if (portfolio === Portfolio.SEARCH) {
        ctx.productAreas = [...ctx.allSearchProductAreas];
        productAreaControl?.enable();
      } else if (portfolio === Portfolio.ASSISTANT) {
        ctx.productAreas = [...ctx.allProductAreas];
        productAreaControl?.enable();
      } else {
        ctx.productAreas = [];
      }
      updateProductAreaFilter(ctx);
    });
}
