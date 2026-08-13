import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WFH_REQUESTS } from "../leave.wfh.mock";
import { getWfhRequests, addWfhRequest, updateWfhRequest, removeWfhRequest } from "../leave.wfh.service";
import { queryClient as sharedQueryClient } from "../../../shared/api/queryClient";
import { ATTENDANCE_QUERY_KEY, patchAttendanceRecord } from "../../attendance/hooks/useAttendanceQuery";

export const WFH_QUERY_KEY = ["wfhRequests"];

// Approving a WFH request additionally syncs attendance: every date in the
// range that already has an attendance record for this employee gets its
// status flipped to "WFH". Dates with no existing record are skipped
// silently — we never create new attendance rows here. Kept as a standalone
// helper (mirrors the logic previously in leave.wfh.store.js) so it can fire
// from within the mutation below.
function syncAttendanceToWfh(request) {
  const records = sharedQueryClient.getQueryData(ATTENDANCE_QUERY_KEY) || [];
  const from = new Date(request.fromDate);
  const to = new Date(request.toDate);
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const record = records.find(r => r.employeeId === request.employeeId && r.date === dateStr);
    if (record) patchAttendanceRecord(sharedQueryClient, record.id, { status: "WFH" });
  }
}

export function useWfhQuery() {
  return useQuery({
    queryKey: WFH_QUERY_KEY,
    queryFn: getWfhRequests,
    initialData: WFH_REQUESTS, // avoids a loading flash for this mock-data demo
  });
}

export function useWfhMutations() {
  const queryClient = useQueryClient();

  const withOptimisticUpdate = (updater) => ({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: WFH_QUERY_KEY });
      const previous = queryClient.getQueryData(WFH_QUERY_KEY);
      queryClient.setQueryData(WFH_QUERY_KEY, (old = []) => updater(old, payload));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) queryClient.setQueryData(WFH_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: WFH_QUERY_KEY }),
  });

  const addMutation = useMutation({
    mutationFn: (item) => addWfhRequest(item),
    ...withOptimisticUpdate((old, item) => [item, ...old]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => updateWfhRequest(id, patch),
    ...withOptimisticUpdate((old, { id, patch }) => old.map(d => (d.id === id ? { ...d, ...patch } : d))),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => updateWfhRequest(id, { status: "Approved" }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: WFH_QUERY_KEY });
      const previous = queryClient.getQueryData(WFH_QUERY_KEY);
      let approvedRequest;
      queryClient.setQueryData(WFH_QUERY_KEY, (old = []) => old.map(d => {
        if (d.id === id) { approvedRequest = { ...d, status: "Approved" }; return approvedRequest; }
        return d;
      }));
      if (approvedRequest) syncAttendanceToWfh(approvedRequest);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(WFH_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: WFH_QUERY_KEY }),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => removeWfhRequest(id),
    ...withOptimisticUpdate((old, id) => old.filter(d => d.id !== id)),
  });

  return {
    add: addMutation.mutate,
    update: (id, patch) => updateMutation.mutate({ id, patch }),
    approve: approveMutation.mutate,
    reject: (id) => updateMutation.mutate({ id, patch: { status: "Rejected" } }),
    remove: removeMutation.mutate,
  };
}
