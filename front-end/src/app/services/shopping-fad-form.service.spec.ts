import { TestBed } from '@angular/core/testing';

import { ShoppingFadFormService } from './shopping-fad-form.service';

describe('ShoppingFadFormService', () => {
  let service: ShoppingFadFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingFadFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
