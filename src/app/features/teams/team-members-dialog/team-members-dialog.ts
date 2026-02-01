import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Teams } from '../../../core/services/teams';
import { UserService } from '../../../core/services/user';
import { TeamMember, User } from '../../../core/models/team.interface';

@Component({
  selector: 'app-team-members-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './team-members-dialog.html',
  styleUrl: './team-members-dialog.css',
})
export class TeamMembersDialog implements OnInit {
  private teamService = inject(Teams);
  private userService = inject(UserService);

  teamId = input.required<number>();
  teamName = input.required<string>();
  close = output<void>();

  members = signal<TeamMember[]>([]);
  allUsers = signal<User[]>([]);
  availableUsers = signal<User[]>([]);
  isLoadingMembers = signal(false);
  isLoadingUsers = signal(false);
  isAdding = signal(false);

  selectedUserControl = new FormControl('', Validators.required);

  ngOnInit() {
    this.loadMembers();
    this.loadUsers();
  }

  loadMembers() {  
    this.isLoadingMembers.set(true);

    this.teamService.getTeamMembers(this.teamId()).subscribe({
      next: (members) => {
        this.members.set(members);
        this.updateAvailableUsers();
        this.isLoadingMembers.set(false);
      },
      error: (error) => {
        console.error('❌ שגיאה בטעינת חברי צוות:', error);
        alert('שגיאה בטעינת חברי הצוות: ' + (error.error?.message || error.message || 'נסה שוב'));
        this.isLoadingMembers.set(false);
      }
    });
  }


  loadUsers() {
    
    this.isLoadingUsers.set(true);

    this.userService.getAllUsers().subscribe({
      next: (users) => {       
        if (users && users.length > 0) {
          this.allUsers.set(users);
          this.updateAvailableUsers();
        } else {
          console.warn(' השרת החזיר מערך ריק של משתמשים');
        }

        this.isLoadingUsers.set(false);
      },
      error: (err) => {
        console.error('שגיאה בקריאת שרת:', err);
        this.isLoadingUsers.set(false);
      }
    });
  }

  updateAvailableUsers() {
    const memberUserIds = this.members().map(m => m.user_id);
    const available = this.allUsers().filter(user => !memberUserIds.includes(user.id));
    this.availableUsers.set(available);
  }

  onAddMember() {
    const userId = Number(this.selectedUserControl.value);
    if (!userId) {
      alert('נא לבחור משתמש תקין');
      return;
    }
    const selectedUser = this.allUsers().find(u => u.id === userId);
    const userName = selectedUser?.name || selectedUser?.email || `משתמש ${userId}`;

    this.isAdding.set(true);

    this.teamService.addMember(this.teamId(), {
      userId: userId,
      role: 'member'
    }).subscribe({
      next: (newMember) => {
        

        this.selectedUserControl.reset();

        this.loadMembers();

        this.isAdding.set(false);
      },
      error: (error) => {
        console.error('שגיאה בהוספת משתמש:', error);

        let errorMessage = `שגיאה בהוספת המשתמש "${userName}" לצוות`;

        if (error.status === 409) {
          errorMessage = 'המשתמש כבר חבר בצוות';
        } else if (error.error?.message) {
          errorMessage += ': ' + error.error.message;
        } else if (error.error?.error) {
          errorMessage += ': ' + error.error.error;
        }

        alert(errorMessage);
        this.isAdding.set(false);
      }
    });
  }


  onRemoveMember(userId: number, userName: string) {
       
    this.teamService.removeMember(this.teamId(), userId).subscribe({
      next: () => {
       
        this.loadMembers();
      },
      error: (error) => {
        console.error(' שגיאה בהסרת משתמש:', error);

        let errorMessage = `שגיאה בהסרת המשתמש "${userName}" מהצוות`;

        if (error.error?.message) {
          errorMessage += ': ' + error.error.message;
        } else if (error.error?.error) {
          errorMessage += ': ' + error.error.error;
        }

        alert(errorMessage);
      }
    });
  }


  onClose() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay'))
      this.onClose();
  }
}
