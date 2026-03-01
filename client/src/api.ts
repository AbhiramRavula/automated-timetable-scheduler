// API helper functions

export interface TimetableGenerateRequest {
  courses: any[];
  teachers: any[];
  rooms: any[];
  batches: any[];
  constraintsText: string;
  metadata: any;
}

export interface TimetableGenerateResponse {
  timetable: any[];
  timetables: any[];
  metrics: {
    conflicts: number;
    gapScore: number;
    balanceScore: number;
    softScore: number;
  };
  hardViolations: string[];
  limitReached?: boolean;
}

const API_BASE_URL = "http://localhost:4000/api";

export async function generateTimetables(
  request: TimetableGenerateRequest
): Promise<TimetableGenerateResponse> {
  const response = await fetch(`${API_BASE_URL}/timetables/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate timetables");
  }

  return response.json();
}

export async function validateTimetable(timetable: any[]): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/timetables/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timetable }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to validate timetable");
  }

  return response.json();
}

export async function getTimetables(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/timetables`);
  if (!response.ok) throw new Error("Failed to fetch timetables");
  const data = await response.json();
  // If the backend returns a single object with internal array, normalize it
  return Array.isArray(data) ? data : data.timetables || [];
}

// Batch functions
export async function getBatches(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/batches`);
  if (!response.ok) throw new Error("Failed to fetch batches");
  return response.json();
}

export async function getRooms(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/rooms`);
  if (!response.ok) throw new Error("Failed to fetch rooms");
  return response.json();
}

export async function createBatch(batch: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/batches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(batch),
  });
  if (!response.ok) throw new Error("Failed to create batch");
  return response.json();
}

export async function updateBatch(id: string, batch: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(batch),
  });
  if (!response.ok) throw new Error("Failed to update batch");
  return response.json();
}

export async function deleteBatch(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete batch");
  return response.json();
}

export async function deleteTimetable(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/timetables/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete timetable");
  return response.json();
}

export async function updateTimetableLabel(id: string, updates: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/timetables/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update timetable");
  return response.json();
}

export async function createRoom(room: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(room),
  });
  if (!response.ok) throw new Error("Failed to add room");
  return response.json();
}

export async function updateRoom(id: string, room: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(room),
  });
  if (!response.ok) throw new Error("Failed to update room");
  return response.json();
}

export async function deleteRoom(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete room");
  return response.json();
}

// Subject and Faculty CRUD functions
export async function getSubjects(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/subjects`);
  if (!response.ok) throw new Error("Failed to fetch subjects");
  return response.json();
}

export async function createSubject(subject: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/subjects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subject),
  });
  if (!response.ok) throw new Error("Failed to create subject");
  return response.json();
}

export async function updateSubject(id: string, subject: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subject),
  });
  if (!response.ok) throw new Error("Failed to update subject");
  return response.json();
}

export async function deleteSubject(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete subject");
  return response.json();
}

export async function getFaculty(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/faculty`);
  if (!response.ok) throw new Error("Failed to fetch faculty");
  return response.json();
}

export async function createFaculty(member: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/faculty`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
  if (!response.ok) throw new Error("Failed to add faculty member");
  return response.json();
}

export async function updateFaculty(id: string, member: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/faculty/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
  if (!response.ok) throw new Error("Failed to update faculty member");
  return response.json();
}

export async function deleteFaculty(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/faculty/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete faculty member");
  return response.json();
}

