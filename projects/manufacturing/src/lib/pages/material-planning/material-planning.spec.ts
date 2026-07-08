import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialPlanning } from './material-planning';
describe('MaterialPlanning', () => {
  let c: MaterialPlanning; let f: ComponentFixture<MaterialPlanning>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [MaterialPlanning], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()] }).compileComponents(); f = TestBed.createComponent(MaterialPlanning); c = f.componentInstance; });
  it('should create', () => expect(c).toBeTruthy());
});
