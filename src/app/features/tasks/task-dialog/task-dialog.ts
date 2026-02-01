import { CommonModule } from '@angular/common';
import { Component, effect, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskPriority, TaskStatus } from '../../../core/models/task.interface';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.css',
})
export class TaskDialog {
  private fb = new FormBuilder();
  

  readonly TaskPriority = TaskPriority;
  readonly TaskStatus = TaskStatus;

  task = input<Task | null>(null);
  projectId = input.required<string>();
  save = output<any>();
  cancel = output<void>();
  isEditMode = signal(false);
  taskForm!: FormGroup;

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: [TaskPriority.NORMAL, Validators.required],
      status: [TaskStatus.TODO, Validators.required],
      dueDate: [''],
    });

    // ה-effect חייב להיות בתוך הקונסטרקטור כדי להאזין לשינויים בסיגנל task
   effect(() => {
  const taskData = this.task();
  if (taskData) {
    this.isEditMode.set(true);
    
    // הכנה של הערך לתאריך - אם אין, נשלח null במקום מחרוזת ריקה
    const dateValue = taskData.due_date ? this.formatDateForInput(taskData.due_date) : null;

    this.taskForm.patchValue({
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority,
      status: taskData.status,
      dueDate: dateValue, // שימוש ב-null מאפשר ל-DatePicker "להתעורר" כשבוחרים תאריך
    });
    
    // חיזוק: סימון הפורם כנקי אחרי הטעינה כדי שיוכל לזהות שינויים חדשים
    this.taskForm.markAsPristine(); 
  } else {
    this.isEditMode.set(false);
    this.taskForm.reset({
      priority: TaskPriority.NORMAL,
      status: TaskStatus.TODO,
      dueDate: null // איפוס ל-null בבניית משימה חדשה
    });
  }
});
  }

  private formatDateForInput(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
}

  onSubmit(): void {
   if (this.taskForm.invalid) return;
  const { dueDate, ...otherValues } = this.taskForm.value;

  this.save.emit({
    ...otherValues,
    due_date: dueDate ? dueDate : null,
    projectId: this.projectId(),
    ...(this.isEditMode() && { id: this.task()?.id })
  });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if((event.target as HTMLElement).classList.contains('dialog-overlay')) 
      this.onCancel();
  }
}
