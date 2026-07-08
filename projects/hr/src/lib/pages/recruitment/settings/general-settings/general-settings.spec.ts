import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralSettings } from './general-settings';

describe('GeneralSettings', () => {
  let component: GeneralSettings;
  let fixture: ComponentFixture<GeneralSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralSettings],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
