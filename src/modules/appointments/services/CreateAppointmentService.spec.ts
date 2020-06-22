import AppError from '@shared/errors/AppError';
import { isUuid } from 'uuidv4';

import FakeAppointmentsRepository from '@modules/appointments/repositories/fakes/FakeAppointmentsRepository';
import CreateAppointmentService from './CreateAppointmentService';

describe('CreateAppointmentService', () => {
  it('should be able to create a new appointment', async () => {
    const fakeAppointmentRepository = new FakeAppointmentsRepository();
    const createAppointment = new CreateAppointmentService(
      fakeAppointmentRepository,
    );

    const appointment = await createAppointment.execute({
      provider_id: '123456',
      date: new Date(),
    });

    expect(appointment).toHaveProperty('id');
    expect(isUuid(appointment.id)).toBe(true);
    expect(appointment.date).toBeInstanceOf(Date);
    expect(appointment.provider_id).toBe('123456');
  });

  it('should not be able to create two appointments on the same hour', async () => {
    const fakeAppointmentRepository = new FakeAppointmentsRepository();
    const createAppointment = new CreateAppointmentService(
      fakeAppointmentRepository,
    );

    const appointmentDate = new Date(2020, 4, 10, 11);

    await createAppointment.execute({
      provider_id: '123456',
      date: appointmentDate,
    });

    expect(
      createAppointment.execute({
        provider_id: '1234562',
        date: appointmentDate,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
