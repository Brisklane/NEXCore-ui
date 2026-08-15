import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ContactService } from './contact.service';
import { ContactDto } from '../models/contact.model';

/**
 * These cover the two things that were silently wrong: the query-parameter names the API
 * actually binds, and the fact that `PageSize` is capped at 100 server-side, so a single
 * large request is not a way to load every contact.
 */
describe('ContactService', () => {
  let service: ContactService;
  let http: HttpTestingController;

  const contact = (id: string): ContactDto => ({
    id, salutation: null, firstName: 'A', lastName: 'B', accountId: null, accountName: null,
    title: null, reportsToId: null, phone: null, email: null, mailingStreet: null,
    mailingCity: null, mailingState: null, mailingPostalCode: null, mailingCountry: null,
    emailOptOut: false, ownerId: null, description: null, createdAt: '', isAnonymous: false,
  });

  const page = (rows: ContactDto[], totalCount: number, pageNumber: number, pageSize: number) => ({
    success: true, message: null, data: rows,
    pagination: {
      totalCount, pageNumber, pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNextPage: pageNumber * pageSize < totalCount,
      hasPreviousPage: pageNumber > 1,
    },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContactService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends the parameter names PaginationParams binds', () => {
    service.getAll({ page: 3, pageSize: 25, search: 'khan' }).subscribe();

    const req = http.expectOne(r => r.url.includes('/Contacts'));
    expect(req.request.params.get('PageNumber')).toBe('3');
    expect(req.request.params.get('PageSize')).toBe('25');
    expect(req.request.params.get('SearchTerm')).toBe('khan');
    // The old names bound to nothing, so their absence is the point of this test.
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('search')).toBeNull();
    req.flush(page([], 0, 3, 25));
  });

  it('omits parameters that were not asked for', () => {
    service.getAll().subscribe();

    const req = http.expectOne(r => r.url.includes('/Contacts'));
    expect(req.request.params.keys()).toEqual([]);
    req.flush(page([], 0, 1, 10));
  });

  it('pages until the whole set is collected', () => {
    let result: ContactDto[] | undefined;
    service.getAllPages().subscribe(r => (result = r));

    const first = http.expectOne(r => r.params.get('PageNumber') === '1');
    expect(first.request.params.get('PageSize')).toBe('100');
    first.flush(page(Array.from({ length: 100 }, (_, i) => contact(`a${i}`)), 250, 1, 100));

    const second = http.expectOne(r => r.params.get('PageNumber') === '2');
    second.flush(page(Array.from({ length: 100 }, (_, i) => contact(`b${i}`)), 250, 2, 100));

    const third = http.expectOne(r => r.params.get('PageNumber') === '3');
    third.flush(page(Array.from({ length: 50 }, (_, i) => contact(`c${i}`)), 250, 3, 100));

    expect(result?.length).toBe(250);
    expect(result?.[0].id).toBe('a0');
    expect(result?.[249].id).toBe('c49');
  });

  it('stops after a short page even when the count disagrees', () => {
    let result: ContactDto[] | undefined;
    service.getAllPages().subscribe(r => (result = r));

    // A stale or wrong totalCount must not turn into an endless request loop.
    http.expectOne(r => r.params.get('PageNumber') === '1')
      .flush(page([contact('only')], 9999, 1, 100));

    expect(result?.length).toBe(1);
  });

  it('stops at maxPages rather than hammering the API', () => {
    let result: ContactDto[] | undefined;
    service.getAllPages(2).subscribe(r => (result = r));

    http.expectOne(r => r.params.get('PageNumber') === '1')
      .flush(page(Array.from({ length: 100 }, (_, i) => contact(`a${i}`)), 10_000, 1, 100));
    http.expectOne(r => r.params.get('PageNumber') === '2')
      .flush(page(Array.from({ length: 100 }, (_, i) => contact(`b${i}`)), 10_000, 2, 100));

    expect(result?.length).toBe(200);
  });
});
