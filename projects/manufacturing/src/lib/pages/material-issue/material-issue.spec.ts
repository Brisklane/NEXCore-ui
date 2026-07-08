import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialIssue } from './material-issue';
describe('MaterialIssue', () => {
  let c: MaterialIssue; let f: ComponentFixture<MaterialIssue>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [MaterialIssue], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(MaterialIssue); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
