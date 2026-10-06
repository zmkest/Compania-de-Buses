import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasComponent } from './consultas.component';

describe('ReportesComponent', () => {
  let component: ConsultasComponent;
  let fixture: ComponentFixture<ConsultasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ConsultasComponent]
});
    fixture = TestBed.createComponent(ConsultasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
