export interface CallSessionData {
    id: string;
    callerId: string;
    calleeId: string;
    status: string;
    roomName: string;
}

export interface BookingWithSession {
    id: string;
    scheduledStart: string;
    scheduledEnd: string;
    callSession: CallSessionData;
}

export async function  getBookingDetails(bookingId: string): Promise<BookingWithSession | null> {
    try {
        const res = await fetch(`/api/calls/bookings/${bookingId}/details`);
        if (!res.ok) return null;
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Failed to fetch booking details:", err);
        return null;
    }
}