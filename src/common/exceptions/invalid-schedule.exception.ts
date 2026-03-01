import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown when schedule creation or update violates business rules:
 * - Invalid date (past date, too soon)
 * - Outside center operating hours
 * - Center closed on scheduled day
 * - No available slots
 * - Duplicate schedule attempts
 */
export class InvalidScheduleException extends BadRequestException {
  constructor(reason: string) {
    super({
      statusCode: 400,
      message: `Agendamento inválido: ${reason}`,
      error: 'BAD_REQUEST',
    });
  }

  static pastDate(): InvalidScheduleException {
    return new InvalidScheduleException('A data do agendamento não pode ser no passado');
  }

  static tooSoon(): InvalidScheduleException {
    return new InvalidScheduleException(
      'Agendamentos devem ser marcados com mínimo 1 dia de antecedência'
    );
  }

  static centerClosed(day: string): InvalidScheduleException {
    return new InvalidScheduleException(
      `Centro fechado nos ${day}. Dias de funcionamento: segunda a sexta`
    );
  }

  static outsideOperatingHours(openTime: string, closeTime: string): InvalidScheduleException {
    return new InvalidScheduleException(
      `Horário inválido. Centro opera das ${openTime} às ${closeTime}`
    );
  }

  static noAvailableSlots(date: string): InvalidScheduleException {
    return new InvalidScheduleException(`Sem slots disponíveis para ${date}. Tente outra data`);
  }

  static duplicateSchedule(): InvalidScheduleException {
    return new InvalidScheduleException('Você já possui um agendamento pendente neste centro');
  }
}
