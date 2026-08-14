import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BOOKINGS } from "../conference.mock";
import { getBookings, addBooking, updateBooking, cancelBooking } from "../conference.service";

export const CONFERENCE_BOOKINGS_QUERY_KEY = ["conference", "bookings"];

export function useConferenceQuery() {
  return useQuery({
    queryKey: CONFERENCE_BOOKINGS_QUERY_KEY,
    queryFn: getBookings,
    initialData: BOOKINGS,
  });
}

export function useConferenceMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: CONFERENCE_BOOKINGS_QUERY_KEY });
      const previous = queryClient.getQueryData(CONFERENCE_BOOKINGS_QUERY_KEY);
      queryClient.setQueryData(CONFERENCE_BOOKINGS_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(CONFERENCE_BOOKINGS_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CONFERENCE_BOOKINGS_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (booking) => addBooking(booking),
    ...withOptimisticUpdate((old, booking) => [booking, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateBooking(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(b => (b.id === id ? { ...b, ...patch } : b))),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelBooking(id),
    ...withOptimisticUpdate((old, id) => old.filter(b => b.id !== id)),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
    cancel: cancelMutation.mutate,
  };
}
