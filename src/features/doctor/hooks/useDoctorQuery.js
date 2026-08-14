import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APPOINTMENTS } from "../doctor.mock";
import { getAppointments, addAppointment, cancelAppointment } from "../doctor.service";

export const DOCTOR_APPOINTMENTS_QUERY_KEY = ["doctor", "appointments"];

export function useDoctorQuery() {
  return useQuery({
    queryKey: DOCTOR_APPOINTMENTS_QUERY_KEY,
    queryFn: getAppointments,
    initialData: APPOINTMENTS,
  });
}

export function useDoctorMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: DOCTOR_APPOINTMENTS_QUERY_KEY });
      const previous = queryClient.getQueryData(DOCTOR_APPOINTMENTS_QUERY_KEY);
      queryClient.setQueryData(DOCTOR_APPOINTMENTS_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(DOCTOR_APPOINTMENTS_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: DOCTOR_APPOINTMENTS_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (appt) => addAppointment(appt),
    ...withOptimisticUpdate((old, appt) => [appt, ...old]),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelAppointment(id),
    ...withOptimisticUpdate((old, id) => old.map(a => (a.id === id ? { ...a, status: "Cancelled" } : a))),
  });

  return {
    add: addMutation.mutate,
    cancel: cancelMutation.mutate,
  };
}
