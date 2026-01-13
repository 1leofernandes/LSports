export interface LoginRequest {
    email: string;
    senha: string;
}
export interface RegisterRequest {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
}
export interface CreateAppointmentRequest {
    data_agendada: string;
    hora_inicio: string;
    hora_fim: string;
    quadra: string;
    payment_method?: string;
}
//# sourceMappingURL=requests.d.ts.map