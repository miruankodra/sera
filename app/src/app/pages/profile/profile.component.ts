import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {SeTitleComponent} from '../../components/shared/se-title/se-title.component';
import {SeItemComponent} from '../../components/shared/se-item/se-item.component';
import {AuthService} from '../../services/auth.service';
import {UserService} from '../../services/user.service';
import {ToastService} from '../../services/toast.service';
import {UserDto} from '../../models/user-dto';

interface EditForm { name: string; email: string; }
interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

@Component({
  selector: 'se-profile',
  standalone: true,
  imports: [SeTitleComponent, SeItemComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private _authService  = inject(AuthService);
  private _userService  = inject(UserService);
  private _toastService = inject(ToastService);

  user    = signal<UserDto | null>(null);
  loading = signal(true);

  // Sheets
  showEditSheet     = signal(false);
  showPasswordSheet = signal(false);
  saving            = signal(false);
  passwordError     = signal('');

  editForm = signal<EditForm>({name: '', email: ''});
  passwordForm = signal<PasswordForm>({
    current_password: '', password: '', password_confirmation: '',
  });

  readonly editFormValid = computed(() => {
    const f = this.editForm();
    return f.name.trim().length > 0 && f.email.trim().length > 0;
  });

  readonly passwordFormValid = computed(() => {
    const f = this.passwordForm();
    return f.current_password.length > 0 &&
           f.password.length >= 8 &&
           f.password === f.password_confirmation;
  });

  readonly notifPrefs = computed(() =>
    this.user()?.notification_preferences ?? {alerts: true, automation: true, tasks: true}
  );

  notifRows(): {key: 'alerts' | 'automation' | 'tasks'; label: string; emoji: string; desc: string; value: boolean}[] {
    const prefs = this.notifPrefs();
    return [
      {key: 'alerts',     label: 'Threshold Alerts',    emoji: '⚠️', desc: 'When sensor values breach a rule',         value: prefs.alerts},
      {key: 'automation', label: 'Automation Triggers', emoji: '⚡', desc: 'When a device is controlled automatically', value: prefs.automation},
      {key: 'tasks',      label: 'Task Reminders',      emoji: '📅', desc: 'Calendar reminder notifications',           value: prefs.tasks},
    ];
  }

  async ngOnInit(): Promise<void> {
    try {
      const profile = await this._userService.getProfile();
      this.user.set(profile);
    } finally {
      this.loading.set(false);
    }
  }

  avatarUrl(): string {
    const u = this.user();
    if (u?.avatar_url) return u.avatar_url;
    const name = u?.name ?? 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C4FE33&color=0B3931&size=128`;
  }

  // ── Edit profile ────────────────────────────────────────────────────────────

  openEditSheet(): void {
    const u = this.user();
    this.editForm.set({name: u?.name ?? '', email: u?.email ?? ''});
    this.showEditSheet.set(true);
  }

  patchEdit(patch: Partial<EditForm>): void {
    this.editForm.update(f => ({...f, ...patch}));
  }

  onEditName(event: Event): void {
    this.patchEdit({name: (event.target as HTMLInputElement).value});
  }

  onEditEmail(event: Event): void {
    this.patchEdit({email: (event.target as HTMLInputElement).value});
  }

  onCurrentPassword(event: Event): void {
    this.patchPassword({current_password: (event.target as HTMLInputElement).value});
  }

  onNewPassword(event: Event): void {
    this.patchPassword({password: (event.target as HTMLInputElement).value});
  }

  onConfirmPassword(event: Event): void {
    this.patchPassword({password_confirmation: (event.target as HTMLInputElement).value});
  }

  async saveProfile(): Promise<void> {
    if (!this.editFormValid()) return;
    this.saving.set(true);
    try {
      const updated = await this._userService.updateProfile(this.editForm());
      this.user.set(updated);
      this.showEditSheet.set(false);
      await this._toastService.fireToast('Profile updated successfully.');
    } catch {
      await this._toastService.fireToast('Could not update profile. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // ── Change password ──────────────────────────────────────────────────────────

  openPasswordSheet(): void {
    this.passwordForm.set({current_password: '', password: '', password_confirmation: ''});
    this.passwordError.set('');
    this.showPasswordSheet.set(true);
  }

  patchPassword(patch: Partial<PasswordForm>): void {
    this.passwordForm.update(f => ({...f, ...patch}));
    this.passwordError.set('');
  }

  async savePassword(): Promise<void> {
    if (!this.passwordFormValid()) return;
    this.saving.set(true);
    this.passwordError.set('');
    try {
      await this._userService.changePassword(this.passwordForm());
      this.showPasswordSheet.set(false);
      await this._toastService.fireToast('Password changed successfully.');
    } catch {
      this.passwordError.set('Current password is incorrect.');
    } finally {
      this.saving.set(false);
    }
  }

  // ── Notification preferences ─────────────────────────────────────────────────

  async toggleNotif(key: 'alerts' | 'automation' | 'tasks'): Promise<void> {
    const current = this.notifPrefs();
    const updated = {...current, [key]: !current[key]};
    this.user.update(u => u ? {...u, notification_preferences: updated} : u);
    try {
      await this._userService.updateProfile({notification_preferences: updated});
    } catch {
      // Revert
      this.user.update(u => u ? {...u, notification_preferences: current} : u);
    }
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────

  async logout(): Promise<void> {
    await this._authService.logout();
  }
}
