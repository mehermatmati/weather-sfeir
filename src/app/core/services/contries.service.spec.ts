import { TestBed } from '@angular/core/testing';

import { ContriesService } from './contries.service';

describe('ContriesService', () => {
  let service: ContriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
