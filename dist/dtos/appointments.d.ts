export interface CreateAppointmentDto {
    userId: number;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    court: string;
    paymentMethod?: string;
}
export interface UpdateAppointmentDto {
    status?: string;
    paymentMethod?: string;
}
export interface CreateBlockDto {
    date: string;
    startTime: string;
    endTime: string;
    court: string;
}
export interface CreateRecurringBlockDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    court: string;
    name?: string;
}
//# sourceMappingURL=appointments.d.ts.map