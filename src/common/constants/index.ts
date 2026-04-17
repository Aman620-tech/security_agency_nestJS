export enum UserRole {
  DIRECTOR = 'director',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
}

export enum ShiftType {
  DAY = 'day',
  NIGHT = 'night',
  EXTRA = 'extra',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  HALF_DAY = 'half_day',
  ON_LEAVE = 'on_leave',
}

export enum TenderStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CLOSED = 'closed',
}

export enum GuardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}