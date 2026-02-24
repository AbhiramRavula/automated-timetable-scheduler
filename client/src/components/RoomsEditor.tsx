import React from "react";

export type Room = {
  name: string;
  capacity: number;
};

interface Props {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export function RoomsEditor({ rooms, setRooms }: Props) {
  const update = (index: number, field: keyof Room, value: any) => {
    const next = [...rooms];
    // @ts-ignore
    next[index][field] = field === "capacity" ? Number(value) : value;
    setRooms(next);
  };

  const addRoom = () => {
    setRooms((prev) => [...prev, { name: "", capacity: 40 }]);
  };

  const removeRoom = (index: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Rooms</h3>
        <button
          type="button"
          onClick={addRoom}
          className="px-3 py-1 text-sm rounded bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          + Add Room
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-2 py-2 border border-slate-700 text-left">Room Name</th>
              <th className="px-2 py-2 border border-slate-700 text-left">Capacity</th>
              <th className="px-2 py-2 border border-slate-700"></th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r, i) => (
              <tr key={i}>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={r.name}
                    onChange={(e) => update(i, "name", e.target.value)}
                    placeholder="R101"
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={r.capacity}
                    onChange={(e) => update(i, "capacity", e.target.value)}
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeRoom(i)}
                    className="text-red-400 hover:text-red-300 text-sm px-2"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
