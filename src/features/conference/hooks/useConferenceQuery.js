import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CONFERENCE_ROOMS, ROOM_BOOKINGS } from "../conference.mock";
import { getRooms, getBookings, addBooking } from "../conference.service";

export const CONFERENCE_ROOMS_QUERY_KEY = ["conference", "rooms"];
export const CONFERENCE_BOOKINGS_QUERY_KEY = ["conference", "bookings"];

export function useConferenceQuery() {
  const roomsQuery = useQuery({
    queryKey: CONFERENCE_ROOMS_QUERY_KEY,
    queryFn: getRooms,
    initialData: CONFERENCE_ROOMS,
  });
  const bookingsQuery = useQuery({
    queryKey: CONFERENCE_BOOKINGS_QUERY_KEY,
    queryFn: getBookings,
    initialData: ROOM_BOOKINGS,
  });

  return {
    rooms: roomsQuery.data,
    bookings: bookingsQuery.data,
    isLoading: roomsQuery.isLoading || bookingsQuery.isLoading,
  };
}

export function useConferenceMutations() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (booking) => addBooking(booking),
    onMutate: async (booking) => {
      await queryClient.cancelQueries({ queryKey: CONFERENCE_BOOKINGS_QUERY_KEY });
      const previous = queryClient.getQueryData(CONFERENCE_BOOKINGS_QUERY_KEY);
      queryClient.setQueryData(CONFERENCE_BOOKINGS_QUERY_KEY, (old = []) => [booking, ...old]);
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(CONFERENCE_BOOKINGS_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CONFERENCE_BOOKINGS_QUERY_KEY }),
  });

  return {
    add: addMutation.mutate,
  };
}
