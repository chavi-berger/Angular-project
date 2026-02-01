import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMembersDialog } from './team-members-dialog';

describe('TeamMembersDialog', () => {
  let component: TeamMembersDialog;
  let fixture: ComponentFixture<TeamMembersDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMembersDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamMembersDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
