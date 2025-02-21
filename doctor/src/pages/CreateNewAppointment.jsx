import React from 'react';
import { CalendarForm } from '@/components/DatePicker';

const CreateNewAppointment = () => {
  const handleDateSelect = (date) => {
    console.log('Selected date:', date);
    // Here you can handle the selected date, e.g., store it in a state or pass it to an API
  };

  return (
    <div>
      <h1>Create New Appointment</h1>
      <CalendarForm onSelect={handleDateSelect} />
    </div>
  );
};

export default CreateNewAppointment;
